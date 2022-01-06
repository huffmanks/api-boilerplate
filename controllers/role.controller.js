import Role from '../models/role.model.js'
import ErrorResponse from '../utils/ErrorResponse.util.js'

export const getSingleRole = async (req, res, next) => {
    try {
        const role = await Role.findById({ _id: req.params.id }).populate('users', 'firstName userName profileImage role')

        res.json(role)
    } catch (err) {
        return next(new ErrorResponse(`No role can be found with that ID.\n ${err.message}`, 404))
    }
}

export const getAllRoles = async (req, res, next) => {
    try {
        const roles = await Role.find({}).populate('users', 'firstName userName profileImage role')

        res.json(roles)
    } catch (err) {
        return next(new ErrorResponse(`No roles can be found.\n ${err.message}`, 404))
    }
}

export const createRole = async (req, res, next) => {
    try {
        const { title } = req.body

        const role = await Role.create({
            title,
        })

        res.status(201).json(role)
    } catch (err) {
        return next(err)
    }
}

export const updateRole = async (req, res, next) => {
    try {
        const role = await Role.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })

        await role.save()

        res.status(200).json(role)
    } catch (err) {
        next(err)
    }
}

export const deleteRole = async (req, res, next) => {
    try {
        Role.findOneAndDelete({ _id: req.params.id }, (err, doc) => {
            if (err) {
                return next(new ErrorResponse('No role can be found with that ID.', 404))
            }

            res.status(200).json(doc)
        })
    } catch (err) {
        next(err)
    }
}
