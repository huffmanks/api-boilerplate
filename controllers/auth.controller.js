import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { sendToken } from '../utils/index.js'

export const login = async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(res.status(400).json('Please provide an email and password.'))
    }
    try {
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return next(res.status(401).json('Invalid credentials.'))
        }

        const isMatch = await user.matchPassword(password)

        if (!isMatch) {
            return next(res.status(401).json('Invalid credentials.'))
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

    if (!email) {
        return next(res.status(400).json('Please provide an email.'))
    }

    if (!password) {
        return next(res.status(400).json('Please provide a password.'))
    }

    if (!email && !password) {
        return next(res.status(400).json('Please provide an email and password.'))
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
        return next(res.status(404).json('Please provide an email.'))
    }

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return next(res.status(404).json('No account found with that email.'))
        }

        const resetPasswordToken = user.getResetPasswordToken()

        await user.save()

        try {
            res.status(200).json({ resetPasswordToken })
        } catch (err) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined

            await user.save()
            return next(res.status(500).json('Email could not be sent.'))
        }
    } catch (err) {
        next(err)
    }
}

export const resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetPasswordToken).digest('hex')

    try {
        const user = await User.findOne({
            resetPasswordToken,
        })

        if (!user) {
            return next(res.status(400).json('Invalid reset password token!'))
        }

        if (user.resetPasswordExpire < Date.now()) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined

            await user.save()

            return next(res.status(401).json('Reset password token has expired!'))
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

export const logout = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.refreshToken) {
        res.sendStatus(204)
    }

    const { refreshToken } = cookies

    const user = await User.findOne({ refreshToken }).exec()
    if (!user) {
        res.clearCookie('refreshToken', { httpOnly: true })
        return res.sendStatus(204)
    }

    user.refreshToken = ''
    await user.save()

    res.clearCookie('refreshToken', { httpOnly: true })
    res.sendStatus(204)
}

export const refresh = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.refreshToken) return res.status(400).json('Invalid refresh token!')
    const refreshToken = cookies.refreshToken

    const user = await User.findOne({ refreshToken }).exec()
    if (!user) return res.status(401).json('Unauthorized refresh token!')

    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || user.email !== decoded.user.email) return res.sendStatus(403)

        const accessToken = jwt.sign(
            {
                user: {
                    email: decoded.user.email,
                    role: user.role,
                },
            },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE }
        )
        res.json({ accessToken })
    })
}
