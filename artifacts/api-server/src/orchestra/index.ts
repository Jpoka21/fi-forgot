/**
 * F.I. Forgot Orchestra — constitutional runtime foundation.
 *
 * Governed implementation of Volume 06 Domain 1 per FI-DSN-STD-012.
 * Distinct from the pre-existing Brain orchestrator (artifacts/api-server/src/brain/orchestrator.ts).
 *
 * Public API review (ORCH-IMP-002.2):
 * REMOVED from primary barrel: createInMemoryDomain1Storage, Domain1StoragePort,
 *   executeGovernedProgramSplit, recordProgramAmendment, createProductionObligation —
 *   enable repository invariant bypass.
 * REMOVED (ORCH-IMP-002): createProductionIntentId, createProductionProgramId,
 *   createProductionObligationId, createGovernanceTraceability, INTENT_TRANSITIONS,
 *   PROGRAM_TRANSITIONS, mergeComplianceBoundaryConflicts.
 * Primary integration entry point: createDomain1Repository().
 */

export {
  ORCHESTRA_ARCHITECTURAL_DOMAIN,
  ORCHESTRA_DOMAIN_CLASSIFICATION,
  ORCHESTRA_GOVERNING_STANDARD,
  ORCHESTRA_GOVERNING_STANDARD_VERSION,
  type GovernanceTraceability,
  type Std012RequirementId,
} from "./authority.js";

export {
  bindComplianceBoundary,
  detectComplianceBoundaryConflicts,
  assertComplianceBoundaryConflictsSurfaced,
  validateComplianceBoundariesForExplorationEntry,
  COMPLIANCE_BOUNDARY_TRACEABILITY,
  type ComplianceBoundaryBinding,
  type UnresolvedConstraintRecord,
} from "./compliance-boundary.js";

export {
  DOMAIN3_GPRA_GRANT_DEFERRED,
  DOMAIN3_REVIEW_DETERMINATION_DEFERRED,
  DOMAIN3_QUEUE_WORKER_DEFERRED,
  DOMAIN3_IMPLEMENTATION_DEFERRED,
  DOMAIN4_IMPLEMENTATION_DEFERRED,
  evaluateDomain2Readiness,
  type Domain2RealizationReadiness,
} from "./domain2-boundary.js";

export {
  DOMAIN2_ARCHITECTURAL_DOMAIN,
  DOMAIN2_DOMAIN_CLASSIFICATION,
  DOMAIN2_GOVERNING_STANDARD,
  DOMAIN2_GOVERNING_STANDARD_VERSION,
  type Domain2GovernanceTraceability,
  type Std013RequirementId,
} from "./domain2-authority.js";

export {
  DOMAIN3_ARCHITECTURAL_DOMAIN,
  DOMAIN3_DOMAIN_CLASSIFICATION,
  DOMAIN3_GOVERNING_STANDARD,
  DOMAIN3_GOVERNING_STANDARD_VERSION,
  type Domain3GovernanceTraceability,
  type Std014RequirementId,
} from "./domain3-authority.js";

export {
  REVIEW_ENTRY_ELIGIBILITY_TRACEABILITY,
  GPRA_GRANT_DEFERRED,
  REVIEW_DETERMINATION_DEFERRED,
  REVIEW_QUEUE_WORKER_DEFERRED,
  DOMAIN3_HANDOFF_DEFERRED,
} from "./review-entry-eligibility.js";

export {
  MANDATORY_REVIEW_DIMENSION_IDS,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  listMandatoryReviewDimensionIds,
  isMandatoryReviewDimensionId,
  REVIEW_ACTIVITY_TRACEABILITY,
  GOVERNED_NON_CORE_DIMENSION_ACTIVATION_DEFERRED,
  type MandatoryReviewDimensionId,
  type ReviewEvidenceCategoryId,
} from "./review-dimensions.js";

