import Team from '../models/team.model.js'
import ErrorResponse from '../utils/ErrorResponse.util.js'

export const getSingleTeam = async (req, res, next) => {
    try {
        const team = await Team.findById({ _id: req.params.id })

        if (!team) {
            return next(new ErrorResponse('No team can be found with that ID.', 404))
        }

        res.json(team)
    } catch (err) {
        next(err)
    }
}

export const getAllTeams = async (req, res, next) => {
    try {
        const teams = await Team.find({}).populate('users', 'userName')

        if (!teams) {
            return next(new ErrorResponse('No teams can be found.', 404))
        }

        res.json(teams)
    } catch (err) {
        next(err)
    }
}

export const createTeam = async (req, res, next) => {
    try {
        let team

        if (req.file) {
            const { title, description, users } = req.body
            const { originalname, path, mimetype, size } = req.file

            team = {
                title,
                description,
                users,
                teamImage: {
                    fileName: originalname,
                    filePath: path,
                    fileType: mimetype,
                    fileSize: size,
                },
            }
        }

        !req.file ? (team = await Team.create(req.body)) : (team = await Team.create(team))

        res.json({ success: true, data: team })
    } catch (err) {
        next(err)
    }
}

export const updateTeam = async (req, res, next) => {
    let updatedTeam

    if (req.file) {
        const { title, description, users } = req.body
        const { originalname, path, mimetype, size } = req.file

        updatedTeam = {
            title,
            description,
            users,
            teamImage: {
                fileName: originalname,
                filePath: path,
                fileType: mimetype,
                fileSize: size,
            },
        }
    }

    try {
        const team = await Team.findOneAndUpdate({ _id: req.params.id }, !req.file ? req.body : updatedTeam, {
            new: true,
        })

        await team.save()

        res.status(200).json(team)
    } catch (err) {
        next(err)
    }
}

export const deleteTeam = async (req, res, next) => {
    try {
        Team.findOneAndDelete({ _id: req.params.id }, (err, doc) => {
            if (err) {
                return next(new ErrorResponse('No team can be found with that ID.', 404))
            }

            res.status(200).json(doc)
        })
    } catch (err) {
        next(err)
    }
}
