// Webhook event types
export enum WebhookEvent {
  LEAD_CREATED = 'LEAD_CREATED',
  LEAD_UPDATED = 'LEAD_UPDATED',
  LEAD_DELETED = 'LEAD_DELETED',
  LEAD_STAGE_CHANGED = 'LEAD_STAGE_CHANGED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_SENT = 'MESSAGE_SENT'
}

// Report types
export enum ReportType {
  PIPELINE_PERFORMANCE = 'PIPELINE_PERFORMANCE',
  TEAM_PERFORMANCE = 'TEAM_PERFORMANCE',
  CONVERSION_RATES = 'CONVERSION_RATES',
  LEAD_SOURCE = 'LEAD_SOURCE',
  SALES_FORECAST = 'SALES_FORECAST'
}

// Lead status
export enum LeadStatus {
  ACTIVE = 'ACTIVE',
  WON = 'WON',
  LOST = 'LOST',
  ARCHIVED = 'ARCHIVED'
}

// Team roles
export enum TeamRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER'
}

// User roles
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  USER = 'USER'
}

// Media types
export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT'
}

// Message direction
export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}

// Message status
export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
} 