import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, ApiService } from './api.service';
import { SpringPage } from './order.service';
import {
  CreateReplyRequest,
  CreateReportRequest,
  CreateReviewRequest,
  EligibilityDTO,
  PresignRequest,
  PresignResponse,
  ReviewDTO,
  ReviewReplyDTO,
  ReviewReportDTO,
  ReviewSummaryDTO,
  UpdateReviewRequest,
  VoteRequest,
} from '../models/review.model';

/**
 * Customer-facing review-service client. Mirrors:
 *   - ReviewController        (/api/v1/reviews)
 *   - ReviewVoteController    (/api/v1/reviews/{id}/votes)
 *   - ReviewReplyController   (/api/v1/reviews/{id}/replies)
 *   - ReviewReportController  (/api/v1/reviews/{id}/reports)
 *
 * Admin moderation lives on AdminService (alongside other admin endpoints).
 */
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  // ─── Public browsing ────────────────────────────────────────────────────

  /** GET /api/v1/reviews/products/{productId} */
  getProductReviews(
    productId: number,
    opts: {
      rating?: number;
      skinType?: string;
      page?: number;
      size?: number;
      sort?: string;
      dir?: 'asc' | 'desc';
    } = {},
  ): Observable<ApiResponse<SpringPage<ReviewDTO>>> {
    return this.api.get<SpringPage<ReviewDTO>>(`/api/v1/reviews/products/${productId}`, {
      rating: opts.rating,
      skinType: opts.skinType,
      page: opts.page ?? 0,
      size: opts.size ?? 10,
      sort: opts.sort ?? 'createdAt',
      dir: opts.dir ?? 'desc',
    });
  }

  /** GET /api/v1/reviews/products/{productId}/summary */
  getProductSummary(productId: number): Observable<ApiResponse<ReviewSummaryDTO>> {
    return this.api.get<ReviewSummaryDTO>(`/api/v1/reviews/products/${productId}/summary`);
  }

  /** GET /api/v1/reviews/{reviewId} */
  getReview(reviewId: number): Observable<ApiResponse<ReviewDTO>> {
    return this.api.get<ReviewDTO>(`/api/v1/reviews/${reviewId}`);
  }

  // ─── Customer actions ───────────────────────────────────────────────────

  /** GET /api/v1/reviews/me */
  getMyReviews(page = 0, size = 10): Observable<ApiResponse<SpringPage<ReviewDTO>>> {
    return this.api.get<SpringPage<ReviewDTO>>('/api/v1/reviews/me', { page, size });
  }

  /** GET /api/v1/reviews/me/eligible — items the user is eligible to review. */
  getEligibleItems(): Observable<ApiResponse<EligibilityDTO[]>> {
    return this.api.get<EligibilityDTO[]>('/api/v1/reviews/me/eligible');
  }

  /** POST /api/v1/reviews/products/{productId} */
  createReview(
    productId: number,
    body: CreateReviewRequest,
  ): Observable<ApiResponse<ReviewDTO>> {
    return this.api.post<ReviewDTO>(`/api/v1/reviews/products/${productId}`, body);
  }

  /** PUT /api/v1/reviews/{reviewId} */
  updateReview(
    reviewId: number,
    body: UpdateReviewRequest,
  ): Observable<ApiResponse<ReviewDTO>> {
    return this.api.put<ReviewDTO>(`/api/v1/reviews/${reviewId}`, body);
  }

  /** DELETE /api/v1/reviews/{reviewId} */
  deleteReview(reviewId: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/reviews/${reviewId}`);
  }

  // ─── Votes ──────────────────────────────────────────────────────────────

  /** POST /api/v1/reviews/{reviewId}/votes — { helpful: boolean } */
  vote(reviewId: number, helpful: boolean): Observable<ApiResponse<void>> {
    const body: VoteRequest = { helpful };
    return this.api.post<void>(`/api/v1/reviews/${reviewId}/votes`, body);
  }

  // ─── Replies ────────────────────────────────────────────────────────────

  /** GET /api/v1/reviews/{reviewId}/replies */
  getReplies(reviewId: number): Observable<ApiResponse<ReviewReplyDTO[]>> {
    return this.api.get<ReviewReplyDTO[]>(`/api/v1/reviews/${reviewId}/replies`);
  }

  /** POST /api/v1/reviews/{reviewId}/replies */
  createReply(
    reviewId: number,
    body: CreateReplyRequest,
  ): Observable<ApiResponse<ReviewReplyDTO>> {
    return this.api.post<ReviewReplyDTO>(`/api/v1/reviews/${reviewId}/replies`, body);
  }

  /** DELETE /api/v1/reviews/{reviewId}/replies/{replyId} */
  deleteReply(reviewId: number, replyId: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/reviews/${reviewId}/replies/${replyId}`);
  }

  // ─── Reports ────────────────────────────────────────────────────────────

  /** POST /api/v1/reviews/{reviewId}/reports */
  reportReview(
    reviewId: number,
    body: CreateReportRequest,
  ): Observable<ApiResponse<ReviewReportDTO>> {
    return this.api.post<ReviewReportDTO>(`/api/v1/reviews/${reviewId}/reports`, body);
  }

  // ─── Media presign + upload ─────────────────────────────────────────────

  /** POST /api/v1/reviews/media/presign — returns S3 upload + final media URL. */
  presignMedia(body: PresignRequest): Observable<ApiResponse<PresignResponse>> {
    return this.api.post<PresignResponse>('/api/v1/reviews/media/presign', body);
  }

  /**
   * Two-step upload: ask BE for a pre-signed PUT URL, then upload the file
   * direct-to-S3. Resolves with the public `mediaUrl` to push into
   * `CreateReviewRequest.mediaUrls[]`.
   *
   * Bypasses the JWT interceptor by calling `HttpClient` against the absolute
   * S3 URL — S3 rejects requests that carry the `Authorization` header.
   */
  uploadMediaFile(file: File): Observable<string> {
    return this.presignMedia({ filename: file.name, contentType: file.type }).pipe(
      switchMap((res) => {
        const presign = res.data;
        if (!presign) {
          throw new Error('Không nhận được URL upload từ máy chủ.');
        }
        return this.http
          .put(presign.uploadUrl, file, {
            headers: { 'Content-Type': file.type },
            observe: 'response',
            responseType: 'text',
          })
          .pipe(map(() => presign.mediaUrl));
      }),
    );
  }
}
