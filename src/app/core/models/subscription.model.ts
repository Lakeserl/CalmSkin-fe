export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface SubscriptionDTO {
  id: string;
  userId: string;
  productId: number;
  frequencyDays: number;
  addressId: string;
  status: SubscriptionStatus;
  lastOrderedAt?: string;
  nextOrderDueAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSubscriptionRequest {
  productId: number;
  frequencyDays: number;
  addressId: string;
}

export interface UpdateSubscriptionRequest {
  frequencyDays?: number;
  addressId?: string;
}
