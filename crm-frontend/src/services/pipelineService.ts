import api from './api';
import { 
  Pipeline, 
  Stage, 
  Lead, 
  LeadTag, 
  CreatePipelineDto, 
  UpdatePipelineDto,
  CreateStageDto,
  UpdateStageDto,
  CreateLeadDto,
  UpdateLeadDto,
  LeadStatus
} from '../types/pipeline';

// Pipeline API endpoints
export const getPipelines = async (teamId?: string): Promise<Pipeline[]> => {
  const url = teamId ? `/pipelines?teamId=${teamId}` : '/pipelines';
  const response = await api.get(url);
  return response.data;
};

export const getPipelineById = async (id: string): Promise<Pipeline> => {
  const response = await api.get(`/pipelines/${id}`);
  return response.data;
};

export const createPipeline = async (data: CreatePipelineDto): Promise<Pipeline> => {
  const response = await api.post('/pipelines', data);
  return response.data;
};

export const updatePipeline = async (id: string, data: UpdatePipelineDto): Promise<Pipeline> => {
  const response = await api.put(`/pipelines/${id}`, data);
  return response.data;
};

export const deletePipeline = async (id: string): Promise<void> => {
  await api.delete(`/pipelines/${id}`);
};

// Stage API endpoints
export const getStages = async (pipelineId: string): Promise<Stage[]> => {
  const response = await api.get(`/pipelines/${pipelineId}/stages`);
  return response.data;
};

export const createStage = async (data: CreateStageDto): Promise<Stage> => {
  const response = await api.post(`/pipelines/${data.pipelineId}/stages`, data);
  return response.data;
};

export const updateStage = async (pipelineId: string, stageId: string, data: UpdateStageDto): Promise<Stage> => {
  const response = await api.put(`/pipelines/${pipelineId}/stages/${stageId}`, data);
  return response.data;
};

export const deleteStage = async (pipelineId: string, stageId: string): Promise<void> => {
  await api.delete(`/pipelines/${pipelineId}/stages/${stageId}`);
};

export const reorderStages = async (pipelineId: string, stageIds: string[]): Promise<Stage[]> => {
  const response = await api.post(`/pipelines/${pipelineId}/stages/reorder`, { stageIds });
  return response.data;
};

// Lead API endpoints
export const getLeads = async (
  pipelineId?: string, 
  stageId?: string, 
  status?: LeadStatus
): Promise<Lead[]> => {
  let url = '/leads?';
  
  if (pipelineId) url += `pipelineId=${pipelineId}&`;
  if (stageId) url += `stageId=${stageId}&`;
  if (status) url += `status=${status}&`;
  
  // Remove trailing '&' or '?'
  url = url.replace(/[&?]$/, '');
  
  const response = await api.get(url);
  return response.data;
};

export const getLeadById = async (id: string): Promise<Lead> => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

export const createLead = async (data: CreateLeadDto): Promise<Lead> => {
  const response = await api.post('/leads', data);
  return response.data;
};

export const updateLead = async (id: string, data: UpdateLeadDto): Promise<Lead> => {
  const response = await api.put(`/leads/${id}`, data);
  return response.data;
};

export const deleteLead = async (id: string): Promise<void> => {
  await api.delete(`/leads/${id}`);
};

export const moveLeadToStage = async (
  leadId: string, 
  stageId: string
): Promise<Lead> => {
  const response = await api.patch(`/leads/${leadId}/stage`, { stageId });
  return response.data;
};

export const updateLeadStatus = async (
  leadId: string, 
  status: LeadStatus
): Promise<Lead> => {
  const response = await api.patch(`/leads/${leadId}/status`, { status });
  return response.data;
};

// Tags API endpoints
export const getLeadTags = async (): Promise<LeadTag[]> => {
  const response = await api.get('/lead-tags');
  return response.data;
};

export const createLeadTag = async (
  name: string, 
  color?: string
): Promise<LeadTag> => {
  const response = await api.post('/lead-tags', { name, color });
  return response.data;
};

export const deleteLeadTag = async (id: string): Promise<void> => {
  await api.delete(`/lead-tags/${id}`);
};

export const addTagToLead = async (leadId: string, tagId: string): Promise<Lead> => {
  const response = await api.post(`/leads/${leadId}/tags`, { tagId });
  return response.data;
};

export const removeTagFromLead = async (leadId: string, tagId: string): Promise<Lead> => {
  const response = await api.delete(`/leads/${leadId}/tags/${tagId}`);
  return response.data;
};

// Bulk operations
export const bulkUpdateLeads = async (
  leadIds: string[],
  updates: {
    stageId?: string;
    status?: LeadStatus;
    value?: number;
    assignedToId?: string | null;
    tags?: string[];
  }
): Promise<void> => {
  await api.post('/leads/bulk-update', { leadIds, updates });
}; 