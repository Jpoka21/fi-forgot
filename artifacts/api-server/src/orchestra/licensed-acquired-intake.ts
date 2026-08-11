/**
 * Licensed or Acquired Intake traceability — FI-DSN-STD-013-R39.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import { createDomain2GovernedCreationMarker } from "./domain2-entry.js";
import type {
  LicensedAcquiredIntakeId,
  LicensedAcquiredRightsPosture,
  RealizedVisualArtifact,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";

const INTAKE_REQUIREMENTS = [
  "FI-DSN-STD-013-R39",
  "FI-DSN-STD-013-R37",
] as const;

export function createLicensedAcquiredIntakeId(): LicensedAcquiredIntakeId {
  return `licensed-acquired-intake-${randomUUID()}` as LicensedAcquiredIntakeId;
}

/**
 * Record licensed or acquired intake rights posture for an RVA — R39.
 */
export function recordLicensedAcquiredIntake(input: {
  rva: RealizedVisualArtifact;
  sourceReference: string;
  rightsBasis: string;
  attributionRequirement: string;
  usageRestrictions?: string | null;
  recordedBy: string;
  recordedAt?: string;
}): LicensedAcquiredRightsPosture {
  if (input.rva.realizationPath !== "licensed_or_acquired") {
    throw new OrchestraConstitutionalError(
      "Licensed or acquired intake applies only to licensed_or_acquired realization path",
      "invalid_licensed_acquired_intake",
      ["FI-DSN-STD-013-R39", "FI-DSN-STD-013-R37"],
    );
  }

  const sourceReference = input.sourceReference.trim();
  const rightsBasis = input.rightsBasis.trim();
  const attributionRequirement = input.attributionRequirement.trim();

  if (!sourceReference || !rightsBasis || !attributionRequirement) {
    throw new OrchestraConstitutionalError(
      "Licensed or acquired intake requires source reference, rights basis, and attribution requirement",
      "invalid_licensed_acquired_intake",
      ["FI-DSN-STD-013-R39"],
    );
  }

  const now = input.recordedAt ?? new Date().toISOString();

  return Object.freeze({
    intakeId: createLicensedAcquiredIntakeId(),
    rvaId: input.rva.id,
    sourceReference,
    rightsBasis,
    attributionRequirement,
    usageRestrictions: input.usageRestrictions?.trim() ?? null,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.recordedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: createDomain2GovernanceTraceability([...INTAKE_REQUIREMENTS]),
    governedCreationMarker: createDomain2GovernedCreationMarker(),
  });
}

export const LICENSED_ACQUIRED_INTAKE_TRACEABILITY = createDomain2GovernanceTraceability([
  ...INTAKE_REQUIREMENTS,
]);
