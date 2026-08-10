import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import {
  detectComplianceBoundaryConflicts,
  type ComplianceBoundaryBinding,
  type UnresolvedConstraintRecord,
} from "./compliance-boundary.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionProgram } from "./production-program.js";
import type { ConstitutionalAttribution, ExplorationEntryPosture } from "./types.js";

const EXPLORATION_REQUIREMENTS = [
  "FI-DSN-STD-012-R26",
  "FI-DSN-STD-012-R27",
  "FI-DSN-STD-012-R28",
  "FI-DSN-STD-012-R29",
  "FI-DSN-STD-012-R30",
] as const;

/**
 * Governed Exploration-Entry Determination — R26 through R30.
 * Distinct from GPRA, collection membership, or manufacturing authorization.
 */
export interface ExplorationEntryDetermination {
  readonly determinationId: string;
  readonly programId: ProductionProgram["id"];
  readonly posture: ExplorationEntryPosture;
  readonly affectedObligationIds: readonly string[];
  readonly governingBasis: string;
  readonly unresolvedConstraints: readonly UnresolvedConstraintRecord[];
  readonly attribution: ConstitutionalAttribution;
  readonly traceability: ReturnType<typeof createGovernanceTraceability>;
}

function assertProgramReadyForExplorationEntry(program: ProductionProgram): void {
  if (
    program.posture !== "program_governed" &&
    program.posture !== "program_conditionally_governed"
  ) {
    throw new OrchestraConstitutionalError(
      "Exploration-Entry Determination requires a governed Production Program",
      "invalid_exploration_entry",
      ["FI-DSN-STD-012-R26"],
    );
  }

  if (program.obligations.length === 0) {
    throw new OrchestraConstitutionalError(
      "Exploration-Entry Authorization requires known Production Obligations",
      "invalid_exploration_entry",
      ["FI-DSN-STD-012-R27"],
    );
  }

  if (program.complianceBoundaries.length === 0) {
    throw new OrchestraConstitutionalError(
      "Exploration-Entry Authorization requires bound Compliance Boundaries",
      "invalid_exploration_entry",
      ["FI-DSN-STD-012-R21", "FI-DSN-STD-012-R27"],
    );
  }
}

function collectUnresolvedConstraints(
  program: ProductionProgram,
  bindings: readonly ComplianceBoundaryBinding[],
): UnresolvedConstraintRecord[] {
  const boundaryConflicts = detectComplianceBoundaryConflicts(bindings);
  const obligationConstraints = program.obligations
    .filter((o) => o.enforcementPosture === "unresolved_constraint")
    .map((o) =>
      Object.freeze({
        constraintId: `obligation-constraint-${o.id}`,
        description: o.description,
        identifiedAt: o.audit.createdAt,
        identifiedBy: o.audit.createdBy,
        sourceReference: o.id,
      }),
    );

  return [...program.unresolvedConstraints, ...boundaryConflicts, ...obligationConstraints];
}

export function determineExplorationEntry(input: {
  program: ProductionProgram;
  posture: ExplorationEntryPosture;
  affectedObligationIds?: readonly string[];
  governingBasis: string;
  determinedBy: string;
  determinedAt?: string;
}): ExplorationEntryDetermination {
  assertProgramReadyForExplorationEntry(input.program);

  const governingBasis = input.governingBasis.trim();
  if (!governingBasis) {
    throw new OrchestraConstitutionalError(
      "Exploration-Entry Determination requires an explicit governing basis",
      "invalid_exploration_entry",
      ["FI-DSN-STD-012-R26", "FI-DSN-STD-012-R37"],
    );
  }

  const unresolved = collectUnresolvedConstraints(
    input.program,
    input.program.complianceBoundaries,
  );

  if (
    input.posture === "exploration_entry_authorized" &&
    unresolved.length > 0
  ) {
    throw new OrchestraConstitutionalError(
      "Exploration Entry Authorized requires all constraints to be resolved",
      "invalid_exploration_entry",
      ["FI-DSN-STD-012-R27", "FI-DSN-STD-012-R28"],
    );
  }

  if (
    input.posture === "conditionally_authorized" &&
    unresolved.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Conditionally Authorized posture requires recorded conditions or Unresolved Constraints",
      "invalid_exploration_entry",
      ["FI-DSN-STD-012-R28"],
    );
  }

  const affectedObligationIds =
    input.affectedObligationIds ??
    input.program.obligations.map((o) => o.id);

  const now = input.determinedAt ?? new Date().toISOString();

  return Object.freeze({
    determinationId: `exploration-entry-${randomUUID()}`,
    programId: input.program.id,
    posture: input.posture,
    affectedObligationIds: Object.freeze([...affectedObligationIds]),
    governingBasis,
    unresolvedConstraints: Object.freeze([...unresolved]),
    attribution: Object.freeze({
      actorId: input.determinedBy,
      recordedAt: now,
      basis: governingBasis,
    }),
    traceability: createGovernanceTraceability([...EXPLORATION_REQUIREMENTS]),
  });
}

/** R26 — intent or program existence alone is insufficient. */
export function assertExplorationEntryNotAssumed(
  hasDetermination: boolean,
): void {
  if (!hasDetermination) {
    throw new OrchestraConstitutionalError(
      "Exploration-Entry Authorization requires an explicit governed determination",
      "invalid_exploration_entry",
      ["FI-DSN-STD-012-R26"],
    );
  }
}

export const EXPLORATION_ENTRY_TRACEABILITY = createGovernanceTraceability([
  ...EXPLORATION_REQUIREMENTS,
]);
