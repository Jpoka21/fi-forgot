/**
 * Approval acts and GPRA grant — FI-DSN-STD-014-R34 through R43 (G6).
 *
 * TOC-PA chain: Pass → Approval consideration → Approval act → explicit GPRA grant.
 * Does not authorize rework, Handoff, membership, Manufacturing Validation, or Fulfillment.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import {
  assertEstablishedApprovalAuthorityClass,
  resolveEstablishedApprovalAuthorityClass,
} from "./approval-authority.js";
import { assertApprovalWithholdingGroundFamily } from "./approval-withholding-grounds.js";
import { createDomain3GovernanceTraceability } from "./domain3-authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  ApprovalActId,
  ApprovalActRecord,
  ApprovalAuthorityClassId,
  ApprovalConsiderationEligibility,
  ApprovalWithholdingGroundFamily,
  ApprovalWithholdingId,
  ApprovalWithholdingRecord,
  GpraGrantRecord,
  GpraId,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionObligationId, ProductionProgramId } from "./types.js";

const G6_REQUIREMENTS = [
  "FI-DSN-STD-014-R34",
  "FI-DSN-STD-014-R35",
  "FI-DSN-STD-014-R36",
  "FI-DSN-STD-014-R37",
  "FI-DSN-STD-014-R38",
  "FI-DSN-STD-014-R39",
  "FI-DSN-STD-014-R40",
  "FI-DSN-STD-014-R41",
  "FI-DSN-STD-014-R42",
  "FI-DSN-STD-014-R43",
] as const;

export const APPROVAL_AND_GPRA_TRACEABILITY = createDomain3GovernanceTraceability([
  ...G6_REQUIREMENTS,
]);

export function createApprovalActId(): ApprovalActId {
  return `approval-act-${randomUUID()}` as ApprovalActId;
}

export function createApprovalWithholdingId(): ApprovalWithholdingId {
  return `approval-withholding-${randomUUID()}` as ApprovalWithholdingId;
}

export function createGpraId(): GpraId {
  return `gpra-${randomUUID()}` as GpraId;
}

function assertPassPrerequisite(
  review: ProductionReadinessReview,
  determination: ReviewDeterminationRecord,
): void {
  if (review.posture !== "review_determined") {
    throw new OrchestraConstitutionalError(
      "Approval requires a completed Review with recorded Determination",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
    );
  }
  if (review.determinationId !== determination.determinationId) {
    throw new OrchestraConstitutionalError(
      "Approval requires joint Review–Determination identity integrity",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
    );
  }
  if (determination.reviewId !== review.reviewId) {
    throw new OrchestraConstitutionalError(
      "Determination does not belong to the subject Review",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
    );
  }
  if (
    determination.rvaId !== review.rvaId ||
    determination.programId !== review.programId ||
    determination.obligationId !== review.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Determination RVA/Program/Obligation does not match Review subject",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R43"],
    );
  }
  if (determination.outcome !== "pass") {
    throw new OrchestraConstitutionalError(
      "Approval consideration requires Pass Review Determination; Conditional and Fail are not Approval-eligible",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35", "FI-DSN-STD-014-R33"],
    );
  }
}

export function evaluateApprovalConsiderationEligibility(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord | null;
  withholding: ApprovalWithholdingRecord | null;
  existingApproval: ApprovalActRecord | null;
}): ApprovalConsiderationEligibility {
  const pass =
    !!input.determination &&
    input.review.posture === "review_determined" &&
    input.review.determinationId === input.determination.determinationId &&
    input.determination.reviewId === input.review.reviewId &&
    input.determination.outcome === "pass";

  const withholdingPresent = !!input.withholding;
  const approvalAlreadyRecorded = !!input.existingApproval;

  return Object.freeze({
    reviewId: input.review.reviewId,
    determinationId: input.determination?.determinationId ?? input.review.determinationId,
    rvaId: input.review.rvaId,
    eligibleForApprovalConsideration:
      pass && !withholdingPresent && !approvalAlreadyRecorded,
    passDeterminationPresent: pass,
    withholdingPresent,
    approvalAlreadyRecorded,
  });
}

function buildActivationScope(
  authorityClassId: ApprovalAuthorityClassId,
  programId: ProductionProgramId,
  obligationId: ProductionObligationId,
): ApprovalActRecord["activationScope"] {
  const established = resolveEstablishedApprovalAuthorityClass(authorityClassId);
  if (established.authorizedConstitutionalScope === "production_obligation") {
    return Object.freeze({ kind: "production_obligation", obligationId });
  }
  return Object.freeze({ kind: "production_program", programId });
}

export function createApprovalAct(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  authorityClassId: ApprovalAuthorityClassId;
  approvedBy: string;
  approvedAt?: string;
}): ApprovalActRecord {
  assertPassPrerequisite(input.review, input.determination);
  assertEstablishedApprovalAuthorityClass(input.authorityClassId);
  const established = resolveEstablishedApprovalAuthorityClass(input.authorityClassId);

  const approvedBy = input.approvedBy.trim();
  if (!approvedBy) {
    throw new OrchestraConstitutionalError(
      "Approval act requires attributable actor within established authority class scope",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R38"],
    );
  }

  const now = input.approvedAt ?? new Date().toISOString();
  return Object.freeze({
    approvalActId: createApprovalActId(),
    reviewId: input.review.reviewId,
    determinationId: input.determination.determinationId,
    rvaId: input.review.rvaId,
    programId: input.review.programId,
    obligationId: input.review.obligationId,
    authorityClassId: established.authorityClassId,
    authorityGoverningSourceId: established.governingSourceId,
    authorityConstitutionalScope: established.authorizedConstitutionalScope,
    activationScope: buildActivationScope(
      established.authorityClassId,
      input.review.programId,
      input.review.obligationId,
    ),
    approvedAt: now,
    approvedBy,
    gpraNotCreatedByThisAct: true,
    manufacturingValidationNotPerformed: true,
    fulfillmentExecutionNotPerformed: true,
    audit: Object.freeze({
      createdAt: now,
      createdBy: approvedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: APPROVAL_AND_GPRA_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

export function createApprovalWithholding(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  groundFamily: ApprovalWithholdingGroundFamily;
  grounds: string;
  withheldBy: string;
  additionalGoverningSourceId?: string | null;
  withheldAt?: string;
}): ApprovalWithholdingRecord {
  assertPassPrerequisite(input.review, input.determination);
  assertApprovalWithholdingGroundFamily(
    input.groundFamily,
    input.additionalGoverningSourceId,
  );

  const grounds = input.grounds.trim();
  if (!grounds) {
    throw new OrchestraConstitutionalError(
      "Approval withholding requires documented constitutional grounds",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R39"],
    );
  }

  const withheldBy = input.withheldBy.trim();
  if (!withheldBy) {
    throw new OrchestraConstitutionalError(
      "Approval withholding requires attributable actor",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R39"],
    );
  }

  const now = input.withheldAt ?? new Date().toISOString();
  return Object.freeze({
    withholdingId: createApprovalWithholdingId(),
    reviewId: input.review.reviewId,
    determinationId: input.determination.determinationId,
    rvaId: input.review.rvaId,
    programId: input.review.programId,
    obligationId: input.review.obligationId,
    groundFamily: input.groundFamily,
    grounds,
    additionalGoverningSourceId: input.additionalGoverningSourceId?.trim() || null,
    withheldAt: now,
    withheldBy,
    passDeterminationPreserved: true,
    audit: Object.freeze({
      createdAt: now,
      createdBy: withheldBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: APPROVAL_AND_GPRA_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

export function createGpraGrant(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  approval: ApprovalActRecord;
  grantedBy: string;
  grantedAt?: string;
}): GpraGrantRecord {
  assertPassPrerequisite(input.review, input.determination);

  if (input.approval.reviewId !== input.review.reviewId) {
    throw new OrchestraConstitutionalError(
      "GPRA grant requires Approval act for the same Review",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R42"],
    );
  }
  if (input.approval.determinationId !== input.determination.determinationId) {
    throw new OrchestraConstitutionalError(
      "GPRA grant requires Approval act bound to the Pass Determination",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R42"],
    );
  }
  if (
    input.approval.rvaId !== input.review.rvaId ||
    input.approval.obligationId !== input.review.obligationId ||
    input.approval.programId !== input.review.programId
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA grant Approval scope does not match Review RVA/Program/Obligation",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R43"],
    );
  }

  assertEstablishedApprovalAuthorityClass(input.approval.authorityClassId);

  const grantedBy = input.grantedBy.trim();
  if (!grantedBy) {
    throw new OrchestraConstitutionalError(
      "GPRA grant requires attributable actor within authorized Approval authority",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R42", "FI-DSN-STD-014-R38"],
    );
  }

  const now = input.grantedAt ?? new Date().toISOString();
  return Object.freeze({
    gpraId: createGpraId(),
    approvalActId: input.approval.approvalActId,
    reviewId: input.review.reviewId,
    determinationId: input.determination.determinationId,
    rvaId: input.review.rvaId,
    programId: input.review.programId,
    obligationId: input.review.obligationId,
    authorityClassId: input.approval.authorityClassId,
    authorityGoverningSourceId: input.approval.authorityGoverningSourceId,
    grantedAt: now,
    grantedBy,
    collectionMembershipNotConferred: true,
    governedHandoffNotAuthorized: true,
    manufacturingValidationNotPerformed: true,
    fulfillmentExecutionNotPerformed: true,
    audit: Object.freeze({
      createdAt: now,
      createdBy: grantedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: APPROVAL_AND_GPRA_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
