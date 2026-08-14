/**
 * HOF-G6-U2 persisted Handoff suspension coherence — FI-DSN-STD-015-R84–R97.
 *
 * Rehydration must reject forged authority/scope, foreign binding/entry/GPRA lineage,
 * withdrawal/recall/reentry/execution collapse claims. Does not mutate upstream history.
 */

import { isHccmConsumerClassId } from "../hccm-consumer-classes.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import { isFrozenHandoffPostureClass } from "../handoff-posture-declaration.js";
import { isCanonicalEstablishedHandoffGovernanceAuthorityClassId } from "../handoff-governance-authority.js";
import { isSuspensionConstitutionalBasisKind } from "../handoff-suspension.js";
import { rejectForgedOrPrematureG6LifecycleActRehydration } from "../handoff-lifecycle-g6-foundation.js";
import type {
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreparationRecord,
  GovernedHandoffSuspensionActRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffSuspensionCoherence(input: {
  suspension: GovernedHandoffSuspensionActRecord;
  entry: GovernedHandoffEntryRecord;
  binding: GovernedHandoffConsumerBindingRecord;
  authorization: GovernedHandoffAuthorizationActRecord;
  posture: GovernedHandoffPostureDeclarationActRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { suspension, entry, binding, authorization, posture } = input;

  rejectForgedOrPrematureG6LifecycleActRehydration({
    purportedActType: suspension.hoemSuspensionRecord?.actType,
    purportedHoemActType: suspension.hoemSuspensionRecord?.actType,
  });

  if (suspension.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension entryId does not match provided entry",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  if (suspension.bindingId !== binding.bindingId) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension bindingId does not match provided binding",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension binding is foreign to entry",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  if (
    suspension.authorizationActId !== authorization.authorizationActId ||
    authorization.entryId !== entry.entryId ||
    authorization.consumerClassId !== binding.consumerClassId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension authorization is foreign to binding/entry (R85a/R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R85", "FI-DSN-STD-015-R88"],
    );
  }
  if (
    suspension.postureDeclarationActId !== posture.postureDeclarationActId ||
    posture.bindingId !== binding.bindingId ||
    posture.entryId !== entry.entryId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension posture declaration is foreign to binding/entry (R85a/R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R85", "FI-DSN-STD-015-R88"],
    );
  }

  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(suspension.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension has forged suspension authority class (R84)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R84"],
    );
  }
  if (suspension.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension authority governing source must be PD-STD-015-001 (R84)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R84"],
    );
  }
  if (suspension.authorityConstitutionalScope !== "handoff_suspension_act") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension must use handoff_suspension_act scope (R84)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R84"],
    );
  }

  if (
    suspension.declaredPostureClass != null &&
    (!isFrozenHandoffPostureClass(suspension.declaredPostureClass) ||
      suspension.declaredPostureClass !== posture.declaredPostureClass)
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension posture class does not match posture declaration (R85a)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R85"],
    );
  }

  if (!isHccmConsumerClassId(suspension.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension has forged consumer class (R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  if (suspension.consumerClassId !== binding.consumerClassId) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension consumer class does not match binding (R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }

  if (!isSuspensionConstitutionalBasisKind(suspension.constitutionalBasisKind)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension has forged or missing constitutional basisKind (R89)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R89"],
    );
  }
  if (
    suspension.constitutionalBasisProvenance.basisKind !==
      suspension.constitutionalBasisKind ||
    suspension.constitutionalBasisProvenance.notesCannotBeSoleBasis !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension provenance is incoherent (R89)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R89"],
    );
  }

  if (
    suspension.preparationId !== entry.preparationId ||
    suspension.gpraId !== entry.gpraId ||
    suspension.approvalActId !== entry.approvalActId ||
    suspension.reviewId !== entry.reviewId ||
    suspension.determinationId !== entry.determinationId ||
    suspension.rvaId !== entry.rvaId ||
    suspension.programId !== entry.programId ||
    suspension.obligationId !== entry.obligationId ||
    suspension.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension lineage does not match entry subject (R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }

  const hoem = suspension.hoemSuspensionRecord;
  if (
    !hoem ||
    hoem.actType !== "suspension" ||
    hoem.suspensionActId !== suspension.suspensionActId ||
    hoem.gpraId !== suspension.gpraId ||
    hoem.obligationId !== suspension.obligationId ||
    hoem.handoffConsumerContextId !== suspension.handoffConsumerContextId ||
    hoem.bindingId !== suspension.bindingId ||
    hoem.consumerClassId !== suspension.consumerClassId ||
    hoem.authorizationActId !== suspension.authorizationActId ||
    hoem.postureDeclarationActId !== suspension.postureDeclarationActId ||
    hoem.constitutionalBasisKind !== suspension.constitutionalBasisKind ||
    hoem.effectiveAt !== suspension.suspendedAt ||
    hoem.doesNotMergeAuthorizationAttribution !== true ||
    hoem.doesNotMergePostureDeclarationAttribution !== true ||
    hoem.doesNotMergeCompletionAttribution !== true ||
    hoem.doesNotMergeLifecycleAttribution !== true ||
    hoem.doesNotMergeWithdrawalAttribution !== true ||
    hoem.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HOEM suspension operative record is incoherent or merges peer act types (R93)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R93"],
    );
  }

  if (
    suspension.forwardReliancePaused !== true ||
    suspension.doesNotTerminatePosture !== true ||
    suspension.doesNotEraseAuthorization !== true ||
    suspension.notHandoffWithdrawal !== true ||
    suspension.notHandoffRecall !== true ||
    suspension.notHandoffCompletion !== true ||
    suspension.notHercmReentry !== true ||
    suspension.notResumption !== true ||
    suspension.notRestoration !== true ||
    suspension.effectFraming !== "temporary_forward_reliance_pause" ||
    suspension.notHandoffAuthorization !== true ||
    suspension.notHandoffPostureDeclaration !== true ||
    suspension.notHandoffExecution !== true ||
    suspension.notDownstreamAcceptance !== true ||
    suspension.notPermanentCollectionMembership !== true ||
    suspension.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    suspension.doesNotCollapsePeerDecisionClasses !== true ||
    suspension.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    suspension.doesNotMergeAcrossConsumerClasses !== true ||
    suspension.notAutomaticHslmPromotion !== true ||
    suspension.hslmProjectionFromActFacts !== true ||
    suspension.r84DistinctHgaSuspensionAct !== true ||
    suspension.r85SharedPreconditionsPlusTriggers !== true ||
    suspension.r86NoSuspendAfterRelianceCeased !== true ||
    suspension.r87NoSoleRtcGpraG11HrwmBasis !== true ||
    suspension.r88SingleBindingPostureChain !== true ||
    suspension.r89ConstitutionalBasisAndProvenance !== true ||
    suspension.r90EffectFromSuspendedAtForward !== true ||
    suspension.r91TemporaryForwardReliancePause !== true ||
    suspension.r92AttributedBindingOnly !== true ||
    suspension.r93HoemSuspensionOperativeRecord !== true ||
    suspension.r94NotAutomaticHslmPromotion !== true ||
    suspension.r95RepeatedSuspensionsAdditive !== true ||
    suspension.r96InvalidAttemptsNonOperative !== true ||
    suspension.r97NotWithdrawalRecallOrReentry !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension must carry HOF-G6-U2 peer-distinct / pause markers (R84–R97)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R84", "FI-DSN-STD-015-R91"],
    );
  }

  if (
    !Array.isArray(suspension.consumedHcbmBoundaryKeys) ||
    suspension.consumedHcbmBoundaryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension requires nonempty consumed HCBM keys (R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  for (const key of suspension.consumedHcbmBoundaryKeys) {
    if (
      !isHandoffConsumerCategoryKey(key) ||
      !binding.consumedHcbmBoundaryKeys.includes(key) ||
      !entry.consumerCategoryKeys.includes(key)
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff suspension has forged or mismatched HCBM keys (R88)",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R88"],
      );
    }
  }

  if (input.preparation && input.preparation.preparationId !== suspension.preparationId) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension preparationId does not match provided preparation",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  if (input.gpra && input.gpra.gpraId !== suspension.gpraId) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension GPRA identity does not match provided GPRA grant",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  if (input.review && input.review.reviewId !== suspension.reviewId) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension reviewId does not match provided Review",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  if (
    input.determination &&
    (input.determination.determinationId !== suspension.determinationId ||
      input.determination.reviewId !== suspension.reviewId)
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension determination does not match provided Determination",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
}
