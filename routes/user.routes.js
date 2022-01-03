import express from 'express'
import { getSingleUser, getAllUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/users').get(protect, getAllUsers)
router.route('/users/:id').get(protect, getSingleUser)
router.route('/users/create').post(protect, createUser)
router.route('/users/edit/:id').patch(protect, updateUser)
router.route('/users/:id').delete(protect, deleteUser)

export default router
