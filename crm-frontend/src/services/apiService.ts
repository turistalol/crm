import axios from 'axios';
import { 
  ApiKey, 
  CreateApiKeyRequest, 
  UpdateApiKeyRequest,
  Webhook,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  Report,
  CreateReportRequest,
  UpdateReportRequest,
  PipelineMetrics,
  TeamPerformanceMetrics
} from '../types/api';
import { getAuthHeaders } from '../utils/auth';
import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API Key endpoints
export const createApiKey = async (data: CreateApiKeyRequest): Promise<ApiKey> => {
  const response = await axios.post(`${API_URL}/keys`, data, { headers: getAuthHeaders() });
  return response.data;
};

export const getApiKeys = async (companyId: string): Promise<ApiKey[]> => {
  const response = await axios.get(`${API_URL}/keys/company/${companyId}`, { headers: getAuthHeaders() });
  return response.data;
};

export const getApiKeyById = async (id: string): Promise<ApiKey> => {
  const response = await axios.get(`${API_URL}/keys/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export const updateApiKey = async (id: string, data: UpdateApiKeyRequest): Promise<ApiKey> => {
  const response = await axios.put(`${API_URL}/keys/${id}`, data, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteApiKey = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/keys/${id}`, { headers: getAuthHeaders() });
};

// Webhook endpoints
export const createWebhook = async (data: CreateWebhookRequest): Promise<Webhook> => {
  const response = await axios.post(`${API_URL}/webhooks`, data, { headers: getAuthHeaders() });
  return response.data;
};

export const getWebhooks = async (companyId: string): Promise<Webhook[]> => {
  const response = await axios.get(`${API_URL}/webhooks/company/${companyId}`, { headers: getAuthHeaders() });
  return response.data;
};

export const getWebhookById = async (id: string): Promise<Webhook> => {
  const response = await axios.get(`${API_URL}/webhooks/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export const updateWebhook = async (id: string, data: UpdateWebhookRequest): Promise<Webhook> => {
  const response = await axios.put(`${API_URL}/webhooks/${id}`, data, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteWebhook = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/webhooks/${id}`, { headers: getAuthHeaders() });
};

// Report endpoints
export const createReport = async (data: CreateReportRequest): Promise<Report> => {
  const response = await axios.post(`${API_URL}/reports`, data, { headers: getAuthHeaders() });
  return response.data;
};

export const getReports = async (companyId: string): Promise<Report[]> => {
  const response = await axios.get(`${API_URL}/reports/company/${companyId}`, { headers: getAuthHeaders() });
  return response.data;
};

export const getReportById = async (id: string): Promise<Report> => {
  const response = await axios.get(`${API_URL}/reports/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export const updateReport = async (id: string, data: UpdateReportRequest): Promise<Report> => {
  const response = await axios.put(`${API_URL}/reports/${id}`, data, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteReport = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/reports/${id}`, { headers: getAuthHeaders() });
};

// Metrics endpoints
export const getPipelineMetrics = async (pipelineId: string, dateRange?: { start: Date; end: Date }): Promise<PipelineMetrics> => {
  let url = `${API_URL}/metrics/pipeline/${pipelineId}`;
  
  if (dateRange) {
    const startDate = dateRange.start.toISOString().split('T')[0];
    const endDate = dateRange.end.toISOString().split('T')[0];
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
};

export const getTeamMetrics = async (teamId: string, dateRange?: { start: Date; end: Date }): Promise<TeamPerformanceMetrics> => {
  let url = `${API_URL}/metrics/team/${teamId}`;
  
  if (dateRange) {
    const startDate = dateRange.start.toISOString().split('T')[0];
    const endDate = dateRange.end.toISOString().split('T')[0];
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
};

/**
 * Service for handling API keys and webhook management
 */
class ApiService {
  // API Key management
  
  /**
   * Get all API keys for a company
   */
  async getApiKeys(companyId: string): Promise<ApiKey[]> {
    const response = await api.get(`/api-keys?companyId=${companyId}`);
    return response.data;
  }

  /**
   * Get a specific API key by ID
   */
  async getApiKeyById(id: string): Promise<ApiKey> {
    const response = await api.get(`/api-keys/${id}`);
    return response.data;
  }

  /**
   * Create a new API key
   */
  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKey> {
    const response = await api.post('/api-keys', data);
    return response.data;
  }

  /**
   * Update an existing API key
   */
  async updateApiKey(id: string, data: UpdateApiKeyRequest): Promise<ApiKey> {
    const response = await api.put(`/api-keys/${id}`, data);
    return response.data;
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(id: string): Promise<void> {
    await api.delete(`/api-keys/${id}`);
  }

  // Webhook management
  
  /**
   * Get all webhooks for a company
   */
  async getWebhooks(companyId: string): Promise<Webhook[]> {
    const response = await api.get(`/webhooks?companyId=${companyId}`);
    return response.data;
  }

  /**
   * Get a specific webhook by ID
   */
  async getWebhookById(id: string): Promise<Webhook> {
    const response = await api.get(`/webhooks/${id}`);
    return response.data;
  }

  /**
   * Create a new webhook
   */
  async createWebhook(data: CreateWebhookRequest): Promise<Webhook> {
    const response = await api.post('/webhooks', data);
    return response.data;
  }

  /**
   * Update an existing webhook
   */
  async updateWebhook(id: string, data: UpdateWebhookRequest): Promise<Webhook> {
    const response = await api.put(`/webhooks/${id}`, data);
    return response.data;
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    await api.delete(`/webhooks/${id}`);
  }

  /**
   * Test a webhook
   */
  async testWebhook(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/webhooks/${id}/test`);
    return response.data;
  }
  
  /**
   * Get API documentation
   */
  async getApiDocumentation(): Promise<string> {
    const response = await api.get('/api-docs');
    return response.data;
  }
}

export default new ApiService(); 