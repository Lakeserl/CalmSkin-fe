import { ProductSummaryDTO } from './product.model';

/**
 * Routine-service contracts. Mirrors product-service RoutineController DTOs.
 * Endpoint: POST /api/v1/routines/generate.
 */

export interface GenerateRoutineRequest {
  /** OILY | DRY | COMBINATION | NORMAL | SENSITIVE. Optional when JWT carries skin profile. */
  skinType?: string;
  /** e.g. ["ACNE", "DARK_SPOTS"]. */
  skinConcerns?: string[];
}

export interface RoutineSteps {
  cleanse: ProductSummaryDTO[];
  treat: ProductSummaryDTO[];
  moisturize: ProductSummaryDTO[];
  protect: ProductSummaryDTO[];
}

export interface RoutineResponse {
  morning: RoutineSteps;
  evening: RoutineSteps;
}
