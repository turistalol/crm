import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Divider,
  List,
  ListItem,
  HStack,
  Avatar,
  VStack,
  Badge,
  Button,
  Skeleton,
  Progress,
  Flex,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from '@chakra-ui/react';
import { FiUser, FiPhone, FiInbox, FiDollarSign, FiActivity, FiUsers, FiBarChart2 } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { getUserTeams } from '../services/teamService';
import { 
  generateMockTeamMetrics,
  generateMockTeamActivities
} from '../services/teamMetricsService';
import { Team, TeamMember } from '../types/team';
import TeamPerformanceMetrics, { TeamMetrics, TeamMetricsSummary } from '../components/dashboard/TeamPerformanceMetrics';
import TeamActivityFeed, { TeamActivity as TeamActivityType } from '../components/dashboard/TeamActivityFeed';

// Define interfaces for dashboard data types
interface DashboardStat {
  id: number;
  icon: any;
  label: string;
  value: string;
  change: number;
  isUp: boolean;
}

interface PipelineStage {
  id: number;
  name: string;
  count: number;
  percent: number;
}

// Mock data for the dashboard (to be replaced with real API calls)
const mockStats: DashboardStat[] = [
  { id: 1, icon: FiUser, label: 'Total Leads', value: '127', change: 5, isUp: true },
  { id: 2, icon: FiInbox, label: 'Conversion Rate', value: '24%', change: 2, isUp: true },
  { id: 3, icon: FiPhone, label: 'Active Chats', value: '18', change: 0, isUp: false },
  { id: 4, icon: FiDollarSign, label: 'Deals Closed', value: '8', change: 3, isUp: true },
];

const mockPipelineStages: PipelineStage[] = [
  { id: 1, name: 'New Leads', count: 24, percent: 25 },
  { id: 2, name: 'Qualification', count: 36, percent: 40 },
  { id: 3, name: 'Proposal', count: 18, percent: 20 },
  { id: 4, name: 'Negotiation', count: 12, percent: 10 },
  { id: 5, name: 'Closed Won', count: 7, percent: 5 },
];

