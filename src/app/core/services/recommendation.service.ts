import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';
import { RecommendationResponseDTO } from '../models/recommendation.model';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly api = inject(ApiService);

  /** GET /api/v1/recommendations/for-me — personalized via skin profile. */
  forMe(): Observable<ApiResponse<RecommendationResponseDTO>> {
    return this.api.get<RecommendationResponseDTO>('/api/v1/recommendations/for-me');
  }

  /** GET /api/v1/recommendations/similar/{productId} — content-based similar. */
  similar(productId: number): Observable<ApiResponse<RecommendationResponseDTO>> {
    return this.api.get<RecommendationResponseDTO>(`/api/v1/recommendations/similar/${productId}`);
  }

  /** GET /api/v1/recommendations/frequently-bought-with/{productId} — co-purchase. */
  frequentlyBoughtWith(productId: number): Observable<ApiResponse<RecommendationResponseDTO>> {
    return this.api.get<RecommendationResponseDTO>(
      `/api/v1/recommendations/frequently-bought-with/${productId}`,
    );
  }

  /** GET /api/v1/recommendations/trending — top-selling. */
  trending(limit = 10): Observable<ApiResponse<RecommendationResponseDTO>> {
    return this.api.get<RecommendationResponseDTO>('/api/v1/recommendations/trending', { limit });
  }
}
