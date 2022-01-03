import express from 'express'
import { getSingleTeam, getAllTeams, createTeam, updateTeam, deleteTeam } from '../controllers/team.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import upload from '../utils/fileStorage.util.js'

const router = express.Router()

router.route('/teams').get(protect, getAllTeams)
router.route('/teams/:id').get(protect, getSingleTeam)
router.route('/teams/create').post(protect, upload.single('teamImage'), createTeam)
router.route('/teams/edit/:id').patch(protect, upload.single('teamImage'), updateTeam)
router.route('/teams/:id').delete(protect, deleteTeam)

export default router
