import { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  useToast,
  HStack
} from '@chakra-ui/react';
import { AddIcon, SettingsIcon, DeleteIcon } from '@chakra-ui/icons';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Stage, Lead } from '../../../types/pipeline';
import KanbanCard from './KanbanCard';
import EditStageModal from './EditStageModal';
import CreateLeadModal from './CreateLeadModal';
import DeleteStageModal from './DeleteStageModal';

interface KanbanColumnProps {
  stage: Stage;
  index: number;
  pipelineId: string;
  isReordering: boolean;
  onStageUpdate: (updatedStage: Stage) => void;
  onStageDeleted: (stageId: string) => void;
  onLeadCreated: (newLead: Lead) => void;
}

const KanbanColumn = ({ 
  stage, 
  index, 
  pipelineId, 
  isReordering,
  onStageUpdate,
  onStageDeleted,
  onLeadCreated
}: KanbanColumnProps) => {
  const [isOver, setIsOver] = useState(false);
  const {
    isOpen: isEditStageOpen,
    onOpen: onEditStageOpen,
    onClose: onEditStageClose,
  } = useDisclosure();
  
  const {
    isOpen: isCreateLeadOpen,
    onOpen: onCreateLeadOpen,
    onClose: onCreateLeadClose,
  } = useDisclosure();
  
  const {
    isOpen: isDeleteStageOpen,
    onOpen: onDeleteStageOpen,
    onClose: onDeleteStageClose,
  } = useDisclosure();
  
  const toast = useToast();

  const handleStageUpdate = (updatedStage: Stage) => {
    onStageUpdate(updatedStage);
    onEditStageClose();
    
    toast({
      title: 'Stage updated',
      description: 'Stage has been updated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleStageDeleted = () => {
    onStageDeleted(stage.id);
    onDeleteStageClose();
  };

  const handleLeadCreated = (newLead: Lead) => {
    onLeadCreated(newLead);
    onCreateLeadClose();
  };

  return (
    <Draggable 
      draggableId={stage.id} 
      index={index} 
      isDragDisabled={isReordering}
    >
      {(provided) => (
        <Box
          width="350px"
          minWidth="350px"
          margin="0 8px"
          height="100%"
          display="flex"
          flexDirection="column"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Box
            p={3}
            borderTopRadius="md"
            bg={stage.color || 'blue.500'}
            color="white"
            {...provided.dragHandleProps}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="sm" isTruncated>{stage.name}</Heading>
              <HStack>
                <Badge
                  colorScheme="whiteAlpha"
                  fontSize="sm"
                  borderRadius="full"
                  px={2}
                >
                  {stage.leads?.length || 0}
                </Badge>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Stage options"
                    icon={<SettingsIcon />}
                    variant="ghost"
                    size="sm"
                    color="white"
                    _hover={{ bg: 'whiteAlpha.300' }}
                  />
                  <MenuList color="gray.800">
                    <MenuItem 
                      icon={<AddIcon />} 
                      onClick={onCreateLeadOpen}
                    >
                      Add Lead
                    </MenuItem>
                    <MenuItem 
                      icon={<SettingsIcon />} 
                      onClick={onEditStageOpen}
                    >
                      Edit Stage
                    </MenuItem>
                    <MenuItem 
                      icon={<DeleteIcon />} 
                      onClick={onDeleteStageOpen}
                      color="red.500"
                    >
                      Delete Stage
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </HStack>
            {stage.description && (
              <Text fontSize="xs" mt={1} noOfLines={1}>
                {stage.description}
              </Text>
            )}
          </Box>

          <Droppable droppableId={stage.id} type="LEAD">
            {(droppableProvided, droppableSnapshot) => (
              <VStack
                p={2}
                borderBottomRadius="md"
                borderWidth="1px"
                borderTop="none"
                borderColor="gray.200"
                bg={droppableSnapshot.isDraggingOver ? 'blue.50' : 'white'}
                height="100%"
                minHeight="500px"
                align="stretch"
                spacing={2}
                overflowY="auto"
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
                onMouseEnter={() => setIsOver(true)}
                onMouseLeave={() => setIsOver(false)}
                css={{
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                  },
                }}
              >
                {stage.leads && stage.leads.length > 0 ? (
                  stage.leads.map((lead, leadIndex) => (
                    <KanbanCard 
                      key={lead.id} 
                      lead={lead} 
                      index={leadIndex} 
                    />
                  ))
                ) : (
                  <Box
                    textAlign="center"
                    py={8}
                    color="gray.500"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                  >
                    <Text mb={3}>No leads in this stage</Text>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      leftIcon={<AddIcon />}
                      onClick={onCreateLeadOpen}
                    >
                      Add Lead
                    </Button>
                  </Box>
                )}
                {droppableProvided.placeholder}
              </VStack>
            )}
          </Droppable>

          {isEditStageOpen && (
            <EditStageModal
              isOpen={isEditStageOpen}
              onClose={onEditStageClose}
              stage={stage}
              onStageUpdate={handleStageUpdate}
            />
          )}

          {isCreateLeadOpen && (
            <CreateLeadModal
              isOpen={isCreateLeadOpen}
              onClose={onCreateLeadClose}
              pipelineId={pipelineId}
              stageId={stage.id}
              onLeadCreated={handleLeadCreated}
            />
          )}

          {isDeleteStageOpen && (
            <DeleteStageModal
              isOpen={isDeleteStageOpen}
              onClose={onDeleteStageClose}
              stage={stage}
              pipelineId={pipelineId}
              onStageDeleted={handleStageDeleted}
            />
          )}
        </Box>
      )}
    </Draggable>
  );
};

export default KanbanColumn; 