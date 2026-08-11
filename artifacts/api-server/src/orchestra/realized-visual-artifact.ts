import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import {
  assertObligationScopeForDomain2,
  createDomain2GovernedCreationMarker,
} from "./domain2-entry.js";
import type {
  RealizationCommitment,
  RealizationPath,
  RealizedVisualArtifact,
  RealizedVisualArtifactId,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionProgram } from "./production-program.js";
import type { ProductionObligationId } from "./types.js";

const RVA_EXISTENCE_REQUIREMENTS = [
  "FI-DSN-STD-013-R22",
  "FI-DSN-STD-013-R23",
  "FI-DSN-STD-013-R24",
  "FI-DSN-STD-013-R25",
  "FI-DSN-STD-013-R26",
  "FI-DSN-STD-013-R27",
] as const;

const AUTHORIZED_INITIAL_RVA_POSTURES = ["rva_candidate"] as const;

const AUTHORIZED_REALIZATION_PATHS: readonly RealizationPath[] = [
  "created",
  "generated",
  "commissioned",
  "licensed_or_acquired",
];

import { createRealizedVisualArtifactId as createRvaId } from "./rva-lifecycle.js";

/**
 * Establish governed Realized Visual Artifact (RVA) existence.
 * FI-DSN-STD-013-R22 through R27 — requires valid Realization Commitment.
 *
 * Initial lawful posture: RVA Candidate per STD-013 §11.2.
 */
export function establishRealizedVisualArtifact(input: {
  program: ProductionProgram;
  obligationId: ProductionObligationId;
  realizationCommitment: RealizationCommitment;
  realizationPath: RealizationPath;
  establishedBy: string;
  establishedAt?: string;
}): RealizedVisualArtifact {
  if (input.realizationCommitment.posture !== "realization_committed") {
    throw new OrchestraConstitutionalError(
      "RVA existence requires valid Realization Commitment",
      "invalid_rva",
      ["FI-DSN-STD-013-R22", "FI-DSN-STD-013-R18"],
    );
  }

  if (input.realizationCommitment.programId !== input.program.id) {
    throw new OrchestraConstitutionalError(
      "Realization Commitment does not belong to the evaluated Production Program",
      "invalid_realization_commitment",
      ["FI-DSN-STD-013-R19", "FI-DSN-STD-013-R07"],
    );
  }

  if (input.realizationCommitment.obligationId !== input.obligationId) {
    throw new OrchestraConstitutionalError(
      "Realization Commitment obligation scope does not match evaluated obligation",
      "invalid_realization_commitment",
      ["FI-DSN-STD-013-R17", "FI-DSN-STD-013-R26"],
    );
  }

  assertObligationScopeForDomain2(input.program, input.obligationId);

  if (!AUTHORIZED_REALIZATION_PATHS.includes(input.realizationPath)) {
    throw new OrchestraConstitutionalError(
      "Unauthorized realization path",
      "invalid_rva",
      ["FI-DSN-STD-013-R36", "FI-DSN-STD-013-R38"],
    );
  }

  const initialPosture = "rva_candidate" as const;
  if (!AUTHORIZED_INITIAL_RVA_POSTURES.includes(initialPosture)) {
    throw new OrchestraConstitutionalError(
      "Unauthorized initial RVA posture",
      "invalid_rva",
      ["FI-DSN-STD-013-R22"],
    );
  }

  const now = input.establishedAt ?? new Date().toISOString();
  const rvaId = createRvaId();

  return Object.freeze({
    id: rvaId,
    programId: input.program.id,
    obligationId: input.obligationId,
    realizationCommitmentId: input.realizationCommitment.commitmentId,
    posture: initialPosture,
    realizationPath: input.realizationPath,
    lineage: Object.freeze({
      rootRvaId: rvaId,
      versionSequence: 1,
      priorVersionId: null,
    }),
    domain1EntryEvidence: input.realizationCommitment.domain1EntryEvidence,
    existsPromotion: null,
    terminalTransition: null,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.establishedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: createDomain2GovernanceTraceability([...RVA_EXISTENCE_REQUIREMENTS]),
    governedCreationMarker: createDomain2GovernedCreationMarker(),
  });
}

export const REALIZED_VISUAL_ARTIFACT_TRACEABILITY = createDomain2GovernanceTraceability([
  ...RVA_EXISTENCE_REQUIREMENTS,
]);
