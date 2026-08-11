import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import {
  assertExplorationPostureScope,
  assertObligationScopeForDomain2,
  createDomain2GovernedCreationMarker,
} from "./domain2-entry.js";
import type {
  ExplorationPostureRecord,
  RealizationCommitment,
  RealizationCommitmentId,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionProgram } from "./production-program.js";
import type { ProductionObligationId } from "./types.js";

const REALIZATION_COMMITMENT_REQUIREMENTS = [
  "FI-DSN-STD-013-R17",
  "FI-DSN-STD-013-R18",
  "FI-DSN-STD-013-R19",
  "FI-DSN-STD-013-R20",
  "FI-DSN-STD-013-R21",
] as const;

export function createRealizationCommitmentId(): RealizationCommitmentId {
  return `realization-commitment-${randomUUID()}` as RealizationCommitmentId;
}

/**
 * Record governed Realization Commitment for a defined obligation scope.
 * FI-DSN-STD-013-R17 through R21 — requires Exploration Exit Ready.
 */
export function recordRealizationCommitment(input: {
  program: ProductionProgram;
  obligationId: ProductionObligationId;
  explorationPostureRecord: ExplorationPostureRecord;
  governingBasis: string;
  committedBy: string;
  committedAt?: string;
}): RealizationCommitment {
  if (input.explorationPostureRecord.posture !== "exploration_exit_ready") {
    throw new OrchestraConstitutionalError(
      "Realization Commitment requires Exploration Exit Ready posture",
      "invalid_realization_commitment",
      ["FI-DSN-STD-013-R18", "FI-DSN-STD-013-R17"],
    );
  }

  assertObligationScopeForDomain2(input.program, input.obligationId);
  assertExplorationPostureScope(
    input.explorationPostureRecord,
    input.program.id,
    input.obligationId,
  );

  const governingBasis = input.governingBasis.trim();
  if (!governingBasis) {
    throw new OrchestraConstitutionalError(
      "Realization Commitment requires an explicit governing basis",
      "invalid_realization_commitment",
      ["FI-DSN-STD-013-R17", "FI-DSN-STD-013-R40"],
    );
  }

  const now = input.committedAt ?? new Date().toISOString();

  return Object.freeze({
    commitmentId: createRealizationCommitmentId(),
    programId: input.program.id,
    obligationId: input.obligationId,
    explorationPostureRecordId: input.explorationPostureRecord.recordId,
    posture: "realization_committed" as const,
    domain1EntryEvidence: input.explorationPostureRecord.domain1EntryEvidence,
    governingBasis,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.committedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: createDomain2GovernanceTraceability([...REALIZATION_COMMITMENT_REQUIREMENTS]),
    governedCreationMarker: createDomain2GovernedCreationMarker(),
  });
}

export const REALIZATION_COMMITMENT_TRACEABILITY = createDomain2GovernanceTraceability([
  ...REALIZATION_COMMITMENT_REQUIREMENTS,
]);
