import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  FormErrorMessage,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { CreatePipelineDto, Pipeline } from '../../types/pipeline';
import { createPipeline } from '../../services/pipelineService';
import { useTeams } from '../../hooks/useTeams';

interface CreatePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPipelineCreated: (pipeline: Pipeline) => void;
}

const CreatePipelineModal = ({ isOpen, onClose, onPipelineCreated }: CreatePipelineModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CreatePipelineDto>();
  
  const [error, setError] = useState<string | null>(null);
  const { teams, isLoading: isLoadingTeams } = useTeams();
  const toast = useToast();

  const onSubmit = async (data: CreatePipelineDto) => {
    try {
      setError(null);
      const newPipeline = await createPipeline(data);
      onPipelineCreated(newPipeline);
      reset();
      onClose();
    } catch (err) {
      console.error('Error creating pipeline:', err);
      setError('Failed to create pipeline. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to create pipeline. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create Pipeline</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Pipeline Name</FormLabel>
                <Input
                  {...register('name', {
                    required: 'Pipeline name is required',
                    minLength: {
                      value: 3,
                      message: 'Pipeline name must be at least 3 characters',
                    },
                  })}
                  placeholder="Sales Pipeline"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="Describe the purpose of this pipeline"
                  resize="vertical"
                />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.teamId} isRequired>
                <FormLabel>Team</FormLabel>
                <Select
                  {...register('teamId', {
                    required: 'Please select a team',
                  })}
                  placeholder="Select team"
                  isDisabled={isLoadingTeams || teams.length === 0}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.teamId?.message}</FormErrorMessage>
              </FormControl>

              {error && (
                <FormControl isInvalid={!!error}>
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              type="submit" 
              isLoading={isSubmitting}
            >
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreatePipelineModal; 