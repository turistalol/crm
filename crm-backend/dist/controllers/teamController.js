import { Request, Response } from 'express';
import * as teamService from '../services/teamService';
import { logger } from '../utils/logger';

// Get teams for the current user's company
export async function getCompanyTeams(req: Request, res: Response) {
  try {
    const { user } = req;
    const { companyId } = user;

    if (!companyId) {
      return res.status(400).json({ message: 'User does not belong to a company' });
    }

    const teams = await teamService.getTeamsByCompany(companyId);
    return res.status(200).json(teams);
  } catch (error) {
    logger.error('Error getting company teams:', error);
    return res.status(500).json({ message: 'Failed to get teams' });
  }
}

// Get a specific team by ID
export async function getTeam(req: Request, res: Response) {
  try {
    const { teamId } = req.params;
    const team = await teamService.getTeamById(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    return res.status(200).json(team);
  } catch (error) {
    logger.error('Error getting team:', error);
    return res.status(500).json({ message: 'Failed to get team' });
  }
}

// Create a new team
export async function createTeam(req: Request, res: Response) {
  try {
    const { user } = req;
    const { name, description, leaderId } = req.body;

    if (!user.companyId) {
      return res.status(400).json({ message: 'User does not belong to a company' });
    }

    const team = await teamService.createTeam({
      name,
      description,
      companyId: user.companyId,
      leaderId: leaderId || user.id,
    });

    return res.status(201).json(team);
  } catch (error) {
    logger.error('Error creating team:', error);
    return res.status(500).json({ message: 'Failed to create team' });
  }
}

// Update an existing team
export async function updateTeam(req: Request, res: Response) {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;

    const updatedTeam = await teamService.updateTeam(teamId, {
      name,
      description,
    });

    return res.status(200).json(updatedTeam);
  } catch (error) {
    logger.error('Error updating team:', error);
    return res.status(500).json({ message: 'Failed to update team' });
  }
}

// Delete a team
export async function deleteTeam(req: Request, res: Response) {
  try {
    const { teamId } = req.params;
    await teamService.deleteTeam(teamId);
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting team:', error);
    return res.status(500).json({ message: 'Failed to delete team' });
  }
}

// Add a member to a team
export async function addTeamMember(req: Request, res: Response) {
  try {
    const { teamId } = req.params;
    const { userId, role } = req.body;

    const teamMember = await teamService.addTeamMember({
      teamId,
      userId,
      role,
    });

    return res.status(201).json(teamMember);
  } catch (error) {
    logger.error('Error adding team member:', error);
    return res.status(500).json({ message: 'Failed to add team member' });
  }
}

// Remove a member from a team
export async function removeTeamMember(req: Request, res: Response) {
  try {
    const { teamId, userId } = req.params;
    
    await teamService.removeTeamMember(userId, teamId);
    return res.status(204).send();
  } catch (error) {
    logger.error('Error removing team member:', error);
    return res.status(500).json({ message: 'Failed to remove team member' });
  }
}

// Update a team member's role
export async function updateTeamMemberRole(req: Request, res: Response) {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;

    const teamMember = await teamService.updateTeamMemberRole(userId, teamId, role);
    return res.status(200).json(teamMember);
  } catch (error) {
    logger.error('Error updating team member role:', error);
    return res.status(500).json({ message: 'Failed to update team member role' });
  }
}

// Get teams for the current user
export async function getUserTeams(req: Request, res: Response) {
  try {
    const { user } = req;
    const teams = await teamService.getTeamsByUser(user.id);
    return res.status(200).json(teams);
  } catch (error) {
    logger.error('Error getting user teams:', error);
    return res.status(500).json({ message: 'Failed to get user teams' });
  }
} 