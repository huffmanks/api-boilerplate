import mongoose from 'mongoose'
import { User, Team } from '../models/index.js'
import path from 'path'
const __dirname = path.resolve()

import { errorResponse } from '../utils/index.js'

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
    try {
        const { users } = req.body

        if (users) {
            const usersIdIsValid = users.map((userId) => {
                if (mongoose.isValidObjectId(userId)) {
                    return userId
                }
            })

            if (!usersIdIsValid.every(Boolean)) {
                return errorResponse(res, 400, { name: 'Bad Request', message: 'One or more users ID(s) are invalid.' })
            }

            const usersList = await User.find({ _id: { $in: users } })

            const usersId = usersList.map((ul) => ul._id.toString())

            const matchedUsers = users.every((uid) => {
                return usersId.includes(uid)
            })

            if (!matchedUsers) {
                return errorResponse(res, 404, { name: 'Not Found', message: 'One or more users can not be found with the ID(s).' })
            }
        }

        const prevUsers = await User.find({ _id: { $in: users } }).select('team')

        const team = await Team.create(req.body)

        const teamImage = req?.files?.teamImage

        if (teamImage) {
            if (!teamImage?.mimetype || !teamImage?.mimetype.includes('image')) {
                return errorResponse(res, 415, { name: 'Unsupported Media Type', message: 'The image field only accepts image file types.' })
            }

            const extension = path.extname(teamImage.name)
            const pathSuffix = `/uploads/images/team/${team._id}${extension.toLowerCase()}`

            const imagePath = __dirname + pathSuffix

            teamImage.mv(imagePath, function (err) {
                if (err) {
                    return errorResponse(res, 500, { name: 'Internal Server Error', message: err })
                }
            })

            team.teamImage = process.env.SERVER_URL + pathSuffix

            await team.save()
        }

        if (prevUsers?.[0]?.team) {
            const prevUsersIds = prevUsers.map((user) => user._id.toString())

            const uniquePrevTeamsIds = [...new Set(prevUsers.map((user) => user.team.toString()))]

            await Team.updateMany({ _id: uniquePrevTeamsIds }, { $pullAll: { users: prevUsersIds } }, { new: true })
        }

        if (users) {
            await User.updateMany({ _id: { $in: users } }, { $set: { team: team._id } })
        }

        res.status(201).json(team)
    } catch (err) {
        next(err)
    }
}

export const updateTeam = async (req, res, next) => {
    try {
        const users = !req.body.users ? undefined : Array.isArray(req.body.users) ? req.body.users : [req.body.users]

        if (users) {
            const usersIdIsValid = users.map((userId) => {
                if (mongoose.isValidObjectId(userId)) {
                    return userId
                }
            })

            if (!usersIdIsValid.every(Boolean)) {
                return errorResponse(res, 400, { name: 'Bad Request', message: 'One or more users ID(s) are invalid.' })
            }

            const usersList = await User.find({ _id: { $in: users } })

            const usersId = usersList.map((ul) => ul._id.toString())

            const matchedUsers = users.every((uid) => {
                return usersId.includes(uid)
            })

            if (!matchedUsers) {
                return errorResponse(res, 404, { name: 'Not Found', message: 'One or more users can not be found with the ID(s).' })
            }
        }

        const prevUsers = await User.find({ _id: { $in: users } }).select('team')

        const teamImage = req?.files?.teamImage
        let pathSuffix

        if (teamImage) {
            if (!teamImage?.mimetype || !teamImage?.mimetype.includes('image')) {
                return errorResponse(res, 415, { name: 'Unsupported Media Type', message: 'The image field only accepts image file types.' })
            }

            const extension = path.extname(teamImage.name)
            pathSuffix = `/uploads/images/team/${req.params.id}${extension.toLowerCase()}`

            const imagePath = __dirname + pathSuffix

            teamImage.mv(imagePath, function (err) {
                if (err) {
                    return errorResponse(res, 500, { name: 'Internal Server Error', message: err })
                }
            })
        }

        const { users: newUsers, ...fieldsWithoutUsers } = req.body
        const imageUrl = pathSuffix ? process.env.SERVER_URL + pathSuffix : undefined

        const team = await Team.findByIdAndUpdate(
            { _id: req.params.id },
            {
                $set: { ...fieldsWithoutUsers },
                $addToSet: { users: users },
                teamImage: imageUrl,
            },
            { new: true }
        )

        if (prevUsers?.[0]?.team) {
            const prevUsersIds = prevUsers.map((user) => user._id.toString())

            const uniquePrevTeamsIds = [...new Set(prevUsers.map((user) => user.team.toString()))]

            const removeUsersPrevTeamIds = uniquePrevTeamsIds.filter((id) => !req.params.id.includes(id))

            if (removeUsersPrevTeamIds.length > 0) {
                await Team.updateMany({ _id: removeUsersPrevTeamIds }, { $pull: { users: { $in: prevUsersIds } } }, { new: true })
            }
        }

        if (users) {
            await User.updateMany({ _id: { $in: users } }, { $set: { team: team._id } }, { new: true })
        }

        res.status(200).json(team)
    } catch (err) {
        next(err)
    }
}

export const deleteTeam = async (req, res, next) => {
    try {
        Team.findOneAndDelete({ _id: req.params.id }, async (err, doc) => {
            if (err) {
                return errorResponse(res, 404, { name: 'Not Found', message: 'No team can be found with that ID.' })
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
