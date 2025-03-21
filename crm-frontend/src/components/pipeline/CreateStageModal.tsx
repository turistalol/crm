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
  useToast,
  Box,
  Flex,
  HStack
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { CreateStageDto, Stage } from '../../types/pipeline';
import { createStage } from '../../services/pipelineService';

interface CreateStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string;
  existingStagesCount: number;
  onStageCreated: (stage: Stage) => void;
}

interface ColorOption {
  label: string;
  value: string;
}

const colorOptions: ColorOption[] = [
  { label: 'Blue', value: 'blue.500' },
  { label: 'Green', value: 'green.500' },
  { label: 'Red', value: 'red.500' },
  { label: 'Orange', value: 'orange.500' },
  { label: 'Purple', value: 'purple.500' },
  { label: 'Teal', value: 'teal.500' },
  { label: 'Pink', value: 'pink.500' },
  { label: 'Cyan', value: 'cyan.500' }
];

const CreateStageModal = ({ 
  isOpen, 
  onClose, 
  pipelineId,
  existingStagesCount, 
  onStageCreated 
}: CreateStageModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<CreateStageDto>({
    defaultValues: {
      name: '',
      description: '',
      pipelineId,
      order: existingStagesCount,
      color: colorOptions[0].value
    }
  });
  
  const selectedColor = watch('color');
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const onSubmit = async (data: CreateStageDto) => {
    try {
      setError(null);
      const newStage = await createStage(data);
      onStageCreated(newStage);
      reset();
      onClose();
    } catch (err) {
      console.error('Error creating stage:', err);
      setError('Failed to create stage. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to create stage. Please try again.',
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
          <ModalHeader>Add Pipeline Stage</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Stage Name</FormLabel>
                <Input
                  {...register('name', {
                    required: 'Stage name is required',
                    minLength: {
                      value: 2,
                      message: 'Stage name must be at least 2 characters',
                    },
                  })}
                  placeholder="New Lead"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="Describe this stage's purpose"
                  resize="vertical"
                />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Color</FormLabel>
                <Flex wrap="wrap" gap={2}>
                  {colorOptions.map((color) => (
                    <Box
                      key={color.value}
                      w="36px"
                      h="36px"
                      borderRadius="md"
                      bg={color.value}
                      cursor="pointer"
                      border="2px solid"
                      borderColor={selectedColor === color.value ? 'gray.800' : 'transparent'}
                      onClick={() => setValue('color', color.value)}
                      _hover={{ opacity: 0.8 }}
                      title={color.label}
                    />
                  ))}
                </Flex>
              </FormControl>

              <input type="hidden" {...register('pipelineId')} />
              <input type="hidden" {...register('order')} />
              <input type="hidden" {...register('color')} />

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
              Create Stage
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateStageModal; 