export const sendToken = (res, statusCode, user, refreshToken, accessToken, message) => {
    const profileImage = !user.profileImage.fileName ? undefined : `${process.env.SERVER_URL}/uploads/images/${user.profileImage.fileName}`

    return res
        .cookie('refreshToken', refreshToken, { httpOnly: true })
        .status(statusCode)
        .json({
            user: {
                id: user._id,
                firstName: user?.firstName,
                email: user.email,
                team: user.team,
                role: user.role,
                profileImage,
            },
            accessToken,
            message,
        })
}
