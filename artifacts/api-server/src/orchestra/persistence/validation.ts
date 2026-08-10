/**
 * Runtime validation at the Domain 1 persistence boundary.
 * Validates identity shape — not constitutional authority.
 */

import type { GovernanceTraceability } from "../authority.js";
import type { ComplianceBoundaryBinding, UnresolvedConstraintRecord } from "../compliance-boundary.js";
import { OrchestraConstitutionalError } from "../errors.js";
import type { ExplorationEntryDetermination } from "../exploration-entry.js";
import type { DeclaredProductionIntent } from "../production-intent.js";
import type { ProductionObligation } from "../production-obligation.js";
import type { ProductionProgram } from "../production-program.js";
import type {
  ConstitutionalAttribution,
  ConstitutionalAuditMetadata,
  CurrentProgramStatus,
  ExplorationDeterminationStatus,
  ExplorationEntryPosture,
  ObligationEnforcementPosture,
  ObligationResolutionRecord,
  ProductionIntentPosture,
  ProductionProgramPosture,
  ProgramAmendmentMateriality,
  ProgramSplitRecord,
  ProgramTerminalTransition,
} from "../types.js";
import type { ExceptionRecord, WaiverRecord } from "../waiver.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ID_PREFIXES = {
  intent: "intent-",
  program: "program-",
  obligation: "obligation-",
  waiver: "waiver-",
  exception: "exception-",
  split: "split-",
  exploration: "exploration-entry-",
  amendment: "amendment-",
} as const;

export function validateIntentIdShape(id: unknown): asserts id is string {
  assertBrandedId(id, ID_PREFIXES.intent, "Production Intent");
}

export function validateProgramIdShape(id: unknown): asserts id is string {
  assertBrandedId(id, ID_PREFIXES.program, "Production Program");
}

export function validateObligationIdShape(id: unknown): asserts id is string {
  assertBrandedId(id, ID_PREFIXES.obligation, "Production Obligation");
}

export function validateWaiverIdShape(id: unknown): asserts id is string {
  assertBrandedId(id, ID_PREFIXES.waiver, "Waiver");
}

function assertBrandedId(id: unknown, prefix: string, label: string): void {
  if (typeof id !== "string" || !id.startsWith(prefix)) {
    throw new OrchestraConstitutionalError(
      `Invalid ${label} identifier shape`,
      "identity_violation",
      ["FI-DSN-STD-012-R37"],
    );
  }
  const uuidPart = id.slice(prefix.length);
  if (!UUID_PATTERN.test(uuidPart)) {
    throw new OrchestraConstitutionalError(
      `Malformed ${label} identifier`,
      "identity_violation",
      ["FI-DSN-STD-012-R37"],
    );
  }
}

const INTENT_POSTURES: readonly ProductionIntentPosture[] = [
  "intent_undeclared",
  "intent_declared",
];

const PROGRAM_POSTURES: readonly ProductionProgramPosture[] = [
  "program_drafted",
  "program_governed",
  "program_conditionally_governed",
  "program_amended",
  "program_superseded",
  "program_invalidated",
];

const EXPLORATION_POSTURES: readonly ExplorationEntryPosture[] = [
  "exploration_entry_authorized",
  "exploration_entry_withheld",
  "conditionally_authorized",
];

const OBLIGATION_POSTURES: readonly ObligationEnforcementPosture[] = [
  "unconditional",
  "conditional",
  "waived",
  "unresolved_constraint",
];

const CURRENT_STATUSES: readonly CurrentProgramStatus[] = [
  "current",
  "superseded",
  "invalidated",
];

const AMENDMENT_MATERIALITIES: readonly ProgramAmendmentMateriality[] = [
  "material",
  "nonmaterial",
];

const EXPLORATION_STATUSES: readonly ExplorationDeterminationStatus[] = [
  "active",
  "superseded",
];

