import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ProductDTO, CategoryDTO, BrandDTO } from '../models/product.model';
import { OrderDTO, InventoryDTO, StockMovementDTO } from '../models/order.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly api = inject(ApiService);

  // PRODUCT CRUD
  createProduct(data: any): Observable<any> {
    return this.api.post<ProductDTO>('/api/v1/admin/products', data);
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.api.put<ProductDTO>(`/api/v1/admin/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<any> {
    return this.api.delete<void>(`/api/v1/admin/products/${id}`);
  }

  addVariant(productId: number, data: any): Observable<any> {
    return this.api.post<any>(`/api/v1/admin/products/${productId}/variants`, data);
  }

  addImage(productId: number, data: any): Observable<any> {
    return this.api.post<any>(`/api/v1/admin/products/${productId}/images`, data);
  }

  // CATEGORY & BRAND
  createCategory(data: any): Observable<any> {
    return this.api.post<CategoryDTO>('/api/v1/admin/categories', data);
  }

  createBrand(data: any): Observable<any> {
    return this.api.post<BrandDTO>('/api/v1/admin/brands', data);
  }

  // ORDER MANAGEMENT
  getAdminOrders(status?: string, page: number = 0, size: number = 10): Observable<any> {
    const params: any = { page, size };
    if (status) params.status = status;
    return this.api.get<any>('/api/v1/admin/orders', params);
  }

  updateOrderStatus(orderNumber: string, status: string, note?: string): Observable<any> {
    return this.api.put<OrderDTO>(`/api/v1/admin/orders/${orderNumber}/status`, { status, note });
  }

  // INVENTORY MANAGEMENT (inventory-service)
  getInventory(page: number = 0, size: number = 10, filter?: 'low-stock' | 'out-of-stock'): Observable<any> {
    const params: any = { page, size };
    let endpoint = '/api/v1/admin/inventory';
    if (filter === 'low-stock') {
      endpoint = '/api/v1/admin/inventory/low-stock';
    } else if (filter === 'out-of-stock') {
      endpoint = '/api/v1/admin/inventory/out-of-stock';
    }
    return this.api.get<any>(endpoint, params);
  }

  getInventoryDetail(id: number): Observable<any> {
    return this.api.get<any>(`/api/v1/admin/inventory/${id}`);
  }

  updateInventoryThreshold(id: number, threshold: number, warehouseLocation?: string): Observable<any> {
    return this.api.put<InventoryDTO>(`/api/v1/admin/inventory/${id}`, { 
      lowStockThreshold: threshold, 
      warehouseLocation 
    });
  }

  importStock(inventoryId: number, quantity: number, note?: string): Observable<any> {
    return this.api.post<any>('/api/v1/admin/inventory/import', { 
      inventoryId, 
      quantity, 
      note 
    });
  }

  getInventoryMovements(id: number, page: number = 0, size: number = 20): Observable<any> {
    return this.api.get<any>(`/api/v1/admin/inventory/${id}/movements`, { page, size });
  }

  getInventoryStats(): Observable<any> {
    return this.api.get<any>('/api/v1/admin/inventory/stats');
  }
}
