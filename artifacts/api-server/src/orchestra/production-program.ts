import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import {
  assertComplianceBoundaryConflictsSurfaced,
  mergeComplianceBoundaryConflicts,
  type ComplianceBoundaryBinding,
  type UnresolvedConstraintRecord,
} from "./compliance-boundary.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { DeclaredProductionIntent } from "./production-intent.js";
import {
  createProductionObligation,
  type ProductionObligation,
} from "./production-obligation.js";
import { assertProgramPostureTransition } from "./transitions.js";
import type {
  ConstitutionalAuditMetadata,
  CurrentProgramStatus,
  ProductionProgramId,
  ProductionProgramPosture,
  ProgramAmendmentMateriality,
  ProgramTerminalTransition,
} from "./types.js";

const PROGRAM_REQUIREMENTS = [
  "FI-DSN-STD-012-R11",
  "FI-DSN-STD-012-R12",
  "FI-DSN-STD-012-R13",
  "FI-DSN-STD-012-R14",
  "FI-DSN-STD-012-R15",
] as const;

/** Governed Program Amendment record — R34, R35. */
export interface ProgramAmendmentRecord {
  readonly amendmentId: string;
  readonly materiality: ProgramAmendmentMateriality;
  readonly reason: string;
  readonly amendedAt: string;
  readonly amendedBy: string;
  readonly priorPosture: ProductionProgramPosture;
}

/**
 * Production Program — constitutional container for bounded realization work.
 * FI-DSN-STD-012-R11 through R15.
 */
export interface ProductionProgram {
  readonly id: ProductionProgramId;
  readonly intentId: DeclaredProductionIntent["id"];
  readonly posture: ProductionProgramPosture;
  readonly currentStatus: CurrentProgramStatus;
  readonly constitutionalPurpose: string;
  readonly complianceBoundaries: readonly ComplianceBoundaryBinding[];
  readonly obligations: readonly ProductionObligation[];
  readonly unresolvedConstraints: readonly UnresolvedConstraintRecord[];
  readonly amendmentHistory: readonly ProgramAmendmentRecord[];
  readonly supersededByProgramId: ProductionProgramId | null;
  readonly terminalTransition: ProgramTerminalTransition | null;
  readonly audit: ConstitutionalAuditMetadata;
}

export function createProductionProgramId(): ProductionProgramId {
  return `program-${randomUUID()}` as ProductionProgramId;
}

export function draftProductionProgram(input: {
  intent: DeclaredProductionIntent;
  constitutionalPurpose: string;
  createdBy: string;
  createdAt?: string;
}): ProductionProgram {
  if (input.intent.posture !== "intent_declared") {
    throw new OrchestraConstitutionalError(
      "A governed Production Program requires Declared Production Intent",
      "invalid_program_structure",
      ["FI-DSN-STD-012-R07", "FI-DSN-STD-012-R11"],
    );
  }

  const constitutionalPurpose = input.constitutionalPurpose.trim();
  if (!constitutionalPurpose) {
    throw new OrchestraConstitutionalError(
      "Production Program must declare its bounded constitutional purpose",
      "invalid_program_structure",
      ["FI-DSN-STD-012-R13"],
    );
  }

  const now = input.createdAt ?? new Date().toISOString();
  const programId = createProductionProgramId();

  return Object.freeze({
    id: programId,
    intentId: input.intent.id,
    posture: "program_drafted",
    currentStatus: "current",
    constitutionalPurpose,
    complianceBoundaries: Object.freeze([]),
    obligations: Object.freeze([]),
    unresolvedConstraints: Object.freeze([]),
    amendmentHistory: Object.freeze([]),
    supersededByProgramId: null,
    terminalTransition: null,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.createdBy,
      traceability: createGovernanceTraceability([...PROGRAM_REQUIREMENTS]),
    }),
  });
}

export function addObligationToProgram(
  program: ProductionProgram,
  obligationInput: {
    description: string;
    enforcementPosture?: ProductionObligation["enforcementPosture"];
    conditions?: readonly string[];
    complianceBoundaryRefs?: readonly string[];
    waiverRecordId?: string | null;
    createdBy: string;
  },
): ProductionProgram {
  if (program.posture === "program_superseded" || program.posture === "program_invalidated") {
    throw new OrchestraConstitutionalError(
      "Cannot add obligations to a superseded or invalidated program",
      "program_not_active",
      ["FI-DSN-STD-012-R36", "FI-DSN-STD-012-R41"],
    );
  }

  const obligation = createProductionObligation({
    programId: program.id,
    ...obligationInput,
  });

  return Object.freeze({
    ...program,
    obligations: Object.freeze([...program.obligations, obligation]),
  });
}

export function bindComplianceBoundariesToProgram(
  program: ProductionProgram,
  bindings: readonly ComplianceBoundaryBinding[],
  unresolvedConstraints: readonly UnresolvedConstraintRecord[] = [],
): ProductionProgram {
  if (bindings.length === 0) {
    throw new OrchestraConstitutionalError(
      "Production Program must bind applicable Compliance Boundaries",
      "invalid_compliance_boundary",
      ["FI-DSN-STD-012-R13", "FI-DSN-STD-012-R22"],
    );
  }

  const mergedUnresolved = mergeComplianceBoundaryConflicts(bindings, unresolvedConstraints);

  return Object.freeze({
    ...program,
    complianceBoundaries: Object.freeze([...bindings]),
    unresolvedConstraints: mergedUnresolved,
  });
}

