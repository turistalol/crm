import api from './api';
import { 
  Team, 
  TeamMember, 
  CreateTeamDto, 
  UpdateTeamDto, 
  AddTeamMemberDto,
  TeamRole,
  TeamInvitation,
  CreateTeamInvitationDto,
  InvitationStatus
} from '../types/team';

const TEAMS_URL = '/teams';

// Get all teams for the current user
export const getUserTeams = async (): Promise<Team[]> => {
  try {
    const response = await api.get(`${TEAMS_URL}/user`);
    return response.data;
  } catch (error) {
    // Use mock data when in development mode and API fails
    if (error.code === 'ERR_NETWORK' && import.meta.env.DEV) {
      console.warn('Using mock teams data for development');
      return [
        {
          id: '1',
          name: 'Team Alpha',
          description: 'Sales team focusing on enterprise clients',
          companyId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Team Beta',
          description: 'Customer support and success team',
          companyId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Team Gamma',
          description: 'Marketing and lead generation team',
          companyId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    throw error;
  }
};

// Get all teams for the company (admin/manager only)
export const getCompanyTeams = async (): Promise<Team[]> => {
  const response = await api.get(`${TEAMS_URL}/company`);
  return response.data;
};

// Get a team by ID
export const getTeamById = async (teamId: string): Promise<Team> => {
  const response = await api.get(`${TEAMS_URL}/${teamId}`);
  return response.data;
};

// Create a new team
export const createTeam = async (teamData: CreateTeamDto): Promise<Team> => {
  const response = await api.post(TEAMS_URL, teamData);
  return response.data;
};

// Update a team
export const updateTeam = async (teamId: string, teamData: UpdateTeamDto): Promise<Team> => {
  const response = await api.put(`${TEAMS_URL}/${teamId}`, teamData);
  return response.data;
};

// Delete a team
export const deleteTeam = async (teamId: string): Promise<void> => {
  await api.delete(`${TEAMS_URL}/${teamId}`);
};

// Add a member to a team
export const addTeamMember = async (teamId: string, memberData: AddTeamMemberDto): Promise<TeamMember> => {
  const response = await api.post(`${TEAMS_URL}/${teamId}/members`, memberData);
  return response.data;
};

// Remove a member from a team
export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
  await api.delete(`${TEAMS_URL}/${teamId}/members/${userId}`);
};

// Update a team member's role
export const updateTeamMemberRole = async (teamId: string, userId: string, role: TeamRole): Promise<TeamMember> => {
  const response = await api.put(`${TEAMS_URL}/${teamId}/members/${userId}/role`, { role });
  return response.data;
};

// Get all invitations for a team
export const getTeamInvitations = async (teamId: string): Promise<TeamInvitation[]> => {
  const response = await api.get(`${TEAMS_URL}/${teamId}/invitations`);
  return response.data;
};

// Send an invitation to join a team
export const inviteToTeam = async (teamId: string, invitationData: CreateTeamInvitationDto): Promise<TeamInvitation> => {
  const response = await api.post(`${TEAMS_URL}/${teamId}/invitations`, invitationData);
  return response.data;
};

// Cancel an invitation
export const cancelInvitation = async (teamId: string, invitationId: string): Promise<void> => {
  await api.delete(`${TEAMS_URL}/${teamId}/invitations/${invitationId}`);
};

// Resend an invitation
export const resendInvitation = async (teamId: string, invitationId: string): Promise<TeamInvitation> => {
  const response = await api.post(`${TEAMS_URL}/${teamId}/invitations/${invitationId}/resend`);
  return response.data;
};

// Accept an invitation (for invited users)
export const acceptInvitation = async (invitationId: string): Promise<void> => {
  await api.post(`${TEAMS_URL}/invitations/${invitationId}/accept`);
};

// Reject an invitation (for invited users)
export const rejectInvitation = async (invitationId: string): Promise<void> => {
  await api.post(`${TEAMS_URL}/invitations/${invitationId}/reject`);
};

// Get all invitations for the current user
export const getUserInvitations = async (): Promise<TeamInvitation[]> => {
  try {
    const response = await api.get(`${TEAMS_URL}/invitations/user`);
    return response.data;
  } catch (error) {
    // Use mock data when in development mode and API fails
    if (error.code === 'ERR_NETWORK' && import.meta.env.DEV) {
      console.warn('Using mock invitation data for development');
      return [
        {
          id: '1',
          teamId: '1',
          email: 'current@example.com',
          role: TeamRole.MEMBER,
          status: InvitationStatus.PENDING,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          team: {
            id: '1',
            name: 'Team Alpha',
            description: 'Sales team focusing on enterprise clients',
            companyId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        {
          id: '2',
          teamId: '2',
          email: 'current@example.com',
          role: TeamRole.MEMBER,
          status: InvitationStatus.PENDING,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          team: {
            id: '2',
            name: 'Team Beta',
            description: 'Customer support and success team',
            companyId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      ];
    }
    throw error;
  }
}; 