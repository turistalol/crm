import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useToast,
} from '@chakra-ui/react';
import { Lead } from '../../../types/pipeline';
import { deleteLead } from '../../../services/pipelineService';

interface DeleteLeadConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onLeadDeleted: () => void;
}

const DeleteLeadConfirmation = ({ isOpen, onClose, lead, onLeadDeleted }: DeleteLeadConfirmationProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteLead(lead.id);
      toast({
        title: 'Lead deleted',
        description: `${lead.name} has been deleted successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onLeadDeleted();
      onClose();
    } catch (err) {
      console.error('Error deleting lead:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete lead. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
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
            Delete Lead
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete lead "{lead.name}"? This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDelete} 
              ml={3}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteLeadConfirmation; 