import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, ApiService } from './api.service';
import {
  ProductDTO,
  ProductImageDTO,
  ProductVariantDTO,
  CategoryDTO,
  BrandDTO,
  IngredientDTO,
  ProductStatsDTO,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateBrandRequest,
  UpdateBrandRequest,
  CreateIngredientRequest,
  UpdateIngredientRequest,
  UpdateVariantRequest,
} from '../models/product.model';
import {
  OrderDTO,
  OrderStatsDTO,
  OrderStatus,
  OrderSummaryDTO,
  InventoryDTO,
  InventoryStatsDTO,
  StockMovementDTO,
} from '../models/order.model';
import {
  AdminUserDTO,
  AuditLogDTO,
  AdminUserStats,
} from '../models/user.model';
import {
  PromotionDTO,
  PromotionStatsDTO,
  PromotionUsageDTO,
  VoucherCodeDTO,
  FlashSaleSlotsDTO,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  UpdateStatusRequest,
  AssignBulkRequest,
  GenerateVoucherCodesRequest,
} from '../models/promotion.model';
import { SpringPage } from './order.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminOrderFilters {
  status?: string;
  userId?: string;
  orderNumber?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly api = inject(ApiService);
  // Raw HttpClient is needed for the CSV export (binary, not ApiResponse-wrapped).
  private readonly http = inject(HttpClient);

  // PRODUCT CRUD
  // Accepts the admin-side request shape (categoryId/brandId, not nested DTOs).
  // BE: ProductCreateRequest / ProductUpdateRequest.
  createProduct(data: Record<string, unknown>): Observable<ApiResponse<ProductDTO>> {
    return this.api.post<ProductDTO>('/api/v1/admin/products', data);
  }

  updateProduct(id: number, data: Record<string, unknown>): Observable<ApiResponse<ProductDTO>> {
    return this.api.put<ProductDTO>(`/api/v1/admin/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/admin/products/${id}`);
  }

  updateProductStatus(id: number, status: string): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`/api/v1/admin/products/${id}/status`, { status });
  }

  addVariant(
    productId: number,
    data: Partial<ProductVariantDTO>,
  ): Observable<ApiResponse<ProductVariantDTO>> {
    return this.api.post<ProductVariantDTO>(`/api/v1/admin/products/${productId}/variants`, data);
  }

  updateVariant(
    productId: number,
    variantId: number,
    data: UpdateVariantRequest,
  ): Observable<ApiResponse<ProductVariantDTO>> {
    return this.api.put<ProductVariantDTO>(
      `/api/v1/admin/products/${productId}/variants/${variantId}`,
      data,
    );
  }

  deleteVariant(productId: number, variantId: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/admin/products/${productId}/variants/${variantId}`);
  }

  addImage(productId: number, formData: FormData): Observable<ApiResponse<ProductImageDTO>> {
    return this.api.post<ProductImageDTO>(`/api/v1/admin/products/${productId}/images`, formData);
  }

  setImagePrimary(productId: number, imageId: number): Observable<ApiResponse<void>> {
    return this.api.put<void>(`/api/v1/admin/products/${productId}/images/${imageId}/primary`, {});
  }

  deleteImage(productId: number, imageId: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/admin/products/${productId}/images/${imageId}`);
  }

  reorderImages(productId: number, imageIds: number[]): Observable<ApiResponse<void>> {
    return this.api.put<void>(`/api/v1/admin/products/${productId}/images/reorder`, { imageIds });
  }

  updateProductIngredients(
    productId: number,
    ingredientIds: number[],
  ): Observable<ApiResponse<void>> {
    return this.api.put<void>(`/api/v1/admin/products/${productId}/ingredients`, { ingredientIds });
  }

  updateProductTags(productId: number, tags: string[]): Observable<ApiResponse<void>> {
    return this.api.put<void>(`/api/v1/admin/products/${productId}/tags`, { tags });
  }

  getProductStats(): Observable<ApiResponse<ProductStatsDTO>> {
    return this.api.get<ProductStatsDTO>('/api/v1/admin/products/stats');
  }

  // CATEGORY CRUD
  createCategory(data: CreateCategoryRequest): Observable<ApiResponse<CategoryDTO>> {
    return this.api.post<CategoryDTO>('/api/v1/admin/categories', data);
  }

  updateCategory(id: number, data: UpdateCategoryRequest): Observable<ApiResponse<CategoryDTO>> {
    return this.api.put<CategoryDTO>(`/api/v1/admin/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/admin/categories/${id}`);
  }

  updateCategoryStatus(id: number, status: string): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`/api/v1/admin/categories/${id}/status`, { status });
  }

  // BRAND CRUD
  createBrand(data: CreateBrandRequest): Observable<ApiResponse<BrandDTO>> {
    return this.api.post<BrandDTO>('/api/v1/admin/brands', data);
  }

  updateBrand(id: number, data: UpdateBrandRequest): Observable<ApiResponse<BrandDTO>> {
    return this.api.put<BrandDTO>(`/api/v1/admin/brands/${id}`, data);
  }

  deleteBrand(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/admin/brands/${id}`);
  }

  // ADMIN INGREDIENTS CRUD
  createIngredient(data: CreateIngredientRequest): Observable<ApiResponse<IngredientDTO>> {
    return this.api.post<IngredientDTO>('/api/v1/admin/ingredients', data);
  }

  updateIngredient(
    id: number,
    data: UpdateIngredientRequest,
  ): Observable<ApiResponse<IngredientDTO>> {
    return this.api.put<IngredientDTO>(`/api/v1/admin/ingredients/${id}`, data);
  }

  deleteIngredient(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/admin/ingredients/${id}`);
  }

  // ORDER MANAGEMENT
  getAdminOrders(
    filters: AdminOrderFilters = {},
  ): Observable<ApiResponse<SpringPage<OrderSummaryDTO>>> {
    const params: Record<string, string | number> = {
      page: filters.page ?? 0,
      size: filters.size ?? 10,
      sort: filters.sort ?? 'createdAt,desc',
    };
    if (filters.status) params['status'] = filters.status;
    if (filters.userId != null) params['userId'] = filters.userId;
    if (filters.orderNumber) params['orderNumber'] = filters.orderNumber;
    if (filters.fromDate) params['fromDate'] = filters.fromDate;
    if (filters.toDate) params['toDate'] = filters.toDate;
    return this.api.get<SpringPage<OrderSummaryDTO>>('/api/v1/admin/orders', params);
  }

  getAdminOrderDetail(orderNumber: string): Observable<ApiResponse<OrderDTO>> {
    return this.api.get<OrderDTO>(`/api/v1/admin/orders/${orderNumber}`);
  }

  // Backend exposes this as PATCH (@PatchMapping), not PUT.
  updateOrderStatus(
    orderNumber: string,
    status: OrderStatus,
    note?: string,
  ): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`/api/v1/admin/orders/${orderNumber}/status`, { status, note });
  }

  adminCancelOrder(orderNumber: string, reason: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(`/api/v1/admin/orders/${orderNumber}/cancel`, { reason });
  }

  confirmReturn(orderNumber: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(`/api/v1/admin/orders/${orderNumber}/confirm-return`, {});
  }

  getOrderStats(): Observable<ApiResponse<OrderStatsDTO>> {
    return this.api.get<OrderStatsDTO>('/api/v1/admin/orders/stats');
  }

  // INVENTORY MANAGEMENT (inventory-service)
  getInventory(
    page = 0,
    size = 10,
    filter?: 'low-stock' | 'out-of-stock',
  ): Observable<ApiResponse<SpringPage<InventoryDTO>>> {
    const params: Record<string, string | number> = { page, size };
    let endpoint = '/api/v1/admin/inventory';
    if (filter === 'low-stock') {
      endpoint = '/api/v1/admin/inventory/low-stock';
    } else if (filter === 'out-of-stock') {
      endpoint = '/api/v1/admin/inventory/out-of-stock';
    }
    return this.api.get<SpringPage<InventoryDTO>>(endpoint, params);
  }

  getInventoryDetail(id: number): Observable<ApiResponse<InventoryDTO>> {
    return this.api.get<InventoryDTO>(`/api/v1/admin/inventory/${id}`);
  }

  updateInventoryThreshold(
    id: number,
    threshold: number,
    warehouseLocation?: string,
  ): Observable<ApiResponse<InventoryDTO>> {
    return this.api.put<InventoryDTO>(`/api/v1/admin/inventory/${id}`, {
      lowStockThreshold: threshold,
      warehouseLocation,
    });
  }

  importStock(
    inventoryId: number,
    quantity: number,
    note?: string,
  ): Observable<ApiResponse<StockMovementDTO>> {
    return this.api.post<StockMovementDTO>('/api/v1/admin/inventory/import', {
      inventoryId,
      quantity,
      note,
    });
  }

  getInventoryMovements(
    id: number,
    page = 0,
    size = 20,
  ): Observable<ApiResponse<SpringPage<StockMovementDTO>>> {
    return this.api.get<SpringPage<StockMovementDTO>>(`/api/v1/admin/inventory/${id}/movements`, {
      page,
      size,
    });
  }

  getInventoryStats(): Observable<ApiResponse<InventoryStatsDTO>> {
    return this.api.get<InventoryStatsDTO>('/api/v1/admin/inventory/stats');
  }

  // ─────────── USER MANAGEMENT (user-service /api/v1/admin/users) ───────────
  /** Paginated user list. BE returns the raw Spring `Page<User>` in `data`. */
  listUsers(page = 0, size = 20): Observable<ApiResponse<SpringPage<AdminUserDTO>>> {
    return this.api.get<SpringPage<AdminUserDTO>>('/api/v1/admin/users', { page, size });
  }

  getUser(id: string): Observable<ApiResponse<AdminUserDTO>> {
    return this.api.get<AdminUserDTO>(`/api/v1/admin/users/${id}`);
  }

  banUser(id: string): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`/api/v1/admin/users/${id}/ban`, {});
  }

  unbanUser(id: string): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`/api/v1/admin/users/${id}/unban`, {});
  }

  /** BE consumes `role` as a query param, not JSON body. */
  updateUserRole(id: string, role: 'USER' | 'ADMIN'): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`/api/v1/admin/users/${id}/role?role=${encodeURIComponent(role)}`, {});
  }

  /** Triggers a password-reset email; admin cannot directly see the new password. */
  forceResetPassword(id: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(`/api/v1/admin/users/${id}/reset-password`, {});
  }

  getUserAuditLogs(
    id: string,
    page = 0,
    size = 20,
  ): Observable<ApiResponse<SpringPage<AuditLogDTO>>> {
    return this.api.get<SpringPage<AuditLogDTO>>(
      `/api/v1/admin/users/${id}/audit-logs`,
      { page, size },
    );
  }

  getUserStatsSummary(): Observable<ApiResponse<AdminUserStats>> {
    return this.api.get<AdminUserStats>('/api/v1/admin/users/stats/summary');
  }

  /**
   * CSV export — endpoint returns raw `text/csv` (no ApiResponse envelope),
   * so we bypass ApiService and hit the gateway directly with `responseType:
   * 'blob'`. The JWT interceptor still attaches the bearer token.
   */
  exportUsersCsv(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/v1/admin/users/export`, {
      responseType: 'blob',
    });
  }

  exportOrdersCsv(filters: AdminOrderFilters = {}): Observable<Blob> {
    const params: Record<string, string> = {};
    if (filters.status) params['status'] = filters.status;
    if (filters.userId != null) params['userId'] = filters.userId;
    if (filters.orderNumber) params['orderNumber'] = filters.orderNumber;
    if (filters.fromDate) params['fromDate'] = filters.fromDate;
    if (filters.toDate) params['toDate'] = filters.toDate;
    return this.http.get(`${environment.apiUrl}/api/v1/admin/orders/export`, {
      responseType: 'blob',
      params,
    });
  }

  // ─────────── PROMOTION MANAGEMENT (promotion-service /api/v1/admin/promotions) ───────────
  listPromotions(
    page = 0,
    size = 20,
    status?: string,
  ): Observable<ApiResponse<SpringPage<PromotionDTO>>> {
    const params: Record<string, string | number> = { page, size };
    if (status) params['status'] = status;
    return this.api.get<SpringPage<PromotionDTO>>('/api/v1/admin/promotions', params);
  }

  getPromotion(id: number): Observable<ApiResponse<PromotionDTO>> {
    return this.api.get<PromotionDTO>(`/api/v1/admin/promotions/${id}`);
  }

  createPromotion(data: CreatePromotionRequest): Observable<ApiResponse<PromotionDTO>> {
    return this.api.post<PromotionDTO>('/api/v1/admin/promotions', data);
  }

  updatePromotion(id: number, data: UpdatePromotionRequest): Observable<ApiResponse<PromotionDTO>> {
    return this.api.put<PromotionDTO>(`/api/v1/admin/promotions/${id}`, data);
  }

  updatePromotionStatus(id: number, body: UpdateStatusRequest): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`/api/v1/admin/promotions/${id}/status`, body);
  }

  getPromotionUsages(
    id: number,
    page = 0,
    size = 20,
  ): Observable<ApiResponse<SpringPage<PromotionUsageDTO>>> {
    return this.api.get<SpringPage<PromotionUsageDTO>>(`/api/v1/admin/promotions/${id}/usages`, {
      page,
      size,
    });
  }

  getPromotionStats(id: number): Observable<ApiResponse<PromotionStatsDTO>> {
    return this.api.get<PromotionStatsDTO>(`/api/v1/admin/promotions/${id}/stats`);
  }

  assignVouchersBulk(body: AssignBulkRequest): Observable<ApiResponse<{ assigned: number }>> {
    return this.api.post<{ assigned: number }>(
      '/api/v1/admin/promotions/vouchers/assign-bulk',
      body,
    );
  }

  generateVoucherCodes(
    id: number,
    body: GenerateVoucherCodesRequest,
  ): Observable<ApiResponse<VoucherCodeDTO[]>> {
    return this.api.post<VoucherCodeDTO[]>(`/api/v1/admin/promotions/${id}/voucher-codes`, body);
  }

  listVoucherCodes(
    id: number,
    page = 0,
    size = 50,
  ): Observable<ApiResponse<SpringPage<VoucherCodeDTO>>> {
    return this.api.get<SpringPage<VoucherCodeDTO>>(
      `/api/v1/admin/promotions/${id}/voucher-codes`,
      { page, size },
    );
  }

  getFlashSaleSlots(flashSaleId: number): Observable<ApiResponse<FlashSaleSlotsDTO[]>> {
    return this.api.get<FlashSaleSlotsDTO[]>(
      `/api/v1/admin/promotions/flash-sales/${flashSaleId}/slots`,
    );
  }
}
