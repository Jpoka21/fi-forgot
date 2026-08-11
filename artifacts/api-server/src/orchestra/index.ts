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
  achieveExplorationExitReady,
  beginExplorationPosture,
  EXPLORATION_POSTURE_TRACEABILITY,
} from "./exploration-posture.js";

export {
  recordRealizationCommitment,
  REALIZATION_COMMITMENT_TRACEABILITY,
} from "./realization-commitment.js";

export {
  establishRealizedVisualArtifact,
  REALIZED_VISUAL_ARTIFACT_TRACEABILITY,
} from "./realized-visual-artifact.js";

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
  RealizedVisualArtifact,
  RealizedVisualArtifactId,
  RvaVersionLineage,
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
