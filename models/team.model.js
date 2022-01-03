import mongoose from 'mongoose'
const { Schema } = mongoose

const TeamSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide the name of the team.'],
        },
        description: {
            type: String,
            default: undefined,
        },
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        teamImage: {
            fileName: {
                type: String,
                default: undefined,
            },
            filePath: {
                type: String,
                default: undefined,
            },
            fileType: {
                type: String,
                default: undefined,
            },
            fileSize: {
                type: String,
                default: undefined,
            },
        },
    },
    {
        timestamps: true,
    }
)

const Team = mongoose.model('Team', TeamSchema)

export default Team
