import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
  Checkbox,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { Stage } from '../../../types/pipeline';
import { deleteStage } from '../../../services/pipelineService';

interface DeleteStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage;
  pipelineId: string;
  onStageDeleted: () => void;
}

const DeleteStageModal = ({ isOpen, onClose, stage, pipelineId, onStageDeleted }: DeleteStageModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const hasLeads = stage.leads && stage.leads.length > 0;

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await deleteStage(pipelineId, stage.id);
      
      toast({
        title: 'Stage deleted',
        description: 'The stage has been removed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onStageDeleted();
      onClose();
    } catch (err) {
      console.error('Error deleting stage:', err);
      setError('Failed to delete stage. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to delete stage. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Stage
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack align="start" spacing={4}>
              <Text>
                Are you sure you want to delete the stage <strong>{stage.name}</strong>?
                {hasLeads && ' This stage contains leads that will also be deleted.'}
              </Text>
              
              {hasLeads && (
                <Text color="red.500">
                  Warning: This stage contains {stage.leads?.length} lead(s) that will be permanently removed.
                </Text>
              )}
              
              <Checkbox 
                colorScheme="red" 
                onChange={(e) => setIsConfirmed(e.target.checked)}
              >
                I understand that this action cannot be undone
              </Checkbox>
              
              {error && <Text color="red.500">{error}</Text>}
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDelete}
              ml={3}
              isLoading={isLoading}
              isDisabled={!isConfirmed}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteStageModal; 