import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Button, 
  Flex, 
  Text, 
  Spinner, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Badge,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { Pipeline } from '../../types/pipeline';
import { getPipelines } from '../../services/pipelineService';
import CreatePipelineModal from '../../components/pipeline/CreatePipelineModal';

const PipelinesPage = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        setIsLoading(true);
        const data = await getPipelines();
        setPipelines(data);
      } catch (err) {
        console.error('Error fetching pipelines:', err);
        setError('Failed to load pipelines. Please try again.');
        toast({
          title: 'Error loading pipelines',
          description: 'We couldn\'t load your pipelines. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPipelines();
  }, [toast]);

  const handlePipelineCreated = (newPipeline: Pipeline) => {
    setPipelines([...pipelines, newPipeline]);
    toast({
      title: 'Pipeline created',
      description: 'New pipeline has been created successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="80vh">
        <Spinner size="xl" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Pipelines</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue"
          onClick={onOpen}
        >
          Create Pipeline
        </Button>
      </Flex>

      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}

      {pipelines.length === 0 ? (
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center" 
          minH="50vh"
          borderWidth={1}
          borderRadius="md"
          p={8}
        >
          <Text fontSize="lg" mb={4}>You don't have any pipelines yet.</Text>
          <Button colorScheme="blue" onClick={onOpen}>
            Create your first pipeline
          </Button>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {pipelines.map(pipeline => (
            <Card key={pipeline.id} borderRadius="lg" boxShadow="md" height="100%">
              <CardHeader>
                <Heading size="md">{pipeline.name}</Heading>
                <Badge 
                  colorScheme="blue" 
                  mt={2}
                >
                  {pipeline.stages.length} stages
                </Badge>
              </CardHeader>
              <CardBody>
                <Text noOfLines={2}>
                  {pipeline.description || 'No description provided.'}
                </Text>
              </CardBody>
              <CardFooter>
                <Button 
                  as={Link} 
                  to={`/pipelines/${pipeline.id}`} 
                  colorScheme="blue" 
                  variant="outline" 
                  width="100%"
                >
                  View Pipeline
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <CreatePipelineModal 
        isOpen={isOpen} 
        onClose={onClose} 
        onPipelineCreated={handlePipelineCreated} 
      />
    </Box>
  );
};

export default PipelinesPage; 