/**
 * Runtime validation at the Domain 2 persistence boundary.
 */

import type { Domain2GovernanceTraceability } from "../domain2-authority.js";
import type {
  Domain1EntryEvidence,
  ExplorationPostureRecord,
  ExplorationPostureStatus,
  RealizationCommitment,
  RealizationPath,
  RealizationPostureStatus,
  RealizedVisualArtifact,
  RvaVersionLineage,
} from "../domain2-types.js";
import { isValidDomain2GovernedCreationMarker } from "../domain2-entry.js";
import { OrchestraConstitutionalError } from "../errors.js";
import type { ConstitutionalAuditMetadata } from "../types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ID_PREFIXES = {
  explorationPosture: "exploration-posture-",
  realizationCommitment: "realization-commitment-",
  rva: "rva-",
  program: "program-",
  obligation: "obligation-",
} as const;

const EXPLORATION_POSTURE_STATUSES: readonly ExplorationPostureStatus[] = [
  "exploration_not_authorized",
  "exploration_authorized",
  "exploration_active",
  "exploration_waived",
  "exploration_exit_ready",
];

const REALIZATION_PATHS: readonly RealizationPath[] = [
  "created",
  "generated",
  "commissioned",
  "licensed_or_acquired",
];

const RVA_POSTURES: readonly RealizedVisualArtifact["posture"][] = [
  "rva_candidate",
  "rva_exists",
];

function assertBrandedId(id: unknown, prefix: string, label: string): void {
  if (typeof id !== "string" || !id.startsWith(prefix)) {
    throw new OrchestraConstitutionalError(
      `Invalid ${label} identifier shape`,
      "identity_violation",
      ["FI-DSN-STD-013-R26"],
    );
  }
  const uuidPart = id.slice(prefix.length);
  if (!UUID_PATTERN.test(uuidPart)) {
    throw new OrchestraConstitutionalError(
      `Malformed ${label} identifier`,
      "identity_violation",
      ["FI-DSN-STD-013-R26"],
    );
  }
}

function validateAuditMetadata(audit: unknown): asserts audit is ConstitutionalAuditMetadata {
  if (!audit || typeof audit !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid Domain 2 audit metadata",
      "invalid_domain2_persistence_state",
      ["FI-DSN-STD-013-R40"],
    );
  }
  const record = audit as Record<string, unknown>;
  if (typeof record.createdAt !== "string" || typeof record.createdBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Domain 2 audit metadata requires createdAt and createdBy",
      "invalid_domain2_persistence_state",
      ["FI-DSN-STD-013-R40"],
    );
  }
}

function validateDomain2Traceability(
  traceability: unknown,
): asserts traceability is Domain2GovernanceTraceability {
  if (!traceability || typeof traceability !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid Domain 2 traceability metadata",
      "invalid_domain2_persistence_state",
      ["FI-DSN-STD-013-R40"],
    );
  }
  const record = traceability as Record<string, unknown>;
  if (record.governingStandardId !== "FI-DSN-STD-013") {
    throw new OrchestraConstitutionalError(
      "Domain 2 object requires FI-DSN-STD-013 traceability",
      "invalid_domain2_persistence_state",
      ["FI-DSN-STD-013-R01"],
    );
  }
}

function validateDomain1EntryEvidence(
  evidence: unknown,
): asserts evidence is Domain1EntryEvidence {
  if (!evidence || typeof evidence !== "object") {
    throw new OrchestraConstitutionalError(
      "Domain 2 object requires Domain 1 entry evidence",
      "invalid_domain2_persistence_state",
      ["FI-DSN-STD-013-R10"],
    );
  }
  const record = evidence as Record<string, unknown>;
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  if (typeof record.explorationDeterminationId !== "string") {
    throw new OrchestraConstitutionalError(
      "Domain 1 entry evidence requires explorationDeterminationId",
      "invalid_domain2_persistence_state",
      ["FI-DSN-STD-013-R10"],
    );
  }
  if (record.constitutionalCurrentnessVerified !== true) {
    throw new OrchestraConstitutionalError(
      "Domain 1 entry evidence requires explicit constitutional currentness",
      "domain2_not_ready",
      ["FI-DSN-STD-013-R07"],
    );
  }
}

