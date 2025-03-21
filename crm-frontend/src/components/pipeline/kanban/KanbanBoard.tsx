import { useState, useEffect } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Pipeline, Stage, Lead } from '../../../types/pipeline';
import { moveLeadToStage, updateStage, reorderStages } from '../../../services/pipelineService';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  pipeline: Pipeline;
  setPipeline: React.Dispatch<React.SetStateAction<Pipeline | null>>;
}

const KanbanBoard = ({ pipeline, setPipeline }: KanbanBoardProps) => {
  const [isReordering, setIsReordering] = useState(false);
  const toast = useToast();

  // Sort stages by order
  useEffect(() => {
    if (pipeline && pipeline.stages) {
      const sortedStages = [...pipeline.stages].sort((a, b) => a.order - b.order);
      if (JSON.stringify(sortedStages) !== JSON.stringify(pipeline.stages)) {
        setPipeline({
          ...pipeline,
          stages: sortedStages
        });
      }
    }
  }, [pipeline, setPipeline]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // No change
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Handle column (stage) reordering
    if (type === 'COLUMN') {
      const newStageOrder = Array.from(pipeline.stages);
      const [movedStage] = newStageOrder.splice(source.index, 1);
      newStageOrder.splice(destination.index, 0, movedStage);

      // Update the order property
      const updatedStages = newStageOrder.map((stage, index) => ({
        ...stage,
        order: index
      }));

      // Update the UI immediately
      setPipeline({
        ...pipeline,
        stages: updatedStages
      });

      // Update the backend
      try {
        setIsReordering(true);
        await reorderStages(
          pipeline.id,
          updatedStages.map(stage => stage.id)
        );
      } catch (error) {
        console.error('Error reordering stages:', error);
        toast({
          title: 'Error',
          description: 'Failed to update stage order. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        // Revert the UI if the API call failed
        setPipeline({
          ...pipeline,
          stages: [...pipeline.stages].sort((a, b) => a.order - b.order)
        });
      } finally {
        setIsReordering(false);
      }
      
      return;
    }

    // Handle lead moving between columns
    const sourceStageId = source.droppableId;
    const destStageId = destination.droppableId;
    const leadId = draggableId;

    // Find the stages
    const sourceStage = pipeline.stages.find(stage => stage.id === sourceStageId);
    const destStage = pipeline.stages.find(stage => stage.id === destStageId);

    if (!sourceStage || !destStage || !sourceStage.leads || !destStage.leads) return;

    // If moving within the same column
    if (sourceStageId === destStageId) {
      const newLeads = Array.from(sourceStage.leads);
      const [movedLead] = newLeads.splice(source.index, 1);
      newLeads.splice(destination.index, 0, movedLead);

      const updatedStages = pipeline.stages.map(stage => {
        if (stage.id === sourceStageId) {
          return {
            ...stage,
            leads: newLeads
          };
        }
        return stage;
      });

      setPipeline({
        ...pipeline,
        stages: updatedStages
      });

      return;
    }

    // Moving between columns
    const sourceLeads = Array.from(sourceStage.leads);
    const [movedLead] = sourceLeads.splice(source.index, 1);
    const destLeads = destStage.leads ? Array.from(destStage.leads) : [];
    destLeads.splice(destination.index, 0, {
      ...movedLead,
      stageId: destStageId
    });

    // Update UI immediately
    const updatedStages = pipeline.stages.map(stage => {
      if (stage.id === sourceStageId) {
        return {
          ...stage,
          leads: sourceLeads
        };
      }
      if (stage.id === destStageId) {
        return {
          ...stage,
          leads: destLeads
        };
      }
      return stage;
    });

    setPipeline({
      ...pipeline,
      stages: updatedStages
    });

    // Update backend
    try {
      await moveLeadToStage(leadId, destStageId);
    } catch (error) {
      console.error('Error moving lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to move lead. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });

      // Revert the UI if the API call failed
      setPipeline({ ...pipeline });
    }
  };

  const handleStageUpdate = (updatedStage: Stage) => {
    // Update the pipeline with the updated stage
    const updatedStages = pipeline.stages.map(stage => 
      stage.id === updatedStage.id ? updatedStage : stage
    );
    
    setPipeline({
      ...pipeline,
      stages: updatedStages
    });
  };

  const handleStageDeleted = (stageId: string) => {
    // Filter out the deleted stage
    const updatedStages = pipeline.stages.filter(stage => stage.id !== stageId);
    
    // Update the order of the remaining stages
    const reorderedStages = updatedStages.map((stage, index) => ({
      ...stage,
      order: index
    }));
    
    setPipeline({
      ...pipeline,
      stages: reorderedStages
    });
  };

  const handleLeadCreated = (newLead: Lead) => {
    // Find the stage where the lead was added
    const updatedStages = pipeline.stages.map(stage => {
      if (stage.id === newLead.stageId) {
        return {
          ...stage,
          leads: [...(stage.leads || []), newLead]
        };
      }
      return stage;
    });
    
    setPipeline({
      ...pipeline,
      stages: updatedStages
    });
  };

  return (
    <Box 
      width="100%" 
      overflowX="auto"
      css={{
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Box 
          display="flex" 
          minHeight="70vh" 
          paddingBottom="4"
          paddingRight="4"
          minWidth={pipeline.stages.length * 350 > window.innerWidth ? `${pipeline.stages.length * 350}px` : '100%'}
        >
          {pipeline.stages.map((stage, index) => (
            <KanbanColumn 
              key={stage.id}
              stage={stage}
              index={index}
              pipelineId={pipeline.id}
              isReordering={isReordering}
              onStageUpdate={handleStageUpdate}
              onStageDeleted={handleStageDeleted}
              onLeadCreated={handleLeadCreated}
            />
          ))}
        </Box>
      </DragDropContext>
    </Box>
  );
};

export default KanbanBoard; 