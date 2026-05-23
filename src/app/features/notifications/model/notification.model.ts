export interface NotificationDTO {
  id: number;
  channel: string;
  templateCode: string;
  subject: string;
  body: string;
  referenceId?: string;
  referenceType?: string;
  status: string;
  priority: string;
  read: boolean;
  readAt?: string;
  metadata?: string;
  createdAt: string;
}

export interface UnreadCountDTO {
  count: number;
}

export interface NotificationPreferencesDTO {
  userId: string;
  emailEnabled: boolean;
  webPushEnabled: boolean;
  inAppEnabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  reviews: boolean;
  stockAlerts: boolean;
  securityAlerts: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  locale: string;
}

export interface UpdatePreferencesRequest {
  emailEnabled?: boolean;
  webPushEnabled?: boolean;
  inAppEnabled?: boolean;
  orderUpdates?: boolean;
  promotions?: boolean;
  reviews?: boolean;
  stockAlerts?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  locale?: string;
}

export interface NotificationStatsDTO {
  sentToday: number;
  failedToday: number;
  emailCount: number;
  pushCount: number;
  inAppCount: number;
}

export interface NotificationTemplateDTO {
  id: number;
  code: string;
  channel: string;
  locale: string;
  subject: string;
  body: string;
  variables?: string;
  active: boolean;
  version: number;
  updatedAt: string;
}

export interface BroadcastRequest {
  templateCode: string;
  userIds: string[];
  title?: string;
  body?: string;
  scheduledAt?: string;
}

export interface UpdateTemplateRequest {
  subject?: string;
  body?: string;
  active?: boolean;
}
