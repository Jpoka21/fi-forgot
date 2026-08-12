/**
 * G6 persisted constitutional coherence — ORCH-IMP-010.2.
 *
 * Rehydration must reject contradictory Review / Determination / Approval /
 * withholding / GPRA linkage. Does not repair history. Does not require live
 * Domain 1 / Domain 2 reevaluation beyond persisted Domain 3 records.
 */

import { resolveEstablishedApprovalAuthorityClass } from "../approval-authority.js";
import type {
  ApprovalActRecord,
  ApprovalWithholdingRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

/**
 * Review ↔ Pass Determination joint identity required for G6 authority.
 */
export function assertPersistedPassReviewDeterminationCoherence(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
}): void {
  const { review, determination } = input;

  if (review.posture !== "review_determined" || !review.determinationId) {
    throw new OrchestraConstitutionalError(
      "G6 authority requires a completed Review with Determination linkage",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
    );
  }
  if (review.determinationId !== determination.determinationId) {
    throw new OrchestraConstitutionalError(
      "review.determinationId does not resolve to the provided Determination",
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
      "G6 Approval authority requires Pass Review Determination; Conditional and Fail cannot support Approval or GPRA",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
    );
  }
}

/**
 * MAGAC activation scope must match canonical class semantics and Review subject IDs.
 */
export function assertPersistedMagacActivationScopeCoherence(
  approval: ApprovalActRecord,
): void {
  const established = resolveEstablishedApprovalAuthorityClass(approval.authorityClassId);
  if (approval.authorityConstitutionalScope !== established.authorizedConstitutionalScope) {
    throw new OrchestraConstitutionalError(
      "Persisted Approval MAGAC scope does not match established authority class",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
    );
  }

  if (established.authorizedConstitutionalScope === "production_program") {
    if (approval.activationScope.kind !== "production_program") {
      throw new OrchestraConstitutionalError(
        "Program-scoped MAGAC class cannot activate under Production Obligation scope",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
      );
    }
    if (approval.activationScope.programId !== approval.programId) {
      throw new OrchestraConstitutionalError(
        "MAGAC Program activation scope identity does not match Approval Program",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R38"],
      );
    }
  } else {
    if (approval.activationScope.kind !== "production_obligation") {
      throw new OrchestraConstitutionalError(
        "Obligation-scoped MAGAC class cannot activate under Production Program scope",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
      );
    }
    if (approval.activationScope.obligationId !== approval.obligationId) {
      throw new OrchestraConstitutionalError(
        "MAGAC Obligation activation scope identity does not match Approval Obligation",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R38"],
      );
    }
  }
}

export function assertPersistedG6EvidenceBasisIntegrity(input: {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  evidenceRecords: readonly ReviewEvidenceRecord[];
  activityRecords: readonly ReviewDimensionActivityRecord[];
}): void {
  const evidenceById = new Map(
    input.evidenceRecords.map((item) => [item.evidenceId, item] as const),
  );
  const activityById = new Map(
    input.activityRecords.map((item) => [item.activityId, item] as const),
  );

  for (const evidenceId of input.determination.evidenceBasisIds) {
    const evidence = evidenceById.get(evidenceId);
    if (!evidence) {
      throw new OrchestraConstitutionalError(
        "Review Determination evidence basis references nonexistent evidence",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R30"],
      );
    }
    if (evidence.reviewId !== input.review.reviewId || evidence.rvaId !== input.review.rvaId) {
      throw new OrchestraConstitutionalError(
        "Review Determination evidence basis does not belong to the subject Review",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R30"],
      );
    }
  }

  for (const activityId of input.determination.activityBasisIds) {
    const activity = activityById.get(activityId);
    if (!activity) {
      throw new OrchestraConstitutionalError(
        "Review Determination activity basis references nonexistent activity",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R30"],
      );
    }
    if (activity.reviewId !== input.review.reviewId || activity.rvaId !== input.review.rvaId) {
      throw new OrchestraConstitutionalError(
        "Review Determination activity basis does not belong to the subject Review",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R30"],
      );
    }
    for (const evidenceId of activity.evidenceIds) {
      const linked = evidenceById.get(evidenceId);
      if (!linked || linked.reviewId !== input.review.reviewId) {
        throw new OrchestraConstitutionalError(
          "Review activity evidence basis contains unresolved or foreign evidence",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R30"],
        );
      }
    }
  }
}

