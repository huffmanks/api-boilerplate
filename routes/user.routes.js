import express from 'express'
import { getSingleUser, getAllUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { verifyRole } from '../middleware/verifyRole.middleware.js'
import { ROLES_LIST } from '../config/rolesList.js'

const router = express.Router()

router.route('/users').get(protect, getAllUsers)
router.route('/users/:id').get(protect, getSingleUser)
router.route('/users/create').post(protect, verifyRole(ROLES_LIST.Admin, ROLES_LIST.Manager), createUser)
router.route('/users/edit/:id').patch(protect, verifyRole(ROLES_LIST.Admin, ROLES_LIST.Manager), updateUser)
router.route('/users/:id').delete(protect, verifyRole(ROLES_LIST.Admin), deleteUser)

export default router
