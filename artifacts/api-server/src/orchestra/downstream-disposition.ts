/**
 * Downstream disposition — FI-DSN-STD-014-R44 through R51 (G7).
 *
 * EGDF deficiency, DSRA rework authorization, TRPM return posture,
 * and resubmission eligibility. Does not terminate RVA/Program/Obligation,
 * grant GPRA, revise Determinations, or implement G8 invalidation.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { assertGovernedDeficiencyFamily } from "./deficiency-families.js";
import { createDomain3GovernanceTraceability } from "./domain3-authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import {
  assertEstablishedDownstreamDispositionAuthorityClass,
  resolveEstablishedDownstreamDispositionAuthorityClass,
} from "./downstream-disposition-authority.js";
import type {
  ApprovalWithholdingId,
  ApprovalWithholdingRecord,
  DownstreamDeficiencyRecord,
  DownstreamDeficiencyRecordId,
  DownstreamDispositionAuthorityClassId,
  DownstreamDispositionEligibility,
  DownstreamDispositionRoute,
  GovernedDeficiencyFamily,
  ProductionReadinessReview,
  ResubmissionEligibilityId,
  ResubmissionEligibilityRecord,
  ReturnPostureId,
  ReturnPostureKind,
  ReturnPostureRecord,
  ReviewDeterminationRecord,
  ReviewEvidenceId,
  ReworkAuthorizationId,
  ReworkAuthorizationRecord,
  ReworkAuthorizationWithholdingId,
  ReworkAuthorizationWithholdingRecord,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import { assertFrozenRouteCReturnAuthorityAvailable } from "./route-c-return-authority.js";

const G7_REQUIREMENTS = [
  "FI-DSN-STD-014-R44",
  "FI-DSN-STD-014-R45",
  "FI-DSN-STD-014-R46",
  "FI-DSN-STD-014-R47",
  "FI-DSN-STD-014-R48",
  "FI-DSN-STD-014-R49",
  "FI-DSN-STD-014-R50",
  "FI-DSN-STD-014-R51",
] as const;

export const DOWNSTREAM_DISPOSITION_TRACEABILITY = createDomain3GovernanceTraceability([
  ...G7_REQUIREMENTS,
]);

export function createDownstreamDeficiencyRecordId(): DownstreamDeficiencyRecordId {
  return `downstream-deficiency-${randomUUID()}` as DownstreamDeficiencyRecordId;
}

export function createReworkAuthorizationId(): ReworkAuthorizationId {
  return `rework-authorization-${randomUUID()}` as ReworkAuthorizationId;
}

export function createReworkAuthorizationWithholdingId(): ReworkAuthorizationWithholdingId {
  return `rework-authorization-withholding-${randomUUID()}` as ReworkAuthorizationWithholdingId;
}

export function createReturnPostureId(): ReturnPostureId {
  return `return-posture-${randomUUID()}` as ReturnPostureId;
}

export function createResubmissionEligibilityId(): ResubmissionEligibilityId {
  return `resubmission-eligibility-${randomUUID()}` as ResubmissionEligibilityId;
}

function assertConditionalOrFailRoute(
  review: ProductionReadinessReview,
  determination: ReviewDeterminationRecord,
): "conditional_route" | "fail_route" {
  if (review.posture !== "review_determined" || !review.determinationId) {
    throw new OrchestraConstitutionalError(
      "G7 disposition requires a completed Review with Determination",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R47", "FI-DSN-STD-014-R49"],
    );
  }
  if (review.determinationId !== determination.determinationId) {
    throw new OrchestraConstitutionalError(
      "G7 disposition requires joint Review–Determination identity",
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
      "Determination subject does not match Review for G7 disposition",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (determination.outcome === "pass") {
    throw new OrchestraConstitutionalError(
      "Pass Determination does not create G7 EGDF/DSRA disposition eligibility; Approval withholding after Pass blocks Approval and GPRA only",
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

export function evaluateDownstreamDispositionEligibility(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord | null;
  approvalWithholding: ApprovalWithholdingRecord | null;
}): DownstreamDispositionEligibility {
  const determination = input.determination;
  const passWithWithholding =
    !!determination &&
    determination.outcome === "pass" &&
    !!input.approvalWithholding &&
    input.approvalWithholding.reviewId === input.review.reviewId;

  if (
    determination &&
    input.review.posture === "review_determined" &&
    input.review.determinationId === determination.determinationId &&
    determination.reviewId === input.review.reviewId &&
    (determination.outcome === "conditional" || determination.outcome === "fail")
  ) {
    const route: DownstreamDispositionRoute =
      determination.outcome === "conditional" ? "conditional_route" : "fail_route";
    return Object.freeze({
      reviewId: input.review.reviewId,
      determinationId: determination.determinationId,
      route,
      dispositionEligible: true,
      reworkAuthorizationEligible: true,
      returnPostureEligible: true,
      resubmissionEligibilityActEligible: true,
      withholdingBlocksApprovalOnly: false,
    });
  }

  if (passWithWithholding) {
    // Route C baseline: block-without-return. Exceptional return is dormant until
    // frozen authority enumerates Route C return-authorizing sources (ORCH-IMP-011.2).
    return Object.freeze({
      reviewId: input.review.reviewId,
      determinationId: determination!.determinationId,
      route: "withholding_return_only",
      dispositionEligible: false,
      reworkAuthorizationEligible: false,
      returnPostureEligible: false,
      resubmissionEligibilityActEligible: false,
      withholdingBlocksApprovalOnly: true,
    });
  }

  return Object.freeze({
    reviewId: input.review.reviewId,
    determinationId: determination?.determinationId ?? input.review.determinationId,
    route: null,
    dispositionEligible: false,
    reworkAuthorizationEligible: false,
    returnPostureEligible: false,
    resubmissionEligibilityActEligible: false,
    withholdingBlocksApprovalOnly: false,
  });
}

export function createDownstreamDeficiencyRecord(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  deficiencyFamily: GovernedDeficiencyFamily;
  grounds: string;
  authorityClassId: DownstreamDispositionAuthorityClassId;
  recordedBy: string;
  evidenceBasisIds?: readonly ReviewEvidenceId[];
  recordedAt?: string;
}): DownstreamDeficiencyRecord {
  const route = assertConditionalOrFailRoute(input.review, input.determination);
  assertGovernedDeficiencyFamily(input.deficiencyFamily);
  assertEstablishedDownstreamDispositionAuthorityClass(input.authorityClassId);
  resolveEstablishedDownstreamDispositionAuthorityClass(input.authorityClassId);

  const grounds = input.grounds.trim();
  if (!grounds) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency record requires documented grounds",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46"],
    );
  }
  const recordedBy = input.recordedBy.trim();
  if (!recordedBy) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency record requires attributable DDAC actor",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45"],
    );
  }

  const now = input.recordedAt ?? new Date().toISOString();
  return Object.freeze({
    deficiencyRecordId: createDownstreamDeficiencyRecordId(),
    reviewId: input.review.reviewId,
    determinationId: input.determination.determinationId,
    rvaId: input.review.rvaId,
    programId: input.review.programId,
    obligationId: input.review.obligationId,
    route,
    deficiencyFamily: input.deficiencyFamily,
    grounds,
    evidenceBasisIds: Object.freeze([...(input.evidenceBasisIds ?? [])]),
    authorityClassId: input.authorityClassId,
    authorityGoverningSourceId: "PD-STD-014-012",
    recordedAt: now,
    recordedBy,
    determinationNotRevised: true,
    audit: Object.freeze({
      createdAt: now,
      createdBy: recordedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: DOWNSTREAM_DISPOSITION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

export function createReworkAuthorization(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  authorityClassId: DownstreamDispositionAuthorityClassId;
  authorizedBy: string;
  authorizedAt?: string;
}): ReworkAuthorizationRecord {
  const route = assertConditionalOrFailRoute(input.review, input.determination);
  assertEstablishedDownstreamDispositionAuthorityClass(input.authorityClassId);
  const authorizedBy = input.authorizedBy.trim();
  if (!authorizedBy) {
    throw new OrchestraConstitutionalError(
      "Rework authorization requires attributable DDAC actor",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R47"],
    );
  }
  const now = input.authorizedAt ?? new Date().toISOString();
  return Object.freeze({
    reworkAuthorizationId: createReworkAuthorizationId(),
    reviewId: input.review.reviewId,
    determinationId: input.determination.determinationId,
    rvaId: input.review.rvaId,
    programId: input.review.programId,
    obligationId: input.review.obligationId,
    route,
    authorityClassId: input.authorityClassId,
    authorityGoverningSourceId: "PD-STD-014-012",
    authorizedAt: now,
    authorizedBy,
    determinationNotRevised: true,
    notApproval: true,
    notGpra: true,
    manufacturingValidationNotPerformed: true,
    fulfillmentExecutionNotPerformed: true,
    std013IterationNotPerformed: true,
    audit: Object.freeze({
      createdAt: now,
      createdBy: authorizedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: DOWNSTREAM_DISPOSITION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

export function createReworkAuthorizationWithholding(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  authorityClassId: DownstreamDispositionAuthorityClassId;
  grounds: string;
  withheldBy: string;
  withheldAt?: string;
}): ReworkAuthorizationWithholdingRecord {
  const route = assertConditionalOrFailRoute(input.review, input.determination);
  assertEstablishedDownstreamDispositionAuthorityClass(input.authorityClassId);
  const grounds = input.grounds.trim();
  if (!grounds) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding requires documented grounds traceable to frozen DSRA governance",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R48"],
    );
  }
  const withheldBy = input.withheldBy.trim();
  if (!withheldBy) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding requires attributable DDAC actor",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R48"],
    );
  }
  const now = input.withheldAt ?? new Date().toISOString();
  return Object.freeze({
    withholdingId: createReworkAuthorizationWithholdingId(),
    reviewId: input.review.reviewId,
    determinationId: input.determination.determinationId,
    rvaId: input.review.rvaId,
    programId: input.review.programId,
    obligationId: input.review.obligationId,
    route,
    grounds,
    governingSourceId: "PD-STD-014-009",
    authorityClassId: input.authorityClassId,
    withheldAt: now,
    withheldBy,
    determinationNotRevised: true,
    audit: Object.freeze({
      createdAt: now,
      createdBy: withheldBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: DOWNSTREAM_DISPOSITION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

export function createReturnPosture(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  authorityClassId: DownstreamDispositionAuthorityClassId;
  establishedBy: string;
  approvalWithholding?: ApprovalWithholdingRecord | null;
  targetObligationScope?: "same_obligation" | "successor_obligation" | null;
  returnGoverningSourceId?: string;
  establishedAt?: string;
}): ReturnPostureRecord {
  assertEstablishedDownstreamDispositionAuthorityClass(input.authorityClassId);
  const establishedBy = input.establishedBy.trim();
  if (!establishedBy) {
    throw new OrchestraConstitutionalError(
      "Return posture requires attributable DDAC actor",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R49"],
    );
  }

  let route: DownstreamDispositionRoute;
  let returnKind: ReturnPostureKind;
  let approvalWithholdingId: ApprovalWithholdingId | null = null;
  let targetObligationScope: "same_obligation" | "successor_obligation" | null = null;
  let returnGoverningSourceId: string;

  if (input.determination.outcome === "conditional" || input.determination.outcome === "fail") {
    route = assertConditionalOrFailRoute(input.review, input.determination);
    returnKind =
      route === "conditional_route"
        ? "correction_return_to_realization"
        : "rework_return_to_realization";
    targetObligationScope =
      route === "conditional_route"
        ? (input.targetObligationScope ?? "same_obligation")
        : null;
    returnGoverningSourceId = "PD-STD-014-010";
  } else if (input.determination.outcome === "pass") {
    // Trust boundary: nonempty returnGoverningSourceId never authorizes Route C.
    // Empty catalog — refuse before consulting caller-supplied source strings.
    assertFrozenRouteCReturnAuthorityAvailable();
  } else {
    throw new OrchestraConstitutionalError(
      "Return posture requires Conditional or Fail Determination; Route C return after Pass plus Approval withholding is not currently authorized by frozen sources",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }

  const now = input.establishedAt ?? new Date().toISOString();
  return Object.freeze({
    returnPostureId: createReturnPostureId(),
    reviewId: input.review.reviewId,
    determinationId: input.determination.determinationId,
    rvaId: input.review.rvaId,
    programId: input.review.programId,
    obligationId: input.review.obligationId,
    route,
    returnKind,
    targetObligationScope,
    approvalWithholdingId,
    returnGoverningSourceId,
    authorityClassId: input.authorityClassId,
    establishedAt: now,
    establishedBy,
    determinationNotRevised: true,
    terminationNotAuthorized: true,
    audit: Object.freeze({
      createdAt: now,
      createdBy: establishedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: DOWNSTREAM_DISPOSITION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

export function createResubmissionEligibility(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  authorityClassId: DownstreamDispositionAuthorityClassId;
  authorizedBy: string;
  authorizedAt?: string;
}): ResubmissionEligibilityRecord {
  const route = assertConditionalOrFailRoute(input.review, input.determination);
  assertEstablishedDownstreamDispositionAuthorityClass(input.authorityClassId);
  const authorizedBy = input.authorizedBy.trim();
  if (!authorizedBy) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility requires attributable DDAC actor",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R51"],
    );
  }
  const now = input.authorizedAt ?? new Date().toISOString();
  return Object.freeze({
    eligibilityId: createResubmissionEligibilityId(),
    priorReviewId: input.review.reviewId,
    priorDeterminationId: input.determination.determinationId,
    rvaId: input.review.rvaId,
    programId: input.review.programId,
    obligationId: input.review.obligationId,
    route,
    authorityClassId: input.authorityClassId,
    authorizedAt: now,
    authorizedBy,
    priorDeterminationPreserved: true,
    satisfiedConditionalNotRecognized: true,
    audit: Object.freeze({
      createdAt: now,
      createdBy: authorizedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: DOWNSTREAM_DISPOSITION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
