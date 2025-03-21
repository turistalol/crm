import React from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  StatHelpText,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Team } from '../../types/team';

// Interface for team metric data
export interface TeamMetrics {
  id: string | number;
  name: string;
  leadsGenerated: number;
  leadsGeneratedChange: number;
  conversionRate: number;
  conversionRateChange: number;
  dealsValue: number;
  dealsValueChange: number;
}

interface TeamPerformanceMetricsProps {
  team: Team;
  metrics: TeamMetrics;
}

// Component that displays detailed performance metrics for a team
const TeamPerformanceMetrics: React.FC<TeamPerformanceMetricsProps> = ({ team, metrics }) => {
  return (
    <Card>
      <CardHeader pb={2}>
        <Heading size="md">{team.name} Performance</Heading>
        <Text fontSize="sm" color="gray.600">
          {team.description || 'Team performance metrics'}
        </Text>
      </CardHeader>
      <CardBody pt={2}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Stat>
            <StatLabel>Leads Generated</StatLabel>
            <StatNumber>{metrics.leadsGenerated}</StatNumber>
            <StatHelpText>
              <StatArrow type={metrics.leadsGeneratedChange >= 0 ? 'increase' : 'decrease'} />
              {Math.abs(metrics.leadsGeneratedChange)}% from last month
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Conversion Rate</StatLabel>
            <StatNumber>{metrics.conversionRate}%</StatNumber>
            <StatHelpText>
              <StatArrow type={metrics.conversionRateChange >= 0 ? 'increase' : 'decrease'} />
              {Math.abs(metrics.conversionRateChange)}% from last month
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Deals Value</StatLabel>
            <StatNumber>${metrics.dealsValue.toLocaleString()}</StatNumber>
            <StatHelpText>
              <StatArrow type={metrics.dealsValueChange >= 0 ? 'increase' : 'decrease'} />
              {Math.abs(metrics.dealsValueChange)}% from last month
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};

// Component that shows a summary of metrics for all teams
export const TeamMetricsSummary: React.FC<{ teams: Team[]; metrics: TeamMetrics[] }> = ({ teams, metrics }) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Team Performance Overview</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {metrics.map((metric) => {
          const team = teams.find(t => t.name === metric.name);
          if (!team) return null;
          
          return (
            <Card key={metric.id} variant="outline">
              <CardHeader pb={2}>
                <Heading size="sm">{metric.name}</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="start" spacing={1}>
                  <HStack justify="space-between" width="full">
                    <Text fontSize="sm">Leads Generated:</Text>
                    <Text fontWeight="bold">{metric.leadsGenerated}</Text>
                  </HStack>
                  <HStack justify="space-between" width="full">
                    <Text fontSize="sm">Conversion Rate:</Text>
                    <Text fontWeight="bold">{metric.conversionRate}%</Text>
                  </HStack>
                  <HStack justify="space-between" width="full">
                    <Text fontSize="sm">Deals Value:</Text>
                    <Text fontWeight="bold">${metric.dealsValue.toLocaleString()}</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
};

export default TeamPerformanceMetrics; 