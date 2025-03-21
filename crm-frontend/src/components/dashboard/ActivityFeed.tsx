import React from 'react';
import {
  Box,
  VStack,
  Text,
  HStack,
  Circle,
  Divider,
  Badge,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaUser, FaPhoneAlt, FaEnvelope, FaTasks } from 'react-icons/fa';

// Mock activity data
const activities = [
  { 
    id: 1, 
    type: 'new_lead', 
    content: 'New lead added: John Doe', 
    time: '10 minutes ago',
    icon: FaUser,
    color: 'blue.500' 
  },
  { 
    id: 2, 
    type: 'call', 
    content: 'Call scheduled with Sarah Johnson', 
    time: '1 hour ago',
    icon: FaPhoneAlt,
    color: 'green.500'
  },
  { 
    id: 3, 
    type: 'email', 
    content: 'Email sent to David Williams', 
    time: '3 hours ago',
    icon: FaEnvelope,
    color: 'purple.500'
  },
  { 
    id: 4, 
    type: 'task', 
    content: 'Task completed: Follow up with existing clients', 
    time: 'Yesterday',
    icon: FaTasks,
    color: 'orange.500'
  },
];

const ActivityItem = ({ activity }: { activity: typeof activities[0] }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box width="100%">
      <HStack spacing={3} p={3} borderRadius="md" bg={bgColor} _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}>
        <Circle size="40px" bg={activity.color} color="white">
          <Icon as={activity.icon} />
        </Circle>
        <Box flex="1">
          <Text fontSize="sm" fontWeight="medium">{activity.content}</Text>
          <Text fontSize="xs" color="gray.500">{activity.time}</Text>
        </Box>
        <Badge colorScheme={activity.color.split('.')[0]} fontSize="xs">
          {activity.type.replace('_', ' ')}
        </Badge>
      </HStack>
    </Box>
  );
};

const ActivityFeed = () => {
  return (
    <VStack spacing={3} align="stretch" width="100%">
      {activities.map((activity, index) => (
        <React.Fragment key={activity.id}>
          <ActivityItem activity={activity} />
          {index < activities.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </VStack>
  );
};

export default ActivityFeed; 