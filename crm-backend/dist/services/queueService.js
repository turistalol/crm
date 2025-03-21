import Queue from 'bull';
import { logger } from '../utils/logger';
import { sendTextMessage, sendMediaMessage } from './whatsappService';

// Create queues
const messageQueue = new Queue('whatsapp-messages', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

// Process text messages
messageQueue.process('send-text', async (job) => {
  try {
    const { phoneNumber, message } = job.data;
    logger.info(`Processing text message job for ${phoneNumber}`);
    
    const result = await sendTextMessage(phoneNumber, message);
    return result;
  } catch (error) {
    logger.error(`Error processing text message job: ${(error as Error).message}`);
    throw error;
  }
});

// Process media messages
messageQueue.process('send-media', async (job) => {
  try {
    const { phoneNumber, url, caption, mediaType } = job.data;
    logger.info(`Processing media message job for ${phoneNumber}`);
    
    const result = await sendMediaMessage(phoneNumber, url, caption, mediaType);
    return result;
  } catch (error) {
    logger.error(`Error processing media message job: ${(error as Error).message}`);
    throw error;
  }
});

// Handle completed jobs
messageQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

// Handle failed jobs
messageQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed: ${error.message}`);
  
  // If job has reached max attempts
  if (job.attemptsMade >= (job.opts.attempts || 3)) {
    logger.error(`Job ${job.id} has failed all retry attempts`);
  }
});

/**
 * Add a text message to the queue
 */
export const queueTextMessage = async (phoneNumber: string, message: string) => {
  try {
    const job = await messageQueue.add('send-text', { phoneNumber, message });
    logger.info(`Text message queued for ${phoneNumber}, job ID: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Error queueing text message: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Add a media message to the queue
 */
export const queueMediaMessage = async (
  phoneNumber: string, 
  url: string,
  caption: string,
  mediaType: string
) => {
  try {
    const job = await messageQueue.add('send-media', { 
      phoneNumber, 
      url, 
      caption, 
      mediaType 
    });
    logger.info(`Media message queued for ${phoneNumber}, job ID: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Error queueing media message: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Get queue status
 */
export const getQueueStatus = async () => {
  try {
    const [
      waiting,
      active,
      completed,
      failed
    ] = await Promise.all([
      messageQueue.getWaitingCount(),
      messageQueue.getActiveCount(),
      messageQueue.getCompletedCount(),
      messageQueue.getFailedCount()
    ]);
    
    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed
    };
  } catch (error) {
    logger.error(`Error getting queue status: ${(error as Error).message}`);
    throw error;
  }
}; 