import express from 'express';
import * as teamController from '../controllers/teamController';
import { authenticate } from '../middlewares/authMiddleware';
import { checkRole } from '../middlewares/roleMiddleware';
import { Role } from '@prisma/client';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get teams for the current user
router.get('/user', teamController.getUserTeams);

// Routes for company teams (protected by role)
router.get('/company', checkRole([Role.ADMIN, Role.MANAGER]), teamController.getCompanyTeams);
router.post('/', checkRole([Role.ADMIN, Role.MANAGER]), teamController.createTeam);

// Individual team routes
router.get('/:teamId', teamController.getTeam);
router.put('/:teamId', checkRole([Role.ADMIN, Role.MANAGER]), teamController.updateTeam);
router.delete('/:teamId', checkRole([Role.ADMIN]), teamController.deleteTeam);

// Team member management
router.post('/:teamId/members', checkRole([Role.ADMIN, Role.MANAGER]), teamController.addTeamMember);
router.delete('/:teamId/members/:userId', checkRole([Role.ADMIN, Role.MANAGER]), teamController.removeTeamMember);
router.put('/:teamId/members/:userId/role', checkRole([Role.ADMIN]), teamController.updateTeamMemberRole);

export default router; 