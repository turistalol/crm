import { Request, Response } from 'express';
import { 
  initializeWhatsApp, 
  getInstanceStatus, 
  processWebhook as processWhatsappWebhook,
  sendTextMessage,
  sendMediaMessage
} from '../services/whatsappService';
import { queueTextMessage, queueMediaMessage, getQueueStatus } from '../services/queueService';
import { upload, uploadToS3 } from '../services/fileService';
import { logger } from '../utils/logger';
import { WhatsAppWebhookEvent } from '../models/chat';
import { getSocketServer } from '../services/socketService';

/**
 * Initialize WhatsApp connection
 */
export const initializeInstance = async (req: Request, res: Response) => {
  try {
    const result = await initializeWhatsApp();
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error initializing WhatsApp: ${(error as Error).message}`);
    return res.status(500).json({ error: 'Failed to initialize WhatsApp connection' });
  }
};

/**
 * Get connection status
 */
export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = await getInstanceStatus();
    return res.status(200).json(status);
  } catch (error) {
    logger.error(`Error getting WhatsApp status: ${(error as Error).message}`);
    return res.status(500).json({ error: 'Failed to get WhatsApp status' });
  }
};

/**
 * Handle incoming webhook from Evolution API
 */
export const processWebhook = async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;
    logger.info(`Received webhook: ${JSON.stringify(webhookData)}`);
    
    // Process the webhook event
    const result = await processWhatsappWebhook(webhookData);
    
    // Emit the new message to connected clients if applicable
    if (result.data && result.data.chatId) {
      const io = getSocketServer();
      io.to(`chat:${result.data.chatId}`).emit('new_message', result.data);
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`Error processing webhook: ${(error as Error).message}`);
    return res.status(500).json({ error: 'Failed to process webhook' });
  }
};

/**
 * Send a text message
 */
export const sendText = async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await sendTextMessage(to, message);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error sending message: ${(error as Error).message}`);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Send a media message
 */
export const sendMedia = async (req: Request, res: Response) => {
  try {
    const { to, url, caption, mediaType } = req.body;
    
    if (!to || !url || !mediaType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await sendMediaMessage(to, url, caption || '', mediaType);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error sending media: ${(error as Error).message}`);
    return res.status(500).json({ error: 'Failed to send media' });
  }
};

/**
 * Upload media for WhatsApp message
 */
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    
    // Upload file to storage (S3 or local)
    const fileData = await uploadToS3(req.file);
    
    res.status(200).json({ 
      success: true, 
      message: 'File uploaded successfully',
      data: {
        url: fileData.url,
        key: fileData.key,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    logger.error(`Error uploading media: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Failed to upload media' });
  }
};

/**
 * Get status of the message queue
 */
export const getMessageQueueStatus = async (req: Request, res: Response) => {
  try {
    const status = await getQueueStatus();
    
    res.status(200).json({ 
      success: true, 
      data: status
    });
  } catch (error) {
    logger.error(`Error getting queue status: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Failed to get queue status' });
  }
};

/**
 * Check connection status periodically and notify clients
 */
export const startConnectionMonitoring = () => {
  const CHECK_INTERVAL = 30000; // Check every 30 seconds
  
  const checkConnection = async () => {
    try {
      const status = await getInstanceStatus();
      const io = getSocketServer();
      
      // Broadcast connection status to all connected clients
      io.emit('whatsapp_status', {
        connected: status.instance?.state === 'open',
        state: status.instance?.state || 'disconnected',
        timestamp: new Date().toISOString()
      });
      
      // If disconnected, try to reconnect
      if (status.instance?.state !== 'open') {
        logger.warn('WhatsApp connection is not open, attempting to reconnect');
        await initializeWhatsApp();
      }
    } catch (error) {
      logger.error(`Connection monitoring error: ${(error as Error).message}`);
      
      // Notify clients about the error
      const io = getSocketServer();
      io.emit('whatsapp_status', {
        connected: false,
        state: 'error',
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  // Run an initial check
  checkConnection();
  
  // Set up the interval
  const interval = setInterval(checkConnection, CHECK_INTERVAL);
  
  // Return the interval ID so it can be cleared if needed
  return interval;
}; 