export {
  FROZEN_BINDING_FI_MFG_STANDARDS,
  createFrozenManufacturingAuthoritySource,
  assertFrozenBindingManufacturingAuthority,
  isCanonicalFrozenBindingFiMfgStandardId,
  resolveCanonicalFrozenBindingBoundary,
  MANUFACTURING_VALIDATION_DEFERRED,
  FULFILLMENT_EXECUTION_DEFERRED,
  type ManufacturingAuthoritySource,
  type ManufacturingComplianceBoundaryReference,
  type ManufacturingAuthorityBindingPosture,
} from "./manufacturing-authority.js";

export {
  DESIGN_TIME_FEASIBILITY_TRACEABILITY,
  DESIGN_TIME_FEASIBILITY_DIMENSION_ID,
  resolveApplicableManufacturingBoundaries,
} from "./design-time-feasibility.js";

export {
  FROZEN_ESTABLISHED_APPROVAL_AUTHORITY_CLASSES,
  isCanonicalEstablishedApprovalAuthorityClassId,
  assertEstablishedApprovalAuthorityClass,
  resolveEstablishedApprovalAuthorityClass,
} from "./approval-authority.js";

export {
  MANDATORY_APPROVAL_WITHHOLDING_GROUND_FAMILIES,
  isMandatoryApprovalWithholdingGroundFamily,
} from "./approval-withholding-grounds.js";

export {
  APPROVAL_AND_GPRA_TRACEABILITY,
  evaluateApprovalConsiderationEligibility,
} from "./approval-and-gpra.js";

export {
  FROZEN_ESTABLISHED_DOWNSTREAM_DISPOSITION_AUTHORITY_CLASSES,
  isCanonicalEstablishedDownstreamDispositionAuthorityClassId,
  assertEstablishedDownstreamDispositionAuthorityClass,
  resolveEstablishedDownstreamDispositionAuthorityClass,
} from "./downstream-disposition-authority.js";

export {
  FROZEN_ROUTE_C_RETURN_AUTHORIZING_SOURCES,
  isFrozenRouteCReturnAuthorizingSource,
} from "./route-c-return-authority.js";

export {
  MANDATORY_GOVERNED_DEFICIENCY_FAMILIES,
  isMandatoryGovernedDeficiencyFamily,
} from "./deficiency-families.js";

export {
  DOWNSTREAM_DISPOSITION_TRACEABILITY,
  evaluateDownstreamDispositionEligibility,
} from "./downstream-disposition.js";

export {
  FROZEN_ESTABLISHED_INVALIDATION_AUTHORITY_CLASSES,
  isCanonicalEstablishedInvalidationAuthorityClassId,
  assertEstablishedInvalidationAuthorityClass,
  resolveEstablishedInvalidationAuthorityClass,
} from "./invalidation-authority.js";

export {
  MANDATORY_INVALIDATION_TRIGGER_FAMILIES,
  isMandatoryInvalidationTriggerFamily,
} from "./invalidation-trigger-families.js";

export {
  GPRA_RETENTION_AND_INVALIDATION_TRACEABILITY,
  evaluateGpraValidityFromInvalidation,
} from "./gpra-retention-and-invalidation.js";

export {
  FROZEN_ESTABLISHED_SUPERSESSION_AUTHORITY_CLASSES,
  isCanonicalEstablishedSupersessionAuthorityClassId,
  assertEstablishedSupersessionAuthorityClass,
  resolveEstablishedSupersessionAuthorityClass,
} from "./supersession-authority.js";

export {
  MANDATORY_SUPERSESSION_TRIGGER_FAMILIES,
  isMandatorySupersessionTriggerFamily,
} from "./supersession-trigger-families.js";

export {
  GPRA_SUPERSESSION_AND_SUCCESSION_TRACEABILITY,
  evaluateGpraValidityFromPostureActs,
} from "./gpra-supersession-and-succession.js";

export {
  DOMAIN3_DECISION_STAGES,
  DOMAIN3_BRAIN_OUTPUT_CLASSES,
  DOMAIN3_STAGE_ALLOWED_OUTPUT_CLASSES,
  FORBIDDEN_BRAIN_DOMAIN3_CONSTITUTIONAL_ACTIONS,
  assertDecisionStage,
  assertOutputClassAllowedForStage,
  isDomain3DecisionStage,
  isDomain3BrainOutputClass,
  isForbiddenBrainDomain3ConstitutionalAction,
  rejectBrainDomain3ConstitutionalMutationAttempt,
  type ForbiddenBrainDomain3ConstitutionalAction,
} from "./brain-domain3-decision-stage.js";

