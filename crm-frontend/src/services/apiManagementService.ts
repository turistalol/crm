import api from './api';
import { 
  ApiKey, 
  CreateApiKeyDto, 
  UpdateApiKeyDto, 
  Webhook, 
  CreateWebhookDto, 
  UpdateWebhookDto 
} from '../types/api';

/**
 * Service for handling API keys and webhook management
 */
class ApiManagementService {
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
  async createApiKey(data: CreateApiKeyDto): Promise<ApiKey> {
    const response = await api.post('/api-keys', data);
    return response.data;
  }

  /**
   * Update an existing API key
   */
  async updateApiKey(id: string, data: UpdateApiKeyDto): Promise<ApiKey> {
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
  async createWebhook(data: CreateWebhookDto): Promise<Webhook> {
    const response = await api.post('/webhooks', data);
    return response.data;
  }

  /**
   * Update an existing webhook
   */
  async updateWebhook(id: string, data: UpdateWebhookDto): Promise<Webhook> {
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

export default new ApiManagementService(); 