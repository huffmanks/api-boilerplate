import express from 'express'
import { login, register, forgotPassword, resetPassword } from '../controllers/auth.controller.js'

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/forgotpassword').post(forgotPassword)
router.route('/resetpassword/:resetToken').patch(resetPassword)

export default router
