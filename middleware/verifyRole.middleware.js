export const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.user?.role) return res.status(401).json('You are not authorized to access this route.')

        const rolesArray = [...allowedRoles]
        const result = rolesArray.includes(req.user.role)

        if (!result) return res.status(401).json('You are not authorized to access this route.')

        next()
    }
}
