import React from 'react';
import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaUsers, FaPercentage, FaComments, FaMoneyBillWave } from 'react-icons/fa';

// Mock data for the stats
const stats = [
  { 
    id: 1, 
    label: 'Total Leads', 
    value: '127', 
    change: 5, 
    icon: FaUsers,
    color: 'blue.500' 
  },
  { 
    id: 2, 
    label: 'Conversion Rate', 
    value: '24%', 
    change: 2, 
    icon: FaPercentage,
    color: 'green.500'
  },
  { 
    id: 3, 
    label: 'Active Chats', 
    value: '18', 
    change: 0, 
    icon: FaComments,
    color: 'purple.500'
  },
  { 
    id: 4, 
    label: 'Deals Closed', 
    value: '8', 
    change: 3, 
    icon: FaMoneyBillWave,
    color: 'orange.500'
  },
];

const StatsOverview = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} width="100%">
      {stats.map(stat => (
        <Card key={stat.id} boxShadow="sm" borderRadius="lg" overflow="hidden">
          <CardBody>
            <Flex justifyContent="space-between" alignItems="center">
              <Stat>
                <StatLabel color={textColor} fontWeight="medium">{stat.label}</StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" mt={1}>{stat.value}</StatNumber>
                <StatHelpText mb={0}>
                  {stat.change !== 0 && (
                    <StatArrow type={stat.change > 0 ? 'increase' : 'decrease'} />
                  )}
                  {stat.change > 0 && `+${stat.change}%`}
                  {stat.change === 0 && 'No change'}
                  {stat.change < 0 && `${stat.change}%`}
                  {' from last week'}
                </StatHelpText>
              </Stat>
              <Flex
                w="60px"
                h="60px"
                alignItems="center"
                justifyContent="center"
                borderRadius="lg"
                bg={stat.color}
                color="white"
              >
                <Icon as={stat.icon} boxSize={6} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default StatsOverview; 