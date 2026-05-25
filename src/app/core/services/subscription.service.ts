import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';
import {
  SubscriptionDTO,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from '../models/subscription.model';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly api = inject(ApiService);

  createSubscription(req: CreateSubscriptionRequest): Observable<ApiResponse<SubscriptionDTO>> {
    return this.api.post<SubscriptionDTO>('/api/v1/subscriptions', req);
  }

  listSubscriptions(page = 0, size = 10): Observable<ApiResponse<SubscriptionDTO[]>> {
    return this.api.get<SubscriptionDTO[]>('/api/v1/subscriptions', { page, size });
  }

  getSubscription(id: string): Observable<ApiResponse<SubscriptionDTO>> {
    return this.api.get<SubscriptionDTO>(`/api/v1/subscriptions/${id}`);
  }

  updateSubscription(id: string, req: UpdateSubscriptionRequest): Observable<ApiResponse<SubscriptionDTO>> {
    return this.api.put<SubscriptionDTO>(`/api/v1/subscriptions/${id}`, req);
  }

  pauseSubscription(id: string): Observable<ApiResponse<SubscriptionDTO>> {
    return this.api.put<SubscriptionDTO>(`/api/v1/subscriptions/${id}/pause`, {});
  }

  resumeSubscription(id: string): Observable<ApiResponse<SubscriptionDTO>> {
    return this.api.put<SubscriptionDTO>(`/api/v1/subscriptions/${id}/resume`, {});
  }

  cancelSubscription(id: string): Observable<ApiResponse<SubscriptionDTO>> {
    return this.api.delete<SubscriptionDTO>(`/api/v1/subscriptions/${id}`);
  }
}
