import crypto from 'crypto'
import User from '../models/user.model.js'
import sendToken from '../utils/sendToken.util.js'

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

        sendToken(res, 200, user, 'Logged in successfully.')
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

        sendToken(res, 201, user, 'Account registered successfully.')
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

        const resetToken = user.getResetPasswordToken()

        await user.save()

        try {
            res.status(200).json({ data: resetToken })
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
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex')

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        })

        if (!user) {
            return next(res.status(400).json('Invalid Token!'))
        }

        user.password = req.body.password
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save()

        sendToken(res, 201, user, 'Password updated successfully.')
    } catch (err) {
        next(err)
    }
}
