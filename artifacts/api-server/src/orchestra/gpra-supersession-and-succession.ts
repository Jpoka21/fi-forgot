/**
 * GPRA Supersession and Succession — FI-DSN-STD-014-R64 through R72 (G9).
 *
 * Separate additive GpraSupersessionActRecord (R65) — does not mutate GpraGrantRecord.
 * Does not implement Brain/Handoff execution, withdrawal, suspension, or third revocation posture (R72).
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernanceTraceability } from "./domain3-authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  ApprovalActRecord,
  GpraGrantRecord,
  GpraInvalidationActRecord,
  GpraSupersessionActId,
  GpraSupersessionActRecord,
  GpraValidityAssessment,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
  SupersessionAuthorityClassId,
  SupersessionTriggerFamily,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertEstablishedSupersessionAuthorityClass,
  resolveEstablishedSupersessionAuthorityClass,
} from "./supersession-authority.js";
import { assertSupersessionTriggerFamily } from "./supersession-trigger-families.js";

const G9_REQUIREMENTS = [
  "FI-DSN-STD-014-R64",
  "FI-DSN-STD-014-R65",
  "FI-DSN-STD-014-R66",
  "FI-DSN-STD-014-R67",
  "FI-DSN-STD-014-R68",
  "FI-DSN-STD-014-R69",
  "FI-DSN-STD-014-R70",
  "FI-DSN-STD-014-R71",
  "FI-DSN-STD-014-R72",
] as const;

export const GPRA_SUPERSESSION_AND_SUCCESSION_TRACEABILITY = createDomain3GovernanceTraceability([
  ...G9_REQUIREMENTS,
]);

export function createGpraSupersessionActId(): GpraSupersessionActId {
  return `gpra-supersession-${randomUUID()}` as GpraSupersessionActId;
}

/**
 * R70 posture evaluation — exactly one of retention | invalidated | superseded.
 * Invalidation wins over supersession. Else supersession of this GPRA as predecessor ⇒ superseded.
 * Else retention.
 */
export function evaluateGpraValidityFromPostureActs(input: {
  gpraId: GpraGrantRecord["gpraId"];
  invalidation: GpraInvalidationActRecord | null;
  supersession: GpraSupersessionActRecord | null;
}): GpraValidityAssessment {
  const { gpraId, invalidation, supersession } = input;

  if (invalidation) {
    if (invalidation.gpraId !== gpraId) {
      throw new OrchestraConstitutionalError(
        "GPRA validity assessment invalidation act does not bind the subject GPRA",
        "invalid_gpra_invalidation",
        ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
      );
    }
    return Object.freeze({
      gpraId,
      posture: "invalidated",
      forwardActive: false,
      invalidationActId: invalidation.invalidationActId,
      supersessionActId: supersession?.predecessorGpraId === gpraId ? supersession.supersessionActId : null,
      newHandoffEligibility: false,
      newIntakeAuthority: false,
    });
  }

  if (supersession) {
    if (supersession.predecessorGpraId !== gpraId) {
      throw new OrchestraConstitutionalError(
        "GPRA validity assessment supersession act does not bind the subject GPRA as predecessor",
        "invalid_gpra_supersession",
        ["FI-DSN-STD-014-R64", "FI-DSN-STD-014-R70"],
      );
    }
    return Object.freeze({
      gpraId,
      posture: "superseded",
      forwardActive: false,
      invalidationActId: null,
      supersessionActId: supersession.supersessionActId,
      newHandoffEligibility: false,
      newIntakeAuthority: false,
    });
  }

  return Object.freeze({
    gpraId,
    posture: "retention",
    forwardActive: true,
    invalidationActId: null,
    supersessionActId: null,
    newHandoffEligibility: true,
    newIntakeAuthority: true,
  });
}

