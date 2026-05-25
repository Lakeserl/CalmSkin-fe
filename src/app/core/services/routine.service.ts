import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';
import { GenerateRoutineRequest, RoutineResponse } from '../models/routine.model';

@Injectable({ providedIn: 'root' })
export class RoutineService {
  private readonly api = inject(ApiService);

  /**
   * POST /api/v1/routines/generate
   * Request body is optional — when omitted, BE falls back to the JWT user's
   * stored skin profile.
   */
  generate(body?: GenerateRoutineRequest): Observable<ApiResponse<RoutineResponse>> {
    return this.api.post<RoutineResponse>('/api/v1/routines/generate', body ?? {});
  }
}
