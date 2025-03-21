// Define enums locally since they might not be available from Prisma client yet after schema update
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

export interface UpdateMessageDto {
  status?: MessageStatus;
}

export interface CreateChatDto {
  contactId: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
  type: string;
  mediaUrl?: string;
}

export interface WhatsAppWebhookEvent {
  event: string;
  instance: string;
  data: {
    id: string;
    from: string;
    to: string;
    body: string;
    type: string;
    timestamp: number;
    status?: string;
    mediaUrl?: string;
  };
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