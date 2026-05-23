/**
 * Payment-service contracts — kept in sync with
 * com.lakeserl.payment_service.models.* (DTOs and enums).
 */

export type PaymentMethodCode = 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'COD' | 'POINTS';

export type PaymentStatusCode =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type RefundStatusCode = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type RefundMethodCode = 'ORIGINAL' | 'BANK_TRANSFER' | 'POINTS';

/** Terminal payment states — polling can stop once one of these is reached. */
export const TERMINAL_PAYMENT_STATUSES: ReadonlySet<PaymentStatusCode> = new Set<PaymentStatusCode>([
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);

export interface PaymentDTO {
  id: number;
  paymentNumber: string;
  orderId: number;
  orderNumber: string;
  /** User UUID — matches the JWT/gateway X-User-Id. */
  userId: string;
  /** Amount in VND (integer). */
  amount: number;
  refundedAmount: number;
  method: PaymentMethodCode;
  status: PaymentStatusCode;
  transactionRef?: string;
  gatewayTransactionId?: string;
  paymentUrl?: string;
  failureReason?: string;
  expiresAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitResponse {
  paymentNumber: string;
  paymentUrl?: string;
  status: PaymentStatusCode;
}

export interface RefundDTO {
  refundNumber: string;
  paymentId: number;
  orderId: number;
  amount: number;
  reason: string;
  refundMethod: RefundMethodCode;
  status: RefundStatusCode;
  gatewayRefundId?: string;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
}

/* ----------------------------- Request DTOs ----------------------------- */

export interface PaymentInitiateRequest {
  orderNumber: string;
  paymentMethod: PaymentMethodCode;
}

export interface RefundInitiateRequest {
  /** Minimum 1000 VND, enforced by the backend. */
  amount: number;
  reason: string;
}

export interface CodConfirmRequest {
  orderNumber: string;
}
