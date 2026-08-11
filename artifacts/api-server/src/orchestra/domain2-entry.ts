import { randomUUID } from "node:crypto";

import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import type { Domain1EntryEvidence } from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionProgram } from "./production-program.js";
import { assertProgramIsActiveAuthority } from "./transitions.js";
import type { ProductionObligationId } from "./types.js";
import type { ExplorationPostureRecord } from "./domain2-types.js";

const ENTRY_EVIDENCE_REQUIREMENTS = [
  "FI-DSN-STD-013-R07",
  "FI-DSN-STD-013-R10",
  "FI-DSN-STD-013-R19",
] as const;

const GOVERNED_MARKER_PREFIX = "gov-domain2-create-" as const;

export function createDomain2GovernedCreationMarker(): import("./domain2-types.js").Domain2GovernedCreationMarker {
  return `${GOVERNED_MARKER_PREFIX}${randomUUID()}` as import("./domain2-types.js").Domain2GovernedCreationMarker;
}

export function isValidDomain2GovernedCreationMarker(
  marker: unknown,
): marker is import("./domain2-types.js").Domain2GovernedCreationMarker {
  return typeof marker === "string" && marker.startsWith(GOVERNED_MARKER_PREFIX);
}

/**
 * Construct auditable Domain 1 entry evidence from verified readiness inputs.
 * FI-DSN-STD-013-R07, R10
 */
export function buildDomain1EntryEvidence(input: {
  programId: ProductionProgram["id"];
  explorationDeterminationId: string;
  explorationEntryPosture: Domain1EntryEvidence["explorationEntryPosture"];
  establishedAt?: string;
}): Domain1EntryEvidence {
  return Object.freeze({
    programId: input.programId,
    explorationDeterminationId: input.explorationDeterminationId,
    explorationEntryPosture: input.explorationEntryPosture,
    domain1ReadinessEstablishedAt: input.establishedAt ?? new Date().toISOString(),
    constitutionalCurrentnessVerified: true as const,
  });
}

/**
 * Verify obligation belongs to the parent program and program is active authority.
 * FI-DSN-STD-013-R07, R08
 */
export function assertObligationScopeForDomain2(
  program: ProductionProgram,
  obligationId: ProductionObligationId,
): void {
  assertProgramIsActiveAuthority(program.posture);

  const obligation = program.obligations.find((o) => o.id === obligationId);
  if (!obligation) {
    throw new OrchestraConstitutionalError(
      "Production Obligation not found in the evaluated Production Program",
      "invalid_obligation",
      ["FI-DSN-STD-013-R07", "FI-DSN-STD-012-R16"],
    );
  }

  if (obligation.programId !== program.id) {
    throw new OrchestraConstitutionalError(
      "Production Obligation program attribution does not match parent Production Program",
      "invalid_obligation",
      ["FI-DSN-STD-013-R07", "FI-DSN-STD-013-R26"],
    );
  }
}

/**
 * Verify exploration posture record belongs to the program and obligation scope.
 */
export function assertExplorationPostureScope(
  record: ExplorationPostureRecord,
  programId: ProductionProgram["id"],
  obligationId: ProductionObligationId,
): void {
  if (record.programId !== programId) {
    throw new OrchestraConstitutionalError(
      "Exploration Posture record does not belong to the evaluated Production Program",
      "invalid_exploration_posture",
      ["FI-DSN-STD-013-R07", "FI-DSN-STD-013-R12"],
    );
  }

  if (record.obligationId !== obligationId) {
    throw new OrchestraConstitutionalError(
      "Exploration Posture record does not belong to the evaluated Production Obligation scope",
      "invalid_exploration_posture",
      ["FI-DSN-STD-013-R12", "FI-DSN-STD-013-R17"],
    );
  }

  if (record.domain1EntryEvidence.programId !== programId) {
    throw new OrchestraConstitutionalError(
      "Domain 1 entry evidence program identity does not match Exploration Posture scope",
      "domain2_not_ready",
      ["FI-DSN-STD-013-R10", "FI-DSN-STD-013-R19"],
    );
  }
}

export const DOMAIN1_ENTRY_EVIDENCE_TRACEABILITY = createDomain2GovernanceTraceability([
  ...ENTRY_EVIDENCE_REQUIREMENTS,
]);
