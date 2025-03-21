import React, { useState, useEffect } from 'react';
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
  Select,
  Text,
  HStack
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons';
import { 
  Team, 
  TeamInvitation, 
  InvitationStatus, 
  TeamRole, 
  CreateTeamInvitationDto 
} from '../../types/team';
import { Role } from '../../types/user';
import { 
  getTeamInvitations, 
  inviteToTeam, 
  cancelInvitation, 
  resendInvitation 
} from '../../services/teamService';

interface TeamInvitationListProps {
  team: Team;
  userRole: Role;
  onTeamUpdated: () => void;
}

const TeamInvitationList: React.FC<TeamInvitationListProps> = ({ team, userRole, onTeamUpdated }) => {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newInvitation, setNewInvitation] = useState<CreateTeamInvitationDto>({
    email: '',
    role: TeamRole.MEMBER
  });
  const toast = useToast();

  const isAdmin = userRole === Role.ADMIN;
  const isManager = userRole === Role.MANAGER;
  const canManageInvitations = isAdmin || isManager;

  useEffect(() => {
    fetchInvitations();
  }, [team.id]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await getTeamInvitations(team.id);
      setInvitations(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!newInvitation.email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const createdInvitation = await inviteToTeam(team.id, newInvitation);
      setInvitations([...invitations, createdInvitation]);
      setNewInvitation({
        email: '',
        role: TeamRole.MEMBER
      });
      onClose();
      toast({
        title: 'Invitation sent',
        description: `Invitation has been sent to ${newInvitation.email}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      onTeamUpdated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error sending invitation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(team.id, invitationId);
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      toast({
        title: 'Invitation cancelled',
        description: 'The invitation has been cancelled',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      onTeamUpdated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error cancelling invitation:', error);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const updatedInvitation = await resendInvitation(team.id, invitationId);
      setInvitations(invitations.map(inv => inv.id === invitationId ? updatedInvitation : inv));
      toast({
        title: 'Invitation resent',
        description: 'The invitation has been resent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error resending invitation:', error);
    }
  };

  const getStatusColor = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.PENDING:
        return 'yellow';
      case InvitationStatus.ACCEPTED:
        return 'green';
      case InvitationStatus.REJECTED:
        return 'red';
      case InvitationStatus.EXPIRED:
        return 'gray';
      default:
        return 'blue';
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Box mt={8}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Invitations</Heading>
        {canManageInvitations && (
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            size="sm"
            onClick={onOpen}
          >
            Invite Member
          </Button>
        )}
      </Flex>

      {loading ? (
        <Text textAlign="center" p={4}>Loading invitations...</Text>
      ) : invitations.length === 0 ? (
        <Box textAlign="center" p={6} bg="gray.50" borderRadius="md">
          <Text>No pending invitations.</Text>
        </Box>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Sent</Th>
              <Th>Expires</Th>
              {canManageInvitations && <Th width="100px">Actions</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {invitations.map((invitation) => (
              <Tr key={invitation.id}>
                <Td>{invitation.email}</Td>
                <Td>
                  <Badge colorScheme={invitation.role === TeamRole.LEADER ? 'purple' : 'blue'}>
                    {invitation.role === TeamRole.LEADER ? 'Team Leader' : 'Team Member'}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={getStatusColor(invitation.status)}>
                    {invitation.status}
                  </Badge>
                </Td>
                <Td>{formatDate(invitation.createdAt)}</Td>
                <Td>{formatDate(invitation.expiresAt)}</Td>
                {canManageInvitations && (
                  <Td>
                    <HStack spacing={2}>
                      {invitation.status === InvitationStatus.PENDING && (
                        <>
                          <Tooltip label="Resend Invitation">
                            <IconButton
                              icon={<RepeatIcon />}
                              aria-label="Resend invitation"
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => handleResendInvitation(invitation.id)}
                            />
                          </Tooltip>
                          <Tooltip label="Cancel Invitation">
                            <IconButton
                              icon={<DeleteIcon />}
                              aria-label="Cancel invitation"
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleCancelInvitation(invitation.id)}
                            />
                          </Tooltip>
                        </>
                      )}
                    </HStack>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Invite Member Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite Team Member</ModalHeader>
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input
                value={newInvitation.email}
                onChange={(e) => setNewInvitation({...newInvitation, email: e.target.value})}
                placeholder="Enter email address"
                type="email"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select
                value={newInvitation.role}
                onChange={(e) => setNewInvitation({...newInvitation, role: e.target.value as TeamRole})}
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
              isLoading={isSubmitting}
              onClick={handleInvite}
            >
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TeamInvitationList; 