import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService, ApiResponse } from './api.service';
import {
  AuthResponse,
  UserDTO,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AddressDTO,
  AddressRequest,
  LoyaltyTransactionDTO,
  RegisterRequest,
  LoginRequest,
  ResetPasswordRequest,
} from '../models/auth.model';
import { SpringPage } from './order.service';
import { Observable, tap, catchError, throwError, of, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);
  
  // Angular 21 Signals for State Management
  readonly currentUser = signal<UserDTO | null>(null);
  readonly token = signal<string | null>(null);
  
  // Computed properties
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  constructor() {
    this.checkAutoLogin();
  }

  register(data: RegisterRequest): Observable<ApiResponse<void>> {
    return this.api.post<void>('/api/v1/auth/register', data);
  }

  verifyEmail(email: string, otp: string): Observable<ApiResponse<void>> {
    return this.api.post<void>('/api/v1/auth/verify-email', { email, otp });
  }

  resendVerification(email: string): Observable<ApiResponse<void>> {
    return this.api.post<void>('/api/v1/auth/resend-verification', { email });
  }

  login(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<AuthResponse>('/api/v1/auth/login', data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
        }
      })
    );
  }

  loginWithOtp(phoneNumber: string, otp: string): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<AuthResponse>('/api/v1/auth/login/otp', { phoneNumber, otp }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
        }
      })
    );
  }

  logout(): void {
    const activeToken = this.token();
    if (activeToken) {
      // fire and forget logout in backend
      this.api.post<void>('/api/v1/auth/logout', {}).subscribe();
    }
    this.clearAuth();
  }

  /** Revokes every refresh token for the current user. Local state cleared regardless. */
  logoutAll(): Observable<ApiResponse<void>> {
    return this.api.post<void>('/api/v1/auth/logout-all', {}).pipe(
      tap(() => this.clearAuth())
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const rt = localStorage.getItem('calmskin_refresh_token');
    if (!rt) return throwError(() => new Error('No refresh token'));

    return this.api.post<AuthResponse>('/api/v1/auth/refresh-token', { refreshToken: rt }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
        }
      }),
      catchError(err => {
        this.clearAuth();
        return throwError(() => err);
      })
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.api.post<void>('/api/v1/auth/forgot-password', { email });
  }

  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<void>> {
    return this.api.post<void>('/api/v1/auth/reset-password', data);
  }

  // Profile management
  getProfile(): Observable<ApiResponse<UserDTO>> {
    return this.api.get<UserDTO>('/api/v1/users/me').pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
        }
      })
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<UserDTO>> {
    return this.api.put<UserDTO>('/api/v1/users/me', data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
        }
      })
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.api.post<void>('/api/v1/users/me/change-password', data);
  }

  uploadAvatar(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<string>('/api/v1/users/me/avatar', formData).pipe(
      tap(res => {
        if (res.success && res.data) {
          const user = this.currentUser();
          if (user) {
            this.currentUser.set({ ...user, avatarUrl: res.data });
          }
        }
      })
    );
  }

  deleteAvatar(): Observable<ApiResponse<void>> {
    return this.api.delete<void>('/api/v1/users/me/avatar').pipe(
      tap(res => {
        if (res.success) {
          const user = this.currentUser();
          if (user) {
            this.currentUser.set({ ...user, avatarUrl: undefined });
          }
        }
      })
    );
  }

  /** Soft-deactivate — account becomes INACTIVE but data is retained. */
  deactivateAccount(): Observable<ApiResponse<void>> {
    return this.api.patch<void>('/api/v1/users/me/deactivate', {}).pipe(
      tap(() => this.clearAuth())
    );
  }

  /** Hard-delete the account; cannot be undone. */
  deleteAccount(): Observable<ApiResponse<void>> {
    return this.api.delete<void>('/api/v1/users/me/account').pipe(
      tap(() => this.clearAuth())
    );
  }

  private handleAuthSuccess(auth: AuthResponse) {
    this.token.set(auth.accessToken);
    this.currentUser.set(auth.user);
    localStorage.setItem('calmskin_token', auth.accessToken);
    localStorage.setItem('calmskin_refresh_token', auth.refreshToken);
    localStorage.setItem('calmskin_user', JSON.stringify(auth.user));
  }

  private clearAuth() {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('calmskin_token');
    localStorage.removeItem('calmskin_refresh_token');
    localStorage.removeItem('calmskin_user');
  }

  private checkAutoLogin() {
    const tokenStr = localStorage.getItem('calmskin_token');
    const userStr = localStorage.getItem('calmskin_user');
    
    if (tokenStr && userStr) {
      try {
        this.token.set(tokenStr);
        this.currentUser.set(JSON.parse(userStr));
        // refresh profile in background to keep it updated
        this.getProfile().subscribe({
          error: () => this.refreshToken().subscribe()
        });
      } catch (e) {
        this.clearAuth();
      }
    }
  }

  // Sổ Địa chỉ nhận hàng
  getUserAddresses(): Observable<ApiResponse<AddressDTO[]>> {
    return this.api.get<AddressDTO[]>('/api/v1/users/me/addresses');
  }

  addAddress(data: AddressRequest): Observable<ApiResponse<AddressDTO>> {
    return this.api.post<AddressDTO>('/api/v1/users/me/addresses', data);
  }

  updateAddress(addressId: string, data: AddressRequest): Observable<ApiResponse<AddressDTO>> {
    return this.api.put<AddressDTO>(`/api/v1/users/me/addresses/${addressId}`, data);
  }

  setDefaultAddress(addressId: string): Observable<ApiResponse<AddressDTO>> {
    return this.api.patch<AddressDTO>(`/api/v1/users/me/addresses/${addressId}/default`, {});
  }

  deleteAddress(addressId: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/users/me/addresses/${addressId}`);
  }

  // Loyalty point history — BE returns Spring Page<PointTransaction>. We
  // flatten to a list and re-shape to the legacy LoyaltyTransactionDTO so
  // existing callers (e.g. profile.component.ts) keep working.
  getLoyaltyHistory(page = 0, size = 50): Observable<ApiResponse<LoyaltyTransactionDTO[]>> {
    return this.api.get<SpringPage<any>>('/api/v1/users/me/points/transactions', { page, size }).pipe(
      map(res => ({
        ...res,
        data: (res.data?.content ?? []).map((tx: any) => ({
          id: tx.id,
          points: tx.points,
          transactionType: tx.type,
          description: tx.description,
          createdAt: tx.createdAt
        } as unknown as LoyaltyTransactionDTO))
      }))
    );
  }

  // Cập nhật Avatar bằng URL
  updateAvatar(url: string): Observable<ApiResponse<UserDTO>> {
    return this.api.put<UserDTO>('/api/v1/users/me', { avatarUrl: url }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
        }
      })
    );
  }
}
