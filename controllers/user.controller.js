import mongoose from 'mongoose'
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

            const profileImage = files?.profileImage?.[0] ? `${process.env.SERVER_URL}/uploads/images/${files.profileImage[0].newFilename.toLowerCase()}` : undefined

            const user = await User.create({
                ...singleFields,
                profileImage,
            })

            if (team) {
                await Team.findByIdAndUpdate({ _id: team }, { $push: { users: user._id } }, { new: true })
            }

            const { password, ...newUser } = user._doc

            res.status(201).json(newUser)
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

            const prevTeam = await User.findById({ _id: req.params.id }).select('team')

            const profileImage = files?.profileImage?.[0] ? `${process.env.SERVER_URL}/uploads/images/${files.profileImage[0].newFilename.toLowerCase()}` : undefined

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