function assertNonEmptyString(
  value: unknown,
  field: string,
): asserts value is string {
  if (typeof value !== "string" || !value.trim()) {
    throw new OrchestraConstitutionalError(
      `Invalid persisted state: ${field} is required`,
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R37", "FI-DSN-STD-012-R38"],
    );
  }
}

function assertEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): asserts value is T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new OrchestraConstitutionalError(
      `Invalid persisted state: unknown ${field} value`,
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R38"],
    );
  }
}

function validateAuditMetadata(audit: unknown): asserts audit is ConstitutionalAuditMetadata {
  if (!audit || typeof audit !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: audit metadata required",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R37", "FI-DSN-STD-012-R39"],
    );
  }
  const record = audit as Record<string, unknown>;
  assertNonEmptyString(record.createdAt, "audit.createdAt");
  assertNonEmptyString(record.createdBy, "audit.createdBy");
  validateTraceability(record.traceability);
}

function validateTraceability(traceability: unknown): asserts traceability is GovernanceTraceability {
  if (!traceability || typeof traceability !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: traceability required",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R37"],
    );
  }
  const record = traceability as Record<string, unknown>;
  if (record.governingStandardId !== "FI-DSN-STD-012") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: traceability governing standard",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R37"],
    );
  }
  if (!Array.isArray(record.requirementIds)) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: traceability requirement IDs",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R37"],
    );
  }
}

function validateAttribution(
  attribution: unknown,
): asserts attribution is ConstitutionalAttribution {
  if (!attribution || typeof attribution !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: attribution required",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R37"],
    );
  }
  const record = attribution as Record<string, unknown>;
  assertNonEmptyString(record.actorId, "attribution.actorId");
  assertNonEmptyString(record.recordedAt, "attribution.recordedAt");
  assertNonEmptyString(record.basis, "attribution.basis");
}

function validateTerminalTransition(
  transition: unknown,
): asserts transition is ProgramTerminalTransition | null {
  if (transition === null) return;
  if (!transition || typeof transition !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: terminal transition",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R38"],
    );
  }
  const record = transition as Record<string, unknown>;
  if (record.kind !== "superseded" && record.kind !== "invalidated") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: terminal transition kind",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R38"],
    );
  }
  assertNonEmptyString(record.transitionedAt, "terminalTransition.transitionedAt");
  assertNonEmptyString(record.transitionedBy, "terminalTransition.transitionedBy");
  if (record.successorProgramId !== undefined) {
    validateProgramIdShape(record.successorProgramId);
  }
}

function validateComplianceBinding(
  binding: unknown,
): asserts binding is ComplianceBoundaryBinding {
  if (!binding || typeof binding !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: compliance boundary binding",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R22"],
    );
  }
  const record = binding as Record<string, unknown>;
  assertNonEmptyString(record.sourceStandardId, "complianceBoundary.sourceStandardId");
  assertNonEmptyString(record.scopeDescription, "complianceBoundary.scopeDescription");
  assertNonEmptyString(record.boundAt, "complianceBoundary.boundAt");
  assertNonEmptyString(record.boundBy, "complianceBoundary.boundBy");
}

function validateUnresolvedConstraint(
  constraint: unknown,
): asserts constraint is UnresolvedConstraintRecord {
  if (!constraint || typeof constraint !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: unresolved constraint",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R23"],
    );
  }
  const record = constraint as Record<string, unknown>;
  assertNonEmptyString(record.constraintId, "unresolvedConstraint.constraintId");
  assertNonEmptyString(record.description, "unresolvedConstraint.description");
  assertNonEmptyString(record.identifiedAt, "unresolvedConstraint.identifiedAt");
  assertNonEmptyString(record.identifiedBy, "unresolvedConstraint.identifiedBy");
}

function validateResolution(
  resolution: unknown,
): asserts resolution is ObligationResolutionRecord | null {
  if (resolution === null) return;
  if (!resolution || typeof resolution !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: obligation resolution",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R38"],
    );
  }
  const record = resolution as Record<string, unknown>;
  assertNonEmptyString(record.resolution, "resolution.resolution");
  assertNonEmptyString(record.resolvedAt, "resolution.resolvedAt");
  assertNonEmptyString(record.resolvedBy, "resolution.resolvedBy");
}

