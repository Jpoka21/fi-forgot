import type { ExplorationEntryDetermination } from "./exploration-entry.js";
import type { ProductionProgram } from "./production-program.js";
import { assertProgramIsActiveAuthority } from "./transitions.js";

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
}): Domain2RealizationReadiness | null {
  assertProgramIsActiveAuthority(input.program.posture);

  if (input.explorationEntry === null) {
    return null;
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

/** Placeholder marker — STD-013 realization behavior is not implemented. */
export const DOMAIN2_IMPLEMENTATION_DEFERRED = "FI-DSN-STD-013" as const;

/** Placeholder marker — STD-014 GPRA behavior is not implemented. */
export const DOMAIN3_IMPLEMENTATION_DEFERRED = "FI-DSN-STD-014" as const;

/** Placeholder marker — STD-015 handoff behavior is not implemented. */
export const DOMAIN4_IMPLEMENTATION_DEFERRED = "FI-DSN-STD-015" as const;
