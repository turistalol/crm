import React, { useState } from 'react';
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
  Box,
  Circle,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Stage, UpdateStageDto } from '../../../types/pipeline';
import { updateStage } from '../../../services/pipelineService';
import ColorRadio from '../../common/ColorRadio';

interface EditStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage;
  onStageUpdate: (stage: Stage) => void;
}

const colorOptions = [
  { name: 'blue', value: '#3182CE' },
  { name: 'green', value: '#38A169' },
  { name: 'red', value: '#E53E3E' },
  { name: 'orange', value: '#DD6B20' },
  { name: 'purple', value: '#805AD5' },
  { name: 'pink', value: '#D53F8C' },
  { name: 'teal', value: '#319795' },
  { name: 'yellow', value: '#D69E2E' },
  { name: 'gray', value: '#718096' },
];

const EditStageModal = ({ isOpen, onClose, stage, onStageUpdate }: EditStageModalProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateStageDto>({
    defaultValues: {
      name: stage.name,
      description: stage.description || '',
      color: stage.color || colorOptions[0].value,
    },
  });

  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Set up color radio group
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'color',
    defaultValue: stage.color || colorOptions[0].value,
    onChange: (value) => {
      setValue('color', value);
    },
  });

  const group = getRootProps();

  const onSubmit = async (data: UpdateStageDto) => {
    try {
      setError(null);
      const updatedStage = await updateStage(stage.id, data);
      onStageUpdate(updatedStage);
      toast({
        title: 'Stage updated',
        description: 'Stage has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      console.error('Error updating stage:', err);
      setError('Failed to update stage. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to update stage. Please try again.',
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
          <ModalHeader>Edit Stage</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Stage Name</FormLabel>
                <Input
                  {...register('name', {
                    required: 'Stage name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="Describe the purpose of this stage..."
                  resize="vertical"
                  rows={3}
                />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Color</FormLabel>
                <HStack spacing={2} {...group}>
                  {colorOptions.map(({ name, value }) => {
                    const radio = getRadioProps({ value });
                    return (
                      <ColorRadio key={name} {...radio}>
                        <Circle size="20px" bg={value} />
                      </ColorRadio>
                    );
                  })}
                </HStack>
              </FormControl>

              {error && (
                <FormControl isInvalid={!!error}>
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>
              )}

              <Input
                type="hidden"
                {...register('color')}
              />
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
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditStageModal; 