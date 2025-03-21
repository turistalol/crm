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
  Box,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  HStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { PhoneIcon, EmailIcon, AddIcon } from '@chakra-ui/icons';
import { FaBuilding, FaDollarSign, FaUser, FaTag } from 'react-icons/fa';
import { CreateLeadDto, Lead, LeadTag } from '../../../types/pipeline';
import { createLead, getLeadTags, addTagToLead } from '../../../services/pipelineService';
import { TeamMember } from '../../../types/team';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string;
  stageId: string;
  onLeadCreated: (lead: Lead) => void;
}

const CreateLeadModal = ({ isOpen, onClose, pipelineId, stageId, onLeadCreated }: CreateLeadModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CreateLeadDto>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      value: undefined,
      notes: '',
      pipelineId: pipelineId,
      stageId: stageId,
      assignedToId: '',
      customFields: {},
      tags: [],
    },
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableTags, setAvailableTags] = useState<LeadTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<LeadTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const toast = useToast();

  const [customFields, setCustomFields] = useState<{key: string, value: string}[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  // Fetch team members and tags on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // You could fetch team members here
        // const teamMembersResponse = await getTeamMembers(teamId);
        // setTeamMembers(teamMembersResponse);
        
        // Fetch tags
        setIsLoadingTags(true);
        const tagsResponse = await getLeadTags();
        setAvailableTags(tagsResponse);
        setIsLoadingTags(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoadingTags(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, toast]);

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

    setCustomFields([...customFields, { key: newFieldName, value: newFieldValue }]);
    setNewFieldName('');
    setNewFieldValue('');
  };

  const handleRemoveCustomField = (index: number) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };

  const onSubmit = async (data: CreateLeadDto) => {
    try {
      setError(null);
      // Add selected tag IDs to the data
      data.tags = selectedTags.map(tag => tag.id);
      
      // Add custom fields to the data
      if (customFields.length > 0) {
        const customFieldsObj: Record<string, any> = {};
        customFields.forEach(field => {
          customFieldsObj[field.key] = field.value;
        });
        data.customFields = customFieldsObj;
      }
      
      // Create the lead
      const newLead = await createLead(data);
      
      // Notify parent component
      onLeadCreated(newLead);
      
      // Reset form and close modal
      reset();
      setSelectedTags([]);
      setCustomFields([]);
      onClose();
      
      toast({
        title: 'Lead created',
        description: 'New lead has been added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error creating lead:', err);
      setError('Failed to create lead. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to create lead. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    reset();
    setSelectedTags([]);
    setCustomFields([]);
    setError(null);
    onClose();
  };

  const handleSelectTag = (tag: LeadTag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add New Lead</ModalHeader>
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
                  placeholder="John Doe"
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

              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Flex wrap="wrap" gap={2} mb={2}>
                  {selectedTags.map((tag) => (
                    <Tag 
                      key={tag.id} 
                      size="md" 
                      borderRadius="full" 
                      variant="solid" 
                      colorScheme="blue"
                    >
                      <TagLabel>{tag.name}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTag(tag.id)} />
                    </Tag>
                  ))}
                </Flex>
                <HStack>
                  <Select 
                    placeholder="Select a tag" 
                    onChange={(e) => {
                      const tagId = e.target.value;
                      if (tagId) {
                        const tag = availableTags.find(t => t.id === tagId);
                        if (tag) handleSelectTag(tag);
                        e.target.value = ""; // Reset select after selection
                      }
                    }}
                    isDisabled={isLoadingTags}
                  >
                    {availableTags
                      .filter(tag => !selectedTags.some(t => t.id === tag.id))
                      .map(tag => (
                        <option key={tag.id} value={tag.id}>
                          {tag.name}
                        </option>
                      ))
                    }
                  </Select>
                </HStack>
              </FormControl>

              {/* Custom Fields Section */}
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
                          isReadOnly 
                          bg="gray.50" 
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

              {/* Notes Section */}
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

              {/* Hidden fields */}
              <input type="hidden" {...register('pipelineId')} value={pipelineId} />
              <input type="hidden" {...register('stageId')} value={stageId} />

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
              Create Lead
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateLeadModal; 