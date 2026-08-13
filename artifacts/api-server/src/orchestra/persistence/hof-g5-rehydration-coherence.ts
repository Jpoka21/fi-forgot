/**
 * HOF-G5 persisted Handoff completion / lifecycle rejection coherence — FI-DSN-STD-015-R48–R57.
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
  GovernedHandoffLifecycleRejectionAttributionRecord,
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

export function assertPersistedGovernedHandoffLifecycleRejectionCoherence(input: {
  attribution: GovernedHandoffLifecycleRejectionAttributionRecord;
  entry: GovernedHandoffEntryRecord;
  binding: GovernedHandoffConsumerBindingRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { attribution, entry, binding } = input;

  if (attribution.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff lifecycle rejection entryId does not match provided entry",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R50", "FI-DSN-STD-015-R51"],
    );
  }
  if (attribution.bindingId !== binding.bindingId) {
    throw new OrchestraConstitutionalError(
      "Handoff lifecycle rejection bindingId does not match provided binding",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R50"],
    );
  }
  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff lifecycle rejection binding is foreign to entry",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R50"],
    );
  }

  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(attribution.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff lifecycle rejection has forged authority class (R51)",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R57"],
    );
  }
  if (attribution.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff lifecycle rejection authority governing source must be PD-STD-015-001 (R51)",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R51"],
    );
  }
  if (attribution.authorityConstitutionalScope !== "handoff_lifecycle_rejection_act") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff lifecycle rejection must use handoff_lifecycle_rejection_act scope (R51/R56)",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R56"],
    );
  }
  if (attribution.lifecycleState !== "rejected") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff lifecycle rejection must attribute rejected state only at G5 (R51)",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R51"],
    );
  }
  if (typeof attribution.grounds !== "string" || !attribution.grounds.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff lifecycle rejection requires grounds (R51)",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R51"],
    );
  }

  if (!isHccmConsumerClassId(attribution.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff lifecycle rejection has forged consumer class (R50)",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R50"],
    );
  }
  if (attribution.consumerClassId !== binding.consumerClassId) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff lifecycle rejection consumer class does not match binding (R50)",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R50"],
    );
  }

  if (
    attribution.preparationId !== entry.preparationId ||
    attribution.gpraId !== entry.gpraId ||
    attribution.approvalActId !== entry.approvalActId ||
    attribution.reviewId !== entry.reviewId ||
    attribution.determinationId !== entry.determinationId ||
    attribution.rvaId !== entry.rvaId ||
    attribution.programId !== entry.programId ||
    attribution.obligationId !== entry.obligationId ||
    attribution.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff lifecycle rejection lineage does not match entry subject (R50/R51)",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R50", "FI-DSN-STD-015-R51"],
    );
  }

  const hoem = attribution.hoemLifecycleAttributionRecord;
  if (
    !hoem ||
    hoem.actType !== "lifecycle_state_attribution" ||
    hoem.lifecycleState !== "rejected" ||
    hoem.lifecycleRejectionAttributionId !== attribution.lifecycleRejectionAttributionId ||
    hoem.gpraId !== attribution.gpraId ||
    hoem.obligationId !== attribution.obligationId ||
    hoem.handoffConsumerContextId !== attribution.handoffConsumerContextId ||
    hoem.bindingId !== attribution.bindingId ||
    hoem.consumerClassId !== attribution.consumerClassId ||
    hoem.doesNotMergeAuthorizationAttribution !== true ||
    hoem.doesNotMergePostureDeclarationAttribution !== true ||
    hoem.doesNotMergeCompletionAttribution !== true ||
    hoem.doesNotMergeSuspensionAttribution !== true ||
    hoem.doesNotMergeWithdrawalAttribution !== true ||
    hoem.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HOEM lifecycle attribution record is incoherent or merges peer act types (R56)",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R56"],
    );
  }

  if (
    attribution.notHandoffAuthorization !== true ||
    attribution.notHandoffPostureDeclaration !== true ||
    attribution.notHandoffCompletion !== true ||
    attribution.notHandoffExecution !== true ||
    attribution.notHandoffSuspension !== true ||
    attribution.notHandoffRecall !== true ||
    attribution.notHandoffWithdrawal !== true ||
    attribution.notDownstreamAcceptance !== true ||
    attribution.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    attribution.doesNotCollapsePeerDecisionClasses !== true ||
    attribution.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    attribution.doesNotMergeAcrossConsumerClasses !== true ||
    attribution.r48ClosedHslmVocabulary !== true ||
    attribution.r49PeerDistinctLifecycle !== true ||
    attribution.r50SingleBindingPostureChain !== true ||
    attribution.r51RejectedMeaning !== true ||
    attribution.r56HoemLifecycleAttributionRecord !== true ||
    attribution.r57NoImplicitLifecyclePromotion !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff lifecycle rejection must carry HOF-G5 peer-distinct markers (R48–R57)",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R49", "FI-DSN-STD-015-R51"],
    );
  }

  if (input.preparation && input.preparation.preparationId !== attribution.preparationId) {
    throw new OrchestraConstitutionalError(
      "Handoff lifecycle rejection preparationId does not match provided preparation",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R51"],
    );
  }
  if (input.gpra && input.gpra.gpraId !== attribution.gpraId) {
    throw new OrchestraConstitutionalError(
      "Handoff lifecycle rejection GPRA identity does not match provided GPRA grant",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R50"],
    );
  }
  if (input.review && input.review.reviewId !== attribution.reviewId) {
    throw new OrchestraConstitutionalError(
      "Handoff lifecycle rejection reviewId does not match provided Review",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R51"],
    );
  }
  if (
    input.determination &&
    (input.determination.determinationId !== attribution.determinationId ||
      input.determination.reviewId !== attribution.reviewId)
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff lifecycle rejection Determination does not match Review lineage",
      "invalid_handoff_lifecycle_attribution",
      ["FI-DSN-STD-015-R51"],
    );
  }

  const raw = attribution as unknown as Record<string, unknown>;
  const forbidden = [
    "completionActId",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "expiryActId",
    "executesHandoff",
    "executionQueueId",
    "downstreamAcceptanceId",
    "permanentCollectionMembershipId",
    "brainRejectHandoff",
    "implicitRejection",
    "authorizationActId",
  ];
  for (const key of forbidden) {
    const value = raw[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff lifecycle rejection must not carry completion/execution/deferred-lifecycle fields (R51/R57)",
        "invalid_handoff_lifecycle_attribution",
        ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R57"],
      );
    }
  }
}
