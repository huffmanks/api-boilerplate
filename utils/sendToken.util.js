const sendToken = (res, statusCode, user, message) => {
    const token = user.getSignedToken()
    res.status(statusCode).json({
        user: {
            email: user?.email,
        },
        token,
        message,
    })
}

export default sendToken
