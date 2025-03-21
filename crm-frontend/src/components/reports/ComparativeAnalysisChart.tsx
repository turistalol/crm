import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
  Select,
  useColorModeValue,
  FormControl,
  FormLabel,
  HStack,
  Button,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { PipelineMetrics, TeamPerformanceMetrics } from '../../types/api';

// Chart colors
const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#9C27B0', '#673AB7'];

interface TimeSeriesDataPoint {
  date: string;
  newLeads: number;
  convertedLeads: number;
  totalValue: number;
}

interface ComparisonData {
  currentPeriod: TimeSeriesDataPoint[];
  previousPeriod: TimeSeriesDataPoint[];
}

interface ComparativeAnalysisChartProps {
  pipelineMetrics: PipelineMetrics | null;
  teamMetrics: TeamPerformanceMetrics | null;
  isLoading: boolean;
  error: Error | null;
  title?: string;
  onDateRangeChange: (range: { start: Date; end: Date; comparisonStart: Date; comparisonEnd: Date }) => void;
}

const ComparativeAnalysisChart: React.FC<ComparativeAnalysisChartProps> = ({
  pipelineMetrics,
  teamMetrics,
  isLoading,
  error,
  title = 'Comparative Performance Analysis',
  onDateRangeChange,
}) => {
  const [chartType, setChartType] = useState<'leads' | 'conversions' | 'value'>('leads');
  const [viewType, setViewType] = useState<'line' | 'area'>('line');
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  if (isLoading) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg={cardBg}>
        <Flex justify="center" align="center" direction="column" py={10}>
          <Spinner size="xl" color="blue.500" />
          <Text mt={4}>Loading chart data...</Text>
        </Flex>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg={cardBg}>
        <Heading size="md" mb={4}>{title}</Heading>
        <Text color="red.500">Error loading data: {error.message}</Text>
      </Box>
    );
  }

  // Sample merged data (in a real app, this would be calculated from actual metrics)
  const generateComparativeData = (): ComparisonData => {
    // This is sample data. In a production app, this would come from API
    const currentPeriod = pipelineMetrics?.timeSeriesData || [];
    
    // For demo purposes, creating previous period data by slightly modifying current data
    const previousPeriod = currentPeriod.map(point => ({
      ...point,
      date: point.date, // In real app, this would be adjusted to the previous period
      newLeads: Math.max(0, point.newLeads * (0.8 + Math.random() * 0.4)),
      convertedLeads: Math.max(0, point.convertedLeads * (0.7 + Math.random() * 0.5)),
      totalValue: Math.max(0, point.totalValue * (0.75 + Math.random() * 0.5))
    }));
    
    return { currentPeriod, previousPeriod };
  };

  const { currentPeriod, previousPeriod } = generateComparativeData();
  
  // Prepare data for the chart based on selected chart type
  const prepareDataForChart = () => {
    const mergedData = currentPeriod.map((current, index) => {
      const previous = previousPeriod[index] || { newLeads: 0, convertedLeads: 0, totalValue: 0 };
      return {
        date: current.date,
        [chartType === 'leads' ? 'Current Leads' : chartType === 'conversions' ? 'Current Conversions' : 'Current Value']: 
          chartType === 'leads' ? current.newLeads : 
          chartType === 'conversions' ? current.convertedLeads : current.totalValue,
        [chartType === 'leads' ? 'Previous Leads' : chartType === 'conversions' ? 'Previous Conversions' : 'Previous Value']: 
          chartType === 'leads' ? previous.newLeads : 
          chartType === 'conversions' ? previous.convertedLeads : previous.totalValue,
      };
    });
    
    return mergedData;
  };

  // Calculate performance change percentages
  const calculateChanges = () => {
    const currentTotals = currentPeriod.reduce(
      (acc, point) => ({
        leads: acc.leads + point.newLeads,
        conversions: acc.conversions + point.convertedLeads,
        value: acc.value + point.totalValue,
      }),
      { leads: 0, conversions: 0, value: 0 }
    );
    
    const previousTotals = previousPeriod.reduce(
      (acc, point) => ({
        leads: acc.leads + point.newLeads,
        conversions: acc.conversions + point.convertedLeads,
        value: acc.value + point.totalValue,
      }),
      { leads: 0, conversions: 0, value: 0 }
    );
    
    const calculatePercentChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    return {
      leadsChange: calculatePercentChange(currentTotals.leads, previousTotals.leads),
      conversionsChange: calculatePercentChange(currentTotals.conversions, previousTotals.conversions),
      valueChange: calculatePercentChange(currentTotals.value, previousTotals.value),
    };
  };
  
  const changes = calculateChanges();
  const chartData = prepareDataForChart();
  
  const renderChart = () => {
    if (viewType === 'line') {
      return (
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={chartType === 'leads' ? 'Current Leads' : chartType === 'conversions' ? 'Current Conversions' : 'Current Value'} 
            stroke={COLORS[0]} 
            activeDot={{ r: 8 }} 
          />
          <Line 
            type="monotone" 
            dataKey={chartType === 'leads' ? 'Previous Leads' : chartType === 'conversions' ? 'Previous Conversions' : 'Previous Value'} 
            stroke={COLORS[1]} 
            strokeDasharray="5 5"
          />
        </LineChart>
      );
    } else {
      return (
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey={chartType === 'leads' ? 'Current Leads' : chartType === 'conversions' ? 'Current Conversions' : 'Current Value'} 
            stackId="1"
            stroke={COLORS[0]} 
            fill={COLORS[0]} 
          />
          <Area 
            type="monotone" 
            dataKey={chartType === 'leads' ? 'Previous Leads' : chartType === 'conversions' ? 'Previous Conversions' : 'Previous Value'} 
            stackId="2"
            stroke={COLORS[1]} 
            fill={COLORS[1]} 
          />
        </AreaChart>
      );
    }
  };

  const handleTimeFrameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as 'week' | 'month' | 'quarter';
    setTimeFrame(value);
    
    const now = new Date();
    let start: Date, end: Date, comparisonStart: Date, comparisonEnd: Date;
    
    // Calculate current period
    if (value === 'week') {
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - 7);
    } else if (value === 'month') {
      end = new Date();
      start = new Date();
      start.setMonth(start.getMonth() - 1);
    } else { // quarter
      end = new Date();
      start = new Date();
      start.setMonth(start.getMonth() - 3);
    }
    
    // Calculate comparison period (previous period of the same length)
    const periodLength = end.getTime() - start.getTime();
    comparisonEnd = new Date(start.getTime() - 1); // 1 ms before current period start
    comparisonStart = new Date(comparisonEnd.getTime() - periodLength);
    
    onDateRangeChange({ start, end, comparisonStart, comparisonEnd });
  };
  
  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg={cardBg} borderColor={borderColor}>
      <Heading size="md" mb={4}>{title}</Heading>
      
      <Flex mb={5} direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }}>
        <HStack spacing={4} mb={{ base: 3, md: 0 }}>
          <FormControl maxW="200px">
            <FormLabel fontSize="sm">Metric</FormLabel>
            <Select value={chartType} onChange={(e) => setChartType(e.target.value as any)} size="sm">
              <option value="leads">Leads Generated</option>
              <option value="conversions">Conversions</option>
              <option value="value">Deal Value</option>
            </Select>
          </FormControl>
          
          <FormControl maxW="200px">
            <FormLabel fontSize="sm">Chart Type</FormLabel>
            <Select value={viewType} onChange={(e) => setViewType(e.target.value as any)} size="sm">
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
            </Select>
          </FormControl>
        </HStack>
        
        <FormControl maxW="200px">
          <FormLabel fontSize="sm">Time Frame</FormLabel>
          <Select value={timeFrame} onChange={handleTimeFrameChange} size="sm">
            <option value="week">Last Week vs Previous</option>
            <option value="month">Last Month vs Previous</option>
            <option value="quarter">Last Quarter vs Previous</option>
          </Select>
        </FormControl>
      </Flex>
      
      <HStack spacing={4} mb={5} wrap="wrap">
        <Box 
          p={3} 
          borderRadius="md" 
          bg={useColorModeValue('blue.50', 'blue.900')} 
          color={useColorModeValue('blue.800', 'blue.100')}
          borderWidth="1px"
          borderColor={useColorModeValue('blue.200', 'blue.700')}
        >
          <Text fontSize="sm">Leads Change</Text>
          <Text fontWeight="bold" fontSize="xl">
            {changes.leadsChange > 0 ? '+' : ''}{changes.leadsChange.toFixed(1)}%
          </Text>
        </Box>
        
        <Box 
          p={3} 
          borderRadius="md" 
          bg={useColorModeValue('green.50', 'green.900')} 
          color={useColorModeValue('green.800', 'green.100')}
          borderWidth="1px"
          borderColor={useColorModeValue('green.200', 'green.700')}
        >
          <Text fontSize="sm">Conversions Change</Text>
          <Text fontWeight="bold" fontSize="xl">
            {changes.conversionsChange > 0 ? '+' : ''}{changes.conversionsChange.toFixed(1)}%
          </Text>
        </Box>
        
        <Box 
          p={3} 
          borderRadius="md" 
          bg={useColorModeValue('purple.50', 'purple.900')} 
          color={useColorModeValue('purple.800', 'purple.100')}
          borderWidth="1px"
          borderColor={useColorModeValue('purple.200', 'purple.700')}
        >
          <Text fontSize="sm">Value Change</Text>
          <Text fontWeight="bold" fontSize="xl">
            {changes.valueChange > 0 ? '+' : ''}{changes.valueChange.toFixed(1)}%
          </Text>
        </Box>
      </HStack>
      
      <Box height="400px">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default ComparativeAnalysisChart; 