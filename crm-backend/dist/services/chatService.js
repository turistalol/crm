import prisma from '../utils/database';
import { 
  CreateContactDto, 
  UpdateContactDto, 
  CreateMessageDto, 
  UpdateMessageDto, 
  CreateChatDto,
  CreateQuickReplyDto,
  UpdateQuickReplyDto,
  MessageStatus 
} from '../models/chat';

/**
 * Contact management
 */
export const createContact = async (data: CreateContactDto) => {
  return prisma.contact.create({
    data
  });
};

export const getContactById = async (id: string) => {
  return prisma.contact.findUnique({
    where: { id }
  });
};

export const getContactByPhoneNumber = async (phoneNumber: string) => {
  return prisma.contact.findUnique({
    where: { phoneNumber }
  });
};

export const updateContact = async (id: string, data: UpdateContactDto) => {
  return prisma.contact.update({
    where: { id },
    data
  });
};

export const getAllContacts = async () => {
  return prisma.contact.findMany({
    orderBy: { updatedAt: 'desc' }
  });
};

/**
 * Chat management
 */
export const createChat = async (data: CreateChatDto) => {
  return prisma.chat.create({
    data,
    include: {
      contact: true
    }
  });
};

export const getChatById = async (id: string) => {
  return prisma.chat.findUnique({
    where: { id },
    include: {
      contact: true,
      lastMessage: true
    }
  });
};

export const getAllChats = async () => {
  return prisma.chat.findMany({
    include: {
      contact: true,
      lastMessage: true
    },
    orderBy: { updatedAt: 'desc' }
  });
};

export const archiveChat = async (id: string, isArchived: boolean = true) => {
  return prisma.chat.update({
    where: { id },
    data: { isArchived }
  });
};

/**
 * Message management
 */
export const createMessage = async (data: CreateMessageDto) => {
  const message = await prisma.message.create({
    data,
    include: {
      contact: true
    }
  });

  // Update the last message of the chat
  await prisma.chat.update({
    where: { id: data.chatId },
    data: { lastMessageId: message.id }
  });

  return message;
};

export const getMessageById = async (id: string) => {
  return prisma.message.findUnique({
    where: { id }
  });
};

export const updateMessageStatus = async (id: string, data: UpdateMessageDto) => {
  return prisma.message.update({
    where: { id },
    data
  });
};

export const getMessagesByChat = async (chatId: string) => {
  return prisma.message.findMany({
    where: { chatId },
    include: {
      contact: true
    },
    orderBy: { createdAt: 'asc' }
  });
};

/**
 * Quick Reply management
 */
export const createQuickReply = async (data: CreateQuickReplyDto) => {
  return prisma.quickReply.create({
    data
  });
};

export const getQuickReplyById = async (id: string) => {
  return prisma.quickReply.findUnique({
    where: { id }
  });
};

export const updateQuickReply = async (id: string, data: UpdateQuickReplyDto) => {
  return prisma.quickReply.update({
    where: { id },
    data
  });
};

export const deleteQuickReply = async (id: string) => {
  return prisma.quickReply.delete({
    where: { id }
  });
};

export const getQuickRepliesByCompany = async (companyId: string) => {
  return prisma.quickReply.findMany({
    where: { companyId },
    orderBy: { title: 'asc' }
  });
}; 