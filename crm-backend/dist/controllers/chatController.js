import { Request, Response } from 'express';
import * as chatService from '../services/chatService';
import { logger } from '../utils/logger';

/**
 * Get all contacts
 */
export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await chatService.getAllContacts();
    res.json(contacts);
  } catch (error) {
    logger.error(`Error fetching contacts: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error fetching contacts', error: (error as Error).message });
  }
};

/**
 * Get contact by ID
 */
export const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await chatService.getContactById(id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    logger.error(`Error fetching contact: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error fetching contact', error: (error as Error).message });
  }
};

/**
 * Create a new contact
 */
export const createContact = async (req: Request, res: Response) => {
  try {
    const contact = await chatService.createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    logger.error(`Error creating contact: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error creating contact', error: (error as Error).message });
  }
};

/**
 * Update a contact
 */
export const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await chatService.updateContact(id, req.body);
    res.json(contact);
  } catch (error) {
    logger.error(`Error updating contact: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error updating contact', error: (error as Error).message });
  }
};

/**
 * Get all chats
 */
export const getAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await chatService.getAllChats();
    res.json(chats);
  } catch (error) {
    logger.error(`Error fetching chats: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error fetching chats', error: (error as Error).message });
  }
};

/**
 * Get chat by ID
 */
export const getChatById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const chat = await chatService.getChatById(id);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    logger.error(`Error fetching chat: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error fetching chat', error: (error as Error).message });
  }
};

/**
 * Create a new chat
 */
export const createChat = async (req: Request, res: Response) => {
  try {
    const chat = await chatService.createChat(req.body);
    res.status(201).json(chat);
  } catch (error) {
    logger.error(`Error creating chat: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error creating chat', error: (error as Error).message });
  }
};

/**
 * Archive/unarchive a chat
 */
export const toggleArchiveChat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;
    
    const chat = await chatService.archiveChat(id, isArchived);
    res.json(chat);
  } catch (error) {
    logger.error(`Error archiving chat: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error archiving chat', error: (error as Error).message });
  }
};

/**
 * Get messages by chat ID
 */
export const getMessagesByChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const messages = await chatService.getMessagesByChat(chatId);
    res.json(messages);
  } catch (error) {
    logger.error(`Error fetching messages: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error fetching messages', error: (error as Error).message });
  }
};

/**
 * Send a message
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const message = await chatService.createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    logger.error(`Error sending message: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error sending message', error: (error as Error).message });
  }
};

/**
 * Get quick replies by company
 */
export const getQuickReplies = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const quickReplies = await chatService.getQuickRepliesByCompany(companyId);
    res.json(quickReplies);
  } catch (error) {
    logger.error(`Error fetching quick replies: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error fetching quick replies', error: (error as Error).message });
  }
};

/**
 * Create a quick reply
 */
export const createQuickReply = async (req: Request, res: Response) => {
  try {
    const quickReply = await chatService.createQuickReply(req.body);
    res.status(201).json(quickReply);
  } catch (error) {
    logger.error(`Error creating quick reply: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error creating quick reply', error: (error as Error).message });
  }
};

/**
 * Update a quick reply
 */
export const updateQuickReply = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quickReply = await chatService.updateQuickReply(id, req.body);
    res.json(quickReply);
  } catch (error) {
    logger.error(`Error updating quick reply: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error updating quick reply', error: (error as Error).message });
  }
};

/**
 * Delete a quick reply
 */
export const deleteQuickReply = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await chatService.deleteQuickReply(id);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting quick reply: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error deleting quick reply', error: (error as Error).message });
  }
}; 