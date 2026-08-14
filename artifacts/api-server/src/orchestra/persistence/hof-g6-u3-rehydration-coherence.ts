/**
 * HOF-G6-U3 persisted Handoff withdrawal coherence — FI-DSN-STD-015-R98–R111.
 */

import { isHccmConsumerClassId } from "../hccm-consumer-classes.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import { isFrozenHandoffPostureClass } from "../handoff-posture-declaration.js";
import { isCanonicalEstablishedHandoffGovernanceAuthorityClassId } from "../handoff-governance-authority.js";
import { isWithdrawalConstitutionalBasisKind } from "../handoff-withdrawal.js";
import { rejectForgedOrPrematureG6LifecycleActRehydration } from "../handoff-lifecycle-g6-foundation.js";
import type { Std015RequirementId } from "../std015-authority.js";
import type {
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreparationRecord,
  GovernedHandoffWithdrawalActRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

const CODE = "invalid_handoff_withdrawal" as const;

function reject(message: string, requirements: readonly Std015RequirementId[]): never {
  throw new OrchestraConstitutionalError(message, CODE, requirements);
}

export function assertPersistedGovernedHandoffWithdrawalCoherence(input: {
  withdrawal: GovernedHandoffWithdrawalActRecord;
  entry: GovernedHandoffEntryRecord;
  binding: GovernedHandoffConsumerBindingRecord;
  authorization: GovernedHandoffAuthorizationActRecord;
  posture: GovernedHandoffPostureDeclarationActRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { withdrawal, entry, binding, authorization, posture } = input;

  rejectForgedOrPrematureG6LifecycleActRehydration({
    purportedActType: withdrawal.hoemWithdrawalRecord?.actType,
    purportedHoemActType: withdrawal.hoemWithdrawalRecord?.actType,
  });

  if (withdrawal.entryId !== entry.entryId || binding.entryId !== entry.entryId) {
    reject("Handoff withdrawal entry or binding is foreign to the provided entry", [
      "FI-DSN-STD-015-R102",
    ]);
  }
  if (withdrawal.bindingId !== binding.bindingId) {
    reject("Handoff withdrawal bindingId does not match provided binding", [
      "FI-DSN-STD-015-R102",
    ]);
  }
  if (
    withdrawal.authorizationActId !== authorization.authorizationActId ||
    authorization.entryId !== entry.entryId ||
    authorization.consumerClassId !== binding.consumerClassId
  ) {
    reject("Handoff withdrawal authorization is foreign to binding/entry", [
      "FI-DSN-STD-015-R99",
      "FI-DSN-STD-015-R102",
    ]);
  }
  if (
    withdrawal.postureDeclarationActId !== posture.postureDeclarationActId ||
    posture.bindingId !== binding.bindingId ||
    posture.entryId !== entry.entryId
  ) {
    reject("Handoff withdrawal posture declaration is foreign to binding/entry", [
      "FI-DSN-STD-015-R99",
      "FI-DSN-STD-015-R102",
    ]);
  }
  if (
    !isCanonicalEstablishedHandoffGovernanceAuthorityClassId(withdrawal.authorityClassId) ||
    withdrawal.authorityGoverningSourceId !== "PD-STD-015-001" ||
    withdrawal.authorityConstitutionalScope !== "handoff_withdrawal_act"
  ) {
    reject("Persisted Handoff withdrawal has forged authority or scope", [
      "FI-DSN-STD-015-R70",
      "FI-DSN-STD-015-R98",
    ]);
  }
  if (
    withdrawal.declaredPostureClass != null &&
    (!isFrozenHandoffPostureClass(withdrawal.declaredPostureClass) ||
      withdrawal.declaredPostureClass !== posture.declaredPostureClass)
  ) {
    reject("Persisted Handoff withdrawal posture class does not match declaration", [
      "FI-DSN-STD-015-R99",
    ]);
  }
  if (
    !isHccmConsumerClassId(withdrawal.consumerClassId) ||
    withdrawal.consumerClassId !== binding.consumerClassId
  ) {
    reject("Persisted Handoff withdrawal consumer class does not match binding", [
      "FI-DSN-STD-015-R102",
    ]);
  }
  if (
    !isWithdrawalConstitutionalBasisKind(withdrawal.constitutionalBasisKind) ||
    withdrawal.constitutionalBasisProvenance.basisKind !==
      withdrawal.constitutionalBasisKind ||
    withdrawal.constitutionalBasisProvenance.notesCannotBeSoleBasis !== true
  ) {
    reject("Persisted Handoff withdrawal constitutional basis is incoherent", [
      "FI-DSN-STD-015-R103",
    ]);
  }
  if (
    withdrawal.preparationId !== entry.preparationId ||
    withdrawal.gpraId !== entry.gpraId ||
    withdrawal.approvalActId !== entry.approvalActId ||
    withdrawal.reviewId !== entry.reviewId ||
    withdrawal.determinationId !== entry.determinationId ||
    withdrawal.rvaId !== entry.rvaId ||
    withdrawal.programId !== entry.programId ||
    withdrawal.obligationId !== entry.obligationId ||
    withdrawal.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    reject("Handoff withdrawal lineage does not match entry subject", [
      "FI-DSN-STD-015-R102",
    ]);
  }

  const hoem = withdrawal.hoemWithdrawalRecord;
  if (
    !hoem ||
    hoem.actType !== "withdrawal" ||
    hoem.withdrawalActId !== withdrawal.withdrawalActId ||
    hoem.gpraId !== withdrawal.gpraId ||
    hoem.obligationId !== withdrawal.obligationId ||
    hoem.handoffConsumerContextId !== withdrawal.handoffConsumerContextId ||
    hoem.bindingId !== withdrawal.bindingId ||
    hoem.consumerClassId !== withdrawal.consumerClassId ||
    hoem.authorizationActId !== withdrawal.authorizationActId ||
    hoem.postureDeclarationActId !== withdrawal.postureDeclarationActId ||
    hoem.constitutionalBasisKind !== withdrawal.constitutionalBasisKind ||
    hoem.effectiveAt !== withdrawal.withdrawnAt ||
    hoem.retractionTargets.length !== withdrawal.retractionTargets.length ||
    !hoem.retractionTargets.every((target) => withdrawal.retractionTargets.includes(target)) ||
    hoem.doesNotMergeAuthorizationAttribution !== true ||
    hoem.doesNotMergePostureDeclarationAttribution !== true ||
    hoem.doesNotMergeCompletionAttribution !== true ||
    hoem.doesNotMergeSuspensionAttribution !== true ||
    hoem.doesNotMergeLifecycleAttribution !== true ||
    hoem.doesNotMergeRecallAttribution !== true
  ) {
    reject("Persisted HOEM withdrawal operative record is incoherent", [
      "FI-DSN-STD-015-R107",
    ]);
  }

  if (
    !Array.isArray(withdrawal.consumedHcbmBoundaryKeys) ||
    withdrawal.consumedHcbmBoundaryKeys.length === 0
  ) {
    reject("Persisted Handoff withdrawal requires consumed HCBM keys", [
      "FI-DSN-STD-015-R102",
    ]);
  }
  for (const key of withdrawal.consumedHcbmBoundaryKeys) {
    if (
      !isHandoffConsumerCategoryKey(key) ||
      !binding.consumedHcbmBoundaryKeys.includes(key) ||
      !entry.consumerCategoryKeys.includes(key)
    ) {
      reject("Persisted Handoff withdrawal has forged or mismatched HCBM keys", [
        "FI-DSN-STD-015-R102",
      ]);
    }
  }

  if (input.preparation && input.preparation.preparationId !== withdrawal.preparationId) {
    reject("Handoff withdrawal preparation does not match", ["FI-DSN-STD-015-R102"]);
  }
  if (input.gpra && input.gpra.gpraId !== withdrawal.gpraId) {
    reject("Handoff withdrawal GPRA does not match", ["FI-DSN-STD-015-R102"]);
  }
  if (input.review && input.review.reviewId !== withdrawal.reviewId) {
    reject("Handoff withdrawal Review does not match", ["FI-DSN-STD-015-R102"]);
  }
  if (
    input.determination &&
    (input.determination.determinationId !== withdrawal.determinationId ||
      input.determination.reviewId !== withdrawal.reviewId)
  ) {
    reject("Handoff withdrawal Determination does not match", [
      "FI-DSN-STD-015-R102",
    ]);
  }
}
