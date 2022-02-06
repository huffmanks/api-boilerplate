export const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json(message)
}
