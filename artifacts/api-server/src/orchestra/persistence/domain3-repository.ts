/**
 * Governed Domain 3 repository â€” G2â€“G11 + STD-015 HOF-G1 Upstream Entry + HOF-G7 Evidence Consumption + HOF-G10 Preservation Audit + HOF-G2 Authorization + HOF-G3 Consumer Binding + HOF-G4 Posture Declaration + HOF-G5 Act-Layer Lifecycle + HOF-G8 Downstream Exit Boundary.
 */

import type { Domain2Repository } from "./domain2-repository.js";
import type { Domain1Repository } from "./domain1-repository.js";
import { createInMemoryDomain3Storage } from "./domain3-in-memory-storage.js";
import {
  rehydrateApprovalAct,
  rehydrateApprovalWithholding,
  rehydrateDesignTimeFeasibilityEvaluation,
  rehydrateDomain3BrainAdvisory,
  rehydrateDownstreamDeficiencyRecord,
  rehydrateGovernedHandoffEntry,
  rehydrateGovernedHandoffEvidenceConsumption,
  rehydrateGovernedHandoffPreparation,
  rehydrateGovernedHandoffAuthorization,
  rehydrateGovernedHandoffConsumerBinding,
  rehydrateGovernedHandoffPostureDeclaration,
  rehydrateGovernedHandoffCompletion,
  rehydrateGovernedHandoffSuspension,
  rehydrateGovernedHandoffWithdrawal,
  rehydrateGovernedHandoffRecall,
  rehydrateGovernedHandoffDownstreamExitBoundary,
  rehydrateGovernedHandoffPreservationAudit,
  rehydrateGpraGrant,
  rehydrateGpraInvalidationAct,
  rehydrateGpraSupersessionAct,
  rehydrateProductionReadinessReview,
  rehydrateResubmissionEligibility,
  rehydrateReturnPosture,
  rehydrateReviewDetermination,
  rehydrateReviewDimensionActivity,
  rehydrateReviewEvidence,
  rehydrateReworkAuthorization,
  rehydrateReworkAuthorizationWithholding,
} from "./domain3-rehydration.js";
import type { Domain3StoragePort } from "./domain3-storage-port.js";
import {
  validatePersistedApprovalAct,
  validatePersistedApprovalWithholding,
  validatePersistedDesignTimeFeasibilityEvaluation,
  validatePersistedDomain3BrainAdvisory,
  validatePersistedDownstreamDeficiencyRecord,
  validatePersistedGovernedHandoffEntry,
  validatePersistedGovernedHandoffEvidenceConsumption,
  validatePersistedGovernedHandoffPreparation,
  validatePersistedGovernedHandoffAuthorization,
  validatePersistedGovernedHandoffConsumerBinding,
  validatePersistedGovernedHandoffPostureDeclaration,
  validatePersistedGovernedHandoffCompletion,
  validatePersistedGovernedHandoffSuspension,
  validatePersistedGovernedHandoffWithdrawal,
  validatePersistedGovernedHandoffRecall,
  validatePersistedGovernedHandoffDownstreamExitBoundary,
  validatePersistedGovernedHandoffPreservationAudit,
  validatePersistedGpraGrant,
  validatePersistedGpraInvalidationAct,
  validatePersistedGpraSupersessionAct,
  validatePersistedProductionReadinessReview,
  validatePersistedResubmissionEligibility,
  validatePersistedReturnPosture,
  validatePersistedReviewDetermination,
  validatePersistedReworkAuthorization,
  validatePersistedReworkAuthorizationWithholding,
} from "./domain3-validation.js";
import type {
  ApprovalActId,
  ApprovalActRecord,
  ApprovalAuthorityClassId,
  ApprovalConsiderationEligibility,
  ApprovalWithholdingGroundFamily,
  ApprovalWithholdingId,
  ApprovalWithholdingRecord,
  DesignTimeFeasibilityEvaluationId,
  DesignTimeFeasibilityEvaluationRecord,
  DesignTimeFeasibilityObservationKind,
  Domain3BrainAdvisoryId,
  Domain3BrainAdvisoryRecord,
  Domain3BrainAuthorityRouteKind,
  Domain3BrainOutputClass,
  Domain3BrainReevaluationRequestType,
  Domain3BrainSourceAttribution,
  Domain3DecisionStage,
  DownstreamDeficiencyRecord,
  DownstreamDeficiencyRecordId,
  DownstreamDispositionAuthorityClassId,
  DownstreamDispositionEligibility,
  GovernedDeficiencyFamily,
  GovernedHandoffEligibilityAssessment,
  GovernedHandoffEntryAssessment,
  GovernedHandoffEntryId,
  GovernedHandoffEntryRecord,
  GovernedHandoffEvidenceConsumptionAssessment,
  GovernedHandoffEvidenceConsumptionId,
  GovernedHandoffEvidenceConsumptionRecord,
  GovernedHandoffPreparationId,
  GovernedHandoffPreparationRecord,
  GovernedHandoffAuthorizationActId,
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffAuthorizationAssessment,
  GovernedHandoffConsumerBindingId,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffConsumerBindingAssessment,
  GovernedHandoffPostureDeclarationActId,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPostureDeclarationAssessment,
  GovernedHandoffCompletionActId,
  GovernedHandoffCompletionActRecord,
  GovernedHandoffCompletionAssessment,
  GovernedHandoffSuspensionActId,
  GovernedHandoffSuspensionActRecord,
  GovernedHandoffSuspensionAssessment,
  GovernedHandoffWithdrawalActId,
  GovernedHandoffWithdrawalActRecord,
  GovernedHandoffWithdrawalAssessment,
  GovernedHandoffRecallActId,
  GovernedHandoffRecallActRecord,
  GovernedHandoffRecallAssessment,
  HandoffRecallCurrency,
  GovernedHandoffDownstreamExitBoundaryAssessment,
  GovernedHandoffDownstreamExitBoundaryAttributionId,
  GovernedHandoffDownstreamExitBoundaryAttributionRecord,
  HandoffDownstreamExitBoundaryCurrency,
  HandoffDownstreamExitConsiderationEvaluation,
  HandoffActLayerLifecycleEvaluation,
  GovernedHandoffPreservationAuditId,
  GovernedHandoffPreservationAuditRecord,
  GpraGrantRecord,
  GpraId,
  GpraInvalidationActId,
  GpraInvalidationActRecord,
  GpraSupersessionActId,
  GpraSupersessionActRecord,
  GpraValidityAssessment,
  GpraValidityPosture,
  HandoffConsumerCategoryKey,
  HandoffEligibilityLayerCondition,
  HandoffEntryCurrency,
  HandoffEvidenceConsumptionCurrency,
  HandoffPreparationCurrency,
  HandoffAuthorizationCurrency,
  HandoffConsumerBindingCurrency,
  HandoffPostureDeclarationCurrency,
  HandoffCompletionCurrency,
  HandoffSuspensionCurrency,
  HandoffWithdrawalCurrency,
  HandoffPostureClass,
  HandoffPreservationAuditAuthorityEffect,
  HandoffPreservationAuditLinkedCurrency,
  HandoffAuthorityBoundaryAssessment,
  HandoffAuthorityCatalogIntegrationAssessment,
  HofG6U1SharedLifecycleFoundationAssessment,
  HccmConsumerClassId,
  InvalidationAuthorityClassId,
  InvalidationTriggerFamily,
  MandatoryReviewActivityCompleteness,
  ProductionReadinessReview,
  ProductionReadinessReviewId,
  ResubmissionEligibilityId,
  ResubmissionEligibilityRecord,
  ReturnPostureId,
  ReturnPostureRecord,
  ReviewDeterminationId,
  ReviewDeterminationOutcome,
  ReviewDeterminationRecord,
  ReviewDimensionActivityId,
  ReviewDimensionActivityRecord,
  ReviewEvidenceId,
  ReviewEvidenceRecord,
  ReviewEvidenceSourceKind,
  ReworkAuthorizationId,
  ReworkAuthorizationRecord,
  ReworkAuthorizationWithholdingId,
  ReworkAuthorizationWithholdingRecord,
  SupersessionAuthorityClassId,
  SupersessionTriggerFamily,
} from "../domain3-types.js";
import type { RealizedVisualArtifactId } from "../domain2-types.js";
import {
  createApprovalAct,
  createApprovalWithholding,
  createGpraGrant,
  evaluateApprovalConsiderationEligibility,
} from "../approval-and-gpra.js";
import {
  createDomain3BrainAdvisoryRecord,
  type CreateDomain3BrainAdvisoryInput,
} from "../brain-domain3-advisory.js";
import {
  attachDesignTimeFeasibilityEvidenceLinkage,
  buildDesignTimeFeasibilityEvidenceSnapshot,
  createDesignTimeFeasibilityEvaluation,
  DESIGN_TIME_FEASIBILITY_DIMENSION_ID,
} from "../design-time-feasibility.js";
import {
  createDownstreamDeficiencyRecord,
  createResubmissionEligibility,
  createReturnPosture,
  createReworkAuthorization,
  createReworkAuthorizationWithholding,
  evaluateDownstreamDispositionEligibility,
} from "../downstream-disposition.js";
import { OrchestraConstitutionalError } from "../errors.js";
import {
  createGpraInvalidationAct,
} from "../gpra-retention-and-invalidation.js";
import {
  createGpraSupersessionAct,
  evaluateGpraValidityFromPostureActs,
} from "../gpra-supersession-and-succession.js";
import {
  assertGovernedPreparationActor,
  assertHandoffConsumerCategoryKeys,
  assertNoHandoffExecutionOrAuthorityClaims,
  assessGovernedHandoffEligibility,
  createGovernedHandoffPreparationRecord,
  evaluateHandoffPreparationCurrencyFromFacts,
} from "../handoff-preparation.js";
import {
  assertGovernedEntryActor,
  assertNoHandoffEntryExecutionOrAuthorityClaims,
  assessGovernedHandoffEntry,
  createGovernedHandoffEntryRecord,
  evaluateHandoffEntryCurrencyFromFacts,
  handoffEntryLineageMatchesGpra,
} from "../handoff-entry.js";
import {
  assertGovernedEvidenceConsumptionActor,
  assertNoHandoffEvidenceConsumptionExecutionOrActClaims,
  assessGovernedHandoffEvidenceConsumption,
  createGovernedHandoffEvidenceConsumptionRecord,
  evaluateHandoffEvidenceConsumptionCurrencyFromFacts,
} from "../handoff-evidence-consumption.js";
import {
  assertGovernedHandoffAuthorizationActor,
  assertNoHandoffAuthorizationPostureOrExecutionClaims,
  assessGovernedHandoffAuthorization,
  createGovernedHandoffAuthorizationActRecord,
} from "../handoff-authorization.js";
import {
  assertGovernedHandoffConsumerBindingActor,
  assertNoHandoffConsumerBindingPostureOrExecutionClaims,
  assessGovernedHandoffConsumerBinding,
  createGovernedHandoffConsumerBindingRecord,
} from "../handoff-consumer-binding.js";
import {
  assertGovernedHandoffPostureDeclarationActor,
  assertNoHandoffPostureCompletionOrExecutionClaims,
  assessGovernedHandoffPostureDeclaration,
  createGovernedHandoffPostureDeclarationActRecord,
  evaluateHandoffPostureDeclarationCurrencyFromFacts,
  selectAuthoritativeHandoffPostureDeclaration,
} from "../handoff-posture-declaration.js";
import {
  assertGovernedHandoffCompletionActor,
  assertNoHandoffCompletionExecutionOrDeferredLifecycleClaims,
  assessGovernedHandoffCompletion,
  createGovernedHandoffCompletionActRecord,
  evaluateHandoffActLayerLifecycleFromFacts,
  evaluateHandoffCompletionCurrencyFromFacts,
  selectAuthoritativeGovernedHandoffCompletion,
} from "../handoff-act-lifecycle.js";
import {
  assertGovernedHandoffSuspensionActor,
  assertNoHandoffSuspensionWithdrawalRecallOrReentryClaims,
  assessGovernedHandoffSuspension,
  createGovernedHandoffSuspensionActRecord,
  evaluateHandoffSuspensionCurrencyFromFacts,
  selectAuthoritativeGovernedHandoffSuspension,
} from "../handoff-suspension.js";
import {
  assertGovernedHandoffWithdrawalActor,
  assertNoHandoffWithdrawalRecallOrReentryClaims,
  assessGovernedHandoffWithdrawal,
  createGovernedHandoffWithdrawalActRecord,
  evaluateHandoffWithdrawalCurrencyFromFacts,
  selectAuthoritativeGovernedHandoffWithdrawal,
} from "../handoff-withdrawal.js";
import {
  assertGovernedHandoffRecallActor,
  assertNoHandoffRecallWithdrawalOrReentryClaims,
  assessGovernedHandoffRecall,
  createGovernedHandoffRecallActRecord,
  evaluateHandoffRecallCurrencyFromFacts,
  selectAuthoritativeGovernedHandoffRecall,
} from "../handoff-recall.js";
import {
  assertGovernedHandoffDownstreamExitBoundaryActor,
  assertNoDownstreamExitAcceptanceMembershipOrExecutionClaims,
  assessGovernedHandoffDownstreamExitBoundary,
  createGovernedHandoffDownstreamExitBoundaryAttributionRecord,
  evaluateDownstreamExitConsiderationFromFacts,
  evaluateHandoffDownstreamExitBoundaryCurrencyFromFacts,
  selectAuthoritativeGovernedHandoffDownstreamExitBoundary,
} from "../handoff-downstream-exit-boundary.js";
import {
  assertEstablishedHandoffGovernanceAuthorityClass,
} from "../handoff-governance-authority.js";
import {
  assertGovernedPreservationAuditActor,
  assertNoHandoffPreservationAuditActOrErasureClaims,
  createGovernedHandoffPreservationAuditRecord,
  evaluateHandoffPreservationAuditAuthorityEffectFromFacts,
  evaluateHandoffPreservationAuditLinkedCurrencyFromFacts,
} from "../handoff-preservation-audit.js";
import { evaluateHandoffAuthorityBoundaryFromFacts } from "../handoff-authority-boundaries.js";
import {
  assessHandoffAuthorityCatalogIntegration as assessHandoffAuthorityCatalogIntegrationFromCatalog,
} from "../handoff-authority-catalog.js";
import { assessHofG6U1SharedLifecycleFoundation as assessHofG6U1SharedLifecycleFoundationFromModule } from "../handoff-lifecycle-g6-foundation.js";
import { assertEstablishedSupersessionAuthorityClass } from "../supersession-authority.js";
import { assertSupersessionTriggerFamily } from "../supersession-trigger-families.js";
import { assertPersistedRouteCReturnNotAuthorized } from "../route-c-return-authority.js";
import {
  createFrozenManufacturingAuthoritySource,
  type ManufacturingAuthoritySource,
} from "../manufacturing-authority.js";
import {
  createReviewDimensionActivityRecord,
  createReviewEvidenceRecord,
  evaluateMandatoryReviewActivityCompleteness,
} from "../review-activity.js";
import { createReviewDetermination } from "../review-determination.js";
import { admitProductionReadinessReview } from "../review-entry-eligibility.js";
import type { MandatoryReviewDimensionId } from "../review-dimensions.js";
import { isTerminalRvaPosture } from "../rva-lifecycle.js";
import { assertProgramIsActiveAuthority, isActiveProgramPosture } from "../transitions.js";
import type { ProductionObligationId, ProductionProgramId } from "../types.js";

/**
 * Narrow Domain 2 read surface consumed by Domain 3.
 * Domain 3 must not mutate Domain 2 constitutional state.
 */
export type Domain2ReviewEntrySource = Pick<
  Domain2Repository,
  "assertReviewEntryReadinessCurrentForAdmission" | "assembleTraceabilityPackage" | "loadRva"
>;

/** Narrow Domain 1 Program surface for G6 Program/Obligation activation checks. */
export type Domain1ProgramSource = Pick<
  Domain1Repository,
  "loadProgram" | "isConstitutionallyCurrent"
>;

export interface Domain3Repository {
  admitToProductionReadinessReview(input: {
    rvaId: RealizedVisualArtifactId;
    admittedBy: string;
  }): Promise<ProductionReadinessReview>;

  loadProductionReadinessReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ProductionReadinessReview | null>;

  loadActiveProductionReadinessReviewByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<ProductionReadinessReview | null>;

  /**
   * Record immutable Review evidence and append dimension activity (R14â€“R20).
   * Does not produce Review Determination, Approval, or GPRA.
   */
  recordReviewDimensionActivity(input: {
    reviewId: ProductionReadinessReviewId;
    dimensionId: MandatoryReviewDimensionId;
    sourceKind: ReviewEvidenceSourceKind;
    sourceRecordId: string;
    sourceSnapshot: string;
    observation: string;
    recordedBy: string;
  }): Promise<{
    evidence: ReviewEvidenceRecord;
    activity: ReviewDimensionActivityRecord;
  }>;

  /**
   * G4 Design-Time Feasibility evaluation under design_time_feasibility (R21â€“R26).
   * Internally creates governed G3 evidence/activity; does not create Determination/GPRA.
   */
  recordDesignTimeFeasibilityEvaluation(input: {
    reviewId: ProductionReadinessReviewId;
    evaluationMethodDescription: string;
    observations: readonly {
      kind: DesignTimeFeasibilityObservationKind;
      text: string;
      relatedSourceStandardId?: string;
    }[];
    /**
     * Required R26 affirmation: DTF is performed at decision stage without
     * Manufacturing Validation or Fulfillment Execution waiving the evaluation.
     */
    affirmsDecisionStageWithoutManufacturingExecution: true;
    evaluatedBy: string;
  }): Promise<{
    evaluation: DesignTimeFeasibilityEvaluationRecord;
    evidence: ReviewEvidenceRecord;
    activity: ReviewDimensionActivityRecord;
  }>;

  listReviewEvidenceByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly ReviewEvidenceRecord[]>;

  listReviewDimensionActivitiesByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly ReviewDimensionActivityRecord[]>;

  loadReviewEvidence(evidenceId: ReviewEvidenceId): Promise<ReviewEvidenceRecord | null>;

  loadReviewDimensionActivity(
    activityId: ReviewDimensionActivityId,
  ): Promise<ReviewDimensionActivityRecord | null>;

  loadDesignTimeFeasibilityEvaluation(
    evaluationId: DesignTimeFeasibilityEvaluationId,
  ): Promise<DesignTimeFeasibilityEvaluationRecord | null>;

  listDesignTimeFeasibilityEvaluationsByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly DesignTimeFeasibilityEvaluationRecord[]>;

  /**
   * Pure completeness query over persisted G3 activity â€” not Determination/GPRA.
   * Readable while under_review or after review_determined.
   */
  evaluateMandatoryReviewActivityCompleteness(
    reviewId: ProductionReadinessReviewId,
  ): Promise<MandatoryReviewActivityCompleteness>;

  /**
   * G5 Review Determination Outcomes (R27â€“R33).
   * Completes the Review (review_determined); does not grant Approval or GPRA.
   */
  recordReviewDetermination(input: {
    reviewId: ProductionReadinessReviewId;
    outcome: ReviewDeterminationOutcome;
    conditions?: readonly string[];
    grounds: string;
    determinedBy: string;
  }): Promise<{
    determination: ReviewDeterminationRecord;
    review: ProductionReadinessReview;
  }>;

  loadReviewDetermination(
    determinationId: ReviewDeterminationId,
  ): Promise<ReviewDeterminationRecord | null>;

  loadReviewDeterminationByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ReviewDeterminationRecord | null>;

  /** R34 â€” Approval consideration eligibility (not Approval, not GPRA). */
  evaluateApprovalConsiderationEligibility(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ApprovalConsiderationEligibility>;

  /**
   * R38/R41 â€” record Approval act after Pass. Does not create GPRA.
   */
  recordApprovalAct(input: {
    reviewId: ProductionReadinessReviewId;
    authorityClassId: ApprovalAuthorityClassId;
    approvedBy: string;
  }): Promise<ApprovalActRecord>;

  /**
   * R39â€“R40 â€” withhold Approval after Pass on EGWG grounds. Preserves Pass Determination.
   */
  withholdApproval(input: {
    reviewId: ProductionReadinessReviewId;
    groundFamily: ApprovalWithholdingGroundFamily;
    grounds: string;
    withheldBy: string;
    additionalGoverningSourceId?: string | null;
  }): Promise<ApprovalWithholdingRecord>;

  /**
   * R42â€“R43 / R62 / R66 ST-1 â€” explicit GPRA grant after Approval. Binds RVA under Production Obligation.
   * Allows replacement grant when all prior scope grants are Invalidated (G8 R62, no supersession).
   * When a Retention prior exists for the same obligation, requires st1Supersession (G9 ST-1).
   */
  grantGpra(input: {
    reviewId: ProductionReadinessReviewId;
    grantedBy: string;
    st1Supersession?: {
      predecessorGpraId: GpraId;
      handoffConsumerContextId: string;
      authorityClassId: SupersessionAuthorityClassId;
      supersededBy: string;
      triggeringGoverningSourceId: string;
      constitutionalEvidence: string;
    };
  }): Promise<GpraGrantRecord>;

  /**
   * R54â€“R59 â€” separate invalidation act establishing Invalidated posture for a GPRA.
   * Allowed on Superseded historical GPRA (R70); does not remove supersession history.
   */
  invalidateGpra(input: {
    gpraId: GpraId;
    itFamily: InvalidationTriggerFamily;
    triggeringGoverningSourceId: string;
    constitutionalEvidence: string;
    authorityClassId: InvalidationAuthorityClassId;
    invalidatedBy: string;
    materialNonComplianceEstablished?: boolean;
  }): Promise<GpraInvalidationActRecord>;

  /**
   * R64â€“R71 â€” separate supersession act between existing Retention predecessor and successor GPRA.
   * ST-2 / ST-3 (and ST-1 when successor already granted).
   */
  supersedeGpra(input: {
    predecessorGpraId: GpraId;
    successorGpraId: GpraId;
    stFamily: SupersessionTriggerFamily;
    handoffConsumerContextId: string;
    authorityClassId: SupersessionAuthorityClassId;
    supersededBy: string;
    triggeringGoverningSourceId: string;
    constitutionalEvidence: string;
  }): Promise<GpraSupersessionActRecord>;

  loadApprovalAct(approvalActId: ApprovalActId): Promise<ApprovalActRecord | null>;
  loadApprovalActByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ApprovalActRecord | null>;
  loadApprovalWithholding(
    withholdingId: ApprovalWithholdingId,
  ): Promise<ApprovalWithholdingRecord | null>;
  loadApprovalWithholdingByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ApprovalWithholdingRecord | null>;
  /** Historical GPRA grant fact â€” returns invalidated and superseded grants. */
  loadGpraGrant(gpraId: GpraId): Promise<GpraGrantRecord | null>;
  loadGpraGrantByReview(reviewId: ProductionReadinessReviewId): Promise<GpraGrantRecord | null>;
  /**
   * Forward-active Retention GPRA only for RVA+obligation (null if only invalidated/superseded or none).
   */
  loadGpraGrantByRvaObligation(input: {
    rvaId: RealizedVisualArtifactId;
    obligationId: ProductionObligationId;
  }): Promise<GpraGrantRecord | null>;
  loadGpraInvalidationAct(
    invalidationActId: GpraInvalidationActId,
  ): Promise<GpraInvalidationActRecord | null>;
  loadGpraInvalidationActByGpra(gpraId: GpraId): Promise<GpraInvalidationActRecord | null>;
  loadGpraSupersessionAct(
    supersessionActId: GpraSupersessionActId,
  ): Promise<GpraSupersessionActRecord | null>;
  loadGpraSupersessionActByPredecessor(
    predecessorGpraId: GpraId,
  ): Promise<GpraSupersessionActRecord | null>;
  /**
   * R70 posture evaluation. When handoffConsumerContextId is provided, supersession only
   * applies if act.handoffConsumerContextId matches. When omitted and a supersession exists,
   * treat as superseded (fail-closed for forward force).
   */
  evaluateGpraValidity(
    gpraId: GpraId,
    handoffConsumerContextId?: string,
  ): Promise<GpraValidityAssessment>;
  /** Retention-only forward-active GPRA for RVA under Production Obligation. */
  loadForwardActiveGpraByRvaObligation(input: {
    rvaId: RealizedVisualArtifactId;
    obligationId: ProductionObligationId;
  }): Promise<GpraGrantRecord | null>;
  /**
   * R71 â€” Retention GPRA for obligation that is not invalidated and not superseded
   * for the given handoff consumer context.
   */
  loadAuthoritativeGpraByObligationContext(input: {
    obligationId: ProductionObligationId;
    handoffConsumerContextId: string;
  }): Promise<GpraGrantRecord | null>;

  /** R47â€“R49 â€” Conditional/Fail disposition eligibility; Pass+withholding is block-without-return. */
  evaluateDownstreamDispositionEligibility(
    reviewId: ProductionReadinessReviewId,
  ): Promise<DownstreamDispositionEligibility>;

  /** R46 â€” record EGDF deficiency (one per Review). */
  recordDownstreamDeficiency(input: {
    reviewId: ProductionReadinessReviewId;
    deficiencyFamily: GovernedDeficiencyFamily;
    grounds: string;
    authorityClassId: DownstreamDispositionAuthorityClassId;
    recordedBy: string;
    evidenceBasisIds?: readonly ReviewEvidenceId[];
  }): Promise<DownstreamDeficiencyRecord>;

  /** R47 â€” authorize DSRA rework (mutually exclusive with rework withholding). */
  authorizeRework(input: {
    reviewId: ProductionReadinessReviewId;
    authorityClassId: DownstreamDispositionAuthorityClassId;
    authorizedBy: string;
  }): Promise<ReworkAuthorizationRecord>;

  /** R48 â€” withhold DSRA rework authorization (mutually exclusive with rework auth). */
  withholdReworkAuthorization(input: {
    reviewId: ProductionReadinessReviewId;
    authorityClassId: DownstreamDispositionAuthorityClassId;
    grounds: string;
    withheldBy: string;
  }): Promise<ReworkAuthorizationWithholdingRecord>;

  /** R49 â€” establish TRPM return posture. */
  establishReturnPosture(input: {
    reviewId: ProductionReadinessReviewId;
    authorityClassId: DownstreamDispositionAuthorityClassId;
    establishedBy: string;
    targetObligationScope?: "same_obligation" | "successor_obligation" | null;
    returnGoverningSourceId?: string;
  }): Promise<ReturnPostureRecord>;

  /** R51 â€” authorize resubmission eligibility for a subsequent Review (one per prior Review). */
  authorizeResubmissionEligibility(input: {
    reviewId: ProductionReadinessReviewId;
    authorityClassId: DownstreamDispositionAuthorityClassId;
    authorizedBy: string;
  }): Promise<ResubmissionEligibilityRecord>;

  loadDownstreamDeficiencyRecord(
    deficiencyRecordId: DownstreamDeficiencyRecordId,
  ): Promise<DownstreamDeficiencyRecord | null>;
  loadDownstreamDeficiencyRecordByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<DownstreamDeficiencyRecord | null>;
  loadReworkAuthorization(
    reworkAuthorizationId: ReworkAuthorizationId,
  ): Promise<ReworkAuthorizationRecord | null>;
  loadReworkAuthorizationByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ReworkAuthorizationRecord | null>;
  loadReworkAuthorizationWithholding(
    withholdingId: ReworkAuthorizationWithholdingId,
  ): Promise<ReworkAuthorizationWithholdingRecord | null>;
  loadReworkAuthorizationWithholdingByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ReworkAuthorizationWithholdingRecord | null>;
  loadReturnPosture(returnPostureId: ReturnPostureId): Promise<ReturnPostureRecord | null>;
  loadReturnPostureByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ReturnPostureRecord | null>;
  loadResubmissionEligibility(
    eligibilityId: ResubmissionEligibilityId,
  ): Promise<ResubmissionEligibilityRecord | null>;
  loadResubmissionEligibilityByPriorReview(
    priorReviewId: ProductionReadinessReviewId,
  ): Promise<ResubmissionEligibilityRecord | null>;

  /**
   * R78 / R81 â€” append-only Brain advisory recording. Does not create Determination,
   * Approval, GPRA, posture, or Handoff acts. Separate from grantGpra / invalidateGpra /
   * supersedeGpra / recordDetermination (no automatic Brain hooks).
   */
  recordDomain3BrainAdvisory(input: {
    sourceAttribution: Domain3BrainSourceAttribution;
    brainRuntimeVersion: string;
    decisionStage: Domain3DecisionStage;
    outputClass: Domain3BrainOutputClass;
    programId?: ProductionProgramId;
    obligationId?: ProductionObligationId;
    rvaId?: RealizedVisualArtifactId;
    reviewId?: ProductionReadinessReviewId | null;
    evidenceIds?: readonly ReviewEvidenceId[];
    determinationId?: ReviewDeterminationId | null;
    gpraId?: GpraId | null;
    postureState?: GpraValidityPosture | null;
    advisoryContent: string;
    reevaluationRequestType?: Domain3BrainReevaluationRequestType | null;
    routesToAuthorityKind?: Domain3BrainAuthorityRouteKind | null;
    eventTime?: string;
    createdBy?: string;
    overridesConstitutionalRecord?: boolean;
    claimsConstitutionalAuthority?: boolean;
    emulatesConstitutionalAct?: boolean;
    constitutionalActKind?: string;
    handoffActId?: unknown;
    handoffAuthorized?: unknown;
    executesHandoff?: unknown;
  }): Promise<Domain3BrainAdvisoryRecord>;

  loadDomain3BrainAdvisory(
    advisoryId: Domain3BrainAdvisoryId,
  ): Promise<Domain3BrainAdvisoryRecord | null>;

  listDomain3BrainAdvisoriesByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly Domain3BrainAdvisoryRecord[]>;

  /**
   * R83â€“R95 â€” non-persisting HEIM eligibility assessment + HVEM facts + HSLM condition.
   * Does not authorize or execute Handoff (STD-015 ownership).
   */
  evaluateGovernedHandoffEligibility(input: {
    obligationId: ProductionObligationId;
    handoffConsumerContextId: string;
    consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
    brainAdvisoryIds?: readonly Domain3BrainAdvisoryId[];
    dispositionRecordIds?: readonly string[];
    preparedBy?: string;
    sourceAttribution?: unknown;
    authorityClassId?: unknown;
    handoffAuthorityClassId?: unknown;
    handoffActId?: unknown;
    handoffAuthorized?: unknown;
    executesHandoff?: unknown;
  }): Promise<GovernedHandoffEligibilityAssessment>;

  /**
   * R83â€“R95 â€” persist preparation only when assessment is export_ready.
   * Additive immutable HPAM record; not Handoff authorization/execution.
   */
  prepareGovernedHandoff(input: {
    obligationId: ProductionObligationId;
    handoffConsumerContextId: string;
    consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
    preparedBy: string;
    brainAdvisoryIds?: readonly Domain3BrainAdvisoryId[];
    dispositionRecordIds?: readonly string[];
    sourceAttribution?: unknown;
    authorityClassId?: unknown;
    handoffAuthorityClassId?: unknown;
    handoffActId?: unknown;
    handoffAuthorized?: unknown;
    executesHandoff?: unknown;
    handoffAuthorization?: unknown;
    performHandoff?: unknown;
    handoffExecuted?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
  }): Promise<GovernedHandoffPreparationRecord>;

  loadGovernedHandoffPreparation(
    preparationId: GovernedHandoffPreparationId,
  ): Promise<GovernedHandoffPreparationRecord | null>;

  /** Append-only history of preparations for a GPRA (R94). */
  listGovernedHandoffPreparationsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffPreparationRecord[]>;

  /**
   * R88 â€” compare historical preparation snapshot to current authoritative posture.
   * Stale records remain loadable but are not currently usable export_ready without re-preparation.
   */
  evaluateHandoffPreparationCurrency(
    preparationId: GovernedHandoffPreparationId,
  ): Promise<HandoffPreparationCurrency>;

  /**
   * HOF-G1 R07 â€” non-persisting entry assessment: whether GPRA + G11 exports may be
   * consumed for Handoff *consideration*. Does not authorize Handoff or declare Posture.
   */
  evaluateGovernedHandoffEntry(input: {
    preparationId: GovernedHandoffPreparationId;
    sourceAttribution?: unknown;
    authorityClassId?: unknown;
    handoffAuthorityClassId?: unknown;
    handoffActId?: unknown;
    handoffAuthorized?: unknown;
    executesHandoff?: unknown;
    handoffAuthorizationActId?: unknown;
    postureDeclarationActId?: unknown;
    hoemEvidenceId?: unknown;
  }): Promise<GovernedHandoffEntryAssessment>;

  /**
   * HOF-G1 R07 â€” persist entry ONLY when mayCommence. Additive immutable history.
   * Does not authorize Handoff, declare Posture, or perform G11 preparation.
   */
  admitGovernedHandoffEntry(input: {
    preparationId: GovernedHandoffPreparationId;
    enteredBy: string;
    sourceAttribution?: unknown;
    authorityClassId?: unknown;
    handoffAuthorityClassId?: unknown;
    handoffActId?: unknown;
    handoffAuthorized?: unknown;
    executesHandoff?: unknown;
    handoffAuthorization?: unknown;
    performHandoff?: unknown;
    handoffExecuted?: unknown;
    handoffPosture?: unknown;
    handoffAuthorizationActId?: unknown;
    postureDeclarationActId?: unknown;
    hoemEvidenceId?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    consumerCategoryKeys?: unknown;
  }): Promise<GovernedHandoffEntryRecord>;

  loadGovernedHandoffEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<GovernedHandoffEntryRecord | null>;

  listGovernedHandoffEntriesByPreparation(
    preparationId: GovernedHandoffPreparationId,
  ): Promise<readonly GovernedHandoffEntryRecord[]>;

  listGovernedHandoffEntriesByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffEntryRecord[]>;

  /**
   * Optional: historical entry currency vs current preparation posture.
   * Stale entries remain loadable (immutable history).
   */
  evaluateHandoffEntryCurrency(
    entryId: GovernedHandoffEntryId,
  ): Promise<HandoffEntryCurrency>;

  /**
   * HOF-G7 R08â€“R15 â€” non-persisting evidence/validity consumption assessment.
   * Does not authorize Handoff, declare Posture, or create HOEM act records.
   */
  evaluateGovernedHandoffEvidenceConsumption(input: {
    entryId: GovernedHandoffEntryId;
    brainAdvisoryIds?: readonly Domain3BrainAdvisoryId[];
    sourceAttribution?: unknown;
    authorityClassId?: unknown;
    handoffAuthorityClassId?: unknown;
    handoffActId?: unknown;
    handoffAuthorized?: unknown;
    executesHandoff?: unknown;
    handoffAuthorizationActId?: unknown;
    postureDeclarationActId?: unknown;
    completionActId?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    hoemEvidenceId?: unknown;
    hoemOperativeActRecords?: unknown;
    hoemActInstances?: unknown;
    preservationActId?: unknown;
    hofG10PreservationActId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    unknownEvidenceModel?: unknown;
    evidenceModels?: unknown;
  }): Promise<GovernedHandoffEvidenceConsumptionAssessment>;

  /**
   * HOF-G7 R08â€“R15 â€” persist consumption ONLY when mayConsume. Additive immutable history.
   * Does not authorize Handoff, declare Posture, or create HOEM act instances.
   */
  recordGovernedHandoffEvidenceConsumption(input: {
    entryId: GovernedHandoffEntryId;
    consumedBy: string;
    brainAdvisoryIds?: readonly Domain3BrainAdvisoryId[];
    sourceAttribution?: unknown;
    authorityClassId?: unknown;
    handoffAuthorityClassId?: unknown;
    handoffActId?: unknown;
    handoffAuthorized?: unknown;
    executesHandoff?: unknown;
    handoffAuthorization?: unknown;
    performHandoff?: unknown;
    handoffExecuted?: unknown;
    handoffPosture?: unknown;
    handoffAuthorizationActId?: unknown;
    postureDeclarationActId?: unknown;
    completionActId?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    hoemEvidenceId?: unknown;
    hoemOperativeEvidenceId?: unknown;
    hoemOperativeActRecords?: unknown;
    hoemActInstances?: unknown;
    preservationActId?: unknown;
    hofG10PreservationActId?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    unknownEvidenceModel?: unknown;
    evidenceModels?: unknown;
    consumerCategoryKeys?: unknown;
  }): Promise<GovernedHandoffEvidenceConsumptionRecord>;

  loadGovernedHandoffEvidenceConsumption(
    consumptionId: GovernedHandoffEvidenceConsumptionId,
  ): Promise<GovernedHandoffEvidenceConsumptionRecord | null>;

  listGovernedHandoffEvidenceConsumptionsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffEvidenceConsumptionRecord[]>;

  listGovernedHandoffEvidenceConsumptionsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffEvidenceConsumptionRecord[]>;

  /**
   * Optional: historical consumption currency vs current entry/prep posture.
   * Stale consumptions remain loadable (immutable history).
   */
  evaluateHandoffEvidenceConsumptionCurrency(
    consumptionId: GovernedHandoffEvidenceConsumptionId,
  ): Promise<HandoffEvidenceConsumptionCurrency>;

  /**
   * HOF-G10 R16â€“R21 â€” persist additive preservation audit linking G1 entry + G7 consumption.
   * May succeed when upstream is already stale (R19). Does NOT restore constitutional force,
   * create HOEM act instances, or authorize erasure/redaction.
   */
  recordGovernedHandoffPreservationAudit(input: {
    entryId: GovernedHandoffEntryId;
    evidenceConsumptionId: GovernedHandoffEvidenceConsumptionId;
    preservedBy: string;
    sourceAttribution?: unknown;
    authorityClassId?: unknown;
    handoffAuthorityClassId?: unknown;
    preservationAuthorityClassId?: unknown;
    handoffActId?: unknown;
    handoffAuthorized?: unknown;
    executesHandoff?: unknown;
    handoffAuthorization?: unknown;
    performHandoff?: unknown;
    handoffExecuted?: unknown;
    handoffPosture?: unknown;
    handoffAuthorizationActId?: unknown;
    postureDeclarationActId?: unknown;
    completionActId?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    hoemEvidenceId?: unknown;
    hoemOperativeEvidenceId?: unknown;
    hoemOperativeActRecords?: unknown;
    hoemActInstances?: unknown;
    eraseUpstreamHistory?: unknown;
    redactUpstreamHistory?: unknown;
    overwriteUpstreamHistory?: unknown;
    mergeUpstreamHistory?: unknown;
    substituteUpstreamHistory?: unknown;
    collapsePreparationHistory?: unknown;
    restoreConstitutionalForce?: unknown;
    restoresAuthority?: unknown;
    brainAuthorizesHandoff?: unknown;
    brainHandoffAuthorization?: unknown;
    brainAuthorizeHandoff?: unknown;
    r22BrainAuthorizeHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    consumerCategoryKeys?: unknown;
  }): Promise<GovernedHandoffPreservationAuditRecord>;

  loadGovernedHandoffPreservationAudit(
    preservationAuditId: GovernedHandoffPreservationAuditId,
  ): Promise<GovernedHandoffPreservationAuditRecord | null>;

  listGovernedHandoffPreservationAuditsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffPreservationAuditRecord[]>;

  listGovernedHandoffPreservationAuditsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffPreservationAuditRecord[]>;

  /**
   * History â‰  current authority â€” always `"historical_only"`; never restores force.
   */
  evaluateHandoffPreservationAuditAuthorityEffect(
    preservationAuditId: GovernedHandoffPreservationAuditId,
  ): Promise<HandoffPreservationAuditAuthorityEffect>;

  /**
   * Optional: linked G1/G7 currency separately; preservation remains historical_only.
   */
  evaluateHandoffPreservationAuditLinkedCurrency(
    preservationAuditId: GovernedHandoffPreservationAuditId,
  ): Promise<HandoffPreservationAuditLinkedCurrency>;

  evaluateHandoffPreservationAuditLinkedCurrency(
    preservationAuditId: GovernedHandoffPreservationAuditId,
  ): Promise<HandoffPreservationAuditLinkedCurrency>;

  /**
   * HOF-G2 R25â€“R32 â€” non-persisting authorization assessment.
   * Does not declare posture, complete, suspend, recall, withdraw, or execute Handoff.
   */
  evaluateGovernedHandoffAuthorization(input: {
    entryId: GovernedHandoffEntryId;
    evidenceConsumptionId: GovernedHandoffEvidenceConsumptionId;
    consumerClassId: HccmConsumerClassId;
    sourceAttribution?: unknown;
    authorityClassId?: unknown;
    handoffPosture?: unknown;
    postureDeclarationActId?: unknown;
    completionActId?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainAuthorizesHandoff?: unknown;
    brainAuthorizeHandoff?: unknown;
    brainHandoffAuthorization?: unknown;
    implicitAuthorization?: unknown;
    automaticInheritanceAuthorization?: unknown;
    inferredEligibilityAuthorization?: unknown;
    configurationDrivenAuthorization?: unknown;
  }): Promise<GovernedHandoffAuthorizationAssessment>;

  /**
   * HOF-G2 R25â€“R32 â€” persist operative HGA authorization act ONLY when mayAuthorize.
   * Additive immutable history; multiple authorization acts per entry allowed.
   */
  authorizeGovernedHandoff(input: {
    entryId: GovernedHandoffEntryId;
    evidenceConsumptionId: GovernedHandoffEvidenceConsumptionId;
    consumerClassId: HccmConsumerClassId;
    authorityClassId: unknown;
    authorizedBy: string;
    authorizedAt?: string;
    sourceAttribution?: unknown;
    handoffPosture?: unknown;
    postureDeclarationActId?: unknown;
    completionActId?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainAuthorizesHandoff?: unknown;
    brainAuthorizeHandoff?: unknown;
    brainHandoffAuthorization?: unknown;
    implicitAuthorization?: unknown;
    automaticInheritanceAuthorization?: unknown;
    inferredEligibilityAuthorization?: unknown;
    configurationDrivenAuthorization?: unknown;
    hoemPostureDeclarationRecordId?: unknown;
    hoemCompletionRecordId?: unknown;
    hoemSuspensionRecordId?: unknown;
    hoemRecallRecordId?: unknown;
    hoemWithdrawalRecordId?: unknown;
  }): Promise<GovernedHandoffAuthorizationActRecord>;

  loadGovernedHandoffAuthorizationAct(
    authorizationActId: GovernedHandoffAuthorizationActId,
  ): Promise<GovernedHandoffAuthorizationActRecord | null>;

  listGovernedHandoffAuthorizationActsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffAuthorizationActRecord[]>;

  listGovernedHandoffAuthorizationActsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffAuthorizationActRecord[]>;

  /**
   * Optional: authorization currency vs current entry/consumption posture.
   * Current only when both linked entry and consumption are current.
   */
  evaluateHandoffAuthorizationCurrency(
    authorizationActId: GovernedHandoffAuthorizationActId,
  ): Promise<HandoffAuthorizationCurrency>;

  /**
   * HOF-G3 R33â€“R39 â€” non-persisting consumer binding assessment.
   * Does not authorize Handoff, declare posture, accept downstream, or execute.
   */
  evaluateGovernedHandoffConsumerBinding(input: {
    entryId: GovernedHandoffEntryId;
    consumerClassId: HccmConsumerClassId;
    boundBy?: string;
    authorityClassId?: unknown;
    sourceAttribution?: unknown;
    handoffPosture?: unknown;
    postureDeclarationActId?: unknown;
    completionActId?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainAuthorizesHandoff?: unknown;
    brainAuthorizeHandoff?: unknown;
    brainBindsConsumerClass?: unknown;
    implicitAuthorization?: unknown;
    implicitBinding?: unknown;
    automaticInheritanceBinding?: unknown;
    configurationDrivenBinding?: unknown;
    downstreamAcceptanceId?: unknown;
    permanentCollectionMembershipId?: unknown;
    handoffAuthorizationActId?: unknown;
    authorizationActId?: unknown;
  }): Promise<GovernedHandoffConsumerBindingAssessment>;

  /**
   * HOF-G3 R33â€“R39 â€” persist operative HCCM consumer binding ONLY when mayBind.
   * Additive immutable history; multiple bindings per entry allowed.
   */
  bindHccmConsumerClass(input: {
    entryId: GovernedHandoffEntryId;
    consumerClassId: HccmConsumerClassId;
    boundBy: string;
    boundAt?: string;
    authorityClassId?: unknown;
    sourceAttribution?: unknown;
    handoffPosture?: unknown;
    postureDeclarationActId?: unknown;
    completionActId?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    productionExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainAuthorizesHandoff?: unknown;
    brainAuthorizeHandoff?: unknown;
    brainBindsConsumerClass?: unknown;
    implicitAuthorization?: unknown;
    implicitBinding?: unknown;
    automaticInheritanceBinding?: unknown;
    configurationDrivenBinding?: unknown;
    downstreamAcceptanceId?: unknown;
    permanentCollectionMembershipId?: unknown;
    handoffAuthorizationActId?: unknown;
    authorizationActId?: unknown;
  }): Promise<GovernedHandoffConsumerBindingRecord>;

  loadGovernedHandoffConsumerBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<GovernedHandoffConsumerBindingRecord | null>;

  listGovernedHandoffConsumerBindingsByEntry(
    entryId: GovernedHandoffEntryId,
  ): Promise<readonly GovernedHandoffConsumerBindingRecord[]>;

  listGovernedHandoffConsumerBindingsByGpra(
    gpraId: GpraId,
  ): Promise<readonly GovernedHandoffConsumerBindingRecord[]>;

  /**
   * Optional: binding currency vs current entry posture.
   * Current only when linked entry is current.
   */
  evaluateHandoffConsumerBindingCurrency(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<HandoffConsumerBindingCurrency>;

  /**
   * HOF-G4 R40â€“R47 â€” assess whether a lawful HGA posture declaration may be recorded.
   * Requires current HCCM binding + entry conditions. Does not require prior authorization act (R44).
   */
  evaluateGovernedHandoffPostureDeclaration(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    declaredPostureClass?: HandoffPostureClass | null;
    declaredBy?: string;
    authorityClassId?: unknown;
    sourceAttribution?: unknown;
    completionActId?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainDeclareHandoffPosture?: unknown;
    brainHandoffPosture?: unknown;
    implicitPosture?: unknown;
    automaticInheritancePosture?: unknown;
    inferredEligibilityPosture?: unknown;
    configurationDrivenPosture?: unknown;
    downstreamAcceptanceId?: unknown;
    permanentCollectionMembershipId?: unknown;
    unifiedCc01Cc02Posture?: unknown;
    mergedCrossCcPosture?: unknown;
  }): Promise<GovernedHandoffPostureDeclarationAssessment>;

  /**
   * HOF-G4 R40â€“R47 â€” persist operative HGA posture declaration ONLY when mayDeclare.
   * Additive immutable history; latest declaration is authoritative for the binding (R46).
   */
  declareHandoffPosture(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    authorityClassId: unknown;
    declaredBy: string;
    declaredAt?: string;
    declaredPostureClass?: unknown;
    sourceAttribution?: unknown;
    completionActId?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainDeclareHandoffPosture?: unknown;
    brainHandoffPosture?: unknown;
    implicitPosture?: unknown;
    automaticInheritancePosture?: unknown;
    inferredEligibilityPosture?: unknown;
    configurationDrivenPosture?: unknown;
    downstreamAcceptanceId?: unknown;
    permanentCollectionMembershipId?: unknown;
    unifiedCc01Cc02Posture?: unknown;
    mergedCrossCcPosture?: unknown;
  }): Promise<GovernedHandoffPostureDeclarationActRecord>;

