import React from 'react';
import {
  SimpleGrid,
  Box,
  Button,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FaUserPlus, 
  FaPhoneAlt, 
  FaCalendarPlus, 
  FaFileInvoiceDollar,
  FaEnvelope,
  FaChartLine
} from 'react-icons/fa';

const actions = [
  {
    id: 1,
    label: 'Add Lead',
    icon: FaUserPlus,
    color: 'blue.500',
    onClick: () => console.log('Add lead clicked'),
  },
  {
    id: 2,
    label: 'Schedule Call',
    icon: FaPhoneAlt,
    color: 'green.500',
    onClick: () => console.log('Schedule call clicked'),
  },
  {
    id: 3,
    label: 'New Meeting',
    icon: FaCalendarPlus,
    color: 'purple.500',
    onClick: () => console.log('New meeting clicked'),
  },
  {
    id: 4,
    label: 'Create Quote',
    icon: FaFileInvoiceDollar,
    color: 'orange.500',
    onClick: () => console.log('Create quote clicked'),
  },
  {
    id: 5,
    label: 'Send Email',
    icon: FaEnvelope,
    color: 'teal.500',
    onClick: () => console.log('Send email clicked'),
  },
  {
    id: 6,
    label: 'View Reports',
    icon: FaChartLine,
    color: 'pink.500',
    onClick: () => console.log('View reports clicked'),
  },
];

const QuickActions = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.600');

  return (
    <Box width="100%">
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
        {actions.map(action => (
          <Button
            key={action.id}
            onClick={action.onClick}
            height="auto"
            py={6}
            borderRadius="lg"
            variant="outline"
            color={action.color}
            borderColor={`${action.color}30`}
            bg={bgColor}
            _hover={{ bg: hoverBgColor }}
            transition="all 0.2s"
          >
            <VStack spacing={2}>
              <Icon as={action.icon} boxSize={6} />
              <Text fontSize="sm" fontWeight="medium">{action.label}</Text>
            </VStack>
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default QuickActions; 