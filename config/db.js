import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI)

        console.log(`Database connected : ${con.connection.host}`)

        con.connection.on('close', () => {
            con.connection.removeAllListeners()
        })
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB
