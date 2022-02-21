import express from 'express'
import { login, register, forgotPassword, resetPassword, refresh, logout } from '../controllers/auth.controller.js'

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:resetPasswordToken').post(resetPassword)
router.route('/refresh').get(refresh)
router.route('/logout').post(logout)

export default router
