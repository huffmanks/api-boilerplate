const sendToken = (res, statusCode, user, refreshToken, accessToken, message) => {
    return res
        .cookie('refreshToken', refreshToken, { httpOnly: true })
        .status(statusCode)
        .json({
            user: {
                email: user.email,
                role: user.role,
            },
            accessToken,
            message,
        })
}

export default sendToken