function validateGovernedMarker(marker: unknown): void {
  if (!isValidDomain2GovernedCreationMarker(marker)) {
    throw new OrchestraConstitutionalError(
      "Domain 2 object requires valid governed creation marker",
      "invalid_domain2_persistence_state",
      ["FI-DSN-STD-013-R40"],
    );
  }
}

function validateLineage(lineage: unknown): asserts lineage is RvaVersionLineage {
  if (!lineage || typeof lineage !== "object") {
    throw new OrchestraConstitutionalError(
      "RVA requires version lineage",
      "invalid_rva",
      ["FI-DSN-STD-013-R27"],
    );
  }
  const record = lineage as Record<string, unknown>;
  assertBrandedId(record.rootRvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  if (typeof record.versionSequence !== "number" || record.versionSequence < 1) {
    throw new OrchestraConstitutionalError(
      "RVA version sequence must be at least 1",
      "invalid_rva",
      ["FI-DSN-STD-013-R27"],
    );
  }
}

export function validatePersistedExplorationPosture(
  raw: unknown,
): asserts raw is ExplorationPostureRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Exploration Posture record",
      "invalid_domain2_persistence_state",
      ["FI-DSN-STD-013-R12"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.recordId, ID_PREFIXES.explorationPosture, "Exploration Posture");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");
  if (!EXPLORATION_POSTURE_STATUSES.includes(record.posture as ExplorationPostureStatus)) {
    throw new OrchestraConstitutionalError(
      "Invalid Exploration Posture status",
      "invalid_exploration_posture",
      ["FI-DSN-STD-013-R13"],
    );
  }
  validateDomain1EntryEvidence(record.domain1EntryEvidence);
  validateAuditMetadata(record.audit);
  validateDomain2Traceability(record.traceability);
  validateGovernedMarker(record.governedCreationMarker);
}

export function validatePersistedRealizationCommitment(
  raw: unknown,
): asserts raw is RealizationCommitment {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Realization Commitment",
      "invalid_domain2_persistence_state",
      ["FI-DSN-STD-013-R17"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.commitmentId, ID_PREFIXES.realizationCommitment, "Realization Commitment");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");
  assertBrandedId(
    record.explorationPostureRecordId,
    ID_PREFIXES.explorationPosture,
    "Exploration Posture",
  );
  if (record.posture !== "realization_committed") {
    throw new OrchestraConstitutionalError(
      "Invalid Realization Commitment posture",
      "invalid_realization_commitment",
      ["FI-DSN-STD-013-R17"],
    );
  }
  validateDomain1EntryEvidence(record.domain1EntryEvidence);
  validateAuditMetadata(record.audit);
  validateDomain2Traceability(record.traceability);
  validateGovernedMarker(record.governedCreationMarker);
}

export function validatePersistedRva(raw: unknown): asserts raw is RealizedVisualArtifact {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Realized Visual Artifact",
      "invalid_domain2_persistence_state",
      ["FI-DSN-STD-013-R22"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.id, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");
  assertBrandedId(
    record.realizationCommitmentId,
    ID_PREFIXES.realizationCommitment,
    "Realization Commitment",
  );
  if (!RVA_POSTURES.includes(record.posture as RealizedVisualArtifact["posture"])) {
    throw new OrchestraConstitutionalError(
      "Invalid RVA posture",
      "invalid_rva",
      ["FI-DSN-STD-013-R22"],
    );
  }
  if (!REALIZATION_PATHS.includes(record.realizationPath as RealizationPath)) {
    throw new OrchestraConstitutionalError(
      "Invalid realization path",
      "invalid_rva",
      ["FI-DSN-STD-013-R36"],
    );
  }
  validateLineage(record.lineage);
  validateDomain1EntryEvidence(record.domain1EntryEvidence);
  validateAuditMetadata(record.audit);
  validateDomain2Traceability(record.traceability);
  validateGovernedMarker(record.governedCreationMarker);
}

/** Exported for type completeness — not all postures are persistable in foundation sprint. */
export const REALIZATION_POSTURE_STATUSES: readonly RealizationPostureStatus[] = [
  "realization_committed",
  "rva_candidate",
  "rva_exists",
  "rva_iteration",
  "rva_superseded",
  "rva_invalidated",
];
