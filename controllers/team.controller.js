import Team from '../models/team.model.js'
import ErrorResponse from '../utils/ErrorResponse.util.js'
import upload from '../utils/fileUpload.util.js'
import { firstValues } from 'formidable/src/helpers/firstValues.js'

export const getSingleTeam = async (req, res, next) => {
    try {
        const team = await Team.findById({ _id: req.params.id })

        if (!team) {
            return next(new ErrorResponse('No team can be found with that ID.', 404))
        }

        res.json(team)
    } catch (err) {
        next(err)
    }
}

export const getAllTeams = async (req, res, next) => {
    try {
        const teams = await Team.find({}).populate('users', 'userName')

        if (!teams) {
            return next(new ErrorResponse('No teams can be found.', 404))
        }

        res.json(teams)
    } catch (err) {
        next(err)
    }
}

export const createTeam = async (req, res, next) => {
    try {
        upload.parse(req, async (err, fields, files) => {
            if (err) {
                next(err)
                return
            }

            const exceptions = ['users']
            const singleFields = firstValues(upload, fields, exceptions)

            const { title, description, users } = singleFields

            const team = await Team.create({
                title,
                description,
                users,
                teamImage: {
                    fileName: files?.teamImage?.[0]?.newFilename,
                    filePath: files?.teamImage?.[0]?.filepath,
                    fileType: files?.teamImage?.[0]?.mimetype,
                    fileSize: files?.teamImage?.[0]?.size,
                },
            })

            res.status(201).json(team)
        })
    } catch (err) {
        next(err)
    }
}

export const updateTeam = async (req, res, next) => {
    try {
        upload.parse(req, async (err, fields, files) => {
            if (err) {
                next(err)
                return
            }
            const exceptions = ['users']
            const singleFields = firstValues(upload, fields, exceptions)

            const update = files?.teamImage?.[0]
                ? {
                      ...singleFields,
                      teamImage: {
                          fileName: files.teamImage[0].newFilename,
                          filePath: files.teamImage[0].filepath,
                          fileType: files.teamImage[0].mimetype,
                          fileSize: files.teamImage[0].size,
                      },
                  }
                : singleFields

            const team = await Team.findOneAndUpdate({ _id: req.params.id }, update, { new: true })

            await team.save()

            res.status(200).json(team)
        })
    } catch (err) {
        next(err)
    }
}

export const deleteTeam = async (req, res, next) => {
    try {
        Team.findOneAndDelete({ _id: req.params.id }, (err, doc) => {
            if (err) {
                return next(new ErrorResponse('No team can be found with that ID.', 404))
            }

            res.status(200).json(doc)
        })
    } catch (err) {
        next(err)
    }
}
