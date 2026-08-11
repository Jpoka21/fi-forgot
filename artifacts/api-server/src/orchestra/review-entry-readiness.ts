import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import { createDomain2GovernedCreationMarker } from "./domain2-entry.js";
import type {
  RealizationTraceabilityPackage,
  ReviewEntryReadiness,
  ReviewEntryReadinessId,
  RealizedVisualArtifact,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import { isTerminalRvaPosture } from "./rva-lifecycle.js";
import { assertTraceabilityPackageComplete } from "./traceability-package.js";

const REVIEW_ENTRY_READINESS_REQUIREMENTS = [
  "FI-DSN-STD-013-R49",
  "FI-DSN-STD-013-R50",
] as const;

export function createReviewEntryReadinessId(): ReviewEntryReadinessId {
  return `review-entry-readiness-${randomUUID()}` as ReviewEntryReadinessId;
}

/**
 * Determine Review-Entry Readiness — STD-013 output boundary to STD-014.
 * Does NOT grant GPRA, review determination, or production readiness approval.
 */
export function determineReviewEntryReadiness(input: {
  rva: RealizedVisualArtifact;
  traceabilityPackage: RealizationTraceabilityPackage;
  determinedBy: string;
  determinedAt?: string;
}): ReviewEntryReadiness {
  if (input.rva.posture !== "rva_exists") {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness requires RVA Exists posture",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49"],
    );
  }

  if (isTerminalRvaPosture(input.rva.posture)) {
    throw new OrchestraConstitutionalError(
      "Terminal RVA cannot achieve Review-Entry Readiness",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49"],
    );
  }

  if (input.traceabilityPackage.rvaId !== input.rva.id) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness traceability package does not match RVA",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49"],
    );
  }

  assertTraceabilityPackageComplete(input.traceabilityPackage);

  const now = input.determinedAt ?? new Date().toISOString();

  return Object.freeze({
    readinessId: createReviewEntryReadinessId(),
    rvaId: input.rva.id,
    programId: input.rva.programId,
    obligationId: input.rva.obligationId,
    posture: "review_entry_ready",
    traceabilityPackage: input.traceabilityPackage,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.determinedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: createDomain2GovernanceTraceability([...REVIEW_ENTRY_READINESS_REQUIREMENTS]),
    governedCreationMarker: createDomain2GovernedCreationMarker(),
  });
}

export const REVIEW_ENTRY_READINESS_TRACEABILITY = createDomain2GovernanceTraceability([
  ...REVIEW_ENTRY_READINESS_REQUIREMENTS,
]);
