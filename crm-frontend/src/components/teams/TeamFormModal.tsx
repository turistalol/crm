import React, { useState, useEffect } from 'react';
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
  useToast,
  VStack
} from '@chakra-ui/react';
import { Team, CreateTeamDto, UpdateTeamDto } from '../../types/team';
import { createTeam, updateTeam } from '../../services/teamService';

interface TeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onSave: (team: Team) => void;
}

const TeamFormModal: React.FC<TeamFormModalProps> = ({ isOpen, onClose, team, onSave }) => {
  const [formData, setFormData] = useState<CreateTeamDto | UpdateTeamDto>({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Reset form when modal opens or team changes
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    setErrors({});
  }, [team, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let savedTeam;
      
      if (team) {
        // Update
        savedTeam = await updateTeam(team.id, formData as UpdateTeamDto);
        toast({
          title: 'Team updated',
          description: 'Team has been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create
        savedTeam = await createTeam(formData as CreateTeamDto);
        toast({
          title: 'Team created',
          description: 'New team has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onSave(savedTeam);
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: 'Error',
        description: `Failed to ${team ? 'update' : 'create'} team. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{team ? 'Edit Team' : 'Create New Team'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Team Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter team name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Enter team description (optional)"
                  resize="vertical"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              type="submit" 
              isLoading={isSubmitting}
            >
              {team ? 'Save Changes' : 'Create Team'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default TeamFormModal; 