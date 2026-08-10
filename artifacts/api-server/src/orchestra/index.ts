/**
 * F.I. Forgot Orchestra — constitutional runtime foundation.
 *
 * Governed implementation of Volume 06 Domain 1 per FI-DSN-STD-012.
 * Distinct from the pre-existing Brain orchestrator (artifacts/api-server/src/brain/orchestrator.ts).
 *
 * Public API review (ORCH-IMP-002):
 * REMOVED: createProductionIntentId, createProductionProgramId, createProductionObligationId,
 *          createGovernanceTraceability, INTENT_TRANSITIONS, PROGRAM_TRANSITIONS,
 *          mergeComplianceBoundaryConflicts — enable constitutional invariant bypass.
 * ADDED: persistence repository, governed program split, successor program ID.
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
  DOMAIN2_IMPLEMENTATION_DEFERRED,
  DOMAIN3_IMPLEMENTATION_DEFERRED,
  DOMAIN4_IMPLEMENTATION_DEFERRED,
  evaluateDomain2Readiness,
  type Domain2RealizationReadiness,
} from "./domain2-boundary.js";

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

export { createInMemoryDomain1Storage } from "./persistence/in-memory-storage.js";

export type { Domain1StoragePort } from "./persistence/storage-port.js";

export type { StoredExplorationEntry } from "./persistence/rehydration.js";

export {
  declareProductionIntent,
  recordIntentChange,
  PRODUCTION_INTENT_TRACEABILITY,
  type DeclaredProductionIntent,
  type IntentChangeRecord,
} from "./production-intent.js";

export {
  createProductionObligation,
  resolveObligationConstraint,
  PRODUCTION_OBLIGATION_TRACEABILITY,
  type ProductionObligation,
} from "./production-obligation.js";

export {
  draftProductionProgram,
  addObligationToProgram,
  bindComplianceBoundariesToProgram,
  governProductionProgram,
  recordProgramAmendment,
  supersedeProductionProgram,
  invalidateProductionProgram,
  isCurrentProgram,
  PRODUCTION_PROGRAM_TRACEABILITY,
  type ProductionProgram,
  type ProgramAmendmentRecord,
} from "./production-program.js";

export {
  executeGovernedProgramSplit,
  createSuccessorProgramId,
  type GovernedProgramSplitInput,
  type GovernedProgramSplitResult,
  type ProgramSplitBranchDefinition,
} from "./program-split.js";

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

export {
  exceptionIsNotWaiver,
  grantWaiver,
  recordException,
  WAIVER_TRACEABILITY,
  type ExceptionRecord,
  type WaiverAuthorityClass,
  type WaiverRecord,
} from "./waiver.js";