// Mock teams data
const mockTeams = [
  { id: '1', name: 'Team Alpha', description: 'Sales team focusing on enterprise clients' },
  { id: '2', name: 'Team Beta', description: 'Customer support and success team' },
  { id: '3', name: 'Team Gamma', description: 'Marketing and lead generation team' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [activities, setActivities] = useState<TeamActivityType[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamMetrics, setTeamMetrics] = useState<{[key: string]: TeamMetrics}>({});
  const [teamActivities, setTeamActivities] = useState<{[key: string]: TeamActivityType[]}>({});
  const [allTeamMetrics, setAllTeamMetrics] = useState<TeamMetrics[]>([]);

  // Simulating data loading for general dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      // In a real app, these would be API calls
      // await api.get('/stats')
      // await api.get('/activities')
      // await api.get('/pipeline')
      
      // Simulate API delay
      setTimeout(() => {
        setStats(mockStats);
        setPipelineStages(mockPipelineStages);
        setIsLoading(false);
      }, 1000);
    };
    
    loadDashboardData();
  }, []);

  // Load team data using the team service
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setTeamsLoading(true);
        
        // Get user teams
        const userTeams = await getUserTeams();
        
        // Always use mock data in development regardless of API response
        // This ensures we have data to display even when the backend is down
        if (import.meta.env.DEV) {
          console.info('Using mock data for development dashboard');
          const mockTeamsData = [
            { id: '1', name: 'Team Alpha', description: 'Sales team focusing on enterprise clients' },
            { id: '2', name: 'Team Beta', description: 'Customer support and success team' },
            { id: '3', name: 'Team Gamma', description: 'Marketing and lead generation team' },
          ] as unknown as Team[];
          
          setTeams(mockTeamsData);
          
          // Generate mock metrics for each team
          const metricsObj: {[key: string]: TeamMetrics} = {};
          const allMetrics: TeamMetrics[] = [];
          mockTeamsData.forEach(team => {
            const metrics = generateMockTeamMetrics(team.id, team.name);
            metricsObj[team.id] = metrics;
            allMetrics.push(metrics);
          });
          setTeamMetrics(metricsObj);
          setAllTeamMetrics(allMetrics);
          
          // Generate mock activities for each team
          const activitiesObj: {[key: string]: TeamActivityType[]} = {};
          let allActivities: TeamActivityType[] = [];
          mockTeamsData.forEach(team => {
            const teamActivities = generateMockTeamActivities(team.id, team.name, 5);
            activitiesObj[team.id] = teamActivities;
            allActivities = [...allActivities, ...teamActivities];
          });
          setTeamActivities(activitiesObj);
          setActivities(allActivities);
          
          setTeamsLoading(false);
          return;
        }
        
        // For production:
        setTeams(userTeams);
        
        // If no teams yet, use mock data for development
        if (userTeams.length === 0) {
          // This is just for development; in production we'd show "no teams" message
          setTeams(mockTeams as unknown as Team[]);
          
          // Generate mock metrics for each team
          const metricsObj: {[key: string]: TeamMetrics} = {};
          const allMetrics: TeamMetrics[] = [];
          mockTeams.forEach(team => {
            const metrics = generateMockTeamMetrics(team.id, team.name);
            metricsObj[team.id] = metrics;
            allMetrics.push(metrics);
          });
          setTeamMetrics(metricsObj);
          setAllTeamMetrics(allMetrics);
          
          // Generate mock activities for each team
          const activitiesObj: {[key: string]: TeamActivityType[]} = {};
          let allActivities: TeamActivityType[] = [];
          mockTeams.forEach(team => {
            const teamActivities = generateMockTeamActivities(team.id, team.name, 5);
            activitiesObj[team.id] = teamActivities;
            allActivities = [...allActivities, ...teamActivities];
          });
          setTeamActivities(activitiesObj);
          setActivities(allActivities);
          
          return;
        }
        
        // Get metrics for each team
        const metricsObj: {[key: string]: TeamMetrics} = {};
        const metricPromises = userTeams.map(async team => {
          try {
            // In a real app, this would fetch from API
            // const metrics = await getTeamMetrics(team.id);
            
            // For development, generate mock metrics
            const metrics = generateMockTeamMetrics(team.id, team.name);
            metricsObj[team.id] = metrics;
            return metrics;
          } catch (err) {
            console.error(`Error fetching metrics for team ${team.id}:`, err);
            return null;
          }
        });
        
        const allMetricsResults = await Promise.all(metricPromises);
        const validMetrics = allMetricsResults.filter(Boolean) as TeamMetrics[];
        setTeamMetrics(metricsObj);
        setAllTeamMetrics(validMetrics);
        
        // Get activities for each team
        const activitiesObj: {[key: string]: TeamActivityType[]} = {};
        let allActivities: TeamActivityType[] = [];
        
        for (const team of userTeams) {
          try {
            // In a real app, this would fetch from API
            // const activities = await getTeamActivities(team.id);
            
            // For development, generate mock activities
            const teamActivities = generateMockTeamActivities(team.id, team.name, 5);
            activitiesObj[team.id] = teamActivities;
            allActivities = [...allActivities, ...teamActivities];
          } catch (err) {
            console.error(`Error fetching activities for team ${team.id}:`, err);
          }
        }
        
        setTeamActivities(activitiesObj);
        setActivities(allActivities);
        
      } catch (error) {
        // Handle network errors differently in development mode
        if (error.code === 'ERR_NETWORK' && import.meta.env.DEV) {
          console.warn('Network error loading team data - using mock data for development');
          
          // Use mock teams data
          setTeams(mockTeams as unknown as Team[]);
          
          // Generate mock metrics for each team
          const metricsObj: {[key: string]: TeamMetrics} = {};
          const allMetrics: TeamMetrics[] = [];
          mockTeams.forEach(team => {
            const metrics = generateMockTeamMetrics(team.id, team.name);
            metricsObj[team.id] = metrics;
            allMetrics.push(metrics);
          });
          setTeamMetrics(metricsObj);
          setAllTeamMetrics(allMetrics);
          
          // Generate mock activities for each team
          const activitiesObj: {[key: string]: TeamActivityType[]} = {};
          let allActivities: TeamActivityType[] = [];
          mockTeams.forEach(team => {
            const teamActivities = generateMockTeamActivities(team.id, team.name, 5);
            activitiesObj[team.id] = teamActivities;
            allActivities = [...allActivities, ...teamActivities];
          });
          setTeamActivities(activitiesObj);
          setActivities(allActivities);
        } else {
          console.error('Error loading team data:', error);
          toast({
            title: 'Error loading team data',
            description: 'There was an error loading your team information.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        setTeamsLoading(false);
      }
    };
    
    loadTeamData();
  }, [toast]);

  return (
    <Layout>
      <Box p={4}>
        <HStack justify="space-between" mb={6}>
          <Heading as="h1" size="lg">
            Dashboard
          </Heading>
          <Text>Welcome back, {user?.firstName || 'User'}</Text>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
          {isLoading ? (
            // Skeleton loaders
            Array(4).fill(0).map((_, index) => (
              <Card key={index}>
                <CardHeader pb={0}>
                  <Skeleton height="20px" width="120px" />
                </CardHeader>
                <CardBody pt={2}>
                  <Skeleton height="36px" width="80px" mb={2} />
                  <Skeleton height="16px" width="100px" />
                </CardBody>
              </Card>
            ))
          ) : (
            // Actual stats
            stats.map(stat => (
              <Card key={stat.id}>
                <CardHeader pb={0} display="flex" alignItems="center">
                  <Icon as={stat.icon} mr={2} boxSize={5} />
                  <Stat>
                    <StatLabel>{stat.label}</StatLabel>
                  </Stat>
                </CardHeader>
                <CardBody pt={2}>
                  <Stat>
                    <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                    <StatHelpText>
                      <StatArrow type={stat.isUp ? 'increase' : 'decrease'} />
                      {stat.change}% {stat.isUp ? 'from last week' : 'since yesterday'}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            ))
          )}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
          {/* Recent Activity Feed */}
          <Box>
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton height="24px" width="200px" />
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {Array(4).fill(0).map((_, i) => (
                      <HStack key={i}>
                        <Skeleton height="40px" width="40px" borderRadius="full" />
                        <VStack align="start" flex={1} spacing={1}>
                          <Skeleton height="20px" width="80%" />
                          <Skeleton height="16px" width="40%" />
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <TeamActivityFeed
                activities={activities}
                title="Recent Activities"
                showTeamName={true}
                limit={5}
                onViewAll={() => {
                  // This would navigate to a full activity view in a real app
                  console.log("View all activities clicked");
                }}
              />
            )}
          </Box>

          {/* Pipeline Progress */}
          <Card>
            <CardHeader>
              <Heading size="md">Pipeline Progress</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              {isLoading ? (
                // Skeleton loaders for pipeline
                Array(5).fill(0).map((_, index) => (
                  <VStack key={index} align="start" py={2}>
                    <HStack width="full" justify="space-between">
                      <Skeleton height="20px" width="120px" />
                      <Skeleton height="20px" width="40px" />
                    </HStack>
                    <Skeleton height="16px" width="full" />
                  </VStack>
                ))
              ) : pipelineStages.length === 0 ? (
                <Text>Pipeline visualization will be displayed here.</Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {pipelineStages.map(stage => (
                    <Box key={stage.id}>
                      <Flex justify="space-between" mb={1}>
                        <Text fontWeight="medium">{stage.name}</Text>
                        <HStack>
                          <Badge colorScheme="blue">{stage.count}</Badge>
                          <Text fontSize="sm">{stage.percent}%</Text>
                        </HStack>
                      </Flex>
                      <Progress value={stage.percent} size="sm" colorScheme="blue" borderRadius="full" />
                    </Box>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Team Performance and Activity Section */}
        <Card mb={8}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Team Insights</Heading>
              <Icon as={FiUsers} boxSize={5} />
            </HStack>
          </CardHeader>
          <Divider />
          <CardBody>
            {teamsLoading ? (
              // Skeleton loaders for team insights
              <VStack spacing={4} align="stretch">
                <Skeleton height="40px" width="full" />
                <Skeleton height="200px" width="full" />
              </VStack>
            ) : teams.length === 0 ? (
              <Text>You don't have any teams yet. Create a team to see insights here.</Text>
            ) : (
              <Tabs variant="enclosed">
                <TabList>
                  {teams.map(team => (
                    <Tab key={team.id}>{team.name}</Tab>
                  ))}
                  <Tab>All Teams</Tab>
                </TabList>
                <TabPanels>
                  {teams.map(team => (
                    <TabPanel key={team.id}>
                      <VStack align="stretch" spacing={6}>
                        {teamMetrics[team.id] && (
                          <TeamPerformanceMetrics 
                            team={team} 
                            metrics={teamMetrics[team.id]} 
                          />
                        )}
                        
                        <Heading size="sm">Recent Team Activities</Heading>
                        
                        {teamActivities[team.id] && teamActivities[team.id].length > 0 ? (
                          <List spacing={3}>
                            {teamActivities[team.id].slice(0, 5).map(activity => (
                              <ListItem key={activity.id}>
                                <HStack>
                                  <Avatar 
                                    size="sm" 
                                    src={activity.avatar} 
                                    name={activity.userName} 
                                  />
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium">
                                      {activity.userName} {activity.action} {activity.target && (
                                        <Text as="span" fontWeight="bold">{activity.target}</Text>
                                      )}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">{activity.timeAgo}</Text>
                                  </VStack>
                                </HStack>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Text>No recent activities for this team.</Text>
                        )}
                      </VStack>
                    </TabPanel>
                  ))}
                  <TabPanel>
                    <VStack align="stretch" spacing={6}>
                      <TeamMetricsSummary
                        teams={teams}
                        metrics={allTeamMetrics}
                      />
                      
                      <Heading size="sm">Recent Activities Across All Teams</Heading>
                      {activities.length > 0 ? (
                        <List spacing={3}>
                          {activities.slice(0, 5).map(activity => (
                            <ListItem key={activity.id}>
                              <HStack>
                                <Avatar 
                                  size="sm" 
                                  src={activity.avatar} 
                                  name={activity.userName}
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">
                                    {activity.userName} {activity.action} {activity.target && (
                                      <Text as="span" fontWeight="bold">{activity.target}</Text>
                                    )}
                                  </Text>
                                  <HStack>
                                    <Badge colorScheme="blue">{activity.teamName}</Badge>
                                    <Text fontSize="sm" color="gray.600">{activity.timeAgo}</Text>
                                  </HStack>
                                </VStack>
                              </HStack>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Text>No recent activities to display.</Text>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </CardBody>
        </Card>
      </Box>
    </Layout>
  );
};

export default Dashboard; 