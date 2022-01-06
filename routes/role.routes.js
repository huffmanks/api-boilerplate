import express from 'express'
import { getSingleRole, getAllRoles, createRole, updateRole, deleteRole } from '../controllers/role.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/roles').get(protect, getAllRoles)
router.route('/roles/:id').get(protect, getSingleRole)
router.route('/roles/create').post(protect, createRole)
router.route('/roles/edit/:id').patch(protect, updateRole)
router.route('/roles/:id').delete(protect, deleteRole)

export default router
