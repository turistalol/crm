import {
  Box,
  Text,
  HStack,
  Badge,
  VStack,
  Icon,
  Flex,
  useDisclosure
} from '@chakra-ui/react';
import { Draggable } from 'react-beautiful-dnd';
import { Lead, LeadStatus } from '../../../types/pipeline';
import { FaUser, FaPhone, FaEnvelope, FaBuilding, FaDollarSign } from 'react-icons/fa';
import LeadDetailModal from './LeadDetailModal';

interface KanbanCardProps {
  lead: Lead;
  index: number;
}

// Define colors for lead status badges
const statusColors = {
  [LeadStatus.ACTIVE]: 'green',
  [LeadStatus.WON]: 'blue',
  [LeadStatus.LOST]: 'red',
  [LeadStatus.ARCHIVED]: 'gray'
};

const KanbanCard = ({ lead, index }: KanbanCardProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const formatCurrency = (value?: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      <Draggable draggableId={lead.id} index={index}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            bg="white"
            p={3}
            borderRadius="md"
            boxShadow={snapshot.isDragging ? 'md' : 'sm'}
            borderWidth="1px"
            borderColor={snapshot.isDragging ? 'blue.400' : 'gray.200'}
            onClick={onOpen}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ boxShadow: 'md', borderColor: 'blue.300' }}
          >
            <VStack align="stretch" spacing={2}>
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold" isTruncated>{lead.name}</Text>
                <Badge colorScheme={statusColors[lead.status]}>
                  {lead.status}
                </Badge>
              </Flex>
              
              {(lead.company || lead.value) && (
                <HStack spacing={3} mt={1}>
                  {lead.company && (
                    <Flex alignItems="center">
                      <Icon as={FaBuilding} color="gray.500" mr={1} fontSize="xs" />
                      <Text fontSize="sm" noOfLines={1}>{lead.company}</Text>
                    </Flex>
                  )}
                  
                  {lead.value && (
                    <Flex alignItems="center">
                      <Icon as={FaDollarSign} color="green.500" mr={1} fontSize="xs" />
                      <Text fontSize="sm" fontWeight="medium" color="green.600">
                        {formatCurrency(lead.value)}
                      </Text>
                    </Flex>
                  )}
                </HStack>
              )}
              
              <Box>
                {lead.tags && lead.tags.length > 0 && (
                  <HStack spacing={1} mt={1} flexWrap="wrap">
                    {lead.tags.map(tag => (
                      <Badge 
                        key={tag.id} 
                        fontSize="xs" 
                        colorScheme={tag.color ? undefined : 'gray'} 
                        bg={tag.color || undefined}
                        color={tag.color ? 'white' : undefined}
                        borderRadius="full"
                        px={2}
                        py={0.5}
                        my={0.5}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </HStack>
                )}
              </Box>
              
              {lead.assignedTo && (
                <Flex alignItems="center" mt={1}>
                  <Icon as={FaUser} color="gray.500" mr={1} fontSize="xs" />
                  <Text fontSize="xs">
                    Assigned to: {lead.assignedTo.user.firstName} {lead.assignedTo.user.lastName}
                  </Text>
                </Flex>
              )}
            </VStack>
          </Box>
        )}
      </Draggable>

      {isOpen && (
        <LeadDetailModal 
          isOpen={isOpen} 
          onClose={onClose} 
          lead={lead} 
        />
      )}
    </>
  );
};

export default KanbanCard; 