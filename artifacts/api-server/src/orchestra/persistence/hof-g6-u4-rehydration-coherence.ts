/**
 * HOF-G6-U4 persisted Handoff recall coherence — FI-DSN-STD-015-R112–R125.
 */

import { isHccmConsumerClassId } from "../hccm-consumer-classes.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import { isFrozenHandoffPostureClass } from "../handoff-posture-declaration.js";
import { isCanonicalEstablishedHandoffGovernanceAuthorityClassId } from "../handoff-governance-authority.js";
import { isHrtcmRecallTriggerId } from "../handoff-hrtcm.js";
import { rejectForgedOrPrematureG6LifecycleActRehydration } from "../handoff-lifecycle-g6-foundation.js";
import type { Std015RequirementId } from "../std015-authority.js";
import type {
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreparationRecord,
  GovernedHandoffRecallActRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

const CODE = "invalid_handoff_recall" as const;

function reject(message: string, requirements: readonly Std015RequirementId[]): never {
  throw new OrchestraConstitutionalError(message, CODE, requirements);
}

export function assertPersistedGovernedHandoffRecallCoherence(input: {
  recall: GovernedHandoffRecallActRecord;
  entry: GovernedHandoffEntryRecord;
  binding: GovernedHandoffConsumerBindingRecord;
  authorization: GovernedHandoffAuthorizationActRecord;
  posture: GovernedHandoffPostureDeclarationActRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { recall, entry, binding, authorization, posture } = input;

  rejectForgedOrPrematureG6LifecycleActRehydration({
    purportedActType: recall.hoemRecallRecord?.actType,
    purportedHoemActType: recall.hoemRecallRecord?.actType,
  });

  if (recall.entryId !== entry.entryId || binding.entryId !== entry.entryId) {
    reject("Handoff recall entry or binding is foreign to the provided entry", [
      "FI-DSN-STD-015-R116",
    ]);
  }
  if (recall.bindingId !== binding.bindingId) {
    reject("Handoff recall bindingId does not match provided binding", [
      "FI-DSN-STD-015-R116",
    ]);
  }
  if (
    recall.authorizationActId !== authorization.authorizationActId ||
    authorization.entryId !== entry.entryId ||
    authorization.consumerClassId !== binding.consumerClassId
  ) {
    reject("Handoff recall authorization is foreign to binding/entry", [
      "FI-DSN-STD-015-R113",
      "FI-DSN-STD-015-R116",
    ]);
  }
  if (
    recall.postureDeclarationActId !== posture.postureDeclarationActId ||
    posture.bindingId !== binding.bindingId ||
    posture.entryId !== entry.entryId
  ) {
    reject("Handoff recall posture declaration is foreign to binding/entry", [
      "FI-DSN-STD-015-R113",
      "FI-DSN-STD-015-R116",
    ]);
  }
  if (
    !isCanonicalEstablishedHandoffGovernanceAuthorityClassId(recall.authorityClassId) ||
    recall.authorityGoverningSourceId !== "PD-STD-015-001" ||
    recall.authorityConstitutionalScope !== "handoff_recall_act"
  ) {
    reject("Persisted Handoff recall has forged authority or scope", [
      "FI-DSN-STD-015-R70",
      "FI-DSN-STD-015-R112",
    ]);
  }
  if (
    recall.declaredPostureClass != null &&
    (!isFrozenHandoffPostureClass(recall.declaredPostureClass) ||
      recall.declaredPostureClass !== posture.declaredPostureClass)
  ) {
    reject("Persisted Handoff recall posture class does not match declaration", [
      "FI-DSN-STD-015-R113",
    ]);
  }
  if (
    !isHccmConsumerClassId(recall.consumerClassId) ||
    recall.consumerClassId !== binding.consumerClassId
  ) {
    reject("Persisted Handoff recall consumer class does not match binding", [
      "FI-DSN-STD-015-R116",
    ]);
  }
  if (
    !Array.isArray(recall.satisfiedHrtcmTriggers) ||
    recall.satisfiedHrtcmTriggers.length === 0 ||
    !recall.satisfiedHrtcmTriggers.every((t) => isHrtcmRecallTriggerId(t))
  ) {
    reject("Persisted Handoff recall requires at least one closed HRTCM trigger (R115/R117)", [
      "FI-DSN-STD-015-R115",
      "FI-DSN-STD-015-R117",
    ]);
  }
  if (
    recall.preparationId !== entry.preparationId ||
    recall.gpraId !== entry.gpraId ||
    recall.approvalActId !== entry.approvalActId ||
    recall.reviewId !== entry.reviewId ||
    recall.determinationId !== entry.determinationId ||
    recall.rvaId !== entry.rvaId ||
    recall.programId !== entry.programId ||
    recall.obligationId !== entry.obligationId ||
    recall.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    reject("Handoff recall lineage does not match entry subject", [
      "FI-DSN-STD-015-R116",
    ]);
  }

  const hoem = recall.hoemRecallRecord;
  if (
    !hoem ||
    hoem.actType !== "recall" ||
    hoem.recallActId !== recall.recallActId ||
    hoem.gpraId !== recall.gpraId ||
    hoem.obligationId !== recall.obligationId ||
    hoem.handoffConsumerContextId !== recall.handoffConsumerContextId ||
    hoem.bindingId !== recall.bindingId ||
    hoem.consumerClassId !== recall.consumerClassId ||
    hoem.authorizationActId !== recall.authorizationActId ||
    hoem.postureDeclarationActId !== recall.postureDeclarationActId ||
    hoem.effectiveAt !== recall.recalledAt ||
    hoem.satisfiedHrtcmTriggers.length !== recall.satisfiedHrtcmTriggers.length ||
    !hoem.satisfiedHrtcmTriggers.every((t) => recall.satisfiedHrtcmTriggers.includes(t)) ||
    hoem.doesNotMergeAuthorizationAttribution !== true ||
    hoem.doesNotMergePostureDeclarationAttribution !== true ||
    hoem.doesNotMergeCompletionAttribution !== true ||
    hoem.doesNotMergeSuspensionAttribution !== true ||
    hoem.doesNotMergeLifecycleAttribution !== true ||
    hoem.doesNotMergeWithdrawalAttribution !== true
  ) {
    reject("Persisted HOEM recall operative record is incoherent", [
      "FI-DSN-STD-015-R121",
    ]);
  }

  if (
    !Array.isArray(recall.consumedHcbmBoundaryKeys) ||
    recall.consumedHcbmBoundaryKeys.length === 0
  ) {
    reject("Persisted Handoff recall requires consumed HCBM keys", [
      "FI-DSN-STD-015-R116",
    ]);
  }
  for (const key of recall.consumedHcbmBoundaryKeys) {
    if (
      !isHandoffConsumerCategoryKey(key) ||
      !binding.consumedHcbmBoundaryKeys.includes(key) ||
      !entry.consumerCategoryKeys.includes(key)
    ) {
      reject("Persisted Handoff recall has forged or mismatched HCBM keys", [
        "FI-DSN-STD-015-R116",
      ]);
    }
  }

  if (input.preparation && input.preparation.preparationId !== recall.preparationId) {
    reject("Handoff recall preparation does not match", ["FI-DSN-STD-015-R116"]);
  }
  if (input.gpra && input.gpra.gpraId !== recall.gpraId) {
    reject("Handoff recall GPRA does not match", ["FI-DSN-STD-015-R116"]);
  }
  if (input.review && input.review.reviewId !== recall.reviewId) {
    reject("Handoff recall Review does not match", ["FI-DSN-STD-015-R116"]);
  }
  if (
    input.determination &&
    (input.determination.determinationId !== recall.determinationId ||
      input.determination.reviewId !== recall.reviewId)
  ) {
    reject("Handoff recall Determination does not match", [
      "FI-DSN-STD-015-R116",
    ]);
  }
}