export function governProductionProgram(program: ProductionProgram): ProductionProgram {
  if (program.posture !== "program_drafted" && program.posture !== "program_amended") {
    throw new OrchestraConstitutionalError(
      "Only drafted or amended programs may transition to governed posture",
      "invalid_program_transition",
      ["FI-DSN-STD-012-R13"],
    );
  }

  if (program.obligations.length === 0) {
    throw new OrchestraConstitutionalError(
      "Production Program must contain one or more Production Obligations",
      "invalid_program_structure",
      ["FI-DSN-STD-012-R16"],
    );
  }

  if (program.complianceBoundaries.length === 0) {
    throw new OrchestraConstitutionalError(
      "Production Program must bind Compliance Boundaries before governance",
      "invalid_compliance_boundary",
      ["FI-DSN-STD-012-R13", "FI-DSN-STD-012-R22"],
    );
  }

  assertComplianceBoundaryConflictsSurfaced(
    program.complianceBoundaries,
    program.unresolvedConstraints,
  );

  const hasConditionalOrUnresolved = program.obligations.some(
    (o) =>
      o.enforcementPosture === "conditional" ||
      o.enforcementPosture === "unresolved_constraint",
  );
  const hasUnresolvedConstraints = program.unresolvedConstraints.length > 0;

  const posture: ProductionProgramPosture =
    hasConditionalOrUnresolved || hasUnresolvedConstraints
      ? "program_conditionally_governed"
      : "program_governed";

  assertProgramPostureTransition(program.posture, posture);

  return Object.freeze({
    ...program,
    posture,
  });
}

export function recordProgramAmendment(
  program: ProductionProgram,
  input: {
    materiality: ProgramAmendmentMateriality;
    reason: string;
    amendedBy: string;
    amendedAt?: string;
  },
): ProductionProgram {
  if (
    program.posture !== "program_governed" &&
    program.posture !== "program_conditionally_governed" &&
    program.posture !== "program_amended"
  ) {
    throw new OrchestraConstitutionalError(
      "Program Amendment requires an active governed program",
      "invalid_amendment",
      ["FI-DSN-STD-012-R34"],
    );
  }

  const reason = input.reason.trim();
  if (!reason) {
    throw new OrchestraConstitutionalError(
      "Program Amendment must be explicit and attributable",
      "invalid_amendment",
      ["FI-DSN-STD-012-R34", "FI-DSN-STD-012-R37"],
    );
  }

  const amendedAt = input.amendedAt ?? new Date().toISOString();
  const amendment: ProgramAmendmentRecord = Object.freeze({
    amendmentId: `amendment-${randomUUID()}`,
    materiality: input.materiality,
    reason,
    amendedAt,
    amendedBy: input.amendedBy,
    priorPosture: program.posture,
  });

  assertProgramPostureTransition(program.posture, "program_amended");

  return Object.freeze({
    ...program,
    posture: "program_amended",
    amendmentHistory: Object.freeze([...program.amendmentHistory, amendment]),
  });
}

/** R36 — terminates forward Domain 1 authority. */
export function supersedeProductionProgram(
  program: ProductionProgram,
  successorProgramId: ProductionProgramId,
  input: { supersededBy: string; supersededAt?: string },
): ProductionProgram {
  if (program.posture === "program_superseded" || program.posture === "program_invalidated") {
    throw new OrchestraConstitutionalError(
      "Program is already superseded or invalidated",
      "invalid_program_transition",
      ["FI-DSN-STD-012-R36"],
    );
  }

  assertProgramPostureTransition(program.posture, "program_superseded");

  const transitionedAt = input.supersededAt ?? new Date().toISOString();
  const terminalTransition: ProgramTerminalTransition = Object.freeze({
    kind: "superseded",
    transitionedAt,
    transitionedBy: input.supersededBy,
    successorProgramId,
  });

  return Object.freeze({
    ...program,
    posture: "program_superseded",
    currentStatus: "superseded",
    supersededByProgramId: successorProgramId,
    terminalTransition,
  });
}

/** R36 — invalidated programs cannot support downstream realization. */
export function invalidateProductionProgram(
  program: ProductionProgram,
  input: { reason: string; invalidatedBy: string; invalidatedAt?: string },
): ProductionProgram {
  if (program.posture === "program_invalidated") {
    throw new OrchestraConstitutionalError(
      "Program is already invalidated",
      "invalid_program_transition",
      ["FI-DSN-STD-012-R36"],
    );
  }

  const reason = input.reason.trim();
  if (!reason) {
    throw new OrchestraConstitutionalError(
      "Program invalidation requires an explicit reason",
      "invalid_program_transition",
      ["FI-DSN-STD-012-R36", "FI-DSN-STD-012-R37"],
    );
  }

  assertProgramPostureTransition(program.posture, "program_invalidated");

  const transitionedAt = input.invalidatedAt ?? new Date().toISOString();
  const terminalTransition: ProgramTerminalTransition = Object.freeze({
    kind: "invalidated",
    transitionedAt,
    transitionedBy: input.invalidatedBy,
    reason,
  });

  return Object.freeze({
    ...program,
    posture: "program_invalidated",
    currentStatus: "invalidated",
    terminalTransition,
  });
}

/** R41 — whether program is the Current Program for forward governance. */
export function isCurrentProgram(program: ProductionProgram): boolean {
  return program.currentStatus === "current";
}

export const PRODUCTION_PROGRAM_TRACEABILITY = createGovernanceTraceability([
  ...PROGRAM_REQUIREMENTS,
]);
