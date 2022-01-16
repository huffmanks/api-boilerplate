import mongoose from 'mongoose'
const { Schema } = mongoose
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            default: undefined,
        },
        lastName: {
            type: String,
            default: undefined,
        },
        userName: {
            type: String,
        },
        email: {
            type: String,
            required: [true, 'Please provide your email address.'],
            unique: true,
            match: [/^\S+@\S+\.\S{2,}$/, 'Please provide a valid email'],
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, 'Please provide your password.'],
            minlength: 6,
            select: false,
        },
        profileImage: {
            fileName: {
                type: String,
            },
            filePath: {
                type: String,
            },
            fileType: {
                type: String,
            },
            fileSize: {
                type: String,
            },
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        team: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
)

UserSchema.pre('save', async function (next) {
    const username = this.email.substring(0, this.email.indexOf('@'))
    this.userName = username
    next()
})

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.getSignedToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex')

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000)

    return resetToken
}

const User = mongoose.model('User', UserSchema)

export default User
