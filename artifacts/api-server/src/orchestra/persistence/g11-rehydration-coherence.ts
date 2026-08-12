/**
 * G11 persisted Handoff preparation coherence — FI-DSN-STD-014-R83–R95.
 *
 * Rehydration must reject forged eligibility markers, foreign GPRA linkage,
 * invented consumer categories, and execution/authorization claims.
 * Does not mutate constitutional history. Does not execute STD-015.
 */

import {
  isHandoffConsumerCategoryKey,
} from "../handoff-preparation.js";
import type {
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffPreparationCoherence(input: {
  preparation: GovernedHandoffPreparationRecord;
  gpra: GpraGrantRecord;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { preparation, gpra } = input;

  if (preparation.eligibilityLayerCondition !== "export_ready") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation must carry eligibilityLayerCondition export_ready",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R90", "FI-DSN-STD-014-R94"],
    );
  }
  if (
    preparation.notHandoffAuthorization !== true ||
    preparation.notHandoffExecution !== true ||
    preparation.notHandoffPostureDeclaration !== true ||
    preparation.std015ConsumptionBoundaryOnly !== true ||
    preparation.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    preparation.forwardHandoffEligibility !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation must carry STD-015 consumption-boundary non-execution markers (R95)",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R93", "FI-DSN-STD-014-R95"],
    );
  }

  if (preparation.gpraId !== gpra.gpraId) {
    throw new OrchestraConstitutionalError(
      "Handoff preparation GPRA identity does not match provided GPRA grant",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87", "FI-DSN-STD-014-R88"],
    );
  }
  if (
    preparation.approvalActId !== gpra.approvalActId ||
    preparation.reviewId !== gpra.reviewId ||
    preparation.determinationId !== gpra.determinationId ||
    preparation.rvaId !== gpra.rvaId ||
    preparation.programId !== gpra.programId ||
    preparation.obligationId !== gpra.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff preparation lineage does not match GPRA grant subject",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R87"],
    );
  }

  if (
    preparation.validityExport.authoritativeGpraId !== gpra.gpraId ||
    preparation.validityExport.evaluationPoint.gpraId !== gpra.gpraId ||
    preparation.validityExport.evaluationPoint.obligationId !== gpra.obligationId ||
    preparation.validityExport.evaluationPoint.handoffConsumerContextId !==
      preparation.handoffConsumerContextId ||
    preparation.validityExport.approvalActId !== gpra.approvalActId ||
    preparation.validityExport.gpraGrantRef !== gpra.gpraId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff preparation validity export does not match GPRA/evaluation-point binding (R88)",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }

  if (preparation.validityExport.evaluationPoint.posture !== "retention") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation validity export posture must be retention",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R90", "FI-DSN-STD-014-R91"],
    );
  }

  if (
    preparation.evidencePackage.gpraId !== gpra.gpraId ||
    preparation.evidencePackage.rvaId !== gpra.rvaId ||
    preparation.evidencePackage.determinationId !== gpra.determinationId ||
    preparation.evidencePackage.approvalActId !== gpra.approvalActId ||
    preparation.evidencePackage.obligationId !== gpra.obligationId ||
    preparation.evidencePackage.handoffConsumerContextId !== preparation.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff preparation evidence package refs do not match GPRA lineage (R87)",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87"],
    );
  }

  if (
    !Array.isArray(preparation.consumerCategoryKeys) ||
    preparation.consumerCategoryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires nonempty consumerCategoryKeys",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R89"],
    );
  }
  for (const key of preparation.consumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preparation has forged or unknown consumer category key",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R89"],
      );
    }
  }

  if (input.review) {
    if (input.review.reviewId !== preparation.reviewId) {
      throw new OrchestraConstitutionalError(
        "Handoff preparation reviewId does not match provided Review",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R87"],
      );
    }
    if (
      input.review.programId !== preparation.programId ||
      input.review.obligationId !== preparation.obligationId ||
      input.review.rvaId !== preparation.rvaId
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff preparation Program/Obligation/RVA does not match Review lineage",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R87"],
      );
    }
  }

  if (input.determination) {
    if (
      input.determination.determinationId !== preparation.determinationId ||
      input.determination.reviewId !== preparation.reviewId
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff preparation Determination does not match Review lineage",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R87"],
      );
    }
  }
}
