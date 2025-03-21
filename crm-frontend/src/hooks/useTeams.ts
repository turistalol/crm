import { useState, useEffect } from 'react';
import { Team } from '../types/team';
import { getTeams } from '../services/teamService';

interface UseTeamsResult {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTeams = (): UseTeamsResult => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const teamsData = await getTeams();
      setTeams(teamsData);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return { teams, isLoading, error, refetch: fetchTeams };
}; 