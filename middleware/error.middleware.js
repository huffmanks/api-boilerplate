import { errorResponse } from '../utils/index.js'

export const errorHandler = (err, req, res, next) => {
    const error = !err.errors ? err : Object.values(err.errors).map((field) => field)

    if (err.code === 11000) {
        const { name, keyValue } = error

        for (const [field, value] of Object.entries(keyValue)) {
            return errorResponse(res, 400, { name, message: `A record with the ${field}, '${value}', already exists.` })
        }
    }

    if (err.name === 'ValidationError') {
        const { name, value, path } = error[0]

        return errorResponse(res, 400, { name, message: `The ${path}, '${value}', is not valid.` })
    }

    return errorResponse(res, 500, { name: err.name, code: err.code, message: err.message })
}
