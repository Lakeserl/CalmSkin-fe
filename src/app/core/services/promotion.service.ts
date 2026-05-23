import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';
import {
  FlashSaleDTO,
  MyVoucherDTO,
  PromotionSummaryDTO,
  VoucherInfoDTO,
} from '../models/promotion.model';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  private readonly api = inject(ApiService);

  // ─── Public ─────────────────────────────────────────────────────────────

  /** GET /api/v1/promotions/active — list active public promotions. */
  getActive(): Observable<ApiResponse<PromotionSummaryDTO[]>> {
    return this.api.get<PromotionSummaryDTO[]>('/api/v1/promotions/active');
  }

  /** GET /api/v1/promotions/{code}/info — voucher preview by code (no claim). */
  getInfoByCode(code: string): Observable<ApiResponse<VoucherInfoDTO>> {
    return this.api.get<VoucherInfoDTO>(`/api/v1/promotions/${encodeURIComponent(code)}/info`);
  }

  /** GET /api/v1/promotions/flash-sales/current — currently running flash sales. */
  getCurrentFlashSales(): Observable<ApiResponse<FlashSaleDTO[]>> {
    return this.api.get<FlashSaleDTO[]>('/api/v1/promotions/flash-sales/current');
  }

  /** GET /api/v1/promotions/flash-sales/upcoming — upcoming flash sales. */
  getUpcomingFlashSales(): Observable<ApiResponse<FlashSaleDTO[]>> {
    return this.api.get<FlashSaleDTO[]>('/api/v1/promotions/flash-sales/upcoming');
  }

  // ─── User ───────────────────────────────────────────────────────────────

  /** GET /api/v1/promotions/vouchers/me — vouchers assigned to current user. */
  getMyVouchers(): Observable<ApiResponse<MyVoucherDTO[]>> {
    return this.api.get<MyVoucherDTO[]>('/api/v1/promotions/vouchers/me');
  }

  /** POST /api/v1/promotions/vouchers/claim/{code} — claim a public voucher code. */
  claimVoucher(code: string): Observable<ApiResponse<MyVoucherDTO>> {
    return this.api.post<MyVoucherDTO>(
      `/api/v1/promotions/vouchers/claim/${encodeURIComponent(code)}`,
      {},
    );
  }
}
