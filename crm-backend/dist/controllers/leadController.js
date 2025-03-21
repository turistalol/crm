import { Request, Response, NextFunction } from 'express';
import leadService from '../services/leadService';
import { LeadStatus } from '@prisma/client';

export const getLeads = async (req: Request, res: Response) => {
  try {
    const {
      pipelineId,
      stageId,
      assignedToId,
      status,
      search,
      minValue,
      maxValue,
    } = req.query;

    const filters: any = {};

    if (pipelineId) filters.pipelineId = pipelineId as string;
    if (stageId) filters.stageId = stageId as string;
    if (assignedToId) filters.assignedToId = assignedToId as string;
    if (status) filters.status = status as LeadStatus;
    if (search) filters.search = search as string;
    if (minValue) filters.minValue = parseFloat(minValue as string);
    if (maxValue) filters.maxValue = parseFloat(maxValue as string);

    const leads = await leadService.findAll(filters);
    return res.status(200).json(leads);
  } catch (error) {
    console.error('Error getting leads:', error);
    return res.status(500).json({ message: 'Failed to get leads', error });
  }
};

export const getLead = async (req: Request, res: Response) => {
  try {
    const leadId = req.params.id;
    const lead = await leadService.findById(leadId);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    return res.status(200).json(lead);
  } catch (error) {
    console.error('Error getting lead:', error);
    return res.status(500).json({ message: 'Failed to get lead', error });
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const leadData = req.body;
    const lead = await leadService.create(leadData);
    return res.status(201).json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    return res.status(500).json({ message: 'Failed to create lead', error });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const leadId = req.params.id;
    const leadData = req.body;
    const lead = await leadService.update(leadId, leadData);
    return res.status(200).json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return res.status(500).json({ message: 'Failed to update lead', error });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const leadId = req.params.id;
    await leadService.delete(leadId);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting lead:', error);
    return res.status(500).json({ message: 'Failed to delete lead', error });
  }
};

export const moveLeadToStage = async (req: Request, res: Response) => {
  try {
    const leadId = req.params.id;
    const { stageId } = req.body;
    const lead = await leadService.moveToStage(leadId, stageId);
    return res.status(200).json(lead);
  } catch (error) {
    console.error('Error moving lead to stage:', error);
    return res.status(500).json({ message: 'Failed to move lead to stage', error });
  }
};

export const addTagToLead = async (req: Request, res: Response) => {
  try {
    const leadId = req.params.id;
    const { tagName } = req.body;
    const lead = await leadService.addTag(leadId, tagName);
    return res.status(200).json(lead);
  } catch (error) {
    console.error('Error adding tag to lead:', error);
    return res.status(500).json({ message: 'Failed to add tag to lead', error });
  }
};

export const removeTagFromLead = async (req: Request, res: Response) => {
  try {
    const leadId = req.params.id;
    const { tagId } = req.params;
    const lead = await leadService.removeTag(leadId, tagId);
    return res.status(200).json(lead);
  } catch (error) {
    console.error('Error removing tag from lead:', error);
    return res.status(500).json({ message: 'Failed to remove tag from lead', error });
  }
};

// Bulk update leads
export const bulkUpdateLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadIds, updates } = req.body;
    
    // Validate the input
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: 'leadIds must be a non-empty array' });
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }
    
    // Process bulk update
    const result = await leadService.bulkUpdateLeads(leadIds, updates);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}; 