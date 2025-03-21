import React, { useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  IconButton,
  useToast,
  Select,
  Flex,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Text
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Team, TeamMember, TeamRole } from '../../types/team';
import { Role } from '../../types/user';
import { addTeamMember, removeTeamMember, updateTeamMemberRole } from '../../services/teamService';

interface TeamMemberListProps {
  team: Team;
  userRole: Role;
  onTeamUpdated: () => void;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({ team, userRole, onTeamUpdated }) => {
  const [selectedRole, setSelectedRole] = useState<Record<string, TeamRole>>({});
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamRole>(TeamRole.MEMBER);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const toast = useToast();

  const isAdmin = userRole === Role.ADMIN;
  const isManager = userRole === Role.MANAGER;
  const canManageMembers = isAdmin || isManager;

  const handleRoleChange = async (memberId: string, userId: string, newRole: TeamRole) => {
    setSelectedRole({ ...selectedRole, [memberId]: newRole });
    
    setIsUpdating({ ...isUpdating, [memberId]: true });
    try {
      await updateTeamMemberRole(team.id, userId, newRole);
      toast({
        title: 'Role updated',
        description: 'Team member role has been updated',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      onTeamUpdated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update team member role',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error updating role:', error);
    } finally {
      setIsUpdating({ ...isUpdating, [memberId]: false });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeTeamMember(team.id, userId);
      toast({
        title: 'Member removed',
        description: 'Team member has been removed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      onTeamUpdated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error removing member:', error);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsAddingMember(true);
    try {
      // In a real app, you would search for a user by email first
      // For now, we'll assume there's a user ID, which would be determined by the backend
      // This is just a frontend prototype
      await addTeamMember(team.id, {
        userId: 'dummy-user-id', // This would be the actual user ID in a real implementation
        role: newMemberRole
      });
      toast({
        title: 'Member added',
        description: 'Team member has been added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      setNewMemberEmail('');
      onClose();
      onTeamUpdated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add team member. Please verify the email address.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error adding member:', error);
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
    <Box mt={8}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Team Members</Heading>
        {canManageMembers && (
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            size="sm"
            onClick={onOpen}
          >
            Add Member
          </Button>
        )}
      </Flex>

      {!team.members || team.members.length === 0 ? (
        <Box textAlign="center" p={6} bg="gray.50" borderRadius="md">
          <Text>No members in this team.</Text>
        </Box>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              {canManageMembers && <Th width="80px">Actions</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {team.members.map((member) => (
              <Tr key={member.id}>
                <Td>
                  {member.user?.firstName} {member.user?.lastName}
                </Td>
                <Td>{member.user?.email}</Td>
                <Td>
                  {isAdmin ? (
                    <Select
                      size="sm"
                      width="140px"
                      value={selectedRole[member.id] || member.role}
                      onChange={(e) => handleRoleChange(member.id, member.userId, e.target.value as TeamRole)}
                      isDisabled={isUpdating[member.id]}
                    >
                      <option value={TeamRole.LEADER}>Team Leader</option>
                      <option value={TeamRole.MEMBER}>Team Member</option>
                    </Select>
                  ) : (
                    <Badge colorScheme={member.role === TeamRole.LEADER ? 'purple' : 'blue'}>
                      {member.role === TeamRole.LEADER ? 'Team Leader' : 'Team Member'}
                    </Badge>
                  )}
                </Td>
                {canManageMembers && (
                  <Td>
                    <Tooltip label="Remove Member">
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Remove member"
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleRemoveMember(member.userId)}
                      />
                    </Tooltip>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Add Member Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Team Member</ModalHeader>
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Email Address</FormLabel>
              <Input
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Enter user email"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as TeamRole)}
              >
                <option value={TeamRole.LEADER}>Team Leader</option>
                <option value={TeamRole.MEMBER}>Team Member</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAddMember}
              isLoading={isAddingMember}
            >
              Add Member
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TeamMemberList; 