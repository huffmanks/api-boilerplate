import bcrypt from 'bcryptjs'
import { User, Team } from '../models/index.js'
import { firstValues } from 'formidable/src/helpers/firstValues.js'
import upload from '../utils/fileUpload.util.js'

export const getSingleUser = async (req, res, next) => {
    try {
        const user = await User.findById({ _id: req.params.id }).populate('team', 'title')

        res.json(user)
    } catch (err) {
        return next(res.status(404).json(`No user can be found with that ID.\n ${err.message}`))
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).populate('team', 'title')

        res.json(users)
    } catch (err) {
        return next(res.status(404).json(`No users can be found.\n ${err.message}`))
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
                    return next(res.status(404).json('No team can be found with that ID.'))
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
                const addUserToTeam = await Team.findByIdAndUpdate({ _id: team }, { $push: { users: [{ _id: user._id }] } }, { new: true })

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
                    return next(res.status(404).json('No team can be found with that ID.'))
                }
            }

            if (singleFields.email) {
                const username = singleFields.email.substring(0, singleFields.email.indexOf('@'))
                singleFields.userName = username
            }

            if (singleFields.password) {
                const salt = await bcrypt.genSalt(10)
                singleFields.password = await bcrypt.hash(singleFields.password, salt)
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

            const user = await User.findByIdAndUpdate({ _id: req.params.id }, update, { new: true })

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
                return next(res.status(404).json('No user can be found with that ID.'))
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
