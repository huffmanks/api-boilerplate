import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { ErrorResponse } from '../utils/index.js'

export const protect = async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route.', 401))
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET)

        const user = await User.findById(decoded.id)

        if (!user) {
            return next(new ErrorResponse('No user found.', 404))
        }

        req.user = user

        next()
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route.', 401))
    }
}
