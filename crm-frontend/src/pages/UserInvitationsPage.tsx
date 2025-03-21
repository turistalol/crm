import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  useToast,
  Flex,
  Spinner,
  Text,
  HStack
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { 
  TeamInvitation,
  TeamRole,
  InvitationStatus
} from '../types/team';
import { getUserInvitations, acceptInvitation, rejectInvitation } from '../services/teamService';

const UserInvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const toast = useToast();

  useEffect(() => {
    fetchUserInvitations();
  }, []);

  const fetchUserInvitations = async () => {
    try {
      setLoading(true);
      const data = await getUserInvitations();
      setInvitations(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your invitations',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    setProcessingIds({ ...processingIds, [invitationId]: true });
    try {
      await acceptInvitation(invitationId);
      setInvitations(invitations.map(invite => 
        invite.id === invitationId 
          ? { ...invite, status: InvitationStatus.ACCEPTED } 
          : invite
      ));
      toast({
        title: 'Invitation accepted',
        description: 'You have successfully joined the team',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept invitation',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error accepting invitation:', error);
    } finally {
      setProcessingIds({ ...processingIds, [invitationId]: false });
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    setProcessingIds({ ...processingIds, [invitationId]: true });
    try {
      await rejectInvitation(invitationId);
      setInvitations(invitations.map(invite => 
        invite.id === invitationId 
          ? { ...invite, status: InvitationStatus.REJECTED } 
          : invite
      ));
      toast({
        title: 'Invitation rejected',
        description: 'You have declined the team invitation',
        status: 'info',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject invitation',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error rejecting invitation:', error);
    } finally {
      setProcessingIds({ ...processingIds, [invitationId]: false });
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

  const pendingInvitations = invitations.filter(
    invite => invite.status === InvitationStatus.PENDING
  );

  const otherInvitations = invitations.filter(
    invite => invite.status !== InvitationStatus.PENDING
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Breadcrumb separator={<ChevronRightIcon color="gray.500" />} mb={4}>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Invitations</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Heading size="lg" mb={2}>
          Team Invitations
        </Heading>
      </Box>

      <Divider mb={6} />

      {loading ? (
        <Flex justify="center" my={10}>
          <Spinner size="xl" />
        </Flex>
      ) : invitations.length === 0 ? (
        <Box textAlign="center" p={10} bg="gray.50" borderRadius="md">
          <Text>You don't have any team invitations at the moment.</Text>
        </Box>
      ) : (
        <Box>
          {pendingInvitations.length > 0 && (
            <Box mb={8}>
              <Heading size="md" mb={4}>Pending Invitations</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Team</Th>
                    <Th>Role</Th>
                    <Th>Expires</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingInvitations.map((invitation) => (
                    <Tr key={invitation.id}>
                      <Td fontWeight="medium">{invitation.team?.name || 'Unknown Team'}</Td>
                      <Td>
                        <Badge colorScheme={invitation.role === TeamRole.LEADER ? 'purple' : 'blue'}>
                          {invitation.role === TeamRole.LEADER ? 'Team Leader' : 'Team Member'}
                        </Badge>
                      </Td>
                      <Td>{formatDate(invitation.expiresAt)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<CheckIcon />}
                            isLoading={processingIds[invitation.id]}
                            onClick={() => handleAcceptInvitation(invitation.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<CloseIcon />}
                            isLoading={processingIds[invitation.id]}
                            onClick={() => handleRejectInvitation(invitation.id)}
                          >
                            Decline
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {otherInvitations.length > 0 && (
            <Box>
              <Heading size="md" mb={4}>Previous Invitations</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Team</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {otherInvitations.map((invitation) => (
                    <Tr key={invitation.id}>
                      <Td>{invitation.team?.name || 'Unknown Team'}</Td>
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
                      <Td>{formatDate(invitation.updatedAt)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default UserInvitationsPage; 