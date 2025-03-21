import api from './api';
import { 
  Contact, 
  Chat, 
  Message, 
  QuickReply,
  CreateContactDto,
  UpdateContactDto,
  CreateMessageDto,
  CreateChatDto,
  CreateQuickReplyDto,
  UpdateQuickReplyDto
} from '../types/chat';

/**
 * Contact management
 */
export const createContact = async (data: CreateContactDto): Promise<Contact> => {
  const response = await api.post('/chat/contacts', data);
  return response.data;
};

export const getContactById = async (id: string): Promise<Contact> => {
  const response = await api.get(`/chat/contacts/${id}`);
  return response.data;
};

export const getContactByPhoneNumber = async (phoneNumber: string): Promise<Contact> => {
  const response = await api.get(`/chat/contacts/phone/${phoneNumber}`);
  return response.data;
};

export const updateContact = async (id: string, data: UpdateContactDto): Promise<Contact> => {
  const response = await api.put(`/chat/contacts/${id}`, data);
  return response.data;
};

export const getAllContacts = async (): Promise<Contact[]> => {
  const response = await api.get('/chat/contacts');
  return response.data;
};

/**
 * Chat management
 */
export const createChat = async (data: CreateChatDto): Promise<Chat> => {
  const response = await api.post('/chat/chats', data);
  return response.data;
};

export const getChatById = async (id: string): Promise<Chat> => {
  const response = await api.get(`/chat/chats/${id}`);
  return response.data;
};

export const getAllChats = async (): Promise<Chat[]> => {
  const response = await api.get('/chat/chats');
  return response.data;
};

export const archiveChat = async (id: string, isArchived: boolean = true): Promise<Chat> => {
  const response = await api.put(`/chat/chats/${id}/archive`, { isArchived });
  return response.data;
};

/**
 * Message management
 */
export const createMessage = async (data: CreateMessageDto): Promise<Message> => {
  const response = await api.post('/chat/messages', data);
  return response.data;
};

export const getMessagesByChat = async (chatId: string): Promise<Message[]> => {
  const response = await api.get(`/chat/messages/chat/${chatId}`);
  return response.data;
};

/**
 * Quick reply management
 */
export const createQuickReply = async (data: CreateQuickReplyDto): Promise<QuickReply> => {
  const response = await api.post('/chat/quick-replies', data);
  return response.data;
};

export const updateQuickReply = async (id: string, data: UpdateQuickReplyDto): Promise<QuickReply> => {
  const response = await api.put(`/chat/quick-replies/${id}`, data);
  return response.data;
};

export const deleteQuickReply = async (id: string): Promise<void> => {
  await api.delete(`/chat/quick-replies/${id}`);
};

export const getQuickRepliesByCompany = async (companyId: string): Promise<QuickReply[]> => {
  const response = await api.get(`/chat/quick-replies/company/${companyId}`);
  return response.data;
};

/**
 * WhatsApp integration
 */
export const sendTextMessage = async (phoneNumber: string, message: string): Promise<any> => {
  const response = await api.post('/whatsapp/send-text', { phoneNumber, message });
  return response.data;
};

export const sendMediaMessage = async (
  phoneNumber: string, 
  url: string, 
  caption: string, 
  mediaType: string
): Promise<any> => {
  const response = await api.post('/whatsapp/send-media', { 
    phoneNumber, 
    url, 
    caption, 
    mediaType 
  });
  return response.data;
};

export const getWhatsAppStatus = async (): Promise<any> => {
  const response = await api.get('/whatsapp/status');
  return response.data;
};

/**
 * Update message status
 */
export const updateMessageStatus = async (messageId: string, status: string): Promise<Message> => {
  const response = await api.patch(`/api/chat/messages/${messageId}/status`, { status });
  return response.data;
}; 