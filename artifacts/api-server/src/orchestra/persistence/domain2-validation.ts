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
  RealizationTraceabilityPackage,
  RealizedVisualArtifact,
  ReviewEntryReadiness,
  RvaExecutablePosture,
  RvaExistsPromotionRecord,
  RvaTerminalTransition,
  RvaVersionLineage,
} from "../domain2-types.js";
import { isValidDomain2GovernedCreationMarker } from "../domain2-entry.js";
import { OrchestraConstitutionalError } from "../errors.js";
import { validateLineageCoherence } from "../rva-lifecycle.js";
import type { ConstitutionalAuditMetadata } from "../types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ID_PREFIXES = {
  explorationPosture: "exploration-posture-",
  realizationCommitment: "realization-commitment-",
  rva: "rva-",
  program: "program-",
  obligation: "obligation-",
  reviewEntryReadiness: "review-entry-readiness-",
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

const RVA_POSTURES: readonly RvaExecutablePosture[] = [
  "rva_candidate",
  "rva_exists",
  "rva_superseded",
  "rva_invalidated",
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

function validateLineage(lineage: unknown, rvaId: string): asserts lineage is RvaVersionLineage {
  if (!lineage || typeof lineage !== "object") {
    throw new OrchestraConstitutionalError(
      "RVA requires version lineage",
      "invalid_rva",
      ["FI-DSN-STD-013-R27"],
    );
  }
  validateLineageCoherence(lineage as RvaVersionLineage, rvaId as RealizedVisualArtifact["id"]);
}

function validateExistsPromotion(
  promotion: unknown,
  posture: RvaExecutablePosture,
): void {
  if (posture === "rva_exists" && (!promotion || typeof promotion !== "object")) {
    throw new OrchestraConstitutionalError(
      "RVA Exists requires promotion provenance",
      "invalid_rva",
      ["FI-DSN-STD-013-R40"],
    );
  }
  if (promotion !== null && promotion !== undefined) {
    const record = promotion as RvaExistsPromotionRecord;
    if (typeof record.promotedAt !== "string" || typeof record.promotedBy !== "string") {
      throw new OrchestraConstitutionalError(
        "Invalid RVA Exists promotion provenance",
        "invalid_rva",
        ["FI-DSN-STD-013-R40"],
      );
    }
  }
}

function validateTerminalTransition(
  transition: unknown,
  posture: RvaExecutablePosture,
): void {
  const terminal = posture === "rva_superseded" || posture === "rva_invalidated";
  if (terminal && (!transition || typeof transition !== "object")) {
    throw new OrchestraConstitutionalError(
      "Terminal RVA requires transition provenance",
      "invalid_rva",
      ["FI-DSN-STD-013-R44", "FI-DSN-STD-013-R45"],
    );
  }
  if (transition !== null && transition !== undefined) {
    const record = transition as RvaTerminalTransition;
    if (record.kind !== "superseded" && record.kind !== "invalidated") {
      throw new OrchestraConstitutionalError(
        "Invalid RVA terminal transition kind",
        "invalid_rva",
        ["FI-DSN-STD-013-R44"],
      );
    }
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
  if (
    record.posture === "exploration_waived" &&
    (record.explorationWaiverRecordId === null || record.explorationWaiverRecordId === undefined)
  ) {
    throw new OrchestraConstitutionalError(
      "Exploration Waived requires linked Domain 1 waiver evidence",
      "invalid_exploration_posture",
      ["FI-DSN-STD-013-R14"],
    );
  }
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
  const posture = record.posture as RvaExecutablePosture;
  if (!RVA_POSTURES.includes(posture)) {
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
  validateLineage(record.lineage, record.id as string);
  validateExistsPromotion(record.existsPromotion, posture);
  validateTerminalTransition(record.terminalTransition, posture);
  validateDomain1EntryEvidence(record.domain1EntryEvidence);
  validateAuditMetadata(record.audit);
  validateDomain2Traceability(record.traceability);
  validateGovernedMarker(record.governedCreationMarker);
}

export function validatePersistedReviewEntryReadiness(
  raw: unknown,
): asserts raw is ReviewEntryReadiness {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Review-Entry Readiness",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.readinessId, ID_PREFIXES.reviewEntryReadiness, "Review-Entry Readiness");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");
  if (record.posture !== "review_entry_ready") {
    throw new OrchestraConstitutionalError(
      "Invalid Review-Entry Readiness posture",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49"],
    );
  }
  validateAuditMetadata(record.audit);
  validateDomain2Traceability(record.traceability);
  validateGovernedMarker(record.governedCreationMarker);
}

export const REALIZATION_POSTURE_STATUSES: readonly RealizationPostureStatus[] = [
  "realization_committed",
  "rva_candidate",
  "rva_exists",
  "rva_iteration",
  "rva_superseded",
  "rva_invalidated",
];
