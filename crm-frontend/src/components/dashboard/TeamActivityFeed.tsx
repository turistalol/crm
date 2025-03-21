import React from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  List,
  ListItem,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Team } from '../../types/team';

// Interface for activity data
export interface TeamActivity {
  id: number | string;
  userId: string;
  userName: string;
  teamId: string;
  teamName: string;
  action: string;
  target?: string;
  timestamp: string;
  timeAgo: string;
  avatar?: string;
}

interface TeamActivityFeedProps {
  team?: Team;
  activities: TeamActivity[];
  title?: string;
  showTeamName?: boolean;
  limit?: number;
  onViewAll?: () => void;
}

const TeamActivityFeed: React.FC<TeamActivityFeedProps> = ({
  team,
  activities,
  title = 'Team Activities',
  showTeamName = false,
  limit = 5,
  onViewAll,
}) => {
  // Display only the specified number of activities
  const displayedActivities = limit ? activities.slice(0, limit) : activities;
  
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">{title}</Heading>
        </CardHeader>
        <CardBody>
          <Text>No recent activities{team ? ` for ${team.name}` : ''}.</Text>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader pb={2}>
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody>
        <List spacing={3}>
          {displayedActivities.map((activity) => (
            <ListItem key={activity.id}>
              <HStack>
                <Avatar 
                  size="sm" 
                  src={activity.avatar} 
                  name={activity.userName}
                />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">
                    {activity.userName} {activity.action} {activity.target && <b>{activity.target}</b>}
                  </Text>
                  <HStack>
                    {showTeamName && (
                      <Badge colorScheme="blue">{activity.teamName}</Badge>
                    )}
                    <Text fontSize="sm" color="gray.600">{activity.timeAgo}</Text>
                  </HStack>
                </VStack>
              </HStack>
            </ListItem>
          ))}
        </List>
        
        {activities.length > limit && onViewAll && (
          <Button size="sm" variant="outline" mt={4} width="full" onClick={onViewAll}>
            View All Activities
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default TeamActivityFeed; 