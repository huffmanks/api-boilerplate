import { User, Team } from '../models/index.js'
// import { firstValues } from 'formidable/src/helpers/firstValues.js'
// import { singleImageUpload } from '../utils/singleImageUpload.util.js'
import { errorResponse, firstValues, singleImageUpload } from '../utils/index.js'

export const getSingleTeam = async (req, res, next) => {
    try {
        const team = await Team.findById({ _id: req.params.id }).populate('users', 'firstName userName profileImage')

        if (!team) {
            return errorResponse(res, 404, { name: 'NotFound', message: 'No team can be found with that ID.' })
        }

        res.json(team)
    } catch (err) {
        next(err)
    }
}

export const getAllTeams = async (req, res, next) => {
    try {
        const teams = await Team.find({}).populate('users', 'firstName userName profileImage')

        if (!teams) {
            return errorResponse(res, 404, { name: 'NotFound', message: 'No teams can be found.' })
        }

        res.json(teams)
    } catch (err) {
        next(err)
    }
}

export const createTeam = async (req, res, next) => {
    singleImageUpload.parse(req, async (err, fields, files) => {
        if (err) {
            next(err)
        }
        try {
            const teamImage = files?.teamImage?.[0] ? `${process.env.SERVER_URL}/uploads/images/${files.teamImage[0].newFilename}` : undefined

            const exceptions = ['users']
            const singleFields = firstValues(fields, exceptions)
            const { users } = singleFields

            if (users) {
                const usersList = await User.find({ _id: { $in: users } })

                const usersID = usersList.map((ul) => ul._id.toString())

                const matchedUsers = users.every((uid) => {
                    return usersID.includes(uid)
                })

                if (!matchedUsers) {
                    return next(res.status(404).json('One or more users can not be found with the ID(s).'))
                }
            }

            const team = await Team.create({
                ...singleFields,
                teamImage,
            })

            if (users) {
                await User.updateMany({ _id: { $in: users } }, { $set: { team: team._id } })
            }

            res.status(201).json(team)
        } catch (err) {
            next(err)
        }
    })
}

export const updateTeam = async (req, res, next) => {
    singleImageUpload.parse(req, async (err, fields, files) => {
        if (err) {
            next(err)
        }
        try {
            const prevUsers = await User.find({ team: req.params.id }).select('team')

            const teamImage = files?.teamImage?.[0] ? `${process.env.SERVER_URL}/uploads/images/${files.teamImage[0].newFilename}` : undefined

            const exceptions = ['users']
            const singleFields = firstValues(fields, exceptions)

            if (singleFields.users) {
                const { users } = singleFields
                const usersList = await User.find({ _id: { $in: users } })

                const usersID = usersList.map((ul) => ul._id.toString())

                const matchedUsers = users.every((uid) => {
                    return usersID.includes(uid)
                })

                if (!matchedUsers) {
                    return next(res.status(404).json('One or more users can not be found with the ID(s).'))
                }
            }

            const team = await Team.findByIdAndUpdate(
                { _id: req.params.id },
                {
                    ...singleFields,
                    teamImage,
                },
                { new: true }
            )

            await team.save()

            if (prevUsers.length > 0) {
                const prevUserIDs = prevUsers.map((user) => user._id.toString())

                const removedUsers = prevUserIDs.filter((id) => !singleFields.users.includes(id))

                await User.updateMany({ _id: { $in: removedUsers } }, { $unset: { team: null } }, { new: true })
            }

            if (singleFields.users) {
                const { users } = singleFields

                await User.updateMany({ _id: { $in: users } }, { $set: { team: team._id } }, { new: true })
            }

            res.status(200).json(team)
        } catch (err) {
            next(err)
        }
    })
}

export const deleteTeam = async (req, res, next) => {
    try {
        Team.findOneAndDelete({ _id: req.params.id }, async (err, doc) => {
            if (err) {
                return next(res.status(404).json('No team can be found with that ID.'))
            }

            if (doc.users) {
                User.updateMany({ _id: { $in: doc.users } }, { $unset: { team: undefined } }, { new: true })
            }

            res.status(200).json(doc)
        })
    } catch (err) {
        next(err)
    }
}
