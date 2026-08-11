/**
 * In-memory Domain 3 storage adapter — admission + append-only Review activity.
 */

import type {
  ProductionReadinessReview,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
} from "../domain3-types.js";
import type { Domain3StoragePort } from "./domain3-storage-port.js";

export function createInMemoryDomain3Storage(): Domain3StoragePort {
  const reviews = new Map<string, ProductionReadinessReview>();
  const activeByRva = new Map<string, string>();
  const evidenceById = new Map<string, ReviewEvidenceRecord>();
  const evidenceByReview = new Map<string, string[]>();
  const activitiesById = new Map<string, ReviewDimensionActivityRecord>();
  const activitiesByReview = new Map<string, string[]>();

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

    async putReviewEvidence(evidence) {
      evidenceById.set(evidence.evidenceId, structuredClone(evidence));
      const list = evidenceByReview.get(evidence.reviewId) ?? [];
      if (!list.includes(evidence.evidenceId)) {
        list.push(evidence.evidenceId);
        evidenceByReview.set(evidence.reviewId, list);
      }
    },

    async getReviewEvidence(evidenceId) {
      const evidence = evidenceById.get(evidenceId);
      return evidence ? structuredClone(evidence) : null;
    },

    async listReviewEvidenceByReview(reviewId) {
      const ids = evidenceByReview.get(reviewId) ?? [];
      return Object.freeze(
        ids
          .map((id) => evidenceById.get(id))
          .filter((item): item is ReviewEvidenceRecord => !!item)
          .map((item) => structuredClone(item)),
      );
    },

    async putReviewDimensionActivity(activity) {
      activitiesById.set(activity.activityId, structuredClone(activity));
      const list = activitiesByReview.get(activity.reviewId) ?? [];
      if (!list.includes(activity.activityId)) {
        list.push(activity.activityId);
        activitiesByReview.set(activity.reviewId, list);
      }
    },

    async getReviewDimensionActivity(activityId) {
      const activity = activitiesById.get(activityId);
      return activity ? structuredClone(activity) : null;
    },

    async listReviewDimensionActivitiesByReview(reviewId) {
      const ids = activitiesByReview.get(reviewId) ?? [];
      return Object.freeze(
        ids
          .map((id) => activitiesById.get(id))
          .filter((item): item is ReviewDimensionActivityRecord => !!item)
          .map((item) => structuredClone(item)),
      );
    },
  };
}
