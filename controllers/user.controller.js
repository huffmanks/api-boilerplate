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

            const { email, team } = singleFields

            const userName = email.substring(0, email.indexOf('@'))

            if (team) {
                const teamExists = await Team.findById(team)

                if (teamExists === null) {
                    return errorResponse(res, 404, { name: 'Not Found', message: 'No team can be found with that ID.' })
                }
            }

            const user = await User.create({
                ...singleFields,
                userName,
                profileImage,
            })

            if (team) {
                const addUserToTeam = await Team.findByIdAndUpdate({ _id: team }, { $push: { users: [{ _id: user._id }] } }, { new: true })

                await addUserToTeam.save()
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

            const { email, team } = singleFields
            let userName

            if (email) {
                const username = email.substring(0, email.indexOf('@'))
                userName = username
            }

            if (singleFields.password) {
                if (singleFields.password.length < 6) {
                    return errorResponse(res, 403, { name: 'Forbidden', message: 'Password needs to be longer.' })
                }
                const salt = await bcrypt.genSalt(10)
                singleFields.password = await bcrypt.hash(singleFields.password, salt)
            }

            if (team) {
                const teamExists = await Team.findById(team)

                if (teamExists === null) {
                    return errorResponse(res, 404, { name: 'Not Found', message: 'No team can be found with that ID.' })
                }
            }

            const user = await User.findByIdAndUpdate(
                { _id: req.params.id },
                {
                    ...singleFields,
                    userName,
                    profileImage,
                },
                { new: true }
            )

            await user.save()

            if (team) {
                if (prevTeam.team) {
                    const removeUserFromTeam = await Team.findByIdAndUpdate({ _id: prevTeam.team }, { $pullAll: { users: [{ _id: user._id }] } }, { new: true })

                    await removeUserFromTeam.save()
                }

                const addUserToTeam = await Team.findByIdAndUpdate({ _id: team }, { $push: { users: [{ _id: user._id }] } }, { new: true })

                await addUserToTeam.save()
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
                const team = await Team.findByIdAndUpdate({ _id: doc.team }, { $pullAll: { users: [{ _id: doc._id }] } }, { new: true })

                await team.save()
            }

            res.status(200).json(doc)
        })
    } catch (err) {
        next(err)
    }
}