export {
  GPRA_BRAIN_DECISION_STAGE_TRACEABILITY,
  DOMAIN3_BRAIN_REEVALUATION_REQUEST_TYPES,
  DOMAIN3_BRAIN_AUTHORITY_ROUTE_KINDS,
  DOMAIN3_REEVALUATION_REQUEST_ROUTE,
  DOMAIN3_REEVALUATION_REQUEST_ALLOWED_STAGES,
  assertBrainDoesNotOverrideConstitutionalAuthority,
  isDomain3BrainReevaluationRequestType,
  isDomain3BrainAuthorityRouteKind,
} from "./brain-domain3-advisory.js";

export {
  GOVERNED_HANDOFF_PREPARATION_TRACEABILITY,
  HANDOFF_CONSUMER_CATEGORY_KEYS,
  HANDOFF_ELIGIBILITY_LAYER_CONDITIONS,
  isHandoffConsumerCategoryKey,
  isHandoffEligibilityLayerCondition,
  assertHandoffConsumerCategoryKeys,
  assessGovernedHandoffEligibility,
  evaluateHandoffPreparationCurrencyFromFacts,
  buildHandoffValidityExport,
  buildHandoffEvidencePackage,
} from "./handoff-preparation.js";

export {
  GOVERNED_HANDOFF_ENTRY_TRACEABILITY,
  HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS,
  HOF_P_DISTINCTIONS_PRESERVED,
  HOF_G1_BOUNDARY_INVARIANTS,
  isHandoffDeferredPrincipalSubject,
  isHandoffHofPDistinctionId,
  assessGovernedHandoffEntry,
  evaluateHandoffEntryCurrencyFromFacts,
  handoffEntryLineageMatchesGpra,
} from "./handoff-entry.js";

export {
  GOVERNED_HANDOFF_EVIDENCE_CONSUMPTION_TRACEABILITY,
  HANDOFF_EVIDENCE_MODELS,
  DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES,
  isHandoffEvidenceModelId,
  isDeferredHoemOperativeRecordClass,
  assessGovernedHandoffEvidenceConsumption,
  evaluateHandoffEvidenceConsumptionCurrencyFromFacts,
} from "./handoff-evidence-consumption.js";

export {
  STD015_GOVERNING_STANDARD,
  STD015_GOVERNING_STANDARD_VERSION,
  STD015_DOMAIN_CLASSIFICATION,
  STD015_ARCHITECTURAL_DOMAIN,
  createStd015GovernanceTraceability,
  type Std015RequirementId,
  type Std015GovernanceTraceability,
} from "./std015-authority.js";

export {
  REVIEW_DETERMINATION_TRACEABILITY,
  LEGAL_REVIEW_DETERMINATION_OUTCOMES,
  isLegalReviewDeterminationOutcome,
  reviewDeterminationConstitutesApprovalOrGpra,
} from "./review-determination.js";

export {
  createDomain3Repository,
  type Domain3Repository,
  type Domain2ReviewEntrySource,
  type Domain1ProgramSource,
} from "./persistence/domain3-repository.js";

