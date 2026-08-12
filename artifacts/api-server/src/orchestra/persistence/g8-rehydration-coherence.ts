/**
 * G8 persisted constitutional coherence — GPRA Retention / Invalidated.
 *
 * Rehydration must reject contradictory GPRA / Approval / Review / invalidation
 * linkage. Does not repair history. Does not implement Superseded (G9).
 */

import { isCanonicalEstablishedInvalidationAuthorityClassId } from "../invalidation-authority.js";
import { isMandatoryInvalidationTriggerFamily } from "../invalidation-trigger-families.js";
import type {
  ApprovalActRecord,
  GpraGrantRecord,
  GpraInvalidationActRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";
import { assertPersistedGpraGrantCoherence } from "./g6-rehydration-coherence.js";

export function assertPersistedGpraInvalidationCoherence(input: {
  invalidation: GpraInvalidationActRecord;
  gpra: GpraGrantRecord;
  approval: ApprovalActRecord;
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  evidenceRecords: readonly ReviewEvidenceRecord[];
  activityRecords: readonly ReviewDimensionActivityRecord[];
}): void {
  assertPersistedGpraGrantCoherence({
    gpra: input.gpra,
    approval: input.approval,
    review: input.review,
    determination: input.determination,
    evidenceRecords: input.evidenceRecords,
    activityRecords: input.activityRecords,
  });

  const { invalidation, gpra, approval, review, determination } = input;

  if (!isCanonicalEstablishedInvalidationAuthorityClassId(invalidation.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation DDAC-style IVAC authority class is not established",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R57"],
    );
  }
  if (!isMandatoryInvalidationTriggerFamily(invalidation.itFamily)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation IT family is not a mandatory PVTA family",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R56"],
    );
  }
  if (invalidation.gpraId !== gpra.gpraId) {
    throw new OrchestraConstitutionalError(
      "Invalidation act GPRA identity does not match provided GPRA grant",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
    );
  }
  if (invalidation.approvalActId !== gpra.approvalActId || invalidation.approvalActId !== approval.approvalActId) {
    throw new OrchestraConstitutionalError(
      "Invalidation act Approval identity does not match GPRA grant lineage",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R59"],
    );
  }
  if (
    invalidation.reviewId !== review.reviewId ||
    invalidation.reviewId !== gpra.reviewId ||
    invalidation.determinationId !== determination.determinationId ||
    invalidation.determinationId !== gpra.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      "Invalidation act Review/Determination identity does not match GPRA grant lineage",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R55", "FI-DSN-STD-014-R59"],
    );
  }
  if (
    invalidation.rvaId !== gpra.rvaId ||
    invalidation.programId !== gpra.programId ||
    invalidation.obligationId !== gpra.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Invalidation act RVA/Program/Obligation does not match GPRA subject",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R53", "FI-DSN-STD-014-R59"],
    );
  }
  if (invalidation.itFamily === "material_compliance_boundary_change") {
    if (invalidation.materialNonComplianceEstablished !== true) {
      throw new OrchestraConstitutionalError(
        "Persisted IT-2 invalidation requires materialNonComplianceEstablished",
        "invalid_gpra_invalidation",
        ["FI-DSN-STD-014-R58"],
      );
    }
  } else if (invalidation.materialNonComplianceEstablished !== null) {
    throw new OrchestraConstitutionalError(
      "Persisted non-IT-2 invalidation must not carry material non-compliance attribution",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R56", "FI-DSN-STD-014-R58"],
    );
  }
  if (
    invalidation.historicalGrantPreserved !== true ||
    invalidation.determinationNotRevised !== true ||
    invalidation.notLifecycleTermination !== true ||
    invalidation.cannotSilentlyReactivate !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation must preserve historical grant and Determination and forbid silent reactivation",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R55", "FI-DSN-STD-014-R62"],
    );
  }
}
