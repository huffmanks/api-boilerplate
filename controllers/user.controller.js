import User from '../models/user.model.js'
import ErrorResponse from '../utils/ErrorResponse.util.js'
import upload from '../utils/fileUpload.util.js'
import { firstValues } from 'formidable/src/helpers/firstValues.js'

export const getSingleUser = async (req, res, next) => {
    try {
        const user = await User.findById({ _id: req.params.id }).populate('team', 'title')

        if (!user) {
            return next(new ErrorResponse('No user can be found with that ID.', 404))
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
            return next(new ErrorResponse('No users can be found.', 404))
        }

        res.json(users)
    } catch (err) {
        next(err)
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

            const { firstName, lastName, email, password, team } = singleFields

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
            })

            res.status(201).json(user)
        })
    } catch (err) {
        next(err)
    }
}

export const updateUser = async (req, res, next) => {
    try {
        upload.parse(req, async (err, fields, files) => {
            if (err) {
                next(err)
                return
            }
            const exceptions = ['']
            const singleFields = firstValues(upload, fields, exceptions)

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

            res.status(200).json(user)
        })
    } catch (err) {
        next(err)
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        User.findOneAndDelete({ _id: req.params.id }, (err, doc) => {
            if (err) {
                return next(new ErrorResponse('No user can be found with that ID.', 404))
            }

            res.status(200).json(doc)
        })
    } catch (err) {
        next(err)
    }
}
