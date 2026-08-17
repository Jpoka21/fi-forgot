/**
 * Domain 3 storage port — G2–G11 + STD-015 HOF-G1 entry + HOF-G7 evidence consumption + HOF-G10 preservation audit + HOF-G2 authorization + HOF-G3 consumer binding + HOF-G4 posture declaration + HOF-G5 act-layer lifecycle + HOF-G8 downstream exit boundary.
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
  GovernedHandoffEntryId,
  GovernedHandoffEntryRecord,
  GovernedHandoffEvidenceConsumptionId,
  GovernedHandoffEvidenceConsumptionRecord,
  GovernedHandoffPreparationId,
  GovernedHandoffPreparationRecord,
  GovernedHandoffAuthorizationActId,
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffCompletionActId,
  GovernedHandoffCompletionActRecord,
  GovernedHandoffSuspensionActId,
  GovernedHandoffSuspensionActRecord,
  GovernedHandoffWithdrawalActId,
  GovernedHandoffWithdrawalActRecord,
  GovernedHandoffRecallActId,
  GovernedHandoffRecallActRecord,
  GovernedHandoffReentryActId,
  GovernedHandoffReentryActRecord,
  GovernedHandoffResumptionActId,
  GovernedHandoffResumptionActRecord,
  GovernedHandoffDownstreamExitBoundaryAttributionId,
  GovernedHandoffDownstreamExitBoundaryAttributionRecord,
  GovernedHandoffDownstreamExitCompletenessSatisfactionId,
  GovernedHandoffDownstreamExitCompletenessSatisfactionRecord,
  GovernedHandoffDownstreamExitCompletenessAttemptId,
  GovernedHandoffDownstreamExitCompletenessAttemptRecord,
  GovernedHandoffConsumerBindingId,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffPostureDeclarationActId,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreservationAuditId,
  GovernedHandoffPreservationAuditRecord,
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

  /**
   * Append-only Handoff entry (HOF-G1). Unique by entryId; multiple per preparation allowed.
   * No update or delete API — history must not be mutated.
   */
  putGovernedHandoffEntry(record: GovernedHandoffEntryRecord): Promise<void>;
  getGovernedHandoffEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<GovernedHandoffEntryRecord | null>;
  listGovernedHandoffEntriesByPreparation(
    preparationId: GovernedHandoffPreparationId,
  ): Promise<readonly GovernedHandoffEntryRecord[]>;
  listGovernedHandoffEntriesByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffEntryRecord[]>;

  /**
   * Append-only Handoff evidence consumption (HOF-G7). Unique by consumptionId;
   * multiple per entry allowed. No update or delete API — history must not be mutated.
   */
  putGovernedHandoffEvidenceConsumption(
    record: GovernedHandoffEvidenceConsumptionRecord,
  ): Promise<void>;
  getGovernedHandoffEvidenceConsumption(
    consumptionId: GovernedHandoffEvidenceConsumptionId,
  ): Promise<GovernedHandoffEvidenceConsumptionRecord | null>;
  listGovernedHandoffEvidenceConsumptionsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffEvidenceConsumptionRecord[]>;
  listGovernedHandoffEvidenceConsumptionsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffEvidenceConsumptionRecord[]>;

  /**
   * Append-only Handoff preservation audit (HOF-G10). Unique by preservationAuditId;
   * multiple per entry allowed. No update or delete API — history must not be mutated.
   */
  putGovernedHandoffPreservationAudit(
    record: GovernedHandoffPreservationAuditRecord,
  ): Promise<void>;
  getGovernedHandoffPreservationAudit(
    preservationAuditId: GovernedHandoffPreservationAuditId,
  ): Promise<GovernedHandoffPreservationAuditRecord | null>;
  listGovernedHandoffPreservationAuditsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffPreservationAuditRecord[]>;
  listGovernedHandoffPreservationAuditsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffPreservationAuditRecord[]>;

  /**
   * Append-only Handoff authorization act (HOF-G2). Unique by authorizationActId;
   * multiple per entry allowed. No update or delete API — history must not be mutated.
   */
  putGovernedHandoffAuthorizationAct(
    record: GovernedHandoffAuthorizationActRecord,
  ): Promise<void>;
  getGovernedHandoffAuthorizationAct(
    authorizationActId: GovernedHandoffAuthorizationActId,
  ): Promise<GovernedHandoffAuthorizationActRecord | null>;
  listGovernedHandoffAuthorizationActsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffAuthorizationActRecord[]>;
  listGovernedHandoffAuthorizationActsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffAuthorizationActRecord[]>;

  /**
   * Append-only HCCM consumer binding (HOF-G3). Unique by bindingId;
   * multiple per entry allowed. No update or delete API — history must not be mutated.
   */
  putGovernedHandoffConsumerBinding(
    record: GovernedHandoffConsumerBindingRecord,
  ): Promise<void>;
  getGovernedHandoffConsumerBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<GovernedHandoffConsumerBindingRecord | null>;
  listGovernedHandoffConsumerBindingsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffConsumerBindingRecord[]>;
  listGovernedHandoffConsumerBindingsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffConsumerBindingRecord[]>;

  /**
   * Append-only Handoff posture declaration (HOF-G4). Unique by postureDeclarationActId;
   * multiple per binding allowed (additive history; latest authoritative). No update/delete.
   */
  putGovernedHandoffPostureDeclarationAct(
    record: GovernedHandoffPostureDeclarationActRecord,
  ): Promise<void>;
  getGovernedHandoffPostureDeclarationAct(
    postureDeclarationActId: GovernedHandoffPostureDeclarationActId,
  ): Promise<GovernedHandoffPostureDeclarationActRecord | null>;
  listGovernedHandoffPostureDeclarationActsByBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<readonly GovernedHandoffPostureDeclarationActRecord[]>;
  listGovernedHandoffPostureDeclarationActsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffPostureDeclarationActRecord[]>;
  listGovernedHandoffPostureDeclarationActsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffPostureDeclarationActRecord[]>;

  /**
   * Append-only Handoff completion act (HOF-G5). Unique by completionActId;
   * multiple per binding allowed (additive history; latest authoritative). No update/delete.
   */
  putGovernedHandoffCompletionAct(
    record: GovernedHandoffCompletionActRecord,
  ): Promise<void>;
  getGovernedHandoffCompletionAct(
    completionActId: GovernedHandoffCompletionActId,
  ): Promise<GovernedHandoffCompletionActRecord | null>;
  listGovernedHandoffCompletionActsByBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<readonly GovernedHandoffCompletionActRecord[]>;
  listGovernedHandoffCompletionActsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffCompletionActRecord[]>;
  listGovernedHandoffCompletionActsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffCompletionActRecord[]>;

  /**
   * Append-only Handoff suspension act (HOF-G6-U2). Unique by suspensionActId;
   * multiple per binding allowed (additive history; latest authoritative). No update/delete.
   */
  putGovernedHandoffSuspensionAct(
    record: GovernedHandoffSuspensionActRecord,
  ): Promise<void>;
  getGovernedHandoffSuspensionAct(
    suspensionActId: GovernedHandoffSuspensionActId,
  ): Promise<GovernedHandoffSuspensionActRecord | null>;
  listGovernedHandoffSuspensionActsByBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<readonly GovernedHandoffSuspensionActRecord[]>;
  listGovernedHandoffSuspensionActsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffSuspensionActRecord[]>;
  listGovernedHandoffSuspensionActsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffSuspensionActRecord[]>;

  /**
   * Append-only Handoff withdrawal act (HOF-G6-U3). Unique by withdrawalActId;
   * multiple per binding allowed (additive history; latest authoritative). No update/delete.
   */
  putGovernedHandoffWithdrawalAct(
    record: GovernedHandoffWithdrawalActRecord,
  ): Promise<void>;
  getGovernedHandoffWithdrawalAct(
    withdrawalActId: GovernedHandoffWithdrawalActId,
  ): Promise<GovernedHandoffWithdrawalActRecord | null>;
  listGovernedHandoffWithdrawalActsByBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<readonly GovernedHandoffWithdrawalActRecord[]>;
  listGovernedHandoffWithdrawalActsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffWithdrawalActRecord[]>;
  listGovernedHandoffWithdrawalActsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffWithdrawalActRecord[]>;

  /**
   * Append-only Handoff recall act (HOF-G6-U4). Unique by recallActId;
   * multiple per binding allowed (additive history; latest authoritative). No update/delete.
   */
  putGovernedHandoffRecallAct(
    record: GovernedHandoffRecallActRecord,
  ): Promise<void>;
  getGovernedHandoffRecallAct(
    recallActId: GovernedHandoffRecallActId,
  ): Promise<GovernedHandoffRecallActRecord | null>;
  listGovernedHandoffRecallActsByBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<readonly GovernedHandoffRecallActRecord[]>;
  listGovernedHandoffRecallActsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffRecallActRecord[]>;
  listGovernedHandoffRecallActsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffRecallActRecord[]>;

  /**
   * Append-only HERCM REC-02 resumption act (R126–R139). Unique by resumptionActId;
   * repeated resumptions per binding are additive (latest authoritative). No update/delete.
   */
  putGovernedHandoffResumptionAct(
    record: GovernedHandoffResumptionActRecord,
  ): Promise<void>;
  getGovernedHandoffResumptionAct(
    resumptionActId: GovernedHandoffResumptionActId,
  ): Promise<GovernedHandoffResumptionActRecord | null>;
  listGovernedHandoffResumptionActsByBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<readonly GovernedHandoffResumptionActRecord[]>;
  listGovernedHandoffResumptionActsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffResumptionActRecord[]>;
  listGovernedHandoffResumptionActsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffResumptionActRecord[]>;

  /**
   * Append-only HERCM REC-01/03/04/05 re-entry act (R126–R139). Unique by reentryActId;
   * repeated re-entries per binding are additive (latest authoritative). No update/delete.
   */
  putGovernedHandoffReentryAct(
    record: GovernedHandoffReentryActRecord,
  ): Promise<void>;
  getGovernedHandoffReentryAct(
    reentryActId: GovernedHandoffReentryActId,
  ): Promise<GovernedHandoffReentryActRecord | null>;
  listGovernedHandoffReentryActsByBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<readonly GovernedHandoffReentryActRecord[]>;
  listGovernedHandoffReentryActsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffReentryActRecord[]>;
  listGovernedHandoffReentryActsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffReentryActRecord[]>;

  /**
   * Append-only downstream exit-boundary attribution (HOF-G8 R58–R65).
   * Unique by exitBoundaryAttributionId; multiple per binding allowed (additive tip).
   * No update/delete. Does not mutate completion/auth/posture/binding.
   */
  putGovernedHandoffDownstreamExitBoundaryAttribution(
    record: GovernedHandoffDownstreamExitBoundaryAttributionRecord,
  ): Promise<void>;
  getGovernedHandoffDownstreamExitBoundaryAttribution(
    exitBoundaryAttributionId: GovernedHandoffDownstreamExitBoundaryAttributionId,
  ): Promise<GovernedHandoffDownstreamExitBoundaryAttributionRecord | null>;
  listGovernedHandoffDownstreamExitBoundaryAttributionsByBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<readonly GovernedHandoffDownstreamExitBoundaryAttributionRecord[]>;
  listGovernedHandoffDownstreamExitBoundaryAttributionsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffDownstreamExitBoundaryAttributionRecord[]>;
  listGovernedHandoffDownstreamExitBoundaryAttributionsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffDownstreamExitBoundaryAttributionRecord[]>;

  /**
   * Append-only downstream exit-completeness satisfaction (HOF-G8 R142–R145).
   * Unique by exitCompletenessSatisfactionId; multiple per binding allowed (additive tip).
   * No update/delete. Does not mutate exit-boundary/completion/auth/posture/binding.
   */
  putGovernedHandoffDownstreamExitCompletenessSatisfaction(
    record: GovernedHandoffDownstreamExitCompletenessSatisfactionRecord,
  ): Promise<void>;
  getGovernedHandoffDownstreamExitCompletenessSatisfaction(
    exitCompletenessSatisfactionId: GovernedHandoffDownstreamExitCompletenessSatisfactionId,
  ): Promise<GovernedHandoffDownstreamExitCompletenessSatisfactionRecord | null>;
  listGovernedHandoffDownstreamExitCompletenessSatisfactionsByBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<readonly GovernedHandoffDownstreamExitCompletenessSatisfactionRecord[]>;
  listGovernedHandoffDownstreamExitCompletenessSatisfactionsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffDownstreamExitCompletenessSatisfactionRecord[]>;
  listGovernedHandoffDownstreamExitCompletenessSatisfactionsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffDownstreamExitCompletenessSatisfactionRecord[]>;

  putGovernedHandoffDownstreamExitCompletenessAttempt(
    record: GovernedHandoffDownstreamExitCompletenessAttemptRecord,
  ): Promise<void>;
  getGovernedHandoffDownstreamExitCompletenessAttempt(
    attemptId: GovernedHandoffDownstreamExitCompletenessAttemptId,
  ): Promise<GovernedHandoffDownstreamExitCompletenessAttemptRecord | null>;
  listGovernedHandoffDownstreamExitCompletenessAttemptsByBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<readonly GovernedHandoffDownstreamExitCompletenessAttemptRecord[]>;
}
