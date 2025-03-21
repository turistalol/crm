import api from './api';
import { TeamMetrics } from '../components/dashboard/TeamPerformanceMetrics';
import { TeamActivity } from '../components/dashboard/TeamActivityFeed';

const TEAMS_API = '/api/teams';

// Fetch performance metrics for a specific team
export const getTeamMetrics = async (teamId: string): Promise<TeamMetrics> => {
  try {
    const response = await api.get(`${TEAMS_API}/${teamId}/metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team metrics:', error);
    // Return mock data during development or if the API fails
    return {
      id: teamId,
      name: 'Team',
      leadsGenerated: 0,
      leadsGeneratedChange: 0,
      conversionRate: 0,
      conversionRateChange: 0,
      dealsValue: 0,
      dealsValueChange: 0,
    };
  }
};

// Fetch performance metrics for all teams in the company
export const getAllTeamsMetrics = async (): Promise<TeamMetrics[]> => {
  try {
    const response = await api.get(`${TEAMS_API}/metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all team metrics:', error);
    // Return empty array if API fails
    return [];
  }
};

// Fetch recent activities for a specific team
export const getTeamActivities = async (
  teamId: string,
  limit: number = 10
): Promise<TeamActivity[]> => {
  try {
    const response = await api.get(`${TEAMS_API}/${teamId}/activities`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching team activities:', error);
    // Return empty array if API fails
    return [];
  }
};

// Fetch all recent activities across all teams
export const getAllTeamActivities = async (
  limit: number = 20
): Promise<TeamActivity[]> => {
  try {
    const response = await api.get(`${TEAMS_API}/activities`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all team activities:', error);
    // Return empty array if API fails
    return [];
  }
};

// Mock data generator for development (will be removed in production)
export const generateMockTeamMetrics = (teamId: string, teamName: string): TeamMetrics => {
  return {
    id: teamId,
    name: teamName,
    leadsGenerated: Math.floor(Math.random() * 100) + 10,
    leadsGeneratedChange: Math.floor(Math.random() * 20) - 5,
    conversionRate: Math.floor(Math.random() * 40) + 5,
    conversionRateChange: Math.floor(Math.random() * 15) - 5,
    dealsValue: (Math.floor(Math.random() * 150) + 50) * 100,
    dealsValueChange: Math.floor(Math.random() * 30) - 10,
  };
};

// Mock activities generator (will be removed in production)
export const generateMockTeamActivities = (
  teamId: string,
  teamName: string,
  count: number = 5
): TeamActivity[] => {
  const actions = [
    'added a new lead',
    'closed a deal with',
    'scheduled a call with',
    'sent a proposal to',
    'moved lead to qualification',
    'updated contact information for',
    'started negotiation with',
  ];
  
  const targets = [
    'Acme Corp',
    'XYZ Industries',
    'Tech Solutions Inc',
    'Global Services Ltd',
    'Innovative Systems',
    'Future Enterprises',
  ];
  
  const userNames = [
    'John Doe',
    'Sarah Lee',
    'Mike Chen',
    'Emma Wilson',
    'Robert Johnson',
    'Lisa Brown',
  ];
  
  const timeAgo = [
    '5 minutes ago',
    '15 minutes ago',
    '1 hour ago',
    '3 hours ago',
    'Yesterday',
    '2 days ago',
  ];
  
  const activities: TeamActivity[] = [];
  
  for (let i = 0; i < count; i++) {
    const actionIndex = Math.floor(Math.random() * actions.length);
    const action = actions[actionIndex];
    
    // Only use target for certain actions
    const needsTarget = action.includes('with') || action.includes('to') || action.includes('for');
    const targetIndex = Math.floor(Math.random() * targets.length);
    const target = needsTarget ? targets[targetIndex] : undefined;
    
    const userIndex = Math.floor(Math.random() * userNames.length);
    const userName = userNames[userIndex];
    
    const timeIndex = Math.floor(Math.random() * timeAgo.length);
    const time = timeAgo[timeIndex];
    
    activities.push({
      id: `${teamId}-activity-${i}`,
      userId: `user-${userIndex}`,
      userName,
      teamId,
      teamName,
      action,
      target,
      timestamp: new Date().toISOString(),
      timeAgo: time,
      avatar: `https://i.pravatar.cc/150?img=${userIndex + 1}`,
    });
  }
  
  return activities;
}; 