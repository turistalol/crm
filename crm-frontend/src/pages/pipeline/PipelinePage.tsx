import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Flex, 
  Spinner, 
  Text, 
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  useDisclosure
} from '@chakra-ui/react';
import { ChevronDownIcon, AddIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Pipeline, Stage } from '../../types/pipeline';
import { getPipelineById } from '../../services/pipelineService';
import KanbanBoard from '../../components/pipeline/kanban/KanbanBoard';
import PipelineSettingsModal from '../../components/pipeline/PipelineSettingsModal';
import CreateStageModal from '../../components/pipeline/CreateStageModal';

const PipelinePage = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  
  const { 
    isOpen: isSettingsOpen, 
    onOpen: onSettingsOpen, 
    onClose: onSettingsClose 
  } = useDisclosure();
  
  const { 
    isOpen: isCreateStageOpen, 
    onOpen: onCreateStageOpen, 
    onClose: onCreateStageClose 
  } = useDisclosure();

  useEffect(() => {
    const fetchPipeline = async () => {
      if (!pipelineId) return;
      
      try {
        setIsLoading(true);
        const data = await getPipelineById(pipelineId);
        setPipeline(data);
      } catch (err) {
        console.error('Error fetching pipeline:', err);
        setError('Failed to load pipeline data. Please try again.');
        toast({
          title: 'Error loading pipeline',
          description: 'We couldn\'t load the pipeline data. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPipeline();
  }, [pipelineId, toast]);

  const handlePipelineUpdate = (updatedPipeline: Pipeline) => {
    setPipeline(updatedPipeline);
    toast({
      title: 'Pipeline updated',
      description: 'Pipeline settings have been updated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleStageCreated = (newStage: Stage) => {
    if (pipeline) {
      setPipeline({
        ...pipeline,
        stages: [...pipeline.stages, newStage]
      });
      toast({
        title: 'Stage created',
        description: 'New stage has been added to the pipeline.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="80vh">
        <Spinner size="xl" thickness="4px" />
      </Flex>
    );
  }

  if (error || !pipeline) {
    return (
      <Flex direction="column" alignItems="center" justifyContent="center" minH="70vh">
        <Text fontSize="xl" mb={4}>
          {error || 'Pipeline not found'}
        </Text>
        <Button colorScheme="blue" onClick={() => navigate('/pipelines')}>
          Back to Pipelines
        </Button>
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{pipeline.name}</Heading>
        <HStack>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            size="sm"
            onClick={onCreateStageOpen}
          >
            Add Stage
          </Button>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
              Actions
            </MenuButton>
            <MenuList>
              <MenuItem onClick={onSettingsOpen}>Pipeline Settings</MenuItem>
              <MenuItem>Export Leads</MenuItem>
              <MenuItem>Pipeline Analytics</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {pipeline.stages.length === 0 ? (
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center" 
          minH="50vh"
          borderWidth={1}
          borderRadius="md"
          p={8}
        >
          <Text fontSize="lg" mb={4}>This pipeline doesn't have any stages yet.</Text>
          <Button colorScheme="blue" onClick={onCreateStageOpen}>
            Create your first stage
          </Button>
        </Flex>
      ) : (
        <KanbanBoard pipeline={pipeline} setPipeline={setPipeline} />
      )}

      {isSettingsOpen && (
        <PipelineSettingsModal
          isOpen={isSettingsOpen}
          onClose={onSettingsClose}
          pipeline={pipeline}
          onPipelineUpdate={handlePipelineUpdate}
        />
      )}

      {isCreateStageOpen && (
        <CreateStageModal
          isOpen={isCreateStageOpen}
          onClose={onCreateStageClose}
          pipelineId={pipeline.id}
          existingStagesCount={pipeline.stages.length}
          onStageCreated={handleStageCreated}
        />
      )}
    </Box>
  );
};

export default PipelinePage; 