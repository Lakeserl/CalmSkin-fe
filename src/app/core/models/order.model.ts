/**
 * Order-service contracts — kept in sync with
 * com.lakeserl.order_service.dto.* and .enums.*
 */

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

/** Payment methods accepted when creating an order. */
export type PaymentMethod = 'VNPAY' | 'MOMO' | 'COD' | 'POINTS' | 'FREE';

/** Payment status as reported inside an order's embedded paymentInfo. */
export type OrderPaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface OrderItemDTO {
  id: number;
  productId: number;
  variantId?: number;
  productName: string;
  productSku?: string;
  variantName?: string;
  productImageUrl?: string;
  brandName?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderStatusHistoryDTO {
  id: number;
  fromStatus?: string;
  toStatus: string;
  changedBy?: string;
  reason?: string;
  metadata?: string;
  createdAt: string;
}

export interface PaymentInfoDTO {
  paymentMethod: string;
  paymentStatus: OrderPaymentStatus;
  transactionId?: string;
  amount: number;
  refundAmount?: number;
  paidAt?: string;
  refundedAt?: string;
}

export interface ShippingInfoDTO {
  shippingProvider?: string;
  trackingNumber?: string;
  shippingStatus?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  shippingFee: number;
  providerOrderId?: string;
}

export interface OrderDTO {
  id: number;
  orderNumber: string;
  /** User UUID — matches the JWT/gateway X-User-Id. */
  userId: string;

  // Shipping address (denormalised onto the order)
  shippingName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingDistrict: string;
  shippingWard: string;
  shippingStreet: string;

  // Pricing
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  pointsUsed: number;
  pointsAmount: number;
  totalAmount: number;

  // Voucher
  voucherCode?: string;
  voucherDiscount?: number;

  // Status / method
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  note?: string;
  cancelReason?: string;

  // Lifecycle timestamps
  confirmedAt?: string;
  paidAt?: string;
  preparingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;

  items: OrderItemDTO[];
  statusHistory: OrderStatusHistoryDTO[];

  paymentInfo?: PaymentInfoDTO;
  shippingInfo?: ShippingInfoDTO;

  /** Populated only for online payment flows. */
  paymentUrl?: string;
}

export interface OrderSummaryDTO {
  id: number;
  orderNumber: string;
  userId: string;
  shippingName: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  totalItems: number;
}

export interface OrderStatsDTO {
  totalOrders: number;
  totalRevenue: number;
  byStatus: Record<string, number>;
  averageOrderValue: number;
}

/* ----------------------------- Request DTOs ----------------------------- */

export interface CreateOrderRequest {
  items: {
    productId: number;
    variantId?: number;
    quantity: number;
  }[];
  /** Address UUID owned by the current user (user-service). */
  addressId: string;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  pointsToUse: number;
  note?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface ReturnOrderRequest {
  reason: string;
  items: {
    orderItemId: number;
    quantity: number;
  }[];
}

/* ----------------------- Inventory-service DTOs ------------------------- */

export interface InventoryDTO {
  id: number;
  productId: number;
  productName?: string; // resolved in frontend for admin
  variantId?: number;
  variantName?: string; // resolved in frontend for admin
  quantityAvailable: number;
  quantityReserved: number;
  quantitySold: number;
  lowStockThreshold: number;
  warehouseLocation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovementDTO {
  id: number;
  inventoryId: number;
  movementType: 'IN' | 'OUT' | 'RESERVE' | 'RELEASE' | 'ADJUST' | 'RETURN' | 'EXPIRE';
  quantity: number;
  referenceId?: string;
  referenceType?: string;
  note?: string;
  createdBy?: string;
  createdAt: string;
}

export interface InventoryStatsDTO {
  totalProducts: number;
  lowStockCount: number;
  totalReservedItems: number;
  stockMovementsCount: number;
}
