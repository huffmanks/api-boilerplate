import express from 'express'
import { getSingleTeam, getAllTeams, createTeam, updateTeam, deleteTeam } from '../controllers/team.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/teams').get(protect, getAllTeams)
router.route('/teams/:id').get(protect, getSingleTeam)
router.route('/teams/create').post(protect, createTeam)
router.route('/teams/edit/:id').patch(protect, updateTeam)
router.route('/teams/:id').delete(protect, deleteTeam)

export default router
