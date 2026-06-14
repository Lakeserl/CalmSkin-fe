import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';
import { SearchFilters, SearchResponse } from '../models/search.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(ApiService);

  /** GET /api/v1/search — full-text search with filters. */
  search(filters: SearchFilters = {}): Observable<ApiResponse<SearchResponse>> {
    return this.api.get<SearchResponse>('/api/v1/search', {
      q: filters.q,
      category: filters.category,
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      skinType: filters.skinType,
      page: filters.page ?? 0,
      size: filters.size ?? 20,
    });
  }

  /** GET /api/v1/search/suggest — autocomplete (<100ms target). */
  suggest(q: string, limit = 10): Observable<ApiResponse<string[]>> {
    return this.api.get<string[]>('/api/v1/search/suggest', { q, limit });
  }

  /** GET /api/v1/search/trending — top searched terms this week. */
  trending(limit = 10): Observable<ApiResponse<string[]>> {
    return this.api.get<string[]>('/api/v1/search/trending', { limit });
  }
}
