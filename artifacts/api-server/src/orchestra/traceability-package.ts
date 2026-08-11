import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import type {
  ExplorationPostureRecord,
  RealizationCommitment,
  RealizationTraceabilityPackage,
  RealizedVisualArtifact,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";

const TRACEABILITY_PACKAGE_REQUIREMENTS = [
  "FI-DSN-STD-013-R40",
  "FI-DSN-STD-013-R41",
  "FI-DSN-STD-013-R42",
] as const;

/**
 * Assemble Realization Traceability Package from existing constitutional source data — R41.
 * Derived assembly only; not a competing source of truth.
 */
export function assembleRealizationTraceabilityPackage(input: {
  rva: RealizedVisualArtifact;
  commitment: RealizationCommitment;
  explorationPosture: ExplorationPostureRecord;
  assembledAt?: string;
}): RealizationTraceabilityPackage {
  if (input.rva.realizationCommitmentId !== input.commitment.commitmentId) {
    throw new OrchestraConstitutionalError(
      "Traceability Package commitment does not match RVA",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (input.rva.programId !== input.commitment.programId) {
    throw new OrchestraConstitutionalError(
      "Traceability Package program identity mismatch",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (input.explorationPosture.recordId !== input.commitment.explorationPostureRecordId) {
    throw new OrchestraConstitutionalError(
      "Traceability Package exploration posture does not match commitment",
      "invalid_realization_commitment",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (input.rva.obligationId !== input.commitment.obligationId) {
    throw new OrchestraConstitutionalError(
      "Traceability Package obligation identity mismatch",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  const now = input.assembledAt ?? new Date().toISOString();

  return Object.freeze({
    packageId: `traceability-package-${randomUUID()}`,
    rvaId: input.rva.id,
    programId: input.rva.programId,
    obligationId: input.rva.obligationId,
    realizationCommitmentId: input.commitment.commitmentId,
    explorationPostureRecordId: input.explorationPosture.recordId,
    realizationPath: input.rva.realizationPath,
    rvaPosture: input.rva.posture,
    lineage: input.rva.lineage,
    domain1EntryEvidence: input.rva.domain1EntryEvidence,
    explorationWaiverRecordId: input.explorationPosture.explorationWaiverRecordId,
    assembledAt: now,
    traceability: createDomain2GovernanceTraceability([...TRACEABILITY_PACKAGE_REQUIREMENTS]),
  });
}

/**
 * Verify traceability package has minimum required components — R41, R43.
 */
export function assertTraceabilityPackageComplete(
  pkg: RealizationTraceabilityPackage,
): void {
  if (!pkg.rvaId || !pkg.programId || !pkg.obligationId) {
    throw new OrchestraConstitutionalError(
      "Realization Traceability Package is incomplete",
      "invalid_rva",
      ["FI-DSN-STD-013-R41", "FI-DSN-STD-013-R43"],
    );
  }

  if (!pkg.realizationCommitmentId || !pkg.explorationPostureRecordId) {
    throw new OrchestraConstitutionalError(
      "Realization Traceability Package missing governing commitment or exploration evidence",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (!pkg.domain1EntryEvidence.constitutionalCurrentnessVerified) {
    throw new OrchestraConstitutionalError(
      "Realization Traceability Package requires Domain 1 entry evidence",
      "domain2_not_ready",
      ["FI-DSN-STD-013-R10"],
    );
  }
}

export const REALIZATION_TRACEABILITY_PACKAGE_TRACEABILITY = createDomain2GovernanceTraceability([
  ...TRACEABILITY_PACKAGE_REQUIREMENTS,
]);
