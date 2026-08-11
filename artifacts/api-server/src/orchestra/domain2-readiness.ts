/**
 * Live Domain 1 readiness revalidation for Domain 2 lifecycle transitions.
 * FI-DSN-STD-013-R09, R10, R15
 */

import type { StoredExplorationEntry } from "./persistence/rehydration.js";
import type { Domain1EntryEvidence } from "./domain2-types.js";
import { evaluateDomain2Readiness } from "./domain2-boundary.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionProgram } from "./production-program.js";
import type { WaiverRecord } from "./waiver.js";

/** Constitutional downstream effect for exploration-posture bypass — R14. */
export const EXPLORATION_POSTURE_BYPASS_EFFECT = "exploration_posture_bypass" as const;

/**
 * Revalidate that entry evidence still corresponds to the active Domain 1 determination.
 */
export function assertEntryEvidenceMatchesActiveDetermination(
  entryEvidence: Domain1EntryEvidence,
  storedEntry: StoredExplorationEntry,
  program: ProductionProgram,
): void {
  if (entryEvidence.programId !== program.id) {
    throw new OrchestraConstitutionalError(
      "Domain 1 entry evidence program identity does not match evaluated Production Program",
      "domain2_not_ready",
      ["FI-DSN-STD-013-R10", "FI-DSN-STD-013-R19"],
    );
  }

  if (entryEvidence.explorationDeterminationId !== storedEntry.determination.determinationId) {
    throw new OrchestraConstitutionalError(
      "Domain 1 entry evidence references a stale Exploration-Entry Determination",
      "domain2_not_ready",
      ["FI-DSN-STD-013-R10", "FI-DSN-STD-012-R34", "FI-DSN-STD-013-R16"],
    );
  }

  if (storedEntry.status !== "active") {
    throw new OrchestraConstitutionalError(
      "Domain 2 activity requires active Exploration-Entry Determination",
      "domain2_not_ready",
      ["FI-DSN-STD-013-R07", "FI-DSN-STD-012-R40"],
    );
  }

  const readiness = evaluateDomain2Readiness({
    program,
    explorationEntry: storedEntry.determination,
    explorationEntryStatus: storedEntry.status,
    isConstitutionallyCurrent: true,
  });

  if (!readiness?.isReadyForDomain2Integration) {
    throw new OrchestraConstitutionalError(
      "Domain 2 activity requires valid Domain 1 readiness",
      "domain2_not_ready",
      ["FI-DSN-STD-013-R07", "FI-DSN-STD-013-R11"],
    );
  }
}

/**
 * Verify Domain 1 waiver supports exploration-posture bypass for obligation scope — R14.
 */
export function assertExplorationPostureWaiver(
  waiver: WaiverRecord,
  obligationId: string,
): void {
  if (waiver.affectedTarget !== obligationId) {
    throw new OrchestraConstitutionalError(
      "Exploration-posture waiver must target the affected Production Obligation",
      "invalid_waiver",
      ["FI-DSN-STD-013-R14", "FI-DSN-STD-012-R31"],
    );
  }

  if (waiver.downstreamEligibilityEffect !== EXPLORATION_POSTURE_BYPASS_EFFECT) {
    throw new OrchestraConstitutionalError(
      "Waiver does not support exploration-posture bypass for the authorized scope",
      "invalid_waiver",
      ["FI-DSN-STD-013-R14"],
    );
  }
}

/**
 * R15 — consume applicable Domain 1 waivers and unresolved constraints before Exit Ready.
 */
export function assertExitReadyPrerequisites(program: ProductionProgram): void {
  const blockingConstraints = program.unresolvedConstraints.filter(
    (c) => !c.description.includes("surfaced"),
  );

  const waivedObligationIds = new Set(
    program.obligations
      .filter((o) => o.enforcementPosture === "waived")
      .map((o) => o.id),
  );

  const unresolvedObligations = program.obligations.filter(
    (o) =>
      o.enforcementPosture === "unresolved_constraint" ||
      (o.enforcementPosture === "conditional" && o.conditions.length > 0),
  );

  if (unresolvedObligations.length > 0 && waivedObligationIds.size === 0) {
    throw new OrchestraConstitutionalError(
      "Exploration Exit Ready requires consumed Domain 1 waivers and constraints",
      "invalid_exploration_posture",
      ["FI-DSN-STD-013-R09", "FI-DSN-STD-013-R15"],
    );
  }

  if (blockingConstraints.length > 0 && program.unresolvedConstraints.length > 0) {
    const hasWaivedCoverage = program.obligations.some(
      (o) => o.enforcementPosture === "waived",
    );
    if (!hasWaivedCoverage && unresolvedObligations.length > 0) {
      throw new OrchestraConstitutionalError(
        "Unresolved constraints must be consumed before Exploration Exit Ready",
        "invalid_exploration_posture",
        ["FI-DSN-STD-013-R09", "FI-DSN-STD-013-R15"],
      );
    }
  }
}
