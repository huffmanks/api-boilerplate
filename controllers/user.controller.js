import User from '../models/user.model.js'
import ErrorResponse from '../utils/ErrorResponse.util.js'

export const getSingleUser = async (req, res, next) => {
    try {
        const user = await User.findById({ _id: req.params.id }).populate('team', 'title').populate('roles')

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
        const users = await User.find({}).populate('team', 'title').populate('roles')

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
        let user

        if (req.file) {
            const { firstName, lastName, email, password, team, roles } = req.body
            const { originalname, path, mimetype, size } = req.file

            user = {
                firstName,
                lastName,
                email,
                password,
                profileImage: {
                    fileName: originalname,
                    filePath: path,
                    fileType: mimetype,
                    fileSize: size,
                },
                team,
                roles,
            }
        }

        !req.file ? (user = await User.create(req.body)) : (user = await User.create(user))

        res.json({ success: true, data: user })
    } catch (err) {
        next(err)
    }
}

export const updateUser = async (req, res, next) => {
    try {
        let updatedUser

        if (req.file) {
            const { firstName, lastName, email, password, team, roles } = req.body
            const { originalname, path, mimetype, size } = req.file

            updatedUser = {
                firstName,
                lastName,
                email,
                password,
                profileImage: {
                    fileName: originalname,
                    filePath: path,
                    fileType: mimetype,
                    fileSize: size,
                },
                team,
                roles,
            }
        }

        const user = await User.findOneAndUpdate({ _id: req.params.id }, !req.file ? req.body : updatedUser, {
            new: true,
        })

        await user.save()

        res.status(200).json(user)
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
