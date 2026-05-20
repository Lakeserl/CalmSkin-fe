import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ProductDTO, ProductSummaryDTO, ProductFilterRequest, CategoryDTO, BrandDTO, IngredientDTO } from '../models/product.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly api = inject(ApiService);

  searchProducts(filter: ProductFilterRequest, page: number = 0, size: number = 12): Observable<any> {
    const params = {
      ...filter,
      page,
      size
    };
    return this.api.get<any>('/api/v1/products', params);
  }

  getProductBySlug(slug: string): Observable<any> {
    return this.api.get<ProductDTO>(`/api/v1/products/${slug}`);
  }

  getBestSellers(page: number = 0, size: number = 4): Observable<any> {
    return this.api.get<any>('/api/v1/products/best-sellers', { page, size });
  }

  getNewArrivals(page: number = 0, size: number = 4): Observable<any> {
    return this.api.get<any>('/api/v1/products/new-arrivals', { page, size });
  }

  getSimilarProducts(slug: string, limit: number = 4): Observable<any> {
    return this.api.get<ProductSummaryDTO[]>(`/api/v1/products/${slug}/similar`, { limit });
  }

  // Categories & Brands
  getCategories(): Observable<any> {
    return this.api.get<CategoryDTO[]>('/api/v1/categories');
  }

  getBrands(): Observable<any> {
    return this.api.get<BrandDTO[]>('/api/v1/brands');
  }

  getIngredients(): Observable<any> {
    return this.api.get<IngredientDTO[]>('/api/v1/ingredients');
  }
}
