/**
 * AI Skin Analysis-service contracts.
 * Endpoint base: /api/v1/ai/skin-analysis.
 */

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface RecommendedProductDTO {
  productId: number;
  name: string;
  imageUrl?: string;
  category?: string;
  price: number;
}

export interface RoutineDTO {
  steps: string[];
}

export interface SkinAnalysisResultDTO {
  sessionId: string;
  userId: number;
  status: AnalysisStatus;
  detectedSkinType?: string;
  detectedConcerns?: string[];
  skinConditionReport?: string;
  recommendedProducts?: RecommendedProductDTO[];
  morningRoutine?: RoutineDTO;
  eveningRoutine?: RoutineDTO;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SkinAnalysisStartRequest {
  image: File;
  age?: number;
  selfSkinType?: string;
  selfConcerns?: string;
  allergies?: string;
  /** Required by BE: must be true (PII/biometric consent under Decree 13/2023). */
  consentGiven: boolean;
}
