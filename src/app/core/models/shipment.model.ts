/**
 * Shipping-service contracts. Mirrors shipping-service AdminShipmentController DTOs.
 * Endpoint base: /api/v1/admin/shipments.
 */

export type ShipmentStatus =
  | 'PENDING'
  | 'PICKING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RETURNED';

export type ShippingProvider = 'MOCK' | 'GHN' | 'GHTK';

export type TrackingEventSource =
  | 'PROVIDER_WEBHOOK'
  | 'ADMIN_MANUAL'
  | 'SCHEDULER'
  | 'EVENT';

export interface TrackingEventDTO {
  id: number;
  status: ShipmentStatus;
  description?: string;
  location?: string;
  source: TrackingEventSource;
  occurredAt: string;
}

export interface ShipmentDTO {
  id: number;
  orderId: number;
  orderNumber: string;
  userId: string;

  provider: ShippingProvider;
  providerOrderId?: string;
  trackingNumber?: string;
  status: ShipmentStatus;

  recipientName: string;
  recipientPhone: string;
  addressStreet: string;
  addressWard: string;
  addressDistrict: string;
  addressProvince: string;
  addressCountry?: string;

  weightG?: number;
  shippingFee?: number;
  codAmount?: number;

  estimatedPickupAt?: string;
  estimatedDeliveryAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  createdAt: string;
  updatedAt?: string;

  trackingEvents?: TrackingEventDTO[];
}

export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus;
  description?: string;
  location?: string;
}

export interface CancelShipmentRequest {
  reason: string;
}