export function validatePersistedIntent(
  intent: unknown,
): asserts intent is DeclaredProductionIntent {
  if (!intent || typeof intent !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: Production Intent",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R07"],
    );
  }
  const record = intent as Record<string, unknown>;
  validateIntentIdShape(record.id);
  assertEnumValue(record.posture, INTENT_POSTURES, "intent posture");
  assertNonEmptyString(record.purpose, "intent.purpose");
  if (!Array.isArray(record.governingConstraints)) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: intent governing constraints",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R08"],
    );
  }
  validateAuditMetadata(record.audit);
}

export function validatePersistedObligation(
  obligation: unknown,
  expectedProgramId?: string,
): asserts obligation is ProductionObligation {
  if (!obligation || typeof obligation !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: Production Obligation",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R16"],
    );
  }
  const record = obligation as Record<string, unknown>;
  validateObligationIdShape(record.id);
  validateProgramIdShape(record.programId);
  if (expectedProgramId && record.programId !== expectedProgramId) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: obligation program relationship",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R16", "FI-DSN-STD-012-R17"],
    );
  }
  assertNonEmptyString(record.description, "obligation.description");
  assertEnumValue(record.enforcementPosture, OBLIGATION_POSTURES, "obligation enforcement posture");
  validateAuditMetadata(record.audit);
  validateResolution(record.resolution ?? null);
  if (record.enforcementPosture === "waived") {
    validateWaiverIdShape(record.waiverRecordId);
  }
}

export function validatePersistedProgram(
  program: unknown,
): asserts program is ProductionProgram {
  if (!program || typeof program !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: Production Program",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R13"],
    );
  }
  const record = program as Record<string, unknown>;
  validateProgramIdShape(record.id);
  validateIntentIdShape(record.intentId);
  assertEnumValue(record.posture, PROGRAM_POSTURES, "program posture");
  assertEnumValue(record.currentStatus, CURRENT_STATUSES, "current status");
  assertNonEmptyString(record.constitutionalPurpose, "program.constitutionalPurpose");
  validateAuditMetadata(record.audit);
  validateTerminalTransition(record.terminalTransition ?? null);

  if (!Array.isArray(record.complianceBoundaries)) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: compliance boundaries",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R22"],
    );
  }
  for (const binding of record.complianceBoundaries) {
    validateComplianceBinding(binding);
  }

  if (!Array.isArray(record.obligations)) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: obligations",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R16"],
    );
  }
  for (const obligation of record.obligations) {
    validatePersistedObligation(obligation, record.id as string);
  }

  if (!Array.isArray(record.unresolvedConstraints)) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: unresolved constraints",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R23"],
    );
  }
  for (const constraint of record.unresolvedConstraints) {
    validateUnresolvedConstraint(constraint);
  }

  if (!Array.isArray(record.amendmentHistory)) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: amendment history",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R34"],
    );
  }
  for (const amendment of record.amendmentHistory) {
    if (!amendment || typeof amendment !== "object") {
      throw new OrchestraConstitutionalError(
        "Invalid persisted state: amendment record",
        "invalid_persistence_state",
        ["FI-DSN-STD-012-R34"],
      );
    }
    const a = amendment as Record<string, unknown>;
    assertEnumValue(a.materiality, AMENDMENT_MATERIALITIES, "amendment materiality");
    assertNonEmptyString(a.reason, "amendment.reason");
    assertNonEmptyString(a.amendedAt, "amendment.amendedAt");
    assertNonEmptyString(a.amendedBy, "amendment.amendedBy");
  }

  if (
    record.posture === "program_superseded" &&
    record.currentStatus !== "superseded"
  ) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: superseded posture requires superseded current status",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R36", "FI-DSN-STD-012-R41"],
    );
  }
  if (
    record.posture === "program_invalidated" &&
    record.currentStatus !== "invalidated"
  ) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: invalidated posture requires invalidated current status",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R36", "FI-DSN-STD-012-R41"],
    );
  }
}

