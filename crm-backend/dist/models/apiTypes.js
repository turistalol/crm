import { WebhookEvent, ReportType } from '@prisma/client';

// API Key types
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  companyId: string;
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApiKeyDto {
  name: string;
  companyId: string;
}

export interface UpdateApiKeyDto {
  name?: string;
  isActive?: boolean;
}

// Webhook types
export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebhookDto {
  name: string;
  url: string;
  events: WebhookEvent[];
  companyId: string;
}

export interface UpdateWebhookDto {
  name?: string;
  url?: string;
  events?: WebhookEvent[];
  isActive?: boolean;
}

// Report types
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  filters?: any;
  companyId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportDto {
  name: string;
  type: ReportType;
  filters?: any;
  companyId: string;
  createdById: string;
}

export interface UpdateReportDto {
  name?: string;
  filters?: any;
}

// Metric types for API responses
export interface PipelineMetrics {
  totalLeads: number;
  leadsByStage: {
    stageName: string;
    count: number;
    value: number;
  }[];
  conversionRate: number;
  avgDealSize: number;
  avgDealTime: number; // in days
}

export interface TeamPerformanceMetrics {
  totalLeads: number;
  totalValue: number;
  dealsWon: number;
  dealsLost: number;
  conversionRate: number;
  memberPerformance: {
    memberId: string;
    memberName: string;
    leadsCount: number;
    dealsWon: number;
    totalValue: number;
  }[];
} 