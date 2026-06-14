/**
 * Search-service contracts. Mirrors search-service DTOs.
 * Endpoint base: /api/v1/search.
 */

export interface SearchResultDTO {
  id: string;
  name: string;
  brandName: string;
  categoryName: string;
  price: number;
  status: string;
  primaryImageUrl?: string;
  soldCount?: number;
  /** ES highlight fragment for the matched term. */
  highlight?: string;
}

export interface SearchResponse {
  results: SearchResultDTO[];
  totalHits: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface SearchFilters {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  skinType?: string;
  page?: number;
  size?: number;
}