export function validatePersistedWaiver(waiver: unknown): asserts waiver is WaiverRecord {
  if (!waiver || typeof waiver !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: Waiver record",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R31"],
    );
  }
  const record = waiver as Record<string, unknown>;
  validateWaiverIdShape(record.waiverId);
  assertNonEmptyString(record.scope, "waiver.scope");
  assertNonEmptyString(record.constitutionalBasis, "waiver.constitutionalBasis");
  assertNonEmptyString(record.grantedAt, "waiver.grantedAt");
  assertNonEmptyString(record.grantedBy, "waiver.grantedBy");
  if (record.sourceAttribution === "brain_derived") {
    throw new OrchestraConstitutionalError(
      "Brain-derived waiver cannot acquire constitutional authority",
      "invalid_waiver",
      ["FI-DSN-STD-012-R31", "FI-DSN-STD-012-R42"],
    );
  }
}

export function validatePersistedException(
  exception: unknown,
): asserts exception is ExceptionRecord {
  if (!exception || typeof exception !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: Exception record",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R32"],
    );
  }
  const record = exception as Record<string, unknown>;
  if (typeof record.exceptionId !== "string" || !record.exceptionId.startsWith(ID_PREFIXES.exception)) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: exception identifier",
      "identity_violation",
      ["FI-DSN-STD-012-R32"],
    );
  }
  assertNonEmptyString(record.description, "exception.description");
  assertNonEmptyString(record.constitutionalBasis, "exception.constitutionalBasis");
}

export function validatePersistedExplorationDetermination(
  determination: unknown,
): asserts determination is ExplorationEntryDetermination {
  if (!determination || typeof determination !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: Exploration-Entry Determination",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R26"],
    );
  }
  const record = determination as Record<string, unknown>;
  if (
    typeof record.determinationId !== "string" ||
    !record.determinationId.startsWith(ID_PREFIXES.exploration)
  ) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: exploration determination identifier",
      "identity_violation",
      ["FI-DSN-STD-012-R26"],
    );
  }
  validateProgramIdShape(record.programId);
  assertEnumValue(record.posture, EXPLORATION_POSTURES, "exploration posture");
  assertNonEmptyString(record.governingBasis, "exploration.governingBasis");
  validateAttribution(record.attribution);
  validateTraceability(record.traceability);
}

export function validatePersistedProgramSplit(
  split: unknown,
): asserts split is ProgramSplitRecord {
  if (!split || typeof split !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: Program Split record",
      "invalid_persistence_state",
      ["FI-DSN-STD-012-R12"],
    );
  }
  const record = split as Record<string, unknown>;
  if (typeof record.splitId !== "string" || !record.splitId.startsWith(ID_PREFIXES.split)) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: split identifier",
      "identity_violation",
      ["FI-DSN-STD-012-R12"],
    );
  }
  validateIntentIdShape(record.intentId);
  validateProgramIdShape(record.sourceProgramId);
  if (!Array.isArray(record.resultingProgramIds) || record.resultingProgramIds.length === 0) {
    throw new OrchestraConstitutionalError(
      "Invalid persisted state: split must reference resulting programs",
      "invalid_program_split",
      ["FI-DSN-STD-012-R12"],
    );
  }
  for (const programId of record.resultingProgramIds) {
    validateProgramIdShape(programId);
  }
  assertNonEmptyString(record.scopeSeparationReason, "split.scopeSeparationReason");
  assertNonEmptyString(record.splitAuthority, "split.splitAuthority");
  assertNonEmptyString(record.splitAt, "split.splitAt");
  assertNonEmptyString(record.splitBy, "split.splitBy");
  validateAuditMetadata(record.audit);
}

export function validateExplorationDeterminationStatus(
  status: unknown,
): asserts status is ExplorationDeterminationStatus {
  assertEnumValue(status, EXPLORATION_STATUSES, "exploration determination status");
}
