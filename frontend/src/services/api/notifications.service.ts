import { apiClient } from './client';

export interface NotificationTemplate {
  id: string;
  tipo: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface UpdateNotificationTemplateRequest {
  subject?: string;
  body?: string;
}

export interface SendNotificationRequest {
  userId: string;
  variables?: Record<string, string>;
  reservaId?: string;
}

export interface SendNotificationResponse {
  sent: boolean;
  error: string | null;
  logId: string | null;
}

export const notificationsService = {
  /**
   * Get all notification templates (admin only)
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const response = await apiClient.get<NotificationTemplate[]>('/notifications/templates');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a single notification template by ID (admin only)
   */
  async getTemplateById(id: string): Promise<NotificationTemplate> {
    try {
      const response = await apiClient.get<NotificationTemplate>(`/notifications/templates/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a notification template subject and/or body (admin only)
   */
  async updateTemplate(id: string, data: UpdateNotificationTemplateRequest): Promise<NotificationTemplate> {
    try {
      const response = await apiClient.patch<NotificationTemplate>(`/notifications/templates/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Manually send a notification template for testing (admin only)
   */
  async sendNotification(templateId: string, data: SendNotificationRequest): Promise<SendNotificationResponse> {
    try {
      const response = await apiClient.post<SendNotificationResponse>(`/notifications/send/${templateId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
