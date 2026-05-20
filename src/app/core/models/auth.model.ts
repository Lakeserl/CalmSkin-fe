export interface UserDTO {
  id: number;
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
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

export interface AddressDTO {
  id: number;
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}

export interface AddressRequest {
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}

export interface LoyaltyTransactionDTO {
  id: number;
  points: number;
  transactionType: 'EARN' | 'SPEND' | 'REFUND';
  description: string;
  createdAt: string;
}
