export const sendToken = (res, statusCode, user, refreshToken, accessToken, message) => {
    const profileImage = !user.profileImage.fileName ? undefined : `${process.env.SERVER_URL}/uploads/images/${user.profileImage.fileName}`

    return res
        .cookie('refreshToken', refreshToken, { httpOnly: true })
        .status(statusCode)
        .json({
            user: {
                firstName: user?.firstName,
                email: user.email,
                role: user.role,
                profileImage,
            },
            accessToken,
            message,
        })
}
