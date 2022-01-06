import mongoose from 'mongoose'
const { Schema } = mongoose

const RoleSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide the name of the role.'],
            unique: true,
        },
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
)

const Role = mongoose.model('Role', RoleSchema)

export default Role
