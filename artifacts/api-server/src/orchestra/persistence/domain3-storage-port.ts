/**
 * Domain 3 storage port — G2–G6 (Review through GPRA grant).
 */

import type {
  ApprovalActId,
  ApprovalActRecord,
  ApprovalWithholdingId,
  ApprovalWithholdingRecord,
  DesignTimeFeasibilityEvaluationId,
  DesignTimeFeasibilityEvaluationRecord,
  GpraGrantRecord,
  GpraId,
  ProductionReadinessReview,
  ProductionReadinessReviewId,
  ReviewDeterminationId,
  ReviewDeterminationRecord,
  ReviewDimensionActivityId,
  ReviewDimensionActivityRecord,
  ReviewEvidenceId,
  ReviewEvidenceRecord,
} from "../domain3-types.js";
import type { RealizedVisualArtifactId } from "../domain2-types.js";
import type { ProductionObligationId } from "../types.js";

export interface Domain3StoragePort {
  putProductionReadinessReview(review: ProductionReadinessReview): Promise<void>;
  getProductionReadinessReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ProductionReadinessReview | null>;
  getActiveProductionReadinessReviewByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<ProductionReadinessReview | null>;

  putReviewEvidence(evidence: ReviewEvidenceRecord): Promise<void>;
  getReviewEvidence(evidenceId: ReviewEvidenceId): Promise<ReviewEvidenceRecord | null>;
  listReviewEvidenceByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly ReviewEvidenceRecord[]>;

  putReviewDimensionActivity(activity: ReviewDimensionActivityRecord): Promise<void>;
  getReviewDimensionActivity(
    activityId: ReviewDimensionActivityId,
  ): Promise<ReviewDimensionActivityRecord | null>;
  listReviewDimensionActivitiesByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly ReviewDimensionActivityRecord[]>;

  putDesignTimeFeasibilityEvaluation(
    evaluation: DesignTimeFeasibilityEvaluationRecord,
  ): Promise<void>;
  getDesignTimeFeasibilityEvaluation(
    evaluationId: DesignTimeFeasibilityEvaluationId,
  ): Promise<DesignTimeFeasibilityEvaluationRecord | null>;
  listDesignTimeFeasibilityEvaluationsByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly DesignTimeFeasibilityEvaluationRecord[]>;

  putReviewDetermination(determination: ReviewDeterminationRecord): Promise<void>;
  getReviewDetermination(
    determinationId: ReviewDeterminationId,
  ): Promise<ReviewDeterminationRecord | null>;
  getReviewDeterminationByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ReviewDeterminationRecord | null>;

  putApprovalAct(approval: ApprovalActRecord): Promise<void>;
  getApprovalAct(approvalActId: ApprovalActId): Promise<ApprovalActRecord | null>;
  getApprovalActByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ApprovalActRecord | null>;

  putApprovalWithholding(withholding: ApprovalWithholdingRecord): Promise<void>;
  getApprovalWithholding(
    withholdingId: ApprovalWithholdingId,
  ): Promise<ApprovalWithholdingRecord | null>;
  getApprovalWithholdingByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ApprovalWithholdingRecord | null>;

  putGpraGrant(gpra: GpraGrantRecord): Promise<void>;
  getGpraGrant(gpraId: GpraId): Promise<GpraGrantRecord | null>;
  getGpraGrantByReview(reviewId: ProductionReadinessReviewId): Promise<GpraGrantRecord | null>;
  getGpraGrantByRvaObligation(
    rvaId: RealizedVisualArtifactId,
    obligationId: ProductionObligationId,
  ): Promise<GpraGrantRecord | null>;
}
