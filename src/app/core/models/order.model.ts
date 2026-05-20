export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
export type PaymentMethod = 'COD' | 'VNPAY';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItemDTO {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  primaryImageUrl?: string;
  variantId?: number;
  variantName?: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface OrderStatusHistoryDTO {
  id: number;
  status: OrderStatus;
  note?: string;
  createdAt: string;
  createdBy?: string;
}

export interface PaymentInfoDTO {
  paymentMethod: string;
  paymentStatus: PaymentStatus;
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
  userId: number;
  
  shippingName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingDistrict: string;
  shippingWard: string;
  shippingStreet: string;
  
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  pointsUsed: number;
  pointsAmount: number;
  totalAmount: number;
  
  voucherCode?: string;
  voucherDiscount?: number;
  
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  note?: string;
  cancelReason?: string;
  
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
  
  paymentUrl?: string; // used for redirecting to online gateway
}

export interface OrderSummaryDTO {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  itemsCount: number;
  firstItemName: string;
  firstItemImageUrl?: string;
}

export interface CreateOrderRequest {
  items: {
    productId: number;
    variantId?: number;
    quantity: number;
  }[];
  addressId: number;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  pointsToUse: number;
  note?: string;
}

/* Inventory-service specific DTOs */
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
