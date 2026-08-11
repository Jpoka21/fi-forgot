/**
 * Domain 3 storage port — Production-readiness Review admission records.
 */

import type {
  ProductionReadinessReview,
  ProductionReadinessReviewId,
} from "../domain3-types.js";
import type { RealizedVisualArtifactId } from "../domain2-types.js";

export interface Domain3StoragePort {
  putProductionReadinessReview(review: ProductionReadinessReview): Promise<void>;
  getProductionReadinessReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ProductionReadinessReview | null>;
  getActiveProductionReadinessReviewByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<ProductionReadinessReview | null>;
}
