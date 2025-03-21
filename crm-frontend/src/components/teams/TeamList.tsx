import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  SimpleGrid, 
  useDisclosure, 
  useToast,
  Flex,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Stack,
  Badge,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Team } from '../../types/team';
import { Role } from '../../types/user';
import { getUserTeams, getCompanyTeams, deleteTeam } from '../../services/teamService';
import TeamFormModal from './TeamFormModal';

interface TeamListProps {
  userRole: Role;
}

const TeamList: React.FC<TeamListProps> = ({ userRole }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const isAdmin = userRole === Role.ADMIN;
  const isManager = userRole === Role.MANAGER;
  const canManageTeams = isAdmin || isManager;

  useEffect(() => {
    fetchTeams();
  }, [userRole]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const fetchedTeams = canManageTeams 
        ? await getCompanyTeams() 
        : await getUserTeams();
      setTeams(fetchedTeams);
    } catch (error) {
      toast({
        title: "Error fetching teams",
        description: "There was an error retrieving teams. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    onOpen();
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    onOpen();
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      setTeams(teams.filter(team => team.id !== teamId));
      toast({
        title: "Team deleted",
        description: "The team has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting team",
        description: "There was an error deleting the team. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error deleting team:", error);
    }
  };

  const handleTeamSaved = (savedTeam: Team) => {
    if (selectedTeam) {
      // Update existing team
      setTeams(teams.map(t => t.id === savedTeam.id ? savedTeam : t));
    } else {
      // Add new team
      setTeams([...teams, savedTeam]);
    }
    onClose();
  };

  return (
    <Box mb={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">{canManageTeams ? 'Company Teams' : 'My Teams'}</Heading>
        {canManageTeams && (
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            size="sm" 
            onClick={handleCreateTeam}
          >
            Create Team
          </Button>
        )}
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : teams.length === 0 ? (
        <Box textAlign="center" p={6} bg="gray.50" borderRadius="md">
          <Text>No teams found.</Text>
          {canManageTeams && (
            <Button mt={4} size="sm" colorScheme="blue" onClick={handleCreateTeam}>
              Create your first team
            </Button>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {teams.map((team) => (
            <Card key={team.id} variant="outline">
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <Heading size="sm">{team.name}</Heading>
                  {canManageTeams && (
                    <Flex>
                      <Tooltip label="Edit Team">
                        <IconButton
                          icon={<EditIcon />}
                          aria-label="Edit team"
                          size="sm"
                          variant="ghost"
                          mr={2}
                          onClick={() => handleEditTeam(team)}
                        />
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip label="Delete Team">
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Delete team"
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDeleteTeam(team.id)}
                          />
                        </Tooltip>
                      )}
                    </Flex>
                  )}
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  {team.description || 'No description available'}
                </Text>
                <Stack direction="row" flexWrap="wrap">
                  <Badge colorScheme="blue" mb={1}>
                    {team.members?.length || 0} members
                  </Badge>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <TeamFormModal
        isOpen={isOpen}
        onClose={onClose}
        team={selectedTeam}
        onSave={handleTeamSaved}
      />
    </Box>
  );
};

export default TeamList; 