import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Heading, 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink,
  Divider,
  Spinner,
  Flex,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import TeamList from '../components/teams/TeamList';
import TeamMemberList from '../components/teams/TeamMemberList';
import TeamInvitationList from '../components/teams/TeamInvitationList';
import { getTeamById } from '../services/teamService';
import { Team } from '../types/team';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/user';

const TeamsPage: React.FC = () => {
  const { teamId } = useParams<{ teamId?: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  // Check if we're viewing a specific team
  const isTeamDetail = !!teamId;
  
  // Ensure user role is a valid Role enum value
  const getUserRole = (): Role => {
    if (!user?.role) return Role.USER;
    
    // Check if the role value is one of the valid enum values
    switch (user.role) {
      case Role.ADMIN:
        return Role.ADMIN;
      case Role.MANAGER:
        return Role.MANAGER;
      case Role.USER:
      default:
        return Role.USER;
    }
  };
  
  const userRole = getUserRole();

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails(teamId);
    }
  }, [teamId]);

  const fetchTeamDetails = async (id: string) => {
    setLoading(true);
    try {
      const teamData = await getTeamById(id);
      setTeam(teamData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load team details",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamUpdated = () => {
    if (teamId) {
      fetchTeamDetails(teamId);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Breadcrumb separator={<ChevronRightIcon color="gray.500" />} mb={4}>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {isTeamDetail ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/teams">Teams</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>{team?.name || 'Team Details'}</BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Teams</BreadcrumbLink>
            </BreadcrumbItem>
          )}
        </Breadcrumb>

        <Heading size="lg" mb={2}>
          {isTeamDetail ? team?.name || 'Team Details' : 'Teams'}
        </Heading>
      </Box>

      <Divider mb={6} />

      {isTeamDetail ? (
        loading ? (
          <Flex justify="center" my={10}>
            <Spinner size="xl" />
          </Flex>
        ) : team ? (
          <Box>
            <Box mb={6}>
              <Heading size="md" mb={2}>Description</Heading>
              <Box p={4} bg="gray.50" borderRadius="md">
                {team.description || 'No description available.'}
              </Box>
            </Box>
            
            <Tabs colorScheme="blue" variant="enclosed">
              <TabList>
                <Tab>Members</Tab>
                <Tab>Invitations</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <TeamMemberList 
                    team={team} 
                    userRole={userRole} 
                    onTeamUpdated={handleTeamUpdated} 
                  />
                </TabPanel>
                <TabPanel px={0}>
                  <TeamInvitationList
                    team={team}
                    userRole={userRole}
                    onTeamUpdated={handleTeamUpdated}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        ) : (
          <Box textAlign="center" p={10}>
            Team not found or you don't have permission to view it.
          </Box>
        )
      ) : (
        <TeamList userRole={userRole} />
      )}
    </Container>
  );
};

export default TeamsPage; 