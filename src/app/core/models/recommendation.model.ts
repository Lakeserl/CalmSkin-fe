import { ProductSummaryDTO } from './product.model';

/**
 * Recommendation-service contracts (ai-recommendation-service).
 * Endpoint base: /api/v1/recommendations.
 * The BE returns a slim ProductDTO that's structurally compatible with our
 * ProductSummaryDTO — we just narrow the type to what's actually populated.
 */

export type RecommendationStrategy =
  | 'SKIN_PROFILE'
  | 'SIMILAR'
  | 'TRENDING'
  | 'FREQUENTLY_BOUGHT_WITH';

export interface RecommendationResponseDTO {
  strategy: RecommendationStrategy;
  products: ProductSummaryDTO[];
}
