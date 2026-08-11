import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import {
  assertObligationScopeForDomain2,
  buildDomain1EntryEvidence,
  createDomain2GovernedCreationMarker,
} from "./domain2-entry.js";
import type {
  Domain1EntryEvidence,
  ExplorationPostureRecord,
  ExplorationPostureRecordId,
  ExplorationPostureStatus,
} from "./domain2-types.js";
import { evaluateDomain2Readiness } from "./domain2-boundary.js";
import type { ExplorationEntryDetermination } from "./exploration-entry.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionProgram } from "./production-program.js";
import type { ExplorationDeterminationStatus, ProductionObligationId } from "./types.js";

const EXPLORATION_POSTURE_REQUIREMENTS = [
  "FI-DSN-STD-013-R11",
  "FI-DSN-STD-013-R12",
  "FI-DSN-STD-013-R13",
] as const;

export function createExplorationPostureRecordId(): ExplorationPostureRecordId {
  return `exploration-posture-${randomUUID()}` as ExplorationPostureRecordId;
}

const AUTHORIZED_INITIAL_POSTURES: readonly ExplorationPostureStatus[] = [
  "exploration_active",
];

/**
 * Begin governed Exploration Posture operation at Exploration Active.
 * FI-DSN-STD-013-R11, R13 — requires valid Domain 1 readiness.
 */
export function beginExplorationPosture(input: {
  program: ProductionProgram;
  obligationId: ProductionObligationId;
  explorationEntry: ExplorationEntryDetermination;
  explorationEntryStatus: ExplorationDeterminationStatus;
  isConstitutionallyCurrent: boolean;
  governingBasis: string;
  operatedBy: string;
  operatedAt?: string;
}): ExplorationPostureRecord {
  const readiness = evaluateDomain2Readiness({
    program: input.program,
    explorationEntry: input.explorationEntry,
    explorationEntryStatus: input.explorationEntryStatus,
    isConstitutionallyCurrent: input.isConstitutionallyCurrent,
  });

  if (!readiness?.isReadyForDomain2Integration) {
    throw new OrchestraConstitutionalError(
      "Domain 2 Exploration Posture operation requires valid Domain 1 readiness",
      "domain2_not_ready",
      ["FI-DSN-STD-013-R07", "FI-DSN-STD-013-R11", "FI-DSN-STD-012-R40"],
    );
  }

  assertObligationScopeForDomain2(input.program, input.obligationId);

  const governingBasis = input.governingBasis.trim();
  if (!governingBasis) {
    throw new OrchestraConstitutionalError(
      "Exploration Posture operation requires an explicit governing basis",
      "invalid_exploration_posture",
      ["FI-DSN-STD-013-R12", "FI-DSN-STD-013-R40"],
    );
  }

  const initialPosture: ExplorationPostureStatus = "exploration_active";
  if (!AUTHORIZED_INITIAL_POSTURES.includes(initialPosture)) {
    throw new OrchestraConstitutionalError(
      "Unauthorized initial Exploration Posture",
      "invalid_exploration_posture",
      ["FI-DSN-STD-013-R13"],
    );
  }

  const now = input.operatedAt ?? new Date().toISOString();
  const domain1EntryEvidence = buildDomain1EntryEvidence({
    programId: input.program.id,
    explorationDeterminationId: input.explorationEntry.determinationId,
    explorationEntryPosture: input.explorationEntry.posture,
    establishedAt: now,
  });

  return Object.freeze({
    recordId: createExplorationPostureRecordId(),
    programId: input.program.id,
    obligationId: input.obligationId,
    posture: initialPosture,
    domain1EntryEvidence,
    governingBasis,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.operatedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: createDomain2GovernanceTraceability([...EXPLORATION_POSTURE_REQUIREMENTS]),
    governedCreationMarker: createDomain2GovernedCreationMarker(),
  });
}

/**
 * Achieve Exploration Exit Ready posture for an obligation scope.
 * FI-DSN-STD-013-R15 — requires prior Exploration Active posture.
 */
export function achieveExplorationExitReady(input: {
  record: ExplorationPostureRecord;
  program: ProductionProgram;
  exitBasis: string;
  achievedBy: string;
  achievedAt?: string;
}): ExplorationPostureRecord {
  if (input.record.posture !== "exploration_active") {
    throw new OrchestraConstitutionalError(
      "Exploration Exit Ready requires prior Exploration Active posture",
      "invalid_exploration_posture",
      ["FI-DSN-STD-013-R15", "FI-DSN-STD-013-R16"],
    );
  }

  assertObligationScopeForDomain2(input.program, input.record.obligationId);

  if (input.record.programId !== input.program.id) {
    throw new OrchestraConstitutionalError(
      "Exploration Posture record does not belong to the evaluated Production Program",
      "invalid_exploration_posture",
      ["FI-DSN-STD-013-R12"],
    );
  }

  const exitBasis = input.exitBasis.trim();
  if (!exitBasis) {
    throw new OrchestraConstitutionalError(
      "Exploration Exit Ready requires documentary evidence of exit basis",
      "invalid_exploration_posture",
      ["FI-DSN-STD-013-R15", "FI-DSN-STD-013-R40"],
    );
  }

  const now = input.achievedAt ?? new Date().toISOString();

  return Object.freeze({
    ...input.record,
    posture: "exploration_exit_ready",
    governingBasis: exitBasis,
    audit: Object.freeze({
      ...input.record.audit,
      createdAt: input.record.audit.createdAt,
      createdBy: input.record.audit.createdBy,
      traceability: input.record.audit.traceability,
    }),
    traceability: createDomain2GovernanceTraceability([
      ...EXPLORATION_POSTURE_REQUIREMENTS,
      "FI-DSN-STD-013-R15",
    ]),
    governedCreationMarker: input.record.governedCreationMarker,
  });
}

export const EXPLORATION_POSTURE_TRACEABILITY = createDomain2GovernanceTraceability([
  ...EXPLORATION_POSTURE_REQUIREMENTS,
]);
