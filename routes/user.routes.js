import express from 'express'
import { getSingleUser, getAllUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import upload from '../utils/fileStorage.util.js'

const router = express.Router()

router.route('/users').get(protect, getAllUsers)
router.route('/users/:id').get(protect, getSingleUser)
router.route('/users/create').post(protect, upload.single('profileImage'), createUser)
router.route('/users/edit/:id').patch(protect, upload.single('profileImage'), updateUser)
router.route('/users/:id').delete(protect, deleteUser)

export default router
