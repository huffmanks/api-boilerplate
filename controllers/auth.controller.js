import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { errorResponse, sendToken } from '../utils/index.js'

export const login = async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return errorResponse(res, 400, { name: 'Bad Request', message: 'Please provide both an email and a password.' })
    }
    try {
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return errorResponse(res, 404, { name: 'Not Found', message: 'No account found with that email.' })
        }

        const isMatch = await user.matchPassword(password)

        if (!isMatch) {
            return errorResponse(res, 401, { name: 'Unauthorized', message: 'Invalid credentials.' })
        }

        const refreshToken = user.getSignedToken(process.env.JWT_REFRESH_TOKEN_SECRET, process.env.JWT_REFRESH_TOKEN_EXPIRE)
        user.refreshToken = refreshToken

        await user.save()

        const accessToken = user.getSignedToken(process.env.JWT_ACCESS_TOKEN_SECRET, process.env.JWT_ACCESS_TOKEN_EXPIRE)

        sendToken(res, 200, user, refreshToken, accessToken, 'Logged in successfully.')
    } catch (err) {
        next(err)
    }
}

export const register = async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return errorResponse(res, 400, { name: 'Bad Request', message: 'Please provide both an email and a password.' })
    }

    try {
        const user = await User.create({
            email,
            password,
        })

        const refreshToken = user.getSignedToken(process.env.JWT_REFRESH_TOKEN_SECRET, process.env.JWT_REFRESH_TOKEN_EXPIRE)
        user.refreshToken = refreshToken

        await user.save()

        const accessToken = user.getSignedToken(process.env.JWT_ACCESS_TOKEN_SECRET, process.env.JWT_ACCESS_TOKEN_EXPIRE)

        sendToken(res, 201, user, refreshToken, accessToken, 'Account registered successfully.')
    } catch (err) {
        next(err)
    }
}

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body

    if (!email) {
        return errorResponse(res, 400, { name: 'Bad Request', message: 'Please provide an email.' })
    }

    const user = await User.findOne({ email })

    if (!user) {
        return errorResponse(res, 404, { name: 'Not Found', message: 'No account found with that email.' })
    }

    try {
        const resetPasswordToken = user.getResetPasswordToken()

        await user.save()

        // Add email with magic link
        res.status(200).json({ resetPasswordToken })
    } catch (err) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save()

        return errorResponse(res, 500, { name: 'Internal Server Error', message: 'Email could not be sent.' })
    }
}

export const resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetPasswordToken).digest('hex')

    try {
        const user = await User.findOne({
            resetPasswordToken,
        })

        if (!user) {
            return errorResponse(res, 400, { name: 'Bad Request', message: 'Invalid reset password token!' })
        }

        if (user.resetPasswordExpire < Date.now()) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined

            await user.save()

            return errorResponse(res, 401, { name: 'Unauthorized', message: 'Reset password token has expired!' })
        }

        const refreshToken = user.getSignedToken(process.env.JWT_REFRESH_TOKEN_SECRET, process.env.JWT_REFRESH_TOKEN_EXPIRE)

        user.password = req.body.password
        user.refreshToken = refreshToken
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save()

        const accessToken = user.getSignedToken(process.env.JWT_ACCESS_TOKEN_SECRET, process.env.JWT_ACCESS_TOKEN_EXPIRE)

        sendToken(res, 201, user, refreshToken, accessToken, 'Password updated successfully.')
    } catch (err) {
        next(err)
    }
}

export const logout = async (req, res, next) => {
    const cookies = req.cookies

    if (!cookies?.refreshToken) {
        return res.sendStatus(204)
    }

    const { refreshToken } = cookies

    try {
        const user = await User.findOne({ refreshToken })

        if (!user) {
            res.clearCookie('refreshToken', { httpOnly: true })
            return res.sendStatus(204)
        }

        user.refreshToken = ''
        await user.save()

        res.clearCookie('refreshToken', { httpOnly: true })
        res.sendStatus(204)
    } catch (err) {
        next(err)
    }
}

export const refresh = async (req, res, next) => {
    const cookies = req.cookies

    if (!cookies?.refreshToken) {
        return errorResponse(res, 400, { name: 'Bad Request', message: 'Invalid refresh token!' })
    }

    const { refreshToken } = cookies

    try {
        const user = await User.findOne({ refreshToken })

        if (!user) {
            return errorResponse(res, 401, { name: 'Unauthorized', message: 'Unauthorized refresh token!' })
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err || user.email !== decoded.user.email) {
                return errorResponse(res, 403, { name: 'Forbidden', message: 'Invalid refresh token!' })
            }

            const accessToken = jwt.sign(
                {
                    user: {
                        id: user._id,
                        email: decoded.user.email,
                        role: user.role,
                    },
                },
                process.env.JWT_ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE }
            )

            res.status(201).json({ accessToken })
        })
    } catch (err) {
        next(err)
    }
}
