/**
 * G7 persisted constitutional coherence — ORCH-IMP-010.2 (downstream disposition).
 *
 * Rehydration must reject contradictory Review / Determination / disposition
 * linkage. Does not repair history. Does not terminate RVA/Program/Obligation.
 */

import { isCanonicalEstablishedDownstreamDispositionAuthorityClassId } from "../downstream-disposition-authority.js";
import type {
  ApprovalWithholdingRecord,
  DownstreamDeficiencyRecord,
  ProductionReadinessReview,
  ResubmissionEligibilityRecord,
  ReturnPostureRecord,
  ReviewDeterminationRecord,
  ReworkAuthorizationRecord,
  ReworkAuthorizationWithholdingRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";
import { assertPersistedRouteCReturnNotAuthorized } from "../route-c-return-authority.js";

/**
 * Review ↔ Conditional/Fail Determination joint identity required for EGDF/DSRA/resubmission.
 */
export function assertPersistedConditionalOrFailReviewDeterminationCoherence(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
}): "conditional_route" | "fail_route" {
  const { review, determination } = input;

  if (review.posture !== "review_determined" || !review.determinationId) {
    throw new OrchestraConstitutionalError(
      "G7 disposition requires a completed Review with Determination linkage",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R47", "FI-DSN-STD-014-R49"],
    );
  }
  if (review.determinationId !== determination.determinationId) {
    throw new OrchestraConstitutionalError(
      "review.determinationId does not resolve to the provided Determination",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R44", "FI-DSN-STD-014-R51"],
    );
  }
  if (determination.reviewId !== review.reviewId) {
    throw new OrchestraConstitutionalError(
      "Determination does not belong to the subject Review",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R44"],
    );
  }
  if (
    determination.rvaId !== review.rvaId ||
    determination.programId !== review.programId ||
    determination.obligationId !== review.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Determination RVA/Program/Obligation does not match Review subject",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (determination.outcome === "pass") {
    throw new OrchestraConstitutionalError(
      "G7 EGDF/DSRA/resubmission requires Conditional or Fail Determination; Pass cannot support those disposition acts",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (determination.outcome === "conditional") return "conditional_route";
  if (determination.outcome === "fail") return "fail_route";
  throw new OrchestraConstitutionalError(
    "Unknown Review Determination outcome for G7 disposition",
    "invalid_downstream_disposition",
    ["FI-DSN-STD-014-R47"],
  );
}

/**
 * Review ↔ Pass Determination + Approval withholding for return-after-withholding route.
 */
export function assertPersistedPassWithholdingReturnCoherence(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  approvalWithholding: ApprovalWithholdingRecord;
}): void {
  const { review, determination, approvalWithholding } = input;

  if (review.posture !== "review_determined" || !review.determinationId) {
    throw new OrchestraConstitutionalError(
      "G7 return after withholding requires a completed Review with Determination linkage",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (review.determinationId !== determination.determinationId) {
    throw new OrchestraConstitutionalError(
      "review.determinationId does not resolve to the provided Determination",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (determination.reviewId !== review.reviewId) {
    throw new OrchestraConstitutionalError(
      "Determination does not belong to the subject Review",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (
    determination.rvaId !== review.rvaId ||
    determination.programId !== review.programId ||
    determination.obligationId !== review.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Determination RVA/Program/Obligation does not match Review subject",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (determination.outcome !== "pass") {
    throw new OrchestraConstitutionalError(
      "Withholding-return route requires Pass Determination",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (approvalWithholding.reviewId !== review.reviewId) {
    throw new OrchestraConstitutionalError(
      "Approval withholding does not belong to the subject Review for return posture",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (
    approvalWithholding.determinationId !== determination.determinationId ||
    approvalWithholding.determinationId !== review.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      "Approval withholding Determination identity does not match Review Pass Determination",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (
    approvalWithholding.rvaId !== review.rvaId ||
    approvalWithholding.programId !== review.programId ||
    approvalWithholding.obligationId !== review.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Approval withholding RVA/Program/Obligation does not match Review subject",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
}

function assertDdacClassCoherent(authorityClassId: unknown): void {
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted G7 disposition DDAC authority class is not established",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45"],
    );
  }
}

function assertSubjectMatch(
  record: {
    reviewId: string;
    determinationId: string;
    rvaId: string;
    programId: string;
    obligationId: string;
  },
  review: ProductionReadinessReview,
  determination: ReviewDeterminationRecord,
  label: string,
): void {
  if (record.reviewId !== review.reviewId) {
    throw new OrchestraConstitutionalError(
      `${label} Review identity does not match persisted Review`,
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R44"],
    );
  }
  if (
    record.determinationId !== determination.determinationId ||
    record.determinationId !== review.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      `${label} Determination identity does not match Review Determination`,
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R44"],
    );
  }
  if (
    record.rvaId !== review.rvaId ||
    record.programId !== review.programId ||
    record.obligationId !== review.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      `${label} RVA/Program/Obligation does not match Review subject`,
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
}

export function assertPersistedDownstreamDeficiencyCoherence(input: {
  deficiency: DownstreamDeficiencyRecord;
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
}): void {
  const route = assertPersistedConditionalOrFailReviewDeterminationCoherence(input);
  assertDdacClassCoherent(input.deficiency.authorityClassId);
  assertSubjectMatch(input.deficiency, input.review, input.determination, "Downstream deficiency");
  if (input.deficiency.route !== route) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency route does not match Determination outcome",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46", "FI-DSN-STD-014-R49"],
    );
  }
}

export function assertPersistedReworkAuthorizationCoherence(input: {
  authorization: ReworkAuthorizationRecord;
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
}): void {
  const route = assertPersistedConditionalOrFailReviewDeterminationCoherence(input);
  assertDdacClassCoherent(input.authorization.authorityClassId);
  assertSubjectMatch(
    input.authorization,
    input.review,
    input.determination,
    "Rework authorization",
  );
  if (input.authorization.route !== route) {
    throw new OrchestraConstitutionalError(
      "Rework authorization route does not match Determination outcome",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R47", "FI-DSN-STD-014-R49"],
    );
  }
}

export function assertPersistedReworkAuthorizationWithholdingCoherence(input: {
  withholding: ReworkAuthorizationWithholdingRecord;
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
}): void {
  const route = assertPersistedConditionalOrFailReviewDeterminationCoherence(input);
  assertDdacClassCoherent(input.withholding.authorityClassId);
  assertSubjectMatch(
    input.withholding,
    input.review,
    input.determination,
    "Rework authorization withholding",
  );
  if (input.withholding.route !== route) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding route does not match Determination outcome",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R48", "FI-DSN-STD-014-R49"],
    );
  }
}

export function assertPersistedReturnPostureCoherence(input: {
  returnPosture: ReturnPostureRecord;
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  approvalWithholding?: ApprovalWithholdingRecord | null;
}): void {
  if (
    input.returnPosture.route === "withholding_return_only" ||
    input.returnPosture.returnKind === "return_authorized_after_approval_withholding"
  ) {
    assertPersistedRouteCReturnNotAuthorized();
  }

  assertDdacClassCoherent(input.returnPosture.authorityClassId);
  assertSubjectMatch(
    input.returnPosture,
    input.review,
    input.determination,
    "Return posture",
  );

  const route = assertPersistedConditionalOrFailReviewDeterminationCoherence(input);
  if (input.returnPosture.route !== route) {
    throw new OrchestraConstitutionalError(
      "Return posture route does not match Determination outcome",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
}

export function assertPersistedResubmissionEligibilityCoherence(input: {
  eligibility: ResubmissionEligibilityRecord;
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
}): void {
  const route = assertPersistedConditionalOrFailReviewDeterminationCoherence(input);
  assertDdacClassCoherent(input.eligibility.authorityClassId);

  if (input.eligibility.priorReviewId !== input.review.reviewId) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility priorReviewId does not match persisted Review",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R51"],
    );
  }
  if (
    input.eligibility.priorDeterminationId !== input.determination.determinationId ||
    input.eligibility.priorDeterminationId !== input.review.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility priorDeterminationId does not match Review Determination",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R51"],
    );
  }
  if (
    input.eligibility.rvaId !== input.review.rvaId ||
    input.eligibility.programId !== input.review.programId ||
    input.eligibility.obligationId !== input.review.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility RVA/Program/Obligation does not match Review subject",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R51"],
    );
  }
  if (input.eligibility.route !== route) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility route does not match Determination outcome",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R51"],
    );
  }
}
