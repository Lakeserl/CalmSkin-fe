export type PromotionType =
  | 'VOUCHER'
  | 'FLASH_SALE'
  | 'BUNDLE'
  | 'PRODUCT_DISCOUNT'
  | 'CATEGORY_DISCOUNT'
  | 'FREE_GIFT';

export type DiscountType =
  | 'PERCENTAGE'
  | 'FIXED_AMOUNT'
  | 'FREE_SHIPPING'
  | 'FREE_GIFT';

export type PromotionStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'EXPIRED'
  | 'CANCELLED';

export type VoucherCodeStatus = 'ACTIVE' | 'USED' | 'EXPIRED';

/** Full promotion view (admin). */
export interface PromotionDTO {
  id: number;
  code?: string;
  name: string;
  description?: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  minItemQuantity?: number;
  applicableProductIds?: number[];
  applicableCategoryIds?: number[];
  applicableBrandIds?: number[];
  excludedProductIds?: number[];
  totalUsageLimit?: number;
  perUserLimit?: number;
  startsAt: string;
  endsAt: string;
  status: PromotionStatus;
  stackable: boolean;
  priority?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/** Public lightweight promotion summary. */
export interface PromotionSummaryDTO {
  id: number;
  name: string;
  description?: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  startsAt: string;
  endsAt: string;
}

/** Voucher assigned to current user. */
export interface MyVoucherDTO {
  promotionId: number;
  code: string;
  name: string;
  discountValue: number;
  endsAt: string;
  usedCount: number;
  usageLimit?: number;
}

/** Public preview of a voucher code (lookup by code). */
export interface VoucherInfoDTO {
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  endsAt: string;
  isValid: boolean;
  reason?: string;
}

/** Flash-sale line item. */
export interface FlashSaleProductDTO {
  productId: number;
  variantId?: number;
  salePrice: number;
  originalPrice: number;
  quantityLeft: number;
}

/** Flash-sale promotion with products. */
export interface FlashSaleDTO {
  promotionId: number;
  promotionName: string;
  startsAt: string;
  endsAt: string;
  products: FlashSaleProductDTO[];
}

/** Real-time slot counters for one flash-sale line. */
export interface FlashSaleSlotsDTO {
  flashSaleId: number;
  productId: number;
  variantId?: number;
  quantityLimit: number;
  quantitySold: number;
  quantityReserved: number;
  quantityLeft: number;
}

/** Generated campaign voucher code. */
export interface VoucherCodeDTO {
  code: string;
  assignedUserId?: string;
  status: VoucherCodeStatus;
}

/** Promotion usage analytics. */
export interface PromotionStatsDTO {
  totalUsageCount: number;
  totalDiscountGiven: number;
  avgDiscountAmount: number;
}

/** Promotion usage audit record. */
export interface PromotionUsageDTO {
  id: number;
  promotionId: number;
  userId: string;
  orderNumber?: string;
  discountAmount: number;
  status: 'APPLIED' | 'ROLLED_BACK';
  createdAt: string;
}

// ─── Request shapes ───────────────────────────────────────────────────────

export interface TierInput {
  minQuantity?: number;
  minValue?: number;
  discountType: DiscountType;
  discountValue: number;
  sortOrder?: number;
}

export interface FlashSaleInput {
  productId: number;
  variantId?: number;
  originalPrice: number;
  salePrice: number;
  quantityLimit: number;
}

export interface BundleInput {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface GiftInput {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface CreatePromotionRequest {
  code?: string;
  name: string;
  description?: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  minItemQuantity?: number;
  applicableProductIds?: number[];
  applicableCategoryIds?: number[];
  applicableBrandIds?: number[];
  excludedProductIds?: number[];
  totalUsageLimit?: number;
  perUserLimit?: number;
  startsAt: string;
  endsAt: string;
  isStackable?: boolean;
  priority?: number;
  tiers?: TierInput[];
  flashSales?: FlashSaleInput[];
  bundleItems?: BundleInput[];
  gifts?: GiftInput[];
}

export interface UpdatePromotionRequest {
  name?: string;
  description?: string;
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  minItemQuantity?: number;
  applicableProductIds?: number[];
  applicableCategoryIds?: number[];
  applicableBrandIds?: number[];
  excludedProductIds?: number[];
  totalUsageLimit?: number;
  perUserLimit?: number;
  startsAt?: string;
  endsAt?: string;
  isStackable?: boolean;
  priority?: number;
}

export interface UpdateStatusRequest {
  status: PromotionStatus;
}

export interface AssignBulkRequest {
  promotionId: number;
  userIds: string[];
  source?: string;
}

export interface GenerateVoucherCodesRequest {
  count?: number;
  assignedUserIds?: string[];
}
