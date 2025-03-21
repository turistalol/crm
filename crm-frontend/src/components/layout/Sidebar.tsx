import React, { useState, useEffect } from 'react';
import { Box, Stack, Text, Link, useColorMode, Flex, Badge } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { getUserInvitations } from '../../services/teamService';
import { InvitationStatus } from '../../types/team';

const NavItem = ({ to, children, badge }: { to: string; children: React.ReactNode; badge?: number }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const { colorMode } = useColorMode();

  return (
    <Link
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        px={3}
        py={2}
        borderRadius="md"
        bg={isActive ? (colorMode === 'light' ? 'blue.500' : 'blue.200') : 'transparent'}
        color={isActive ? (colorMode === 'light' ? 'white' : 'gray.800') : 'inherit'}
        _hover={{
          bg: colorMode === 'light' ? 'blue.100' : 'blue.700',
          color: colorMode === 'light' ? 'blue.500' : 'blue.200',
        }}
        align="center"
        justify="space-between"
      >
        <Text fontWeight={isActive ? 'bold' : 'normal'}>{children}</Text>
        {badge && badge > 0 && (
          <Badge 
            colorScheme="red" 
            borderRadius="full" 
            px={2}
            fontSize="xs"
          >
            {badge}
          </Badge>
        )}
      </Flex>
    </Link>
  );
};

const Sidebar = () => {
  const { colorMode } = useColorMode();
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const [hasLoggedError, setHasLoggedError] = useState(false);

  // Fetch pending invitations count
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const invitations = await getUserInvitations();
        const pending = invitations.filter(inv => inv.status === InvitationStatus.PENDING).length;
        setPendingInvitations(pending);
        if (hasLoggedError) setHasLoggedError(false); // Reset if successful after an error
      } catch (error) {
        // Only log network errors once to avoid console spam
        if (error.code === 'ERR_NETWORK' && !hasLoggedError) {
          console.warn('Network error when fetching invitations - using fallback data in development');
          setHasLoggedError(true);
        } else if (error.code !== 'ERR_NETWORK') {
          console.error('Error fetching invitations:', error);
        }
      }
    };

    fetchInvitations();
    
    // Set up interval to check for new invitations every minute
    const intervalId = setInterval(fetchInvitations, 60000);
    
    return () => clearInterval(intervalId);
  }, [hasLoggedError]);

  return (
    <Box
      as="nav"
      pos="sticky"
      top="0"
      w="240px"
      h="calc(100vh - 64px)"
      overflow="auto"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      borderRight="1px"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      pt={5}
    >
      <Stack spacing={1} px={2}>
        <NavItem to="/dashboard">Dashboard</NavItem>
        <NavItem to="/teams">Teams</NavItem>
        <NavItem to="/invitations" badge={pendingInvitations}>Invitations</NavItem>
        <NavItem to="/leads">Leads</NavItem>
        <NavItem to="/pipeline">Pipeline</NavItem>
        <NavItem to="/contacts">Contacts</NavItem>
        <NavItem to="/chats">Chats</NavItem>
        <NavItem to="/reports">Reports</NavItem>
        <NavItem to="/settings">Settings</NavItem>
      </Stack>
    </Box>
  );
};

export default Sidebar; 