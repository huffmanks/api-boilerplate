import dotenv from 'dotenv'
dotenv.config({ path: './config.env' })

import express from 'express'

import connectDB from './config/db.js'

import cors from 'cors'
import { errorHandler } from './middleware/error.middleware.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import teamRoutes from './routes/team.routes.js'

// Server Init
const app = express()

// Connect database
connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use(errorHandler)
app.use(express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/private', userRoutes)
app.use('/api/private', teamRoutes)

// Server Start
const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Sever running on port ${PORT}`))
