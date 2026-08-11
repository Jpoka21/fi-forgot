/**
 * In-memory Domain 3 storage adapter — admission + G3 activity + G4 DTF.
 */

import type {
  DesignTimeFeasibilityEvaluationRecord,
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
  const dtfById = new Map<string, DesignTimeFeasibilityEvaluationRecord>();
  const dtfByReview = new Map<string, string[]>();

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
      if (evidenceById.has(evidence.evidenceId)) {
        throw new Error(`Duplicate Review evidence identity: ${evidence.evidenceId}`);
      }
      evidenceById.set(evidence.evidenceId, structuredClone(evidence));
      const list = evidenceByReview.get(evidence.reviewId) ?? [];
      list.push(evidence.evidenceId);
      evidenceByReview.set(evidence.reviewId, list);
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
      if (activitiesById.has(activity.activityId)) {
        throw new Error(`Duplicate Review dimension activity identity: ${activity.activityId}`);
      }
      activitiesById.set(activity.activityId, structuredClone(activity));
      const list = activitiesByReview.get(activity.reviewId) ?? [];
      list.push(activity.activityId);
      activitiesByReview.set(activity.reviewId, list);
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

    async putDesignTimeFeasibilityEvaluation(evaluation) {
      if (dtfById.has(evaluation.evaluationId)) {
        throw new Error(`Duplicate Design-Time Feasibility evaluation identity: ${evaluation.evaluationId}`);
      }
      dtfById.set(evaluation.evaluationId, structuredClone(evaluation));
      const list = dtfByReview.get(evaluation.reviewId) ?? [];
      list.push(evaluation.evaluationId);
      dtfByReview.set(evaluation.reviewId, list);
    },

    async getDesignTimeFeasibilityEvaluation(evaluationId) {
      const evaluation = dtfById.get(evaluationId);
      return evaluation ? structuredClone(evaluation) : null;
    },

    async listDesignTimeFeasibilityEvaluationsByReview(reviewId) {
      const ids = dtfByReview.get(reviewId) ?? [];
      return Object.freeze(
        ids
          .map((id) => dtfById.get(id))
          .filter((item): item is DesignTimeFeasibilityEvaluationRecord => !!item)
          .map((item) => structuredClone(item)),
      );
    },
  };
}
