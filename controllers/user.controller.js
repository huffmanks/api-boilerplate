import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User, Team } from '../models/index.js'
import { errorResponse, firstValues, singleImageUpload } from '../utils/index.js'

export const getSingleUser = async (req, res, next) => {
    try {
        const user = await User.findById({ _id: req.params.id }).populate('team', 'title')

        if (!user) {
            return errorResponse(res, 404, { name: 'NotFound', message: 'No user can be found with that ID.' })
        }

        res.json(user)
    } catch (err) {
        next(err)
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).populate('team', 'title')

        if (!users) {
            return errorResponse(res, 404, { name: 'NotFound', message: 'No users can be found.' })
        }

        res.json(users)
    } catch (err) {
        next(err)
    }
}

export const createUser = async (req, res, next) => {
    singleImageUpload.parse(req, async (err, fields, files) => {
        if (err) {
            next(err)
            return
        }
        try {
            const profileImage = files?.profileImage?.[0] ? `${process.env.SERVER_URL}/uploads/images/${files.profileImage[0].newFilename.toLowerCase()}` : undefined

            if (files?.profileImage?.[0] && !files?.profileImage?.[0]?.mimetype.includes('image')) {
                return errorResponse(res, 415, { name: 'Unsupported Media Type', message: 'The profile image field only accepts an image file type.' })
            }

            const singleFields = firstValues(fields)

            const { team } = singleFields

            if (team) {
                const teamIdIsValid = mongoose.isValidObjectId(team)

                if (!teamIdIsValid) {
                    return errorResponse(res, 400, { name: 'Bad Request', message: 'The team ID is invalid.' })
                }

                const teamExists = await Team.findById({ _id: team })

                if (!teamExists) {
                    return errorResponse(res, 404, { name: 'Not Found', message: 'No team can be found with that ID.' })
                }
            }

            const user = await User.create({
                ...singleFields,
                profileImage,
            })

            if (team) {
                await Team.findByIdAndUpdate({ _id: team }, { $push: { users: user._id } }, { new: true })
            }

            res.status(201).json(user)
        } catch (err) {
            next(err)
        }
    })
}

export const updateUser = async (req, res, next) => {
    singleImageUpload.parse(req, async (err, fields, files) => {
        if (err) {
            next(err)
            return
        }
        try {
            const prevTeam = await User.findById({ _id: req.params.id }).select('team')

            const profileImage = files?.profileImage?.[0] ? `${process.env.SERVER_URL}/uploads/images/${files.profileImage[0].newFilename}` : undefined

            if (files?.profileImage?.[0] && !files?.profileImage?.[0]?.mimetype.includes('image')) {
                return errorResponse(res, 415, { name: 'Unsupported Media Type', message: 'The profile image field only accepts an image file type.' })
            }

            const singleFields = firstValues(fields)

            const { email, password, team } = singleFields

            if (email) {
                singleFields.userName = email.substring(0, email.indexOf('@'))
            }

            if (password) {
                if (password.length < 6) {
                    return errorResponse(res, 403, { name: 'Forbidden', message: `The password, '${password}', is less than 6 characters.` })
                }
                const salt = await bcrypt.genSalt(10)
                singleFields.password = await bcrypt.hash(password, salt)
            }

            if (team) {
                const teamIdIsValid = mongoose.isValidObjectId(team)

                if (!teamIdIsValid) {
                    return errorResponse(res, 400, { name: 'Bad Request', message: 'The team ID is invalid.' })
                }

                const teamExists = await Team.findById({ _id: team })

                if (!teamExists) {
                    return errorResponse(res, 404, { name: 'Not Found', message: 'No team can be found with that ID.' })
                }
            }

            const user = await User.findByIdAndUpdate(
                { _id: req.params.id },
                {
                    ...singleFields,
                    profileImage,
                },
                { new: true }
            )

            if (team) {
                if (prevTeam.team) {
                    await Team.findByIdAndUpdate({ _id: prevTeam.team }, { $pull: { users: user._id } }, { new: true })
                }

                await Team.findByIdAndUpdate({ _id: team }, { $push: { users: user._id } }, { new: true })
            }

            res.status(200).json(user)
        } catch (err) {
            next(err)
        }
    })
}

export const deleteUser = async (req, res, next) => {
    try {
        User.findOneAndDelete({ _id: req.params.id }, async (err, doc) => {
            if (err) {
                return errorResponse(res, 404, { name: 'Not Found', message: 'No user can be found with that ID.' })
            }

            if (doc.team) {
                await Team.findByIdAndUpdate({ _id: doc.team }, { $pull: { users: doc._id } }, { new: true })
            }

            res.status(200).json(doc)
        })
    } catch (err) {
        next(err)
    }
}