export type {
  ProductionReadinessReview,
  ProductionReadinessReviewId,
  ProductionReadinessReviewPosture,
  ReviewEntryEligibilityStatus,
  Domain2ReviewEntryEvidence,
  Domain3GovernedCreationMarker,
  ReviewEvidenceId,
  ReviewDimensionActivityId,
  ReviewDeterminationId,
  ReviewDeterminationOutcome,
  ReviewDeterminationRecord,
  ReviewEvidenceSourceKind,
  ReviewEvidenceRecord,
  ReviewDimensionActivityRecord,
  MandatoryReviewActivityCompleteness,
  DesignTimeFeasibilityEvaluationId,
  DesignTimeFeasibilityEvaluationRecord,
  DesignTimeFeasibilityObservationKind,
  ApprovalActId,
  ApprovalWithholdingId,
  GpraId,
  ApprovalAuthorityClassId,
  ApprovalAuthorityConstitutionalScope,
  ApprovalWithholdingGroundFamily,
  ApprovalConsiderationEligibility,
  ApprovalActRecord,
  ApprovalWithholdingRecord,
  GpraGrantRecord,
  DownstreamDeficiencyRecordId,
  ReworkAuthorizationId,
  ReworkAuthorizationWithholdingId,
  ReturnPostureId,
  ResubmissionEligibilityId,
  DownstreamDispositionConstitutionalScope,
  DownstreamDispositionAuthorityClassId,
  GovernedDeficiencyFamily,
  DownstreamDispositionRoute,
  ReturnPostureKind,
  DownstreamDeficiencyRecord,
  ReworkAuthorizationRecord,
  ReworkAuthorizationWithholdingRecord,
  ReturnPostureRecord,
  ResubmissionEligibilityRecord,
  DownstreamDispositionEligibility,
  GpraInvalidationActId,
  GpraInvalidationActRecord,
  GpraSupersessionActId,
  GpraSupersessionActRecord,
  GpraValidityAssessment,
  GpraValidityPosture,
  InvalidationTriggerFamily,
  InvalidationAuthorityConstitutionalScope,
  InvalidationAuthorityClassId,
  SupersessionTriggerFamily,
  SupersessionAuthorityConstitutionalScope,
  SupersessionAuthorityClassId,
  Domain3BrainAdvisoryId,
  Domain3BrainAdvisoryRecord,
  Domain3DecisionStage,
  Domain3BrainOutputClass,
  Domain3BrainReevaluationRequestType,
  Domain3BrainAuthorityRouteKind,
  Domain3BrainSourceAttribution,
  GovernedHandoffPreparationId,
  GovernedHandoffPreparationRecord,
  GovernedHandoffEligibilityAssessment,
  GovernedHandoffEntryId,
  GovernedHandoffEntryRecord,
  GovernedHandoffEntryAssessment,
  GovernedHandoffEvidenceConsumptionId,
  GovernedHandoffEvidenceConsumptionRecord,
  GovernedHandoffEvidenceConsumptionAssessment,
  HandoffConsumerCategoryKey,
  HandoffEligibilityLayerCondition,
  HandoffPreparationCurrency,
  HandoffEntryCurrency,
  HandoffEvidenceConsumptionCurrency,
  HandoffDeferredPrincipalSubject,
  HandoffHofPDistinctionId,
  HandoffEvidenceModelId,
  DeferredHoemOperativeRecordClass,
  HandoffValidityExportSnapshot,
  HandoffEvidencePackageRefs,
} from "./domain3-types.js";

/**
 * ORCH-IMP-004: Raw governed Domain 2 chain functions removed from primary barrel.
 * Integration path: createDomain2Repository(domain1).
 * Internal/tests may import module-local paths.
 */
export {
  EXPLORATION_POSTURE_BYPASS_EFFECT,
  EXPLORATION_POSTURE_TRACEABILITY,
} from "./exploration-posture.js";

export { REALIZATION_COMMITMENT_TRACEABILITY } from "./realization-commitment.js";

export { REALIZED_VISUAL_ARTIFACT_TRACEABILITY } from "./realized-visual-artifact.js";

export {
  REALIZATION_TRACEABILITY_PACKAGE_TRACEABILITY,
} from "./traceability-package.js";

export { REVIEW_ENTRY_READINESS_TRACEABILITY } from "./review-entry-readiness.js";

export {
  SHARED_SOURCE_LINKAGE_TRACEABILITY,
} from "./shared-source-linkage.js";

export {
  COMPLIANCE_BOUNDARY_CHANGE_TRACEABILITY,
} from "./compliance-boundary-change.js";

export {
  LICENSED_ACQUIRED_INTAKE_TRACEABILITY,
} from "./licensed-acquired-intake.js";

export {
  EXTERNAL_REWORK_TRIGGER_TRACEABILITY,
} from "./rework-trigger.js";

