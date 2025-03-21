export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT'
}

export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  profilePic?: string;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  direction: MessageDirection;
  status: MessageStatus;
  contactId: string;
  contact?: Contact;
  chatId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  contactId: string;
  contact: Contact;
  lastMessage?: Message;
  lastMessageId?: string;
  messages?: Message[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuickReply {
  id: string;
  title: string;
  content: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  name: string;
  phoneNumber: string;
  profilePic?: string;
  leadId?: string;
}

export interface UpdateContactDto {
  name?: string;
  profilePic?: string;
  leadId?: string;
}

export interface CreateMessageDto {
  content: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  direction: MessageDirection;
  contactId: string;
  chatId: string;
}

export interface CreateChatDto {
  contactId: string;
}

export interface CreateQuickReplyDto {
  title: string;
  content: string;
  companyId: string;
}

export interface UpdateQuickReplyDto {
  title?: string;
  content?: string;
} 