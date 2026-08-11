/**
 * In-memory Domain 3 storage adapter.
 */

import type { ProductionReadinessReview } from "../domain3-types.js";
import type { Domain3StoragePort } from "./domain3-storage-port.js";

export function createInMemoryDomain3Storage(): Domain3StoragePort {
  const reviews = new Map<string, ProductionReadinessReview>();
  const activeByRva = new Map<string, string>();

  return {
    async putProductionReadinessReview(review) {
      reviews.set(review.reviewId, structuredClone(review));
      if (review.posture === "under_review") {
        activeByRva.set(review.rvaId, review.reviewId);
      }
    },

    async getProductionReadinessReview(reviewId) {
      const review = reviews.get(reviewId);
      return review ? structuredClone(review) : null;
    },

    async getActiveProductionReadinessReviewByRva(rvaId) {
      const reviewId = activeByRva.get(rvaId);
      if (!reviewId) return null;
      return this.getProductionReadinessReview(reviewId as ProductionReadinessReview["reviewId"]);
    },
  };
}
