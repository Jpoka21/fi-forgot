/**
 * Review activity construction — FI-DSN-STD-014-R14 through R20.
 * Produces evidence and dimension activity without Review Determination or GPRA.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  MandatoryReviewActivityCompleteness,
  ProductionReadinessReview,
  ReviewDimensionActivityId,
  ReviewDimensionActivityRecord,
  ReviewEvidenceId,
  ReviewEvidenceRecord,
  ReviewEvidenceSourceKind,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertMandatoryReviewDimensionId,
  listMandatoryReviewDimensionIds,
  REVIEW_ACTIVITY_TRACEABILITY,
  type MandatoryReviewDimensionId,
} from "./review-dimensions.js";

const G3_REQUIREMENTS = [
  "FI-DSN-STD-014-R14",
  "FI-DSN-STD-014-R15",
  "FI-DSN-STD-014-R16",
  "FI-DSN-STD-014-R19",
  "FI-DSN-STD-014-R20",
] as const;

const LEGAL_SOURCE_KINDS: readonly ReviewEvidenceSourceKind[] = [
  "compliance_boundary",
  "domain2_entry_evidence",
  "realization_traceability_package",
  "observation",
];

export function createReviewEvidenceId(): ReviewEvidenceId {
  return `review-evidence-${randomUUID()}` as ReviewEvidenceId;
}

export function createReviewDimensionActivityId(): ReviewDimensionActivityId {
  return `review-dimension-activity-${randomUUID()}` as ReviewDimensionActivityId;
}

function assertUnderReview(review: ProductionReadinessReview): void {
  if (review.posture !== "under_review") {
    throw new OrchestraConstitutionalError(
      "Review activity requires Production-readiness Review in Under Review posture",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R14"],
    );
  }
}

/**
 * Construct immutable Review evidence for a mandatory dimension (R20).
 */
