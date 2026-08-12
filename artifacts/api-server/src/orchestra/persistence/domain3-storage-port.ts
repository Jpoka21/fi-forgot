/**
 * Domain 3 storage port — G2–G11 (Review through Governed Handoff Preparation).
 */

import type {
  ApprovalActId,
  ApprovalActRecord,
  ApprovalWithholdingId,
  ApprovalWithholdingRecord,
  DesignTimeFeasibilityEvaluationId,
  DesignTimeFeasibilityEvaluationRecord,
  Domain3BrainAdvisoryId,
  Domain3BrainAdvisoryRecord,
  DownstreamDeficiencyRecord,
  DownstreamDeficiencyRecordId,
  GovernedHandoffPreparationId,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  GpraId,
  GpraInvalidationActId,
  GpraInvalidationActRecord,
  GpraSupersessionActId,
  GpraSupersessionActRecord,
  ProductionReadinessReview,
  ProductionReadinessReviewId,
  ResubmissionEligibilityId,
  ResubmissionEligibilityRecord,
  ReturnPostureId,
  ReturnPostureRecord,
  ReviewDeterminationId,
  ReviewDeterminationRecord,
  ReviewDimensionActivityId,
  ReviewDimensionActivityRecord,
  ReviewEvidenceId,
  ReviewEvidenceRecord,
  ReworkAuthorizationId,
  ReworkAuthorizationRecord,
  ReworkAuthorizationWithholdingId,
  ReworkAuthorizationWithholdingRecord,
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
  listProductionReadinessReviewsByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<readonly ProductionReadinessReview[]>;
  getReviewByResubmissionEligibilityId(
    eligibilityId: ResubmissionEligibilityId,
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

  /**
   * Persist GPRA grant. Unique gpraId and reviewId; multiple grants per rva+obligation
   * are allowed (R62 replacement after Invalidated). Use listGpraGrantsByRvaObligation
   * as the source of truth for scope history.
   */
  putGpraGrant(gpra: GpraGrantRecord): Promise<void>;
  getGpraGrant(gpraId: GpraId): Promise<GpraGrantRecord | null>;
  getGpraGrantByReview(reviewId: ProductionReadinessReviewId): Promise<GpraGrantRecord | null>;
  /**
   * Chronologically latest grant by grantedAt among listGpraGrantsByRvaObligation
   * (historical; may be Invalidated). Prefer list + repository forward-active filters.
   */
  getGpraGrantByRvaObligation(
    rvaId: RealizedVisualArtifactId,
    obligationId: ProductionObligationId,
  ): Promise<GpraGrantRecord | null>;
  listGpraGrantsByRvaObligation(
    rvaId: RealizedVisualArtifactId,
    obligationId: ProductionObligationId,
  ): Promise<GpraGrantRecord[]>;

  putGpraInvalidationAct(act: GpraInvalidationActRecord): Promise<void>;
  getGpraInvalidationAct(
    invalidationActId: GpraInvalidationActId,
  ): Promise<GpraInvalidationActRecord | null>;
  getGpraInvalidationActByGpra(gpraId: GpraId): Promise<GpraInvalidationActRecord | null>;

  /** All GPRA grants for a Production Obligation across RVAs (chronological source of truth). */
  listGpraGrantsByObligation(obligationId: ProductionObligationId): Promise<GpraGrantRecord[]>;

  /**
   * Persist supersession act. Unique supersessionActId and unique predecessorGpraId
   * (one supersession act per predecessor GPRA identity — R69/R70).
   */
  putGpraSupersessionAct(act: GpraSupersessionActRecord): Promise<void>;
  getGpraSupersessionAct(
    supersessionActId: GpraSupersessionActId,
  ): Promise<GpraSupersessionActRecord | null>;
  getGpraSupersessionActByPredecessor(
    predecessorGpraId: GpraId,
  ): Promise<GpraSupersessionActRecord | null>;

  putDownstreamDeficiencyRecord(record: DownstreamDeficiencyRecord): Promise<void>;
  getDownstreamDeficiencyRecord(
    deficiencyRecordId: DownstreamDeficiencyRecordId,
  ): Promise<DownstreamDeficiencyRecord | null>;
  getDownstreamDeficiencyRecordByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<DownstreamDeficiencyRecord | null>;

  putReworkAuthorization(authorization: ReworkAuthorizationRecord): Promise<void>;
  getReworkAuthorization(
    reworkAuthorizationId: ReworkAuthorizationId,
  ): Promise<ReworkAuthorizationRecord | null>;
  getReworkAuthorizationByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ReworkAuthorizationRecord | null>;

  putReworkAuthorizationWithholding(
    withholding: ReworkAuthorizationWithholdingRecord,
  ): Promise<void>;
  getReworkAuthorizationWithholding(
    withholdingId: ReworkAuthorizationWithholdingId,
  ): Promise<ReworkAuthorizationWithholdingRecord | null>;
  getReworkAuthorizationWithholdingByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ReworkAuthorizationWithholdingRecord | null>;

  putReturnPosture(returnPosture: ReturnPostureRecord): Promise<void>;
  getReturnPosture(returnPostureId: ReturnPostureId): Promise<ReturnPostureRecord | null>;
  getReturnPostureByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ReturnPostureRecord | null>;

  putResubmissionEligibility(eligibility: ResubmissionEligibilityRecord): Promise<void>;
  getResubmissionEligibility(
    eligibilityId: ResubmissionEligibilityId,
  ): Promise<ResubmissionEligibilityRecord | null>;
  getResubmissionEligibilityByPriorReview(
    priorReviewId: ProductionReadinessReviewId,
  ): Promise<ResubmissionEligibilityRecord | null>;

  /**
   * Append-only Brain advisory (R81). Unique by advisoryId; multiple advisories per review allowed.
   * No update or delete API — history must not be mutated.
   */
  putDomain3BrainAdvisory(advisory: Domain3BrainAdvisoryRecord): Promise<void>;
  getDomain3BrainAdvisory(
    advisoryId: Domain3BrainAdvisoryId,
  ): Promise<Domain3BrainAdvisoryRecord | null>;
  listDomain3BrainAdvisoriesByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly Domain3BrainAdvisoryRecord[]>;

  /**
   * Append-only Handoff preparation (R94 HPAM). Unique by preparationId; multiple per GPRA allowed.
   * No update or delete API — history must not be mutated.
   */
  putGovernedHandoffPreparation(record: GovernedHandoffPreparationRecord): Promise<void>;
  getGovernedHandoffPreparation(
    preparationId: GovernedHandoffPreparationId,
  ): Promise<GovernedHandoffPreparationRecord | null>;
  listGovernedHandoffPreparationsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffPreparationRecord[]>;
}
