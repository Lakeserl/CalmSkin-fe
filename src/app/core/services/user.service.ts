import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';
import { SpringPage } from './order.service';
import {
  WishlistItem,
  SessionInfo,
  UserPointDTO,
  PointTransactionDTO,
  SkinProfileDTO,
  SkinProfileRequest,
} from '../models/user.model';
import { ProductSummaryDTO } from '../models/product.model';

/**
 * Client for user-service endpoints under `/api/v1/users/me/*` that are
 * orthogonal to auth/profile/address (those live on AuthService for legacy
 * reasons). Covers wishlist, active sessions, loyalty points and the AI
 * face-scan-driven skin profile.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  // ───────── Wishlist (returns product UUIDs) ─────────
  getWishlist(): Observable<ApiResponse<WishlistItem[]>> {
    return this.api.get<WishlistItem[]>('/api/v1/users/me/wishlist');
  }

  addToWishlist(productId: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(`/api/v1/users/me/wishlist/${productId}`, {});
  }

  removeFromWishlist(productId: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/users/me/wishlist/${productId}`);
  }

  // ───────── Active sessions ─────────
  getSessions(): Observable<ApiResponse<SessionInfo[]>> {
    return this.api.get<SessionInfo[]>('/api/v1/users/me/sessions');
  }

  revokeSession(sessionId: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/users/me/sessions/${sessionId}`);
  }

  // ───────── Loyalty points ─────────
  getPoints(): Observable<ApiResponse<UserPointDTO>> {
    return this.api.get<UserPointDTO>('/api/v1/users/me/points');
  }

  /** Paged transactions; BE serialises the raw Spring Page object as `data`. */
  getPointTransactions(page = 0, size = 20): Observable<ApiResponse<SpringPage<PointTransactionDTO>>> {
    return this.api.get<SpringPage<PointTransactionDTO>>(
      '/api/v1/users/me/points/transactions',
      { page, size },
    );
  }

  // ───────── Skin profile (Face-Scan AI feature) ─────────
  /** Returns 404 envelope if the user has not created one yet. */
  getSkinProfile(): Observable<ApiResponse<SkinProfileDTO>> {
    return this.api.get<SkinProfileDTO>('/api/v1/users/me/skin-profile');
  }

  createSkinProfile(data: SkinProfileRequest): Observable<ApiResponse<SkinProfileDTO>> {
    return this.api.post<SkinProfileDTO>('/api/v1/users/me/skin-profile', data);
  }

  updateSkinProfile(data: SkinProfileRequest): Observable<ApiResponse<SkinProfileDTO>> {
    return this.api.put<SkinProfileDTO>('/api/v1/users/me/skin-profile', data);
  }

  // ─── Recently viewed ────────────────────────────────────────────────────

  /** POST /api/v1/users/me/recently-viewed — track a product view. */
  trackRecentlyViewed(productId: number): Observable<ApiResponse<void>> {
    return this.api.post<void>('/api/v1/users/me/recently-viewed', { productId });
  }

  /** GET /api/v1/users/me/recently-viewed?limit= */
  getRecentlyViewed(limit = 10): Observable<ApiResponse<ProductSummaryDTO[]>> {
    return this.api.get<ProductSummaryDTO[]>('/api/v1/users/me/recently-viewed', { limit });
  }

  // ─── Avatar upload ──────────────────────────────────────────────────────

  /**
   * POST /api/v1/users/me/avatar/presign — get S3 PUT URL for new avatar.
   * Flow: presign → PUT bytes to S3 → AuthService.updateProfile({avatarUrl}).
   */
  presignAvatar(filename: string, contentType: string, sizeBytes: number): Observable<ApiResponse<{ uploadUrl: string; mediaUrl: string }>> {
    return this.api.post<{ uploadUrl: string; mediaUrl: string }>(
      '/api/v1/users/me/avatar/presign',
      { filename, contentType, sizeBytes },
    );
  }
}
