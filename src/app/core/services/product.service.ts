import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';
import {
  ProductDTO,
  ProductSummaryDTO,
  ProductFilterRequest,
  CategoryDTO,
  CategoryTreeDTO,
  BrandDTO,
  IngredientDTO,
  IngredientSafetyDTO,
  IngredientConflictDTO,
} from '../models/product.model';
import { SpringPage } from './order.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly api = inject(ApiService);

  searchProducts(
    filter: ProductFilterRequest,
    page = 0,
    size = 12,
  ): Observable<ApiResponse<SpringPage<ProductSummaryDTO>>> {
    const params = { ...filter, page, size };
    return this.api.get<SpringPage<ProductSummaryDTO>>('/api/v1/products', params);
  }

  getProductBySlug(slug: string): Observable<ApiResponse<ProductDTO>> {
    return this.api.get<ProductDTO>(`/api/v1/products/${slug}`);
  }

  getBestSellers(page = 0, size = 4): Observable<ApiResponse<SpringPage<ProductSummaryDTO>>> {
    return this.api.get<SpringPage<ProductSummaryDTO>>('/api/v1/products/best-sellers', { page, size });
  }

  getNewArrivals(page = 0, size = 4): Observable<ApiResponse<SpringPage<ProductSummaryDTO>>> {
    return this.api.get<SpringPage<ProductSummaryDTO>>('/api/v1/products/new-arrivals', { page, size });
  }

  getSimilarProducts(slug: string, limit = 4): Observable<ApiResponse<ProductSummaryDTO[]>> {
    return this.api.get<ProductSummaryDTO[]>(`/api/v1/products/${slug}/similar`, { limit });
  }

  // Categories & Brands
  getCategories(): Observable<ApiResponse<CategoryDTO[]>> {
    return this.api.get<CategoryDTO[]>('/api/v1/categories');
  }

  getCategoryTree(): Observable<ApiResponse<CategoryTreeDTO[]>> {
    return this.api.get<CategoryTreeDTO[]>('/api/v1/categories/tree');
  }

  getCategoryBySlug(slug: string): Observable<ApiResponse<CategoryDTO>> {
    return this.api.get<CategoryDTO>(`/api/v1/categories/${slug}`);
  }

  getBrands(): Observable<ApiResponse<BrandDTO[]>> {
    return this.api.get<BrandDTO[]>('/api/v1/brands');
  }

  getBrandBySlug(slug: string): Observable<ApiResponse<BrandDTO>> {
    return this.api.get<BrandDTO>(`/api/v1/brands/${slug}`);
  }

  getIngredients(): Observable<ApiResponse<IngredientDTO[]>> {
    return this.api.get<IngredientDTO[]>('/api/v1/ingredients');
  }

  getIngredientById(id: number): Observable<ApiResponse<IngredientDTO>> {
    return this.api.get<IngredientDTO>(`/api/v1/ingredients/${id}`);
  }

  checkIngredientSafety(ingredientIds: number[]): Observable<ApiResponse<IngredientSafetyDTO[]>> {
    return this.api.post<IngredientSafetyDTO[]>('/api/v1/ingredients/check-safety', { ingredientIds });
  }

  checkIngredientConflicts(ingredientIds: number[]): Observable<ApiResponse<IngredientConflictDTO[]>> {
    return this.api.post<IngredientConflictDTO[]>('/api/v1/ingredients/check-conflicts', { ingredientIds });
  }
}
