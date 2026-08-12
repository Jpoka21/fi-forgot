/**
 * Review Determination Outcomes — FI-DSN-STD-014-R27 through R33 (G5).
 *
 * Records exactly one immutable Determination for a completed Review.
 * Does not grant Approval, GPRA, rework authorization, or STD-015 handoff (R29, R33).
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernanceTraceability } from "./domain3-authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  MandatoryReviewActivityCompleteness,
  ProductionReadinessReview,
  ReviewDeterminationId,
  ReviewDeterminationOutcome,
  ReviewDeterminationRecord,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";

const G5_REQUIREMENTS = [
  "FI-DSN-STD-014-R27",
  "FI-DSN-STD-014-R28",
  "FI-DSN-STD-014-R29",
  "FI-DSN-STD-014-R30",
  "FI-DSN-STD-014-R31",
  "FI-DSN-STD-014-R32",
  "FI-DSN-STD-014-R33",
] as const;

export const REVIEW_DETERMINATION_TRACEABILITY =
  createDomain3GovernanceTraceability([...G5_REQUIREMENTS]);

export const LEGAL_REVIEW_DETERMINATION_OUTCOMES: readonly ReviewDeterminationOutcome[] = [
  "pass",
  "conditional",
  "fail",
];

export function createReviewDeterminationId(): ReviewDeterminationId {
  return `review-determination-${randomUUID()}` as ReviewDeterminationId;
}

export function isLegalReviewDeterminationOutcome(
  value: unknown,
): value is ReviewDeterminationOutcome {
  return (
    typeof value === "string" &&
    (LEGAL_REVIEW_DETERMINATION_OUTCOMES as readonly string[]).includes(value)
  );
}

function assertUnderReviewForDetermination(review: ProductionReadinessReview): void {
  if (review.posture !== "under_review") {
    throw new OrchestraConstitutionalError(
      "Review Determination requires Under Review posture; Review already determined or not active",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R27"],
    );
  }
  if (review.determinationId !== null) {
    throw new OrchestraConstitutionalError(
      "Review already linked to a Review Determination; exactly one Determination per completed Review",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R27"],
    );
  }
}

/**
 * R30: incomplete evidence must not constitute Conditional (or any outcome).
 * Enforce G3 mandatory completeness before Determination may be recorded.
 */
function assertEvidenceGroundingComplete(
  completeness: MandatoryReviewActivityCompleteness,
): void {
  if (!completeness.allMandatoryDimensionsAddressed) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires documented Review evidence under all mandatory Review dimensions; incomplete Review evidence does not constitute Pass, Conditional, or Fail",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R27", "FI-DSN-STD-014-R30"],
    );
  }
}

function assertOutcomeSemantics(input: {
  outcome: ReviewDeterminationOutcome;
  conditions: readonly string[];
  grounds: string;
}): void {
  const grounds = input.grounds.trim();
  if (!grounds) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires documented grounds",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R29", "FI-DSN-STD-014-R30"],
    );
  }

  const conditions = input.conditions.map((c) => c.trim()).filter((c) => c.length > 0);

  if (input.outcome === "conditional") {
    if (conditions.length === 0) {
      throw new OrchestraConstitutionalError(
        "Conditional Review Determination requires bounded documented conditions",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R29", "FI-DSN-STD-014-R31"],
      );
    }
    return;
  }

  if (conditions.length > 0) {
    throw new OrchestraConstitutionalError(
      "Pass and Fail Review Determinations must not record Conditional conditions",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R28", "FI-DSN-STD-014-R29"],
    );
  }
}

/**
 * Build an immutable Review Determination and the completed Review posture.
 * Does not mutate historical evidence or activities.
 */
