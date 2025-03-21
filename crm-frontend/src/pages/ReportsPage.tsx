import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  HStack,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Spinner,
  useColorModeValue,
  GridItem,
  VStack,
  Center,
  Switch,
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon, DownloadIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import { useReactToPrint } from 'react-to-print';
import { Report, ReportType } from '../types/api';
import reportService from '../services/reportService';
import ReportBuilder from '../components/reports/ReportBuilder';
import PipelinePerformanceChart from '../components/reports/PipelinePerformanceChart';
import TeamPerformanceChart from '../components/reports/TeamPerformanceChart';
import ComparativeAnalysisChart from '../components/reports/ComparativeAnalysisChart';
import { useAuth } from '../hooks/useAuth';

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pipelineMetrics, setPipelineMetrics] = useState(null);
  const [teamMetrics, setTeamMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonDateRange, setComparisonDateRange] = useState<{ 
    start: Date; 
    end: Date; 
    comparisonStart: Date; 
    comparisonEnd: Date 
  } | null>(null);
  
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    fetchReports();
  }, [user?.companyId]);

  const fetchReports = async () => {
    if (!user?.companyId) return;
    
    setIsLoading(true);
    try {
      const fetchedReports = await reportService.getReports(user.companyId);
      setReports(fetchedReports);
      
      // Select the first report by default if available
      if (fetchedReports.length > 0 && !selectedReport) {
        setSelectedReport(fetchedReports[0]);
        await loadReportData(fetchedReports[0]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch reports'));
      toast({
        title: 'Error',
        description: 'Failed to fetch reports. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadReportData = async (report: Report) => {
    setMetricsLoading(true);
    try {
      const filters = report.filters || {};
      const dateRange = filters.startDate && filters.endDate
        ? {
            start: new Date(filters.startDate),
            end: new Date(filters.endDate),
          }
        : undefined;

      if (report.type === ReportType.PIPELINE_PERFORMANCE) {
        if (filters.pipelineId) {
          const metrics = await reportService.getPipelineMetrics(
            filters.pipelineId,
            dateRange
          );
          setPipelineMetrics(metrics);
        }
      } else if (report.type === ReportType.TEAM_PERFORMANCE) {
        if (filters.teamId) {
          const metrics = await reportService.getTeamPerformanceMetrics(
            filters.teamId,
            dateRange
          );
          setTeamMetrics(metrics);
        }
      }
      // Handle other report types as needed
    } catch (err) {
      console.error('Error loading report data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load report data. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleReportCreated = (newReport: Report) => {
    setReports([newReport, ...reports]);
    setSelectedReport(newReport);
    loadReportData(newReport);
  };

  const handleReportDelete = async (reportId: string) => {
    try {
      await reportService.deleteReport(reportId);
      setReports(reports.filter((r) => r.id !== reportId));
      toast({
        title: 'Report deleted',
        description: 'The report has been successfully deleted.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      if (selectedReport?.id === reportId) {
        const newSelectedReport = reports.find((r) => r.id !== reportId) || null;
        setSelectedReport(newSelectedReport);
        if (newSelectedReport) {
          await loadReportData(newSelectedReport);
        } else {
          setPipelineMetrics(null);
          setTeamMetrics(null);
        }
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete the report. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
  });

  const getReportTypeBadgeColor = (type: ReportType) => {
    switch (type) {
      case ReportType.PIPELINE_PERFORMANCE:
        return 'blue';
      case ReportType.TEAM_PERFORMANCE:
        return 'green';
      case ReportType.CONVERSION_RATES:
        return 'purple';
      case ReportType.LEAD_SOURCE:
        return 'orange';
      case ReportType.SALES_FORECAST:
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const getReportTypeLabel = (type: ReportType) => {
    switch (type) {
      case ReportType.PIPELINE_PERFORMANCE:
        return 'Pipeline Performance';
      case ReportType.TEAM_PERFORMANCE:
        return 'Team Performance';
      case ReportType.CONVERSION_RATES:
        return 'Conversion Rates';
      case ReportType.LEAD_SOURCE:
        return 'Lead Source';
      case ReportType.SALES_FORECAST:
        return 'Sales Forecast';
      default:
        return type;
    }
  };

  const handleDateRangeChange = (range: { 
    start: Date; 
    end: Date; 
    comparisonStart: Date; 
    comparisonEnd: Date 
  }) => {
    setComparisonDateRange(range);
    // If we have a selected report, reload with the new date range
    if (selectedReport) {
      const reportCopy = {...selectedReport};
      if (!reportCopy.filters) reportCopy.filters = {};
      
      reportCopy.filters.startDate = range.start.toISOString();
      reportCopy.filters.endDate = range.end.toISOString();
      // In a real implementation, we would also pass the comparison date range
      loadReportData(reportCopy);
    }
  };

  const renderReportContent = () => {
    if (!selectedReport) {
      return (
        <Flex direction="column" alignItems="center" justifyContent="center" py={10}>
          <Text mb={4}>No report selected. Please select or create a report.</Text>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
            Create New Report
          </Button>
        </Flex>
      );
    }

    if (metricsLoading) {
      return (
        <Flex justifyContent="center" alignItems="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      );
    }

    switch (selectedReport.type) {
      case ReportType.PIPELINE_PERFORMANCE:
        return (
          <PipelinePerformanceChart 
            metrics={pipelineMetrics} 
            isLoading={metricsLoading}
            error={error}
            title={selectedReport.name}
          />
        );
      case ReportType.TEAM_PERFORMANCE:
        return (
          <TeamPerformanceChart 
            metrics={teamMetrics} 
            isLoading={metricsLoading}
            error={error}
            title={selectedReport.name}
          />
        );
      default:
        return (
          <Flex direction="column" alignItems="center" justifyContent="center" py={10}>
            <Text>This report type is not yet implemented.</Text>
          </Flex>
        );
    }
  };

  return (
    <Container maxW="container.xl" py={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="lg">Reports & Analytics</Heading>
        <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={onOpen}>
          Create Report
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 4 }} spacing={5}>
        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            bg={useColorModeValue('white', 'gray.700')}
          >
            <Heading size="md" mb={4}>
              My Reports
            </Heading>
            {isLoading ? (
              <Center p={5}>
                <Spinner />
              </Center>
            ) : (
              <VStack spacing={2} align="stretch">
                {reports.map(report => (
                  <Box
                    key={report.id}
                    p={3}
                    cursor="pointer"
                    borderRadius="md"
                    bg={selectedReport?.id === report.id ? 'blue.50' : 'transparent'}
                    color={selectedReport?.id === report.id ? 'blue.700' : 'inherit'}
                    _hover={{ bg: selectedReport?.id === report.id ? 'blue.50' : 'gray.50' }}
                    onClick={() => {
                      setSelectedReport(report);
                      loadReportData(report);
                    }}
                  >
                    <Text fontWeight="medium">{report.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {getReportTypeLabel(report.type)}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 3 }}>
          {selectedReport ? (
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">{selectedReport.name}</Heading>
                <HStack>
                  <Button size="sm" leftIcon={<DownloadIcon />} onClick={handlePrint}>
                    Export CSV
                  </Button>
                  <Button size="sm" leftIcon={<PrintIcon />} onClick={handlePrint}>
                    Print
                  </Button>
                  <Switch 
                    colorScheme="blue" 
                    size="md" 
                    isChecked={comparisonMode} 
                    onChange={(e) => setComparisonMode(e.target.checked)}
                  />
                  <Text fontSize="sm" fontWeight="medium">Comparison</Text>
                </HStack>
              </Flex>

              {metricsLoading ? (
                <Center p={20}>
                  <Spinner size="xl" />
                </Center>
              ) : comparisonMode ? (
                <ComparativeAnalysisChart
                  pipelineMetrics={pipelineMetrics}
                  teamMetrics={teamMetrics}
                  isLoading={metricsLoading}
                  error={null}
                  onDateRangeChange={handleDateRangeChange}
                />
              ) : (
                <>
                  {selectedReport.type === ReportType.PIPELINE_PERFORMANCE && pipelineMetrics && (
                    <PipelinePerformanceChart metrics={pipelineMetrics} isLoading={false} error={null} />
                  )}
                  {selectedReport.type === ReportType.TEAM_PERFORMANCE && teamMetrics && (
                    <TeamPerformanceChart metrics={teamMetrics} isLoading={false} error={null} />
                  )}
                </>
              )}
            </Box>
          ) : (
            <Box
              p={10}
              shadow="md"
              borderWidth="1px"
              borderRadius="md"
              bg={useColorModeValue('white', 'gray.700')}
              textAlign="center"
            >
              <Heading size="md" mb={4}>
                Select a report to view
              </Heading>
              <Text color="gray.500">
                Or create a new report to analyze your data
              </Text>
            </Box>
          )}
        </GridItem>
      </SimpleGrid>

      {user && (
        <ReportBuilder
          isOpen={isOpen}
          onClose={onClose}
          onReportCreated={handleReportCreated}
          companyId={user.companyId || ''}
          userId={user.id}
        />
      )}
    </Container>
  );
};

export default ReportsPage; 