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
  Box,
  Text,
  Flex,
  VStack,
  HStack,
  Badge,
  Icon,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  useDisclosure,
  IconButton,
  Select,
  Textarea,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, EmailIcon, PhoneIcon } from '@chakra-ui/icons';
import { FaUser, FaDollarSign, FaBuilding, FaTag } from 'react-icons/fa';
import { Lead, LeadStatus } from '../../../types/pipeline';
import EditLeadModal from './EditLeadModal';
import DeleteLeadConfirmation from './DeleteLeadConfirmation';
import { updateLeadStatus } from '../../../services/pipelineService';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const statusOptions = [
  { value: LeadStatus.ACTIVE, label: 'Active', color: 'green' },
  { value: LeadStatus.WON, label: 'Won', color: 'blue' },
  { value: LeadStatus.LOST, label: 'Lost', color: 'red' },
  { value: LeadStatus.ARCHIVED, label: 'Archived', color: 'gray' },
];

const LeadDetailModal = ({ isOpen, onClose, lead }: LeadDetailModalProps) => {
  const [currentLead, setCurrentLead] = useState<Lead>(lead);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const toast = useToast();
  
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as LeadStatus;
    
    if (newStatus === currentLead.status) return;
    
    try {
      setIsStatusChanging(true);
      const updatedLead = await updateLeadStatus(currentLead.id, newStatus);
      setCurrentLead(updatedLead);
      toast({
        title: 'Lead status updated',
        description: `Lead status has been changed to ${newStatus.toLowerCase()}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead status. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsStatusChanging(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setCurrentLead(updatedLead);
    onEditClose();
  };

  const handleLeadDeleted = () => {
    onDeleteClose();
    onClose();
    toast({
      title: 'Lead deleted',
      description: 'The lead has been deleted successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex justifyContent="space-between" alignItems="center">
              <Text>{currentLead.name}</Text>
              <HStack>
                <IconButton
                  aria-label="Edit lead"
                  icon={<EditIcon />}
                  size="sm"
                  onClick={onEditOpen}
                />
                <IconButton
                  aria-label="Delete lead"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={onDeleteOpen}
                />
              </HStack>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs isFitted variant="enclosed">
              <TabList mb="1em">
                <Tab>Details</Tab>
                <Tab>Notes</Tab>
                <Tab>Custom Fields</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Flex justifyContent="space-between" alignItems="center">
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.600">
                          Status
                        </Text>
                        <Select
                          value={currentLead.status}
                          onChange={handleStatusChange}
                          isDisabled={isStatusChanging}
                          width="200px"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.600">
                          Value
                        </Text>
                        <Flex alignItems="center">
                          <Icon as={FaDollarSign} color="green.500" mr={1} />
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            {formatCurrency(currentLead.value)}
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>

                    <Divider />

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">
                        Contact Information
                      </Text>
                      <VStack align="stretch" mt={2} spacing={2}>
                        {currentLead.email && (
                          <Flex alignItems="center">
                            <Icon as={EmailIcon} mr={2} color="blue.500" />
                            <Text>{currentLead.email}</Text>
                          </Flex>
                        )}
                        {currentLead.phone && (
                          <Flex alignItems="center">
                            <Icon as={PhoneIcon} mr={2} color="green.500" />
                            <Text>{currentLead.phone}</Text>
                          </Flex>
                        )}
                        {currentLead.company && (
                          <Flex alignItems="center">
                            <Icon as={FaBuilding} mr={2} color="purple.500" />
                            <Text>{currentLead.company}</Text>
                          </Flex>
                        )}
                      </VStack>
                    </Box>

                    <Divider />

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">
                        Assigned To
                      </Text>
                      {currentLead.assignedTo ? (
                        <Flex alignItems="center" mt={2}>
                          <Icon as={FaUser} mr={2} color="gray.500" />
                          <Text>
                            {currentLead.assignedTo.user.firstName} {currentLead.assignedTo.user.lastName}
                          </Text>
                        </Flex>
                      ) : (
                        <Text color="gray.500" mt={2}>Not assigned</Text>
                      )}
                    </Box>

                    {currentLead.tags && currentLead.tags.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" color="gray.600">
                            Tags
                          </Text>
                          <Flex mt={2} flexWrap="wrap" gap={2}>
                            {currentLead.tags.map(tag => (
                              <Badge
                                key={tag.id}
                                borderRadius="full"
                                px={3}
                                py={1}
                                colorScheme={tag.color ? undefined : 'gray'}
                                bg={tag.color || undefined}
                                color={tag.color ? 'white' : undefined}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </Flex>
                        </Box>
                      </>
                    )}
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this lead..."
                      minHeight="200px"
                      resize="vertical"
                    />
                    <Flex justifyContent="flex-end">
                      <Button colorScheme="blue" size="sm">
                        Save Notes
                      </Button>
                    </Flex>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    {currentLead.customFields && Object.keys(currentLead.customFields).length > 0 ? (
                      Object.entries(currentLead.customFields).map(([key, value]) => (
                        <Box key={key}>
                          <Text fontWeight="bold" fontSize="sm" color="gray.600">
                            {key}
                          </Text>
                          <Text mt={1}>{String(value)}</Text>
                          <Divider mt={2} />
                        </Box>
                      ))
                    ) : (
                      <Text color="gray.500">No custom fields available</Text>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {isEditOpen && (
        <EditLeadModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          lead={currentLead}
          onLeadUpdate={handleLeadUpdate}
        />
      )}

      {isDeleteOpen && (
        <DeleteLeadConfirmation
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          lead={currentLead}
          onLeadDeleted={handleLeadDeleted}
        />
      )}
    </>
  );
};

export default LeadDetailModal; 