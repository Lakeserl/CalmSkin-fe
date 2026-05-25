/**
 * Review-service contracts. Mirrors review-service DTOs.
 * Endpoint base: /api/v1/reviews, /api/v1/admin/reviews.
 */

export type MediaType = 'IMAGE' | 'VIDEO';

export type ReviewStatus = 'PUBLISHED' | 'HIDDEN' | 'PENDING_MODERATION' | 'DELETED';

export type ReportReason = 'SPAM' | 'FAKE' | 'OFFENSIVE' | 'OFF_TOPIC' | 'OTHER';

export type ReportStatus = 'PENDING' | 'DISMISSED' | 'ACTION_TAKEN';

export type SkinTypeTag = 'OILY' | 'DRY' | 'COMBINATION' | 'SENSITIVE' | 'NORMAL';

export type AgeRangeTag = '18-24' | '25-34' | '35-44' | '45+';

export interface ReviewMediaDTO {
  id: number;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  sortOrder: number;
}

export interface ReviewReplyDTO {
  id: number;
  reviewId: number;
  userId: string;
  seller: boolean;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDTO {
  id: number;
  productId: number;
  userId: string;
  orderId: number;
  orderItemId: number;
  rating: number;
  title?: string;
  body?: string;
  skinType?: SkinTypeTag | string;
  ageRange?: AgeRangeTag | string;
  skinEffectRating?: number;
  textureRating?: number;
  scentRating?: number;
  packagingRating?: number;
  valueRating?: number;
  verified: boolean;
  status: ReviewStatus;
  helpfulCount: number;
  notHelpfulCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  media?: ReviewMediaDTO[];
  replies?: ReviewReplyDTO[];
  /** null if the current user has not voted. */
  currentUserVote?: boolean | null;
}

export interface ReviewSummaryDTO {
  productId: number;
  totalCount: number;
  averageRating: number;
  count1star: number;
  count2star: number;
  count3star: number;
  count4star: number;
  count5star: number;
  countOily: number;
  countDry: number;
  countCombination: number;
  countSensitive: number;
  countNormal: number;
  avgSkinEffect: number;
  avgTexture: number;
  avgScent: number;
  avgPackaging: number;
  avgValue: number;
}

export interface EligibilityDTO {
  orderItemId: number;
  productId: number;
  orderCompletedAt: string;
  reviewed: boolean;
}

export interface ReviewReportDTO {
  id: number;
  reviewId: number;
  reporterId: string;
  reason: ReportReason;
  detail?: string;
  status: ReportStatus;
  createdAt: string;
}

export interface AdminReviewStatsDTO {
  totalReviews: number;
  publishedCount: number;
  pendingModerationCount: number;
  hiddenCount: number;
  deletedCount: number;
  pendingReportsCount: number;
}

/* ----------------------------- Request DTOs ----------------------------- */

export interface CreateReviewRequest {
  orderItemId: number;
  rating: number;
  title?: string;
  body?: string;
  skinType?: SkinTypeTag;
  ageRange?: AgeRangeTag;
  skinEffectRating?: number;
  textureRating?: number;
  scentRating?: number;
  packagingRating?: number;
  valueRating?: number;
  mediaUrls?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  body?: string;
  skinType?: SkinTypeTag;
  ageRange?: AgeRangeTag;
  skinEffectRating?: number;
  textureRating?: number;
  scentRating?: number;
  packagingRating?: number;
  valueRating?: number;
  mediaUrls?: string[];
}

export interface CreateReplyRequest {
  body: string;
}

export interface CreateReportRequest {
  reason: ReportReason;
  detail?: string;
}

export interface VoteRequest {
  helpful: boolean;
}

/** Request shape for POST /api/v1/reviews/media/presign. */
export interface PresignRequest {
  filename: string;
  /** Allowed: image/(jpeg|png|webp|gif) | video/(mp4|mov). */
  contentType: string;
}

/** Response shape for POST /api/v1/reviews/media/presign. */
export interface PresignResponse {
  uploadUrl: string;
  mediaUrl: string;
}

export interface AdminUpdateReviewRequest {
  status: ReviewStatus;
  adminNote?: string;
}

export interface AdminUpdateReportRequest {
  status: ReportStatus;
}
