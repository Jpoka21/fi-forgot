/**
 * HOF-G1 persisted Handoff entry coherence — FI-DSN-STD-015-R01–R07.
 *
 * Rehydration must reject forged entry markers, foreign GPRA linkage,
 * invented consumer categories beyond preparation, and execution/authorization/
 * HOEM claims. Does not mutate constitutional history. Does not perform R08+.
 */

import {
  HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS,
  HOF_P_DISTINCTIONS_PRESERVED,
  isHandoffDeferredPrincipalSubject,
  isHandoffHofPDistinctionId,
} from "../handoff-entry.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import type {
  GovernedHandoffEntryRecord,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffEntryCoherence(input: {
  entry: GovernedHandoffEntryRecord;
  preparation: GovernedHandoffPreparationRecord;
  gpra: GpraGrantRecord;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { entry, preparation, gpra } = input;

  if (entry.preparationId !== preparation.preparationId) {
    throw new OrchestraConstitutionalError(
      "Handoff entry preparationId does not match provided preparation",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }

  if (
    entry.considerationMayCommence !== true ||
    entry.notHandoffAuthorization !== true ||
    entry.notHandoffExecution !== true ||
    entry.notHandoffPostureDeclaration !== true ||
    entry.doesNotPerformG11Preparation !== true ||
    entry.doesNotGrantGpraOrApproval !== true ||
    entry.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    entry.doesNotBindConsumerClassCatalog !== true ||
    entry.hofG1Only !== true ||
    entry.std015HofG1EntryBoundaryOnly !== true ||
    entry.preparationCurrencyAtEntry !== "current" ||
    entry.eligibilityLayerConditionConsumed !== "export_ready" ||
    entry.r01InheritanceLock !== true ||
    entry.r02DoesNotWeakenStd012Or013 !== true ||
    entry.r03MfgComplianceBoundaryContextOnly !== true ||
    entry.r04DecisionStagePolicyOnly !== true ||
    entry.r05PrincipalSubjectsDeferred !== true ||
    entry.r06DoesNotPerformReviewApprovalGpraOrG11Prep !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry must carry HOF-G1 non-authorization / consideration-only markers (R01–R07)",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R01", "FI-DSN-STD-015-R05", "FI-DSN-STD-015-R07"],
    );
  }

  if (
    !Array.isArray(entry.deferredPrincipalSubjects) ||
    entry.deferredPrincipalSubjects.length !== HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry deferredPrincipalSubjects catalog incomplete (R05)",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R05"],
    );
  }
  for (const subject of entry.deferredPrincipalSubjects) {
    if (!isHandoffDeferredPrincipalSubject(subject)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry has forged deferredPrincipalSubject",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R05"],
      );
    }
  }

  if (
    !Array.isArray(entry.hofPDistinctionsPreserved) ||
    entry.hofPDistinctionsPreserved.length !== HOF_P_DISTINCTIONS_PRESERVED.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry hofPDistinctionsPreserved catalog incomplete (R01)",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R01"],
    );
  }
  for (const id of entry.hofPDistinctionsPreserved) {
    if (!isHandoffHofPDistinctionId(id)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry has forged HOF-P distinction id",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R01"],
      );
    }
  }

  if (entry.gpraId !== gpra.gpraId || entry.gpraId !== preparation.gpraId) {
    throw new OrchestraConstitutionalError(
      "Handoff entry GPRA identity does not match preparation / provided GPRA grant",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R02", "FI-DSN-STD-015-R07"],
    );
  }

  if (
    entry.approvalActId !== preparation.approvalActId ||
    entry.reviewId !== preparation.reviewId ||
    entry.determinationId !== preparation.determinationId ||
    entry.rvaId !== preparation.rvaId ||
    entry.programId !== preparation.programId ||
    entry.obligationId !== preparation.obligationId ||
    entry.handoffConsumerContextId !== preparation.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff entry lineage does not match preparation subject",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }

  if (
    entry.approvalActId !== gpra.approvalActId ||
    entry.reviewId !== gpra.reviewId ||
    entry.determinationId !== gpra.determinationId ||
    entry.rvaId !== gpra.rvaId ||
    entry.programId !== gpra.programId ||
    entry.obligationId !== gpra.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff entry lineage does not match GPRA grant subject",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R02", "FI-DSN-STD-015-R07"],
    );
  }

  if (
    !Array.isArray(entry.consumerCategoryKeys) ||
    entry.consumerCategoryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires nonempty consumerCategoryKeys from preparation",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  if (entry.consumerCategoryKeys.length !== preparation.consumerCategoryKeys.length) {
    throw new OrchestraConstitutionalError(
      "Handoff entry consumerCategoryKeys must equal preparation keys (consume-only; HOF-G3 deferred)",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R05", "FI-DSN-STD-015-R07"],
    );
  }
  for (let i = 0; i < entry.consumerCategoryKeys.length; i++) {
    const key = entry.consumerCategoryKeys[i]!;
    if (!isHandoffConsumerCategoryKey(key) || key !== preparation.consumerCategoryKeys[i]) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry has forged or mismatched consumer category key",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R07"],
      );
    }
  }

  if (input.review) {
    if (input.review.reviewId !== entry.reviewId) {
      throw new OrchestraConstitutionalError(
        "Handoff entry reviewId does not match provided Review",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R07"],
      );
    }
    if (
      input.review.programId !== entry.programId ||
      input.review.obligationId !== entry.obligationId ||
      input.review.rvaId !== entry.rvaId
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff entry Program/Obligation/RVA does not match Review lineage",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R02", "FI-DSN-STD-015-R07"],
      );
    }
  }

  if (input.determination) {
    if (
      input.determination.determinationId !== entry.determinationId ||
      input.determination.reviewId !== entry.reviewId
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff entry Determination does not match Review lineage",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R07"],
      );
    }
  }

  // R08 boundary — reject HOEM / authorization act fields if present on raw-shaped object
  const raw = entry as unknown as Record<string, unknown>;
  const forbidden = [
    "handoffActId",
    "handoffAuthorized",
    "handoffAuthorizationActId",
    "postureDeclarationActId",
    "hoemEvidenceId",
    "hoemOperativeEvidenceId",
    "handoffAuthorization",
    "executesHandoff",
  ];
  for (const key of forbidden) {
    const value = raw[key];
    if (value === true || (typeof value === "string" && value.trim())) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry must not carry R08+ HOEM / authorization act fields",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R04", "FI-DSN-STD-015-R05", "FI-DSN-STD-015-R07"],
      );
    }
  }
}
