/**
 * Mirrors user-service DTOs not covered by auth.model.ts.
 *
 * These shapes match the Java entities/DTOs in user-service exactly so the
 * gateway envelope `{ data: T }` can be consumed unmodified.
 */

/** `/api/v1/users/me/wishlist` returns `List<UUID>` (product IDs). */
export type WishlistItem = string;

/** `/api/v1/users/me/sessions` — Java `SessionController.SessionInfo` record. */
export interface SessionInfo {
  id: string;            // UUID
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;     // ISO from LocalDateTime
}

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

/** `/api/v1/users/me/points` — UserPoint entity serialised by Spring. */
export interface UserPointDTO {
  id: string;            // UUID
  totalPoints: number;
  tier: LoyaltyTier;
  updatedAt: string;
}

export type PointTransactionType =
  | 'EARN' | 'SPEND' | 'REFUND' | 'EXPIRE' | 'BONUS' | 'ADJUSTMENT';

/** `/api/v1/users/me/points/transactions` element — PointTransaction entity. */
export interface PointTransactionDTO {
  id: string;            // UUID
  points: number;
  type: PointTransactionType;
  referenceId?: string;
  referenceType?: string;
  description: string;
  createdAt: string;
}

export type SkinType =
  | 'NORMAL' | 'DRY' | 'OILY' | 'COMBINATION' | 'SENSITIVE' | 'ACNE_PRONE';

/** `/api/v1/users/me/skin-profile` body. */
export interface SkinProfileRequest {
  skinType: SkinType;
  skinConcerns?: string[];
  allergies?: string[];
  note?: string;
}

/** `/api/v1/users/me/skin-profile` response. */
export interface SkinProfileDTO {
  id: string;
  skinType: SkinType;
  skinConcerns?: string[];
  allergies?: string[];
  note?: string;
}

/** `/api/v1/admin/users` list item — User entity projection. */
export interface AdminUserDTO {
  id: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** `/api/v1/admin/users/{id}/audit-logs` element. */
export interface AuditLogDTO {
  id: string;
  action: string;
  description?: string;
  ipAddress?: string;
  deviceInfo?: string;
  createdAt: string;
}

/** `/api/v1/admin/users/stats/summary` — Map<String, Long>. */
export interface AdminUserStats {
  total?: number;
  active?: number;
  banned?: number;
  inactive?: number;
  admins?: number;
  [k: string]: number | undefined;
}