export {
  validateBrainDomain2Proposal,
  rejectBrainConstitutionalMutationAttempt,
  isForbiddenBrainDomain2Action,
  type BrainDomain2Proposal,
  type BrainDomain2ProposalKind,
  type ForbiddenBrainDomain2Action,
} from "./brain-consumer-boundary.js";

export {
  createDomain2Repository,
  type Domain2Repository,
} from "./persistence/domain2-repository.js";

export {
  determineExplorationEntry,
  assertExplorationEntryNotAssumed,
  EXPLORATION_ENTRY_TRACEABILITY,
  type ExplorationEntryDetermination,
} from "./exploration-entry.js";

export {
  OrchestraConstitutionalError,
  isOrchestraConstitutionalError,
  type OrchestraErrorCode,
} from "./errors.js";

export {
  createDomain1Repository,
  type Domain1Repository,
} from "./persistence/domain1-repository.js";

export type { StoredExplorationEntry } from "./persistence/rehydration.js";

export {
  declareProductionIntent,
  recordIntentChange,
  PRODUCTION_INTENT_TRACEABILITY,
  type DeclaredProductionIntent,
  type IntentChangeRecord,
} from "./production-intent.js";

export {
  resolveObligationConstraint,
  PRODUCTION_OBLIGATION_TRACEABILITY,
  type ProductionObligation,
} from "./production-obligation.js";

export {
  draftProductionProgram,
  addObligationToProgram,
  bindComplianceBoundariesToProgram,
  governProductionProgram,
  supersedeProductionProgram,
  invalidateProductionProgram,
  isCurrentProgram,
  PRODUCTION_PROGRAM_TRACEABILITY,
  type ProductionProgram,
  type ProgramAmendmentRecord,
} from "./production-program.js";

export { createSuccessorProgramId } from "./program-split.js";

export {
  assertIntentPostureTransition,
  assertProgramPostureTransition,
  assertProgramIsActiveAuthority,
  isTerminalProgramPosture,
  isActiveProgramPosture,
} from "./transitions.js";

export type {
  ConstitutionalAttribution,
  ConstitutionalAuditMetadata,
  CurrentProgramStatus,
  ExplorationDeterminationStatus,
  ExplorationEntryPosture,
  GovernanceWaiverGrantMarker,
  ObligationEnforcementPosture,
  ObligationResolutionRecord,
  ProductionIntentId,
  ProductionIntentPosture,
  ProductionObligationId,
  ProductionProgramId,
  ProductionProgramPosture,
  ProgramAmendmentMateriality,
  ProgramSplitRecord,
  ProgramTerminalTransition,
  WaiverSourceAttribution,
} from "./types.js";

export type {
  Domain1EntryEvidence,
  Domain2GovernedCreationMarker,
  ExplorationPostureRecord,
  ExplorationPostureRecordId,
  ExplorationPostureStatus,
  RealizationCommitment,
  RealizationCommitmentId,
  RealizationPath,
  RealizationPostureStatus,
  RealizationTraceabilityPackage,
  RealizedVisualArtifact,
  RealizedVisualArtifactId,
  ReviewEntryReadiness,
  ReviewEntryReadinessId,
  RvaExecutablePosture,
  RvaExistsPromotionRecord,
  RvaTerminalTransition,
  RvaVersionLineage,
  SharedSourceLinkageId,
  SharedSourceLinkageRecord,
  ComplianceBoundaryChangeEvent,
  ComplianceBoundaryChangeEventId,
  ComplianceBoundaryChangeConsequence,
  LicensedAcquiredIntakeId,
  LicensedAcquiredRightsPosture,
  ExternalReworkTriggerId,
  ExternalReworkTriggerRecord,
  TraceabilityWaiverEvidence,
  TraceabilityExplorationPostureEntry,
  TraceabilityDomain2DecisionEntry,
} from "./domain2-types.js";

export {
  exceptionIsNotWaiver,
  grantWaiver,
  recordException,
  WAIVER_TRACEABILITY,
  type ExceptionRecord,
  type WaiverAuthorityClass,
  type WaiverRecord,
} from "./waiver.js";