  loadGovernedHandoffPostureDeclarationAct(
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
   * R46 â€” latest additive posture declaration for the binding is the authoritative forward chain.
   */
  getAuthoritativeHandoffPostureDeclarationForBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<GovernedHandoffPostureDeclarationActRecord | null>;

  /**
   * Optional: posture declaration currency â€” current only when entry+binding current
   * and the act is the authoritative forward declaration for its binding.
   */
  evaluateHandoffPostureDeclarationCurrency(
    postureDeclarationActId: GovernedHandoffPostureDeclarationActId,
  ): Promise<HandoffPostureDeclarationCurrency>;

  /**
   * HOF-G5 R48â€“R57 â€” evaluate baseline act-layer lifecycle for one HCCM binding.
   * Does not invent suspended/withdrawn/recalled/expired from GPRA invalidation.
   */
  evaluateHandoffActLayerLifecycle(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<HandoffActLayerLifecycleEvaluation>;

  /**
   * HOF-G5 R51/R56 â€” assess whether a lawful HGA completion act may be recorded.
   * Requires current authoritative posture; does not require prior authorization.
   */
  evaluateGovernedHandoffCompletion(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    completedBy?: string;
    authorityClassId?: unknown;
    sourceAttribution?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    expiryActId?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainCompleteHandoff?: unknown;
    brainHandoffCompletion?: unknown;
    implicitCompletion?: unknown;
    automaticInheritanceCompletion?: unknown;
    inferredEligibilityCompletion?: unknown;
    configurationDrivenCompletion?: unknown;
    downstreamAcceptanceId?: unknown;
    permanentCollectionMembershipId?: unknown;
    suspendHandoff?: unknown;
    recallHandoff?: unknown;
    withdrawHandoff?: unknown;
    expireHandoff?: unknown;
    acceptDownstream?: unknown;
    membershipAdmission?: unknown;
  }): Promise<GovernedHandoffCompletionAssessment>;

  /**
   * HOF-G5 R51/R56 â€” persist operative HGA completion ONLY when mayComplete.
   * Additive immutable history; latest completion is authoritative for the binding.
   * Does not mutate posture or authorization records.
   */
  completeGovernedHandoff(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    authorityClassId: unknown;
    completedBy: string;
    completedAt?: string;
    sourceAttribution?: unknown;
    suspensionActId?: unknown;
    recallActId?: unknown;
    withdrawalActId?: unknown;
    expiryActId?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainCompleteHandoff?: unknown;
    brainHandoffCompletion?: unknown;
    implicitCompletion?: unknown;
    automaticInheritanceCompletion?: unknown;
    inferredEligibilityCompletion?: unknown;
    configurationDrivenCompletion?: unknown;
    downstreamAcceptanceId?: unknown;
    permanentCollectionMembershipId?: unknown;
    suspendHandoff?: unknown;
    recallHandoff?: unknown;
    withdrawHandoff?: unknown;
    expireHandoff?: unknown;
    acceptDownstream?: unknown;
    membershipAdmission?: unknown;
  }): Promise<GovernedHandoffCompletionActRecord>;

  loadGovernedHandoffCompletionAct(
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

  getAuthoritativeHandoffCompletionForBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<GovernedHandoffCompletionActRecord | null>;

  evaluateHandoffCompletionCurrency(
    completionActId: GovernedHandoffCompletionActId,
  ): Promise<HandoffCompletionCurrency>;

  /**
   * HOF-G6-U2 R84â€“R97 â€” assess whether a lawful HGA suspension act may be recorded.
   * Requires current matching authorization + authoritative posture. Does not require export_ready.
   */
  evaluateGovernedHandoffSuspension(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    constitutionalBasisKind?: unknown;
    constitutionalBasisNotes?: unknown;
    suspendedBy?: string;
    authorityClassId?: unknown;
    sourceAttribution?: unknown;
    performerClass?: unknown;
    advisoryEvidenceAlone?: unknown;
    rtcCatalogAlone?: unknown;
    gpraInvalidatedAlone?: unknown;
    gpraSupersededAlone?: unknown;
    g11BlockedAlone?: unknown;
    hrwmLossAlone?: unknown;
    withdrawalActId?: unknown;
    recallActId?: unknown;
    resumeHandoff?: unknown;
    restoreHandoff?: unknown;
    reenterHandoff?: unknown;
    brainSuspendHandoff?: unknown;
  }): Promise<GovernedHandoffSuspensionAssessment>;

