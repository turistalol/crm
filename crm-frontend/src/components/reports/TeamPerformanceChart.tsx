import React from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TeamPerformanceMetrics } from '../../types/api';

interface TeamPerformanceChartProps {
  metrics: TeamPerformanceMetrics | null;
  isLoading: boolean;
  error: Error | null;
  title?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#7D3C98', '#2471A3', '#26A69A'];

const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({
  metrics,
  isLoading,
  error,
  title = 'Team Performance',
}) => {
  const [chartType, setChartType] = React.useState<'bar' | 'pie'>('bar');
  const [dataView, setDataView] = React.useState<'leads' | 'value'>('leads');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="300px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justifyContent="center" alignItems="center" h="300px">
        <Text color="red.500">Error loading team metrics: {error.message}</Text>
      </Flex>
    );
  }

  if (!metrics || !metrics.memberPerformance.length) {
    return (
      <Flex justifyContent="center" alignItems="center" h="300px">
        <Text>No team performance data available.</Text>
      </Flex>
    );
  }

  // Prepare data for chart
  const chartData = metrics.memberPerformance.map((member) => ({
    name: member.memberName,
    leads: member.leadsCount,
    won: member.dealsWon,
    value: member.totalValue,
  }));

  const handleChartTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChartType(e.target.value as 'bar' | 'pie');
  };

  const handleDataViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDataView(e.target.value as 'leads' | 'value');
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      p={4} 
      bg={bgColor} 
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">{title}</Heading>
        <Flex>
          <Select 
            size="sm" 
            width="120px" 
            value={dataView} 
            onChange={handleDataViewChange}
            mr={2}
          >
            <option value="leads">Leads</option>
            <option value="value">Deal Value</option>
          </Select>
          <Select 
            size="sm" 
            width="120px" 
            value={chartType} 
            onChange={handleChartTypeChange}
          >
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </Select>
        </Flex>
      </Flex>

      <Flex direction="column" mb={4}>
        <Flex justify="space-between">
          <Box>
            <Text fontSize="sm" color="gray.500">Total Leads</Text>
            <Text fontSize="xl" fontWeight="bold">{metrics.totalLeads}</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500">Total Value</Text>
            <Text fontSize="xl" fontWeight="bold">${metrics.totalValue.toFixed(2)}</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500">Deals Won</Text>
            <Text fontSize="xl" fontWeight="bold">{metrics.dealsWon}</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500">Conversion Rate</Text>
            <Text fontSize="xl" fontWeight="bold">{metrics.conversionRate.toFixed(1)}%</Text>
          </Box>
        </Flex>
      </Flex>

      <Box height="300px">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataView === 'leads' ? (
                <>
                  <Bar dataKey="leads" name="Total Leads" fill="#8884d8" />
                  <Bar dataKey="won" name="Deals Won" fill="#82ca9d" />
                </>
              ) : (
                <Bar dataKey="value" name="Deal Value ($)" fill="#8884d8" />
              )}
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataView === 'leads' ? 'leads' : 'value'}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => dataView === 'value' ? `$${value}` : value} />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default TeamPerformanceChart; 