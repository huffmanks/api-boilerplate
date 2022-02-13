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
            match: [/^\S+@\S+\.\S{2,}$/, 'Please provide a valid email.'],
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, 'Please provide your password.'],
            minlength: 6,
            select: false,
        },
        profileImage: {
            type: String,
            // fileUrl: {
            //     type: String,
            // },
            // fileName: {
            //     type: String,
            // },
            // filePath: {
            //     type: String,
            // },
            // fileType: {
            //     type: String,
            // },
            // fileSize: {
            //     type: String,
            // },
        },
        role: {
            type: String,
            enum: ['bull', 'mako', 'tiger'],
            default: 'tiger',
        },
        team: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
        },
        refreshToken: {
            type: String,
            select: false,
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

    return next()
})

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

    return next()
})

UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.getSignedToken = function (secret, expiresIn) {
    return jwt.sign(
        {
            user: {
                id: this._id,
                email: this.email,
                role: this.role,
            },
        },
        secret,
        {
            expiresIn,
        }
    )
}

UserSchema.methods.getResetPasswordToken = function () {
    const resetPasswordToken = crypto.randomBytes(20).toString('hex')

    this.resetPasswordToken = crypto.createHash('sha256').update(resetPasswordToken).digest('hex')
    this.resetPasswordExpire = Date.now() + 5 * (60 * 1000)

    return resetPasswordToken
}

const User = mongoose.model('User', UserSchema)

export default User
