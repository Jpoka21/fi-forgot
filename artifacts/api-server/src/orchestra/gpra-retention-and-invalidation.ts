/**
 * GPRA Retention and Invalidated posture — FI-DSN-STD-014-R52 through R63 (G8).
 *
 * Retention is the default after G6 grant until a separate invalidation act.
 * Invalidated terminates forward Handoff/intake on that GPRA only.
 * Does not implement Superseded (G9), withdrawal posture, suspension, or expiry.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernanceTraceability } from "./domain3-authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  ApprovalActRecord,
  GpraGrantRecord,
  GpraInvalidationActId,
  GpraInvalidationActRecord,
  GpraValidityAssessment,
  InvalidationAuthorityClassId,
  InvalidationTriggerFamily,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertEstablishedInvalidationAuthorityClass,
  resolveEstablishedInvalidationAuthorityClass,
} from "./invalidation-authority.js";
import { assertInvalidationTriggerFamily } from "./invalidation-trigger-families.js";

const G8_REQUIREMENTS = [
  "FI-DSN-STD-014-R52",
  "FI-DSN-STD-014-R53",
  "FI-DSN-STD-014-R54",
  "FI-DSN-STD-014-R55",
  "FI-DSN-STD-014-R56",
  "FI-DSN-STD-014-R57",
  "FI-DSN-STD-014-R58",
  "FI-DSN-STD-014-R59",
  "FI-DSN-STD-014-R60",
  "FI-DSN-STD-014-R61",
  "FI-DSN-STD-014-R62",
  "FI-DSN-STD-014-R63",
] as const;

export const GPRA_RETENTION_AND_INVALIDATION_TRACEABILITY = createDomain3GovernanceTraceability([
  ...G8_REQUIREMENTS,
]);

export function createGpraInvalidationActId(): GpraInvalidationActId {
  return `gpra-invalidation-${randomUUID()}` as GpraInvalidationActId;
}

export function evaluateGpraValidityFromInvalidation(
  invalidation: GpraInvalidationActRecord | null,
  gpraId: GpraGrantRecord["gpraId"],
): GpraValidityAssessment {
  if (!invalidation) {
    return Object.freeze({
      gpraId,
      posture: "retention",
      forwardActive: true,
      invalidationActId: null,
      newHandoffEligibility: true,
      newIntakeAuthority: true,
    });
  }
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
    newHandoffEligibility: false,
    newIntakeAuthority: false,
  });
}

export function createGpraInvalidationAct(input: {
  gpra: GpraGrantRecord;
  approval: ApprovalActRecord;
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  itFamily: InvalidationTriggerFamily;
  triggeringGoverningSourceId: string;
  constitutionalEvidence: string;
  authorityClassId: InvalidationAuthorityClassId;
  invalidatedBy: string;
  /** Required true for IT-2 material CB change (R58). */
  materialNonComplianceEstablished?: boolean;
  invalidatedAt?: string;
}): GpraInvalidationActRecord {
  assertInvalidationTriggerFamily(input.itFamily);
  assertEstablishedInvalidationAuthorityClass(input.authorityClassId);
  resolveEstablishedInvalidationAuthorityClass(input.authorityClassId);

  if (input.review.determinationId !== input.determination.determinationId) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires joint Review–Determination identity",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R55"],
    );
  }
  if (input.gpra.reviewId !== input.review.reviewId) {
    throw new OrchestraConstitutionalError(
      "GPRA does not belong to the subject Review for invalidation",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
    );
  }
  if (input.gpra.approvalActId !== input.approval.approvalActId) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires the Approval act in the GPRA grant lineage",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R59"],
    );
  }
  if (
    input.approval.reviewId !== input.review.reviewId ||
    input.approval.determinationId !== input.determination.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      "Approval act does not match Review/Determination for GPRA invalidation",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R59"],
    );
  }
  if (
    input.gpra.rvaId !== input.review.rvaId ||
    input.gpra.programId !== input.review.programId ||
    input.gpra.obligationId !== input.review.obligationId ||
    input.gpra.determinationId !== input.determination.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA subject scope does not match Review for invalidation",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R53", "FI-DSN-STD-014-R59"],
    );
  }
  if (input.determination.outcome !== "pass") {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation applies only after Pass Determination grant lineage",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R52", "FI-DSN-STD-014-R54"],
    );
  }

  const source = input.triggeringGoverningSourceId.trim();
  if (!source) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires a triggering governing source identifier",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
    );
  }
  const evidence = input.constitutionalEvidence.trim();
  if (!evidence) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires documented constitutional evidence supporting the IT family finding",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R59"],
    );
  }
  const invalidatedBy = input.invalidatedBy.trim();
  if (!invalidatedBy) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires attributable invalidation authority actor",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R57"],
    );
  }

  let materialNonComplianceEstablished: true | null = null;
  if (input.itFamily === "material_compliance_boundary_change") {
    if (input.materialNonComplianceEstablished !== true) {
      throw new OrchestraConstitutionalError(
        "IT-2 Material Compliance Boundary change requires established material non-compliance of the GPRA-bound RVA under Production Obligation scope; non-material CB change cannot establish Invalidated posture",
        "invalid_gpra_invalidation",
        ["FI-DSN-STD-014-R58"],
      );
    }
    materialNonComplianceEstablished = true;
  } else if (input.materialNonComplianceEstablished === true) {
    throw new OrchestraConstitutionalError(
      "Material non-compliance flag applies only to IT-2; IT-1 and IT-3 must not carry IT-2 materiality attribution",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R56", "FI-DSN-STD-014-R58"],
    );
  }

  const now = input.invalidatedAt ?? new Date().toISOString();
  return Object.freeze({
    invalidationActId: createGpraInvalidationActId(),
    gpraId: input.gpra.gpraId,
    approvalActId: input.gpra.approvalActId,
    reviewId: input.review.reviewId,
    determinationId: input.determination.determinationId,
    rvaId: input.review.rvaId,
    programId: input.review.programId,
    obligationId: input.review.obligationId,
    itFamily: input.itFamily,
    materialNonComplianceEstablished,
    triggeringGoverningSourceId: source,
    constitutionalEvidence: evidence,
    authorityClassId: input.authorityClassId,
    authorityGoverningSourceId: "PD-STD-014-007",
    invalidatedAt: now,
    invalidatedBy,
    historicalGrantPreserved: true,
    determinationNotRevised: true,
    notLifecycleTermination: true,
    forwardHandoffEligibilityTerminated: true,
    newIntakeAuthorityTerminated: true,
    cannotSilentlyReactivate: true,
    audit: Object.freeze({
      createdAt: now,
      createdBy: invalidatedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GPRA_RETENTION_AND_INVALIDATION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
