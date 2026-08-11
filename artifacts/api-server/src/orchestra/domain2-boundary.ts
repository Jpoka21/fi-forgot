import type { ExplorationEntryDetermination } from "./exploration-entry.js";
import type { ProductionProgram } from "./production-program.js";
import { assertProgramIsActiveAuthority } from "./transitions.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ExplorationDeterminationStatus } from "./types.js";

/**
 * Extension boundary for FI-DSN-STD-013 artifact realization.
 *
 * ORCH-IMP-001 establishes this interface only — full Domain 2 realization
 * lifecycle is intentionally deferred per sprint scope.
 *
 * FI-DSN-STD-012-R40: STD-013 MAY consume governed Domain 1 outputs only after
 * governed Exploration-Entry Authorization exists for the applicable scope.
 */
export interface Domain2RealizationReadiness {
  readonly programId: ProductionProgram["id"];
  readonly explorationEntryDetermination: ExplorationEntryDetermination;
  readonly isReadyForDomain2Integration: boolean;
}

export function evaluateDomain2Readiness(input: {
  program: ProductionProgram;
  explorationEntry: ExplorationEntryDetermination | null;
  /** Must be active — superseded determinations cannot authorize progression. R30, R34 */
  explorationEntryStatus: ExplorationDeterminationStatus;
  /** Mandatory constitutional currentness under R11/R12 — must be explicitly true. */
  isConstitutionallyCurrent: boolean;
}): Domain2RealizationReadiness | null {
  assertProgramIsActiveAuthority(input.program.posture);

  if (input.isConstitutionallyCurrent !== true) {
    return null;
  }

  if (input.explorationEntry === null) {
    return null;
  }

  if (input.explorationEntryStatus !== "active") {
    throw new OrchestraConstitutionalError(
      "Superseded Exploration-Entry Determination cannot authorize Domain 2 readiness",
      "invalid_exploration_entry",
      ["FI-DSN-STD-012-R30", "FI-DSN-STD-012-R34", "FI-DSN-STD-012-R40"],
    );
  }

  if (input.explorationEntry.programId !== input.program.id) {
    throw new OrchestraConstitutionalError(
      "Exploration-Entry Determination does not belong to the evaluated Production Program",
      "invalid_exploration_entry",
      ["FI-DSN-STD-012-R26", "FI-DSN-STD-012-R41"],
    );
  }

  const hasExplorationEntry =
    input.explorationEntry.posture === "exploration_entry_authorized" ||
    input.explorationEntry.posture === "conditionally_authorized";

  return Object.freeze({
    programId: input.program.id,
    explorationEntryDetermination: input.explorationEntry,
    isReadyForDomain2Integration: hasExplorationEntry,
  });
}

/** Placeholder marker — STD-014 GPRA grant is not implemented. */
export const DOMAIN3_GPRA_GRANT_DEFERRED = "FI-DSN-STD-014-GPRA-GRANT-DEFERRED" as const;

/** Placeholder marker — STD-014 Review Determination is not implemented. */
export const DOMAIN3_REVIEW_DETERMINATION_DEFERRED =
  "FI-DSN-STD-014-REVIEW-DETERMINATION-DEFERRED" as const;

/** Placeholder marker — STD-014 review queue/worker is not implemented. */
export const DOMAIN3_QUEUE_WORKER_DEFERRED = "FI-DSN-STD-014-QUEUE-WORKER-DEFERRED" as const;

/** Placeholder marker — STD-015 handoff behavior is not implemented. */
export const DOMAIN4_IMPLEMENTATION_DEFERRED = "FI-DSN-STD-015" as const;

/** @deprecated Prefer specific Domain 3 deferred markers; retained for compatibility. */
export const DOMAIN3_IMPLEMENTATION_DEFERRED = "FI-DSN-STD-014" as const;
