import crypto from 'crypto'
import User from '../models/user.model.js'
import sendToken from '../utils/sendToken.util.js'
import ErrorResponse from '../utils/ErrorResponse.util.js'

export const login = async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400))
    }
    try {
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return next(new ErrorResponse('Invalid credentials.', 401))
        }

        const isMatch = await user.matchPassword(password)

        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401))
        }

        sendToken(user, 200, res)
    } catch (err) {
        next(err)
    }
}

export const register = async (req, res, next) => {
    const { email, password } = req.body

    try {
        const user = await User.create({
            email,
            password,
        })

        sendToken(user, 201, res)
    } catch (err) {
        next(err)
    }
}

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return next(new ErrorResponse('No email could not be sent', 404))
        }

        const resetToken = user.getResetPasswordToken()

        await user.save()

        try {
            res.status(200).json({ success: true, data: resetToken })
        } catch (err) {
            console.log(err)

            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined

            await user.save()

            return next(new ErrorResponse('Email could not be sent', 500))
        }
    } catch (err) {
        next(err)
    }
}

export const resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex')

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        })

        if (!user) {
            return next(new ErrorResponse('Invalid Token', 400))
        }

        user.password = req.body.password
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save()

        res.status(201).json({
            success: true,
            data: 'Password Updated Success',
            token: user.getSignedToken(),
        })
    } catch (err) {
        next(err)
    }
}
