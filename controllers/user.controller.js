import User from '../models/user.model.js'
import Team from '../models/team.model.js'
import ErrorResponse from '../utils/ErrorResponse.util.js'
import upload from '../utils/fileUpload.util.js'
import { firstValues } from 'formidable/src/helpers/firstValues.js'

export const getSingleUser = async (req, res, next) => {
    try {
        const user = await User.findById({ _id: req.params.id }).populate('team', 'title')

        res.json(user)
    } catch (err) {
        return next(new ErrorResponse(`No user can be found with that ID.\n ${err.message}`, 404))
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).populate('team', 'title')

        res.json(users)
    } catch (err) {
        return next(new ErrorResponse(`No users can be found.\n ${err.message}`, 404))
    }
}

export const createUser = async (req, res, next) => {
    try {
        upload.parse(req, async (err, fields, files) => {
            if (err) {
                next(err)
                return
            }

            const exceptions = ['']
            const singleFields = firstValues(upload, fields, exceptions)

            const { firstName, lastName, email, password, team, role } = singleFields

            if (team) {
                const teamExists = await Team.findById(team)

                if (teamExists === null) {
                    return next(new ErrorResponse('No team can be found with that ID.', 404))
                }
            }

            const user = await User.create({
                firstName,
                lastName,
                email,
                password,
                profileImage: {
                    fileName: files?.profileImage?.[0]?.newFilename,
                    filePath: files?.profileImage?.[0]?.filepath,
                    fileType: files?.profileImage?.[0]?.mimetype,
                    fileSize: files?.profileImage?.[0]?.size,
                },
                team,
                role,
            })

            if (team) {
                const addUserToTeam = await Team.findOneAndUpdate({ _id: team }, { $push: { users: [{ _id: user._id }] } }, { new: true })

                await addUserToTeam.save()
            }

            res.status(201).json(user)
        })
    } catch (err) {
        next(err)
    }
}

export const updateUser = async (req, res, next) => {
    try {
        const prevTeam = await User.findById({ _id: req.params.id }).select('team')

        upload.parse(req, async (err, fields, files) => {
            if (err) {
                next(err)
                return
            }

            const exceptions = ['']
            const singleFields = firstValues(upload, fields, exceptions)

            if (singleFields.team) {
                const { team } = singleFields
                const teamExists = await Team.findById(team)

                if (teamExists === null) {
                    return next(new ErrorResponse('No team can be found with that ID.', 404))
                }
            }

            const update = files?.profileImage?.[0]
                ? {
                      ...singleFields,
                      profileImage: {
                          fileName: files.profileImage[0].newFilename,
                          filePath: files.profileImage[0].filepath,
                          fileType: files.profileImage[0].mimetype,
                          fileSize: files.profileImage[0].size,
                      },
                  }
                : singleFields

            const user = await User.findOneAndUpdate({ _id: req.params.id }, update, { new: true })

            await user.save()

            if (prevTeam.team) {
                const team = await Team.findByIdAndUpdate({ _id: prevTeam.team }, { $pullAll: { users: [{ _id: user._id }] } }, { new: true })

                await team.save()
            }
            if (singleFields.team) {
                const team = await Team.findByIdAndUpdate({ _id: singleFields.team }, { $push: { users: [{ _id: user._id }] } }, { new: true })

                await team.save()
            }

            res.status(200).json(user)
        })
    } catch (err) {
        next(err)
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        User.findOneAndDelete({ _id: req.params.id }, async (err, doc) => {
            if (err) {
                return next(new ErrorResponse('No user can be found with that ID.', 404))
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
