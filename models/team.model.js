import mongoose from 'mongoose'
const { Schema } = mongoose

const TeamSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide the name of the team.'],
            unique: true,
        },
        description: {
            type: String,
        },
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        teamImage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

const Team = mongoose.model('Team', TeamSchema)

export default Team
