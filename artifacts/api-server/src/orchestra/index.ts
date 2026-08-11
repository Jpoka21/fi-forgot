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
  createDomain3Repository,
  type Domain3Repository,
  type Domain2ReviewEntrySource,
} from "./persistence/domain3-repository.js";

export type {
  ProductionReadinessReview,
  ProductionReadinessReviewId,
  ProductionReadinessReviewPosture,
  ReviewEntryEligibilityStatus,
  Domain2ReviewEntryEvidence,
  Domain3GovernedCreationMarker,
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
