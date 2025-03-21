import { TeamMember } from './team';

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  stages: Stage[];
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: string;
  name: string;
  description?: string;
  color?: string;
  order: number;
  pipelineId: string;
  leads?: Lead[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  value?: number;
  status: LeadStatus;
  notes?: string;
  pipelineId: string;
  stageId: string;
  assignedToId?: string;
  assignedTo?: TeamMember;
  customFields?: Record<string, any>;
  tags?: LeadTag[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadTag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export enum LeadStatus {
  ACTIVE = 'ACTIVE',
  WON = 'WON',
  LOST = 'LOST',
  ARCHIVED = 'ARCHIVED'
}

export interface CreatePipelineDto {
  name: string;
  description?: string;
  teamId: string;
  initialStages?: Omit<CreateStageDto, 'pipelineId'>[];
}

export interface UpdatePipelineDto {
  name?: string;
  description?: string;
}

export interface CreateStageDto {
  name: string;
  description?: string;
  color?: string;
  order: number;
  pipelineId: string;
}

export interface UpdateStageDto {
  name?: string;
  description?: string;
  color?: string;
  order?: number;
}

export interface CreateLeadDto {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  value?: number;
  notes?: string;
  pipelineId: string;
  stageId: string;
  assignedToId?: string;
  customFields?: Record<string, any>;
  tags?: string[];
}

export interface UpdateLeadDto {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  value?: number;
  status?: LeadStatus;
  notes?: string;
  stageId?: string;
  assignedToId?: string;
  customFields?: Record<string, any>;
} 