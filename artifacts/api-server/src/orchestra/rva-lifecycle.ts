/**
 * Canonical RVA posture transitions — FI-DSN-STD-013-R31 through R35, R44-R46.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import { assertObligationScopeForDomain2, createDomain2GovernedCreationMarker } from "./domain2-entry.js";
import type {
  RealizationPath,
  RealizedVisualArtifact,
  RealizedVisualArtifactId,
  RvaExecutablePosture,
  RvaTerminalTransition,
  RvaVersionLineage,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionProgram } from "./production-program.js";
import type { ProductionObligationId } from "./types.js";

const PROMOTION_REQUIREMENTS = ["FI-DSN-STD-013-R22", "FI-DSN-STD-013-R26"] as const;
const SUCCESSOR_REQUIREMENTS = [
  "FI-DSN-STD-013-R31",
  "FI-DSN-STD-013-R35",
  "FI-DSN-STD-013-R44",
] as const;
const INVALIDATION_REQUIREMENTS = ["FI-DSN-STD-013-R45"] as const;

const TERMINAL_POSTURES: readonly RvaExecutablePosture[] = [
  "rva_superseded",
  "rva_invalidated",
];

export function isTerminalRvaPosture(posture: RvaExecutablePosture): boolean {
  return TERMINAL_POSTURES.includes(posture);
}

export function isForwardActiveRvaPosture(posture: RvaExecutablePosture): boolean {
  return posture === "rva_candidate" || posture === "rva_exists";
}

/**
 * Validate lineage coherence — mandatory for successor creation.
 */
export function validateLineageCoherence(
  lineage: RvaVersionLineage,
  rvaId: RealizedVisualArtifactId,
): void {
  if (lineage.versionSequence < 1) {
    throw new OrchestraConstitutionalError(
      "RVA version sequence must be at least 1",
      "invalid_rva",
      ["FI-DSN-STD-013-R27"],
    );
  }

  if (lineage.versionSequence === 1) {
    if (lineage.priorVersionId !== null) {
      throw new OrchestraConstitutionalError(
        "First RVA version must not have a prior version",
        "invalid_rva",
        ["FI-DSN-STD-013-R27"],
      );
    }
    if (lineage.rootRvaId !== rvaId) {
      throw new OrchestraConstitutionalError(
        "First RVA version root identity must match RVA identity",
        "invalid_rva",
        ["FI-DSN-STD-013-R27"],
      );
    }
    return;
  }

  if (lineage.priorVersionId === null) {
    throw new OrchestraConstitutionalError(
      "Successor RVA version requires prior version identity",
      "invalid_rva",
      ["FI-DSN-STD-013-R27"],
    );
  }

  if (lineage.priorVersionId === rvaId) {
    throw new OrchestraConstitutionalError(
      "RVA cannot reference itself as prior version",
      "invalid_rva",
      ["FI-DSN-STD-013-R27"],
    );
  }
}

export function validateSuccessorLineage(
  prior: RealizedVisualArtifact,
  successorLineage: RvaVersionLineage,
  successorId: RealizedVisualArtifactId,
): void {
  if (successorLineage.rootRvaId !== prior.lineage.rootRvaId) {
    throw new OrchestraConstitutionalError(
      "Successor RVA must preserve lineage root identity",
      "invalid_rva",
      ["FI-DSN-STD-013-R27", "FI-DSN-STD-013-R31"],
    );
  }

  if (successorLineage.priorVersionId !== prior.id) {
    throw new OrchestraConstitutionalError(
      "Successor RVA priorVersionId must reference the immediate predecessor",
      "invalid_rva",
      ["FI-DSN-STD-013-R27"],
    );
  }

  if (successorLineage.versionSequence !== prior.lineage.versionSequence + 1) {
    throw new OrchestraConstitutionalError(
      "Successor RVA version sequence must increment by exactly one",
      "invalid_rva",
      ["FI-DSN-STD-013-R27"],
    );
  }

  validateLineageCoherence(successorLineage, successorId);
}

export function createRealizedVisualArtifactId(): RealizedVisualArtifactId {
  return `rva-${randomUUID()}` as RealizedVisualArtifactId;
}

/**
 * Promote RVA Candidate to RVA Exists — same identity, posture transition.
 */
export function promoteRvaToExists(input: {
  rva: RealizedVisualArtifact;
  program: ProductionProgram;
  basis: string;
  promotedBy: string;
  promotedAt?: string;
}): RealizedVisualArtifact {
  if (input.rva.posture !== "rva_candidate") {
    throw new OrchestraConstitutionalError(
      "RVA Exists promotion requires RVA Candidate posture",
      "invalid_rva",
      ["FI-DSN-STD-013-R22"],
    );
  }

  if (isTerminalRvaPosture(input.rva.posture)) {
    throw new OrchestraConstitutionalError(
      "Terminal RVA cannot be promoted",
      "invalid_rva",
      ["FI-DSN-STD-013-R45"],
    );
  }

  assertObligationScopeForDomain2(input.program, input.rva.obligationId);

  if (input.rva.programId !== input.program.id) {
    throw new OrchestraConstitutionalError(
      "RVA does not belong to the evaluated Production Program",
      "invalid_rva",
      ["FI-DSN-STD-013-R07"],
    );
  }

  const basis = input.basis.trim();
  if (!basis) {
    throw new OrchestraConstitutionalError(
      "RVA Exists promotion requires explicit governing basis",
      "invalid_rva",
      ["FI-DSN-STD-013-R40"],
    );
  }

  const now = input.promotedAt ?? new Date().toISOString();

  return Object.freeze({
    ...input.rva,
    posture: "rva_exists" as const,
    existsPromotion: Object.freeze({
      promotedAt: now,
      promotedBy: input.promotedBy,
      basis,
    }),
    traceability: createDomain2GovernanceTraceability([...PROMOTION_REQUIREMENTS]),
  });
}

