import express from 'express'

import dotenv from 'dotenv'
dotenv.config({ path: './config.env' })

import connectDB from './config/db.js'

import path from 'path'
const __dirname = path.resolve()

import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/error.middleware.js'

import { authRoutes, userRoutes, teamRoutes } from './routes/index.js'

// Server Init
const app = express()

// Connect database
connectDB()

// Middleware
app.use(express.json())

app.use(cors())
app.use(cookieParser())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/private', userRoutes)
app.use('/api/private', teamRoutes)

app.use(errorHandler)

// Server Start
const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Sever running on port ${PORT}`))
