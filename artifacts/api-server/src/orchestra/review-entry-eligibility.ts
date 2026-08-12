/**
 * Review Entry Eligibility — FI-DSN-STD-014-R08 through R13.
 *
 * Admits a Review-Entry Ready RVA into production-readiness Review (Under Review).
 * Consumes Domain 2 outputs; does not recreate Review-Entry Readiness (R09).
 * Does not constitute Review Determination, Approval, or GPRA (R13).
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernanceTraceability } from "./domain3-authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  Domain2ReviewEntryEvidence,
  ProductionReadinessReview,
  ProductionReadinessReviewId,
} from "./domain3-types.js";
import type {
  RealizationTraceabilityPackage,
  RealizedVisualArtifact,
  ReviewEntryReadiness,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import { isTerminalRvaPosture } from "./rva-lifecycle.js";

const REVIEW_ENTRY_REQUIREMENTS = [
  "FI-DSN-STD-014-R08",
  "FI-DSN-STD-014-R09",
  "FI-DSN-STD-014-R10",
  "FI-DSN-STD-014-R11",
  "FI-DSN-STD-014-R12",
  "FI-DSN-STD-014-R13",
] as const;

export function createProductionReadinessReviewId(): ProductionReadinessReviewId {
  return `production-readiness-review-${randomUUID()}` as ProductionReadinessReviewId;
}

function lineageEquals(
  a: RealizedVisualArtifact["lineage"],
  b: RealizationTraceabilityPackage["lineage"],
): boolean {
  return (
    a.rootRvaId === b.rootRvaId &&
    a.versionSequence === b.versionSequence &&
    a.priorVersionId === b.priorVersionId
  );
}

/**
 * Admit a Review-Entry Ready RVA into production-readiness Review — R08–R13.
 * Pure constitutional construction; repository persists and enforces uniqueness.
 */
export function admitProductionReadinessReview(input: {
  rva: RealizedVisualArtifact;
  reviewEntryReadiness: ReviewEntryReadiness;
  traceabilityPackage: RealizationTraceabilityPackage;
  admittedBy: string;
  admittedAt?: string;
  /** G7 R51 — required together when admitting after Conditional/Fail prior Review. */
  priorReviewId?: ProductionReadinessReviewId | null;
  resubmissionEligibilityId?: import("./domain3-types.js").ResubmissionEligibilityId | null;
}): ProductionReadinessReview {
  if (input.reviewEntryReadiness.posture !== "review_entry_ready") {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review requires Review-Entry Ready posture from Domain 2",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08"],
    );
  }

  if (input.rva.posture !== "rva_exists" || isTerminalRvaPosture(input.rva.posture)) {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review shall not commence from incomplete Realization or terminal RVA",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R12"],
    );
  }

  if (input.reviewEntryReadiness.rvaId !== input.rva.id) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness does not belong to the subject RVA",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R09"],
    );
  }

  if (input.traceabilityPackage.rvaId !== input.rva.id) {
    throw new OrchestraConstitutionalError(
      "Realization Traceability Package does not belong to the subject RVA",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R10"],
    );
  }

  if (input.reviewEntryReadiness.traceabilityPackage.rvaId !== input.rva.id) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness embeds a Traceability Package for a different RVA",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R09", "FI-DSN-STD-014-R10"],
    );
  }

  if (
    input.reviewEntryReadiness.programId !== input.rva.programId ||
    input.traceabilityPackage.programId !== input.rva.programId
  ) {
    throw new OrchestraConstitutionalError(
      "Production Program identity mismatch at Review entry",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R11"],
    );
  }

  if (
    input.reviewEntryReadiness.obligationId !== input.rva.obligationId ||
    input.traceabilityPackage.obligationId !== input.rva.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Production Obligation identity mismatch at Review entry",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R11"],
    );
  }

  if (!lineageEquals(input.rva.lineage, input.traceabilityPackage.lineage)) {
    throw new OrchestraConstitutionalError(
      "RVA Version Lineage mismatch at Review entry",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R10"],
    );
  }

  if (input.traceabilityPackage.rvaPosture !== "rva_exists") {
    throw new OrchestraConstitutionalError(
      "Traceability Package RVA posture is not eligible for Review entry",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R12"],
    );
  }

  const admittedBy = input.admittedBy.trim();
  if (!admittedBy) {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review admission requires attributable actor",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08"],
    );
  }

  const now = input.admittedAt ?? new Date().toISOString();

  const domain2EntryEvidence: Domain2ReviewEntryEvidence = Object.freeze({
    rvaId: input.rva.id,
    rvaPostureAtEntry: "rva_exists",
    reviewEntryReadinessId: input.reviewEntryReadiness.readinessId,
    traceabilityPackageId: input.traceabilityPackage.packageId,
    programId: input.rva.programId,
    obligationId: input.rva.obligationId,
    lineage: Object.freeze({ ...input.rva.lineage }),
    realizationPath: input.traceabilityPackage.realizationPath,
  });

  const priorReviewId = input.priorReviewId ?? null;
  const resubmissionEligibilityId = input.resubmissionEligibilityId ?? null;
  if ((priorReviewId === null) !== (resubmissionEligibilityId === null)) {
    throw new OrchestraConstitutionalError(
      "Subsequent Review admission requires both priorReviewId and resubmissionEligibilityId together",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R51"],
    );
  }

  return Object.freeze({
    reviewId: createProductionReadinessReviewId(),
    rvaId: input.rva.id,
    programId: input.rva.programId,
    obligationId: input.rva.obligationId,
    posture: "under_review",
    eligibilityStatus: "review_entry_eligible",
    domain2EntryEvidence,
    determinationId: null,
    priorReviewId,
    resubmissionEligibilityId,
    // Audit embeds STD-012-R40 as upstream Domain 1→2 consumption provenance
    // (same pattern as Domain 2 objects). Primary STD-014 G2 admission authority
    // is recorded on ProductionReadinessReview.traceability below (BC-ORCH-019).
    audit: Object.freeze({
      createdAt: now,
      createdBy: admittedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: createDomain3GovernanceTraceability([...REVIEW_ENTRY_REQUIREMENTS]),
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

export const REVIEW_ENTRY_ELIGIBILITY_TRACEABILITY = createDomain3GovernanceTraceability([
  ...REVIEW_ENTRY_REQUIREMENTS,
]);

/** Deferred STD-014 Approval/GPRA operational grant was G6 — recording is implemented; marker retained for barrel compatibility. */
export const GPRA_GRANT_DEFERRED = "FI-DSN-STD-014-GPRA-GRANT-DEFERRED" as const;
/** Historical marker — G5 Review Determination recording is implemented; retained for barrel compatibility. */
export const REVIEW_DETERMINATION_DEFERRED = "FI-DSN-STD-014-REVIEW-DETERMINATION-DEFERRED" as const;
export const REVIEW_QUEUE_WORKER_DEFERRED = "FI-DSN-STD-014-QUEUE-WORKER-DEFERRED" as const;
export const DOMAIN3_HANDOFF_DEFERRED = "FI-DSN-STD-015-HANDOFF-DEFERRED" as const;
