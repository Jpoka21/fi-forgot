/**
 * HOF-G5 persisted Handoff completion coherence — FI-DSN-STD-015-R48–R57.
 *
 * Rehydration must reject forged authority/scope, foreign binding/entry/GPRA lineage,
 * authorization/posture/execution collapse claims. Does not mutate upstream history.
 */

import { isHccmConsumerClassId } from "../hccm-consumer-classes.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import { isFrozenHandoffPostureClass } from "../handoff-posture-declaration.js";
import { isCanonicalEstablishedHandoffGovernanceAuthorityClassId } from "../handoff-governance-authority.js";
import type {
  GovernedHandoffCompletionActRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffCompletionCoherence(input: {
  completion: GovernedHandoffCompletionActRecord;
  entry: GovernedHandoffEntryRecord;
  binding: GovernedHandoffConsumerBindingRecord;
  posture: GovernedHandoffPostureDeclarationActRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { completion, entry, binding, posture } = input;

  if (completion.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff completion entryId does not match provided entry",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50", "FI-DSN-STD-015-R51"],
    );
  }
  if (completion.bindingId !== binding.bindingId) {
    throw new OrchestraConstitutionalError(
      "Handoff completion bindingId does not match provided binding",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50"],
    );
  }
  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff completion binding is foreign to entry",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50"],
    );
  }
  if (
    completion.postureDeclarationActId !== posture.postureDeclarationActId ||
    posture.bindingId !== binding.bindingId ||
    posture.entryId !== entry.entryId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff completion posture declaration is foreign to binding/entry (R50/R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50", "FI-DSN-STD-015-R51"],
    );
  }

  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(completion.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion has forged completion authority class (R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R57"],
    );
  }
  if (completion.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion authority governing source must be PD-STD-015-001 (R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }
  if (completion.authorityConstitutionalScope !== "handoff_completion_act") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion must use handoff_completion_act scope (R51/R56)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R56"],
    );
  }

  if (!isFrozenHandoffPostureClass(completion.declaredPostureClass)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion has forged posture class (R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }
  if (completion.declaredPostureClass !== posture.declaredPostureClass) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion posture class does not match posture declaration (R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }

  if (!isHccmConsumerClassId(completion.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion has forged consumer class (R50)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50"],
    );
  }
  if (completion.consumerClassId !== binding.consumerClassId) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion consumer class does not match binding (R50)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50"],
    );
  }

  if (
    completion.preparationId !== entry.preparationId ||
    completion.gpraId !== entry.gpraId ||
    completion.approvalActId !== entry.approvalActId ||
    completion.reviewId !== entry.reviewId ||
    completion.determinationId !== entry.determinationId ||
    completion.rvaId !== entry.rvaId ||
    completion.programId !== entry.programId ||
    completion.obligationId !== entry.obligationId ||
    completion.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff completion lineage does not match entry subject (R50/R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50", "FI-DSN-STD-015-R51"],
    );
  }

  const hoem = completion.hoemCompletionRecord;
  if (
    !hoem ||
    hoem.actType !== "completion" ||
    hoem.completionActId !== completion.completionActId ||
    hoem.gpraId !== completion.gpraId ||
    hoem.obligationId !== completion.obligationId ||
    hoem.handoffConsumerContextId !== completion.handoffConsumerContextId ||
    hoem.bindingId !== completion.bindingId ||
    hoem.consumerClassId !== completion.consumerClassId ||
    hoem.postureDeclarationActId !== completion.postureDeclarationActId ||
    hoem.declaredPostureClass !== completion.declaredPostureClass ||
    hoem.doesNotMergeAuthorizationAttribution !== true ||
    hoem.doesNotMergePostureDeclarationAttribution !== true ||
    hoem.doesNotMergeLifecycleAttribution !== true ||
    hoem.doesNotMergeSuspensionAttribution !== true ||
    hoem.doesNotMergeWithdrawalAttribution !== true ||
    hoem.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HOEM completion operative record is incoherent or merges peer act types (R56)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R56"],
    );
  }

  if (
    completion.notHandoffAuthorization !== true ||
    completion.notHandoffPostureDeclaration !== true ||
    completion.notHandoffExecution !== true ||
    completion.notHandoffSuspension !== true ||
    completion.notHandoffRecall !== true ||
    completion.notHandoffWithdrawal !== true ||
    completion.notDownstreamAcceptance !== true ||
    completion.notPermanentCollectionMembership !== true ||
    completion.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    completion.doesNotCollapsePeerDecisionClasses !== true ||
    completion.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    completion.doesNotMergeAcrossConsumerClasses !== true ||
    completion.r48ClosedHslmVocabulary !== true ||
    completion.r49PeerDistinctLifecycle !== true ||
    completion.r50SingleBindingPostureChain !== true ||
    completion.r51CompletedMeaning !== true ||
    completion.r56HoemCompletionOperativeRecord !== true ||
    completion.r57NoImplicitLifecyclePromotion !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion must carry HOF-G5 peer-distinct / non-execution markers (R48–R57)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R49", "FI-DSN-STD-015-R51"],
    );
  }

  if (
    !Array.isArray(completion.consumedHcbmBoundaryKeys) ||
    completion.consumedHcbmBoundaryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion requires nonempty consumed HCBM keys (R50)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50"],
    );
  }
  for (const key of completion.consumedHcbmBoundaryKeys) {
    if (
      !isHandoffConsumerCategoryKey(key) ||
      !binding.consumedHcbmBoundaryKeys.includes(key) ||
      !entry.consumerCategoryKeys.includes(key)
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff completion has forged or mismatched HCBM keys (R50)",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R50"],
      );
    }
  }

  if (input.preparation && input.preparation.preparationId !== completion.preparationId) {
    throw new OrchestraConstitutionalError(
      "Handoff completion preparationId does not match provided preparation",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }
  if (input.gpra && input.gpra.gpraId !== completion.gpraId) {
    throw new OrchestraConstitutionalError(
      "Handoff completion GPRA identity does not match provided GPRA grant",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50"],
    );
  }
  if (input.review && input.review.reviewId !== completion.reviewId) {
    throw new OrchestraConstitutionalError(
      "Handoff completion reviewId does not match provided Review",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }
  if (
    input.determination &&
    (input.determination.determinationId !== completion.determinationId ||
      input.determination.reviewId !== completion.reviewId)
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff completion Determination does not match Review lineage",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }

  const raw = completion as unknown as Record<string, unknown>;
  const forbidden = [
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "expiryActId",
    "executesHandoff",
    "executionQueueId",
    "downstreamAcceptanceId",
    "permanentCollectionMembershipId",
    "brainCompleteHandoff",
    "implicitCompletion",
    "authorizationActId",
  ];
  for (const key of forbidden) {
    const value = raw[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff completion must not carry authorization/execution/deferred-lifecycle fields (R51/R57)",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R57"],
      );
    }
  }
}
