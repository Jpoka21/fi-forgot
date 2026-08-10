/**
 * F.I. Forgot Orchestra — constitutional runtime foundation.
 *
 * Governed implementation of Volume 06 Domain 1 per FI-DSN-STD-012.
 * Distinct from the pre-existing Brain orchestrator (artifacts/api-server/src/brain/orchestrator.ts).
 */

export {
  ORCHESTRA_ARCHITECTURAL_DOMAIN,
  ORCHESTRA_DOMAIN_CLASSIFICATION,
  ORCHESTRA_GOVERNING_STANDARD,
  ORCHESTRA_GOVERNING_STANDARD_VERSION,
  createGovernanceTraceability,
  type GovernanceTraceability,
  type Std012RequirementId,
} from "./authority.js";

export {
  bindComplianceBoundary,
  detectComplianceBoundaryConflicts,
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
  declareProductionIntent,
  recordIntentChange,
  createProductionIntentId,
  PRODUCTION_INTENT_TRACEABILITY,
  type DeclaredProductionIntent,
  type IntentChangeRecord,
} from "./production-intent.js";

export {
  createProductionObligation,
  createProductionObligationId,
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
  createProductionProgramId,
  PRODUCTION_PROGRAM_TRACEABILITY,
  type ProductionProgram,
  type ProgramAmendmentRecord,
} from "./production-program.js";

export {
  assertIntentPostureTransition,
  assertProgramPostureTransition,
  assertProgramIsActiveAuthority,
  isTerminalProgramPosture,
  isActiveProgramPosture,
  INTENT_TRANSITIONS,
  PROGRAM_TRANSITIONS,
} from "./transitions.js";

export type {
  ConstitutionalAttribution,
  ConstitutionalAuditMetadata,
  CurrentProgramStatus,
  ExplorationEntryPosture,
  ObligationEnforcementPosture,
  ProductionIntentId,
  ProductionIntentPosture,
  ProductionObligationId,
  ProductionProgramId,
  ProductionProgramPosture,
  ProgramAmendmentMateriality,
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