export function createGpraSupersessionAct(input: {
  predecessorGpra: GpraGrantRecord;
  successorGpra: GpraGrantRecord;
  predecessorApproval: ApprovalActRecord;
  successorApproval: ApprovalActRecord;
  predecessorReview: ProductionReadinessReview;
  successorReview: ProductionReadinessReview;
  predecessorDetermination: ReviewDeterminationRecord;
  successorDetermination: ReviewDeterminationRecord;
  stFamily: SupersessionTriggerFamily;
  handoffConsumerContextId: string;
  triggeringGoverningSourceId: string;
  constitutionalEvidence: string;
  authorityClassId: SupersessionAuthorityClassId;
  supersededBy: string;
  supersededAt?: string;
}): GpraSupersessionActRecord {
  assertSupersessionTriggerFamily(input.stFamily);
  assertEstablishedSupersessionAuthorityClass(input.authorityClassId);
  resolveEstablishedSupersessionAuthorityClass(input.authorityClassId);

  if (input.predecessorGpra.gpraId === input.successorGpra.gpraId) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires distinct predecessor and successor GPRA identities",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }

  if (input.predecessorGpra.programId !== input.successorGpra.programId) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires same Production Program for predecessor and successor",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }

  if (
    input.stFamily === "replacement_gpra_grant" &&
    input.predecessorGpra.obligationId !== input.successorGpra.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "ST-1 replacement_gpra_grant requires same Production Obligation for predecessor and successor",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R66", "FI-DSN-STD-014-R69"],
    );
  }

  if (
    input.stFamily === "authoritative_succession_rule" &&
    input.predecessorGpra.obligationId !== input.successorGpra.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "ST-2 authoritative_succession_rule requires same Production Obligation for predecessor and successor",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R66", "FI-DSN-STD-014-R69"],
    );
  }

  // Distinct Approval / Review / Determination / RVA (PSIM R69)
  if (
    input.predecessorGpra.approvalActId === input.successorGpra.approvalActId ||
    input.predecessorGpra.reviewId === input.successorGpra.reviewId ||
    input.predecessorGpra.determinationId === input.successorGpra.determinationId ||
    input.predecessorGpra.rvaId === input.successorGpra.rvaId
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires distinct Approval, Review, Determination, and RVA records for predecessor and successor",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }

  assertGrantLineage(
    input.predecessorGpra,
    input.predecessorApproval,
    input.predecessorReview,
    input.predecessorDetermination,
    "predecessor",
  );
  assertGrantLineage(
    input.successorGpra,
    input.successorApproval,
    input.successorReview,
    input.successorDetermination,
    "successor",
  );

  const contextId = input.handoffConsumerContextId.trim();
  if (!contextId) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires non-empty handoffConsumerContextId (opaque consumer context; catalog deferred G11)",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }
  const source = input.triggeringGoverningSourceId.trim();
  if (!source) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires a triggering governing source identifier",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
  const evidence = input.constitutionalEvidence.trim();
  if (!evidence) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires documented constitutional evidence supporting the ST family finding",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }
  const supersededBy = input.supersededBy.trim();
  if (!supersededBy) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires attributable supersession authority actor",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R68"],
    );
  }

  const now = input.supersededAt ?? new Date().toISOString();
  return Object.freeze({
    supersessionActId: createGpraSupersessionActId(),
    predecessorGpraId: input.predecessorGpra.gpraId,
    successorGpraId: input.successorGpra.gpraId,
    predecessorApprovalActId: input.predecessorGpra.approvalActId,
    successorApprovalActId: input.successorGpra.approvalActId,
    predecessorReviewId: input.predecessorReview.reviewId,
    successorReviewId: input.successorReview.reviewId,
    predecessorDeterminationId: input.predecessorDetermination.determinationId,
    successorDeterminationId: input.successorDetermination.determinationId,
    predecessorRvaId: input.predecessorReview.rvaId,
    successorRvaId: input.successorReview.rvaId,
    programId: input.predecessorGpra.programId,
    obligationId: input.successorGpra.obligationId,
    stFamily: input.stFamily,
    handoffConsumerContextId: contextId,
    triggeringGoverningSourceId: source,
    constitutionalEvidence: evidence,
    authorityClassId: input.authorityClassId,
    authorityGoverningSourceId: "PD-STD-014-014",
    supersededAt: now,
    supersededBy,
    historicalPredecessorPreserved: true,
    determinationNotRevised: true,
    notLifecycleTermination: true,
    notInvalidation: true,
    predecessorForwardAuthorityTerminatedInContext: true,
    successorAuthoritativeInContext: true,
    cannotOverwritePredecessor: true,
    audit: Object.freeze({
      createdAt: now,
      createdBy: supersededBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GPRA_SUPERSESSION_AND_SUCCESSION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

function assertGrantLineage(
  gpra: GpraGrantRecord,
  approval: ApprovalActRecord,
  review: ProductionReadinessReview,
  determination: ReviewDeterminationRecord,
  role: "predecessor" | "successor",
): void {
  if (review.determinationId !== determination.determinationId) {
    throw new OrchestraConstitutionalError(
      `GPRA supersession ${role} requires joint Review–Determination identity`,
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
  if (gpra.reviewId !== review.reviewId) {
    throw new OrchestraConstitutionalError(
      `GPRA supersession ${role} GPRA does not belong to the subject Review`,
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
  if (gpra.approvalActId !== approval.approvalActId) {
    throw new OrchestraConstitutionalError(
      `GPRA supersession ${role} requires the Approval act in the GPRA grant lineage`,
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }
  if (
    approval.reviewId !== review.reviewId ||
    approval.determinationId !== determination.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      `Approval act does not match Review/Determination for GPRA supersession ${role}`,
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }
  if (
    gpra.rvaId !== review.rvaId ||
    gpra.programId !== review.programId ||
    gpra.obligationId !== review.obligationId ||
    gpra.determinationId !== determination.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      `GPRA supersession ${role} subject scope does not match Review`,
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
  if (determination.outcome !== "pass") {
    throw new OrchestraConstitutionalError(
      `GPRA supersession ${role} applies only after Pass Determination grant lineage`,
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R64", "FI-DSN-STD-014-R65"],
    );
  }
}