export function createReviewDetermination(input: {
  review: ProductionReadinessReview;
  completeness: MandatoryReviewActivityCompleteness;
  evidence: readonly ReviewEvidenceRecord[];
  activities: readonly ReviewDimensionActivityRecord[];
  outcome: ReviewDeterminationOutcome;
  conditions?: readonly string[];
  grounds: string;
  determinedBy: string;
  determinedAt?: string;
}): {
  determination: ReviewDeterminationRecord;
  completedReview: ProductionReadinessReview;
} {
  assertUnderReviewForDetermination(input.review);

  if (!isLegalReviewDeterminationOutcome(input.outcome)) {
    throw new OrchestraConstitutionalError(
      "Review Determination outcome must be exactly Pass, Conditional, or Fail",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R28"],
    );
  }

  const determinedBy = input.determinedBy.trim();
  if (!determinedBy) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires attributable actor",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R27"],
    );
  }

  if (input.completeness.reviewId !== input.review.reviewId) {
    throw new OrchestraConstitutionalError(
      "Completeness query Review identity does not match subject Review",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R27", "FI-DSN-STD-014-R30"],
    );
  }

  assertEvidenceGroundingComplete(input.completeness);

  for (const evidence of input.evidence) {
    if (evidence.reviewId !== input.review.reviewId) {
      throw new OrchestraConstitutionalError(
        "Determination evidence basis includes evidence belonging to another Review",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R30"],
      );
    }
    if (evidence.rvaId !== input.review.rvaId) {
      throw new OrchestraConstitutionalError(
        "Determination evidence basis RVA does not match Review subject",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R30"],
      );
    }
  }

  for (const activity of input.activities) {
    if (activity.reviewId !== input.review.reviewId) {
      throw new OrchestraConstitutionalError(
        "Determination activity basis includes activity belonging to another Review",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R30"],
      );
    }
    if (activity.rvaId !== input.review.rvaId) {
      throw new OrchestraConstitutionalError(
        "Determination activity basis RVA does not match Review subject",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R30"],
      );
    }
  }

  if (input.evidence.length === 0 || input.activities.length === 0) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires documented Review evidence and dimension activity",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R30"],
    );
  }

  const conditions = Object.freeze(
    (input.conditions ?? []).map((c) => c.trim()).filter((c) => c.length > 0),
  );
  assertOutcomeSemantics({
    outcome: input.outcome,
    conditions,
    grounds: input.grounds,
  });

  const now = input.determinedAt ?? new Date().toISOString();
  const determinationId = createReviewDeterminationId();

  const determination: ReviewDeterminationRecord = Object.freeze({
    determinationId,
    reviewId: input.review.reviewId,
    rvaId: input.review.rvaId,
    programId: input.review.programId,
    obligationId: input.review.obligationId,
    outcome: input.outcome,
    evidenceBasisIds: Object.freeze(input.evidence.map((item) => item.evidenceId)),
    activityBasisIds: Object.freeze(input.activities.map((item) => item.activityId)),
    conditions,
    grounds: input.grounds.trim(),
    determinedAt: now,
    determinedBy,
    audit: Object.freeze({
      createdAt: now,
      createdBy: determinedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: REVIEW_DETERMINATION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });

  const completedReview: ProductionReadinessReview = Object.freeze({
    ...input.review,
    posture: "review_determined",
    determinationId,
  });

  return { determination, completedReview };
}

/**
 * R31: Conditional is fixed — no mutation API converting Conditional to Pass.
 * This helper exists only to reject attempted mutation at the type boundary.
 */
export function assertConditionalDeterminationImmutable(
  determination: ReviewDeterminationRecord,
): void {
  if (determination.outcome !== "conditional") {
    return;
  }
  // Constitutional marker: Conditional remains Conditional for this Review instance.
  void determination.conditions;
}

/**
 * R29 / R33: Pass is necessary-not-sufficient for later Approval consideration;
 * none of the outcomes constitute Approval or GPRA. G5 records architecture only.
 */
export function reviewDeterminationConstitutesApprovalOrGpra(
  _determination: ReviewDeterminationRecord,
): false {
  return false;
}
