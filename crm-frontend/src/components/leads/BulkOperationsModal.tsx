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
  Select,
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
  Flex,
  Box,
  Text,
  useToast,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  Textarea,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { Lead, Stage, LeadStatus } from '../../types/pipeline';

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: Lead[];
  stages: Stage[];
  onBulkUpdate: (
    leadIds: string[],
    updates: {
      stageId?: string;
      status?: LeadStatus;
      value?: number;
      assignedToId?: string | null;
      tags?: string[];
    }
  ) => Promise<void>;
}

const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  isOpen,
  onClose,
  selectedLeads,
  stages,
  onBulkUpdate,
}) => {
  const [operation, setOperation] = useState<'stage' | 'status' | 'value' | 'assign' | 'tags'>('stage');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(LeadStatus.OPEN);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useToast();
  const tagBg = useColorModeValue('gray.100', 'gray.700');
  
  const handleSubmit = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: 'No leads selected',
        description: 'Please select at least one lead to perform bulk operations.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const leadIds = selectedLeads.map(lead => lead.id);
      const updates: any = {};
      
      switch (operation) {
        case 'stage':
          if (!selectedStageId) {
            throw new Error('Please select a stage');
          }
          updates.stageId = selectedStageId;
          break;
        case 'status':
          updates.status = selectedStatus;
          break;
        case 'value':
          if (selectedValue === null) {
            throw new Error('Please enter a value');
          }
          updates.value = selectedValue;
          break;
        case 'assign':
          updates.assignedToId = selectedAssigneeId;
          break;
        case 'tags':
          if (selectedTags.length === 0) {
            throw new Error('Please add at least one tag');
          }
          updates.tags = selectedTags;
          break;
      }
      
      await onBulkUpdate(leadIds, updates);
      
      toast({
        title: 'Success',
        description: `Successfully updated ${leadIds.length} leads.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update leads. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTagAdd = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleTagAdd();
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bulk Update ({selectedLeads.length} leads)</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Text mb={4}>
            You are about to update {selectedLeads.length} leads. Choose the operation and details below.
          </Text>
          
          <Divider my={3} />
          
          <FormControl mb={4}>
            <FormLabel>Operation Type</FormLabel>
            <RadioGroup value={operation} onChange={(value) => setOperation(value as any)}>
              <Stack spacing={2}>
                <Radio value="stage">Change Stage</Radio>
                <Radio value="status">Update Status</Radio>
                <Radio value="value">Set Deal Value</Radio>
                <Radio value="assign">Assign to User</Radio>
                <Radio value="tags">Manage Tags</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          
          <Divider my={3} />
          
          {operation === 'stage' && (
            <FormControl>
              <FormLabel>Target Stage</FormLabel>
              <Select 
                placeholder="Select stage" 
                value={selectedStageId} 
                onChange={(e) => setSelectedStageId(e.target.value)}
              >
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          
          {operation === 'status' && (
            <FormControl>
              <FormLabel>Target Status</FormLabel>
              <Select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
              >
                {Object.values(LeadStatus).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          
          {operation === 'value' && (
            <FormControl>
              <FormLabel>Deal Value</FormLabel>
              <NumberInput
                value={selectedValue || 0}
                onChange={(_, value) => setSelectedValue(value)}
                min={0}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          )}
          
          {operation === 'assign' && (
            <FormControl>
              <FormLabel>Assign To</FormLabel>
              <Select 
                placeholder="Select user" 
                value={selectedAssigneeId || ''} 
                onChange={(e) => setSelectedAssigneeId(e.target.value || null)}
              >
                <option value="">Unassigned</option>
                {/* 
                  In a real implementation, you would fetch users from API 
                  and map them to options here
                */}
                <option value="user1">User 1</option>
                <option value="user2">User 2</option>
              </Select>
            </FormControl>
          )}
          
          {operation === 'tags' && (
            <FormControl>
              <FormLabel>Tags</FormLabel>
              <HStack mb={2}>
                <Textarea
                  placeholder="Enter tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  size="sm"
                />
                <Button onClick={handleTagAdd} size="sm">Add</Button>
              </HStack>
              
              <Box mt={2}>
                <Flex wrap="wrap" gap={2}>
                  {selectedTags.map(tag => (
                    <Tag
                      size="md"
                      key={tag}
                      borderRadius="full"
                      variant="solid"
                      colorScheme="blue"
                      background={tagBg}
                      color="gray.800"
                    >
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleTagRemove(tag)} />
                    </Tag>
                  ))}
                </Flex>
              </Box>
            </FormControl>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit} 
            isLoading={isSubmitting}
            isDisabled={
              (operation === 'stage' && !selectedStageId) || 
              (operation === 'tags' && selectedTags.length === 0)
            }
          >
            Update Leads
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkOperationsModal; 