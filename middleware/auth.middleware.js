import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { errorResponse } from '../utils/index.js'

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
        return errorResponse(res, 401, 'You are not authorized to access this route.')
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET)

        const user = await User.findById(decoded.user.id)

        if (!user) {
            return errorResponse(res, 404, 'No user found.')
        }

        req.user = user

        next()
    } catch (error) {
        return errorResponse(res, 401, 'You are not authorized to access this route.')
    }
}
