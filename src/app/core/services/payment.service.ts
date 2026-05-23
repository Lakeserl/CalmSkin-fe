import { Injectable, inject } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { filter, map, switchMap, takeWhile } from 'rxjs/operators';
import { ApiResponse, ApiService } from './api.service';
import {
  CodConfirmRequest,
  PaymentDTO,
  PaymentInitiateRequest,
  PaymentInitResponse,
  RefundDTO,
  RefundInitiateRequest,
  TERMINAL_PAYMENT_STATUSES,
} from '../models/payment.model';

/**
 * Client for payment-service (`/api/v1/payments`). The API Gateway injects
 * X-User-* headers from the JWT, so no userId is sent explicitly here.
 */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly api = inject(ApiService);

  /** Starts a payment for an order; online methods return a `paymentUrl`. */
  initiatePayment(request: PaymentInitiateRequest): Observable<ApiResponse<PaymentInitResponse>> {
    return this.api.post<PaymentInitResponse>('/api/v1/payments/initiate', request);
  }

  getPayment(paymentNumber: string): Observable<ApiResponse<PaymentDTO>> {
    return this.api.get<PaymentDTO>(`/api/v1/payments/${paymentNumber}`);
  }

  /** Current user's payments (paged; page metadata sits on the envelope). */
  getUserPayments(page = 0, size = 10): Observable<ApiResponse<PaymentDTO[]>> {
    return this.api.get<PaymentDTO[]>('/api/v1/payments', { page, size });
  }

  /** Admin-only listing of every payment. */
  getAllPayments(page = 0, size = 10): Observable<ApiResponse<PaymentDTO[]>> {
    return this.api.get<PaymentDTO[]>('/api/v1/payments/admin', { page, size });
  }

  confirmCodPayment(request: CodConfirmRequest): Observable<ApiResponse<PaymentDTO>> {
    return this.api.post<PaymentDTO>('/api/v1/payments/cod/confirm', request);
  }

  refundPayment(
    paymentNumber: string,
    request: RefundInitiateRequest,
  ): Observable<ApiResponse<RefundDTO>> {
    return this.api.post<RefundDTO>(`/api/v1/payments/${paymentNumber}/refund`, request);
  }

  /**
   * Polls a payment until it reaches a terminal status (or `maxAttempts` is
   * hit). Emits every successfully fetched PaymentDTO so callers can show
   * progress; completes once a terminal status is observed.
   */
  pollPaymentStatus(
    paymentNumber: string,
    intervalMs = 4000,
    maxAttempts = 45,
  ): Observable<PaymentDTO> {
    let attempts = 0;
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getPayment(paymentNumber)),
      map((res) => res.data),
      filter((payment): payment is PaymentDTO => !!payment),
      takeWhile((payment) => {
        attempts += 1;
        const terminal = TERMINAL_PAYMENT_STATUSES.has(payment.status);
        // emit the terminal value, then stop; also stop after maxAttempts
        return !terminal && attempts < maxAttempts;
      }, true),
    );
  }
}
