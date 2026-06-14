import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import { ApiResponse } from './api.service';
import { environment } from '../../../environments/environment';
import {
  SkinAnalysisResultDTO,
  SkinAnalysisStartRequest,
} from '../models/skin-analysis.model';

@Injectable({ providedIn: 'root' })
export class SkinAnalysisService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * POST /api/v1/ai/skin-analysis (multipart/form-data)
   * Returns `{ sessionId }`; client polls `getResult(sessionId)`.
   * Uses HttpClient directly to avoid ApiService's JSON content-type.
   */
  startAnalysis(req: SkinAnalysisStartRequest): Observable<ApiResponse<{ sessionId: string }>> {
    const form = new FormData();
    form.append('image', req.image);
    if (req.age != null) form.append('age', String(req.age));
    if (req.selfSkinType) form.append('selfSkinType', req.selfSkinType);
    if (req.selfConcerns) form.append('selfConcerns', req.selfConcerns);
    if (req.allergies) form.append('allergies', req.allergies);
    form.append('consentGiven', String(req.consentGiven));

    return this.http
      .post<ApiResponse<{ sessionId: string }>>(`${this.baseUrl}/api/v1/ai/skin-analysis`, form)
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.error?.message || err?.message || 'Upload failed')),
        ),
      );
  }

  /** GET /api/v1/ai/skin-analysis/{sessionId} — poll for result. */
  getResult(sessionId: string): Observable<ApiResponse<SkinAnalysisResultDTO>> {
    return this.http
      .get<ApiResponse<SkinAnalysisResultDTO>>(
        `${this.baseUrl}/api/v1/ai/skin-analysis/${encodeURIComponent(sessionId)}`,
      )
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.error?.message || err?.message || 'Fetch failed')),
        ),
      );
  }

  /** GET /api/v1/ai/skin-analysis/history?page=&size= */
  getHistory(page = 0, size = 10): Observable<ApiResponse<{ content: SkinAnalysisResultDTO[]; totalPages: number; last: boolean }>> {
    return this.http
      .get<ApiResponse<{ content: SkinAnalysisResultDTO[]; totalPages: number; last: boolean }>>(
        `${this.baseUrl}/api/v1/ai/skin-analysis/history`,
        { params: { page, size } as Record<string, string | number> },
      )
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.error?.message || err?.message || 'Fetch failed')),
        ),
      );
  }

  /** DELETE /api/v1/ai/skin-analysis/{sessionId} */
  deleteSession(sessionId: string): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(
        `${this.baseUrl}/api/v1/ai/skin-analysis/${encodeURIComponent(sessionId)}`,
      )
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.error?.message || err?.message || 'Delete failed')),
        ),
      );
  }
}