  /**
   * HOF-G6-U2 R84â€“R97 â€” persist operative HGA suspension ONLY when maySuspend.
   * Additive immutable history; latest suspension is authoritative for the binding.
   * Does not mutate posture, authorization, or completion records.
   */
  suspendGovernedHandoff(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    authorityClassId: unknown;
    suspendedBy: string;
    constitutionalBasisKind: unknown;
    constitutionalBasisNotes?: unknown;
    suspendedAt?: string;
    sourceAttribution?: unknown;
    performerClass?: unknown;
    advisoryEvidenceAlone?: unknown;
    rtcCatalogAlone?: unknown;
    gpraInvalidatedAlone?: unknown;
    gpraSupersededAlone?: unknown;
    g11BlockedAlone?: unknown;
    hrwmLossAlone?: unknown;
    withdrawalActId?: unknown;
    recallActId?: unknown;
    expiryActId?: unknown;
    resumeHandoff?: unknown;
    restoreHandoff?: unknown;
    reenterHandoff?: unknown;
    withdrawHandoff?: unknown;
    recallHandoff?: unknown;
    expireHandoff?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainSuspendHandoff?: unknown;
    brainHandoffSuspension?: unknown;
    implicitSuspension?: unknown;
    rejectHandoff?: unknown;
    hercmReentryId?: unknown;
    resumptionActId?: unknown;
    restorationActId?: unknown;
  }): Promise<GovernedHandoffSuspensionActRecord>;

  loadGovernedHandoffSuspensionAct(
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

  getAuthoritativeHandoffSuspensionForBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<GovernedHandoffSuspensionActRecord | null>;

  evaluateHandoffSuspensionCurrency(
    suspensionActId: GovernedHandoffSuspensionActId,
  ): Promise<HandoffSuspensionCurrency>;

  evaluateGovernedHandoffWithdrawal(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    constitutionalBasisKind?: unknown;
    constitutionalBasisNotes?: unknown;
    withdrawnBy?: string;
    authorityClassId?: unknown;
    sourceAttribution?: unknown;
    performerClass?: unknown;
    advisoryEvidenceAlone?: unknown;
    rtcCatalogAlone?: unknown;
    gpraInvalidatedAlone?: unknown;
    gpraSupersededAlone?: unknown;
    g11BlockedAlone?: unknown;
    hrwmLossAlone?: unknown;
    withdrawalActId?: unknown;
    recallActId?: unknown;
    resumeHandoff?: unknown;
    restoreHandoff?: unknown;
    reenterHandoff?: unknown;
    brainWithdrawHandoff?: unknown;
  }): Promise<GovernedHandoffWithdrawalAssessment>;

  withdrawGovernedHandoff(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    authorityClassId: unknown;
    withdrawnBy: string;
    constitutionalBasisKind: unknown;
    constitutionalBasisNotes?: unknown;
    withdrawnAt?: string;
    sourceAttribution?: unknown;
    performerClass?: unknown;
    advisoryEvidenceAlone?: unknown;
    rtcCatalogAlone?: unknown;
    gpraInvalidatedAlone?: unknown;
    gpraSupersededAlone?: unknown;
    g11BlockedAlone?: unknown;
    hrwmLossAlone?: unknown;
    recallActId?: unknown;
    expiryActId?: unknown;
    resumeHandoff?: unknown;
    restoreHandoff?: unknown;
    reenterHandoff?: unknown;
    recallHandoff?: unknown;
    expireHandoff?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainWithdrawHandoff?: unknown;
    brainHandoffWithdrawal?: unknown;
    implicitWithdrawal?: unknown;
    rejectHandoff?: unknown;
    hercmReentryId?: unknown;
    resumptionActId?: unknown;
    restorationActId?: unknown;
  }): Promise<GovernedHandoffWithdrawalActRecord>;

  loadGovernedHandoffWithdrawalAct(
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
  getAuthoritativeHandoffWithdrawalForBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<GovernedHandoffWithdrawalActRecord | null>;
  evaluateHandoffWithdrawalCurrency(
    withdrawalActId: GovernedHandoffWithdrawalActId,
  ): Promise<HandoffWithdrawalCurrency>;

  evaluateGovernedHandoffRecall(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    satisfiedHrtcmTriggers?: unknown;
    hrtcmTriggerEvidenceNotes?: unknown;
    hrwmEligibilityLossSatisfied?: unknown;
    postureChainGovernanceCessationSatisfied?: unknown;
    authorityClassId?: unknown;
    performerClass?: unknown;
    recalledBy?: string;
    sourceAttribution?: unknown;
    advisoryEvidenceAlone?: unknown;
    implementationInferenceAlone?: unknown;
    downstreamOperationalEventAlone?: unknown;
    rtcCatalogAlone?: unknown;
    hrtcmRtcAlone?: unknown;
    gpraInvalidatedAlone?: unknown;
    gpraSupersededAlone?: unknown;
    g11BlockedAlone?: unknown;
    hrwmLossAlone?: unknown;
    withdrawalActId?: unknown;
    recallActId?: unknown;
    resumeHandoff?: unknown;
    restoreHandoff?: unknown;
    reenterHandoff?: unknown;
    brainRecallHandoff?: unknown;
  }): Promise<GovernedHandoffRecallAssessment>;

  recallGovernedHandoff(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    authorityClassId: unknown;
    recalledBy: string;
    satisfiedHrtcmTriggers?: unknown;
    hrtcmTriggerEvidenceNotes?: unknown;
    hrwmEligibilityLossSatisfied?: unknown;
    postureChainGovernanceCessationSatisfied?: unknown;
    recalledAt?: string;
    sourceAttribution?: unknown;
    performerClass?: unknown;
    advisoryEvidenceAlone?: unknown;
    rtcCatalogAlone?: unknown;
    hrtcmRtcAlone?: unknown;
    gpraInvalidatedAlone?: unknown;
    gpraSupersededAlone?: unknown;
    g11BlockedAlone?: unknown;
    hrwmLossAlone?: unknown;
    withdrawalActId?: unknown;
    expiryActId?: unknown;
    resumeHandoff?: unknown;
    restoreHandoff?: unknown;
    reenterHandoff?: unknown;
    withdrawHandoff?: unknown;
    expireHandoff?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillmentExecutionId?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    brainRecallHandoff?: unknown;
    brainHandoffRecall?: unknown;
    implicitRecall?: unknown;
    rejectHandoff?: unknown;
    hercmReentryId?: unknown;
    resumptionActId?: unknown;
    restorationActId?: unknown;
  }): Promise<GovernedHandoffRecallActRecord>;

  loadGovernedHandoffRecallAct(
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
  getAuthoritativeHandoffRecallForBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<GovernedHandoffRecallActRecord | null>;
  evaluateHandoffRecallCurrency(
    recallActId: GovernedHandoffRecallActId,
  ): Promise<HandoffRecallCurrency>;

  /**
   * HOF-G8 R58â€“R65 â€” assess whether a lawful downstream exit-boundary attribution may be recorded.
   * Requires current completion + posture + binding; does not require prior authorization.
   * Does NOT implement exit-completeness.
   */
  assessGovernedHandoffDownstreamExitBoundary(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    downstreamConsiderationDomain?: string;
    attributedBy?: string;
    authorityClassId?: unknown;
    sourceAttribution?: unknown;
    acceptDownstream?: unknown;
    membershipAdmission?: unknown;
    manufacturingExecution?: unknown;
    fulfillment?: unknown;
    publication?: unknown;
    distribution?: unknown;
    exitCompleteness?: unknown;
    suspendHandoff?: unknown;
    recallHandoff?: unknown;
    withdrawHandoff?: unknown;
    rejectHandoff?: unknown;
    brainExit?: unknown;
    implicitExit?: unknown;
  }): Promise<GovernedHandoffDownstreamExitBoundaryAssessment>;

  /**
   * HOF-G8 R58â€“R65 â€” persist exit-boundary attribution ONLY when mayAttribute.
   * Additive immutable history; latest tip is authoritative for the binding.
   * Does not mutate auth/binding/posture/completion/GPRA.
   */
  attributeGovernedHandoffDownstreamExitBoundary(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    authorityClassId: unknown;
    attributedBy: string;
    attributedAt?: string;
    downstreamConsiderationDomain?: string;
    authorizationActId?: GovernedHandoffAuthorizationActId | null;
    sourceAttribution?: unknown;
    acceptDownstream?: unknown;
    downstreamAcceptanceId?: unknown;
    membershipAdmission?: unknown;
    permanentCollectionMembershipId?: unknown;
    manufacturingExecution?: unknown;
    manufacturingExecutionId?: unknown;
    fulfillment?: unknown;
    fulfillmentExecutionId?: unknown;
    publication?: unknown;
    distribution?: unknown;
    exitCompleteness?: unknown;
    exitCompletenessSatisfactionId?: unknown;
    satisfyExitCompleteness?: unknown;
    suspendHandoff?: unknown;
    suspensionActId?: unknown;
    recallHandoff?: unknown;
    recallActId?: unknown;
    withdrawHandoff?: unknown;
    withdrawalActId?: unknown;
    rejectHandoff?: unknown;
    rejectHandoffActLayer?: unknown;
    brainExit?: unknown;
    implicitExit?: unknown;
    automaticInheritanceExit?: unknown;
    inferredEligibilityExit?: unknown;
    configurationDrivenExit?: unknown;
    acceptanceSignalExit?: unknown;
    executesHandoff?: unknown;
    handoffExecuted?: unknown;
    performHandoff?: unknown;
    executionQueueId?: unknown;
    constitutionalQueueId?: unknown;
    intakeCompletionId?: unknown;
  }): Promise<GovernedHandoffDownstreamExitBoundaryAttributionRecord>;

  /**
   * HOF-G8 R60/R65 â€” Completed enables consideration; linkage establishes attributed exit.
   */
  evaluateDownstreamExitConsideration(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<HandoffDownstreamExitConsiderationEvaluation>;

  /** Alias for evaluateDownstreamExitConsideration (R60/R65). */
  evaluateHandoffDownstreamExitBoundary(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<HandoffDownstreamExitConsiderationEvaluation>;

  loadGovernedHandoffDownstreamExitBoundaryAttribution(
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

  getAuthoritativeHandoffDownstreamExitBoundaryForBinding(
    bindingId: GovernedHandoffConsumerBindingId,
  ): Promise<GovernedHandoffDownstreamExitBoundaryAttributionRecord | null>;

  evaluateHandoffDownstreamExitBoundaryCurrency(
    exitBoundaryAttributionId: GovernedHandoffDownstreamExitBoundaryAttributionId,
  ): Promise<HandoffDownstreamExitBoundaryCurrency>;

  /**
   * HOF-G9 R22â€“R24 â€” standing authority-boundary assessment (framework only).
   * Does not authorize Handoff or create operative HGA acts (R25+ deferred).
   */
  evaluateHandoffAuthorityBoundary(): Promise<HandoffAuthorityBoundaryAssessment>;

  /**
   * HOF-G9 R66â€“R69 â€” frozen handoff authority catalog integrity assessment (read-only).
   * Catalog membership does not authorize, bind, declare, complete, or exit.
   */
  assessHandoffAuthorityCatalogIntegration(): Promise<HandoffAuthorityCatalogIntegrationAssessment>;

  /**
   * HOF-G6-U1 R70â€“R83 â€” shared lifecycle foundation integrity assessment.
   * Suspension minting is HOF-G6-U2; withdrawal/recall remain U3/U4 deferred.
   */
  assessHofG6U1SharedLifecycleFoundation(): Promise<HofG6U1SharedLifecycleFoundationAssessment>;
}

export function createDomain3Repository(
  domain2: Domain2ReviewEntrySource,
  manufacturingAuthority: ManufacturingAuthoritySource = createFrozenManufacturingAuthoritySource(),
  domain1?: Domain1ProgramSource,
): Domain3Repository {
  return createDomain3RepositoryWithStorage(
    domain2,
    createInMemoryDomain3Storage(),
    manufacturingAuthority,
    domain1,
  );
}

export function createDomain3RepositoryWithStorage(
  domain2: Domain2ReviewEntrySource,
  storage: Domain3StoragePort,
  manufacturingAuthority: ManufacturingAuthoritySource = createFrozenManufacturingAuthoritySource(),
  domain1?: Domain1ProgramSource,
): Domain3Repository {
  async function persistReview(
    review: ProductionReadinessReview,
  ): Promise<ProductionReadinessReview> {
    validatePersistedProductionReadinessReview(review);
    const existingActive = await storage.getActiveProductionReadinessReviewByRva(review.rvaId);
    if (existingActive && existingActive.reviewId !== review.reviewId) {
      throw new OrchestraConstitutionalError(
        "Active Production-readiness Review already exists for this RVA",
        "invalid_review_entry_eligibility",
        ["FI-DSN-STD-014-R08"],
      );
    }
    await storage.putProductionReadinessReview(review);
    const loaded = await storage.getProductionReadinessReview(review.reviewId);
    if (!loaded) {
      throw new OrchestraConstitutionalError(
        "Failed to persist Production-readiness Review",
        "invalid_domain3_persistence_state",
        ["FI-DSN-STD-014-R08"],
      );
    }
    return rehydrateProductionReadinessReview(loaded);
  }

  async function requireExistingReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ProductionReadinessReview> {
    const raw = await storage.getProductionReadinessReview(reviewId);
    if (!raw) {
      throw new OrchestraConstitutionalError(
        "Production-readiness Review not found",
        "invalid_review_activity",
        ["FI-DSN-STD-014-R14"],
      );
    }
    return rehydrateProductionReadinessReview(raw);
  }

  /**
   * Load persisted Review, Determination, evidence, and activity for G6 rehydration.
   * Rejects missing or contradictory Reviewâ†”Determination linkage before trust.
   */
  async function loadG6AuthorityRehydrationContext(reviewId: ProductionReadinessReviewId): Promise<{
    review: ProductionReadinessReview;
    determination: ReviewDeterminationRecord;
    evidenceRecords: readonly ReviewEvidenceRecord[];
    activityRecords: readonly ReviewDimensionActivityRecord[];
  }> {
    const reviewRaw = await storage.getProductionReadinessReview(reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "G6 authority requires persisted Production-readiness Review",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    if (review.posture !== "review_determined" || !review.determinationId) {
      throw new OrchestraConstitutionalError(
        "G6 authority requires completed Review with Determination linkage",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }

    const byId = await storage.getReviewDetermination(review.determinationId);
    const byReview = await storage.getReviewDeterminationByReview(review.reviewId);
    if (!byId) {
      throw new OrchestraConstitutionalError(
        "review.determinationId points to no persisted Determination",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }
    if (!byReview || byReview.determinationId !== byId.determinationId) {
      throw new OrchestraConstitutionalError(
        "Contradictory Review Determination linkage blocks G6 authority rehydration",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }

    const determination = rehydrateReviewDetermination(byId);
    const evidenceRecords = await storage.listReviewEvidenceByReview(review.reviewId);
    const activityRecords = await storage.listReviewDimensionActivitiesByReview(review.reviewId);
    return { review, determination, evidenceRecords, activityRecords };
  }

  async function rehydrateTrustedApprovalAct(raw: ApprovalActRecord): Promise<ApprovalActRecord> {
    const context = await loadG6AuthorityRehydrationContext(raw.reviewId);
    return rehydrateApprovalAct(raw, context);
  }

  async function rehydrateTrustedApprovalWithholding(
    raw: ApprovalWithholdingRecord,
  ): Promise<ApprovalWithholdingRecord> {
    const context = await loadG6AuthorityRehydrationContext(raw.reviewId);
    return rehydrateApprovalWithholding(raw, context);
  }

  async function rehydrateTrustedGpraGrant(raw: GpraGrantRecord): Promise<GpraGrantRecord> {
    const context = await loadG6AuthorityRehydrationContext(raw.reviewId);
    const approvalRaw = await storage.getApprovalAct(raw.approvalActId);
    if (!approvalRaw) {
      throw new OrchestraConstitutionalError(
        "GPRA requires a persisted Approval act; missing Approval cannot support GPRA rehydration",
        "invalid_gpra_grant",
        ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R42"],
      );
    }
    // Structural Approval validation only here â€” joint Approvalâ†”Review coherence runs inside rehydrateGpraGrant.
    return rehydrateGpraGrant(raw, { ...context, approval: approvalRaw });
  }

  async function rehydrateTrustedGpraInvalidationAct(
    raw: GpraInvalidationActRecord,
  ): Promise<GpraInvalidationActRecord> {
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    if (!gpraRaw) {
      throw new OrchestraConstitutionalError(
        "GPRA invalidation requires a persisted GPRA grant",
        "invalid_gpra_invalidation",
        ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
      );
    }
    const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
    const context = await loadG6AuthorityRehydrationContext(gpra.reviewId);
    const approvalRaw = await storage.getApprovalAct(gpra.approvalActId);
    if (!approvalRaw) {
      throw new OrchestraConstitutionalError(
        "GPRA invalidation requires persisted Approval in GPRA grant lineage",
        "invalid_gpra_invalidation",
        ["FI-DSN-STD-014-R59"],
      );
    }
    return rehydrateGpraInvalidationAct(raw, {
      ...context,
      gpra,
      approval: approvalRaw,
    });
  }

  async function rehydrateTrustedGpraSupersessionAct(
    raw: GpraSupersessionActRecord,
    options?: { treatAsAlreadyPersisted?: boolean },
  ): Promise<GpraSupersessionActRecord> {
    const predecessorRaw = await storage.getGpraGrant(raw.predecessorGpraId);
    const successorRaw = await storage.getGpraGrant(raw.successorGpraId);
    if (!predecessorRaw || !successorRaw) {
      throw new OrchestraConstitutionalError(
        "GPRA supersession requires persisted predecessor and successor GPRA grants",
        "invalid_gpra_supersession",
        ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
      );
    }
    const predecessorGpra = await rehydrateTrustedGpraGrant(predecessorRaw);
    const successorGpra = await rehydrateTrustedGpraGrant(successorRaw);
    const predecessorContext = await loadG6AuthorityRehydrationContext(predecessorGpra.reviewId);
    const successorContext = await loadG6AuthorityRehydrationContext(successorGpra.reviewId);
    const predecessorApprovalRaw = await storage.getApprovalAct(predecessorGpra.approvalActId);
    const successorApprovalRaw = await storage.getApprovalAct(successorGpra.approvalActId);
    if (!predecessorApprovalRaw || !successorApprovalRaw) {
      throw new OrchestraConstitutionalError(
        "GPRA supersession requires persisted Approvals in predecessor and successor grant lineages",
        "invalid_gpra_supersession",
        ["FI-DSN-STD-014-R69"],
      );
    }

    const existingByPredecessor = await storage.getGpraSupersessionActByPredecessor(
      raw.predecessorGpraId,
    );
    const predecessorHasInvalidation = !!(await storage.getGpraInvalidationActByGpra(
      raw.predecessorGpraId,
    ));
    // When rehydrating an already-persisted act, Invalidated-after-Superseded (R70) and the
    // map entry for this predecessor are expected and must not fail coherence.
    const predecessorInvalidated = options?.treatAsAlreadyPersisted
      ? false
      : predecessorHasInvalidation;
    const predecessorAlreadySupersededInContext = options?.treatAsAlreadyPersisted
      ? false
      : !!(
          existingByPredecessor &&
          existingByPredecessor.supersessionActId !== raw.supersessionActId
        );

    const predecessorRva = await domain2.loadRva(predecessorGpra.rvaId);
    const successorRva = await domain2.loadRva(successorGpra.rvaId);

    return rehydrateGpraSupersessionAct(raw, {
      predecessorGpra,
      successorGpra,
      predecessorApproval: predecessorApprovalRaw,
      successorApproval: successorApprovalRaw,
      predecessorReview: predecessorContext.review,
      successorReview: successorContext.review,
      predecessorDetermination: predecessorContext.determination,
      successorDetermination: successorContext.determination,
      predecessorEvidenceRecords: predecessorContext.evidenceRecords,
      predecessorActivityRecords: predecessorContext.activityRecords,
      successorEvidenceRecords: successorContext.evidenceRecords,
      successorActivityRecords: successorContext.activityRecords,
      predecessorInvalidated,
      predecessorAlreadySupersededInContext,
      predecessorRva,
      successorRva,
    });
  }

  async function isRetentionForwardActive(gpraId: GpraId): Promise<boolean> {
    const invalidation = await storage.getGpraInvalidationActByGpra(gpraId);
    if (invalidation) return false;
    const supersession = await storage.getGpraSupersessionActByPredecessor(gpraId);
    if (supersession) return false;
    return true;
  }

  async function evaluateGpraValidityForContext(
    gpraId: GpraId,
    handoffConsumerContextId: string,
  ): Promise<GpraValidityAssessment> {
    const gpraRaw = await storage.getGpraGrant(gpraId);
    if (!gpraRaw) {
      throw new OrchestraConstitutionalError(
        "GPRA grant not found for validity assessment",
        "invalid_gpra_invalidation",
        ["FI-DSN-STD-014-R52", "FI-DSN-STD-014-R54"],
      );
    }
    await rehydrateTrustedGpraGrant(gpraRaw);
    const invalidationRaw = await storage.getGpraInvalidationActByGpra(gpraId);
    const invalidation = invalidationRaw
      ? await rehydrateTrustedGpraInvalidationAct(invalidationRaw)
      : null;
    const supersessionRaw = await storage.getGpraSupersessionActByPredecessor(gpraId);
    let supersession: GpraSupersessionActRecord | null = null;
    if (supersessionRaw) {
      const rehydrated = await rehydrateTrustedGpraSupersessionAct(supersessionRaw, {
        treatAsAlreadyPersisted: true,
      });
      if (rehydrated.handoffConsumerContextId === handoffConsumerContextId.trim()) {
        supersession = rehydrated;
      }
    }
    return evaluateGpraValidityFromPostureActs({
      gpraId,
      invalidation,
      supersession,
    });
  }

  async function findForwardActiveGpraByRvaObligation(
    rvaId: RealizedVisualArtifactId,
    obligationId: ProductionObligationId,
  ): Promise<GpraGrantRecord | null> {
    const listed = await storage.listGpraGrantsByRvaObligation(rvaId, obligationId);
    const retention: GpraGrantRecord[] = [];
    for (const grant of listed) {
      if (await isRetentionForwardActive(grant.gpraId)) {
        retention.push(grant);
      }
    }
    if (retention.length === 0) return null;
    const sorted = [...retention].sort((a, b) => a.grantedAt.localeCompare(b.grantedAt));
    const latest = sorted[sorted.length - 1];
    if (!latest) return null;
    return rehydrateTrustedGpraGrant(latest);
  }

  async function findAuthoritativeGpraByObligationContext(
    obligationId: ProductionObligationId,
    handoffConsumerContextId: string,
  ): Promise<GpraGrantRecord | null> {
    const contextId = handoffConsumerContextId.trim();
    if (!contextId) {
      throw new OrchestraConstitutionalError(
        "Authoritative GPRA lookup requires non-empty handoffConsumerContextId",
        "invalid_gpra_supersession",
        ["FI-DSN-STD-014-R69", "FI-DSN-STD-014-R71"],
      );
    }
    const listed = await storage.listGpraGrantsByObligation(obligationId);
    const authoritative: GpraGrantRecord[] = [];
    for (const grant of listed) {
      const invalidation = await storage.getGpraInvalidationActByGpra(grant.gpraId);
      if (invalidation) continue;
      const supersession = await storage.getGpraSupersessionActByPredecessor(grant.gpraId);
      if (supersession && supersession.handoffConsumerContextId === contextId) continue;
      // Fail-closed: any supersession of this predecessor terminates forward authority
      // for unspecified contexts when evaluating authority under a specific context â€”
      // only skip when the act's context matches the queried context (R71).
      if (supersession && supersession.handoffConsumerContextId !== contextId) {
        // Predecessor superseded in a different context may still be Retention for this context.
        authoritative.push(grant);
        continue;
      }
      if (!supersession) {
        authoritative.push(grant);
      }
    }
    if (authoritative.length === 0) return null;
    const sorted = [...authoritative].sort((a, b) => a.grantedAt.localeCompare(b.grantedAt));
    const latest = sorted[sorted.length - 1];
    if (!latest) return null;
    return rehydrateTrustedGpraGrant(latest);
  }

  async function persistSupersessionAct(
    act: GpraSupersessionActRecord,
  ): Promise<GpraSupersessionActRecord> {
    validatePersistedGpraSupersessionAct(act);
    try {
      await storage.putGpraSupersessionAct(act);
    } catch (error) {
      throw new OrchestraConstitutionalError(
        error instanceof Error ? error.message : "Failed to persist GPRA supersession act",
        "invalid_gpra_supersession",
        ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
      );
    }
    const loaded = await storage.getGpraSupersessionAct(act.supersessionActId);
    if (!loaded) {
      throw new OrchestraConstitutionalError(
        "Failed to persist GPRA supersession act",
        "invalid_domain3_persistence_state",
        ["FI-DSN-STD-014-R65"],
      );
    }
    return rehydrateTrustedGpraSupersessionAct(loaded, { treatAsAlreadyPersisted: true });
  }

  async function loadG7DispositionRehydrationContext(reviewId: ProductionReadinessReviewId): Promise<{
    review: ProductionReadinessReview;
    determination: ReviewDeterminationRecord;
  }> {
    const reviewRaw = await storage.getProductionReadinessReview(reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "G7 disposition requires persisted Production-readiness Review",
        "invalid_downstream_disposition",
        ["FI-DSN-STD-014-R44"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    if (review.posture !== "review_determined" || !review.determinationId) {
      throw new OrchestraConstitutionalError(
        "G7 disposition requires completed Review with Determination linkage",
        "invalid_downstream_disposition",
        ["FI-DSN-STD-014-R47", "FI-DSN-STD-014-R49"],
      );
    }
    const byId = await storage.getReviewDetermination(review.determinationId);
    const byReview = await storage.getReviewDeterminationByReview(review.reviewId);
    if (!byId) {
      throw new OrchestraConstitutionalError(
        "review.determinationId points to no persisted Determination",
        "invalid_downstream_disposition",
        ["FI-DSN-STD-014-R44"],
      );
    }
    if (!byReview || byReview.determinationId !== byId.determinationId) {
      throw new OrchestraConstitutionalError(
        "Contradictory Review Determination linkage blocks G7 disposition rehydration",
        "invalid_downstream_disposition",
        ["FI-DSN-STD-014-R44"],
      );
    }
    return {
      review,
      determination: rehydrateReviewDetermination(byId),
    };
  }

  async function rehydrateTrustedDownstreamDeficiency(
    raw: DownstreamDeficiencyRecord,
  ): Promise<DownstreamDeficiencyRecord> {
    const context = await loadG7DispositionRehydrationContext(raw.reviewId);
    return rehydrateDownstreamDeficiencyRecord(raw, context);
  }

  async function rehydrateTrustedReworkAuthorization(
    raw: ReworkAuthorizationRecord,
  ): Promise<ReworkAuthorizationRecord> {
    const context = await loadG7DispositionRehydrationContext(raw.reviewId);
    return rehydrateReworkAuthorization(raw, context);
  }

  async function rehydrateTrustedReworkAuthorizationWithholding(
    raw: ReworkAuthorizationWithholdingRecord,
  ): Promise<ReworkAuthorizationWithholdingRecord> {
    const context = await loadG7DispositionRehydrationContext(raw.reviewId);
    return rehydrateReworkAuthorizationWithholding(raw, context);
  }

  async function rehydrateTrustedReturnPosture(
    raw: ReturnPostureRecord,
  ): Promise<ReturnPostureRecord> {
    if (
      raw.route === "withholding_return_only" ||
      raw.returnKind === "return_authorized_after_approval_withholding"
    ) {
      assertPersistedRouteCReturnNotAuthorized();
    }
    const context = await loadG7DispositionRehydrationContext(raw.reviewId);
    return rehydrateReturnPosture(raw, { ...context, approvalWithholding: null });
  }

  async function rehydrateTrustedResubmissionEligibility(
    raw: ResubmissionEligibilityRecord,
  ): Promise<ResubmissionEligibilityRecord> {
    const context = await loadG7DispositionRehydrationContext(raw.priorReviewId);
    return rehydrateResubmissionEligibility(raw, context);
  }

  async function rehydrateTrustedBrainAdvisory(
    raw: Domain3BrainAdvisoryRecord,
  ): Promise<Domain3BrainAdvisoryRecord> {
    let review: ProductionReadinessReview | null = null;
    let determination: ReviewDeterminationRecord | null = null;
    let gpra: GpraGrantRecord | null = null;

    if (raw.reviewId) {
      const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
      if (!reviewRaw) {
        throw new OrchestraConstitutionalError(
          "Brain advisory reviewId points to no persisted Review",
          "invalid_domain3_brain_advisory",
          ["FI-DSN-STD-014-R78"],
        );
      }
      review = rehydrateProductionReadinessReview(reviewRaw);
      if (raw.determinationId) {
        const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
        if (!determinationRaw) {
          throw new OrchestraConstitutionalError(
            "Brain advisory determinationId points to no persisted Determination",
            "invalid_domain3_brain_advisory",
            ["FI-DSN-STD-014-R78"],
          );
        }
        determination = rehydrateReviewDetermination(determinationRaw);
      }
      if (raw.gpraId) {
        const gpraRaw = await storage.getGpraGrant(raw.gpraId);
        if (!gpraRaw) {
          throw new OrchestraConstitutionalError(
            "Brain advisory gpraId points to no persisted GPRA",
            "invalid_domain3_brain_advisory",
            ["FI-DSN-STD-014-R78"],
          );
        }
        gpra = await rehydrateTrustedGpraGrant(gpraRaw);
      }
    }

    return rehydrateDomain3BrainAdvisory(raw, { review, determination, gpra });
  }

  async function rehydrateTrustedHandoffPreparation(
    raw: GovernedHandoffPreparationRecord,
  ): Promise<GovernedHandoffPreparationRecord> {
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    if (!gpraRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff preparation gpraId points to no persisted GPRA",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R87", "FI-DSN-STD-014-R88"],
      );
    }
    const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff preparation reviewId points to no persisted Review",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R87"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    if (!determinationRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff preparation determinationId points to no persisted Determination",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R87"],
      );
    }
    const determination = rehydrateReviewDetermination(determinationRaw);
    return rehydrateGovernedHandoffPreparation(raw, { gpra, review, determination });
  }

  async function rehydrateTrustedHandoffEntry(
    raw: GovernedHandoffEntryRecord,
  ): Promise<GovernedHandoffEntryRecord> {
    const prepRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    if (!prepRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff entry preparationId points to no persisted preparation",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R07"],
      );
    }
    const preparation = await rehydrateTrustedHandoffPreparation(prepRaw);
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    if (!gpraRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff entry gpraId points to no persisted GPRA",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R07"],
      );
    }
    const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff entry reviewId points to no persisted Review",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R07"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    if (!determinationRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff entry determinationId points to no persisted Determination",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R07"],
      );
    }
    const determination = rehydrateReviewDetermination(determinationRaw);
    return rehydrateGovernedHandoffEntry(raw, {
      preparation,
      gpra,
      review,
      determination,
    });
  }

  async function assessHandoffEntryInternal(
    preparationId: GovernedHandoffPreparationId,
  ): Promise<{
    assessment: GovernedHandoffEntryAssessment;
    preparation: GovernedHandoffPreparationRecord | null;
  }> {
    const prepRaw = await storage.getGovernedHandoffPreparation(preparationId);
    if (!prepRaw) {
      return {
        preparation: null,
        assessment: assessGovernedHandoffEntry({
          preparation: null,
          preparationCurrency: null,
          authoritativeGpraId: null,
          lineageMatchesAuthoritativeGpra: false,
        }),
      };
    }
    const preparation = await rehydrateTrustedHandoffPreparation(prepRaw);
    let preparationCurrency: HandoffPreparationCurrency;
    try {
      preparationCurrency = await evaluateHandoffPreparationCurrencyInternal(preparation);
    } catch {
      preparationCurrency = "stale";
    }
    const authoritative = await findAuthoritativeGpraByObligationContext(
      preparation.obligationId,
      preparation.handoffConsumerContextId,
    );
    const lineageMatchesAuthoritativeGpra = authoritative
      ? handoffEntryLineageMatchesGpra(preparation, authoritative)
      : false;
    return {
      preparation,
      assessment: assessGovernedHandoffEntry({
        preparation,
        preparationCurrency,
        authoritativeGpraId: authoritative?.gpraId ?? null,
        lineageMatchesAuthoritativeGpra,
      }),
    };
  }

  async function rehydrateTrustedHandoffEvidenceConsumption(
    raw: GovernedHandoffEvidenceConsumptionRecord,
  ): Promise<GovernedHandoffEvidenceConsumptionRecord> {
    const entryRaw = await storage.getGovernedHandoffEntry(raw.entryId);
    if (!entryRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff evidence consumption entryId points to no persisted entry",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R14"],
      );
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const prepRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    if (!prepRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff evidence consumption preparationId points to no persisted preparation",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R09", "FI-DSN-STD-015-R14"],
      );
    }
    const preparation = await rehydrateTrustedHandoffPreparation(prepRaw);
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    if (!gpraRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff evidence consumption gpraId points to no persisted GPRA",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R14"],
      );
    }
    const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff evidence consumption reviewId points to no persisted Review",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R14"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    if (!determinationRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff evidence consumption determinationId points to no persisted Determination",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R14"],
      );
    }
    const determination = rehydrateReviewDetermination(determinationRaw);
    return rehydrateGovernedHandoffEvidenceConsumption(raw, {
      entry,
      preparation,
      gpra,
      review,
      determination,
    });
  }

  async function rehydrateTrustedHandoffPreservationAudit(
    raw: GovernedHandoffPreservationAuditRecord,
  ): Promise<GovernedHandoffPreservationAuditRecord> {
    const entryRaw = await storage.getGovernedHandoffEntry(raw.entryId);
    if (!entryRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff preservation audit entryId points to no persisted entry",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R19"],
      );
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const consumptionRaw = await storage.getGovernedHandoffEvidenceConsumption(
      raw.evidenceConsumptionId,
    );
    if (!consumptionRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff preservation audit evidenceConsumptionId points to no persisted consumption",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
      );
    }
    const consumption = await rehydrateTrustedHandoffEvidenceConsumption(consumptionRaw);
    const prepRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    const preparation = prepRaw ? await rehydrateTrustedHandoffPreparation(prepRaw) : null;
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    const gpra = gpraRaw ? await rehydrateTrustedGpraGrant(gpraRaw) : null;
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    const review = reviewRaw ? rehydrateProductionReadinessReview(reviewRaw) : null;
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    const determination = determinationRaw
      ? rehydrateReviewDetermination(determinationRaw)
      : null;
    return rehydrateGovernedHandoffPreservationAudit(raw, {
      entry,
      consumption,
      preparation,
      gpra,
      review,
      determination,
    });
  }

  async function rehydrateTrustedHandoffAuthorization(
    raw: GovernedHandoffAuthorizationActRecord,
  ): Promise<GovernedHandoffAuthorizationActRecord> {
    const entryRaw = await storage.getGovernedHandoffEntry(raw.entryId);
    if (!entryRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff authorization act entryId points to no persisted entry",
        "invalid_handoff_authorization",
        ["FI-DSN-STD-015-R31"],
      );
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const consumptionRaw = await storage.getGovernedHandoffEvidenceConsumption(
      raw.evidenceConsumptionId,
    );
    if (!consumptionRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff authorization act evidenceConsumptionId points to no persisted consumption",
        "invalid_handoff_authorization",
        ["FI-DSN-STD-015-R31"],
      );
    }
    const consumption = await rehydrateTrustedHandoffEvidenceConsumption(consumptionRaw);
    const prepRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    const preparation = prepRaw ? await rehydrateTrustedHandoffPreparation(prepRaw) : null;
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    const gpra = gpraRaw ? await rehydrateTrustedGpraGrant(gpraRaw) : null;
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    const review = reviewRaw ? rehydrateProductionReadinessReview(reviewRaw) : null;
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    const determination = determinationRaw
      ? rehydrateReviewDetermination(determinationRaw)
      : null;
    return rehydrateGovernedHandoffAuthorization(raw, {
      entry,
      consumption,
      preparation,
      gpra,
      review,
      determination,
    });
  }

  async function assessHandoffAuthorizationInternal(input: {
    entryId: GovernedHandoffEntryId;
    evidenceConsumptionId: GovernedHandoffEvidenceConsumptionId;
    consumerClassId: HccmConsumerClassId;
  }): Promise<{
    assessment: GovernedHandoffAuthorizationAssessment;
    entry: GovernedHandoffEntryRecord | null;
    consumption: GovernedHandoffEvidenceConsumptionRecord | null;
    preparation: GovernedHandoffPreparationRecord | null;
  }> {
    const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
    if (!entryRaw) {
      return {
        entry: null,
        consumption: null,
        preparation: null,
        assessment: assessGovernedHandoffAuthorization({
          entry: null,
          entryCurrency: null,
          consumption: null,
          consumptionCurrency: null,
          preparation: null,
          preparationCurrency: null,
          gpraValidityPosture: null,
          eligibilityLayerCondition: null,
          consumerClassId: input.consumerClassId,
          lineageMatchesAuthoritativeGpra: false,
        }),
      };
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);

    const consumptionRaw = await storage.getGovernedHandoffEvidenceConsumption(
      input.evidenceConsumptionId,
    );
    if (!consumptionRaw) {
      return {
        entry,
        consumption: null,
        preparation: null,
        assessment: assessGovernedHandoffAuthorization({
          entry,
          entryCurrency: null,
          consumption: null,
          consumptionCurrency: null,
          preparation: null,
          preparationCurrency: null,
          gpraValidityPosture: null,
          eligibilityLayerCondition: null,
          consumerClassId: input.consumerClassId,
          lineageMatchesAuthoritativeGpra: false,
        }),
      };
    }
    const consumption = await rehydrateTrustedHandoffEvidenceConsumption(consumptionRaw);

    const prepRaw = await storage.getGovernedHandoffPreparation(entry.preparationId);
    const preparation = prepRaw
      ? await rehydrateTrustedHandoffPreparation(prepRaw)
      : null;

    let preparationCurrency: HandoffPreparationCurrency | null = null;
    if (preparation) {
      try {
        preparationCurrency = await evaluateHandoffPreparationCurrencyInternal(preparation);
      } catch {
        preparationCurrency = "stale";
      }
    }

    const entryCurrency: HandoffEntryCurrency = preparation
      ? evaluateHandoffEntryCurrencyFromFacts({
          entry,
          currentPreparationCurrency: preparationCurrency ?? "stale",
        })
      : "stale";

    const consumptionCurrency: HandoffEvidenceConsumptionCurrency =
      evaluateHandoffEvidenceConsumptionCurrencyFromFacts({
        consumption,
        currentEntryCurrency: entryCurrency,
        currentPreparationCurrency: preparationCurrency ?? "stale",
      });

    const authoritative = await findAuthoritativeGpraByObligationContext(
      entry.obligationId,
      entry.handoffConsumerContextId,
    );
    const lineageMatchesAuthoritativeGpra = authoritative
      ? handoffEntryLineageMatchesGpra(entry, authoritative)
      : false;

    let gpraValidityPosture: GpraValidityPosture | null = null;
    if (authoritative) {
      const validity = await evaluateGpraValidityForContext(
        authoritative.gpraId,
        entry.handoffConsumerContextId,
      );
      gpraValidityPosture = validity.posture;
    }

    let eligibilityLayerCondition: HandoffEligibilityLayerCondition | null = null;
    if (preparation) {
      const eligibility = await assessHandoffEligibilityInternal({
        obligationId: preparation.obligationId,
        handoffConsumerContextId: preparation.handoffConsumerContextId,
        consumerCategoryKeys: preparation.consumerCategoryKeys,
      });
      eligibilityLayerCondition = eligibility.eligibilityLayerCondition;
    }

    return {
      entry,
      consumption,
      preparation,
      assessment: assessGovernedHandoffAuthorization({
        entry,
        entryCurrency,
        consumption,
        consumptionCurrency,
        preparation,
        preparationCurrency,
        gpraValidityPosture,
        eligibilityLayerCondition,
        consumerClassId: input.consumerClassId,
        lineageMatchesAuthoritativeGpra,
      }),
    };
  }

  async function rehydrateTrustedHandoffConsumerBinding(
    raw: GovernedHandoffConsumerBindingRecord,
  ): Promise<GovernedHandoffConsumerBindingRecord> {
    const entryRaw = await storage.getGovernedHandoffEntry(raw.entryId);
    if (!entryRaw) {
      throw new OrchestraConstitutionalError(
        "HCCM consumer binding entryId points to no persisted entry",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R39"],
      );
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const prepRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    if (!prepRaw) {
      throw new OrchestraConstitutionalError(
        "HCCM consumer binding preparationId points to no persisted preparation",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R39"],
      );
    }
    const preparation = await rehydrateTrustedHandoffPreparation(prepRaw);
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    if (!gpraRaw) {
      throw new OrchestraConstitutionalError(
        "HCCM consumer binding gpraId points to no persisted GPRA",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R35"],
      );
    }
    const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "HCCM consumer binding reviewId points to no persisted Review",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R39"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    if (!determinationRaw) {
      throw new OrchestraConstitutionalError(
        "HCCM consumer binding determinationId points to no persisted Determination",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R39"],
      );
    }
    const determination = rehydrateReviewDetermination(determinationRaw);
    return rehydrateGovernedHandoffConsumerBinding(raw, {
      entry,
      preparation,
      gpra,
      review,
      determination,
    });
  }

  async function assessHandoffConsumerBindingInternal(input: {
    entryId: GovernedHandoffEntryId;
    consumerClassId: HccmConsumerClassId;
  }): Promise<{
    assessment: GovernedHandoffConsumerBindingAssessment;
    entry: GovernedHandoffEntryRecord | null;
    preparation: GovernedHandoffPreparationRecord | null;
  }> {
    const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
    if (!entryRaw) {
      return {
        entry: null,
        preparation: null,
        assessment: assessGovernedHandoffConsumerBinding({
          entry: null,
          entryCurrency: null,
          preparation: null,
          preparationCurrency: null,
          gpraValidityPosture: null,
          eligibilityLayerCondition: null,
          consumerClassId: input.consumerClassId,
          lineageMatchesAuthoritativeGpra: false,
        }),
      };
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);

    const prepRaw = await storage.getGovernedHandoffPreparation(entry.preparationId);
    const preparation = prepRaw
      ? await rehydrateTrustedHandoffPreparation(prepRaw)
      : null;

    let preparationCurrency: HandoffPreparationCurrency | null = null;
    if (preparation) {
      try {
        preparationCurrency = await evaluateHandoffPreparationCurrencyInternal(preparation);
      } catch {
        preparationCurrency = "stale";
      }
    }

    const entryCurrency: HandoffEntryCurrency = preparation
      ? evaluateHandoffEntryCurrencyFromFacts({
          entry,
          currentPreparationCurrency: preparationCurrency ?? "stale",
        })
      : "stale";

    const authoritative = await findAuthoritativeGpraByObligationContext(
      entry.obligationId,
      entry.handoffConsumerContextId,
    );
    const lineageMatchesAuthoritativeGpra = authoritative
      ? handoffEntryLineageMatchesGpra(entry, authoritative)
      : false;

    let gpraValidityPosture: GpraValidityPosture | null = null;
    if (authoritative) {
      const validity = await evaluateGpraValidityForContext(
        authoritative.gpraId,
        entry.handoffConsumerContextId,
      );
      gpraValidityPosture = validity.posture;
    }

    let eligibilityLayerCondition: HandoffEligibilityLayerCondition | null = null;
    if (preparation) {
      const eligibility = await assessHandoffEligibilityInternal({
        obligationId: preparation.obligationId,
        handoffConsumerContextId: preparation.handoffConsumerContextId,
        consumerCategoryKeys: preparation.consumerCategoryKeys,
      });
      eligibilityLayerCondition = eligibility.eligibilityLayerCondition;
    }

    return {
      entry,
      preparation,
      assessment: assessGovernedHandoffConsumerBinding({
        entry,
        entryCurrency,
        preparation,
        preparationCurrency,
        gpraValidityPosture,
        eligibilityLayerCondition,
        consumerClassId: input.consumerClassId,
        lineageMatchesAuthoritativeGpra,
      }),
    };
  }

  async function rehydrateTrustedHandoffPostureDeclaration(
    raw: GovernedHandoffPostureDeclarationActRecord,
  ): Promise<GovernedHandoffPostureDeclarationActRecord> {
    const entryRaw = await storage.getGovernedHandoffEntry(raw.entryId);
    if (!entryRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff posture declaration entryId points to no persisted entry",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R43", "FI-DSN-STD-015-R47"],
      );
    }
    const bindingRaw = await storage.getGovernedHandoffConsumerBinding(raw.bindingId);
    if (!bindingRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff posture declaration bindingId points to no persisted HCCM binding",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R43"],
      );
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);
    const prepRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    if (!prepRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff posture declaration preparationId points to no persisted preparation",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R47"],
      );
    }
    const preparation = await rehydrateTrustedHandoffPreparation(prepRaw);
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    if (!gpraRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff posture declaration gpraId points to no persisted GPRA",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R43"],
      );
    }
    const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff posture declaration reviewId points to no persisted Review",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R47"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    if (!determinationRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff posture declaration determinationId points to no persisted Determination",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R47"],
      );
    }
    const determination = rehydrateReviewDetermination(determinationRaw);
    return rehydrateGovernedHandoffPostureDeclaration(raw, {
      entry,
      binding,
      preparation,
      gpra,
      review,
      determination,
    });
  }

  async function rehydrateTrustedHandoffCompletion(
    raw: GovernedHandoffCompletionActRecord,
  ): Promise<GovernedHandoffCompletionActRecord> {
    const entryRaw = await storage.getGovernedHandoffEntry(raw.entryId);
    if (!entryRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff completion entryId points to no persisted entry",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R50", "FI-DSN-STD-015-R51"],
      );
    }
    const bindingRaw = await storage.getGovernedHandoffConsumerBinding(raw.bindingId);
    if (!bindingRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff completion bindingId points to no persisted HCCM binding",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R50"],
      );
    }
    const postureRaw = await storage.getGovernedHandoffPostureDeclarationAct(
      raw.postureDeclarationActId,
    );
    if (!postureRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff completion postureDeclarationActId points to no persisted posture",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R51"],
      );
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);
    const posture = await rehydrateTrustedHandoffPostureDeclaration(postureRaw);
    const prepRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    if (!prepRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff completion preparationId points to no persisted preparation",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R51"],
      );
    }
    const preparation = await rehydrateTrustedHandoffPreparation(prepRaw);
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    if (!gpraRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff completion gpraId points to no persisted GPRA",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R50"],
      );
    }
    const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff completion reviewId points to no persisted Review",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R51"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    if (!determinationRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff completion determinationId points to no persisted Determination",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R51"],
      );
    }
    const determination = rehydrateReviewDetermination(determinationRaw);
    return rehydrateGovernedHandoffCompletion(raw, {
      entry,
      binding,
      posture,
      preparation,
      gpra,
      review,
      determination,
    });
  }

  async function rehydrateTrustedHandoffSuspension(
    raw: GovernedHandoffSuspensionActRecord,
  ): Promise<GovernedHandoffSuspensionActRecord> {
    const entryRaw = await storage.getGovernedHandoffEntry(raw.entryId);
    if (!entryRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff suspension entryId points to no persisted entry",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R88"],
      );
    }
    const bindingRaw = await storage.getGovernedHandoffConsumerBinding(raw.bindingId);
    if (!bindingRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff suspension bindingId points to no persisted HCCM binding",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R88"],
      );
    }
    const authorizationRaw = await storage.getGovernedHandoffAuthorizationAct(
      raw.authorizationActId,
    );
    if (!authorizationRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff suspension authorizationActId points to no persisted authorization",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R85"],
      );
    }
    if (!raw.postureDeclarationActId) {
      throw new OrchestraConstitutionalError(
        "Handoff suspension postureDeclarationActId is required for Volume 06 posture-relevant chains (R85a)",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R85"],
      );
    }
    const postureRaw = await storage.getGovernedHandoffPostureDeclarationAct(
      raw.postureDeclarationActId,
    );
    if (!postureRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff suspension postureDeclarationActId points to no persisted posture",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R85"],
      );
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);
    const authorization = await rehydrateTrustedHandoffAuthorization(authorizationRaw);
    const posture = await rehydrateTrustedHandoffPostureDeclaration(postureRaw);
    const prepRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    if (!prepRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff suspension preparationId points to no persisted preparation",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R88"],
      );
    }
    const preparation = await rehydrateTrustedHandoffPreparation(prepRaw);
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    if (!gpraRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff suspension gpraId points to no persisted GPRA",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R88"],
      );
    }
    const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff suspension reviewId points to no persisted Review",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R88"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    if (!determinationRaw) {
      throw new OrchestraConstitutionalError(
        "Handoff suspension determinationId points to no persisted Determination",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R88"],
      );
    }
    const determination = rehydrateReviewDetermination(determinationRaw);
    return rehydrateGovernedHandoffSuspension(raw, {
      entry,
      binding,
      authorization,
      posture,
      preparation,
      gpra,
      review,
      determination,
    });
  }

  async function rehydrateTrustedHandoffWithdrawal(
    raw: GovernedHandoffWithdrawalActRecord,
  ): Promise<GovernedHandoffWithdrawalActRecord> {
    const entryRaw = await storage.getGovernedHandoffEntry(raw.entryId);
    const bindingRaw = await storage.getGovernedHandoffConsumerBinding(raw.bindingId);
    const authorizationRaw = await storage.getGovernedHandoffAuthorizationAct(
      raw.authorizationActId,
    );
    const postureRaw = raw.postureDeclarationActId
      ? await storage.getGovernedHandoffPostureDeclarationAct(raw.postureDeclarationActId)
      : null;
    const preparationRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    if (
      !entryRaw ||
      !bindingRaw ||
      !authorizationRaw ||
      !postureRaw ||
      !preparationRaw ||
      !gpraRaw ||
      !reviewRaw ||
      !determinationRaw
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff withdrawal points to missing persisted lineage",
        "invalid_handoff_withdrawal",
        ["FI-DSN-STD-015-R99", "FI-DSN-STD-015-R102"],
      );
    }
    return rehydrateGovernedHandoffWithdrawal(raw, {
      entry: await rehydrateTrustedHandoffEntry(entryRaw),
      binding: await rehydrateTrustedHandoffConsumerBinding(bindingRaw),
      authorization: await rehydrateTrustedHandoffAuthorization(authorizationRaw),
      posture: await rehydrateTrustedHandoffPostureDeclaration(postureRaw),
      preparation: await rehydrateTrustedHandoffPreparation(preparationRaw),
      gpra: await rehydrateTrustedGpraGrant(gpraRaw),
      review: rehydrateProductionReadinessReview(reviewRaw),
      determination: rehydrateReviewDetermination(determinationRaw),
    });
  }

  async function rehydrateTrustedHandoffRecall(
    raw: GovernedHandoffRecallActRecord,
  ): Promise<GovernedHandoffRecallActRecord> {
    const entryRaw = await storage.getGovernedHandoffEntry(raw.entryId);
    const bindingRaw = await storage.getGovernedHandoffConsumerBinding(raw.bindingId);
    const authorizationRaw = await storage.getGovernedHandoffAuthorizationAct(
      raw.authorizationActId,
    );
    const postureRaw = raw.postureDeclarationActId
      ? await storage.getGovernedHandoffPostureDeclarationAct(raw.postureDeclarationActId)
      : null;
    const preparationRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    if (
      !entryRaw ||
      !bindingRaw ||
      !authorizationRaw ||
      !postureRaw ||
      !preparationRaw ||
      !gpraRaw ||
      !reviewRaw ||
      !determinationRaw
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff recall points to missing persisted lineage",
        "invalid_handoff_recall",
        ["FI-DSN-STD-015-R113", "FI-DSN-STD-015-R116"],
      );
    }
    return rehydrateGovernedHandoffRecall(raw, {
      entry: await rehydrateTrustedHandoffEntry(entryRaw),
      binding: await rehydrateTrustedHandoffConsumerBinding(bindingRaw),
      authorization: await rehydrateTrustedHandoffAuthorization(authorizationRaw),
      posture: await rehydrateTrustedHandoffPostureDeclaration(postureRaw),
      preparation: await rehydrateTrustedHandoffPreparation(preparationRaw),
      gpra: await rehydrateTrustedGpraGrant(gpraRaw),
      review: rehydrateProductionReadinessReview(reviewRaw),
      determination: rehydrateReviewDetermination(determinationRaw),
    });
  }

  async function rehydrateTrustedHandoffDownstreamExitBoundary(
    raw: GovernedHandoffDownstreamExitBoundaryAttributionRecord,
  ): Promise<GovernedHandoffDownstreamExitBoundaryAttributionRecord> {
    const entryRaw = await storage.getGovernedHandoffEntry(raw.entryId);
    if (!entryRaw) {
      throw new OrchestraConstitutionalError(
        "Downstream exit boundary entryId points to no persisted entry",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
      );
    }
    const bindingRaw = await storage.getGovernedHandoffConsumerBinding(raw.bindingId);
    if (!bindingRaw) {
      throw new OrchestraConstitutionalError(
        "Downstream exit boundary bindingId points to no persisted HCCM binding",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R61"],
      );
    }
    const postureRaw = await storage.getGovernedHandoffPostureDeclarationAct(
      raw.postureDeclarationActId,
    );
    if (!postureRaw) {
      throw new OrchestraConstitutionalError(
        "Downstream exit boundary postureDeclarationActId points to no persisted posture",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R64"],
      );
    }
    const completionRaw = await storage.getGovernedHandoffCompletionAct(raw.completionActId);
    if (!completionRaw) {
      throw new OrchestraConstitutionalError(
        "Downstream exit boundary completionActId points to no persisted completion",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R60", "FI-DSN-STD-015-R64"],
      );
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);
    const posture = await rehydrateTrustedHandoffPostureDeclaration(postureRaw);
    const completion = await rehydrateTrustedHandoffCompletion(completionRaw);
    const prepRaw = await storage.getGovernedHandoffPreparation(raw.preparationId);
    if (!prepRaw) {
      throw new OrchestraConstitutionalError(
        "Downstream exit boundary preparationId points to no persisted preparation",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R62"],
      );
    }
    const preparation = await rehydrateTrustedHandoffPreparation(prepRaw);
    const gpraRaw = await storage.getGpraGrant(raw.gpraId);
    if (!gpraRaw) {
      throw new OrchestraConstitutionalError(
        "Downstream exit boundary gpraId points to no persisted GPRA",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R62"],
      );
    }
    const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
    const reviewRaw = await storage.getProductionReadinessReview(raw.reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "Downstream exit boundary reviewId points to no persisted Review",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R62"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    const determinationRaw = await storage.getReviewDetermination(raw.determinationId);
    if (!determinationRaw) {
      throw new OrchestraConstitutionalError(
        "Downstream exit boundary determinationId points to no persisted Determination",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R62"],
      );
    }
    const determination = rehydrateReviewDetermination(determinationRaw);
    return rehydrateGovernedHandoffDownstreamExitBoundary(raw, {
      entry,
      binding,
      posture,
      completion,
      preparation,
      gpra,
      review,
      determination,
    });
  }

  async function assessHandoffDownstreamExitBoundaryInternal(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    downstreamConsiderationDomain?: string | null;
  }): Promise<{
    assessment: GovernedHandoffDownstreamExitBoundaryAssessment;
    entry: GovernedHandoffEntryRecord | null;
    binding: GovernedHandoffConsumerBindingRecord | null;
    posture: GovernedHandoffPostureDeclarationActRecord | null;
    completion: GovernedHandoffCompletionActRecord | null;
    preparation: GovernedHandoffPreparationRecord | null;
  }> {
    const completionAssessmentBundle = await assessHandoffCompletionInternal({
      entryId: input.entryId,
      bindingId: input.bindingId,
    });
    const { entry, binding, posture, preparation } = completionAssessmentBundle;

    if (!entry || !binding) {
      return {
        entry: null,
        binding: null,
        posture: null,
        completion: null,
        preparation: null,
        assessment: assessGovernedHandoffDownstreamExitBoundary({
          entry: null,
          entryCurrency: null,
          binding: null,
          bindingCurrency: null,
          posture: null,
          postureCurrency: null,
          completion: null,
          completionCurrency: null,
          preparation: null,
          preparationCurrency: null,
          gpraValidityPosture: null,
          eligibilityLayerCondition: null,
          lineageMatchesAuthoritativeGpra: false,
          downstreamConsiderationDomain: input.downstreamConsiderationDomain,
        }),
      };
    }

    const prep = preparation;
    let preparationCurrency: HandoffPreparationCurrency | null = null;
    if (prep) {
      try {
        preparationCurrency = await evaluateHandoffPreparationCurrencyInternal(prep);
      } catch {
        preparationCurrency = "stale";
      }
    }

    const entryCurrency: HandoffEntryCurrency = prep
      ? evaluateHandoffEntryCurrencyFromFacts({
          entry,
          currentPreparationCurrency: preparationCurrency ?? "stale",
        })
      : "stale";
    const bindingCurrency: HandoffConsumerBindingCurrency =
      entryCurrency === "current" ? "current" : "stale";

    let postureCurrency: HandoffPostureDeclarationCurrency | null = null;
    if (posture) {
      postureCurrency = evaluateHandoffPostureDeclarationCurrencyFromFacts({
        declaration: posture,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        authoritativeDeclarationId: posture.postureDeclarationActId,
      });
    }

    const completionsListed =
      await storage.listGovernedHandoffCompletionActsByBinding(binding.bindingId);
    const completions: GovernedHandoffCompletionActRecord[] = [];
    for (const item of completionsListed) {
      completions.push(await rehydrateTrustedHandoffCompletion(item));
    }
    const completion = selectAuthoritativeGovernedHandoffCompletion(completions);
    let completionCurrency: HandoffCompletionCurrency | null = null;
    if (completion) {
      completionCurrency = evaluateHandoffCompletionCurrencyFromFacts({
        completion,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        authoritativeCompletionActId: completion.completionActId,
      });
    }

    const authoritative = await findAuthoritativeGpraByObligationContext(
      entry.obligationId,
      entry.handoffConsumerContextId,
    );
    const lineageMatchesAuthoritativeGpra = authoritative
      ? handoffEntryLineageMatchesGpra(entry, authoritative)
      : false;

    let gpraValidityPosture: GpraValidityPosture | null = null;
    if (authoritative) {
      const validity = await evaluateGpraValidityForContext(
        authoritative.gpraId,
        entry.handoffConsumerContextId,
      );
      gpraValidityPosture = validity.posture;
    }

    let eligibilityLayerCondition: HandoffEligibilityLayerCondition | null = null;
    if (prep) {
      const eligibility = await assessHandoffEligibilityInternal({
        obligationId: prep.obligationId,
        handoffConsumerContextId: prep.handoffConsumerContextId,
        consumerCategoryKeys: prep.consumerCategoryKeys,
      });
      eligibilityLayerCondition = eligibility.eligibilityLayerCondition;
    }

    return {
      entry,
      binding,
      posture,
      completion,
      preparation: prep,
      assessment: assessGovernedHandoffDownstreamExitBoundary({
        entry,
        entryCurrency,
        binding,
        bindingCurrency,
        posture,
        postureCurrency,
        completion,
        completionCurrency,
        preparation: prep,
        preparationCurrency,
        gpraValidityPosture,
        eligibilityLayerCondition,
        lineageMatchesAuthoritativeGpra,
        downstreamConsiderationDomain: input.downstreamConsiderationDomain,
      }),
    };
  }

  async function assessHandoffCompletionInternal(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
  }): Promise<{
    assessment: GovernedHandoffCompletionAssessment;
    entry: GovernedHandoffEntryRecord | null;
    binding: GovernedHandoffConsumerBindingRecord | null;
    posture: GovernedHandoffPostureDeclarationActRecord | null;
    preparation: GovernedHandoffPreparationRecord | null;
  }> {
    const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
    const bindingRaw = await storage.getGovernedHandoffConsumerBinding(input.bindingId);
    if (!entryRaw || !bindingRaw) {
      return {
        entry: null,
        binding: null,
        posture: null,
        preparation: null,
        assessment: assessGovernedHandoffCompletion({
          entry: null,
          entryCurrency: null,
          binding: null,
          bindingCurrency: null,
          posture: null,
          postureCurrency: null,
          preparation: null,
          preparationCurrency: null,
          gpraValidityPosture: null,
          eligibilityLayerCondition: null,
          lineageMatchesAuthoritativeGpra: false,
        }),
      };
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);

    const prepRaw = await storage.getGovernedHandoffPreparation(entry.preparationId);
    const preparation = prepRaw
      ? await rehydrateTrustedHandoffPreparation(prepRaw)
      : null;

    let preparationCurrency: HandoffPreparationCurrency | null = null;
    if (preparation) {
      try {
        preparationCurrency = await evaluateHandoffPreparationCurrencyInternal(preparation);
      } catch {
        preparationCurrency = "stale";
      }
    }

    const entryCurrency: HandoffEntryCurrency = preparation
      ? evaluateHandoffEntryCurrencyFromFacts({
          entry,
          currentPreparationCurrency: preparationCurrency ?? "stale",
        })
      : "stale";

    const bindingCurrency: HandoffConsumerBindingCurrency =
      entryCurrency === "current" ? "current" : "stale";

    const postureListed = await storage.listGovernedHandoffPostureDeclarationActsByBinding(
      binding.bindingId,
    );
    const postureRehydrated: GovernedHandoffPostureDeclarationActRecord[] = [];
    for (const item of postureListed) {
      postureRehydrated.push(await rehydrateTrustedHandoffPostureDeclaration(item));
    }
    const posture = selectAuthoritativeHandoffPostureDeclaration(postureRehydrated);
    let postureCurrency: HandoffPostureDeclarationCurrency | null = null;
    if (posture) {
      postureCurrency = evaluateHandoffPostureDeclarationCurrencyFromFacts({
        declaration: posture,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        authoritativeDeclarationId: posture.postureDeclarationActId,
      });
    }

    const authoritative = await findAuthoritativeGpraByObligationContext(
      entry.obligationId,
      entry.handoffConsumerContextId,
    );
    const lineageMatchesAuthoritativeGpra = authoritative
      ? handoffEntryLineageMatchesGpra(entry, authoritative)
      : false;

    let gpraValidityPosture: GpraValidityPosture | null = null;
    if (authoritative) {
      const validity = await evaluateGpraValidityForContext(
        authoritative.gpraId,
        entry.handoffConsumerContextId,
      );
      gpraValidityPosture = validity.posture;
    }

    let eligibilityLayerCondition: HandoffEligibilityLayerCondition | null = null;
    if (preparation) {
      const eligibility = await assessHandoffEligibilityInternal({
        obligationId: preparation.obligationId,
        handoffConsumerContextId: preparation.handoffConsumerContextId,
        consumerCategoryKeys: preparation.consumerCategoryKeys,
      });
      eligibilityLayerCondition = eligibility.eligibilityLayerCondition;
    }

    return {
      entry,
      binding,
      posture,
      preparation,
      assessment: assessGovernedHandoffCompletion({
        entry,
        entryCurrency,
        binding,
        bindingCurrency,
        posture,
        postureCurrency,
        preparation,
        preparationCurrency,
        gpraValidityPosture,
        eligibilityLayerCondition,
        lineageMatchesAuthoritativeGpra,
      }),
    };
  }

  async function assessHandoffSuspensionInternal(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    constitutionalBasisKind?: unknown;
    constitutionalBasisNotes?: unknown;
    authorityClassId?: unknown;
    performerClass?: unknown;
    advisoryEvidenceAlone?: unknown;
    implementationInferenceAlone?: unknown;
    downstreamOperationalEventAlone?: unknown;
    rtcCatalogAlone?: unknown;
    gpraInvalidatedAlone?: unknown;
    gpraSupersededAlone?: unknown;
    g11BlockedAlone?: unknown;
    hrwmLossAlone?: unknown;
    spansMultipleBindings?: unknown;
    mergesPostureChains?: unknown;
    silentCrossContextPropagation?: unknown;
    foreignBinding?: unknown;
    unattributedGpraPropagation?: unknown;
    purportedWithdrawalRecordPresent?: unknown;
    purportedRecallRecordPresent?: unknown;
    priorRecordsPreservedReconstructable?: unknown;
  }): Promise<{
    assessment: GovernedHandoffSuspensionAssessment;
    entry: GovernedHandoffEntryRecord | null;
    binding: GovernedHandoffConsumerBindingRecord | null;
    authorization: GovernedHandoffAuthorizationActRecord | null;
    posture: GovernedHandoffPostureDeclarationActRecord | null;
  }> {
    const completionBundle = await assessHandoffCompletionInternal({
      entryId: input.entryId,
      bindingId: input.bindingId,
    });
    const { entry, binding, posture } = completionBundle;

    if (!entry || !binding) {
      return {
        entry: null,
        binding: null,
        authorization: null,
        posture: null,
        assessment: assessGovernedHandoffSuspension({
          entry: null,
          entryCurrency: null,
          binding: null,
          bindingCurrency: null,
          authorization: null,
          authorizationCurrency: null,
          posture: null,
          postureCurrency: null,
          gpraValidityPosture: null,
          eligibilityLayerCondition: null,
          lineageMatchesAuthoritativeGpra: false,
          constitutionalBasisKind: input.constitutionalBasisKind,
          constitutionalBasisNotes: input.constitutionalBasisNotes,
          authorityClassId: input.authorityClassId,
          performerClass: input.performerClass,
          advisoryEvidenceAlone: input.advisoryEvidenceAlone,
          rtcCatalogAlone: input.rtcCatalogAlone,
          gpraInvalidatedAlone: input.gpraInvalidatedAlone,
          gpraSupersededAlone: input.gpraSupersededAlone,
          g11BlockedAlone: input.g11BlockedAlone,
          hrwmLossAlone: input.hrwmLossAlone,
        }),
      };
    }

    const prepRaw = await storage.getGovernedHandoffPreparation(entry.preparationId);
    const preparation = prepRaw
      ? await rehydrateTrustedHandoffPreparation(prepRaw)
      : null;

    let preparationCurrency: HandoffPreparationCurrency | null = null;
    if (preparation) {
      try {
        preparationCurrency = await evaluateHandoffPreparationCurrencyInternal(preparation);
      } catch {
        preparationCurrency = "stale";
      }
    }

    const entryCurrency: HandoffEntryCurrency = preparation
      ? evaluateHandoffEntryCurrencyFromFacts({
          entry,
          currentPreparationCurrency: preparationCurrency ?? "stale",
        })
      : "stale";
    const bindingCurrency: HandoffConsumerBindingCurrency =
      entryCurrency === "current" ? "current" : "stale";

    let postureCurrency: HandoffPostureDeclarationCurrency | null = null;
    if (posture) {
      postureCurrency = evaluateHandoffPostureDeclarationCurrencyFromFacts({
        declaration: posture,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        authoritativeDeclarationId: posture.postureDeclarationActId,
      });
    }

    const authListed = await storage.listGovernedHandoffAuthorizationActsByEntry(entry.entryId);
    const authActs: GovernedHandoffAuthorizationActRecord[] = [];
    for (const item of authListed) {
      authActs.push(await rehydrateTrustedHandoffAuthorization(item));
    }
    const matchingAuths = authActs.filter(
      (a) => a.consumerClassId === binding.consumerClassId,
    );
    const authorization =
      matchingAuths.length > 0
        ? [...matchingAuths].sort((a, b) => a.authorizedAt.localeCompare(b.authorizedAt)).at(-1)!
        : null;
    let authorizationCurrency: HandoffAuthorizationCurrency | null = null;
    if (authorization) {
      const consumptionRaw = await storage.getGovernedHandoffEvidenceConsumption(
        authorization.evidenceConsumptionId,
      );
      if (!consumptionRaw) {
        authorizationCurrency = "stale";
      } else {
        const consumption = await rehydrateTrustedHandoffEvidenceConsumption(consumptionRaw);
        const consumptionCurrency = evaluateHandoffEvidenceConsumptionCurrencyFromFacts({
          consumption,
          currentEntryCurrency: entryCurrency,
          currentPreparationCurrency: preparationCurrency ?? "stale",
        });
        authorizationCurrency =
          entryCurrency === "current" && consumptionCurrency === "current"
            ? "current"
            : "stale";
      }
    }

    const authoritative = await findAuthoritativeGpraByObligationContext(
      entry.obligationId,
      entry.handoffConsumerContextId,
    );
    const lineageMatchesAuthoritativeGpra = authoritative
      ? handoffEntryLineageMatchesGpra(entry, authoritative)
      : false;

    let gpraValidityPosture: GpraValidityPosture | null = null;
    if (authoritative) {
      const validity = await evaluateGpraValidityForContext(
        authoritative.gpraId,
        entry.handoffConsumerContextId,
      );
      gpraValidityPosture = validity.posture;
    }

    let eligibilityLayerCondition: HandoffEligibilityLayerCondition | null = null;
    if (preparation) {
      const eligibility = await assessHandoffEligibilityInternal({
        obligationId: preparation.obligationId,
        handoffConsumerContextId: preparation.handoffConsumerContextId,
        consumerCategoryKeys: preparation.consumerCategoryKeys,
      });
      eligibilityLayerCondition = eligibility.eligibilityLayerCondition;
    }

    const completionsListed = await storage.listGovernedHandoffCompletionActsByBinding(
      binding.bindingId,
    );
    const completions: GovernedHandoffCompletionActRecord[] = [];
    for (const item of completionsListed) {
      completions.push(await rehydrateTrustedHandoffCompletion(item));
    }
    const authoritativeCompletion = selectAuthoritativeGovernedHandoffCompletion(completions);
    const completionIsCurrent =
      !!authoritativeCompletion &&
      evaluateHandoffCompletionCurrencyFromFacts({
        completion: authoritativeCompletion,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        authoritativeCompletionActId: authoritativeCompletion.completionActId,
      }) === "current";

    const preLifecycle = evaluateHandoffActLayerLifecycleFromFacts({
      binding,
      entry,
      entryCurrency,
      bindingCurrency,
      gpraValidityPosture,
      eligibilityLayerCondition,
      lineageMatchesAuthoritativeGpra,
      authoritativeCompletion,
      completionIsCurrent,
      matchingAuthorization: authorization,
      authorizationCurrency,
      authoritativePosture: posture,
    });

    return {
      entry,
      binding,
      authorization,
      posture,
      assessment: assessGovernedHandoffSuspension({
        entry,
        entryCurrency,
        binding,
        bindingCurrency,
        authorization,
        authorizationCurrency,
        posture,
        postureCurrency,
        gpraValidityPosture,
        eligibilityLayerCondition,
        lineageMatchesAuthoritativeGpra,
        constitutionalBasisKind: input.constitutionalBasisKind,
        constitutionalBasisNotes: input.constitutionalBasisNotes,
        authorityClassId: input.authorityClassId,
        performerClass: input.performerClass,
        advisoryEvidenceAlone: input.advisoryEvidenceAlone,
        implementationInferenceAlone: input.implementationInferenceAlone,
        downstreamOperationalEventAlone: input.downstreamOperationalEventAlone,
        rtcCatalogAlone: input.rtcCatalogAlone,
        gpraInvalidatedAlone: input.gpraInvalidatedAlone,
        gpraSupersededAlone: input.gpraSupersededAlone,
        g11BlockedAlone: input.g11BlockedAlone,
        hrwmLossAlone: input.hrwmLossAlone,
        spansMultipleBindings: input.spansMultipleBindings,
        mergesPostureChains: input.mergesPostureChains,
        silentCrossContextPropagation: input.silentCrossContextPropagation,
        foreignBinding: input.foreignBinding,
        unattributedGpraPropagation: input.unattributedGpraPropagation,
        purportedWithdrawalRecordPresent: input.purportedWithdrawalRecordPresent,
        purportedRecallRecordPresent: input.purportedRecallRecordPresent,
        lifecycleProjectedState: preLifecycle.currentState,
        priorRecordsPreservedReconstructable: input.priorRecordsPreservedReconstructable,
      }),
    };
  }

  async function assessHandoffWithdrawalInternal(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    constitutionalBasisKind?: unknown;
    constitutionalBasisNotes?: unknown;
    authorityClassId?: unknown;
    performerClass?: unknown;
    advisoryEvidenceAlone?: unknown;
    implementationInferenceAlone?: unknown;
    downstreamOperationalEventAlone?: unknown;
    rtcCatalogAlone?: unknown;
    gpraInvalidatedAlone?: unknown;
    gpraSupersededAlone?: unknown;
    g11BlockedAlone?: unknown;
    hrwmLossAlone?: unknown;
    purportedWithdrawalRecordPresent?: unknown;
    purportedRecallRecordPresent?: unknown;
    priorRecordsPreservedReconstructable?: unknown;
  }): Promise<{
    assessment: GovernedHandoffWithdrawalAssessment;
    entry: GovernedHandoffEntryRecord | null;
    binding: GovernedHandoffConsumerBindingRecord | null;
    authorization: GovernedHandoffAuthorizationActRecord | null;
    posture: GovernedHandoffPostureDeclarationActRecord | null;
  }> {
    const bundle = await assessHandoffSuspensionInternal(input);
    const { entry, binding, authorization, posture } = bundle;
    if (!entry || !binding) {
      return {
        entry,
        binding,
        authorization,
        posture,
        assessment: assessGovernedHandoffWithdrawal({
          entry,
          entryCurrency: bundle.assessment.entryCurrency,
          binding,
          bindingCurrency: bundle.assessment.bindingCurrency,
          authorization,
          authorizationCurrency: bundle.assessment.authorizationCurrency,
          posture,
          postureCurrency: bundle.assessment.postureDeclarationCurrency,
          gpraValidityPosture: bundle.assessment.gpraValidityPosture,
          eligibilityLayerCondition: bundle.assessment.eligibilityLayerCondition,
          lineageMatchesAuthoritativeGpra: false,
          constitutionalBasisKind: input.constitutionalBasisKind,
          constitutionalBasisNotes: input.constitutionalBasisNotes,
          authorityClassId: input.authorityClassId,
          performerClass: input.performerClass,
          advisoryEvidenceAlone: input.advisoryEvidenceAlone,
          rtcCatalogAlone: input.rtcCatalogAlone,
          gpraInvalidatedAlone: input.gpraInvalidatedAlone,
          gpraSupersededAlone: input.gpraSupersededAlone,
          g11BlockedAlone: input.g11BlockedAlone,
          hrwmLossAlone: input.hrwmLossAlone,
          purportedWithdrawalRecordPresent: input.purportedWithdrawalRecordPresent,
          purportedRecallRecordPresent: input.purportedRecallRecordPresent,
        }),
      };
    }

    const authoritativeGpra = await findAuthoritativeGpraByObligationContext(
      entry.obligationId,
      entry.handoffConsumerContextId,
    );
    const lineageMatchesAuthoritativeGpra = authoritativeGpra
      ? handoffEntryLineageMatchesGpra(entry, authoritativeGpra)
      : false;
    const listed = await storage.listGovernedHandoffWithdrawalActsByBinding(binding.bindingId);
    const withdrawals: GovernedHandoffWithdrawalActRecord[] = [];
    for (const item of listed) {
      withdrawals.push(await rehydrateTrustedHandoffWithdrawal(item));
    }
    const tip = selectAuthoritativeGovernedHandoffWithdrawal(withdrawals);
    const tipIsCurrent =
      !!tip &&
      evaluateHandoffWithdrawalCurrencyFromFacts({
        withdrawal: tip,
        currentEntryCurrency: bundle.assessment.entryCurrency ?? "stale",
        currentBindingCurrency: bundle.assessment.bindingCurrency ?? "stale",
        authoritativeWithdrawalActId: tip.withdrawalActId,
        gpraValidityPosture: bundle.assessment.gpraValidityPosture,
        lineageMatchesAuthoritativeGpra,
      }) === "current";

    const recallListed = await storage.listGovernedHandoffRecallActsByBinding(binding.bindingId);
    const recalls: GovernedHandoffRecallActRecord[] = [];
    for (const item of recallListed) {
      recalls.push(await rehydrateTrustedHandoffRecall(item));
    }
    const recallTip = selectAuthoritativeGovernedHandoffRecall(recalls);
    const recallTipIsCurrent =
      !!recallTip &&
      evaluateHandoffRecallCurrencyFromFacts({
        recall: recallTip,
        currentEntryCurrency: bundle.assessment.entryCurrency ?? "stale",
        currentBindingCurrency: bundle.assessment.bindingCurrency ?? "stale",
        authoritativeRecallActId: recallTip.recallActId,
        gpraValidityPosture: bundle.assessment.gpraValidityPosture,
        lineageMatchesAuthoritativeGpra,
      }) === "current";

    return {
      entry,
      binding,
      authorization,
      posture,
      assessment: assessGovernedHandoffWithdrawal({
        entry,
        entryCurrency: bundle.assessment.entryCurrency,
        binding,
        bindingCurrency: bundle.assessment.bindingCurrency,
        authorization,
        authorizationCurrency: bundle.assessment.authorizationCurrency,
        posture,
        postureCurrency: bundle.assessment.postureDeclarationCurrency,
        gpraValidityPosture: bundle.assessment.gpraValidityPosture,
        eligibilityLayerCondition: bundle.assessment.eligibilityLayerCondition,
        lineageMatchesAuthoritativeGpra,
        constitutionalBasisKind: input.constitutionalBasisKind,
        constitutionalBasisNotes: input.constitutionalBasisNotes,
        authorityClassId: input.authorityClassId,
        performerClass: input.performerClass,
        advisoryEvidenceAlone: input.advisoryEvidenceAlone,
        implementationInferenceAlone: input.implementationInferenceAlone,
        downstreamOperationalEventAlone: input.downstreamOperationalEventAlone,
        rtcCatalogAlone: input.rtcCatalogAlone,
        gpraInvalidatedAlone: input.gpraInvalidatedAlone,
        gpraSupersededAlone: input.gpraSupersededAlone,
        g11BlockedAlone: input.g11BlockedAlone,
        hrwmLossAlone: input.hrwmLossAlone,
        // R100/R114 â€” attributable cessation tip blocks further withdrawal even when
        // tip currency later becomes stale (e.g. GPRA Invalidated after withdrawal/recall).
        purportedWithdrawalRecordPresent:
          !!tip || tipIsCurrent || input.purportedWithdrawalRecordPresent === true,
        purportedRecallRecordPresent:
          !!recallTip ||
          recallTipIsCurrent ||
          input.purportedRecallRecordPresent === true,
        currentWithdrawalAlreadyCeasedReliance:
          !!tip || tipIsCurrent || !!recallTip || recallTipIsCurrent,
        priorRecordsPreservedReconstructable: input.priorRecordsPreservedReconstructable,
      }),
    };
  }

  async function assessHandoffRecallInternal(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    satisfiedHrtcmTriggers?: unknown;
    hrtcmTriggerEvidenceNotes?: unknown;
    hrwmEligibilityLossSatisfied?: unknown;
    postureChainGovernanceCessationSatisfied?: unknown;
    authorityClassId?: unknown;
    performerClass?: unknown;
    advisoryEvidenceAlone?: unknown;
    implementationInferenceAlone?: unknown;
    downstreamOperationalEventAlone?: unknown;
    rtcCatalogAlone?: unknown;
    hrtcmRtcAlone?: unknown;
    gpraInvalidatedAlone?: unknown;
    gpraSupersededAlone?: unknown;
    g11BlockedAlone?: unknown;
    hrwmLossAlone?: unknown;
    purportedWithdrawalRecordPresent?: unknown;
    purportedRecallRecordPresent?: unknown;
    priorRecordsPreservedReconstructable?: unknown;
  }): Promise<{
    assessment: GovernedHandoffRecallAssessment;
    entry: GovernedHandoffEntryRecord | null;
    binding: GovernedHandoffConsumerBindingRecord | null;
    authorization: GovernedHandoffAuthorizationActRecord | null;
    posture: GovernedHandoffPostureDeclarationActRecord | null;
  }> {
    const bundle = await assessHandoffSuspensionInternal(input);
    const { entry, binding, authorization, posture } = bundle;
    if (!entry || !binding) {
      return {
        entry,
        binding,
        authorization,
        posture,
        assessment: assessGovernedHandoffRecall({
          entry,
          entryCurrency: bundle.assessment.entryCurrency,
          binding,
          bindingCurrency: bundle.assessment.bindingCurrency,
          authorization,
          authorizationCurrency: bundle.assessment.authorizationCurrency,
          posture,
          postureCurrency: bundle.assessment.postureDeclarationCurrency,
          gpraValidityPosture: bundle.assessment.gpraValidityPosture,
          eligibilityLayerCondition: bundle.assessment.eligibilityLayerCondition,
          lineageMatchesAuthoritativeGpra: false,
          satisfiedHrtcmTriggers: input.satisfiedHrtcmTriggers,
          hrtcmTriggerEvidenceNotes: input.hrtcmTriggerEvidenceNotes,
          hrwmEligibilityLossSatisfied: input.hrwmEligibilityLossSatisfied,
          postureChainGovernanceCessationSatisfied:
            input.postureChainGovernanceCessationSatisfied,
          authorityClassId: input.authorityClassId,
          performerClass: input.performerClass,
          advisoryEvidenceAlone: input.advisoryEvidenceAlone,
          rtcCatalogAlone: input.rtcCatalogAlone,
          hrtcmRtcAlone: input.hrtcmRtcAlone,
          gpraInvalidatedAlone: input.gpraInvalidatedAlone,
          gpraSupersededAlone: input.gpraSupersededAlone,
          g11BlockedAlone: input.g11BlockedAlone,
          hrwmLossAlone: input.hrwmLossAlone,
        }),
      };
    }

    const authoritativeGpra = await findAuthoritativeGpraByObligationContext(
      entry.obligationId,
      entry.handoffConsumerContextId,
    );
    const lineageMatchesAuthoritativeGpra = authoritativeGpra
      ? handoffEntryLineageMatchesGpra(entry, authoritativeGpra)
      : false;

    let gpraValidityPostureForRecall = bundle.assessment.gpraValidityPosture;
    let lineageMatchesForRecall = lineageMatchesAuthoritativeGpra;
    const recallUsesHistoricalAttribution =
      Array.isArray(input.satisfiedHrtcmTriggers) &&
      (input.satisfiedHrtcmTriggers.includes("RTC-01") ||
        input.satisfiedHrtcmTriggers.includes("RTC-02"));
    if (recallUsesHistoricalAttribution) {
      const entryBoundValidity = await evaluateGpraValidityForContext(
        entry.gpraId,
        entry.handoffConsumerContextId,
      );
      gpraValidityPostureForRecall = entryBoundValidity.posture;
      const entryBoundGpraRaw = await storage.getGpraGrant(entry.gpraId);
      if (entryBoundGpraRaw) {
        const entryBoundGpra = await rehydrateTrustedGpraGrant(entryBoundGpraRaw);
        lineageMatchesForRecall = handoffEntryLineageMatchesGpra(entry, entryBoundGpra);
      }
    }

    const withdrawalListed = await storage.listGovernedHandoffWithdrawalActsByBinding(
      binding.bindingId,
    );
    const withdrawals: GovernedHandoffWithdrawalActRecord[] = [];
    for (const item of withdrawalListed) {
      withdrawals.push(await rehydrateTrustedHandoffWithdrawal(item));
    }
    const withdrawalTip = selectAuthoritativeGovernedHandoffWithdrawal(withdrawals);
    const withdrawalTipIsCurrent =
      !!withdrawalTip &&
      evaluateHandoffWithdrawalCurrencyFromFacts({
        withdrawal: withdrawalTip,
        currentEntryCurrency: bundle.assessment.entryCurrency ?? "stale",
        currentBindingCurrency: bundle.assessment.bindingCurrency ?? "stale",
        authoritativeWithdrawalActId: withdrawalTip.withdrawalActId,
        gpraValidityPosture: gpraValidityPostureForRecall,
        lineageMatchesAuthoritativeGpra: lineageMatchesForRecall,
      }) === "current";

    const recallListed = await storage.listGovernedHandoffRecallActsByBinding(binding.bindingId);
    const recalls: GovernedHandoffRecallActRecord[] = [];
    for (const item of recallListed) {
      recalls.push(await rehydrateTrustedHandoffRecall(item));
    }
    const recallTip = selectAuthoritativeGovernedHandoffRecall(recalls);
    const recallTipIsCurrent =
      !!recallTip &&
      evaluateHandoffRecallCurrencyFromFacts({
        recall: recallTip,
        currentEntryCurrency: bundle.assessment.entryCurrency ?? "stale",
        currentBindingCurrency: bundle.assessment.bindingCurrency ?? "stale",
        authoritativeRecallActId: recallTip.recallActId,
        gpraValidityPosture: gpraValidityPostureForRecall,
        lineageMatchesAuthoritativeGpra: lineageMatchesForRecall,
      }) === "current";

    const preLifecycle = evaluateHandoffActLayerLifecycleFromFacts({
      binding,
      entry,
      entryCurrency: bundle.assessment.entryCurrency,
      bindingCurrency: bundle.assessment.bindingCurrency,
      gpraValidityPosture: gpraValidityPostureForRecall,
      eligibilityLayerCondition: bundle.assessment.eligibilityLayerCondition,
      lineageMatchesAuthoritativeGpra: lineageMatchesForRecall,
      authoritativeCompletion: null,
      completionIsCurrent: false,
      matchingAuthorization: authorization,
      authorizationCurrency: bundle.assessment.authorizationCurrency,
      authoritativePosture: posture,
      authoritativeWithdrawal: withdrawalTip,
      withdrawalIsCurrent: withdrawalTipIsCurrent,
      authoritativeRecall: recallTip,
      recallIsCurrent: recallTipIsCurrent,
    });

    return {
      entry,
      binding,
      authorization,
      posture,
      assessment: assessGovernedHandoffRecall({
        entry,
        entryCurrency: bundle.assessment.entryCurrency,
        binding,
        bindingCurrency: bundle.assessment.bindingCurrency,
        authorization,
        authorizationCurrency: bundle.assessment.authorizationCurrency,
        posture,
        postureCurrency: bundle.assessment.postureDeclarationCurrency,
        gpraValidityPosture: gpraValidityPostureForRecall,
        eligibilityLayerCondition: bundle.assessment.eligibilityLayerCondition,
        lineageMatchesAuthoritativeGpra: lineageMatchesForRecall,
        satisfiedHrtcmTriggers: input.satisfiedHrtcmTriggers,
        hrtcmTriggerEvidenceNotes: input.hrtcmTriggerEvidenceNotes,
        hrwmEligibilityLossSatisfied: input.hrwmEligibilityLossSatisfied,
        postureChainGovernanceCessationSatisfied:
          input.postureChainGovernanceCessationSatisfied,
        authorityClassId: input.authorityClassId,
        performerClass: input.performerClass,
        advisoryEvidenceAlone: input.advisoryEvidenceAlone,
        implementationInferenceAlone: input.implementationInferenceAlone,
        downstreamOperationalEventAlone: input.downstreamOperationalEventAlone,
        rtcCatalogAlone: input.rtcCatalogAlone,
        hrtcmRtcAlone: input.hrtcmRtcAlone,
        gpraInvalidatedAlone: input.gpraInvalidatedAlone,
        gpraSupersededAlone: input.gpraSupersededAlone,
        g11BlockedAlone: input.g11BlockedAlone,
        hrwmLossAlone: input.hrwmLossAlone,
        // R114 â€” attributable withdrawal/recall tip blocks further recall even when
        // tip currency later becomes stale (e.g. GPRA Invalidated after withdrawal).
        purportedWithdrawalRecordPresent:
          !!withdrawalTip ||
          withdrawalTipIsCurrent ||
          input.purportedWithdrawalRecordPresent === true,
        purportedRecallRecordPresent:
          !!recallTip ||
          recallTipIsCurrent ||
          input.purportedRecallRecordPresent === true,
        currentRecallAlreadyCeasedReliance:
          !!withdrawalTip ||
          withdrawalTipIsCurrent ||
          !!recallTip ||
          recallTipIsCurrent,
        lifecycleProjectedState: preLifecycle.currentState,
        priorRecordsPreservedReconstructable: input.priorRecordsPreservedReconstructable,
      }),
    };
  }

  async function assessHandoffPostureDeclarationInternal(input: {
    entryId: GovernedHandoffEntryId;
    bindingId: GovernedHandoffConsumerBindingId;
    declaredPostureClass?: HandoffPostureClass | null;
  }): Promise<{
    assessment: GovernedHandoffPostureDeclarationAssessment;
    entry: GovernedHandoffEntryRecord | null;
    binding: GovernedHandoffConsumerBindingRecord | null;
    preparation: GovernedHandoffPreparationRecord | null;
  }> {
    const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
    const bindingRaw = await storage.getGovernedHandoffConsumerBinding(input.bindingId);
    if (!entryRaw || !bindingRaw) {
      return {
        entry: null,
        binding: null,
        preparation: null,
        assessment: assessGovernedHandoffPostureDeclaration({
          entry: null,
          entryCurrency: null,
          binding: null,
          bindingCurrency: null,
          preparation: null,
          preparationCurrency: null,
          gpraValidityPosture: null,
          eligibilityLayerCondition: null,
          lineageMatchesAuthoritativeGpra: false,
          declaredPostureClass: input.declaredPostureClass ?? null,
        }),
      };
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);

    const prepRaw = await storage.getGovernedHandoffPreparation(entry.preparationId);
    const preparation = prepRaw
      ? await rehydrateTrustedHandoffPreparation(prepRaw)
      : null;

    let preparationCurrency: HandoffPreparationCurrency | null = null;
    if (preparation) {
      try {
        preparationCurrency = await evaluateHandoffPreparationCurrencyInternal(preparation);
      } catch {
        preparationCurrency = "stale";
      }
    }

    const entryCurrency: HandoffEntryCurrency = preparation
      ? evaluateHandoffEntryCurrencyFromFacts({
          entry,
          currentPreparationCurrency: preparationCurrency ?? "stale",
        })
      : "stale";

    const bindingCurrency: HandoffConsumerBindingCurrency =
      entryCurrency === "current" ? "current" : "stale";

    const authoritative = await findAuthoritativeGpraByObligationContext(
      entry.obligationId,
      entry.handoffConsumerContextId,
    );
    const lineageMatchesAuthoritativeGpra = authoritative
      ? handoffEntryLineageMatchesGpra(entry, authoritative)
      : false;

    let gpraValidityPosture: GpraValidityPosture | null = null;
    if (authoritative) {
      const validity = await evaluateGpraValidityForContext(
        authoritative.gpraId,
        entry.handoffConsumerContextId,
      );
      gpraValidityPosture = validity.posture;
    }

    let eligibilityLayerCondition: HandoffEligibilityLayerCondition | null = null;
    if (preparation) {
      const eligibility = await assessHandoffEligibilityInternal({
        obligationId: preparation.obligationId,
        handoffConsumerContextId: preparation.handoffConsumerContextId,
        consumerCategoryKeys: preparation.consumerCategoryKeys,
      });
      eligibilityLayerCondition = eligibility.eligibilityLayerCondition;
    }

    const declaredPostureClass =
      input.declaredPostureClass === undefined || input.declaredPostureClass === null
        ? binding.postureClassAffinity
        : input.declaredPostureClass;

    return {
      entry,
      binding,
      preparation,
      assessment: assessGovernedHandoffPostureDeclaration({
        entry,
        entryCurrency,
        binding,
        bindingCurrency,
        preparation,
        preparationCurrency,
        gpraValidityPosture,
        eligibilityLayerCondition,
        lineageMatchesAuthoritativeGpra,
        declaredPostureClass,
      }),
    };
  }

  async function assessHandoffEvidenceConsumptionInternal(
    entryId: GovernedHandoffEntryId,
  ): Promise<{
    assessment: GovernedHandoffEvidenceConsumptionAssessment;
    entry: GovernedHandoffEntryRecord | null;
    preparation: GovernedHandoffPreparationRecord | null;
  }> {
    const entryRaw = await storage.getGovernedHandoffEntry(entryId);
    if (!entryRaw) {
      return {
        entry: null,
        preparation: null,
        assessment: assessGovernedHandoffEvidenceConsumption({
          entry: null,
          entryCurrency: null,
          preparation: null,
          preparationCurrency: null,
          authoritativeGpraId: null,
          lineageMatchesAuthoritativeGpra: false,
        }),
      };
    }
    const entry = await rehydrateTrustedHandoffEntry(entryRaw);
    const prepRaw = await storage.getGovernedHandoffPreparation(entry.preparationId);
    const preparation = prepRaw
      ? await rehydrateTrustedHandoffPreparation(prepRaw)
      : null;

    let preparationCurrency: HandoffPreparationCurrency | null = null;
    if (preparation) {
      try {
        preparationCurrency = await evaluateHandoffPreparationCurrencyInternal(preparation);
      } catch {
        preparationCurrency = "stale";
      }
    }

    const entryCurrency: HandoffEntryCurrency = preparation
      ? evaluateHandoffEntryCurrencyFromFacts({
          entry,
          currentPreparationCurrency: preparationCurrency ?? "stale",
        })
      : "stale";

    const authoritative = await findAuthoritativeGpraByObligationContext(
      entry.obligationId,
      entry.handoffConsumerContextId,
    );
    const lineageMatchesAuthoritativeGpra = authoritative
      ? handoffEntryLineageMatchesGpra(entry, authoritative)
      : false;

    return {
      entry,
      preparation,
      assessment: assessGovernedHandoffEvidenceConsumption({
        entry,
        entryCurrency,
        preparation,
        preparationCurrency,
        authoritativeGpraId: authoritative?.gpraId ?? null,
        lineageMatchesAuthoritativeGpra,
      }),
    };
  }

  async function evaluateHandoffPreparationCurrencyInternal(
    preparation: GovernedHandoffPreparationRecord,
  ): Promise<HandoffPreparationCurrency> {
    const currentAssessment = await assessHandoffEligibilityInternal({
      obligationId: preparation.obligationId,
      handoffConsumerContextId: preparation.handoffConsumerContextId,
      consumerCategoryKeys: preparation.consumerCategoryKeys,
    });
    const currentAuthoritative = await findAuthoritativeGpraByObligationContext(
      preparation.obligationId,
      preparation.handoffConsumerContextId,
    );
    const currentValidity = currentAuthoritative
      ? await evaluateGpraValidityForContext(
          currentAuthoritative.gpraId,
          preparation.handoffConsumerContextId,
        )
      : null;
    return evaluateHandoffPreparationCurrencyFromFacts({
      preparation,
      currentAuthoritativeGpraId: currentAuthoritative?.gpraId ?? null,
      currentValidity,
      currentEligibilityCondition: currentAssessment.eligibilityLayerCondition,
    });
  }

  async function resolveBrainAdvisoriesForHandoff(
    ids: readonly Domain3BrainAdvisoryId[] | undefined,
  ): Promise<readonly Domain3BrainAdvisoryId[]> {
    if (!ids || ids.length === 0) return Object.freeze([]);
    const resolved: Domain3BrainAdvisoryId[] = [];
    for (const advisoryId of ids) {
      const loaded = await storage.getDomain3BrainAdvisory(advisoryId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          `Handoff preparation brainAdvisoryId not found: ${advisoryId}`,
          "invalid_handoff_preparation",
          ["FI-DSN-STD-014-R87", "FI-DSN-STD-014-R92"],
        );
      }
      await rehydrateTrustedBrainAdvisory(loaded);
      resolved.push(advisoryId);
    }
    return Object.freeze(resolved);
  }

  async function resolveDispositionRecordIdsForHandoff(
    ids: readonly string[] | undefined,
  ): Promise<readonly string[]> {
    if (!ids || ids.length === 0) return Object.freeze([]);
    const resolved: string[] = [];
    for (const id of ids) {
      const trimmed = id.trim();
      if (!trimmed) {
        throw new OrchestraConstitutionalError(
          "Handoff preparation dispositionRecordIds must be non-empty strings",
          "invalid_handoff_preparation",
          ["FI-DSN-STD-014-R87"],
        );
      }
      const deficiency = await storage.getDownstreamDeficiencyRecord(
        trimmed as DownstreamDeficiencyRecordId,
      );
      const rework = await storage.getReworkAuthorization(trimmed as ReworkAuthorizationId);
      const withholding = await storage.getReworkAuthorizationWithholding(
        trimmed as ReworkAuthorizationWithholdingId,
      );
      const returnPosture = await storage.getReturnPosture(trimmed as ReturnPostureId);
      const resubmission = await storage.getResubmissionEligibility(
        trimmed as ResubmissionEligibilityId,
      );
      if (!deficiency && !rework && !withholding && !returnPosture && !resubmission) {
        throw new OrchestraConstitutionalError(
          `Handoff preparation dispositionRecordId not found: ${trimmed}`,
          "invalid_handoff_preparation",
          ["FI-DSN-STD-014-R87"],
        );
      }
      resolved.push(trimmed);
    }
    return Object.freeze(resolved);
  }

  async function hasBlockedPredecessorInContext(
    obligationId: ProductionObligationId,
    handoffConsumerContextId: string,
  ): Promise<boolean> {
    const listed = await storage.listGpraGrantsByObligation(obligationId);
    for (const grant of listed) {
      const invalidation = await storage.getGpraInvalidationActByGpra(grant.gpraId);
      if (invalidation) return true;
      const supersession = await storage.getGpraSupersessionActByPredecessor(grant.gpraId);
      if (supersession && supersession.handoffConsumerContextId === handoffConsumerContextId) {
        return true;
      }
    }
    return false;
  }

  async function assessHandoffEligibilityInternal(input: {
    obligationId: ProductionObligationId;
    handoffConsumerContextId: string;
    consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
    brainAdvisoryIds?: readonly Domain3BrainAdvisoryId[];
    dispositionRecordIds?: readonly string[];
  }): Promise<GovernedHandoffEligibilityAssessment> {
    assertHandoffConsumerCategoryKeys(input.consumerCategoryKeys);
    const contextId = input.handoffConsumerContextId.trim();
    if (!contextId) {
      throw new OrchestraConstitutionalError(
        "Handoff eligibility evaluation requires non-empty handoffConsumerContextId",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R89"],
      );
    }

    const brainAdvisoryIds = await resolveBrainAdvisoriesForHandoff(input.brainAdvisoryIds);
    const dispositionRecordIds = await resolveDispositionRecordIdsForHandoff(
      input.dispositionRecordIds,
    );

    const authoritative = await findAuthoritativeGpraByObligationContext(
      input.obligationId,
      contextId,
    );

    let authoritativeValidity: GpraValidityAssessment | null = null;
    let missingRequiredLineage = false;
    let successorGpraId: GpraId | null = null;

    if (authoritative) {
      if (
        !authoritative.gpraId ||
        !authoritative.approvalActId ||
        !authoritative.reviewId ||
        !authoritative.determinationId ||
        !authoritative.rvaId ||
        !authoritative.programId ||
        !authoritative.obligationId
      ) {
        missingRequiredLineage = true;
      } else {
        const reviewRaw = await storage.getProductionReadinessReview(authoritative.reviewId);
        const determinationRaw = await storage.getReviewDetermination(
          authoritative.determinationId,
        );
        const approvalRaw = await storage.getApprovalAct(authoritative.approvalActId);
        if (!reviewRaw || !determinationRaw || !approvalRaw) {
          missingRequiredLineage = true;
        } else if (
          reviewRaw.programId !== authoritative.programId ||
          reviewRaw.obligationId !== authoritative.obligationId ||
          reviewRaw.rvaId !== authoritative.rvaId ||
          determinationRaw.reviewId !== authoritative.reviewId ||
          approvalRaw.reviewId !== authoritative.reviewId
        ) {
          missingRequiredLineage = true;
        }
      }
      authoritativeValidity = await evaluateGpraValidityForContext(authoritative.gpraId, contextId);
      const supersession = await storage.getGpraSupersessionActByPredecessor(authoritative.gpraId);
      // If this GPRA is a successor, capture predecessor supersession pointing to it is N/A;
      // successor id on export is only when this GPRA was superseded (then not authoritative).
      if (authoritativeValidity.supersessionActId) {
        const act = await storage.getGpraSupersessionAct(authoritativeValidity.supersessionActId);
        successorGpraId = act?.successorGpraId ?? null;
      }
    }

    const blocked =
      !authoritative &&
      (await hasBlockedPredecessorInContext(input.obligationId, contextId));

    return assessGovernedHandoffEligibility({
      obligationId: input.obligationId,
      handoffConsumerContextId: contextId,
      consumerCategoryKeys: input.consumerCategoryKeys,
      authoritativeGpra: authoritative,
      authoritativeValidity,
      hasBlockedPredecessorInContext: blocked,
      missingRequiredLineage,
      dispositionRecordIds,
      brainAdvisoryIds,
      successorGpraId,
    });
  }

  async function requireLinkedConditionalOrFailDetermination(
    reviewId: ProductionReadinessReviewId,
  ): Promise<{
    review: ProductionReadinessReview;
    determination: ReviewDeterminationRecord;
  }> {
    const context = await loadG7DispositionRehydrationContext(reviewId);
    if (context.determination.outcome !== "conditional" && context.determination.outcome !== "fail") {
      throw new OrchestraConstitutionalError(
        "G7 EGDF/DSRA/resubmission requires Conditional or Fail Determination",
        "invalid_downstream_disposition",
        ["FI-DSN-STD-014-R49"],
      );
    }
    return context;
  }

  async function resolveMostRecentDeterminedReviewForRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<{
    review: ProductionReadinessReview;
    determination: ReviewDeterminationRecord;
  } | null> {
    const listed = await storage.listProductionReadinessReviewsByRva(rvaId);
    const determined = listed
      .map((item) => rehydrateProductionReadinessReview(item))
      .filter((item) => item.posture === "review_determined" && !!item.determinationId)
      .sort((a, b) => b.audit.createdAt.localeCompare(a.audit.createdAt));
    if (determined.length === 0) return null;
    const review = determined[0]!;
    const determinationRaw = await storage.getReviewDetermination(review.determinationId!);
    if (!determinationRaw) {
      throw new OrchestraConstitutionalError(
        "Most recent determined Review lacks persisted Determination",
        "invalid_downstream_disposition",
        ["FI-DSN-STD-014-R51"],
      );
    }
    return {
      review,
      determination: rehydrateReviewDetermination(determinationRaw),
    };
  }

  async function requireUnderReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ProductionReadinessReview> {
    const review = await requireExistingReview(reviewId);
    if (review.posture !== "under_review") {
      throw new OrchestraConstitutionalError(
        "Review activity requires Under Review posture",
        "invalid_review_activity",
        ["FI-DSN-STD-014-R14"],
      );
    }
    return review;
  }

  async function assertEvidenceBasisIntegrity(
    review: ProductionReadinessReview,
    determination: ReviewDeterminationRecord,
  ): Promise<void> {
    for (const evidenceId of determination.evidenceBasisIds) {
      const evidence = await storage.getReviewEvidence(evidenceId);
      if (!evidence) {
        throw new OrchestraConstitutionalError(
          "Review Determination evidence basis references nonexistent evidence",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R30"],
        );
      }
      if (evidence.reviewId !== review.reviewId || evidence.rvaId !== review.rvaId) {
        throw new OrchestraConstitutionalError(
          "Review Determination evidence basis does not belong to the subject Review",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R30"],
        );
      }
    }
    for (const activityId of determination.activityBasisIds) {
      const activity = await storage.getReviewDimensionActivity(activityId);
      if (!activity) {
        throw new OrchestraConstitutionalError(
          "Review Determination activity basis references nonexistent activity",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R30"],
        );
      }
      if (activity.reviewId !== review.reviewId || activity.rvaId !== review.rvaId) {
        throw new OrchestraConstitutionalError(
          "Review Determination activity basis does not belong to the subject Review",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R30"],
        );
      }
      for (const evidenceId of activity.evidenceIds) {
        const linked = await storage.getReviewEvidence(evidenceId);
        if (!linked || linked.reviewId !== review.reviewId) {
          throw new OrchestraConstitutionalError(
            "Review activity evidence basis contains unresolved or foreign evidence",
            "invalid_review_determination",
            ["FI-DSN-STD-014-R30"],
          );
        }
      }
    }
  }

  /**
   * G6 trust boundary: jointly resolve Review â†” Determination and re-verify evidence basis.
   */
  async function requireLinkedPassDeterminationForApproval(
    reviewId: ProductionReadinessReviewId,
  ): Promise<{
    review: ProductionReadinessReview;
    determination: ReviewDeterminationRecord;
  }> {
    const review = await requireExistingReview(reviewId);
    if (review.posture !== "review_determined" || !review.determinationId) {
      throw new OrchestraConstitutionalError(
        "Approval requires completed Review with Determination linkage",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34"],
      );
    }

    const byReview = await storage.getReviewDeterminationByReview(review.reviewId);
    const byId = await storage.getReviewDetermination(review.determinationId);
    if (!byReview || !byId) {
      throw new OrchestraConstitutionalError(
        "Review Determination required for Approval is missing",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }
    if (byReview.determinationId !== byId.determinationId) {
      throw new OrchestraConstitutionalError(
        "Contradictory Review Determination linkage blocks Approval",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }
    if (review.determinationId !== byId.determinationId) {
      throw new OrchestraConstitutionalError(
        "review.determinationId does not resolve to the persisted Determination for this Review",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }

    const determination = rehydrateReviewDetermination(byId);
    await assertEvidenceBasisIntegrity(review, determination);

    if (!domain1) {
      throw new OrchestraConstitutionalError(
        "Approval requires Domain 1 Program authority source for Program/Obligation activation",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R39"],
      );
    }

    const program = await domain1.loadProgram(review.programId);
    if (!program) {
      throw new OrchestraConstitutionalError(
        "Approval requires existing Production Program",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R39"],
      );
    }
    assertProgramIsActiveAuthority(program.posture);
    if (!isActiveProgramPosture(program.posture)) {
      throw new OrchestraConstitutionalError(
        "Approval requires active Production Program authority",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R39"],
      );
    }
    const current = await domain1.isConstitutionallyCurrent(program);
    if (!current) {
      throw new OrchestraConstitutionalError(
        "Approval requires constitutionally current Production Program",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R39"],
      );
    }
    const obligation = program.obligations.find((item) => item.id === review.obligationId);
    if (!obligation) {
      throw new OrchestraConstitutionalError(
        "Approval requires Review Production Obligation on the Program",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R43"],
      );
    }

    const rva = await domain2.loadRva(review.rvaId);
    if (!rva) {
      throw new OrchestraConstitutionalError(
        "Approval requires the reviewed RVA to exist",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R43"],
      );
    }
    if (isTerminalRvaPosture(rva.posture)) {
      throw new OrchestraConstitutionalError(
        "Approval cannot bind a superseded or invalidated RVA",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R43"],
      );
    }
    if (rva.id !== review.rvaId || rva.programId !== review.programId || rva.obligationId !== review.obligationId) {
      throw new OrchestraConstitutionalError(
        "Live RVA identity does not match Review subject for Approval",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R43"],
      );
    }

    return { review, determination };
  }

  async function persistEvidenceAndActivity(input: {
    evidence: ReviewEvidenceRecord;
    activity: ReviewDimensionActivityRecord;
  }): Promise<{
    evidence: ReviewEvidenceRecord;
    activity: ReviewDimensionActivityRecord;
  }> {
    await storage.putReviewEvidence(input.evidence);
    const loadedEvidence = await storage.getReviewEvidence(input.evidence.evidenceId);
    if (!loadedEvidence) {
      throw new OrchestraConstitutionalError(
        "Failed to persist Review evidence before dimension activity",
        "invalid_domain3_persistence_state",
        ["FI-DSN-STD-014-R20", "FI-DSN-STD-014-R25"],
      );
    }

    for (const evidenceId of input.activity.evidenceIds) {
      const linked = await storage.getReviewEvidence(evidenceId);
      if (!linked) {
        throw new OrchestraConstitutionalError(
          "Review dimension activity references nonexistent Review evidence",
          "invalid_review_activity",
          ["FI-DSN-STD-014-R20"],
        );
      }
    }

    await storage.putReviewDimensionActivity(input.activity);
    const loadedActivity = await storage.getReviewDimensionActivity(input.activity.activityId);
    if (!loadedActivity) {
      throw new OrchestraConstitutionalError(
        "Failed to persist Review dimension activity",
        "invalid_domain3_persistence_state",
        ["FI-DSN-STD-014-R14", "FI-DSN-STD-014-R20"],
      );
    }

    return {
      evidence: rehydrateReviewEvidence(loadedEvidence),
      activity: rehydrateReviewDimensionActivity(loadedActivity),
    };
  }

  return {
    async admitToProductionReadinessReview(input) {
      let freshness;
      try {
        freshness = await domain2.assertReviewEntryReadinessCurrentForAdmission({
          rvaId: input.rvaId,
        });
      } catch (error) {
        if (error instanceof OrchestraConstitutionalError) {
          throw new OrchestraConstitutionalError(
            error.message,
            "invalid_review_entry_eligibility",
            ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R09", "FI-DSN-STD-014-R10"],
          );
        }
        throw error;
      }

      const existingActive = await storage.getActiveProductionReadinessReviewByRva(input.rvaId);
      if (existingActive) {
        throw new OrchestraConstitutionalError(
          "Duplicate Production-readiness Review admission rejected while Under Review",
          "invalid_review_entry_eligibility",
          ["FI-DSN-STD-014-R08"],
        );
      }

      let priorReviewId: ProductionReadinessReviewId | null = null;
      let resubmissionEligibilityId: ResubmissionEligibilityId | null = null;

      const priorDetermined = await resolveMostRecentDeterminedReviewForRva(input.rvaId);
      if (priorDetermined) {
        const { review: priorReview, determination: priorDetermination } = priorDetermined;
        // Pass path isolation: Pass (with or without withholding) does not gate subsequent admission via R51.
        if (priorDetermination.outcome === "conditional" || priorDetermination.outcome === "fail") {
          const eligibilityRaw = await storage.getResubmissionEligibilityByPriorReview(
            priorReview.reviewId,
          );
          if (!eligibilityRaw) {
            throw new OrchestraConstitutionalError(
              "Subsequent Review after Conditional/Fail requires unused resubmission eligibility for the prior Review",
              "invalid_downstream_disposition",
              ["FI-DSN-STD-014-R51"],
            );
          }
          const eligibility = await rehydrateTrustedResubmissionEligibility(eligibilityRaw);
          const consumer = await storage.getReviewByResubmissionEligibilityId(
            eligibility.eligibilityId,
          );
          if (consumer) {
            throw new OrchestraConstitutionalError(
              "Resubmission eligibility has already been consumed by a subsequent Review",
              "invalid_downstream_disposition",
              ["FI-DSN-STD-014-R51"],
            );
          }
          priorReviewId = priorReview.reviewId;
          resubmissionEligibilityId = eligibility.eligibilityId;
        }
      }

      const review = admitProductionReadinessReview({
        rva: freshness.rva,
        reviewEntryReadiness: freshness.readiness,
        traceabilityPackage: freshness.readiness.traceabilityPackage,
        admittedBy: input.admittedBy,
        priorReviewId,
        resubmissionEligibilityId,
      });

      return persistReview(review);
    },

    async loadProductionReadinessReview(reviewId) {
      const loaded = await storage.getProductionReadinessReview(reviewId);
      if (!loaded) return null;
      return rehydrateProductionReadinessReview(loaded);
    },

    async loadActiveProductionReadinessReviewByRva(rvaId) {
      const loaded = await storage.getActiveProductionReadinessReviewByRva(rvaId);
      if (!loaded) return null;
      return rehydrateProductionReadinessReview(loaded);
    },

    async recordReviewDimensionActivity(input) {
      const review = await requireUnderReview(input.reviewId);

      const evidence = createReviewEvidenceRecord({
        review,
        dimensionId: input.dimensionId,
        sourceKind: input.sourceKind,
        sourceRecordId: input.sourceRecordId,
        sourceSnapshot: input.sourceSnapshot,
        capturedBy: input.recordedBy,
      });

      const activity = createReviewDimensionActivityRecord({
        review,
        dimensionId: input.dimensionId,
        evidence: [evidence],
        observation: input.observation,
        addressedBy: input.recordedBy,
      });

      return persistEvidenceAndActivity({ evidence, activity });
    },

    async recordDesignTimeFeasibilityEvaluation(input) {
      const review = await requireUnderReview(input.reviewId);

      const livePackage = await domain2.assembleTraceabilityPackage({
        rvaId: review.rvaId,
      });

      if (livePackage.rvaId !== review.rvaId) {
        throw new OrchestraConstitutionalError(
          "Design-Time Feasibility package RVA does not match Review subject",
          "invalid_design_time_feasibility",
          ["FI-DSN-STD-014-R21"],
        );
      }

      if (
        livePackage.programId !== review.programId ||
        livePackage.obligationId !== review.obligationId
      ) {
        throw new OrchestraConstitutionalError(
          "Design-Time Feasibility package Program/Obligation does not match Review subject",
          "invalid_design_time_feasibility",
          ["FI-DSN-STD-014-R21"],
        );
      }

      const draftEvaluation = createDesignTimeFeasibilityEvaluation({
        review,
        manufacturingAuthority,
        programComplianceBoundaries: livePackage.complianceBoundaryBindings,
        evaluationMethodDescription: input.evaluationMethodDescription,
        observations: input.observations,
        affirmsDecisionStageWithoutManufacturingExecution:
          input.affirmsDecisionStageWithoutManufacturingExecution,
        evaluatedBy: input.evaluatedBy,
      });

      const snapshot = buildDesignTimeFeasibilityEvidenceSnapshot(draftEvaluation);
      const evidence = createReviewEvidenceRecord({
        review,
        dimensionId: DESIGN_TIME_FEASIBILITY_DIMENSION_ID,
        sourceKind: "compliance_boundary",
        sourceRecordId: draftEvaluation.evaluationId,
        sourceSnapshot: snapshot,
        capturedBy: input.evaluatedBy,
        capturedAt: draftEvaluation.evaluatedAt,
      });

      const observationSummary = input.observations.map((item) => item.text).join("; ");
      const activity = createReviewDimensionActivityRecord({
        review,
        dimensionId: DESIGN_TIME_FEASIBILITY_DIMENSION_ID,
        evidence: [evidence],
        observation: `Design-Time Feasibility evaluation ${draftEvaluation.evaluationId}: ${observationSummary}`,
        addressedBy: input.evaluatedBy,
        addressedAt: draftEvaluation.evaluatedAt,
      });

      const persisted = await persistEvidenceAndActivity({ evidence, activity });

      const linked = attachDesignTimeFeasibilityEvidenceLinkage(
        draftEvaluation,
        [persisted.evidence.evidenceId],
        persisted.activity.activityId,
      );

      validatePersistedDesignTimeFeasibilityEvaluation(linked);
      await storage.putDesignTimeFeasibilityEvaluation(linked);
      const loadedEvaluation = await storage.getDesignTimeFeasibilityEvaluation(
        linked.evaluationId,
      );
      if (!loadedEvaluation) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Design-Time Feasibility evaluation",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R21", "FI-DSN-STD-014-R25"],
        );
      }

      return {
        evaluation: rehydrateDesignTimeFeasibilityEvaluation(loadedEvaluation),
        evidence: persisted.evidence,
        activity: persisted.activity,
      };
    },

    async listReviewEvidenceByReview(reviewId) {
      await requireExistingReview(reviewId);
      const list = await storage.listReviewEvidenceByReview(reviewId);
      return Object.freeze(list.map((item) => rehydrateReviewEvidence(item)));
    },

    async listReviewDimensionActivitiesByReview(reviewId) {
      await requireExistingReview(reviewId);
      const list = await storage.listReviewDimensionActivitiesByReview(reviewId);
      return Object.freeze(list.map((item) => rehydrateReviewDimensionActivity(item)));
    },

    async loadReviewEvidence(evidenceId) {
      const loaded = await storage.getReviewEvidence(evidenceId);
      if (!loaded) return null;
      return rehydrateReviewEvidence(loaded);
    },

    async loadReviewDimensionActivity(activityId) {
      const loaded = await storage.getReviewDimensionActivity(activityId);
      if (!loaded) return null;
      return rehydrateReviewDimensionActivity(loaded);
    },

    async loadDesignTimeFeasibilityEvaluation(evaluationId) {
      const loaded = await storage.getDesignTimeFeasibilityEvaluation(evaluationId);
      if (!loaded) return null;
      return rehydrateDesignTimeFeasibilityEvaluation(loaded);
    },

    async listDesignTimeFeasibilityEvaluationsByReview(reviewId) {
      await requireExistingReview(reviewId);
      const list = await storage.listDesignTimeFeasibilityEvaluationsByReview(reviewId);
      return Object.freeze(list.map((item) => rehydrateDesignTimeFeasibilityEvaluation(item)));
    },

    async evaluateMandatoryReviewActivityCompleteness(reviewId) {
      const review = await requireExistingReview(reviewId);
      const activities = await storage.listReviewDimensionActivitiesByReview(reviewId);
      const frozenActivities = activities.map((item) => rehydrateReviewDimensionActivity(item));
      return evaluateMandatoryReviewActivityCompleteness({
        review,
        activities: frozenActivities,
      });
    },

    async recordReviewDetermination(input) {
      const review = await requireExistingReview(input.reviewId);

      if (review.posture === "review_determined" || review.determinationId !== null) {
        throw new OrchestraConstitutionalError(
          "Exactly one Review Determination may be recorded per completed Review",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R27"],
        );
      }

      if (review.posture !== "under_review") {
        throw new OrchestraConstitutionalError(
          "Review Determination requires Under Review posture",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R27"],
        );
      }

      const existing = await storage.getReviewDeterminationByReview(review.reviewId);
      if (existing) {
        throw new OrchestraConstitutionalError(
          "Exactly one Review Determination may be recorded per completed Review",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R27"],
        );
      }

      const evidenceRaw = await storage.listReviewEvidenceByReview(review.reviewId);
      const activitiesRaw = await storage.listReviewDimensionActivitiesByReview(review.reviewId);
      const evidence = evidenceRaw.map((item) => rehydrateReviewEvidence(item));
      const activities = activitiesRaw.map((item) => rehydrateReviewDimensionActivity(item));

      const completeness = evaluateMandatoryReviewActivityCompleteness({
        review,
        activities,
      });

      const { determination, completedReview } = createReviewDetermination({
        review,
        completeness,
        evidence,
        activities,
        outcome: input.outcome,
        conditions: input.conditions,
        grounds: input.grounds,
        determinedBy: input.determinedBy,
      });

      validatePersistedReviewDetermination(determination);
      await assertEvidenceBasisIntegrity(review, determination);

      try {
        await storage.putReviewDetermination(determination);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Review Determination",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R27"],
        );
      }

      const persistedReview = await persistReview(completedReview);

      const loadedDetermination = await storage.getReviewDetermination(
        determination.determinationId,
      );
      if (!loadedDetermination) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Review Determination",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R27"],
        );
      }

      if (persistedReview.determinationId !== determination.determinationId) {
        throw new OrchestraConstitutionalError(
          "Review Determination linkage integrity failure after persistence",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R27"],
        );
      }

      return {
        determination: rehydrateReviewDetermination(loadedDetermination),
        review: persistedReview,
      };
    },

    async loadReviewDetermination(determinationId) {
      const loaded = await storage.getReviewDetermination(determinationId);
      if (!loaded) return null;
      return rehydrateReviewDetermination(loaded);
    },

    async loadReviewDeterminationByReview(reviewId) {
      const loaded = await storage.getReviewDeterminationByReview(reviewId);
      if (!loaded) return null;
      return rehydrateReviewDetermination(loaded);
    },

    async evaluateApprovalConsiderationEligibility(reviewId) {
      const review = await requireExistingReview(reviewId);
      let determination: ReviewDeterminationRecord | null = null;
      if (review.determinationId) {
        const raw = await storage.getReviewDetermination(review.determinationId);
        const byReview = await storage.getReviewDeterminationByReview(review.reviewId);
        if (
          raw &&
          byReview &&
          raw.determinationId === byReview.determinationId &&
          review.determinationId === raw.determinationId
        ) {
          determination = rehydrateReviewDetermination(raw);
        }
      }
      const withholdingRaw = await storage.getApprovalWithholdingByReview(reviewId);
      const approvalRaw = await storage.getApprovalActByReview(reviewId);
      return evaluateApprovalConsiderationEligibility({
        review,
        determination,
        withholding: withholdingRaw
          ? await rehydrateTrustedApprovalWithholding(withholdingRaw)
          : null,
        existingApproval: approvalRaw
          ? await rehydrateTrustedApprovalAct(approvalRaw)
          : null,
      });
    },

    async recordApprovalAct(input) {
      const { review, determination } = await requireLinkedPassDeterminationForApproval(
        input.reviewId,
      );
      const existingWithholding = await storage.getApprovalWithholdingByReview(review.reviewId);
      if (existingWithholding) {
        throw new OrchestraConstitutionalError(
          "Approval act blocked by recorded Approval withholding after Pass",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R39"],
        );
      }
      const existingApproval = await storage.getApprovalActByReview(review.reviewId);
      if (existingApproval) {
        throw new OrchestraConstitutionalError(
          "Exactly one Approval act may be recorded per completed Review",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R41"],
        );
      }

      const approval = createApprovalAct({
        review,
        determination,
        authorityClassId: input.authorityClassId,
        approvedBy: input.approvedBy,
      });
      validatePersistedApprovalAct(approval);
      try {
        await storage.putApprovalAct(approval);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Approval act",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R41"],
        );
      }
      const loaded = await storage.getApprovalAct(approval.approvalActId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Approval act",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R41"],
        );
      }
      return rehydrateTrustedApprovalAct(loaded);
    },

    async withholdApproval(input) {
      const { review, determination } = await requireLinkedPassDeterminationForApproval(
        input.reviewId,
      );
      const existingApproval = await storage.getApprovalActByReview(review.reviewId);
      if (existingApproval) {
        throw new OrchestraConstitutionalError(
          "Cannot withhold Approval after Approval act has been recorded",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R39"],
        );
      }
      const existingWithholding = await storage.getApprovalWithholdingByReview(review.reviewId);
      if (existingWithholding) {
        throw new OrchestraConstitutionalError(
          "Exactly one Approval withholding may be recorded per Review",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R39"],
        );
      }

      const withholding = createApprovalWithholding({
        review,
        determination,
        groundFamily: input.groundFamily,
        grounds: input.grounds,
        withheldBy: input.withheldBy,
        additionalGoverningSourceId: input.additionalGoverningSourceId,
      });
      validatePersistedApprovalWithholding(withholding);
      try {
        await storage.putApprovalWithholding(withholding);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Approval withholding",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R39"],
        );
      }
      const loaded = await storage.getApprovalWithholding(withholding.withholdingId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Approval withholding",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R39"],
        );
      }
      return rehydrateTrustedApprovalWithholding(loaded);
    },

    async grantGpra(input) {
      const { review, determination } = await requireLinkedPassDeterminationForApproval(
        input.reviewId,
      );
      const existingWithholding = await storage.getApprovalWithholdingByReview(review.reviewId);
      if (existingWithholding) {
        throw new OrchestraConstitutionalError(
          "GPRA grant blocked by Approval withholding",
          "invalid_gpra_grant",
          ["FI-DSN-STD-014-R39", "FI-DSN-STD-014-R42"],
        );
      }
      const approvalRaw = await storage.getApprovalActByReview(review.reviewId);
      if (!approvalRaw) {
        throw new OrchestraConstitutionalError(
          "GPRA requires a prior Approval act; Approval is necessary but not sufficient and does not auto-create GPRA",
          "invalid_gpra_grant",
          ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R42"],
        );
      }
      const approval = await rehydrateTrustedApprovalAct(approvalRaw);
      const existingGpra = await storage.getGpraGrantByReview(review.reviewId);
      if (existingGpra) {
        throw new OrchestraConstitutionalError(
          "Exactly one GPRA grant may be recorded per Review",
          "invalid_gpra_grant",
          ["FI-DSN-STD-014-R42", "FI-DSN-STD-014-R43"],
        );
      }

      const obligationGrants = await storage.listGpraGrantsByObligation(review.obligationId);
      const retentionPriors: GpraGrantRecord[] = [];
      let onlyInvalidatedOrSupersededPriors = true;
      for (const prior of obligationGrants) {
        const priorInvalidation = await storage.getGpraInvalidationActByGpra(prior.gpraId);
        if (priorInvalidation) continue;
        const priorSupersession = await storage.getGpraSupersessionActByPredecessor(prior.gpraId);
        if (priorSupersession) continue;
        onlyInvalidatedOrSupersededPriors = false;
        retentionPriors.push(prior);
      }

      if (retentionPriors.length > 0) {
        if (!input.st1Supersession) {
          throw new OrchestraConstitutionalError(
            "Forward-active Retention GPRA already exists for this Production Obligation; ST-1 supersession parameters are required for replacement grant succession",
            "invalid_gpra_supersession",
            ["FI-DSN-STD-014-R66", "FI-DSN-STD-014-R69", "FI-DSN-STD-014-R70"],
          );
        }
        if (retentionPriors.length > 1) {
          throw new OrchestraConstitutionalError(
            "Multiple Retention GPRAs exist for this Production Obligation; cannot establish ST-1 succession without resolving conflicting Retention priors",
            "invalid_gpra_supersession",
            ["FI-DSN-STD-014-R69", "FI-DSN-STD-014-R70"],
          );
        }
        const predecessor = retentionPriors[0]!;
        if (input.st1Supersession.predecessorGpraId !== predecessor.gpraId) {
          throw new OrchestraConstitutionalError(
            "ST-1 st1Supersession.predecessorGpraId must identify the Retention predecessor GPRA for this obligation",
            "invalid_gpra_supersession",
            ["FI-DSN-STD-014-R66", "FI-DSN-STD-014-R69"],
          );
        }
        const predInvalidation = await storage.getGpraInvalidationActByGpra(predecessor.gpraId);
        if (predInvalidation) {
          throw new OrchestraConstitutionalError(
            "Invalidated predecessor cannot become Superseded; replacement after Invalidated remains G8/G6 path without supersession act",
            "invalid_gpra_supersession",
            ["FI-DSN-STD-014-R70"],
          );
        }
        // Pre-validate SSAC / context / actor before persisting successor grant (avoid orphan grant).
        assertEstablishedSupersessionAuthorityClass(input.st1Supersession.authorityClassId);
        if (!input.st1Supersession.handoffConsumerContextId.trim()) {
          throw new OrchestraConstitutionalError(
            "GPRA supersession requires non-empty handoffConsumerContextId (opaque consumer context; catalog deferred G11)",
            "invalid_gpra_supersession",
            ["FI-DSN-STD-014-R69"],
          );
        }
        if (!input.st1Supersession.triggeringGoverningSourceId.trim()) {
          throw new OrchestraConstitutionalError(
            "GPRA supersession requires a triggering governing source identifier",
            "invalid_gpra_supersession",
            ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
          );
        }
        if (!input.st1Supersession.constitutionalEvidence.trim()) {
          throw new OrchestraConstitutionalError(
            "GPRA supersession requires documented constitutional evidence supporting the ST family finding",
            "invalid_gpra_supersession",
            ["FI-DSN-STD-014-R69"],
          );
        }
        if (!input.st1Supersession.supersededBy.trim()) {
          throw new OrchestraConstitutionalError(
            "GPRA supersession requires attributable supersession authority actor",
            "invalid_gpra_supersession",
            ["FI-DSN-STD-014-R68"],
          );
        }
      } else if (input.st1Supersession) {
        // Caller offered ST-1 but no Retention prior â€” may be Invalidated-only path misuse
        const nominated = await storage.getGpraGrant(input.st1Supersession.predecessorGpraId);
        if (nominated) {
          const nominatedInvalidation = await storage.getGpraInvalidationActByGpra(
            nominated.gpraId,
          );
          if (nominatedInvalidation) {
            throw new OrchestraConstitutionalError(
              "Invalidated predecessor cannot become Superseded; grant without supersession after Invalidated (G8 R62)",
              "invalid_gpra_supersession",
              ["FI-DSN-STD-014-R62", "FI-DSN-STD-014-R70"],
            );
          }
        }
        if (!onlyInvalidatedOrSupersededPriors || obligationGrants.length === 0) {
          throw new OrchestraConstitutionalError(
            "ST-1 supersession requires an existing Retention predecessor GPRA",
            "invalid_gpra_supersession",
            ["FI-DSN-STD-014-R66", "FI-DSN-STD-014-R70"],
          );
        }
      }

      const gpra = createGpraGrant({
        review,
        determination,
        approval,
        grantedBy: input.grantedBy,
      });
      validatePersistedGpraGrant(gpra);
      try {
        await storage.putGpraGrant(gpra);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist GPRA grant",
          "invalid_gpra_grant",
          ["FI-DSN-STD-014-R42"],
        );
      }
      const loaded = await storage.getGpraGrant(gpra.gpraId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist GPRA grant",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R42"],
        );
      }
      const successorGpra = await rehydrateTrustedGpraGrant(loaded);

      if (input.st1Supersession && retentionPriors.length === 1) {
        const predecessorRaw = retentionPriors[0]!;
        const predecessorGpra = await rehydrateTrustedGpraGrant(predecessorRaw);
        const predecessorContext = await loadG6AuthorityRehydrationContext(
          predecessorGpra.reviewId,
        );
        const predecessorApprovalRaw = await storage.getApprovalAct(predecessorGpra.approvalActId);
        if (!predecessorApprovalRaw) {
          throw new OrchestraConstitutionalError(
            "ST-1 supersession requires persisted Approval in predecessor GPRA grant lineage",
            "invalid_gpra_supersession",
            ["FI-DSN-STD-014-R69"],
          );
        }
        const predecessorApproval = await rehydrateTrustedApprovalAct(predecessorApprovalRaw);
        const act = createGpraSupersessionAct({
          predecessorGpra,
          successorGpra,
          predecessorApproval,
          successorApproval: approval,
          predecessorReview: predecessorContext.review,
          successorReview: review,
          predecessorDetermination: predecessorContext.determination,
          successorDetermination: determination,
          stFamily: "replacement_gpra_grant",
          handoffConsumerContextId: input.st1Supersession.handoffConsumerContextId,
          triggeringGoverningSourceId: input.st1Supersession.triggeringGoverningSourceId,
          constitutionalEvidence: input.st1Supersession.constitutionalEvidence,
          authorityClassId: input.st1Supersession.authorityClassId,
          supersededBy: input.st1Supersession.supersededBy,
        });
        await persistSupersessionAct(act);
      }

      return successorGpra;
    },

    async invalidateGpra(input) {
      const gpraRaw = await storage.getGpraGrant(input.gpraId);
      if (!gpraRaw) {
        throw new OrchestraConstitutionalError(
          "GPRA grant not found for invalidation",
          "invalid_gpra_invalidation",
          ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
        );
      }
      const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
      const existingInvalidation = await storage.getGpraInvalidationActByGpra(gpra.gpraId);
      if (existingInvalidation) {
        throw new OrchestraConstitutionalError(
          "GPRA is already invalidated; silent reactivation and duplicate invalidation are forbidden",
          "invalid_gpra_invalidation",
          ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R62"],
        );
      }
      const context = await loadG6AuthorityRehydrationContext(gpra.reviewId);
      const approvalRaw = await storage.getApprovalAct(gpra.approvalActId);
      if (!approvalRaw) {
        throw new OrchestraConstitutionalError(
          "GPRA invalidation requires persisted Approval in GPRA grant lineage",
          "invalid_gpra_invalidation",
          ["FI-DSN-STD-014-R59"],
        );
      }
      const approval = await rehydrateTrustedApprovalAct(approvalRaw);

      const act = createGpraInvalidationAct({
        gpra,
        approval,
        review: context.review,
        determination: context.determination,
        itFamily: input.itFamily,
        triggeringGoverningSourceId: input.triggeringGoverningSourceId,
        constitutionalEvidence: input.constitutionalEvidence,
        authorityClassId: input.authorityClassId,
        invalidatedBy: input.invalidatedBy,
        materialNonComplianceEstablished: input.materialNonComplianceEstablished,
      });
      validatePersistedGpraInvalidationAct(act);
      try {
        await storage.putGpraInvalidationAct(act);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist GPRA invalidation act",
          "invalid_gpra_invalidation",
          ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
        );
      }
      const loaded = await storage.getGpraInvalidationAct(act.invalidationActId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist GPRA invalidation act",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R54"],
        );
      }
      return rehydrateTrustedGpraInvalidationAct(loaded);
    },

    async supersedeGpra(input) {
      assertSupersessionTriggerFamily(input.stFamily);
      assertEstablishedSupersessionAuthorityClass(input.authorityClassId);

      const predecessorRaw = await storage.getGpraGrant(input.predecessorGpraId);
      const successorRaw = await storage.getGpraGrant(input.successorGpraId);
      if (!predecessorRaw || !successorRaw) {
        throw new OrchestraConstitutionalError(
          "GPRA supersession requires existing predecessor and successor GPRA grants",
          "invalid_gpra_supersession",
          ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
        );
      }
      const predecessorGpra = await rehydrateTrustedGpraGrant(predecessorRaw);
      const successorGpra = await rehydrateTrustedGpraGrant(successorRaw);

      const predecessorInvalidation = await storage.getGpraInvalidationActByGpra(
        predecessorGpra.gpraId,
      );
      if (predecessorInvalidation) {
        throw new OrchestraConstitutionalError(
          "Invalidated predecessor cannot become Superseded",
          "invalid_gpra_supersession",
          ["FI-DSN-STD-014-R70"],
        );
      }
      const successorInvalidation = await storage.getGpraInvalidationActByGpra(
        successorGpra.gpraId,
      );
      if (successorInvalidation) {
        throw new OrchestraConstitutionalError(
          "Successor GPRA must be Retention (not invalidated) to govern after supersession",
          "invalid_gpra_supersession",
          ["FI-DSN-STD-014-R70", "FI-DSN-STD-014-R71"],
        );
      }
      const existingSupersession = await storage.getGpraSupersessionActByPredecessor(
        predecessorGpra.gpraId,
      );
      if (existingSupersession) {
        throw new OrchestraConstitutionalError(
          "Predecessor GPRA already superseded; duplicate supersession is forbidden",
          "invalid_gpra_supersession",
          ["FI-DSN-STD-014-R69", "FI-DSN-STD-014-R70"],
        );
      }

      if (
        (input.stFamily === "replacement_gpra_grant" ||
          input.stFamily === "authoritative_succession_rule") &&
        predecessorGpra.obligationId !== successorGpra.obligationId
      ) {
        throw new OrchestraConstitutionalError(
          "ST-1/ST-2 supersession requires same Production Obligation for predecessor and successor",
          "invalid_gpra_supersession",
          ["FI-DSN-STD-014-R66", "FI-DSN-STD-014-R69"],
        );
      }
      if (predecessorGpra.programId !== successorGpra.programId) {
        throw new OrchestraConstitutionalError(
          "GPRA supersession requires same Production Program for predecessor and successor",
          "invalid_gpra_supersession",
          ["FI-DSN-STD-014-R69"],
        );
      }

      const predecessorContext = await loadG6AuthorityRehydrationContext(predecessorGpra.reviewId);
      const successorContext = await loadG6AuthorityRehydrationContext(successorGpra.reviewId);
      const predecessorApprovalRaw = await storage.getApprovalAct(predecessorGpra.approvalActId);
      const successorApprovalRaw = await storage.getApprovalAct(successorGpra.approvalActId);
      if (!predecessorApprovalRaw || !successorApprovalRaw) {
        throw new OrchestraConstitutionalError(
          "GPRA supersession requires persisted Approvals in grant lineages",
          "invalid_gpra_supersession",
          ["FI-DSN-STD-014-R69"],
        );
      }
      const predecessorApproval = await rehydrateTrustedApprovalAct(predecessorApprovalRaw);
      const successorApproval = await rehydrateTrustedApprovalAct(successorApprovalRaw);

      const act = createGpraSupersessionAct({
        predecessorGpra,
        successorGpra,
        predecessorApproval,
        successorApproval,
        predecessorReview: predecessorContext.review,
        successorReview: successorContext.review,
        predecessorDetermination: predecessorContext.determination,
        successorDetermination: successorContext.determination,
        stFamily: input.stFamily,
        handoffConsumerContextId: input.handoffConsumerContextId,
        triggeringGoverningSourceId: input.triggeringGoverningSourceId,
        constitutionalEvidence: input.constitutionalEvidence,
        authorityClassId: input.authorityClassId,
        supersededBy: input.supersededBy,
      });
      return persistSupersessionAct(act);
    },

    async loadApprovalAct(approvalActId) {
      const loaded = await storage.getApprovalAct(approvalActId);
      if (!loaded) return null;
      return rehydrateTrustedApprovalAct(loaded);
    },

    async loadApprovalActByReview(reviewId) {
      const loaded = await storage.getApprovalActByReview(reviewId);
      if (!loaded) return null;
      return rehydrateTrustedApprovalAct(loaded);
    },

    async loadApprovalWithholding(withholdingId) {
      const loaded = await storage.getApprovalWithholding(withholdingId);
      if (!loaded) return null;
      return rehydrateTrustedApprovalWithholding(loaded);
    },

    async loadApprovalWithholdingByReview(reviewId) {
      const loaded = await storage.getApprovalWithholdingByReview(reviewId);
      if (!loaded) return null;
      return rehydrateTrustedApprovalWithholding(loaded);
    },

    async loadGpraGrant(gpraId) {
      const loaded = await storage.getGpraGrant(gpraId);
      if (!loaded) return null;
      return rehydrateTrustedGpraGrant(loaded);
    },

    async loadGpraGrantByReview(reviewId) {
      const loaded = await storage.getGpraGrantByReview(reviewId);
      if (!loaded) return null;
      return rehydrateTrustedGpraGrant(loaded);
    },

    async loadGpraGrantByRvaObligation(input) {
      return findForwardActiveGpraByRvaObligation(input.rvaId, input.obligationId);
    },

    async loadGpraInvalidationAct(invalidationActId) {
      const loaded = await storage.getGpraInvalidationAct(invalidationActId);
      if (!loaded) return null;
      return rehydrateTrustedGpraInvalidationAct(loaded);
    },

    async loadGpraInvalidationActByGpra(gpraId) {
      const loaded = await storage.getGpraInvalidationActByGpra(gpraId);
      if (!loaded) return null;
      return rehydrateTrustedGpraInvalidationAct(loaded);
    },

    async loadGpraSupersessionAct(supersessionActId) {
      const loaded = await storage.getGpraSupersessionAct(supersessionActId);
      if (!loaded) return null;
      return rehydrateTrustedGpraSupersessionAct(loaded, { treatAsAlreadyPersisted: true });
    },

    async loadGpraSupersessionActByPredecessor(predecessorGpraId) {
      const loaded = await storage.getGpraSupersessionActByPredecessor(predecessorGpraId);
      if (!loaded) return null;
      return rehydrateTrustedGpraSupersessionAct(loaded, { treatAsAlreadyPersisted: true });
    },

    async evaluateGpraValidity(gpraId, handoffConsumerContextId) {
      const gpraRaw = await storage.getGpraGrant(gpraId);
      if (!gpraRaw) {
        throw new OrchestraConstitutionalError(
          "GPRA grant not found for validity assessment",
          "invalid_gpra_invalidation",
          ["FI-DSN-STD-014-R52", "FI-DSN-STD-014-R54"],
        );
      }
      const gpra = await rehydrateTrustedGpraGrant(gpraRaw);
      const invalidationRaw = await storage.getGpraInvalidationActByGpra(gpra.gpraId);
      const invalidation = invalidationRaw
        ? await rehydrateTrustedGpraInvalidationAct(invalidationRaw)
        : null;
      const supersessionRaw = await storage.getGpraSupersessionActByPredecessor(gpra.gpraId);
      let supersession: GpraSupersessionActRecord | null = null;
      if (supersessionRaw) {
        const rehydrated = await rehydrateTrustedGpraSupersessionAct(supersessionRaw, {
          treatAsAlreadyPersisted: true,
        });
        if (handoffConsumerContextId !== undefined) {
          const ctx = handoffConsumerContextId.trim();
          if (rehydrated.handoffConsumerContextId === ctx) {
            supersession = rehydrated;
          }
        } else {
          // Fail-closed for forward force when context omitted
          supersession = rehydrated;
        }
      }
      return evaluateGpraValidityFromPostureActs({
        gpraId: gpra.gpraId,
        invalidation,
        supersession,
      });
    },

    async loadForwardActiveGpraByRvaObligation(input) {
      return findForwardActiveGpraByRvaObligation(input.rvaId, input.obligationId);
    },

    async loadAuthoritativeGpraByObligationContext(input) {
      return findAuthoritativeGpraByObligationContext(
        input.obligationId,
        input.handoffConsumerContextId,
      );
    },

    async evaluateDownstreamDispositionEligibility(reviewId) {
      const review = await requireExistingReview(reviewId);
      let determination: ReviewDeterminationRecord | null = null;
      if (review.determinationId) {
        const raw = await storage.getReviewDetermination(review.determinationId);
        const byReview = await storage.getReviewDeterminationByReview(review.reviewId);
        if (
          raw &&
          byReview &&
          raw.determinationId === byReview.determinationId &&
          review.determinationId === raw.determinationId
        ) {
          determination = rehydrateReviewDetermination(raw);
        }
      }
      const withholdingRaw = await storage.getApprovalWithholdingByReview(reviewId);
      return evaluateDownstreamDispositionEligibility({
        review,
        determination,
        approvalWithholding: withholdingRaw
          ? await rehydrateTrustedApprovalWithholding(withholdingRaw)
          : null,
      });
    },

    async recordDownstreamDeficiency(input) {
      const { review, determination } = await requireLinkedConditionalOrFailDetermination(
        input.reviewId,
      );
      const existing = await storage.getDownstreamDeficiencyRecordByReview(review.reviewId);
      if (existing) {
        throw new OrchestraConstitutionalError(
          "Exactly one Downstream deficiency record may be recorded per Review",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R46"],
        );
      }
      const record = createDownstreamDeficiencyRecord({
        review,
        determination,
        deficiencyFamily: input.deficiencyFamily,
        grounds: input.grounds,
        authorityClassId: input.authorityClassId,
        recordedBy: input.recordedBy,
        evidenceBasisIds: input.evidenceBasisIds,
      });
      validatePersistedDownstreamDeficiencyRecord(record);
      try {
        await storage.putDownstreamDeficiencyRecord(record);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Downstream deficiency",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R46"],
        );
      }
      const loaded = await storage.getDownstreamDeficiencyRecord(record.deficiencyRecordId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Downstream deficiency",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R46"],
        );
      }
      return rehydrateTrustedDownstreamDeficiency(loaded);
    },

    async authorizeRework(input) {
      const { review, determination } = await requireLinkedConditionalOrFailDetermination(
        input.reviewId,
      );
      const existingWithholding = await storage.getReworkAuthorizationWithholdingByReview(
        review.reviewId,
      );
      if (existingWithholding) {
        throw new OrchestraConstitutionalError(
          "Rework authorization blocked by recorded Rework authorization withholding",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R47", "FI-DSN-STD-014-R48"],
        );
      }
      const existing = await storage.getReworkAuthorizationByReview(review.reviewId);
      if (existing) {
        throw new OrchestraConstitutionalError(
          "Exactly one Rework authorization may be recorded per Review",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R47"],
        );
      }
      const authorization = createReworkAuthorization({
        review,
        determination,
        authorityClassId: input.authorityClassId,
        authorizedBy: input.authorizedBy,
      });
      validatePersistedReworkAuthorization(authorization);
      try {
        await storage.putReworkAuthorization(authorization);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Rework authorization",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R47"],
        );
      }
      const loaded = await storage.getReworkAuthorization(authorization.reworkAuthorizationId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Rework authorization",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R47"],
        );
      }
      return rehydrateTrustedReworkAuthorization(loaded);
    },

    async withholdReworkAuthorization(input) {
      const { review, determination } = await requireLinkedConditionalOrFailDetermination(
        input.reviewId,
      );
      const existingAuth = await storage.getReworkAuthorizationByReview(review.reviewId);
      if (existingAuth) {
        throw new OrchestraConstitutionalError(
          "Cannot withhold Rework authorization after Rework authorization has been recorded",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R47", "FI-DSN-STD-014-R48"],
        );
      }
      const existing = await storage.getReworkAuthorizationWithholdingByReview(review.reviewId);
      if (existing) {
        throw new OrchestraConstitutionalError(
          "Exactly one Rework authorization withholding may be recorded per Review",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R48"],
        );
      }
      const withholding = createReworkAuthorizationWithholding({
        review,
        determination,
        authorityClassId: input.authorityClassId,
        grounds: input.grounds,
        withheldBy: input.withheldBy,
      });
      validatePersistedReworkAuthorizationWithholding(withholding);
      try {
        await storage.putReworkAuthorizationWithholding(withholding);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error
            ? error.message
            : "Failed to persist Rework authorization withholding",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R48"],
        );
      }
      const loaded = await storage.getReworkAuthorizationWithholding(withholding.withholdingId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Rework authorization withholding",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R48"],
        );
      }
      return rehydrateTrustedReworkAuthorizationWithholding(loaded);
    },

    async establishReturnPosture(input) {
      const context = await loadG7DispositionRehydrationContext(input.reviewId);
      const { review, determination } = context;
      const existing = await storage.getReturnPostureByReview(review.reviewId);
      if (existing) {
        throw new OrchestraConstitutionalError(
          "Exactly one Return posture may be recorded per Review",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R49"],
        );
      }

      let approvalWithholding: ApprovalWithholdingRecord | null = null;
      if (determination.outcome === "pass") {
        throw new OrchestraConstitutionalError(
          "Route C Return Posture after Pass plus Approval withholding is unavailable: frozen authority establishes block-without-return and does not currently enumerate exceptional return-authorizing sources",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R49"],
        );
      } else if (determination.outcome !== "conditional" && determination.outcome !== "fail") {
        throw new OrchestraConstitutionalError(
          "Return posture requires Conditional or Fail Determination",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R49"],
        );
      }

      const returnPosture = createReturnPosture({
        review,
        determination,
        authorityClassId: input.authorityClassId,
        establishedBy: input.establishedBy,
        approvalWithholding,
        targetObligationScope: input.targetObligationScope,
        returnGoverningSourceId: input.returnGoverningSourceId,
      });
      validatePersistedReturnPosture(returnPosture);
      try {
        await storage.putReturnPosture(returnPosture);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Return posture",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R49"],
        );
      }
      const loaded = await storage.getReturnPosture(returnPosture.returnPostureId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Return posture",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R49"],
        );
      }
      return rehydrateTrustedReturnPosture(loaded);
    },

    async authorizeResubmissionEligibility(input) {
      const { review, determination } = await requireLinkedConditionalOrFailDetermination(
        input.reviewId,
      );
      const existing = await storage.getResubmissionEligibilityByPriorReview(review.reviewId);
      if (existing) {
        throw new OrchestraConstitutionalError(
          "Exactly one Resubmission eligibility may be authorized per prior Review",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R51"],
        );
      }
      const eligibility = createResubmissionEligibility({
        review,
        determination,
        authorityClassId: input.authorityClassId,
        authorizedBy: input.authorizedBy,
      });
      validatePersistedResubmissionEligibility(eligibility);
      try {
        await storage.putResubmissionEligibility(eligibility);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Resubmission eligibility",
          "invalid_downstream_disposition",
          ["FI-DSN-STD-014-R51"],
        );
      }
      const loaded = await storage.getResubmissionEligibility(eligibility.eligibilityId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Resubmission eligibility",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R51"],
        );
      }
      return rehydrateTrustedResubmissionEligibility(loaded);
    },

    async loadDownstreamDeficiencyRecord(deficiencyRecordId) {
      const loaded = await storage.getDownstreamDeficiencyRecord(deficiencyRecordId);
      if (!loaded) return null;
      return rehydrateTrustedDownstreamDeficiency(loaded);
    },

    async loadDownstreamDeficiencyRecordByReview(reviewId) {
      const loaded = await storage.getDownstreamDeficiencyRecordByReview(reviewId);
      if (!loaded) return null;
      return rehydrateTrustedDownstreamDeficiency(loaded);
    },

    async loadReworkAuthorization(reworkAuthorizationId) {
      const loaded = await storage.getReworkAuthorization(reworkAuthorizationId);
      if (!loaded) return null;
      return rehydrateTrustedReworkAuthorization(loaded);
    },

    async loadReworkAuthorizationByReview(reviewId) {
      const loaded = await storage.getReworkAuthorizationByReview(reviewId);
      if (!loaded) return null;
      return rehydrateTrustedReworkAuthorization(loaded);
    },

    async loadReworkAuthorizationWithholding(withholdingId) {
      const loaded = await storage.getReworkAuthorizationWithholding(withholdingId);
      if (!loaded) return null;
      return rehydrateTrustedReworkAuthorizationWithholding(loaded);
    },

    async loadReworkAuthorizationWithholdingByReview(reviewId) {
      const loaded = await storage.getReworkAuthorizationWithholdingByReview(reviewId);
      if (!loaded) return null;
      return rehydrateTrustedReworkAuthorizationWithholding(loaded);
    },

    async loadReturnPosture(returnPostureId) {
      const loaded = await storage.getReturnPosture(returnPostureId);
      if (!loaded) return null;
      return rehydrateTrustedReturnPosture(loaded);
    },

    async loadReturnPostureByReview(reviewId) {
      const loaded = await storage.getReturnPostureByReview(reviewId);
      if (!loaded) return null;
      return rehydrateTrustedReturnPosture(loaded);
    },

    async loadResubmissionEligibility(eligibilityId) {
      const loaded = await storage.getResubmissionEligibility(eligibilityId);
      if (!loaded) return null;
      return rehydrateTrustedResubmissionEligibility(loaded);
    },

    async loadResubmissionEligibilityByPriorReview(priorReviewId) {
      const loaded = await storage.getResubmissionEligibilityByPriorReview(priorReviewId);
      if (!loaded) return null;
      return rehydrateTrustedResubmissionEligibility(loaded);
    },

    async recordDomain3BrainAdvisory(input) {
      let programId = input.programId;
      let obligationId = input.obligationId;
      let rvaId = input.rvaId;
      let review: ProductionReadinessReview | null = null;
      let determination: ReviewDeterminationRecord | null = null;
      let gpra: GpraGrantRecord | null = null;

      if (input.reviewId) {
        review = await requireExistingReview(input.reviewId);
        programId = programId ?? review.programId;
        obligationId = obligationId ?? review.obligationId;
        rvaId = rvaId ?? review.rvaId;
        if (
          review.programId !== programId ||
          review.obligationId !== obligationId ||
          review.rvaId !== rvaId
        ) {
          throw new OrchestraConstitutionalError(
            "Brain advisory Program/Obligation/RVA must match Review lineage",
            "invalid_domain3_brain_advisory",
            ["FI-DSN-STD-014-R78"],
          );
        }

        if (input.determinationId) {
          const determinationRaw = await storage.getReviewDetermination(input.determinationId);
          if (!determinationRaw) {
            throw new OrchestraConstitutionalError(
              "Brain advisory determinationId not found",
              "invalid_domain3_brain_advisory",
              ["FI-DSN-STD-014-R78"],
            );
          }
          determination = rehydrateReviewDetermination(determinationRaw);
          if (determination.reviewId !== review.reviewId) {
            throw new OrchestraConstitutionalError(
              "Brain advisory Determination does not belong to Review",
              "invalid_domain3_brain_advisory",
              ["FI-DSN-STD-014-R78"],
            );
          }
        }

        if (input.gpraId) {
          const gpraRaw = await storage.getGpraGrant(input.gpraId);
          if (!gpraRaw) {
            throw new OrchestraConstitutionalError(
              "Brain advisory gpraId not found",
              "invalid_domain3_brain_advisory",
              ["FI-DSN-STD-014-R78"],
            );
          }
          gpra = await rehydrateTrustedGpraGrant(gpraRaw);
          if (gpra.reviewId !== review.reviewId) {
            throw new OrchestraConstitutionalError(
              "Brain advisory GPRA does not belong to Review",
              "invalid_domain3_brain_advisory",
              ["FI-DSN-STD-014-R78"],
            );
          }
        }
      }

      if (!programId || !obligationId || !rvaId) {
        throw new OrchestraConstitutionalError(
          "Brain advisory requires programId, obligationId, and rvaId (or reviewId lineage)",
          "invalid_domain3_brain_advisory",
          ["FI-DSN-STD-014-R78"],
        );
      }

      const createInput: CreateDomain3BrainAdvisoryInput = {
        sourceAttribution: input.sourceAttribution,
        brainRuntimeVersion: input.brainRuntimeVersion,
        decisionStage: input.decisionStage,
        outputClass: input.outputClass,
        programId,
        obligationId,
        rvaId,
        reviewId: input.reviewId ?? null,
        evidenceIds: input.evidenceIds,
        determinationId: input.determinationId ?? null,
        gpraId: input.gpraId ?? null,
        postureState: input.postureState ?? null,
        advisoryContent: input.advisoryContent,
        reevaluationRequestType: input.reevaluationRequestType ?? null,
        routesToAuthorityKind: input.routesToAuthorityKind ?? null,
        eventTime: input.eventTime,
        createdBy: input.createdBy,
        overridesConstitutionalRecord: input.overridesConstitutionalRecord,
        claimsConstitutionalAuthority: input.claimsConstitutionalAuthority,
        emulatesConstitutionalAct: input.emulatesConstitutionalAct,
        constitutionalActKind: input.constitutionalActKind,
        handoffActId: input.handoffActId,
        handoffAuthorized: input.handoffAuthorized,
        executesHandoff: input.executesHandoff,
      };

      const advisory = createDomain3BrainAdvisoryRecord(createInput);
      validatePersistedDomain3BrainAdvisory(advisory);
      try {
        await storage.putDomain3BrainAdvisory(advisory);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Domain 3 Brain advisory",
          "invalid_domain3_brain_advisory",
          ["FI-DSN-STD-014-R78", "FI-DSN-STD-014-R81"],
        );
      }
      const loaded = await storage.getDomain3BrainAdvisory(advisory.advisoryId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Domain 3 Brain advisory",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R78"],
        );
      }
      return rehydrateDomain3BrainAdvisory(loaded, { review, determination, gpra });
    },

    async loadDomain3BrainAdvisory(advisoryId) {
      const loaded = await storage.getDomain3BrainAdvisory(advisoryId);
      if (!loaded) return null;
      return rehydrateTrustedBrainAdvisory(loaded);
    },

    async listDomain3BrainAdvisoriesByReview(reviewId) {
      const listed = await storage.listDomain3BrainAdvisoriesByReview(reviewId);
      const out: Domain3BrainAdvisoryRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedBrainAdvisory(item));
      }
      return out;
    },

    async evaluateGovernedHandoffEligibility(input) {
      assertNoHandoffExecutionOrAuthorityClaims(input as unknown as Record<string, unknown>);
      if (input.preparedBy !== undefined || input.sourceAttribution !== undefined) {
        assertGovernedPreparationActor({
          preparedBy: input.preparedBy ?? "eligibility-evaluator",
          sourceAttribution: input.sourceAttribution,
          authorityClassId: input.authorityClassId,
          handoffAuthorityClassId: input.handoffAuthorityClassId,
        });
      } else if (input.authorityClassId != null || input.handoffAuthorityClassId != null) {
        assertGovernedPreparationActor({
          preparedBy: "eligibility-evaluator",
          authorityClassId: input.authorityClassId,
          handoffAuthorityClassId: input.handoffAuthorityClassId,
        });
      }
      return assessHandoffEligibilityInternal(input);
    },

    async prepareGovernedHandoff(input) {
      assertNoHandoffExecutionOrAuthorityClaims(input as unknown as Record<string, unknown>);
      const preparedBy = assertGovernedPreparationActor(input);
      assertHandoffConsumerCategoryKeys(input.consumerCategoryKeys);

      const assessment = await assessHandoffEligibilityInternal({
        obligationId: input.obligationId,
        handoffConsumerContextId: input.handoffConsumerContextId,
        consumerCategoryKeys: input.consumerCategoryKeys,
        brainAdvisoryIds: input.brainAdvisoryIds,
        dispositionRecordIds: input.dispositionRecordIds,
      });

      if (assessment.eligibilityLayerCondition !== "export_ready") {
        throw new OrchestraConstitutionalError(
          `Governed Handoff preparation rejected: eligibility is ${assessment.eligibilityLayerCondition} (requires export_ready)`,
          "invalid_handoff_preparation",
          ["FI-DSN-STD-014-R85", "FI-DSN-STD-014-R90", "FI-DSN-STD-014-R91"],
        );
      }
      if (!assessment.gpraId || !assessment.validityExport || !assessment.evidencePackage) {
        throw new OrchestraConstitutionalError(
          "export_ready assessment missing GPRA / validity export / evidence package",
          "invalid_handoff_preparation",
          ["FI-DSN-STD-014-R87", "FI-DSN-STD-014-R88"],
        );
      }

      const gpraRaw = await storage.getGpraGrant(assessment.gpraId);
      if (!gpraRaw) {
        throw new OrchestraConstitutionalError(
          "Authoritative GPRA for Handoff preparation not found",
          "invalid_handoff_preparation",
          ["FI-DSN-STD-014-R85", "FI-DSN-STD-014-R88"],
        );
      }
      const gpra = await rehydrateTrustedGpraGrant(gpraRaw);

      const preparation = createGovernedHandoffPreparationRecord({
        gpra,
        reviewId: gpra.reviewId,
        determinationId: gpra.determinationId,
        approvalActId: gpra.approvalActId,
        rvaId: gpra.rvaId,
        programId: gpra.programId,
        obligationId: gpra.obligationId,
        handoffConsumerContextId: input.handoffConsumerContextId,
        consumerCategoryKeys: input.consumerCategoryKeys,
        validityExport: assessment.validityExport,
        evidencePackage: assessment.evidencePackage,
        brainAdvisoryIds: assessment.evidencePackage.brainAdvisoryIds,
        preparedBy,
        sourceAttribution: input.sourceAttribution,
        authorityClassId: input.authorityClassId,
        handoffAuthorityClassId: input.handoffAuthorityClassId,
        handoffActId: input.handoffActId,
        handoffAuthorized: input.handoffAuthorized,
        executesHandoff: input.executesHandoff,
        handoffAuthorization: input.handoffAuthorization,
        performHandoff: input.performHandoff,
        handoffExecuted: input.handoffExecuted,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
      });

      validatePersistedGovernedHandoffPreparation(preparation);
      try {
        await storage.putGovernedHandoffPreparation(preparation);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error
            ? error.message
            : "Failed to persist Governed Handoff preparation",
          "invalid_handoff_preparation",
          ["FI-DSN-STD-014-R94"],
        );
      }
      const loaded = await storage.getGovernedHandoffPreparation(preparation.preparationId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff preparation",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R94"],
        );
      }
      return rehydrateTrustedHandoffPreparation(loaded);
    },

    async loadGovernedHandoffPreparation(preparationId) {
      const loaded = await storage.getGovernedHandoffPreparation(preparationId);
      if (!loaded) return null;
      return rehydrateTrustedHandoffPreparation(loaded);
    },

    async listGovernedHandoffPreparationsByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffPreparationsByGpra(gpraId);
      const out: GovernedHandoffPreparationRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffPreparation(item));
      }
      return out.sort((a, b) => a.preparedAt.localeCompare(b.preparedAt));
    },

    async evaluateHandoffPreparationCurrency(preparationId) {
      const preparation = await this.loadGovernedHandoffPreparation(preparationId);
      if (!preparation) {
        throw new OrchestraConstitutionalError(
          "Handoff preparation not found for currency evaluation",
          "invalid_handoff_preparation",
          ["FI-DSN-STD-014-R88"],
        );
      }
      return evaluateHandoffPreparationCurrencyInternal(preparation);
    },

    async evaluateGovernedHandoffEntry(input) {
      assertNoHandoffEntryExecutionOrAuthorityClaims(input as unknown as Record<string, unknown>);
      if (
        input.sourceAttribution !== undefined ||
        input.authorityClassId != null ||
        input.handoffAuthorityClassId != null
      ) {
        assertGovernedEntryActor({
          enteredBy: "entry-evaluator",
          sourceAttribution: input.sourceAttribution,
          authorityClassId: input.authorityClassId,
          handoffAuthorityClassId: input.handoffAuthorityClassId,
        });
      }
      const { assessment } = await assessHandoffEntryInternal(input.preparationId);
      return assessment;
    },

    async admitGovernedHandoffEntry(input) {
      assertNoHandoffEntryExecutionOrAuthorityClaims(input as unknown as Record<string, unknown>);
      const enteredBy = assertGovernedEntryActor(input);
      const { assessment, preparation } = await assessHandoffEntryInternal(input.preparationId);

      if (!assessment.mayCommence || !preparation) {
        throw new OrchestraConstitutionalError(
          `Governed Handoff entry rejected: ${assessment.reasons.join("; ") || "mayCommence is false"}`,
          "invalid_handoff_entry",
          ["FI-DSN-STD-015-R07"],
        );
      }

      const entry = createGovernedHandoffEntryRecord({
        preparation,
        enteredBy,
        sourceAttribution: input.sourceAttribution,
        authorityClassId: input.authorityClassId,
        handoffAuthorityClassId: input.handoffAuthorityClassId,
        handoffActId: input.handoffActId,
        handoffAuthorized: input.handoffAuthorized,
        executesHandoff: input.executesHandoff,
        handoffAuthorization: input.handoffAuthorization,
        performHandoff: input.performHandoff,
        handoffExecuted: input.handoffExecuted,
        handoffPosture: input.handoffPosture,
        handoffAuthorizationActId: input.handoffAuthorizationActId,
        postureDeclarationActId: input.postureDeclarationActId,
        hoemEvidenceId: input.hoemEvidenceId,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        consumerCategoryKeys: input.consumerCategoryKeys,
      });

      validatePersistedGovernedHandoffEntry(entry);
      try {
        await storage.putGovernedHandoffEntry(entry);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Governed Handoff entry",
          "invalid_handoff_entry",
          ["FI-DSN-STD-015-R07"],
        );
      }
      const loaded = await storage.getGovernedHandoffEntry(entry.entryId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff entry",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R07"],
        );
      }
      return rehydrateTrustedHandoffEntry(loaded);
    },

    async loadGovernedHandoffEntry(entryId) {
      const loaded = await storage.getGovernedHandoffEntry(entryId);
      if (!loaded) return null;
      return rehydrateTrustedHandoffEntry(loaded);
    },

    async listGovernedHandoffEntriesByPreparation(preparationId) {
      const listed = await storage.listGovernedHandoffEntriesByPreparation(preparationId);
      const out: GovernedHandoffEntryRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffEntry(item));
      }
      return out.sort((a, b) => a.enteredAt.localeCompare(b.enteredAt));
    },

    async listGovernedHandoffEntriesByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffEntriesByGpra(gpraId);
      const out: GovernedHandoffEntryRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffEntry(item));
      }
      return out.sort((a, b) => a.enteredAt.localeCompare(b.enteredAt));
    },

    async evaluateHandoffEntryCurrency(entryId) {
      const entry = await this.loadGovernedHandoffEntry(entryId);
      if (!entry) {
        throw new OrchestraConstitutionalError(
          "Handoff entry not found for currency evaluation",
          "invalid_handoff_entry",
          ["FI-DSN-STD-015-R07"],
        );
      }
      const preparation = await this.loadGovernedHandoffPreparation(entry.preparationId);
      if (!preparation) {
        return "stale";
      }
      const currentPreparationCurrency =
        await evaluateHandoffPreparationCurrencyInternal(preparation);
      return evaluateHandoffEntryCurrencyFromFacts({
        entry,
        currentPreparationCurrency,
      });
    },

    async evaluateGovernedHandoffEvidenceConsumption(input) {
      assertNoHandoffEvidenceConsumptionExecutionOrActClaims(
        input as unknown as Record<string, unknown>,
      );
      if (
        input.sourceAttribution !== undefined ||
        input.authorityClassId != null ||
        input.handoffAuthorityClassId != null
      ) {
        assertGovernedEvidenceConsumptionActor({
          consumedBy: "consumption-evaluator",
          sourceAttribution: input.sourceAttribution,
          authorityClassId: input.authorityClassId,
          handoffAuthorityClassId: input.handoffAuthorityClassId,
        });
      }
      if (input.brainAdvisoryIds?.length) {
        await resolveBrainAdvisoriesForHandoff(input.brainAdvisoryIds);
      }
      const { assessment } = await assessHandoffEvidenceConsumptionInternal(input.entryId);
      return assessment;
    },

    async recordGovernedHandoffEvidenceConsumption(input) {
      assertNoHandoffEvidenceConsumptionExecutionOrActClaims(
        input as unknown as Record<string, unknown>,
      );
      const consumedBy = assertGovernedEvidenceConsumptionActor(input);
      const brainAdvisoryIds = await resolveBrainAdvisoriesForHandoff(input.brainAdvisoryIds);
      const { assessment, entry, preparation } = await assessHandoffEvidenceConsumptionInternal(
        input.entryId,
      );

      if (!assessment.mayConsume || !entry || !preparation) {
        throw new OrchestraConstitutionalError(
          `Governed Handoff evidence consumption rejected: ${assessment.reasons.join("; ") || "mayConsume is false"}`,
          "invalid_handoff_evidence_consumption",
          ["FI-DSN-STD-015-R14", "FI-DSN-STD-015-R15"],
        );
      }

      const consumption = createGovernedHandoffEvidenceConsumptionRecord({
        entry,
        preparation,
        consumedBy,
        brainAdvisoryIds,
        sourceAttribution: input.sourceAttribution,
        authorityClassId: input.authorityClassId,
        handoffAuthorityClassId: input.handoffAuthorityClassId,
        handoffActId: input.handoffActId,
        handoffAuthorized: input.handoffAuthorized,
        executesHandoff: input.executesHandoff,
        handoffAuthorization: input.handoffAuthorization,
        performHandoff: input.performHandoff,
        handoffExecuted: input.handoffExecuted,
        handoffPosture: input.handoffPosture,
        handoffAuthorizationActId: input.handoffAuthorizationActId,
        postureDeclarationActId: input.postureDeclarationActId,
        completionActId: input.completionActId,
        suspensionActId: input.suspensionActId,
        recallActId: input.recallActId,
        withdrawalActId: input.withdrawalActId,
        hoemEvidenceId: input.hoemEvidenceId,
        hoemOperativeEvidenceId: input.hoemOperativeEvidenceId,
        hoemOperativeActRecords: input.hoemOperativeActRecords,
        hoemActInstances: input.hoemActInstances,
        preservationActId: input.preservationActId,
        hofG10PreservationActId: input.hofG10PreservationActId,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        executionQueueId: input.executionQueueId,
        constitutionalQueueId: input.constitutionalQueueId,
        unknownEvidenceModel: input.unknownEvidenceModel,
        evidenceModels: input.evidenceModels,
        consumerCategoryKeys: input.consumerCategoryKeys,
      });

      validatePersistedGovernedHandoffEvidenceConsumption(consumption);
      try {
        await storage.putGovernedHandoffEvidenceConsumption(consumption);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error
            ? error.message
            : "Failed to persist Governed Handoff evidence consumption",
          "invalid_handoff_evidence_consumption",
          ["FI-DSN-STD-015-R15"],
        );
      }
      const loaded = await storage.getGovernedHandoffEvidenceConsumption(consumption.consumptionId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff evidence consumption",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R15"],
        );
      }
      return rehydrateTrustedHandoffEvidenceConsumption(loaded);
    },

    async loadGovernedHandoffEvidenceConsumption(consumptionId) {
      const loaded = await storage.getGovernedHandoffEvidenceConsumption(consumptionId);
      if (!loaded) return null;
      return rehydrateTrustedHandoffEvidenceConsumption(loaded);
    },

    async listGovernedHandoffEvidenceConsumptionsByEntry(entryId) {
      const listed = await storage.listGovernedHandoffEvidenceConsumptionsByEntry(entryId);
      const out: GovernedHandoffEvidenceConsumptionRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffEvidenceConsumption(item));
      }
      return out.sort((a, b) => a.consumedAt.localeCompare(b.consumedAt));
    },

    async listGovernedHandoffEvidenceConsumptionsByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffEvidenceConsumptionsByGpra(gpraId);
      const out: GovernedHandoffEvidenceConsumptionRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffEvidenceConsumption(item));
      }
      return out.sort((a, b) => a.consumedAt.localeCompare(b.consumedAt));
    },

    async evaluateHandoffEvidenceConsumptionCurrency(consumptionId) {
      const consumption = await this.loadGovernedHandoffEvidenceConsumption(consumptionId);
      if (!consumption) {
        throw new OrchestraConstitutionalError(
          "Handoff evidence consumption not found for currency evaluation",
          "invalid_handoff_evidence_consumption",
          ["FI-DSN-STD-015-R14"],
        );
      }
      let currentEntryCurrency: HandoffEntryCurrency;
      try {
        currentEntryCurrency = await this.evaluateHandoffEntryCurrency(consumption.entryId);
      } catch {
        currentEntryCurrency = "stale";
      }
      const preparation = await this.loadGovernedHandoffPreparation(consumption.preparationId);
      const currentPreparationCurrency = preparation
        ? await evaluateHandoffPreparationCurrencyInternal(preparation)
        : ("stale" as const);
      return evaluateHandoffEvidenceConsumptionCurrencyFromFacts({
        consumption,
        currentEntryCurrency,
        currentPreparationCurrency,
      });
    },

    async recordGovernedHandoffPreservationAudit(input) {
      assertNoHandoffPreservationAuditActOrErasureClaims(
        input as unknown as Record<string, unknown>,
      );
      const preservedBy = assertGovernedPreservationAuditActor(input);

      const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
      if (!entryRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff preservation audit rejected: entry not found",
          "invalid_handoff_preservation_audit",
          ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R19"],
        );
      }
      const entry = await rehydrateTrustedHandoffEntry(entryRaw);

      const consumptionRaw = await storage.getGovernedHandoffEvidenceConsumption(
        input.evidenceConsumptionId,
      );
      if (!consumptionRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff preservation audit rejected: evidence consumption not found",
          "invalid_handoff_preservation_audit",
          ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
        );
      }
      const consumption = await rehydrateTrustedHandoffEvidenceConsumption(consumptionRaw);

      if (consumption.entryId !== entry.entryId) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff preservation audit rejected: evidence consumption does not belong to entry",
          "invalid_handoff_preservation_audit",
          ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
        );
      }

      const audit = createGovernedHandoffPreservationAuditRecord({
        entry,
        consumption,
        preservedBy,
        sourceAttribution: input.sourceAttribution,
        authorityClassId: input.authorityClassId,
        handoffAuthorityClassId: input.handoffAuthorityClassId,
        preservationAuthorityClassId: input.preservationAuthorityClassId,
        handoffActId: input.handoffActId,
        handoffAuthorized: input.handoffAuthorized,
        executesHandoff: input.executesHandoff,
        handoffAuthorization: input.handoffAuthorization,
        performHandoff: input.performHandoff,
        handoffExecuted: input.handoffExecuted,
        handoffPosture: input.handoffPosture,
        handoffAuthorizationActId: input.handoffAuthorizationActId,
        postureDeclarationActId: input.postureDeclarationActId,
        completionActId: input.completionActId,
        suspensionActId: input.suspensionActId,
        recallActId: input.recallActId,
        withdrawalActId: input.withdrawalActId,
        hoemEvidenceId: input.hoemEvidenceId,
        hoemOperativeEvidenceId: input.hoemOperativeEvidenceId,
        hoemOperativeActRecords: input.hoemOperativeActRecords,
        hoemActInstances: input.hoemActInstances,
        eraseUpstreamHistory: input.eraseUpstreamHistory,
        redactUpstreamHistory: input.redactUpstreamHistory,
        overwriteUpstreamHistory: input.overwriteUpstreamHistory,
        mergeUpstreamHistory: input.mergeUpstreamHistory,
        substituteUpstreamHistory: input.substituteUpstreamHistory,
        collapsePreparationHistory: input.collapsePreparationHistory,
        restoreConstitutionalForce: input.restoreConstitutionalForce,
        restoresAuthority: input.restoresAuthority,
        brainAuthorizesHandoff: input.brainAuthorizesHandoff,
        brainHandoffAuthorization: input.brainHandoffAuthorization,
        brainAuthorizeHandoff: input.brainAuthorizeHandoff,
        r22BrainAuthorizeHandoff: input.r22BrainAuthorizeHandoff,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        executionQueueId: input.executionQueueId,
        constitutionalQueueId: input.constitutionalQueueId,
        consumerCategoryKeys: input.consumerCategoryKeys,
      });

      validatePersistedGovernedHandoffPreservationAudit(audit);
      try {
        await storage.putGovernedHandoffPreservationAudit(audit);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error
            ? error.message
            : "Failed to persist Governed Handoff preservation audit",
          "invalid_handoff_preservation_audit",
          ["FI-DSN-STD-015-R20"],
        );
      }
      const loaded = await storage.getGovernedHandoffPreservationAudit(audit.preservationAuditId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff preservation audit",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R20"],
        );
      }
      return rehydrateTrustedHandoffPreservationAudit(loaded);
    },

    async loadGovernedHandoffPreservationAudit(preservationAuditId) {
      const loaded = await storage.getGovernedHandoffPreservationAudit(preservationAuditId);
      if (!loaded) return null;
      return rehydrateTrustedHandoffPreservationAudit(loaded);
    },

    async listGovernedHandoffPreservationAuditsByEntry(entryId) {
      const listed = await storage.listGovernedHandoffPreservationAuditsByEntry(entryId);
      const out: GovernedHandoffPreservationAuditRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffPreservationAudit(item));
      }
      return out.sort((a, b) => a.preservedAt.localeCompare(b.preservedAt));
    },

    async listGovernedHandoffPreservationAuditsByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffPreservationAuditsByGpra(gpraId);
      const out: GovernedHandoffPreservationAuditRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffPreservationAudit(item));
      }
      return out.sort((a, b) => a.preservedAt.localeCompare(b.preservedAt));
    },

    async evaluateHandoffPreservationAuditAuthorityEffect(preservationAuditId) {
      const audit = await this.loadGovernedHandoffPreservationAudit(preservationAuditId);
      if (!audit) {
        throw new OrchestraConstitutionalError(
          "Handoff preservation audit not found for authority-effect evaluation",
          "invalid_handoff_preservation_audit",
          ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R19"],
        );
      }
      return evaluateHandoffPreservationAuditAuthorityEffectFromFacts({ audit });
    },

    async evaluateHandoffPreservationAuditLinkedCurrency(preservationAuditId) {
      const audit = await this.loadGovernedHandoffPreservationAudit(preservationAuditId);
      if (!audit) {
        throw new OrchestraConstitutionalError(
          "Handoff preservation audit not found for linked-currency evaluation",
          "invalid_handoff_preservation_audit",
          ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R19"],
        );
      }
      let entryCurrency: HandoffEntryCurrency;
      try {
        entryCurrency = await this.evaluateHandoffEntryCurrency(audit.entryId);
      } catch {
        entryCurrency = "stale";
      }
      let consumptionCurrency: HandoffEvidenceConsumptionCurrency;
      try {
        consumptionCurrency = await this.evaluateHandoffEvidenceConsumptionCurrency(
          audit.evidenceConsumptionId,
        );
      } catch {
        consumptionCurrency = "stale";
      }
      return evaluateHandoffPreservationAuditLinkedCurrencyFromFacts({
        audit,
        entryCurrency,
        consumptionCurrency,
      });
    },

    async evaluateGovernedHandoffAuthorization(input) {
      assertNoHandoffAuthorizationPostureOrExecutionClaims(
        input as unknown as Record<string, unknown>,
      );
      if (input.authorityClassId != null) {
        assertEstablishedHandoffGovernanceAuthorityClass(input.authorityClassId);
      }
      if (
        input.sourceAttribution !== undefined ||
        input.authorityClassId != null
      ) {
        assertGovernedHandoffAuthorizationActor({
          authorizedBy: "authorization-evaluator",
          authorityClassId: input.authorityClassId ?? "handoff_governance_authority",
          sourceAttribution: input.sourceAttribution,
        });
      }
      const { assessment } = await assessHandoffAuthorizationInternal(input);
      return assessment;
    },

    async authorizeGovernedHandoff(input) {
      assertNoHandoffAuthorizationPostureOrExecutionClaims(
        input as unknown as Record<string, unknown>,
      );
      const authorizedBy = assertGovernedHandoffAuthorizationActor(input);

      const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
      if (!entryRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff authorization rejected: entry not found",
          "invalid_handoff_authorization",
          ["FI-DSN-STD-015-R31"],
        );
      }
      const entry = await rehydrateTrustedHandoffEntry(entryRaw);

      const consumptionRaw = await storage.getGovernedHandoffEvidenceConsumption(
        input.evidenceConsumptionId,
      );
      if (!consumptionRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff authorization rejected: evidence consumption not found",
          "invalid_handoff_authorization",
          ["FI-DSN-STD-015-R31"],
        );
      }
      const consumption = await rehydrateTrustedHandoffEvidenceConsumption(consumptionRaw);

      if (consumption.entryId !== entry.entryId) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff authorization rejected: evidence consumption does not belong to entry",
          "invalid_handoff_authorization",
          ["FI-DSN-STD-015-R31"],
        );
      }

      const { assessment, preparation } = await assessHandoffAuthorizationInternal(input);

      if (!assessment.mayAuthorize || !preparation) {
        throw new OrchestraConstitutionalError(
          `Governed Handoff authorization rejected: ${assessment.denialReasons.join("; ") || "mayAuthorize is false"}`,
          "invalid_handoff_authorization",
          ["FI-DSN-STD-015-R31", "FI-DSN-STD-015-R32"],
        );
      }

      const act = createGovernedHandoffAuthorizationActRecord({
        entry,
        consumption,
        consumerClassId: input.consumerClassId,
        authorityClassId: input.authorityClassId,
        authorizedBy,
        authorizedAt: input.authorizedAt,
        sourceAttribution: input.sourceAttribution,
        handoffPosture: input.handoffPosture,
        postureDeclarationActId: input.postureDeclarationActId,
        completionActId: input.completionActId,
        suspensionActId: input.suspensionActId,
        recallActId: input.recallActId,
        withdrawalActId: input.withdrawalActId,
        executesHandoff: input.executesHandoff,
        handoffExecuted: input.handoffExecuted,
        performHandoff: input.performHandoff,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        executionQueueId: input.executionQueueId,
        constitutionalQueueId: input.constitutionalQueueId,
        brainAuthorizesHandoff: input.brainAuthorizesHandoff,
        brainAuthorizeHandoff: input.brainAuthorizeHandoff,
        brainHandoffAuthorization: input.brainHandoffAuthorization,
        implicitAuthorization: input.implicitAuthorization,
        automaticInheritanceAuthorization: input.automaticInheritanceAuthorization,
        inferredEligibilityAuthorization: input.inferredEligibilityAuthorization,
        configurationDrivenAuthorization: input.configurationDrivenAuthorization,
      });

      validatePersistedGovernedHandoffAuthorization(act);
      try {
        await storage.putGovernedHandoffAuthorizationAct(act);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error
            ? error.message
            : "Failed to persist Governed Handoff authorization act",
          "invalid_handoff_authorization",
          ["FI-DSN-STD-015-R25"],
        );
      }
      const loaded = await storage.getGovernedHandoffAuthorizationAct(act.authorizationActId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff authorization act",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R25"],
        );
      }
      return rehydrateTrustedHandoffAuthorization(loaded);
    },

    async loadGovernedHandoffAuthorizationAct(authorizationActId) {
      const loaded = await storage.getGovernedHandoffAuthorizationAct(authorizationActId);
      if (!loaded) return null;
      return rehydrateTrustedHandoffAuthorization(loaded);
    },

    async listGovernedHandoffAuthorizationActsByEntry(entryId) {
      const listed = await storage.listGovernedHandoffAuthorizationActsByEntry(entryId);
      const out: GovernedHandoffAuthorizationActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffAuthorization(item));
      }
      return out.sort((a, b) => a.authorizedAt.localeCompare(b.authorizedAt));
    },

    async listGovernedHandoffAuthorizationActsByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffAuthorizationActsByGpra(gpraId);
      const out: GovernedHandoffAuthorizationActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffAuthorization(item));
      }
      return out.sort((a, b) => a.authorizedAt.localeCompare(b.authorizedAt));
    },

    async evaluateHandoffAuthorizationCurrency(authorizationActId) {
      const act = await this.loadGovernedHandoffAuthorizationAct(authorizationActId);
      if (!act) {
        throw new OrchestraConstitutionalError(
          "Handoff authorization act not found for currency evaluation",
          "invalid_handoff_authorization",
          ["FI-DSN-STD-015-R31"],
        );
      }
      let entryCurrency: HandoffEntryCurrency;
      try {
        entryCurrency = await this.evaluateHandoffEntryCurrency(act.entryId);
      } catch {
        entryCurrency = "stale";
      }
      let consumptionCurrency: HandoffEvidenceConsumptionCurrency;
      try {
        consumptionCurrency = await this.evaluateHandoffEvidenceConsumptionCurrency(
          act.evidenceConsumptionId,
        );
      } catch {
        consumptionCurrency = "stale";
      }
      return entryCurrency === "current" && consumptionCurrency === "current"
        ? "current"
        : "stale";
    },

    async evaluateGovernedHandoffConsumerBinding(input) {
      assertNoHandoffConsumerBindingPostureOrExecutionClaims(
        input as unknown as Record<string, unknown>,
      );
      if (input.boundBy != null || input.authorityClassId != null || input.sourceAttribution != null) {
        assertGovernedHandoffConsumerBindingActor({
          boundBy: input.boundBy ?? "binding-evaluator",
          authorityClassId: input.authorityClassId,
          sourceAttribution: input.sourceAttribution,
        });
      }
      const { assessment } = await assessHandoffConsumerBindingInternal(input);
      return assessment;
    },

    async bindHccmConsumerClass(input) {
      assertNoHandoffConsumerBindingPostureOrExecutionClaims(
        input as unknown as Record<string, unknown>,
      );
      const boundBy = assertGovernedHandoffConsumerBindingActor(input);

      const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
      if (!entryRaw) {
        throw new OrchestraConstitutionalError(
          "HCCM consumer binding rejected: entry not found",
          "invalid_handoff_consumer_binding",
          ["FI-DSN-STD-015-R39"],
        );
      }
      const entry = await rehydrateTrustedHandoffEntry(entryRaw);

      const { assessment, preparation } = await assessHandoffConsumerBindingInternal(input);

      if (!assessment.mayBind || !preparation) {
        throw new OrchestraConstitutionalError(
          `HCCM consumer binding rejected: ${assessment.denialReasons.join("; ") || "mayBind is false"}`,
          "invalid_handoff_consumer_binding",
          ["FI-DSN-STD-015-R39"],
        );
      }

      const binding = createGovernedHandoffConsumerBindingRecord({
        entry,
        consumerClassId: input.consumerClassId,
        boundBy,
        boundAt: input.boundAt,
        authorityClassId: input.authorityClassId,
        sourceAttribution: input.sourceAttribution,
        handoffPosture: input.handoffPosture,
        postureDeclarationActId: input.postureDeclarationActId,
        completionActId: input.completionActId,
        executesHandoff: input.executesHandoff,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        authorizationActId: input.authorizationActId,
        handoffAuthorizationActId: input.handoffAuthorizationActId,
        downstreamAcceptanceId: input.downstreamAcceptanceId,
        permanentCollectionMembershipId: input.permanentCollectionMembershipId,
        brainBindsConsumerClass: input.brainBindsConsumerClass,
        implicitBinding: input.implicitBinding,
      });

      validatePersistedGovernedHandoffConsumerBinding(binding);
      try {
        await storage.putGovernedHandoffConsumerBinding(binding);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error
            ? error.message
            : "Failed to persist HCCM consumer binding",
          "invalid_handoff_consumer_binding",
          ["FI-DSN-STD-015-R33"],
        );
      }
      const loaded = await storage.getGovernedHandoffConsumerBinding(binding.bindingId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist HCCM consumer binding",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R33"],
        );
      }
      return rehydrateTrustedHandoffConsumerBinding(loaded);
    },

    async loadGovernedHandoffConsumerBinding(bindingId) {
      const loaded = await storage.getGovernedHandoffConsumerBinding(bindingId);
      if (!loaded) return null;
      return rehydrateTrustedHandoffConsumerBinding(loaded);
    },

    async listGovernedHandoffConsumerBindingsByEntry(entryId) {
      const listed = await storage.listGovernedHandoffConsumerBindingsByEntry(entryId);
      const out: GovernedHandoffConsumerBindingRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffConsumerBinding(item));
      }
      return out.sort((a, b) => a.boundAt.localeCompare(b.boundAt));
    },

    async listGovernedHandoffConsumerBindingsByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffConsumerBindingsByGpra(gpraId);
      const out: GovernedHandoffConsumerBindingRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffConsumerBinding(item));
      }
      return out.sort((a, b) => a.boundAt.localeCompare(b.boundAt));
    },

    async evaluateHandoffConsumerBindingCurrency(bindingId) {
      const binding = await this.loadGovernedHandoffConsumerBinding(bindingId);
      if (!binding) {
        throw new OrchestraConstitutionalError(
          "HCCM consumer binding not found for currency evaluation",
          "invalid_handoff_consumer_binding",
          ["FI-DSN-STD-015-R39"],
        );
      }
      let entryCurrency: HandoffEntryCurrency;
      try {
        entryCurrency = await this.evaluateHandoffEntryCurrency(binding.entryId);
      } catch {
        entryCurrency = "stale";
      }
      return entryCurrency === "current" ? "current" : "stale";
    },

    async evaluateGovernedHandoffPostureDeclaration(input) {
      assertNoHandoffPostureCompletionOrExecutionClaims(
        input as unknown as Record<string, unknown>,
      );
      if (
        input.declaredBy != null ||
        input.authorityClassId != null ||
        input.sourceAttribution != null
      ) {
        assertGovernedHandoffPostureDeclarationActor({
          declaredBy: input.declaredBy ?? "posture-evaluator",
          authorityClassId: input.authorityClassId ?? "handoff_governance_authority",
          sourceAttribution: input.sourceAttribution,
        });
      }
      const { assessment } = await assessHandoffPostureDeclarationInternal(input);
      return assessment;
    },

    async declareHandoffPosture(input) {
      assertNoHandoffPostureCompletionOrExecutionClaims(
        input as unknown as Record<string, unknown>,
      );
      const declaredBy = assertGovernedHandoffPostureDeclarationActor(input);

      const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
      if (!entryRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff posture declaration rejected: entry not found",
          "invalid_handoff_posture_declaration",
          ["FI-DSN-STD-015-R47"],
        );
      }
      const entry = await rehydrateTrustedHandoffEntry(entryRaw);

      const bindingRaw = await storage.getGovernedHandoffConsumerBinding(input.bindingId);
      if (!bindingRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff posture declaration rejected: HCCM binding not found",
          "invalid_handoff_posture_declaration",
          ["FI-DSN-STD-015-R43"],
        );
      }
      const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);

      if (binding.entryId !== entry.entryId) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff posture declaration rejected: binding does not belong to entry",
          "invalid_handoff_posture_declaration",
          ["FI-DSN-STD-015-R43"],
        );
      }

      const declaredPostureClass =
        input.declaredPostureClass === undefined || input.declaredPostureClass === null
          ? binding.postureClassAffinity
          : (input.declaredPostureClass as HandoffPostureClass);

      const { assessment, preparation } = await assessHandoffPostureDeclarationInternal({
        entryId: input.entryId,
        bindingId: input.bindingId,
        declaredPostureClass,
      });

      if (!assessment.mayDeclare || !preparation) {
        throw new OrchestraConstitutionalError(
          `Governed Handoff posture declaration rejected: ${assessment.denialReasons.join("; ") || "mayDeclare is false"}`,
          "invalid_handoff_posture_declaration",
          ["FI-DSN-STD-015-R43", "FI-DSN-STD-015-R47"],
        );
      }

      const act = createGovernedHandoffPostureDeclarationActRecord({
        entry,
        binding,
        authorityClassId: input.authorityClassId,
        declaredBy,
        declaredAt: input.declaredAt,
        declaredPostureClass,
        sourceAttribution: input.sourceAttribution,
        completionActId: input.completionActId,
        suspensionActId: input.suspensionActId,
        recallActId: input.recallActId,
        withdrawalActId: input.withdrawalActId,
        executesHandoff: input.executesHandoff,
        handoffExecuted: input.handoffExecuted,
        performHandoff: input.performHandoff,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        executionQueueId: input.executionQueueId,
        constitutionalQueueId: input.constitutionalQueueId,
        brainDeclareHandoffPosture: input.brainDeclareHandoffPosture,
        brainHandoffPosture: input.brainHandoffPosture,
        implicitPosture: input.implicitPosture,
        automaticInheritancePosture: input.automaticInheritancePosture,
        inferredEligibilityPosture: input.inferredEligibilityPosture,
        configurationDrivenPosture: input.configurationDrivenPosture,
        downstreamAcceptanceId: input.downstreamAcceptanceId,
        permanentCollectionMembershipId: input.permanentCollectionMembershipId,
        unifiedCc01Cc02Posture: input.unifiedCc01Cc02Posture,
        mergedCrossCcPosture: input.mergedCrossCcPosture,
      });

      validatePersistedGovernedHandoffPostureDeclaration(act);
      try {
        await storage.putGovernedHandoffPostureDeclarationAct(act);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error
            ? error.message
            : "Failed to persist Governed Handoff posture declaration act",
          "invalid_handoff_posture_declaration",
          ["FI-DSN-STD-015-R40"],
        );
      }
      const loaded = await storage.getGovernedHandoffPostureDeclarationAct(
        act.postureDeclarationActId,
      );
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff posture declaration act",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R40"],
        );
      }
      return rehydrateTrustedHandoffPostureDeclaration(loaded);
    },

    async loadGovernedHandoffPostureDeclarationAct(postureDeclarationActId) {
      const loaded = await storage.getGovernedHandoffPostureDeclarationAct(
        postureDeclarationActId,
      );
      if (!loaded) return null;
      return rehydrateTrustedHandoffPostureDeclaration(loaded);
    },

    async listGovernedHandoffPostureDeclarationActsByBinding(bindingId) {
      const listed = await storage.listGovernedHandoffPostureDeclarationActsByBinding(bindingId);
      const out: GovernedHandoffPostureDeclarationActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffPostureDeclaration(item));
      }
      return out.sort((a, b) => a.declaredAt.localeCompare(b.declaredAt));
    },

    async listGovernedHandoffPostureDeclarationActsByEntry(entryId) {
      const listed = await storage.listGovernedHandoffPostureDeclarationActsByEntry(entryId);
      const out: GovernedHandoffPostureDeclarationActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffPostureDeclaration(item));
      }
      return out.sort((a, b) => a.declaredAt.localeCompare(b.declaredAt));
    },

    async listGovernedHandoffPostureDeclarationActsByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffPostureDeclarationActsByGpra(gpraId);
      const out: GovernedHandoffPostureDeclarationActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffPostureDeclaration(item));
      }
      return out.sort((a, b) => a.declaredAt.localeCompare(b.declaredAt));
    },

    async getAuthoritativeHandoffPostureDeclarationForBinding(bindingId) {
      const listed = await this.listGovernedHandoffPostureDeclarationActsByBinding(bindingId);
      return selectAuthoritativeHandoffPostureDeclaration(listed);
    },

    async evaluateHandoffPostureDeclarationCurrency(postureDeclarationActId) {
      const declaration = await this.loadGovernedHandoffPostureDeclarationAct(
        postureDeclarationActId,
      );
      if (!declaration) {
        throw new OrchestraConstitutionalError(
          "Handoff posture declaration act not found for currency evaluation",
          "invalid_handoff_posture_declaration",
          ["FI-DSN-STD-015-R47"],
        );
      }
      let entryCurrency: HandoffEntryCurrency;
      try {
        entryCurrency = await this.evaluateHandoffEntryCurrency(declaration.entryId);
      } catch {
        entryCurrency = "stale";
      }
      let bindingCurrency: HandoffConsumerBindingCurrency;
      try {
        bindingCurrency = await this.evaluateHandoffConsumerBindingCurrency(
          declaration.bindingId,
        );
      } catch {
        bindingCurrency = "stale";
      }
      const authoritative = await this.getAuthoritativeHandoffPostureDeclarationForBinding(
        declaration.bindingId,
      );
      return evaluateHandoffPostureDeclarationCurrencyFromFacts({
        declaration,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        authoritativeDeclarationId: authoritative?.postureDeclarationActId ?? null,
      });
    },

    async evaluateHandoffActLayerLifecycle(bindingId) {
      const bindingRaw = await storage.getGovernedHandoffConsumerBinding(bindingId);
      if (!bindingRaw) {
        throw new OrchestraConstitutionalError(
          "Handoff act-layer lifecycle evaluation rejected: HCCM binding not found",
          "invalid_handoff_act_lifecycle",
          ["FI-DSN-STD-015-R50"],
        );
      }
      const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);
      const entryRaw = await storage.getGovernedHandoffEntry(binding.entryId);
      if (!entryRaw) {
        throw new OrchestraConstitutionalError(
          "Handoff act-layer lifecycle evaluation rejected: entry not found",
          "invalid_handoff_act_lifecycle",
          ["FI-DSN-STD-015-R50"],
        );
      }
      const entry = await rehydrateTrustedHandoffEntry(entryRaw);

      let entryCurrency: HandoffEntryCurrency;
      try {
        entryCurrency = await this.evaluateHandoffEntryCurrency(entry.entryId);
      } catch {
        entryCurrency = "stale";
      }
      let bindingCurrency: HandoffConsumerBindingCurrency;
      try {
        bindingCurrency = await this.evaluateHandoffConsumerBindingCurrency(binding.bindingId);
      } catch {
        bindingCurrency = "stale";
      }

      const prepRaw = await storage.getGovernedHandoffPreparation(entry.preparationId);
      const preparation = prepRaw
        ? await rehydrateTrustedHandoffPreparation(prepRaw)
        : null;

      const authoritative = await findAuthoritativeGpraByObligationContext(
        entry.obligationId,
        entry.handoffConsumerContextId,
      );
      const lineageMatchesAuthoritativeGpra = authoritative
        ? handoffEntryLineageMatchesGpra(entry, authoritative)
        : false;

      let gpraValidityPosture: GpraValidityPosture | null = null;
      if (authoritative) {
        const validity = await evaluateGpraValidityForContext(
          authoritative.gpraId,
          entry.handoffConsumerContextId,
        );
        gpraValidityPosture = validity.posture;
      }

      let eligibilityLayerCondition: HandoffEligibilityLayerCondition | null = null;
      if (preparation) {
        const eligibility = await assessHandoffEligibilityInternal({
          obligationId: preparation.obligationId,
          handoffConsumerContextId: preparation.handoffConsumerContextId,
          consumerCategoryKeys: preparation.consumerCategoryKeys,
        });
        eligibilityLayerCondition = eligibility.eligibilityLayerCondition;
      }

      const completions = await this.listGovernedHandoffCompletionActsByBinding(bindingId);
      const authoritativeCompletion =
        selectAuthoritativeGovernedHandoffCompletion(completions);
      const completionIsCurrent =
        !!authoritativeCompletion &&
        evaluateHandoffCompletionCurrencyFromFacts({
          completion: authoritativeCompletion,
          currentEntryCurrency: entryCurrency,
          currentBindingCurrency: bindingCurrency,
          authoritativeCompletionActId: authoritativeCompletion.completionActId,
        }) === "current";

      const authActs = await this.listGovernedHandoffAuthorizationActsByEntry(entry.entryId);
      const matchingAuths = authActs.filter(
        (a) => a.consumerClassId === binding.consumerClassId,
      );
      const matchingAuthorization =
        matchingAuths.length > 0
          ? [...matchingAuths].sort((a, b) => a.authorizedAt.localeCompare(b.authorizedAt)).at(-1)!
          : null;
      let authorizationCurrency: HandoffAuthorizationCurrency | null = null;
      if (matchingAuthorization) {
        try {
          authorizationCurrency = await this.evaluateHandoffAuthorizationCurrency(
            matchingAuthorization.authorizationActId,
          );
        } catch {
          authorizationCurrency = "stale";
        }
      }

      const authoritativePosture =
        await this.getAuthoritativeHandoffPostureDeclarationForBinding(bindingId);

      const suspensions = await this.listGovernedHandoffSuspensionActsByBinding(bindingId);
      const authoritativeSuspension =
        selectAuthoritativeGovernedHandoffSuspension(suspensions);
      const suspensionIsCurrent =
        !!authoritativeSuspension &&
        evaluateHandoffSuspensionCurrencyFromFacts({
          suspension: authoritativeSuspension,
          currentEntryCurrency: entryCurrency,
          currentBindingCurrency: bindingCurrency,
          authoritativeSuspensionActId: authoritativeSuspension.suspensionActId,
          gpraValidityPosture,
          lineageMatchesAuthoritativeGpra,
        }) === "current";

      const withdrawals = await this.listGovernedHandoffWithdrawalActsByBinding(bindingId);
      const authoritativeWithdrawal =
        selectAuthoritativeGovernedHandoffWithdrawal(withdrawals);
      const withdrawalIsCurrent =
        !!authoritativeWithdrawal &&
        evaluateHandoffWithdrawalCurrencyFromFacts({
          withdrawal: authoritativeWithdrawal,
          currentEntryCurrency: entryCurrency,
          currentBindingCurrency: bindingCurrency,
          authoritativeWithdrawalActId: authoritativeWithdrawal.withdrawalActId,
          gpraValidityPosture,
          lineageMatchesAuthoritativeGpra,
        }) === "current";

      const recalls = await this.listGovernedHandoffRecallActsByBinding(bindingId);
      let recallGpraValidityPosture = gpraValidityPosture;
      let recallLineageMatchesAuthoritativeGpra = lineageMatchesAuthoritativeGpra;
      const authoritativeRecall = selectAuthoritativeGovernedHandoffRecall(recalls);
      if (authoritativeRecall) {
        const recallUsesHistoricalAttribution =
          authoritativeRecall.satisfiedHrtcmTriggers.includes("RTC-01") ||
          authoritativeRecall.satisfiedHrtcmTriggers.includes("RTC-02");
        if (recallUsesHistoricalAttribution) {
          const entryBoundValidity = await evaluateGpraValidityForContext(
            entry.gpraId,
            entry.handoffConsumerContextId,
          );
          recallGpraValidityPosture = entryBoundValidity.posture;
          const entryBoundGpraRaw = await storage.getGpraGrant(entry.gpraId);
          if (entryBoundGpraRaw) {
            const entryBoundGpra = await rehydrateTrustedGpraGrant(entryBoundGpraRaw);
            recallLineageMatchesAuthoritativeGpra = handoffEntryLineageMatchesGpra(
              entry,
              entryBoundGpra,
            );
          }
        }
      }
      const recallIsCurrent =
        !!authoritativeRecall &&
        evaluateHandoffRecallCurrencyFromFacts({
          recall: authoritativeRecall,
          currentEntryCurrency: entryCurrency,
          currentBindingCurrency: bindingCurrency,
          authoritativeRecallActId: authoritativeRecall.recallActId,
          gpraValidityPosture: recallGpraValidityPosture,
          lineageMatchesAuthoritativeGpra: recallLineageMatchesAuthoritativeGpra,
        }) === "current";

      return evaluateHandoffActLayerLifecycleFromFacts({
        binding,
        entry,
        entryCurrency,
        bindingCurrency,
        gpraValidityPosture,
        eligibilityLayerCondition,
        lineageMatchesAuthoritativeGpra,
        authoritativeCompletion,
        completionIsCurrent,
        matchingAuthorization,
        authorizationCurrency,
        authoritativePosture,
        authoritativeSuspension,
        suspensionIsCurrent,
        authoritativeWithdrawal,
        withdrawalIsCurrent,
        authoritativeRecall,
        recallIsCurrent,
      });
    },

    async evaluateGovernedHandoffCompletion(input) {
      assertNoHandoffCompletionExecutionOrDeferredLifecycleClaims(
        input as unknown as Record<string, unknown>,
      );
      if (
        input.completedBy != null ||
        input.authorityClassId != null ||
        input.sourceAttribution != null
      ) {
        assertGovernedHandoffCompletionActor({
          completedBy: input.completedBy ?? "completion-evaluator",
          authorityClassId: input.authorityClassId ?? "handoff_governance_authority",
          sourceAttribution: input.sourceAttribution,
        });
      }
      const { assessment } = await assessHandoffCompletionInternal(input);
      return assessment;
    },

    async completeGovernedHandoff(input) {
      assertNoHandoffCompletionExecutionOrDeferredLifecycleClaims(
        input as unknown as Record<string, unknown>,
      );
      const completedBy = assertGovernedHandoffCompletionActor(input);

      const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
      if (!entryRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff completion rejected: entry not found",
          "invalid_handoff_completion",
          ["FI-DSN-STD-015-R51"],
        );
      }
      const entry = await rehydrateTrustedHandoffEntry(entryRaw);

      const bindingRaw = await storage.getGovernedHandoffConsumerBinding(input.bindingId);
      if (!bindingRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff completion rejected: HCCM binding not found",
          "invalid_handoff_completion",
          ["FI-DSN-STD-015-R50"],
        );
      }
      const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);

      if (binding.entryId !== entry.entryId) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff completion rejected: binding does not belong to entry",
          "invalid_handoff_completion",
          ["FI-DSN-STD-015-R50"],
        );
      }

      const { assessment, posture, preparation } = await assessHandoffCompletionInternal({
        entryId: input.entryId,
        bindingId: input.bindingId,
      });

      if (!assessment.mayComplete || !preparation || !posture) {
        throw new OrchestraConstitutionalError(
          `Governed Handoff completion rejected: ${assessment.denialReasons.join("; ") || "mayComplete is false"}`,
          "invalid_handoff_completion",
          ["FI-DSN-STD-015-R50", "FI-DSN-STD-015-R51"],
        );
      }

      const act = createGovernedHandoffCompletionActRecord({
        entry,
        binding,
        posture,
        authorityClassId: input.authorityClassId,
        completedBy,
        completedAt: input.completedAt,
        sourceAttribution: input.sourceAttribution,
        suspensionActId: input.suspensionActId,
        recallActId: input.recallActId,
        withdrawalActId: input.withdrawalActId,
        expiryActId: input.expiryActId,
        executesHandoff: input.executesHandoff,
        handoffExecuted: input.handoffExecuted,
        performHandoff: input.performHandoff,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        executionQueueId: input.executionQueueId,
        constitutionalQueueId: input.constitutionalQueueId,
        brainCompleteHandoff: input.brainCompleteHandoff,
        brainHandoffCompletion: input.brainHandoffCompletion,
        implicitCompletion: input.implicitCompletion,
        automaticInheritanceCompletion: input.automaticInheritanceCompletion,
        inferredEligibilityCompletion: input.inferredEligibilityCompletion,
        configurationDrivenCompletion: input.configurationDrivenCompletion,
        downstreamAcceptanceId: input.downstreamAcceptanceId,
        permanentCollectionMembershipId: input.permanentCollectionMembershipId,
        suspendHandoff: input.suspendHandoff,
        recallHandoff: input.recallHandoff,
        withdrawHandoff: input.withdrawHandoff,
        expireHandoff: input.expireHandoff,
        acceptDownstream: input.acceptDownstream,
        membershipAdmission: input.membershipAdmission,
      });

      validatePersistedGovernedHandoffCompletion(act);
      try {
        await storage.putGovernedHandoffCompletionAct(act);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error
            ? error.message
            : "Failed to persist Governed Handoff completion act",
          "invalid_handoff_completion",
          ["FI-DSN-STD-015-R51"],
        );
      }
      const loaded = await storage.getGovernedHandoffCompletionAct(act.completionActId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff completion act",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R51"],
        );
      }
      return rehydrateTrustedHandoffCompletion(loaded);
    },

    async loadGovernedHandoffCompletionAct(completionActId) {
      const loaded = await storage.getGovernedHandoffCompletionAct(completionActId);
      if (!loaded) return null;
      return rehydrateTrustedHandoffCompletion(loaded);
    },

    async listGovernedHandoffCompletionActsByBinding(bindingId) {
      const listed = await storage.listGovernedHandoffCompletionActsByBinding(bindingId);
      const out: GovernedHandoffCompletionActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffCompletion(item));
      }
      return out.sort((a, b) => a.completedAt.localeCompare(b.completedAt));
    },

    async listGovernedHandoffCompletionActsByEntry(entryId) {
      const listed = await storage.listGovernedHandoffCompletionActsByEntry(entryId);
      const out: GovernedHandoffCompletionActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffCompletion(item));
      }
      return out.sort((a, b) => a.completedAt.localeCompare(b.completedAt));
    },

    async listGovernedHandoffCompletionActsByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffCompletionActsByGpra(gpraId);
      const out: GovernedHandoffCompletionActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffCompletion(item));
      }
      return out.sort((a, b) => a.completedAt.localeCompare(b.completedAt));
    },

    async getAuthoritativeHandoffCompletionForBinding(bindingId) {
      const listed = await this.listGovernedHandoffCompletionActsByBinding(bindingId);
      return selectAuthoritativeGovernedHandoffCompletion(listed);
    },

    async evaluateHandoffCompletionCurrency(completionActId) {
      const completion = await this.loadGovernedHandoffCompletionAct(completionActId);
      if (!completion) {
        throw new OrchestraConstitutionalError(
          "Handoff completion act not found for currency evaluation",
          "invalid_handoff_completion",
          ["FI-DSN-STD-015-R51"],
        );
      }
      let entryCurrency: HandoffEntryCurrency;
      try {
        entryCurrency = await this.evaluateHandoffEntryCurrency(completion.entryId);
      } catch {
        entryCurrency = "stale";
      }
      let bindingCurrency: HandoffConsumerBindingCurrency;
      try {
        bindingCurrency = await this.evaluateHandoffConsumerBindingCurrency(
          completion.bindingId,
        );
      } catch {
        bindingCurrency = "stale";
      }
      const authoritative = await this.getAuthoritativeHandoffCompletionForBinding(
        completion.bindingId,
      );
      return evaluateHandoffCompletionCurrencyFromFacts({
        completion,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        authoritativeCompletionActId: authoritative?.completionActId ?? null,
      });
    },

    async evaluateGovernedHandoffSuspension(input) {
      assertNoHandoffSuspensionWithdrawalRecallOrReentryClaims(
        input as unknown as Record<string, unknown>,
      );
      if (
        input.suspendedBy != null ||
        input.authorityClassId != null ||
        input.sourceAttribution != null
      ) {
        assertGovernedHandoffSuspensionActor({
          suspendedBy: input.suspendedBy ?? "suspension-evaluator",
          authorityClassId: input.authorityClassId ?? "handoff_governance_authority",
          sourceAttribution: input.sourceAttribution,
          performerClass: input.performerClass,
        });
      }
      const { assessment } = await assessHandoffSuspensionInternal({
        ...input,
        purportedWithdrawalRecordPresent: Boolean(input.withdrawalActId),
        purportedRecallRecordPresent: Boolean(input.recallActId),
      });
      return assessment;
    },

    async suspendGovernedHandoff(input) {
      assertNoHandoffSuspensionWithdrawalRecallOrReentryClaims(
        input as unknown as Record<string, unknown>,
      );
      const suspendedBy = assertGovernedHandoffSuspensionActor(input);

      const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
      if (!entryRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff suspension rejected: entry not found",
          "invalid_handoff_suspension",
          ["FI-DSN-STD-015-R85"],
        );
      }
      const entry = await rehydrateTrustedHandoffEntry(entryRaw);

      const bindingRaw = await storage.getGovernedHandoffConsumerBinding(input.bindingId);
      if (!bindingRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff suspension rejected: HCCM binding not found",
          "invalid_handoff_suspension",
          ["FI-DSN-STD-015-R88"],
        );
      }
      const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);

      if (binding.entryId !== entry.entryId) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff suspension rejected: binding does not belong to entry",
          "invalid_handoff_suspension",
          ["FI-DSN-STD-015-R88"],
        );
      }

      const { assessment, authorization, posture } = await assessHandoffSuspensionInternal({
        entryId: input.entryId,
        bindingId: input.bindingId,
        constitutionalBasisKind: input.constitutionalBasisKind,
        constitutionalBasisNotes: input.constitutionalBasisNotes,
        authorityClassId: input.authorityClassId,
        performerClass: input.performerClass,
        advisoryEvidenceAlone: input.advisoryEvidenceAlone,
        rtcCatalogAlone: input.rtcCatalogAlone,
        gpraInvalidatedAlone: input.gpraInvalidatedAlone,
        gpraSupersededAlone: input.gpraSupersededAlone,
        g11BlockedAlone: input.g11BlockedAlone,
        hrwmLossAlone: input.hrwmLossAlone,
        purportedWithdrawalRecordPresent: Boolean(input.withdrawalActId),
        purportedRecallRecordPresent: Boolean(input.recallActId),
      });

      if (!assessment.maySuspend || !authorization || !posture) {
        throw new OrchestraConstitutionalError(
          `Governed Handoff suspension rejected: ${assessment.denialReasons.join("; ") || "maySuspend is false"}`,
          "invalid_handoff_suspension",
          ["FI-DSN-STD-015-R85", "FI-DSN-STD-015-R84"],
        );
      }

      const act = createGovernedHandoffSuspensionActRecord({
        entry,
        binding,
        authorization,
        posture,
        authorityClassId: input.authorityClassId,
        suspendedBy,
        suspendedAt: input.suspendedAt,
        constitutionalBasisKind: input.constitutionalBasisKind,
        constitutionalBasisNotes: input.constitutionalBasisNotes,
        sourceAttribution: input.sourceAttribution,
        performerClass: input.performerClass,
        withdrawalActId: input.withdrawalActId,
        recallActId: input.recallActId,
        expiryActId: input.expiryActId,
        resumeHandoff: input.resumeHandoff,
        restoreHandoff: input.restoreHandoff,
        reenterHandoff: input.reenterHandoff,
        withdrawHandoff: input.withdrawHandoff,
        recallHandoff: input.recallHandoff,
        expireHandoff: input.expireHandoff,
        executesHandoff: input.executesHandoff,
        handoffExecuted: input.handoffExecuted,
        performHandoff: input.performHandoff,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        executionQueueId: input.executionQueueId,
        constitutionalQueueId: input.constitutionalQueueId,
        brainSuspendHandoff: input.brainSuspendHandoff,
        brainHandoffSuspension: input.brainHandoffSuspension,
        implicitSuspension: input.implicitSuspension,
        rtcCatalogAlone: input.rtcCatalogAlone,
        rejectHandoff: input.rejectHandoff,
        hercmReentryId: input.hercmReentryId,
        resumptionActId: input.resumptionActId,
        restorationActId: input.restorationActId,
      });

      validatePersistedGovernedHandoffSuspension(act);
      try {
        await storage.putGovernedHandoffSuspensionAct(act);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error
            ? error.message
            : "Failed to persist Governed Handoff suspension act",
          "invalid_handoff_suspension",
          ["FI-DSN-STD-015-R84"],
        );
      }
      const loaded = await storage.getGovernedHandoffSuspensionAct(act.suspensionActId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff suspension act",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R84"],
        );
      }
      return rehydrateTrustedHandoffSuspension(loaded);
    },

    async loadGovernedHandoffSuspensionAct(suspensionActId) {
      const loaded = await storage.getGovernedHandoffSuspensionAct(suspensionActId);
      if (!loaded) return null;
      return rehydrateTrustedHandoffSuspension(loaded);
    },

    async listGovernedHandoffSuspensionActsByBinding(bindingId) {
      const listed = await storage.listGovernedHandoffSuspensionActsByBinding(bindingId);
      const out: GovernedHandoffSuspensionActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffSuspension(item));
      }
      return out.sort((a, b) => a.suspendedAt.localeCompare(b.suspendedAt));
    },

    async listGovernedHandoffSuspensionActsByEntry(entryId) {
      const listed = await storage.listGovernedHandoffSuspensionActsByEntry(entryId);
      const out: GovernedHandoffSuspensionActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffSuspension(item));
      }
      return out.sort((a, b) => a.suspendedAt.localeCompare(b.suspendedAt));
    },

    async listGovernedHandoffSuspensionActsByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffSuspensionActsByGpra(gpraId);
      const out: GovernedHandoffSuspensionActRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffSuspension(item));
      }
      return out.sort((a, b) => a.suspendedAt.localeCompare(b.suspendedAt));
    },

    async getAuthoritativeHandoffSuspensionForBinding(bindingId) {
      const listed = await this.listGovernedHandoffSuspensionActsByBinding(bindingId);
      return selectAuthoritativeGovernedHandoffSuspension(listed);
    },

    async evaluateHandoffSuspensionCurrency(suspensionActId) {
      const suspension = await this.loadGovernedHandoffSuspensionAct(suspensionActId);
      if (!suspension) {
        throw new OrchestraConstitutionalError(
          "Handoff suspension act not found for currency evaluation",
          "invalid_handoff_suspension",
          ["FI-DSN-STD-015-R84"],
        );
      }
      let entryCurrency: HandoffEntryCurrency;
      try {
        entryCurrency = await this.evaluateHandoffEntryCurrency(suspension.entryId);
      } catch {
        entryCurrency = "stale";
      }
      let bindingCurrency: HandoffConsumerBindingCurrency;
      try {
        bindingCurrency = await this.evaluateHandoffConsumerBindingCurrency(
          suspension.bindingId,
        );
      } catch {
        bindingCurrency = "stale";
      }
      const authoritative = await this.getAuthoritativeHandoffSuspensionForBinding(
        suspension.bindingId,
      );
      const entryRaw = await storage.getGovernedHandoffEntry(suspension.entryId);
      const entry = entryRaw ? await rehydrateTrustedHandoffEntry(entryRaw) : null;
      let gpraValidityPosture: GpraValidityPosture | null = null;
      let lineageMatchesAuthoritativeGpra = false;
      if (entry) {
        const authoritativeGpra = await findAuthoritativeGpraByObligationContext(
          entry.obligationId,
          entry.handoffConsumerContextId,
        );
        lineageMatchesAuthoritativeGpra = authoritativeGpra
          ? handoffEntryLineageMatchesGpra(entry, authoritativeGpra)
          : false;
        if (authoritativeGpra) {
          const validity = await evaluateGpraValidityForContext(
            authoritativeGpra.gpraId,
            entry.handoffConsumerContextId,
          );
          gpraValidityPosture = validity.posture;
        }
      }
      return evaluateHandoffSuspensionCurrencyFromFacts({
        suspension,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        authoritativeSuspensionActId: authoritative?.suspensionActId ?? null,
        gpraValidityPosture,
        lineageMatchesAuthoritativeGpra,
      });
    },

    async evaluateGovernedHandoffWithdrawal(input) {
      assertNoHandoffWithdrawalRecallOrReentryClaims(
        input as unknown as Record<string, unknown>,
      );
      if (
        input.withdrawnBy != null ||
        input.authorityClassId != null ||
        input.sourceAttribution != null
      ) {
        assertGovernedHandoffWithdrawalActor({
          withdrawnBy: input.withdrawnBy ?? "withdrawal-evaluator",
          authorityClassId: input.authorityClassId ?? "handoff_governance_authority",
          sourceAttribution: input.sourceAttribution,
          performerClass: input.performerClass,
        });
      }
      const { assessment } = await assessHandoffWithdrawalInternal({
        ...input,
        purportedWithdrawalRecordPresent: Boolean(input.withdrawalActId),
        purportedRecallRecordPresent: Boolean(input.recallActId),
      });
      return assessment;
    },

    async withdrawGovernedHandoff(input) {
      assertNoHandoffWithdrawalRecallOrReentryClaims(
        input as unknown as Record<string, unknown>,
      );
      const withdrawnBy = assertGovernedHandoffWithdrawalActor(input);
      const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
      const bindingRaw = await storage.getGovernedHandoffConsumerBinding(input.bindingId);
      if (!entryRaw || !bindingRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff withdrawal rejected: entry or binding not found",
          "invalid_handoff_withdrawal",
          ["FI-DSN-STD-015-R99", "FI-DSN-STD-015-R102"],
        );
      }
      const entry = await rehydrateTrustedHandoffEntry(entryRaw);
      const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);
      if (binding.entryId !== entry.entryId) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff withdrawal rejected: binding does not belong to entry",
          "invalid_handoff_withdrawal",
          ["FI-DSN-STD-015-R102"],
        );
      }
      const { assessment, authorization, posture } = await assessHandoffWithdrawalInternal({
        entryId: input.entryId,
        bindingId: input.bindingId,
        constitutionalBasisKind: input.constitutionalBasisKind,
        constitutionalBasisNotes: input.constitutionalBasisNotes,
        authorityClassId: input.authorityClassId,
        performerClass: input.performerClass,
        advisoryEvidenceAlone: input.advisoryEvidenceAlone,
        rtcCatalogAlone: input.rtcCatalogAlone,
        gpraInvalidatedAlone: input.gpraInvalidatedAlone,
        gpraSupersededAlone: input.gpraSupersededAlone,
        g11BlockedAlone: input.g11BlockedAlone,
        hrwmLossAlone: input.hrwmLossAlone,
        purportedRecallRecordPresent: Boolean(input.recallActId),
      });
      if (!assessment.mayWithdraw || !authorization || !posture) {
        throw new OrchestraConstitutionalError(
          `Governed Handoff withdrawal rejected: ${assessment.denialReasons.join("; ") || "mayWithdraw is false"}`,
          "invalid_handoff_withdrawal",
          ["FI-DSN-STD-015-R98", "FI-DSN-STD-015-R100"],
        );
      }
      const act = createGovernedHandoffWithdrawalActRecord({
        entry,
        binding,
        authorization,
        posture,
        authorityClassId: input.authorityClassId,
        withdrawnBy,
        withdrawnAt: input.withdrawnAt,
        constitutionalBasisKind: input.constitutionalBasisKind,
        constitutionalBasisNotes: input.constitutionalBasisNotes,
        sourceAttribution: input.sourceAttribution,
        performerClass: input.performerClass,
        recallActId: input.recallActId,
        expiryActId: input.expiryActId,
        resumeHandoff: input.resumeHandoff,
        restoreHandoff: input.restoreHandoff,
        reenterHandoff: input.reenterHandoff,
        recallHandoff: input.recallHandoff,
        expireHandoff: input.expireHandoff,
        executesHandoff: input.executesHandoff,
        handoffExecuted: input.handoffExecuted,
        performHandoff: input.performHandoff,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        executionQueueId: input.executionQueueId,
        constitutionalQueueId: input.constitutionalQueueId,
        brainWithdrawHandoff: input.brainWithdrawHandoff,
        brainHandoffWithdrawal: input.brainHandoffWithdrawal,
        implicitWithdrawal: input.implicitWithdrawal,
        rtcCatalogAlone: input.rtcCatalogAlone,
        rejectHandoff: input.rejectHandoff,
        hercmReentryId: input.hercmReentryId,
        resumptionActId: input.resumptionActId,
        restorationActId: input.restorationActId,
      });
      validatePersistedGovernedHandoffWithdrawal(act);
      try {
        await storage.putGovernedHandoffWithdrawalAct(act);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Governed Handoff withdrawal act",
          "invalid_handoff_withdrawal",
          ["FI-DSN-STD-015-R98"],
        );
      }
      const loaded = await storage.getGovernedHandoffWithdrawalAct(act.withdrawalActId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff withdrawal act",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R98"],
        );
      }
      return rehydrateTrustedHandoffWithdrawal(loaded);
    },

    async loadGovernedHandoffWithdrawalAct(withdrawalActId) {
      const loaded = await storage.getGovernedHandoffWithdrawalAct(withdrawalActId);
      return loaded ? rehydrateTrustedHandoffWithdrawal(loaded) : null;
    },

    async listGovernedHandoffWithdrawalActsByBinding(bindingId) {
      const listed = await storage.listGovernedHandoffWithdrawalActsByBinding(bindingId);
      const out: GovernedHandoffWithdrawalActRecord[] = [];
      for (const item of listed) out.push(await rehydrateTrustedHandoffWithdrawal(item));
      return out.sort((a, b) => a.withdrawnAt.localeCompare(b.withdrawnAt));
    },

    async listGovernedHandoffWithdrawalActsByEntry(entryId) {
      const listed = await storage.listGovernedHandoffWithdrawalActsByEntry(entryId);
      const out: GovernedHandoffWithdrawalActRecord[] = [];
      for (const item of listed) out.push(await rehydrateTrustedHandoffWithdrawal(item));
      return out.sort((a, b) => a.withdrawnAt.localeCompare(b.withdrawnAt));
    },

    async listGovernedHandoffWithdrawalActsByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffWithdrawalActsByGpra(gpraId);
      const out: GovernedHandoffWithdrawalActRecord[] = [];
      for (const item of listed) out.push(await rehydrateTrustedHandoffWithdrawal(item));
      return out.sort((a, b) => a.withdrawnAt.localeCompare(b.withdrawnAt));
    },

    async getAuthoritativeHandoffWithdrawalForBinding(bindingId) {
      const listed = await this.listGovernedHandoffWithdrawalActsByBinding(bindingId);
      return selectAuthoritativeGovernedHandoffWithdrawal(listed);
    },

    async evaluateHandoffWithdrawalCurrency(withdrawalActId) {
      const withdrawal = await this.loadGovernedHandoffWithdrawalAct(withdrawalActId);
      if (!withdrawal) {
        throw new OrchestraConstitutionalError(
          "Handoff withdrawal act not found for currency evaluation",
          "invalid_handoff_withdrawal",
          ["FI-DSN-STD-015-R98"],
        );
      }
      let entryCurrency: HandoffEntryCurrency = "stale";
      let bindingCurrency: HandoffConsumerBindingCurrency = "stale";
      try {
        entryCurrency = await this.evaluateHandoffEntryCurrency(withdrawal.entryId);
        bindingCurrency = await this.evaluateHandoffConsumerBindingCurrency(withdrawal.bindingId);
      } catch {
        // Fail closed.
      }
      const authoritative = await this.getAuthoritativeHandoffWithdrawalForBinding(
        withdrawal.bindingId,
      );
      const entryRaw = await storage.getGovernedHandoffEntry(withdrawal.entryId);
      const entry = entryRaw ? await rehydrateTrustedHandoffEntry(entryRaw) : null;
      let gpraValidityPosture: GpraValidityPosture | null = null;
      let lineageMatchesAuthoritativeGpra = false;
      if (entry) {
        const gpra = await findAuthoritativeGpraByObligationContext(
          entry.obligationId,
          entry.handoffConsumerContextId,
        );
        lineageMatchesAuthoritativeGpra = gpra
          ? handoffEntryLineageMatchesGpra(entry, gpra)
          : false;
        if (gpra) {
          gpraValidityPosture = (
            await evaluateGpraValidityForContext(gpra.gpraId, entry.handoffConsumerContextId)
          ).posture;
        }
      }
      return evaluateHandoffWithdrawalCurrencyFromFacts({
        withdrawal,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        authoritativeWithdrawalActId: authoritative?.withdrawalActId ?? null,
        gpraValidityPosture,
        lineageMatchesAuthoritativeGpra,
      });
    },

    async evaluateGovernedHandoffRecall(input) {
      assertNoHandoffRecallWithdrawalOrReentryClaims(
        input as unknown as Record<string, unknown>,
      );
      if (
        input.recalledBy != null ||
        input.authorityClassId != null ||
        input.sourceAttribution != null
      ) {
        assertGovernedHandoffRecallActor({
          recalledBy: input.recalledBy ?? "recall-evaluator",
          authorityClassId: input.authorityClassId ?? "handoff_governance_authority",
          sourceAttribution: input.sourceAttribution,
          performerClass: input.performerClass,
        });
      }
      const { assessment } = await assessHandoffRecallInternal({
        ...input,
        purportedWithdrawalRecordPresent: Boolean(input.withdrawalActId),
        purportedRecallRecordPresent: Boolean(input.recallActId),
      });
      return assessment;
    },

    async recallGovernedHandoff(input) {
      assertNoHandoffRecallWithdrawalOrReentryClaims(
        input as unknown as Record<string, unknown>,
      );
      const recalledBy = assertGovernedHandoffRecallActor(input);
      const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
      const bindingRaw = await storage.getGovernedHandoffConsumerBinding(input.bindingId);
      if (!entryRaw || !bindingRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff recall rejected: entry or binding not found",
          "invalid_handoff_recall",
          ["FI-DSN-STD-015-R113", "FI-DSN-STD-015-R116"],
        );
      }
      const entry = await rehydrateTrustedHandoffEntry(entryRaw);
      const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);
      if (binding.entryId !== entry.entryId) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff recall rejected: binding does not belong to entry",
          "invalid_handoff_recall",
          ["FI-DSN-STD-015-R116"],
        );
      }
      const { assessment, authorization, posture } = await assessHandoffRecallInternal({
        entryId: input.entryId,
        bindingId: input.bindingId,
        satisfiedHrtcmTriggers: input.satisfiedHrtcmTriggers,
        hrtcmTriggerEvidenceNotes: input.hrtcmTriggerEvidenceNotes,
        hrwmEligibilityLossSatisfied: input.hrwmEligibilityLossSatisfied,
        postureChainGovernanceCessationSatisfied:
          input.postureChainGovernanceCessationSatisfied,
        authorityClassId: input.authorityClassId,
        performerClass: input.performerClass,
        advisoryEvidenceAlone: input.advisoryEvidenceAlone,
        rtcCatalogAlone: input.rtcCatalogAlone,
        hrtcmRtcAlone: input.hrtcmRtcAlone,
        gpraInvalidatedAlone: input.gpraInvalidatedAlone,
        gpraSupersededAlone: input.gpraSupersededAlone,
        g11BlockedAlone: input.g11BlockedAlone,
        hrwmLossAlone: input.hrwmLossAlone,
        purportedWithdrawalRecordPresent: Boolean(input.withdrawalActId),
      });
      if (!assessment.mayRecall || !authorization || !posture) {
        throw new OrchestraConstitutionalError(
          `Governed Handoff recall rejected: ${assessment.denialReasons.join("; ") || "mayRecall is false"}`,
          "invalid_handoff_recall",
          ["FI-DSN-STD-015-R112", "FI-DSN-STD-015-R114"],
        );
      }
      const act = createGovernedHandoffRecallActRecord({
        entry,
        binding,
        authorization,
        posture,
        authorityClassId: input.authorityClassId,
        recalledBy,
        recalledAt: input.recalledAt,
        satisfiedHrtcmTriggers: input.satisfiedHrtcmTriggers,
        hrtcmTriggerEvidenceNotes: input.hrtcmTriggerEvidenceNotes,
        sourceAttribution: input.sourceAttribution,
        performerClass: input.performerClass,
        withdrawalActId: input.withdrawalActId,
        expiryActId: input.expiryActId,
        resumeHandoff: input.resumeHandoff,
        restoreHandoff: input.restoreHandoff,
        reenterHandoff: input.reenterHandoff,
        withdrawHandoff: input.withdrawHandoff,
        expireHandoff: input.expireHandoff,
        executesHandoff: input.executesHandoff,
        handoffExecuted: input.handoffExecuted,
        performHandoff: input.performHandoff,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        executionQueueId: input.executionQueueId,
        constitutionalQueueId: input.constitutionalQueueId,
        brainRecallHandoff: input.brainRecallHandoff,
        brainHandoffRecall: input.brainHandoffRecall,
        implicitRecall: input.implicitRecall,
        rtcCatalogAlone: input.rtcCatalogAlone,
        hrtcmRtcAlone: input.hrtcmRtcAlone,
        rejectHandoff: input.rejectHandoff,
        hercmReentryId: input.hercmReentryId,
        resumptionActId: input.resumptionActId,
        restorationActId: input.restorationActId,
      });
      validatePersistedGovernedHandoffRecall(act);
      try {
        await storage.putGovernedHandoffRecallAct(act);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Governed Handoff recall act",
          "invalid_handoff_recall",
          ["FI-DSN-STD-015-R112"],
        );
      }
      const loaded = await storage.getGovernedHandoffRecallAct(act.recallActId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff recall act",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R112"],
        );
      }
      return rehydrateTrustedHandoffRecall(loaded);
    },

    async loadGovernedHandoffRecallAct(recallActId) {
      const loaded = await storage.getGovernedHandoffRecallAct(recallActId);
      return loaded ? rehydrateTrustedHandoffRecall(loaded) : null;
    },

    async listGovernedHandoffRecallActsByBinding(bindingId) {
      const listed = await storage.listGovernedHandoffRecallActsByBinding(bindingId);
      const out: GovernedHandoffRecallActRecord[] = [];
      for (const item of listed) out.push(await rehydrateTrustedHandoffRecall(item));
      return out.sort((a, b) => a.recalledAt.localeCompare(b.recalledAt));
    },

    async listGovernedHandoffRecallActsByEntry(entryId) {
      const listed = await storage.listGovernedHandoffRecallActsByEntry(entryId);
      const out: GovernedHandoffRecallActRecord[] = [];
      for (const item of listed) out.push(await rehydrateTrustedHandoffRecall(item));
      return out.sort((a, b) => a.recalledAt.localeCompare(b.recalledAt));
    },

    async listGovernedHandoffRecallActsByGpra(gpraId) {
      const listed = await storage.listGovernedHandoffRecallActsByGpra(gpraId);
      const out: GovernedHandoffRecallActRecord[] = [];
      for (const item of listed) out.push(await rehydrateTrustedHandoffRecall(item));
      return out.sort((a, b) => a.recalledAt.localeCompare(b.recalledAt));
    },

    async getAuthoritativeHandoffRecallForBinding(bindingId) {
      const listed = await this.listGovernedHandoffRecallActsByBinding(bindingId);
      return selectAuthoritativeGovernedHandoffRecall(listed);
    },

    async evaluateHandoffRecallCurrency(recallActId) {
      const recall = await this.loadGovernedHandoffRecallAct(recallActId);
      if (!recall) {
        throw new OrchestraConstitutionalError(
          "Handoff recall act not found for currency evaluation",
          "invalid_handoff_recall",
          ["FI-DSN-STD-015-R112"],
        );
      }
      let entryCurrency: HandoffEntryCurrency = "stale";
      let bindingCurrency: HandoffConsumerBindingCurrency = "stale";
      try {
        entryCurrency = await this.evaluateHandoffEntryCurrency(recall.entryId);
        bindingCurrency = await this.evaluateHandoffConsumerBindingCurrency(recall.bindingId);
      } catch {
        // Fail closed.
      }
      const authoritative = await this.getAuthoritativeHandoffRecallForBinding(
        recall.bindingId,
      );
      const entryRaw = await storage.getGovernedHandoffEntry(recall.entryId);
      const entry = entryRaw ? await rehydrateTrustedHandoffEntry(entryRaw) : null;
      let gpraValidityPosture: GpraValidityPosture | null = null;
      let lineageMatchesAuthoritativeGpra = false;
      if (entry) {
        const gpra = await findAuthoritativeGpraByObligationContext(
          entry.obligationId,
          entry.handoffConsumerContextId,
        );
        lineageMatchesAuthoritativeGpra = gpra
          ? handoffEntryLineageMatchesGpra(entry, gpra)
          : false;
        if (gpra) {
          gpraValidityPosture = (
            await evaluateGpraValidityForContext(gpra.gpraId, entry.handoffConsumerContextId)
          ).posture;
        }
      }
      return evaluateHandoffRecallCurrencyFromFacts({
        recall,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        authoritativeRecallActId: authoritative?.recallActId ?? null,
        gpraValidityPosture,
        lineageMatchesAuthoritativeGpra,
      });
    },

    async assessGovernedHandoffDownstreamExitBoundary(input) {
      assertNoDownstreamExitAcceptanceMembershipOrExecutionClaims(
        input as unknown as Record<string, unknown>,
      );
      if (
        input.attributedBy != null ||
        input.authorityClassId != null ||
        input.sourceAttribution != null
      ) {
        assertGovernedHandoffDownstreamExitBoundaryActor({
          attributedBy: input.attributedBy ?? "exit-boundary-evaluator",
          authorityClassId: input.authorityClassId ?? "handoff_governance_authority",
          sourceAttribution: input.sourceAttribution,
        });
      }
      const { assessment } = await assessHandoffDownstreamExitBoundaryInternal(input);
      return assessment;
    },

    async attributeGovernedHandoffDownstreamExitBoundary(input) {
      assertNoDownstreamExitAcceptanceMembershipOrExecutionClaims(
        input as unknown as Record<string, unknown>,
      );
      const attributedBy = assertGovernedHandoffDownstreamExitBoundaryActor(input);

      const entryRaw = await storage.getGovernedHandoffEntry(input.entryId);
      if (!entryRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff downstream exit boundary rejected: entry not found",
          "invalid_handoff_downstream_exit_boundary",
          ["FI-DSN-STD-015-R61"],
        );
      }
      const entry = await rehydrateTrustedHandoffEntry(entryRaw);

      const bindingRaw = await storage.getGovernedHandoffConsumerBinding(input.bindingId);
      if (!bindingRaw) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff downstream exit boundary rejected: HCCM binding not found",
          "invalid_handoff_downstream_exit_boundary",
          ["FI-DSN-STD-015-R61"],
        );
      }
      const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);

      if (binding.entryId !== entry.entryId) {
        throw new OrchestraConstitutionalError(
          "Governed Handoff downstream exit boundary rejected: binding does not belong to entry",
          "invalid_handoff_downstream_exit_boundary",
          ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
        );
      }

      const { assessment, posture, completion, preparation } =
        await assessHandoffDownstreamExitBoundaryInternal({
          entryId: input.entryId,
          bindingId: input.bindingId,
          downstreamConsiderationDomain: input.downstreamConsiderationDomain,
        });

      if (!assessment.mayAttribute || !preparation || !posture || !completion) {
        throw new OrchestraConstitutionalError(
          `Governed Handoff downstream exit boundary rejected: ${assessment.denialReasons.join("; ") || "mayAttribute is false"}`,
          "invalid_handoff_downstream_exit_boundary",
          ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R60", "FI-DSN-STD-015-R65"],
        );
      }

      let matchingAuthorization: GovernedHandoffAuthorizationActRecord | null = null;
      if (input.authorizationActId) {
        const authRaw = await storage.getGovernedHandoffAuthorizationAct(
          input.authorizationActId,
        );
        if (authRaw) {
          matchingAuthorization = await rehydrateTrustedHandoffAuthorization(authRaw);
        }
      } else {
        const authActs = await this.listGovernedHandoffAuthorizationActsByEntry(entry.entryId);
        const matching = authActs.filter(
          (a) => a.consumerClassId === binding.consumerClassId,
        );
        matchingAuthorization =
          matching.length > 0
            ? [...matching].sort((a, b) => a.authorizedAt.localeCompare(b.authorizedAt)).at(-1)!
            : null;
      }

      const attribution = createGovernedHandoffDownstreamExitBoundaryAttributionRecord({
        entry,
        binding,
        posture,
        completion,
        authorityClassId: input.authorityClassId,
        attributedBy,
        attributedAt: input.attributedAt,
        downstreamConsiderationDomain: input.downstreamConsiderationDomain,
        authorizationActId: null,
        matchingAuthorization,
        sourceAttribution: input.sourceAttribution,
        acceptDownstream: input.acceptDownstream,
        downstreamAcceptanceId: input.downstreamAcceptanceId,
        membershipAdmission: input.membershipAdmission,
        permanentCollectionMembershipId: input.permanentCollectionMembershipId,
        manufacturingExecution: input.manufacturingExecution,
        manufacturingExecutionId: input.manufacturingExecutionId,
        fulfillment: input.fulfillment,
        fulfillmentExecutionId: input.fulfillmentExecutionId,
        publication: input.publication,
        distribution: input.distribution,
        exitCompleteness: input.exitCompleteness,
        exitCompletenessSatisfactionId: input.exitCompletenessSatisfactionId,
        satisfyExitCompleteness: input.satisfyExitCompleteness,
        suspendHandoff: input.suspendHandoff,
        suspensionActId: input.suspensionActId,
        recallHandoff: input.recallHandoff,
        recallActId: input.recallActId,
        withdrawHandoff: input.withdrawHandoff,
        withdrawalActId: input.withdrawalActId,
        rejectHandoff: input.rejectHandoff,
        rejectHandoffActLayer: input.rejectHandoffActLayer,
        brainExit: input.brainExit,
        implicitExit: input.implicitExit,
        automaticInheritanceExit: input.automaticInheritanceExit,
        inferredEligibilityExit: input.inferredEligibilityExit,
        configurationDrivenExit: input.configurationDrivenExit,
        acceptanceSignalExit: input.acceptanceSignalExit,
        executesHandoff: input.executesHandoff,
        handoffExecuted: input.handoffExecuted,
        performHandoff: input.performHandoff,
        executionQueueId: input.executionQueueId,
        constitutionalQueueId: input.constitutionalQueueId,
        intakeCompletionId: input.intakeCompletionId,
      });

      validatePersistedGovernedHandoffDownstreamExitBoundary(attribution);
      try {
        await storage.putGovernedHandoffDownstreamExitBoundaryAttribution(attribution);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error
            ? error.message
            : "Failed to persist Governed Handoff downstream exit boundary",
          "invalid_handoff_downstream_exit_boundary",
          ["FI-DSN-STD-015-R64"],
        );
      }
      const loaded = await storage.getGovernedHandoffDownstreamExitBoundaryAttribution(
        attribution.exitBoundaryAttributionId,
      );
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Governed Handoff downstream exit boundary",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-015-R64"],
        );
      }
      return rehydrateTrustedHandoffDownstreamExitBoundary(loaded);
    },

    async evaluateDownstreamExitConsideration(bindingId) {
      const bindingRaw = await storage.getGovernedHandoffConsumerBinding(bindingId);
      if (!bindingRaw) {
        throw new OrchestraConstitutionalError(
          "Downstream exit consideration rejected: HCCM binding not found",
          "invalid_handoff_downstream_exit_boundary",
          ["FI-DSN-STD-015-R61"],
        );
      }
      const binding = await rehydrateTrustedHandoffConsumerBinding(bindingRaw);
      const completions = await this.listGovernedHandoffCompletionActsByBinding(bindingId);
      const authoritativeCompletion =
        selectAuthoritativeGovernedHandoffCompletion(completions);
      let completionIsCurrent = false;
      if (authoritativeCompletion) {
        try {
          completionIsCurrent =
            (await this.evaluateHandoffCompletionCurrency(
              authoritativeCompletion.completionActId,
            )) === "current";
        } catch {
          completionIsCurrent = false;
        }
      }

      const exits =
        await this.listGovernedHandoffDownstreamExitBoundaryAttributionsByBinding(bindingId);
      const authoritativeExit =
        selectAuthoritativeGovernedHandoffDownstreamExitBoundary(exits);
      let exitBoundaryIsCurrent = false;
      if (authoritativeExit) {
        try {
          exitBoundaryIsCurrent =
            (await this.evaluateHandoffDownstreamExitBoundaryCurrency(
              authoritativeExit.exitBoundaryAttributionId,
            )) === "current";
        } catch {
          exitBoundaryIsCurrent = false;
        }
      }

      void binding;
      return evaluateDownstreamExitConsiderationFromFacts({
        completion: authoritativeCompletion,
        completionIsCurrent,
        authoritativeExitBoundary: authoritativeExit,
        exitBoundaryIsCurrent,
      });
    },

    async evaluateHandoffDownstreamExitBoundary(bindingId) {
      return this.evaluateDownstreamExitConsideration(bindingId);
    },

    async loadGovernedHandoffDownstreamExitBoundaryAttribution(exitBoundaryAttributionId) {
      const loaded = await storage.getGovernedHandoffDownstreamExitBoundaryAttribution(
        exitBoundaryAttributionId,
      );
      if (!loaded) return null;
      return rehydrateTrustedHandoffDownstreamExitBoundary(loaded);
    },

    async listGovernedHandoffDownstreamExitBoundaryAttributionsByBinding(bindingId) {
      const listed =
        await storage.listGovernedHandoffDownstreamExitBoundaryAttributionsByBinding(
          bindingId,
        );
      const out: GovernedHandoffDownstreamExitBoundaryAttributionRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffDownstreamExitBoundary(item));
      }
      return out.sort((a, b) => a.attributedAt.localeCompare(b.attributedAt));
    },

    async listGovernedHandoffDownstreamExitBoundaryAttributionsByEntry(entryId) {
      const listed =
        await storage.listGovernedHandoffDownstreamExitBoundaryAttributionsByEntry(entryId);
      const out: GovernedHandoffDownstreamExitBoundaryAttributionRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffDownstreamExitBoundary(item));
      }
      return out.sort((a, b) => a.attributedAt.localeCompare(b.attributedAt));
    },

    async listGovernedHandoffDownstreamExitBoundaryAttributionsByGpra(gpraId) {
      const listed =
        await storage.listGovernedHandoffDownstreamExitBoundaryAttributionsByGpra(gpraId);
      const out: GovernedHandoffDownstreamExitBoundaryAttributionRecord[] = [];
      for (const item of listed) {
        out.push(await rehydrateTrustedHandoffDownstreamExitBoundary(item));
      }
      return out.sort((a, b) => a.attributedAt.localeCompare(b.attributedAt));
    },

    async getAuthoritativeHandoffDownstreamExitBoundaryForBinding(bindingId) {
      const listed =
        await this.listGovernedHandoffDownstreamExitBoundaryAttributionsByBinding(bindingId);
      return selectAuthoritativeGovernedHandoffDownstreamExitBoundary(listed);
    },

    async evaluateHandoffDownstreamExitBoundaryCurrency(exitBoundaryAttributionId) {
      const attribution =
        await this.loadGovernedHandoffDownstreamExitBoundaryAttribution(
          exitBoundaryAttributionId,
        );
      if (!attribution) {
        throw new OrchestraConstitutionalError(
          "Downstream exit boundary attribution not found for currency evaluation",
          "invalid_handoff_downstream_exit_boundary",
          ["FI-DSN-STD-015-R64"],
        );
      }
      let entryCurrency: HandoffEntryCurrency;
      try {
        entryCurrency = await this.evaluateHandoffEntryCurrency(attribution.entryId);
      } catch {
        entryCurrency = "stale";
      }
      let bindingCurrency: HandoffConsumerBindingCurrency;
      try {
        bindingCurrency = await this.evaluateHandoffConsumerBindingCurrency(
          attribution.bindingId,
        );
      } catch {
        bindingCurrency = "stale";
      }
      let completionCurrency: HandoffCompletionCurrency;
      try {
        completionCurrency = await this.evaluateHandoffCompletionCurrency(
          attribution.completionActId,
        );
      } catch {
        completionCurrency = "stale";
      }
      let postureCurrency: HandoffPostureDeclarationCurrency;
      try {
        postureCurrency = await this.evaluateHandoffPostureDeclarationCurrency(
          attribution.postureDeclarationActId,
        );
      } catch {
        postureCurrency = "stale";
      }
      const authoritative =
        await this.getAuthoritativeHandoffDownstreamExitBoundaryForBinding(
          attribution.bindingId,
        );
      return evaluateHandoffDownstreamExitBoundaryCurrencyFromFacts({
        attribution,
        currentEntryCurrency: entryCurrency,
        currentBindingCurrency: bindingCurrency,
        currentCompletionCurrency: completionCurrency,
        currentPostureCurrency: postureCurrency,
        authoritativeExitBoundaryAttributionId:
          authoritative?.exitBoundaryAttributionId ?? null,
      });
    },

    async evaluateHandoffAuthorityBoundary() {
      return evaluateHandoffAuthorityBoundaryFromFacts();
    },

    async assessHandoffAuthorityCatalogIntegration() {
      return assessHandoffAuthorityCatalogIntegrationFromCatalog();
    },

    async assessHofG6U1SharedLifecycleFoundation() {
      return assessHofG6U1SharedLifecycleFoundationFromModule();
    },
  };
}