export function createReviewEvidenceRecord(input: {
  review: ProductionReadinessReview;
  dimensionId: MandatoryReviewDimensionId;
  sourceKind: ReviewEvidenceSourceKind;
  sourceRecordId: string;
  sourceSnapshot: string;
  capturedBy: string;
  capturedAt?: string;
}): ReviewEvidenceRecord {
  assertUnderReview(input.review);
  assertMandatoryReviewDimensionId(input.dimensionId);

  if (!(LEGAL_SOURCE_KINDS as readonly string[]).includes(input.sourceKind)) {
    throw new OrchestraConstitutionalError(
      "Unknown Review evidence source kind",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R20"],
    );
  }

  const sourceRecordId = input.sourceRecordId.trim();
  const sourceSnapshot = input.sourceSnapshot.trim();
  const capturedBy = input.capturedBy.trim();
  if (!sourceRecordId || !sourceSnapshot || !capturedBy) {
    throw new OrchestraConstitutionalError(
      "Review evidence requires source record, immutable snapshot, and attributable actor",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R20"],
    );
  }

  const now = input.capturedAt ?? new Date().toISOString();

  return Object.freeze({
    evidenceId: createReviewEvidenceId(),
    reviewId: input.review.reviewId,
    rvaId: input.review.rvaId,
    dimensionId: input.dimensionId,
    evidenceCategoryId: input.dimensionId,
    sourceKind: input.sourceKind,
    sourceRecordId,
    sourceSnapshot,
    capturedAt: now,
    capturedBy,
    audit: Object.freeze({
      createdAt: now,
      createdBy: capturedBy,
      // Upstream Domain 1→2 consumption provenance; G3 authority on record.traceability.
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: REVIEW_ACTIVITY_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

/**
 * Construct append-only dimension activity binding evidence (R14–R16, R20).
 */
export function createReviewDimensionActivityRecord(input: {
  review: ProductionReadinessReview;
  dimensionId: MandatoryReviewDimensionId;
  evidence: readonly ReviewEvidenceRecord[];
  observation: string;
  addressedBy: string;
  addressedAt?: string;
}): ReviewDimensionActivityRecord {
  assertUnderReview(input.review);
  assertMandatoryReviewDimensionId(input.dimensionId);

  if (input.evidence.length === 0) {
    throw new OrchestraConstitutionalError(
      "Review dimension activity requires at least one Review evidence record",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R16", "FI-DSN-STD-014-R20"],
    );
  }

  for (const evidence of input.evidence) {
    if (evidence.reviewId !== input.review.reviewId) {
      throw new OrchestraConstitutionalError(
        "Review evidence does not belong to the subject Production-readiness Review",
        "invalid_review_activity",
        ["FI-DSN-STD-014-R14", "FI-DSN-STD-014-R20"],
      );
    }
    if (evidence.rvaId !== input.review.rvaId) {
      throw new OrchestraConstitutionalError(
        "Review evidence RVA does not match the subject Production-readiness Review",
        "invalid_review_activity",
        ["FI-DSN-STD-014-R14"],
      );
    }
    if (evidence.dimensionId !== input.dimensionId) {
      throw new OrchestraConstitutionalError(
        "Review evidence dimension does not match the Review dimension activity",
        "invalid_review_activity",
        ["FI-DSN-STD-014-R15", "FI-DSN-STD-014-R20"],
      );
    }
  }

  const observation = input.observation.trim();
  const addressedBy = input.addressedBy.trim();
  if (!observation || !addressedBy) {
    throw new OrchestraConstitutionalError(
      "Review dimension activity requires observation and attributable actor",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R14"],
    );
  }

  const now = input.addressedAt ?? new Date().toISOString();
  const evidenceIds = Object.freeze(input.evidence.map((item) => item.evidenceId));

  return Object.freeze({
    activityId: createReviewDimensionActivityId(),
    reviewId: input.review.reviewId,
    rvaId: input.review.rvaId,
    dimensionId: input.dimensionId,
    evidenceIds,
    observation,
    addressedAt: now,
    addressedBy,
    audit: Object.freeze({
      createdAt: now,
      createdBy: addressedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: REVIEW_ACTIVITY_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

function assertReviewSubjectForCompleteness(review: ProductionReadinessReview): void {
  if (review.posture !== "under_review" && review.posture !== "review_determined") {
    throw new OrchestraConstitutionalError(
      "Mandatory Review activity completeness requires a lawful Production-readiness Review",
      "invalid_review_activity",
      [...G3_REQUIREMENTS],
    );
  }
}

/**
 * Pure completeness query — not Review Determination, Approval, or GPRA (R20 / R13).
 * Readable while under_review or after review_determined (G5).
 */
export function evaluateMandatoryReviewActivityCompleteness(input: {
  review: ProductionReadinessReview;
  activities: readonly ReviewDimensionActivityRecord[];
}): MandatoryReviewActivityCompleteness {
  assertReviewSubjectForCompleteness(input.review);

  const addressed = new Set<MandatoryReviewDimensionId>();
  for (const activity of input.activities) {
    if (activity.reviewId !== input.review.reviewId) {
      throw new OrchestraConstitutionalError(
        "Review dimension activity does not belong to the evaluated Review",
        "invalid_review_activity",
        [...G3_REQUIREMENTS],
      );
    }
    if (activity.evidenceIds.length === 0) {
      continue;
    }
    addressed.add(activity.dimensionId);
  }

  const mandatory = listMandatoryReviewDimensionIds();
  const addressedDimensionIds = Object.freeze(
    mandatory.filter((dimensionId) => addressed.has(dimensionId)),
  );
  const missingDimensionIds = Object.freeze(
    mandatory.filter((dimensionId) => !addressed.has(dimensionId)),
  );

  return Object.freeze({
    reviewId: input.review.reviewId,
    allMandatoryDimensionsAddressed: missingDimensionIds.length === 0,
    addressedDimensionIds,
    missingDimensionIds,
  });
}
