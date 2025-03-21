import axios from 'axios';
import { createMessage, getContactByPhoneNumber, createContact, createChat } from './chatService';
import { CreateMessageDto, MessageDirection, WhatsAppMessage, WhatsAppWebhookEvent } from '../models/chat';
import { logger } from '../utils/logger';

// Configuration for the Evolution API
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const INSTANCE_NAME = process.env.WHATSAPP_INSTANCE || 'default';

// Headers for Evolution API requests
const headers = {
  'Content-Type': 'application/json',
  'apikey': EVOLUTION_API_KEY
};

/**
 * Initialize WhatsApp instance
 */
export const initializeWhatsApp = async () => {
  try {
    const response = await axios.post(`${EVOLUTION_API_URL}/instance/init`, {
      instanceName: INSTANCE_NAME,
      webhook: `${process.env.API_URL}/api/whatsapp/webhook`
    }, { headers });
    
    return response.data;
  } catch (error) {
    logger.error(`Error initializing WhatsApp instance: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Get WhatsApp instance status
 */
export const getInstanceStatus = async () => {
  try {
    const response = await axios.get(`${EVOLUTION_API_URL}/instance/info`, {
      params: { instanceName: INSTANCE_NAME },
      headers
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Error getting WhatsApp instance status: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Send a text message through WhatsApp
 */
export const sendTextMessage = async (to: string, message: string) => {
  try {
    const response = await axios.post(`${EVOLUTION_API_URL}/message/text`, {
      number: to,
      options: {
        delay: 1200,
        presence: 'composing'
      },
      textMessage: {
        text: message
      }
    }, { 
      params: { instanceName: INSTANCE_NAME },
      headers 
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Error sending WhatsApp message: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Send a media message through WhatsApp
 */
export const sendMediaMessage = async (to: string, url: string, caption: string, mediaType: string) => {
  try {
    const response = await axios.post(`${EVOLUTION_API_URL}/message/media`, {
      number: to,
      options: {
        delay: 1200
      },
      mediaMessage: {
        mediatype: mediaType,
        media: url,
        caption: caption
      }
    }, { 
      params: { instanceName: INSTANCE_NAME },
      headers 
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Error sending WhatsApp media message: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Process incoming webhook events from Evolution API
 */
export const processWebhook = async (webhookEvent: WhatsAppWebhookEvent) => {
  try {
    // Only process message events
    if (webhookEvent.event !== 'messages.upsert') {
      return { success: true, message: 'Non-message event ignored' };
    }

    const { data } = webhookEvent;
    const phoneNumber = data.from;
    
    // Check if contact exists
    let contact = await getContactByPhoneNumber(phoneNumber);
    
    // Create contact if it doesn't exist
    if (!contact) {
      contact = await createContact({
        name: phoneNumber, // Use phone number as initial name
        phoneNumber
      });
      
      // Create a new chat for this contact
      await createChat({
        contactId: contact.id
      });
    }
    
    // Find the chat for this contact
    const chat = await createChat({
      contactId: contact.id
    });
    
    // Create a message record
    const messageData: CreateMessageDto = {
      content: data.body,
      mediaUrl: data.mediaUrl,
      direction: MessageDirection.INBOUND,
      contactId: contact.id,
      chatId: chat.id
    };
    
    const message = await createMessage(messageData);
    
    return { 
      success: true, 
      message: 'Message processed successfully',
      data: message
    };
  } catch (error) {
    logger.error(`Error processing webhook: ${(error as Error).message}`);
    throw error;
  }
}; 