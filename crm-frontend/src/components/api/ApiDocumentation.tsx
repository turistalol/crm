import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Button,
  Icon,
  Link,
  Select,
  VStack,
  HStack,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { apiManagementService } from '../../services/apiManagementService';

const METHODS_COLORS = {
  GET: 'green',
  POST: 'blue',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'purple',
};

interface Endpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters?: Record<string, string>;
  requestBody?: Record<string, any>;
  responses?: Record<string, any>;
  example?: {
    request?: string;
    response?: string;
  };
}

interface ApiDocSection {
  title: string;
  description: string;
  endpoints: Endpoint[];
}

const ApiDocumentation: React.FC = () => {
  const [documentation, setDocumentation] = useState<ApiDocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedVersion, setSelectedVersion] = useState('v1');
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const codeBg = useColorModeValue('gray.50', 'gray.800');
  
  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from API
        // const docs = await apiManagementService.getApiDocumentation();
        
        // For now, using sample data
        const sampleDocs: ApiDocSection[] = [
          {
            title: 'Authentication',
            description: 'The API supports API key authentication. Include your API key in the X-API-Key header.',
            endpoints: [
              {
                path: '/api/auth/check',
                method: 'GET',
                description: 'Check if your API key is valid',
                responses: {
                  '200': { description: 'Valid API key', schema: { valid: 'boolean' } },
                  '401': { description: 'Invalid API key' },
                },
                example: {
                  response: '{\n  "valid": true,\n  "permissions": ["read:leads", "write:leads"]\n}',
                },
              },
            ],
          },
          {
            title: 'Pipeline Management',
            description: 'Endpoints for managing pipelines and stages',
            endpoints: [
              {
                path: '/api/pipelines',
                method: 'GET',
                description: 'Get all pipelines',
                parameters: {
                  teamId: 'Optional query parameter to filter by team',
                },
                responses: {
                  '200': { description: 'Success', schema: { type: 'array', items: { $ref: '#/components/schemas/Pipeline' } } },
                  '401': { description: 'Unauthorized' },
                },
                example: {
                  response: '[\n  {\n    "id": "123",\n    "name": "Sales Pipeline",\n    "stages": [\n      {\n        "id": "456",\n        "name": "Initial Contact",\n        "position": 0\n      }\n    ]\n  }\n]',
                },
              },
              {
                path: '/api/pipelines/{id}',
                method: 'GET',
                description: 'Get a pipeline by ID',
                parameters: {
                  id: 'Pipeline ID (path parameter)',
                },
                responses: {
                  '200': { description: 'Success', schema: { $ref: '#/components/schemas/Pipeline' } },
                  '404': { description: 'Pipeline not found' },
                },
              },
              {
                path: '/api/pipelines',
                method: 'POST',
                description: 'Create a new pipeline',
                requestBody: {
                  name: 'string',
                  teamId: 'string',
                },
                responses: {
                  '201': { description: 'Pipeline created', schema: { $ref: '#/components/schemas/Pipeline' } },
                  '400': { description: 'Invalid request body' },
                },
                example: {
                  request: '{\n  "name": "New Sales Pipeline",\n  "teamId": "789"\n}',
                  response: '{\n  "id": "abc123",\n  "name": "New Sales Pipeline",\n  "teamId": "789",\n  "stages": []\n}',
                },
              },
            ],
          },
          {
            title: 'Lead Management',
            description: 'Endpoints for managing leads in pipelines',
            endpoints: [
              {
                path: '/api/leads',
                method: 'GET',
                description: 'Get all leads with optional filtering',
                parameters: {
                  pipelineId: 'Filter by pipeline ID',
                  stageId: 'Filter by stage ID',
                  status: 'Filter by status (OPEN, WON, LOST)',
                  page: 'Page number for pagination',
                  limit: 'Items per page',
                },
                responses: {
                  '200': { 
                    description: 'Success', 
                    schema: { 
                      data: { type: 'array', items: { $ref: '#/components/schemas/Lead' } },
                      pagination: { page: 'number', limit: 'number', total: 'number', totalPages: 'number' }
                    } 
                  }
                },
              },
              {
                path: '/api/leads/{id}',
                method: 'GET',
                description: 'Get a lead by ID',
                parameters: {
                  id: 'Lead ID (path parameter)',
                },
                responses: {
                  '200': { description: 'Success', schema: { $ref: '#/components/schemas/Lead' } },
                  '404': { description: 'Lead not found' },
                },
              },
              {
                path: '/api/leads',
                method: 'POST',
                description: 'Create a new lead',
                requestBody: {
                  name: 'string',
                  email: 'string (optional)',
                  phone: 'string (optional)',
                  value: 'number (optional)',
                  pipelineId: 'string',
                  stageId: 'string',
                  customFields: 'object (optional)',
                },
                responses: {
                  '201': { description: 'Lead created', schema: { $ref: '#/components/schemas/Lead' } },
                  '400': { description: 'Invalid request body' },
                },
              },
              {
                path: '/api/leads/bulk-update',
                method: 'POST',
                description: 'Update multiple leads in a single operation',
                requestBody: {
                  leadIds: 'array of string (lead IDs)',
                  updates: {
                    stageId: 'string (optional)',
                    status: 'string (optional)',
                    value: 'number (optional)',
                    assignedToId: 'string or null (optional)',
                    tags: 'array of strings (optional)',
                  },
                },
                responses: {
                  '200': { description: 'Leads updated', schema: { message: 'string', count: 'number' } },
                  '400': { description: 'Invalid request body' },
                },
                example: {
                  request: '{\n  "leadIds": ["lead1", "lead2", "lead3"],\n  "updates": {\n    "stageId": "stage2",\n    "tags": ["important", "follow-up"]\n  }\n}',
                  response: '{\n  "message": "Successfully updated 3 leads",\n  "count": 3\n}',
                },
              },
            ],
          },
          {
            title: 'Webhooks',
            description: 'Endpoints for managing webhook subscriptions',
            endpoints: [
              {
                path: '/api/webhooks',
                method: 'GET',
                description: 'Get all configured webhooks',
                responses: {
                  '200': { description: 'Success', schema: { type: 'array', items: { $ref: '#/components/schemas/Webhook' } } },
                },
              },
              {
                path: '/api/webhooks',
                method: 'POST',
                description: 'Create a new webhook subscription',
                requestBody: {
                  url: 'string (destination URL)',
                  events: 'array of strings (event types)',
                  description: 'string (optional)',
                  isActive: 'boolean (default: true)',
                },
                responses: {
                  '201': { description: 'Webhook created', schema: { $ref: '#/components/schemas/Webhook' } },
                  '400': { description: 'Invalid request body' },
                },
              },
              {
                path: '/api/webhooks/{id}/test',
                method: 'POST',
                description: 'Send a test event to the webhook',
                parameters: {
                  id: 'Webhook ID (path parameter)',
                  event: 'Event type (query parameter)',
                },
                responses: {
                  '200': { description: 'Test event sent', schema: { success: 'boolean', statusCode: 'number' } },
                  '404': { description: 'Webhook not found' },
                },
              },
            ],
          },
          {
            title: 'Reports',
            description: 'Endpoints for generating reports and metrics',
            endpoints: [
              {
                path: '/api/metrics/pipeline/{id}',
                method: 'GET',
                description: 'Get performance metrics for a pipeline',
                parameters: {
                  id: 'Pipeline ID (path parameter)',
                  start: 'Start date for metrics (YYYY-MM-DD)',
                  end: 'End date for metrics (YYYY-MM-DD)',
                  comparison: 'Include comparison with previous period (boolean)',
                },
                responses: {
                  '200': { description: 'Success' },
                  '404': { description: 'Pipeline not found' },
                },
              },
              {
                path: '/api/metrics/team/{id}',
                method: 'GET',
                description: 'Get performance metrics for a team',
                parameters: {
                  id: 'Team ID (path parameter)',
                  start: 'Start date for metrics (YYYY-MM-DD)',
                  end: 'End date for metrics (YYYY-MM-DD)',
                  comparison: 'Include comparison with previous period (boolean)',
                },
                responses: {
                  '200': { description: 'Success' },
                  '404': { description: 'Team not found' },
                },
              },
            ],
          },
        ];
        
        setDocumentation(sampleDocs);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching API documentation:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentation();
  }, [selectedVersion]);
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // In a real app, you might want to show a toast notification
  };
  
  const renderEndpoint = (endpoint: Endpoint) => {
    return (
      <Box 
        mb={6} 
        p={4} 
        borderWidth="1px" 
        borderRadius="md" 
        borderColor={borderColor}
        bg={bgColor}
      >
        <Flex mb={2} align="center">
          <Badge 
            mr={2} 
            colorScheme={METHODS_COLORS[endpoint.method]} 
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
            textTransform="uppercase"
            fontWeight="bold"
          >
            {endpoint.method}
          </Badge>
          <Text fontFamily="mono" fontWeight="medium">{endpoint.path}</Text>
        </Flex>
        
        <Text mb={4}>{endpoint.description}</Text>
        
        <Accordion allowToggle>
          {endpoint.parameters && Object.keys(endpoint.parameters).length > 0 && (
            <AccordionItem border="none">
              <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
                <Box flex="1" textAlign="left" fontWeight="medium">
                  Parameters
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} px={0}>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Description</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(endpoint.parameters).map(([name, description]) => (
                      <Tr key={name}>
                        <Td fontFamily="mono">{name}</Td>
                        <Td>{description}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>
          )}
          
          {endpoint.requestBody && (
            <AccordionItem border="none">
              <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
                <Box flex="1" textAlign="left" fontWeight="medium">
                  Request Body
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} px={0}>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Property</Th>
                      <Th>Type</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(endpoint.requestBody).map(([name, type]) => (
                      <Tr key={name}>
                        <Td fontFamily="mono">{name}</Td>
                        <Td>{typeof type === 'object' ? 
                          <VStack align="start">
                            {Object.entries(type).map(([subName, subType]) => (
                              <Box key={subName}>{subName}: {subType as string}</Box>
                            ))}
                          </VStack> 
                          : type}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>
          )}
          
          {endpoint.responses && (
            <AccordionItem border="none">
              <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
                <Box flex="1" textAlign="left" fontWeight="medium">
                  Responses
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} px={0}>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Status</Th>
                      <Th>Description</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(endpoint.responses).map(([status, details]) => (
                      <Tr key={status}>
                        <Td>
                          <Badge 
                            colorScheme={
                              status.startsWith('2') ? 'green' : 
                              status.startsWith('4') ? 'orange' : 
                              status.startsWith('5') ? 'red' : 'gray'
                            }
                          >
                            {status}
                          </Badge>
                        </Td>
                        <Td>{(details as any).description}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>
          )}
          
          {endpoint.example && (
            <AccordionItem border="none">
              <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
                <Box flex="1" textAlign="left" fontWeight="medium">
                  Example
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} px={0}>
                {endpoint.example.request && (
                  <Box mb={4}>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm" fontWeight="medium">Request</Text>
                      <Button 
                        size="xs" 
                        leftIcon={<Icon as={CopyIcon} />} 
                        onClick={() => handleCopyCode(endpoint.example?.request || '')}
                        variant="ghost"
                      >
                        Copy
                      </Button>
                    </Flex>
                    <Box 
                      p={2} 
                      borderRadius="md" 
                      bg={codeBg} 
                      fontFamily="mono" 
                      fontSize="sm"
                      overflowX="auto"
                    >
                      <pre>{endpoint.example.request}</pre>
                    </Box>
                  </Box>
                )}
                
                {endpoint.example.response && (
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm" fontWeight="medium">Response</Text>
                      <Button 
                        size="xs" 
                        leftIcon={<Icon as={CopyIcon} />} 
                        onClick={() => handleCopyCode(endpoint.example?.response || '')}
                        variant="ghost"
                      >
                        Copy
                      </Button>
                    </Flex>
                    <Box 
                      p={2} 
                      borderRadius="md" 
                      bg={codeBg} 
                      fontFamily="mono" 
                      fontSize="sm"
                      overflowX="auto"
                    >
                      <pre>{endpoint.example.response}</pre>
                    </Box>
                  </Box>
                )}
              </AccordionPanel>
            </AccordionItem>
          )}
        </Accordion>
      </Box>
    );
  };
  
  if (loading) {
    return <Text>Loading API documentation...</Text>;
  }
  
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading API documentation: {error.message}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">API Documentation</Heading>
        <HStack>
          <Text>Version:</Text>
          <Select value={selectedVersion} onChange={(e) => setSelectedVersion(e.target.value)} size="sm" width="auto">
            <option value="v1">v1.0</option>
            <option value="v2">v2.0 (Beta)</option>
          </Select>
        </HStack>
      </Flex>
      
      <Box mb={8}>
        <Heading size="md" mb={2}>Introduction</Heading>
        <Text mb={4}>
          This documentation provides details on how to use the CRM API to integrate with external systems.
          Use API keys for authentication and check rate limits to ensure optimal integration.
        </Text>
        
        <Heading size="sm" mb={2}>Base URL</Heading>
        <Code p={2} borderRadius="md">https://api.example.com/api</Code>
        
        <Heading size="sm" mt={4} mb={2}>Authentication</Heading>
        <Text mb={2}>
          All API requests require an API key to be included in the request headers:
        </Text>
        <Code p={2} borderRadius="md" display="block" mb={4}>
          X-API-Key: your_api_key
        </Code>
        
        <Heading size="sm" mt={4} mb={2}>Rate Limiting</Heading>
        <Text>
          The API is rate-limited to 100 requests per minute. If you exceed this limit, 
          you'll receive a 429 Too Many Requests response.
        </Text>
      </Box>
      
      <Divider mb={8} />
      
      <Tabs variant="enclosed">
        <TabList>
          {documentation.map((section, index) => (
            <Tab key={index}>{section.title}</Tab>
          ))}
        </TabList>
        
        <TabPanels>
          {documentation.map((section, index) => (
            <TabPanel key={index} px={0}>
              <Text mb={4}>{section.description}</Text>
              
              {section.endpoints.map((endpoint, i) => (
                <React.Fragment key={i}>
                  {renderEndpoint(endpoint)}
                </React.Fragment>
              ))}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ApiDocumentation; 