export function assertPersistedApprovalAuthorityCoherence(input: {
  approval: ApprovalActRecord;
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  evidenceRecords: readonly ReviewEvidenceRecord[];
  activityRecords: readonly ReviewDimensionActivityRecord[];
}): void {
  assertPersistedPassReviewDeterminationCoherence(input);
  assertPersistedMagacActivationScopeCoherence(input.approval);
  assertPersistedG6EvidenceBasisIntegrity(input);

  const { approval, review, determination } = input;
  if (approval.reviewId !== review.reviewId) {
    throw new OrchestraConstitutionalError(
      "Approval act Review identity does not match persisted Review",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R41"],
    );
  }
  if (
    approval.determinationId !== determination.determinationId ||
    approval.determinationId !== review.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      "Approval act Determination identity does not match Review Pass Determination",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R41"],
    );
  }
  if (
    approval.rvaId !== review.rvaId ||
    approval.programId !== review.programId ||
    approval.obligationId !== review.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Approval act RVA/Program/Obligation does not match Review subject",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R43"],
    );
  }
  if (
    approval.rvaId !== determination.rvaId ||
    approval.programId !== determination.programId ||
    approval.obligationId !== determination.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Approval act RVA/Program/Obligation does not match Pass Determination subject",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R43"],
    );
  }
}

export function assertPersistedApprovalWithholdingCoherence(input: {
  withholding: ApprovalWithholdingRecord;
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  evidenceRecords: readonly ReviewEvidenceRecord[];
  activityRecords: readonly ReviewDimensionActivityRecord[];
}): void {
  assertPersistedPassReviewDeterminationCoherence(input);
  assertPersistedG6EvidenceBasisIntegrity(input);

  const { withholding, review, determination } = input;
  if (withholding.reviewId !== review.reviewId) {
    throw new OrchestraConstitutionalError(
      "Approval withholding Review identity does not match persisted Review",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R39"],
    );
  }
  if (
    withholding.determinationId !== determination.determinationId ||
    withholding.determinationId !== review.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      "Approval withholding Determination identity does not match Review Pass Determination",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R35", "FI-DSN-STD-014-R39"],
    );
  }
  if (
    withholding.rvaId !== review.rvaId ||
    withholding.programId !== review.programId ||
    withholding.obligationId !== review.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Approval withholding RVA/Program/Obligation does not match Review subject",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R39", "FI-DSN-STD-014-R43"],
    );
  }
  if (withholding.passDeterminationPreserved !== true) {
    throw new OrchestraConstitutionalError(
      "Approval withholding must preserve Pass Determination",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R35", "FI-DSN-STD-014-R39"],
    );
  }
}

export function assertPersistedGpraGrantCoherence(input: {
  gpra: GpraGrantRecord;
  approval: ApprovalActRecord;
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  evidenceRecords: readonly ReviewEvidenceRecord[];
  activityRecords: readonly ReviewDimensionActivityRecord[];
}): void {
  assertPersistedApprovalAuthorityCoherence({
    approval: input.approval,
    review: input.review,
    determination: input.determination,
    evidenceRecords: input.evidenceRecords,
    activityRecords: input.activityRecords,
  });

  const { gpra, approval, review, determination } = input;
  if (gpra.approvalActId !== approval.approvalActId) {
    throw new OrchestraConstitutionalError(
      "GPRA approvalActId does not resolve to the provided Approval act",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R42"],
    );
  }
  if (gpra.reviewId !== review.reviewId || gpra.reviewId !== approval.reviewId) {
    throw new OrchestraConstitutionalError(
      "GPRA Review identity does not match Approval and Review",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R42", "FI-DSN-STD-014-R43"],
    );
  }
  if (
    gpra.determinationId !== determination.determinationId ||
    gpra.determinationId !== approval.determinationId ||
    gpra.determinationId !== review.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA Determination identity does not match Approval and Review Pass Determination",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R42"],
    );
  }
  if (
    gpra.rvaId !== review.rvaId ||
    gpra.rvaId !== approval.rvaId ||
    gpra.programId !== review.programId ||
    gpra.programId !== approval.programId ||
    gpra.obligationId !== review.obligationId ||
    gpra.obligationId !== approval.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA RVA/Program/Obligation does not match Approval and Review subject",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R43"],
    );
  }
  if (gpra.authorityClassId !== approval.authorityClassId) {
    throw new OrchestraConstitutionalError(
      "GPRA MAGAC authority class does not match Approval act",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R42"],
    );
  }
}
