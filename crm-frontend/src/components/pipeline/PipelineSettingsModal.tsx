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
  Textarea,
  FormErrorMessage,
  VStack,
  HStack,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Pipeline, UpdatePipelineDto } from '../../types/pipeline';
import { updatePipeline, deletePipeline } from '../../services/pipelineService';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

interface PipelineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: Pipeline;
  onPipelineUpdate: (pipeline: Pipeline) => void;
}

const PipelineSettingsModal = ({ 
  isOpen, 
  onClose, 
  pipeline, 
  onPipelineUpdate 
}: PipelineSettingsModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<UpdatePipelineDto>({
    defaultValues: {
      name: pipeline.name,
      description: pipeline.description || ''
    }
  });
  
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onClose: onDeleteConfirmClose
  } = useDisclosure();
  
  const cancelRef = useRef<HTMLButtonElement>(null);

  const onSubmit = async (data: UpdatePipelineDto) => {
    try {
      setError(null);
      const updated = await updatePipeline(pipeline.id, data);
      onPipelineUpdate(updated);
      toast({
        title: 'Success',
        description: 'Pipeline settings updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      console.error('Error updating pipeline:', err);
      setError('Failed to update pipeline. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to update pipeline. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePipeline(pipeline.id);
      toast({
        title: 'Pipeline deleted',
        description: 'Pipeline has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteConfirmClose();
      onClose();
      navigate('/pipelines');
    } catch (err) {
      console.error('Error deleting pipeline:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete pipeline. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    reset({
      name: pipeline.name,
      description: pipeline.description || ''
    });
    setError(null);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Pipeline Settings</ModalHeader>
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
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.description}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    {...register('description')}
                    resize="vertical"
                  />
                  <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                </FormControl>

                {error && (
                  <FormControl isInvalid={!!error}>
                    <FormErrorMessage>{error}</FormErrorMessage>
                  </FormControl>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter justifyContent="space-between">
              <Button 
                colorScheme="red" 
                variant="outline" 
                onClick={onDeleteConfirmOpen}
              >
                Delete Pipeline
              </Button>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  type="submit" 
                  isLoading={isSubmitting}
                >
                  Save Changes
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteConfirmClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Pipeline
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the pipeline "{pipeline.name}"? This action cannot be undone.
              All leads in this pipeline will be permanently deleted.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteConfirmClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default PipelineSettingsModal; 