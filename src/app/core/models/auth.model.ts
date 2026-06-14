export interface UserDTO {
  /** User UUID (user-service primary key). */
  id: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  emailVerified: boolean;
  points: number;
  membershipClass: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  gender?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number; // seconds or ms
  user: UserDTO;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  /** Set after presign-based avatar upload — the public S3 mediaUrl. */
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

/** Mirrors user-service AddressResponse (`/api/v1/users/me/addresses`). */
export interface AddressDTO {
  /** Address UUID. */
  id: string;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  postalCode?: string;
  isDefault: boolean;
}

/** Mirrors user-service AddressRequest. */
export interface AddressRequest {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  postalCode?: string;
  isDefault: boolean;
}

/**
 * Legacy view-layer shape. Real BE field is `type` (not `transactionType`);
 * mapped at the service layer in `AuthService.getLoyaltyHistory()`.
 */
export interface LoyaltyTransactionDTO {
  id: string;
  points: number;
  transactionType: 'EARN' | 'SPEND' | 'REFUND' | 'EXPIRE' | 'BONUS' | 'ADJUSTMENT';
  description: string;
  createdAt: string;
}

export interface RegisterRequest {
  email?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  /** Phone-OTP quick-register flow used by the login screen. */
  quickLogin?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
