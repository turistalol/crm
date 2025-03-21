import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { CreateApiKeyDto, UpdateApiKeyDto } from '../models/apiTypes';
import prisma from '../utils/database';
import { logger } from '../utils/logger';

export class ApiKeyService {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  private generateApiKey(): string {
    return randomBytes(32).toString('hex');
  }

  async createApiKey(data: CreateApiKeyDto) {
    try {
      const key = this.generateApiKey();
      
      return await this.db.apiKey.create({
        data: {
          name: data.name,
          key,
          company: {
            connect: { id: data.companyId }
          }
        }
      });
    } catch (error) {
      logger.error('Error creating API key:', error);
      throw error;
    }
  }

  async getApiKeys(companyId: string) {
    try {
      return await this.db.apiKey.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error fetching API keys:', error);
      throw error;
    }
  }

  async getApiKeyById(id: string) {
    try {
      return await this.db.apiKey.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error fetching API key with id ${id}:`, error);
      throw error;
    }
  }

  async updateApiKey(id: string, data: UpdateApiKeyDto) {
    try {
      return await this.db.apiKey.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error(`Error updating API key with id ${id}:`, error);
      throw error;
    }
  }

  async deleteApiKey(id: string) {
    try {
      return await this.db.apiKey.delete({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error deleting API key with id ${id}:`, error);
      throw error;
    }
  }

  async validateApiKey(key: string) {
    try {
      const apiKey = await this.db.apiKey.findUnique({
        where: { key },
        include: { company: true }
      });

      if (apiKey && apiKey.isActive) {
        // Update last used timestamp
        await this.db.apiKey.update({
          where: { id: apiKey.id },
          data: { lastUsed: new Date() }
        });
        
        return apiKey;
      }
      
      return null;
    } catch (error) {
      logger.error('Error validating API key:', error);
      throw error;
    }
  }
}

export default new ApiKeyService(); 