/**
 * Create governed successor RVA version — supersedes prior for forward governance.
 */
export function createSuccessorRva(input: {
  priorRva: RealizedVisualArtifact;
  program: ProductionProgram;
  realizationPath: RealizationPath;
  iterationBasis: string;
  createdBy: string;
  createdAt?: string;
}): { priorSuperseded: RealizedVisualArtifact; successor: RealizedVisualArtifact } {
  if (!isForwardActiveRvaPosture(input.priorRva.posture)) {
    throw new OrchestraConstitutionalError(
      "Successor RVA creation requires forward-active prior RVA posture",
      "invalid_rva",
      ["FI-DSN-STD-013-R31", "FI-DSN-STD-013-R44"],
    );
  }

  assertObligationScopeForDomain2(input.program, input.priorRva.obligationId);

  if (input.priorRva.programId !== input.program.id) {
    throw new OrchestraConstitutionalError(
      "Prior RVA does not belong to the evaluated Production Program",
      "invalid_rva",
      ["FI-DSN-STD-013-R07"],
    );
  }

  const iterationBasis = input.iterationBasis.trim();
  if (!iterationBasis) {
    throw new OrchestraConstitutionalError(
      "Successor RVA creation requires explicit iteration basis",
      "invalid_rva",
      ["FI-DSN-STD-013-R40"],
    );
  }

  const now = input.createdAt ?? new Date().toISOString();
  const successorId = createRealizedVisualArtifactId();
  const successorLineage: RvaVersionLineage = Object.freeze({
    rootRvaId: input.priorRva.lineage.rootRvaId,
    versionSequence: input.priorRva.lineage.versionSequence + 1,
    priorVersionId: input.priorRva.id,
  });

  validateSuccessorLineage(input.priorRva, successorLineage, successorId);

  const terminalTransition: RvaTerminalTransition = Object.freeze({
    kind: "superseded",
    transitionedAt: now,
    transitionedBy: input.createdBy,
    reason: iterationBasis,
    successorRvaId: successorId,
  });

  const priorSuperseded: RealizedVisualArtifact = Object.freeze({
    ...input.priorRva,
    posture: "rva_superseded",
    terminalTransition,
    traceability: createDomain2GovernanceTraceability([...SUCCESSOR_REQUIREMENTS]),
  });

  const successor: RealizedVisualArtifact = Object.freeze({
    id: successorId,
    programId: input.priorRva.programId,
    obligationId: input.priorRva.obligationId,
    realizationCommitmentId: input.priorRva.realizationCommitmentId,
    posture: "rva_candidate",
    realizationPath: input.realizationPath,
    lineage: successorLineage,
    domain1EntryEvidence: input.priorRva.domain1EntryEvidence,
    existsPromotion: null,
    terminalTransition: null,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.createdBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: createDomain2GovernanceTraceability([...SUCCESSOR_REQUIREMENTS]),
    governedCreationMarker: createDomain2GovernedCreationMarker(),
  });

  return Object.freeze({ priorSuperseded, successor });
}

/**
 * Invalidate RVA — terminates forward realization authority.
 */
export function invalidateRva(input: {
  rva: RealizedVisualArtifact;
  program: ProductionProgram;
  reason: string;
  invalidatedBy: string;
  invalidatedAt?: string;
}): RealizedVisualArtifact {
  if (isTerminalRvaPosture(input.rva.posture)) {
    throw new OrchestraConstitutionalError(
      "RVA is already in a terminal posture",
      "invalid_rva",
      ["FI-DSN-STD-013-R45"],
    );
  }

  assertObligationScopeForDomain2(input.program, input.rva.obligationId);

  if (input.rva.programId !== input.program.id) {
    throw new OrchestraConstitutionalError(
      "RVA does not belong to the evaluated Production Program",
      "invalid_rva",
      ["FI-DSN-STD-013-R07"],
    );
  }

  const reason = input.reason.trim();
  if (!reason) {
    throw new OrchestraConstitutionalError(
      "RVA invalidation requires explicit governing basis",
      "invalid_rva",
      ["FI-DSN-STD-013-R45", "FI-DSN-STD-013-R40"],
    );
  }

  const now = input.invalidatedAt ?? new Date().toISOString();

  return Object.freeze({
    ...input.rva,
    posture: "rva_invalidated",
    terminalTransition: Object.freeze({
      kind: "invalidated",
      transitionedAt: now,
      transitionedBy: input.invalidatedBy,
      reason,
    }),
    traceability: createDomain2GovernanceTraceability([...INVALIDATION_REQUIREMENTS]),
  });
}
