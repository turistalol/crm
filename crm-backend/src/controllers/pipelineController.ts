import { Request, Response } from 'express';
import pipelineService from '../services/pipelineService';

export const getPipelines = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId;
    const pipelines = await pipelineService.findAll(teamId);
    return res.status(200).json(pipelines);
  } catch (error) {
    console.error('Error getting pipelines:', error);
    return res.status(500).json({ message: 'Failed to get pipelines', error });
  }
};

export const getPipeline = async (req: Request, res: Response) => {
  try {
    const pipelineId = req.params.id;
    const pipeline = await pipelineService.findById(pipelineId);

    if (!pipeline) {
      return res.status(404).json({ message: 'Pipeline not found' });
    }

    return res.status(200).json(pipeline);
  } catch (error) {
    console.error('Error getting pipeline:', error);
    return res.status(500).json({ message: 'Failed to get pipeline', error });
  }
};

export const createPipeline = async (req: Request, res: Response) => {
  try {
    const pipelineData = req.body;
    const pipeline = await pipelineService.create(pipelineData);
    return res.status(201).json(pipeline);
  } catch (error) {
    console.error('Error creating pipeline:', error);
    return res.status(500).json({ message: 'Failed to create pipeline', error });
  }
};

export const updatePipeline = async (req: Request, res: Response) => {
  try {
    const pipelineId = req.params.id;
    const pipelineData = req.body;
    const pipeline = await pipelineService.update(pipelineId, pipelineData);
    return res.status(200).json(pipeline);
  } catch (error) {
    console.error('Error updating pipeline:', error);
    return res.status(500).json({ message: 'Failed to update pipeline', error });
  }
};

export const deletePipeline = async (req: Request, res: Response) => {
  try {
    const pipelineId = req.params.id;
    await pipelineService.delete(pipelineId);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting pipeline:', error);
    return res.status(500).json({ message: 'Failed to delete pipeline', error });
  }
};

export const createStage = async (req: Request, res: Response) => {
  try {
    const pipelineId = req.params.pipelineId;
    const stageData = req.body;
    const stage = await pipelineService.createStage(pipelineId, stageData);
    return res.status(201).json(stage);
  } catch (error) {
    console.error('Error creating stage:', error);
    return res.status(500).json({ message: 'Failed to create stage', error });
  }
};

export const updateStage = async (req: Request, res: Response) => {
  try {
    const stageId = req.params.id;
    const stageData = req.body;
    const stage = await pipelineService.updateStage(stageId, stageData);
    return res.status(200).json(stage);
  } catch (error) {
    console.error('Error updating stage:', error);
    return res.status(500).json({ message: 'Failed to update stage', error });
  }
};

export const deleteStage = async (req: Request, res: Response) => {
  try {
    const stageId = req.params.id;
    await pipelineService.deleteStage(stageId);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting stage:', error);
    return res.status(500).json({ message: 'Failed to delete stage', error });
  }
};

export const reorderStages = async (req: Request, res: Response) => {
  try {
    const pipelineId = req.params.pipelineId;
    const { stageIds } = req.body;
    const stages = await pipelineService.reorderStages(pipelineId, stageIds);
    return res.status(200).json(stages);
  } catch (error) {
    console.error('Error reordering stages:', error);
    return res.status(500).json({ message: 'Failed to reorder stages', error });
  }
}; 