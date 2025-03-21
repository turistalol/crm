import { PrismaClient, WebhookEvent } from '@prisma/client';
import crypto from 'crypto';
import axios from 'axios';
import { CreateWebhookDto, UpdateWebhookDto } from '../models/apiTypes';
import prisma from '../utils/database';
import { logger } from '../utils/logger';

export class WebhookService {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  private generateSecret(): string {
    return crypto.randomBytes(24).toString('hex');
  }

  async createWebhook(data: CreateWebhookDto) {
    try {
      const secret = this.generateSecret();
      
      return await this.db.webhook.create({
        data: {
          name: data.name,
          url: data.url,
          secret,
          events: data.events,
          company: {
            connect: { id: data.companyId }
          }
        }
      });
    } catch (error) {
      logger.error('Error creating webhook:', error);
      throw error;
    }
  }

  async getWebhooks(companyId: string) {
    try {
      return await this.db.webhook.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error fetching webhooks:', error);
      throw error;
    }
  }

  async getWebhookById(id: string) {
    try {
      return await this.db.webhook.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error fetching webhook with id ${id}:`, error);
      throw error;
    }
  }

  async updateWebhook(id: string, data: UpdateWebhookDto) {
    try {
      return await this.db.webhook.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error(`Error updating webhook with id ${id}:`, error);
      throw error;
    }
  }

  async deleteWebhook(id: string) {
    try {
      return await this.db.webhook.delete({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error deleting webhook with id ${id}:`, error);
      throw error;
    }
  }

  async triggerWebhooks(
    event: WebhookEvent, 
    companyId: string, 
    payload: any
  ) {
    try {
      // Find all active webhooks for this event and company
      const webhooks = await this.db.webhook.findMany({
        where: {
          companyId,
          isActive: true,
          events: {
            has: event
          }
        }
      });

      if (webhooks.length === 0) {
        return;
      }

      // Send the webhook events in parallel
      const results = await Promise.all(
        webhooks.map(async (webhook) => {
          try {
            // Create HMAC signature for payload
            const timestamp = Date.now().toString();
            const payloadString = JSON.stringify(payload);
            const signature = this.generateSignature(webhook.secret, payloadString, timestamp);
            
            // Send webhook request
            await axios.post(webhook.url, payload, {
              headers: {
                'Content-Type': 'application/json',
                'X-CRM-Webhook-Signature': signature,
                'X-CRM-Webhook-Timestamp': timestamp,
                'X-CRM-Webhook-Event': event
              },
              timeout: 5000 // 5 second timeout
            });
            
            return { webhookId: webhook.id, success: true };
          } catch (error) {
            logger.error(`Error sending webhook ${webhook.id} to ${webhook.url}:`, error);
            return { webhookId: webhook.id, success: false, error };
          }
        })
      );

      // Log the results
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        logger.warn(`Failed to send ${failures.length} of ${webhooks.length} webhooks for event ${event}`);
      } else {
        logger.info(`Successfully sent ${webhooks.length} webhooks for event ${event}`);
      }

      return results;
    } catch (error) {
      logger.error(`Error triggering webhooks for event ${event}:`, error);
      throw error;
    }
  }

  // Generate HMAC signature for webhook payload
  private generateSignature(secret: string, payload: string, timestamp: string): string {
    const signatureData = `${timestamp}.${payload}`;
    return crypto
      .createHmac('sha256', secret)
      .update(signatureData)
      .digest('hex');
  }

  // Verify webhook signature for incoming requests
  verifySignature(
    secret: string, 
    payload: string, 
    signature: string, 
    timestamp: string
  ): boolean {
    const expectedSignature = this.generateSignature(secret, payload, timestamp);
    return crypto.timingSafeEqual(
      Buffer.from(signature), 
      Buffer.from(expectedSignature)
    );
  }
}

export default new WebhookService(); 