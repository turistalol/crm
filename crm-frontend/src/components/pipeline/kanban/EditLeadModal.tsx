import { useState, useEffect } from 'react';
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
  InputGroup,
  InputLeftElement,
  Select,
  Textarea,
  FormErrorMessage,
  VStack,
  HStack,
  useToast,
  Heading,
  Box,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  TagLeftIcon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { PhoneIcon, EmailIcon, AddIcon } from '@chakra-ui/icons';
import { FaBuilding, FaDollarSign, FaUser, FaTag } from 'react-icons/fa';
import { Lead, UpdateLeadDto, LeadStatus, LeadTag } from '../../../types/pipeline';
import { updateLead, getLeadTags, addTagToLead, removeTagFromLead } from '../../../services/pipelineService';
import { TeamMember } from '../../../types/team';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onLeadUpdate: (lead: Lead) => void;
}

const statusOptions = [
  { value: LeadStatus.ACTIVE, label: 'Active' },
  { value: LeadStatus.WON, label: 'Won' },
  { value: LeadStatus.LOST, label: 'Lost' },
  { value: LeadStatus.ARCHIVED, label: 'Archived' },
];

const EditLeadModal = ({ isOpen, onClose, lead, onLeadUpdate }: EditLeadModalProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<UpdateLeadDto>({
    defaultValues: {
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      value: lead.value || undefined,
      status: lead.status,
      notes: lead.notes || '',
      assignedToId: lead.assignedToId || '',
      customFields: lead.customFields || {},
    },
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableTags, setAvailableTags] = useState<LeadTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<LeadTag[]>(lead.tags || []);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const toast = useToast();
  const [customFields, setCustomFields] = useState<{key: string, value: string}[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  useEffect(() => {
    // Fetch team members for assignment dropdown
    // This would be replaced with an actual API call
    const fetchTeamMembers = async () => {
      // Mock data - in a real app, you'd fetch from the API
      setTeamMembers([]);
    };

    // Fetch available tags
    const fetchTags = async () => {
      try {
        setIsLoadingTags(true);
        const tags = await getLeadTags();
        setAvailableTags(tags.filter(tag => 
          !selectedTags.some(selectedTag => selectedTag.id === tag.id)
        ));
      } catch (err) {
        console.error('Error fetching tags:', err);
        toast({
          title: 'Error',
          description: 'Failed to load tags. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingTags(false);
      }
    };

    // Initialize custom fields from lead data
    if (lead.customFields) {
      const fieldArray = Object.entries(lead.customFields).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setCustomFields(fieldArray);
    }

    fetchTeamMembers();
    fetchTags();
  }, [toast, selectedTags, lead.customFields]);

  const handleAddTag = async (tagId: string) => {
    try {
      const updatedLead = await addTagToLead(lead.id, tagId);
      const addedTag = availableTags.find(tag => tag.id === tagId);
      if (addedTag) {
        setSelectedTags([...selectedTags, addedTag]);
        setAvailableTags(availableTags.filter(tag => tag.id !== tagId));
      }
    } catch (err) {
      console.error('Error adding tag:', err);
      toast({
        title: 'Error',
        description: 'Failed to add tag. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      await removeTagFromLead(lead.id, tagId);
      const removedTag = selectedTags.find(tag => tag.id === tagId);
      if (removedTag) {
        setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
        setAvailableTags([...availableTags, removedTag]);
      }
    } catch (err) {
      console.error('Error removing tag:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove tag. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddCustomField = () => {
    if (newFieldName.trim() === '') {
      toast({
        title: 'Error',
        description: 'Field name cannot be empty',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if field already exists
    if (customFields.some(field => field.key === newFieldName)) {
      toast({
        title: 'Error',
        description: 'Field name already exists',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCustomFields([...customFields, { key: newFieldName, value: newFieldValue }]);
    setNewFieldName('');
    setNewFieldValue('');
  };

  const handleRemoveCustomField = (index: number) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };

  const updateCustomFieldValue = (index: number, value: string) => {
    const updatedFields = [...customFields];
    updatedFields[index].value = value;
    setCustomFields(updatedFields);
  };

  const onSubmit = async (data: UpdateLeadDto) => {
    try {
      setError(null);
      
      // Prepare custom fields
      if (customFields.length > 0) {
        const customFieldsObj: Record<string, any> = {};
        customFields.forEach(field => {
          customFieldsObj[field.key] = field.value;
        });
        data.customFields = customFieldsObj;
      } else {
        data.customFields = {};
      }
      
      // Update lead
      const updatedLead = await updateLead(lead.id, data);
      
      // Manually update tags as they are managed separately
      updatedLead.tags = selectedTags;
      
      onLeadUpdate(updatedLead);
      
      toast({
        title: 'Lead updated',
        description: 'Lead has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      console.error('Error updating lead:', err);
      setError('Failed to update lead. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to update lead. Please try again.',
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
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Edit Lead</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Lead Name</FormLabel>
                <Input
                  {...register('name', {
                    required: 'Lead name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    {...register('email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    placeholder="email@example.com"
                  />
                </InputGroup>
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.phone}>
                <FormLabel>Phone</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <PhoneIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    {...register('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </InputGroup>
                <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.company}>
                <FormLabel>Company</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Box as={FaBuilding} color="gray.300" />
                  </InputLeftElement>
                  <Input
                    {...register('company')}
                    placeholder="Company Name"
                  />
                </InputGroup>
                <FormErrorMessage>{errors.company?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.value}>
                <FormLabel>Value</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Box as={FaDollarSign} color="gray.300" />
                  </InputLeftElement>
                  <Input
                    {...register('value', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Value cannot be negative' }
                    })}
                    placeholder="10000"
                    type="number"
                  />
                </InputGroup>
                <FormErrorMessage>{errors.value?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.status}>
                <FormLabel>Status</FormLabel>
                <Select
                  {...register('status')}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.assignedToId}>
                <FormLabel>Assigned To</FormLabel>
                <Select
                  {...register('assignedToId')}
                  placeholder="Select team member"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.user.firstName} {member.user.lastName}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.assignedToId?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.notes}>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  {...register('notes')}
                  placeholder="Add notes about this lead..."
                  resize="vertical"
                  rows={4}
                />
                <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Custom Fields</FormLabel>
                <VStack spacing={3} align="stretch">
                  {customFields.map((field, index) => (
                    <HStack key={index}>
                      <Box flex="1">
                        <Input 
                          value={field.key} 
                          isReadOnly 
                          bg="gray.50" 
                          placeholder="Field name"
                        />
                      </Box>
                      <Box flex="1">
                        <Input 
                          value={field.value} 
                          onChange={(e) => updateCustomFieldValue(index, e.target.value)}
                          placeholder="Value"
                        />
                      </Box>
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        onClick={() => handleRemoveCustomField(index)}
                      >
                        Remove
                      </Button>
                    </HStack>
                  ))}
                  
                  <HStack>
                    <Box flex="1">
                      <Input 
                        value={newFieldName} 
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="Field name" 
                      />
                    </Box>
                    <Box flex="1">
                      <Input 
                        value={newFieldValue} 
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        placeholder="Value" 
                      />
                    </Box>
                    <Button 
                      size="sm" 
                      colorScheme="blue" 
                      onClick={handleAddCustomField}
                    >
                      Add
                    </Button>
                  </HStack>
                </VStack>
              </FormControl>

              <Box>
                <FormLabel mb={2}>Tags</FormLabel>
                <Flex wrap="wrap" gap={2} mb={2}>
                  {selectedTags.map(tag => (
                    <Tag
                      key={tag.id}
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme={tag.color ? undefined : 'gray'}
                      backgroundColor={tag.color || undefined}
                    >
                      <TagLeftIcon as={FaTag} boxSize="12px" />
                      <TagLabel>{tag.name}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTag(tag.id)} />
                    </Tag>
                  ))}
                </Flex>
                
                {availableTags.length > 0 && (
                  <Box mt={2}>
                    <Heading size="xs" mb={2}>Available Tags</Heading>
                    <Flex wrap="wrap" gap={2}>
                      {availableTags.map(tag => (
                        <Tag
                          key={tag.id}
                          size="md"
                          borderRadius="full"
                          variant="outline"
                          colorScheme={tag.color ? undefined : 'gray'}
                          color={tag.color || undefined}
                          cursor="pointer"
                          onClick={() => handleAddTag(tag.id)}
                        >
                          <TagLeftIcon as={AddIcon} boxSize="10px" />
                          <TagLabel>{tag.name}</TagLabel>
                        </Tag>
                      ))}
                    </Flex>
                  </Box>
                )}
              </Box>

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
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditLeadModal; 