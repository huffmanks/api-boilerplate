const sendToken = (res, statusCode, user, message) => {
    const token = user.getSignedToken()

    return res
        .cookie('token', token, { httpOnly: true })
        .status(statusCode)
        .json({
            user: {
                email: user.email,
                role: user.role,
            },
            token,
            message,
        })
}

export default sendToken
