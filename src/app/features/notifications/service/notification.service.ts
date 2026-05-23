import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from '../../../core/services/api.service';
import { SpringPage } from '../../../core/services/order.service';
import {
  BroadcastRequest,
  NotificationDTO,
  NotificationPreferencesDTO,
  NotificationStatsDTO,
  NotificationTemplateDTO,
  UnreadCountDTO,
  UpdatePreferencesRequest,
  UpdateTemplateRequest,
} from '../model/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly #api = inject(ApiService);

  getNotifications(
    page = 0,
    size = 20,
    status?: string,
  ): Observable<ApiResponse<SpringPage<NotificationDTO>>> {
    const params: Record<string, string | number> = { page, size };
    if (status) params['status'] = status;
    return this.#api.get<SpringPage<NotificationDTO>>('/api/v1/notifications/me', params);
  }

  getUnreadCount(): Observable<ApiResponse<UnreadCountDTO>> {
    return this.#api.get<UnreadCountDTO>('/api/v1/notifications/me/unread-count');
  }

  markRead(id: number): Observable<ApiResponse<void>> {
    return this.#api.patch<void>(`/api/v1/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<ApiResponse<void>> {
    return this.#api.patch<void>('/api/v1/notifications/read-all', {});
  }

  deleteNotification(id: number): Observable<ApiResponse<void>> {
    return this.#api.delete<void>(`/api/v1/notifications/${id}`);
  }

  getPreferences(): Observable<ApiResponse<NotificationPreferencesDTO>> {
    return this.#api.get<NotificationPreferencesDTO>('/api/v1/notifications/preferences');
  }

  updatePreferences(
    data: UpdatePreferencesRequest,
  ): Observable<ApiResponse<NotificationPreferencesDTO>> {
    return this.#api.put<NotificationPreferencesDTO>('/api/v1/notifications/preferences', data);
  }

  getVapidPublicKey(): Observable<ApiResponse<{ vapidPublicKey: string }>> {
    return this.#api.get<{ vapidPublicKey: string }>(
      '/api/v1/notifications/web-push/vapid-public-key',
    );
  }

  subscribePush(sub: PushSubscriptionJSON): Observable<ApiResponse<void>> {
    return this.#api.post<void>('/api/v1/notifications/web-push/subscribe', {
      endpoint: sub.endpoint,
      p256dh: sub.keys?.['p256dh'],
      auth: sub.keys?.['auth'],
    });
  }

  unsubscribePush(): Observable<ApiResponse<void>> {
    return this.#api.delete<void>('/api/v1/notifications/web-push/subscribe');
  }

  // Admin
  getAdminNotifications(
    page = 0,
    size = 20,
    status?: string,
  ): Observable<ApiResponse<SpringPage<NotificationDTO>>> {
    const params: Record<string, string | number> = { page, size };
    if (status) params['status'] = status;
    return this.#api.get<SpringPage<NotificationDTO>>('/api/v1/admin/notifications', params);
  }

  getAdminStats(): Observable<ApiResponse<NotificationStatsDTO>> {
    return this.#api.get<NotificationStatsDTO>('/api/v1/admin/notifications/stats');
  }

  broadcast(data: BroadcastRequest): Observable<ApiResponse<void>> {
    return this.#api.post<void>('/api/v1/admin/notifications/broadcast', data);
  }

  getTemplates(
    page = 0,
    size = 20,
  ): Observable<ApiResponse<SpringPage<NotificationTemplateDTO>>> {
    return this.#api.get<SpringPage<NotificationTemplateDTO>>(
      '/api/v1/admin/notifications/templates',
      { page, size },
    );
  }

  updateTemplate(
    id: number,
    data: UpdateTemplateRequest,
  ): Observable<ApiResponse<NotificationTemplateDTO>> {
    return this.#api.put<NotificationTemplateDTO>(
      `/api/v1/admin/notifications/templates/${id}`,
      data,
    );
  }
}
