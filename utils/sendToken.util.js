export const sendToken = (res, statusCode, user, refreshToken, accessToken, message) => {
    return res
        .cookie('refreshToken', refreshToken, { httpOnly: true })
        .status(statusCode)
        .json({
            user: {
                id: user._id,
                firstName: user?.firstName,
                lastName: user?.lastName,
                userName: user.userName,
                email: user.email,
                team: user?.team,
                role: user.role,
                profileImage: user?.profileImage,
            },
            accessToken,
            message,
        })
}
