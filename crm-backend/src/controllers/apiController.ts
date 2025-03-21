import { Request, Response } from 'express';
import apiKeyService from '../services/apiKeyService';
import webhookService from '../services/webhookService';
import reportService from '../services/reportService';
import { logger } from '../utils/logger';

export class ApiController {
  // API Keys endpoints
  async createApiKey(req: Request, res: Response) {
    try {
      const { name, companyId } = req.body;
      
      if (!name || !companyId) {
        return res.status(400).json({ message: 'Name and companyId are required' });
      }
      
      const apiKey = await apiKeyService.createApiKey({ name, companyId });
      
      return res.status(201).json(apiKey);
    } catch (error) {
      logger.error('Error creating API key:', error);
      return res.status(500).json({ message: 'Failed to create API key' });
    }
  }
  
  async getApiKeys(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
      
      const apiKeys = await apiKeyService.getApiKeys(companyId);
      
      return res.status(200).json(apiKeys);
    } catch (error) {
      logger.error('Error fetching API keys:', error);
      return res.status(500).json({ message: 'Failed to fetch API keys' });
    }
  }
  
  async getApiKeyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const apiKey = await apiKeyService.getApiKeyById(id);
      
      if (!apiKey) {
        return res.status(404).json({ message: 'API key not found' });
      }
      
      return res.status(200).json(apiKey);
    } catch (error) {
      logger.error(`Error fetching API key with id ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to fetch API key' });
    }
  }
  
  async updateApiKey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, isActive } = req.body;
      
      if (!name && isActive === undefined) {
        return res.status(400).json({ message: 'At least one field to update is required' });
      }
      
      const apiKey = await apiKeyService.updateApiKey(id, { name, isActive });
      
      return res.status(200).json(apiKey);
    } catch (error) {
      logger.error(`Error updating API key with id ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to update API key' });
    }
  }
  
  async deleteApiKey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await apiKeyService.deleteApiKey(id);
      
      return res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting API key with id ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to delete API key' });
    }
  }
  
  // Webhooks endpoints
  async createWebhook(req: Request, res: Response) {
    try {
      const { name, url, events, companyId } = req.body;
      
      if (!name || !url || !events || !companyId) {
        return res.status(400).json({ 
          message: 'Name, URL, events, and companyId are required' 
        });
      }
      
      const webhook = await webhookService.createWebhook({ 
        name, 
        url, 
        events, 
        companyId 
      });
      
      return res.status(201).json(webhook);
    } catch (error) {
      logger.error('Error creating webhook:', error);
      return res.status(500).json({ message: 'Failed to create webhook' });
    }
  }
  
  async getWebhooks(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
      
      const webhooks = await webhookService.getWebhooks(companyId);
      
      return res.status(200).json(webhooks);
    } catch (error) {
      logger.error('Error fetching webhooks:', error);
      return res.status(500).json({ message: 'Failed to fetch webhooks' });
    }
  }
  
  async getWebhookById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const webhook = await webhookService.getWebhookById(id);
      
      if (!webhook) {
        return res.status(404).json({ message: 'Webhook not found' });
      }
      
      return res.status(200).json(webhook);
    } catch (error) {
      logger.error(`Error fetching webhook with id ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to fetch webhook' });
    }
  }
  
  async updateWebhook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, url, events, isActive } = req.body;
      
      if (!name && !url && !events && isActive === undefined) {
        return res.status(400).json({ 
          message: 'At least one field to update is required'
        });
      }
      
      const webhook = await webhookService.updateWebhook(id, { 
        name, 
        url, 
        events, 
        isActive 
      });
      
      return res.status(200).json(webhook);
    } catch (error) {
      logger.error(`Error updating webhook with id ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to update webhook' });
    }
  }
  
  async deleteWebhook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await webhookService.deleteWebhook(id);
      
      return res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting webhook with id ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to delete webhook' });
    }
  }
  
  // Reports endpoints
  async createReport(req: Request, res: Response) {
    try {
      const { name, type, filters, companyId, createdById } = req.body;
      
      if (!name || !type || !companyId || !createdById) {
        return res.status(400).json({ 
          message: 'Name, type, companyId, and createdById are required' 
        });
      }
      
      const report = await reportService.createReport({
        name,
        type,
        filters,
        companyId,
        createdById
      });
      
      return res.status(201).json(report);
    } catch (error) {
      logger.error('Error creating report:', error);
      return res.status(500).json({ message: 'Failed to create report' });
    }
  }
  
  async getReports(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
      
      const reports = await reportService.getReports(companyId);
      
      return res.status(200).json(reports);
    } catch (error) {
      logger.error('Error fetching reports:', error);
      return res.status(500).json({ message: 'Failed to fetch reports' });
    }
  }
  
  async getReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const report = await reportService.getReportById(id);
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      return res.status(200).json(report);
    } catch (error) {
      logger.error(`Error fetching report with id ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to fetch report' });
    }
  }
  
  async updateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, filters } = req.body;
      
      if (!name && !filters) {
        return res.status(400).json({ 
          message: 'At least one field to update is required'
        });
      }
      
      const report = await reportService.updateReport(id, { name, filters });
      
      return res.status(200).json(report);
    } catch (error) {
      logger.error(`Error updating report with id ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to update report' });
    }
  }
  
  async deleteReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await reportService.deleteReport(id);
      
      return res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting report with id ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Failed to delete report' });
    }
  }
  
  // Metrics endpoints
  async getPipelineMetrics(req: Request, res: Response) {
    try {
      const { pipelineId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!pipelineId) {
        return res.status(400).json({ message: 'Pipeline ID is required' });
      }
      
      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string),
        };
      }
      
      const metrics = await reportService.getPipelineMetrics(pipelineId, dateRange);
      
      return res.status(200).json(metrics);
    } catch (error) {
      logger.error(`Error generating pipeline metrics for ${req.params.pipelineId}:`, error);
      return res.status(500).json({ message: 'Failed to generate pipeline metrics' });
    }
  }
  
  async getTeamMetrics(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!teamId) {
        return res.status(400).json({ message: 'Team ID is required' });
      }
      
      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string),
        };
      }
      
      const metrics = await reportService.getTeamPerformanceMetrics(teamId, dateRange);
      
      return res.status(200).json(metrics);
    } catch (error) {
      logger.error(`Error generating team metrics for ${req.params.teamId}:`, error);
      return res.status(500).json({ message: 'Failed to generate team metrics' });
    }
  }
}

export default new ApiController(); 