/**
 * HOF-G3 persisted HCCM consumer binding coherence — FI-DSN-STD-015-R33–R39.
 *
 * Rehydration must reject forged CC, foreign entry/GPRA lineage, authorization/posture
 * collapse claims, and execution claims. Does not mutate upstream history.
 */

import { isHccmConsumerClassId, resolveHccmConsumerClass } from "../hccm-consumer-classes.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import type {
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffConsumerBindingCoherence(input: {
  binding: GovernedHandoffConsumerBindingRecord;
  entry: GovernedHandoffEntryRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { binding, entry } = input;

  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "HCCM consumer binding entryId does not match provided entry",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R39"],
    );
  }

  if (!isHccmConsumerClassId(binding.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding has forged consumer class (R33)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33", "FI-DSN-STD-015-R39"],
    );
  }
  const catalog = resolveHccmConsumerClass(binding.consumerClassId);
  if (binding.constitutionalConsumerClass !== catalog.constitutionalConsumerClass) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding constitutional class does not match catalog (R33)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33"],
    );
  }
  if (binding.postureClassAffinity !== catalog.postureClassAffinity) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding posture-class affinity does not match catalog (R33/R37)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33", "FI-DSN-STD-015-R37"],
    );
  }
  if (binding.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding downstream consideration domain does not match catalog (R33)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33"],
    );
  }

  if (
    !Array.isArray(binding.consumedHcbmBoundaryKeys) ||
    binding.consumedHcbmBoundaryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding requires nonempty consumed HCBM keys (R34/R35)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R34", "FI-DSN-STD-015-R35"],
    );
  }
  for (const key of binding.consumedHcbmBoundaryKeys) {
    if (
      !isHandoffConsumerCategoryKey(key) ||
      !(catalog.hcbmBoundaryKeys as readonly string[]).includes(key) ||
      !entry.consumerCategoryKeys.includes(key)
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted HCCM consumer binding has forged or mismatched HCBM keys (R34)",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R34", "FI-DSN-STD-015-R37"],
      );
    }
  }

  if (
    binding.preparationId !== entry.preparationId ||
    binding.gpraId !== entry.gpraId ||
    binding.approvalActId !== entry.approvalActId ||
    binding.reviewId !== entry.reviewId ||
    binding.determinationId !== entry.determinationId ||
    binding.rvaId !== entry.rvaId ||
    binding.programId !== entry.programId ||
    binding.obligationId !== entry.obligationId ||
    binding.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "HCCM consumer binding lineage does not match entry subject (R35/R39)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R35", "FI-DSN-STD-015-R39"],
    );
  }

  if (
    !Array.isArray(binding.entryConsumerCategoryKeys) ||
    binding.entryConsumerCategoryKeys.length !== entry.consumerCategoryKeys.length ||
    binding.entryConsumerCategoryKeys.some((k, i) => k !== entry.consumerCategoryKeys[i])
  ) {
    throw new OrchestraConstitutionalError(
      "HCCM consumer binding entryConsumerCategoryKeys must match entry export keys",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R34", "FI-DSN-STD-015-R39"],
    );
  }

  if (
    binding.notHandoffAuthorization !== true ||
    binding.notHandoffPostureDeclaration !== true ||
    binding.notHandoffCompletion !== true ||
    binding.notDownstreamAcceptance !== true ||
    binding.notPermanentCollectionMembership !== true ||
    binding.notOperationalIntake !== true ||
    binding.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    binding.doesNotInferCc01VsCc02FromHcbmAlone !== true ||
    binding.r33ClosedHccmCatalog !== true ||
    binding.r34HcbmMappedToSelectedCc !== true ||
    binding.r35BoundConsumerContextTuple !== true ||
    binding.r36SingleCcPerBinding !== true ||
    binding.r37Cc01Cc02CatalogDisambiguation !== true ||
    binding.r38NotAuthorizationOrPostureOrIntake !== true ||
    binding.r39EligibilityGatedClosedCatalog !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding must carry HOF-G3 peer-distinct / non-execution markers (R33–R39)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R38"],
    );
  }

  if (input.preparation && input.preparation.preparationId !== binding.preparationId) {
    throw new OrchestraConstitutionalError(
      "HCCM consumer binding preparationId does not match provided preparation",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R39"],
    );
  }
  if (input.gpra && input.gpra.gpraId !== binding.gpraId) {
    throw new OrchestraConstitutionalError(
      "HCCM consumer binding GPRA identity does not match provided GPRA grant",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R35"],
    );
  }
  if (input.review && input.review.reviewId !== binding.reviewId) {
    throw new OrchestraConstitutionalError(
      "HCCM consumer binding reviewId does not match provided Review",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R39"],
    );
  }
  if (
    input.determination &&
    (input.determination.determinationId !== binding.determinationId ||
      input.determination.reviewId !== binding.reviewId)
  ) {
    throw new OrchestraConstitutionalError(
      "HCCM consumer binding Determination does not match Review lineage",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R39"],
    );
  }

  const raw = binding as unknown as Record<string, unknown>;
  const forbidden = [
    "handoffPosture",
    "authorizationActId",
    "handoffAuthorizationActId",
    "completionActId",
    "executesHandoff",
    "executionQueueId",
    "downstreamAcceptanceId",
    "permanentCollectionMembershipId",
    "brainBindsConsumerClass",
  ];
  for (const key of forbidden) {
    const value = raw[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted HCCM consumer binding must not carry authorization/posture/execution fields (R38)",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R38"],
      );
    }
  }
}
