/**
 * HERCM persisted Handoff resumption / re-entry coherence — FI-DSN-STD-015-R126–R139.
 *
 * Resumption (REC-02) and re-entry (REC-01/03/04/05) are peer NON-MATRIX HGA acts, so
 * they carry their own constitutional scopes rather than a matrix act type (R126).
 */

import { isHccmConsumerClassId } from "../hccm-consumer-classes.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import { isFrozenHandoffPostureClass } from "../handoff-posture-declaration.js";
import { isCanonicalEstablishedHandoffGovernanceAuthorityClassId } from "../handoff-governance-authority.js";
import { rejectForgedOrPrematureG6LifecycleActRehydration } from "../handoff-lifecycle-g6-foundation.js";
import {
  isHercmReentryCategoryId,
  isHercmResumptionCategoryId,
  isReentryConstitutionalBasisKind,
  isResumptionConstitutionalBasisKind,
  resolveHercmCategory,
} from "../handoff-hercm.js";
import type { Std015RequirementId } from "../std015-authority.js";
import type {
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreparationRecord,
  GovernedHandoffRecallActRecord,
  GovernedHandoffReentryActRecord,
  GovernedHandoffResumptionActRecord,
  GovernedHandoffSuspensionActRecord,
  GovernedHandoffWithdrawalActRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

const RESUMPTION_CODE = "invalid_handoff_resumption" as const;
const REENTRY_CODE = "invalid_handoff_reentry" as const;

function reject(
  code: typeof RESUMPTION_CODE | typeof REENTRY_CODE,
  message: string,
  requirements: readonly Std015RequirementId[],
): never {
  throw new OrchestraConstitutionalError(message, code, requirements);
}

// ---------------------------------------------------------------------------
// REC-02 resumption
// ---------------------------------------------------------------------------

export function assertPersistedGovernedHandoffResumptionCoherence(input: {
  resumption: GovernedHandoffResumptionActRecord;
  entry: GovernedHandoffEntryRecord;
  binding: GovernedHandoffConsumerBindingRecord;
  authorization: GovernedHandoffAuthorizationActRecord;
  posture: GovernedHandoffPostureDeclarationActRecord;
  suspension: GovernedHandoffSuspensionActRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { resumption, entry, binding, authorization, posture, suspension } = input;

  rejectForgedOrPrematureG6LifecycleActRehydration({
    purportedActType: resumption.hoemResumptionRecord?.actType,
    purportedHoemActType: resumption.hoemResumptionRecord?.actType,
  });

  if (resumption.entryId !== entry.entryId || binding.entryId !== entry.entryId) {
    reject(RESUMPTION_CODE, "Handoff resumption entry or binding is foreign to the provided entry", [
      "FI-DSN-STD-015-R130",
    ]);
  }
  if (resumption.bindingId !== binding.bindingId) {
    reject(RESUMPTION_CODE, "Handoff resumption bindingId does not match provided binding", [
      "FI-DSN-STD-015-R130",
    ]);
  }
  if (
    resumption.authorizationActId !== authorization.authorizationActId ||
    authorization.entryId !== entry.entryId ||
    authorization.consumerClassId !== binding.consumerClassId
  ) {
    reject(RESUMPTION_CODE, "Handoff resumption authorization is foreign to binding/entry", [
      "FI-DSN-STD-015-R130",
      "FI-DSN-STD-015-R132",
    ]);
  }
  // R133 — REC-02 must remain on the same posture chain the suspension paused.
  if (
    resumption.postureDeclarationActId !== posture.postureDeclarationActId ||
    posture.bindingId !== binding.bindingId ||
    posture.entryId !== entry.entryId ||
    suspension.postureDeclarationActId !== posture.postureDeclarationActId
  ) {
    reject(RESUMPTION_CODE, "Handoff resumption posture declaration is not the suspended posture chain", [
      "FI-DSN-STD-015-R130",
      "FI-DSN-STD-015-R133",
    ]);
  }
  if (
    resumption.resumedSuspensionActId !== suspension.suspensionActId ||
    suspension.bindingId !== binding.bindingId ||
    suspension.entryId !== entry.entryId
  ) {
    reject(RESUMPTION_CODE, "Handoff resumption suspension predecessor is foreign to binding/entry", [
      "FI-DSN-STD-015-R133",
    ]);
  }
  if (resumption.resumedAt.localeCompare(suspension.suspendedAt) < 0) {
    reject(RESUMPTION_CODE, "Handoff resumption predates the suspension it resumes (R134)", [
      "FI-DSN-STD-015-R134",
    ]);
  }
  if (
    !isCanonicalEstablishedHandoffGovernanceAuthorityClassId(resumption.authorityClassId) ||
    resumption.authorityGoverningSourceId !== "PD-STD-015-001" ||
    resumption.authorityConstitutionalScope !== "handoff_resumption_act"
  ) {
    reject(RESUMPTION_CODE, "Persisted Handoff resumption has forged authority or scope", [
      "FI-DSN-STD-015-R70",
      "FI-DSN-STD-015-R126",
    ]);
  }
  if (
    !isHercmResumptionCategoryId(resumption.hercmCategory) ||
    resumption.hercmQualifyingPriorState !==
      resolveHercmCategory(resumption.hercmCategory).qualifyingPriorState
  ) {
    reject(RESUMPTION_CODE, "Persisted Handoff resumption category is outside the closed REC catalog", [
      "FI-DSN-STD-015-R127",
      "FI-DSN-STD-015-R131",
    ]);
  }
  if (
    !isResumptionConstitutionalBasisKind(resumption.constitutionalBasisKind) ||
    resumption.constitutionalBasisProvenance?.basisKind !== resumption.constitutionalBasisKind ||
    resumption.constitutionalBasisProvenance?.notesCannotBeSoleBasis !== true
  ) {
    reject(RESUMPTION_CODE, "Persisted Handoff resumption constitutional basis is forged or incomplete", [
      "FI-DSN-STD-015-R131",
    ]);
  }
  if (
    resumption.declaredPostureClass != null &&
    (!isFrozenHandoffPostureClass(resumption.declaredPostureClass) ||
      resumption.declaredPostureClass !== posture.declaredPostureClass)
  ) {
    reject(RESUMPTION_CODE, "Persisted Handoff resumption posture class does not match declaration", [
      "FI-DSN-STD-015-R133",
    ]);
  }
  if (
    !isHccmConsumerClassId(resumption.consumerClassId) ||
    resumption.consumerClassId !== binding.consumerClassId
  ) {
    reject(RESUMPTION_CODE, "Persisted Handoff resumption consumer class does not match binding", [
      "FI-DSN-STD-015-R130",
    ]);
  }
  if (
    resumption.preparationId !== entry.preparationId ||
    resumption.gpraId !== entry.gpraId ||
    resumption.approvalActId !== entry.approvalActId ||
    resumption.reviewId !== entry.reviewId ||
    resumption.determinationId !== entry.determinationId ||
    resumption.rvaId !== entry.rvaId ||
    resumption.programId !== entry.programId ||
    resumption.obligationId !== entry.obligationId ||
    resumption.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    reject(RESUMPTION_CODE, "Handoff resumption lineage does not match entry subject", [
      "FI-DSN-STD-015-R130",
    ]);
  }

  const hoem = resumption.hoemResumptionRecord;
  if (
    !hoem ||
    hoem.actType !== "resumption" ||
    hoem.resumptionActId !== resumption.resumptionActId ||
    hoem.hercmCategory !== resumption.hercmCategory ||
    hoem.qualifyingPriorState !== resumption.hercmQualifyingPriorState ||
    hoem.gpraId !== resumption.gpraId ||
    hoem.obligationId !== resumption.obligationId ||
    hoem.handoffConsumerContextId !== resumption.handoffConsumerContextId ||
    hoem.bindingId !== resumption.bindingId ||
    hoem.consumerClassId !== resumption.consumerClassId ||
    hoem.authorizationActId !== resumption.authorizationActId ||
    hoem.postureDeclarationActId !== resumption.postureDeclarationActId ||
    hoem.resumedSuspensionActId !== resumption.resumedSuspensionActId ||
    hoem.constitutionalBasisKind !== resumption.constitutionalBasisKind ||
    hoem.effectiveAt !== resumption.resumedAt ||
    hoem.doesNotMergeAuthorizationAttribution !== true ||
    hoem.doesNotMergePostureDeclarationAttribution !== true ||
    hoem.doesNotMergeCompletionAttribution !== true ||
    hoem.doesNotMergeSuspensionAttribution !== true ||
    hoem.doesNotMergeWithdrawalAttribution !== true ||
    hoem.doesNotMergeRecallAttribution !== true ||
    hoem.doesNotMergeReentryAttribution !== true ||
    hoem.doesNotMergeLifecycleAttribution !== true ||
    hoem.notHgaMatrixActType !== true
  ) {
    reject(RESUMPTION_CODE, "Persisted HOEM resumption operative record is incoherent", [
      "FI-DSN-STD-015-R136",
    ]);
  }

  assertHercmHcbmKeyCoherence(RESUMPTION_CODE, resumption.consumedHcbmBoundaryKeys, binding, entry);
  assertHercmOptionalLineage(RESUMPTION_CODE, resumption, input);
}

// ---------------------------------------------------------------------------
// REC-01/03/04/05 re-entry
// ---------------------------------------------------------------------------

export function assertPersistedGovernedHandoffReentryCoherence(input: {
  reentry: GovernedHandoffReentryActRecord;
  entry: GovernedHandoffEntryRecord;
  binding: GovernedHandoffConsumerBindingRecord;
  authorization: GovernedHandoffAuthorizationActRecord;
  posture: GovernedHandoffPostureDeclarationActRecord;
  withdrawal?: GovernedHandoffWithdrawalActRecord | null;
  recall?: GovernedHandoffRecallActRecord | null;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { reentry, entry, binding, authorization, posture } = input;
  const withdrawal = input.withdrawal ?? null;
  const recall = input.recall ?? null;

  rejectForgedOrPrematureG6LifecycleActRehydration({
    purportedActType: reentry.hoemReentryRecord?.actType,
    purportedHoemActType: reentry.hoemReentryRecord?.actType,
  });

  if (reentry.entryId !== entry.entryId || binding.entryId !== entry.entryId) {
    reject(REENTRY_CODE, "Handoff re-entry entry or binding is foreign to the provided entry", [
      "FI-DSN-STD-015-R130",
    ]);
  }
  if (reentry.bindingId !== binding.bindingId) {
    reject(REENTRY_CODE, "Handoff re-entry bindingId does not match provided binding", [
      "FI-DSN-STD-015-R130",
    ]);
  }
  // R132 — the predecessor authorization is lineage only; re-entry never resurrects it.
  if (
    reentry.predecessorAuthorizationActId !== authorization.authorizationActId ||
    authorization.entryId !== entry.entryId ||
    authorization.consumerClassId !== binding.consumerClassId
  ) {
    reject(REENTRY_CODE, "Handoff re-entry predecessor authorization is foreign to binding/entry", [
      "FI-DSN-STD-015-R130",
      "FI-DSN-STD-015-R132",
    ]);
  }
  if (
    reentry.predecessorPostureDeclarationActId !== posture.postureDeclarationActId ||
    posture.bindingId !== binding.bindingId ||
    posture.entryId !== entry.entryId
  ) {
    reject(REENTRY_CODE, "Handoff re-entry predecessor posture is foreign to binding/entry", [
      "FI-DSN-STD-015-R130",
    ]);
  }
  if (
    !isCanonicalEstablishedHandoffGovernanceAuthorityClassId(reentry.authorityClassId) ||
    reentry.authorityGoverningSourceId !== "PD-STD-015-001" ||
    reentry.authorityConstitutionalScope !== "handoff_reentry_act"
  ) {
    reject(REENTRY_CODE, "Persisted Handoff re-entry has forged authority or scope", [
      "FI-DSN-STD-015-R70",
      "FI-DSN-STD-015-R126",
    ]);
  }
  if (!isHercmReentryCategoryId(reentry.hercmCategory)) {
    reject(REENTRY_CODE, "Persisted Handoff re-entry category is outside the closed REC catalog", [
      "FI-DSN-STD-015-R127",
    ]);
  }
  const category = resolveHercmCategory(reentry.hercmCategory);
  if (
    reentry.hercmQualifyingPriorState !== category.qualifyingPriorState ||
    reentry.constitutionalBasisKind !== category.basisKind ||
    reentry.requiresNewPostureAfterNewAuthorization !==
      category.requiresNewPostureAfterNewAuthorization
  ) {
    reject(REENTRY_CODE, "Persisted Handoff re-entry does not match its HERCM category conditions", [
      "FI-DSN-STD-015-R131",
      "FI-DSN-STD-015-R132",
      "FI-DSN-STD-015-R133",
    ]);
  }
  if (
    !isReentryConstitutionalBasisKind(reentry.constitutionalBasisKind) ||
    reentry.constitutionalBasisProvenance?.basisKind !== reentry.constitutionalBasisKind ||
    reentry.constitutionalBasisProvenance?.notesCannotBeSoleBasis !== true
  ) {
    reject(REENTRY_CODE, "Persisted Handoff re-entry constitutional basis is forged or incomplete", [
      "FI-DSN-STD-015-R131",
    ]);
  }

  // R131/R133 — exactly the qualifying predecessor for the category, and no borrowed one.
  if (category.categoryId === "REC-03") {
    if (reentry.predecessorWithdrawalActId == null || reentry.predecessorRecallActId != null) {
      reject(REENTRY_CODE, "REC-03 re-entry requires exactly the withdrawal predecessor", [
        "FI-DSN-STD-015-R131",
        "FI-DSN-STD-015-R133",
      ]);
    }
    if (
      withdrawal &&
      (reentry.predecessorWithdrawalActId !== withdrawal.withdrawalActId ||
        withdrawal.bindingId !== binding.bindingId ||
        withdrawal.entryId !== entry.entryId ||
        reentry.reenteredAt.localeCompare(withdrawal.withdrawnAt) < 0)
    ) {
      reject(REENTRY_CODE, "REC-03 withdrawal predecessor is foreign or later than the re-entry", [
        "FI-DSN-STD-015-R133",
        "FI-DSN-STD-015-R134",
      ]);
    }
  } else if (category.categoryId === "REC-04") {
    if (reentry.predecessorRecallActId == null || reentry.predecessorWithdrawalActId != null) {
      reject(REENTRY_CODE, "REC-04 re-entry requires exactly the recall predecessor", [
        "FI-DSN-STD-015-R131",
        "FI-DSN-STD-015-R133",
      ]);
    }
    if (
      recall &&
      (reentry.predecessorRecallActId !== recall.recallActId ||
        recall.bindingId !== binding.bindingId ||
        recall.entryId !== entry.entryId ||
        reentry.reenteredAt.localeCompare(recall.recalledAt) < 0)
    ) {
      reject(REENTRY_CODE, "REC-04 recall predecessor is foreign or later than the re-entry", [
        "FI-DSN-STD-015-R133",
        "FI-DSN-STD-015-R134",
      ]);
    }
  } else if (
    reentry.predecessorWithdrawalActId != null ||
    reentry.predecessorRecallActId != null
  ) {
    reject(
      REENTRY_CODE,
      `${category.categoryId} re-entry must not borrow a withdrawal or recall predecessor`,
      ["FI-DSN-STD-015-R131"],
    );
  }
  // Rejected is denotation-only and expiry acts remain deferred to R140+.
  if (
    reentry.predecessorRejectionAttributionId !== null ||
    reentry.predecessorExpiryActId !== null
  ) {
    reject(REENTRY_CODE, "Persisted Handoff re-entry forges a rejection or expiry act predecessor", [
      "FI-DSN-STD-015-R133",
      "FI-DSN-STD-015-R137",
    ]);
  }

  if (
    reentry.declaredPostureClass != null &&
    (!isFrozenHandoffPostureClass(reentry.declaredPostureClass) ||
      reentry.declaredPostureClass !== posture.declaredPostureClass)
  ) {
    reject(REENTRY_CODE, "Persisted Handoff re-entry posture class does not match declaration", [
      "FI-DSN-STD-015-R130",
    ]);
  }
  if (
    !isHccmConsumerClassId(reentry.consumerClassId) ||
    reentry.consumerClassId !== binding.consumerClassId
  ) {
    reject(REENTRY_CODE, "Persisted Handoff re-entry consumer class does not match binding", [
      "FI-DSN-STD-015-R130",
    ]);
  }
  if (
    reentry.preparationId !== entry.preparationId ||
    reentry.gpraId !== entry.gpraId ||
    reentry.approvalActId !== entry.approvalActId ||
    reentry.reviewId !== entry.reviewId ||
    reentry.determinationId !== entry.determinationId ||
    reentry.rvaId !== entry.rvaId ||
    reentry.programId !== entry.programId ||
    reentry.obligationId !== entry.obligationId ||
    reentry.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    reject(REENTRY_CODE, "Handoff re-entry lineage does not match entry subject", [
      "FI-DSN-STD-015-R130",
    ]);
  }

  const hoem = reentry.hoemReentryRecord;
  if (
    !hoem ||
    hoem.actType !== "reentry" ||
    hoem.reentryActId !== reentry.reentryActId ||
    hoem.hercmCategory !== reentry.hercmCategory ||
    hoem.qualifyingPriorState !== reentry.hercmQualifyingPriorState ||
    hoem.gpraId !== reentry.gpraId ||
    hoem.obligationId !== reentry.obligationId ||
    hoem.handoffConsumerContextId !== reentry.handoffConsumerContextId ||
    hoem.bindingId !== reentry.bindingId ||
    hoem.consumerClassId !== reentry.consumerClassId ||
    hoem.predecessorAuthorizationActId !== reentry.predecessorAuthorizationActId ||
    hoem.predecessorPostureDeclarationActId !== reentry.predecessorPostureDeclarationActId ||
    hoem.predecessorWithdrawalActId !== reentry.predecessorWithdrawalActId ||
    hoem.predecessorRecallActId !== reentry.predecessorRecallActId ||
    hoem.predecessorRejectionAttributionId !== null ||
    hoem.predecessorExpiryActId !== null ||
    hoem.constitutionalBasisKind !== reentry.constitutionalBasisKind ||
    hoem.effectiveAt !== reentry.reenteredAt ||
    hoem.doesNotMergeAuthorizationAttribution !== true ||
    hoem.doesNotMergePostureDeclarationAttribution !== true ||
    hoem.doesNotMergeCompletionAttribution !== true ||
    hoem.doesNotMergeSuspensionAttribution !== true ||
    hoem.doesNotMergeWithdrawalAttribution !== true ||
    hoem.doesNotMergeRecallAttribution !== true ||
    hoem.doesNotMergeResumptionAttribution !== true ||
    hoem.doesNotMergeLifecycleAttribution !== true ||
    hoem.notHgaMatrixActType !== true
  ) {
    reject(REENTRY_CODE, "Persisted HOEM re-entry operative record is incoherent", [
      "FI-DSN-STD-015-R136",
    ]);
  }

  assertHercmHcbmKeyCoherence(REENTRY_CODE, reentry.consumedHcbmBoundaryKeys, binding, entry);
  assertHercmOptionalLineage(REENTRY_CODE, reentry, input);
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

function assertHercmHcbmKeyCoherence(
  code: typeof RESUMPTION_CODE | typeof REENTRY_CODE,
  keys: readonly string[],
  binding: GovernedHandoffConsumerBindingRecord,
  entry: GovernedHandoffEntryRecord,
): void {
  if (!Array.isArray(keys) || keys.length === 0) {
    reject(code, "Persisted HERCM act requires consumed HCBM keys", [
      "FI-DSN-STD-015-R130",
    ]);
  }
  for (const key of keys) {
    if (
      !isHandoffConsumerCategoryKey(key) ||
      !binding.consumedHcbmBoundaryKeys.includes(key) ||
      !entry.consumerCategoryKeys.includes(key)
    ) {
      reject(code, "Persisted HERCM act has forged or mismatched HCBM keys", [
        "FI-DSN-STD-015-R130",
      ]);
    }
  }
}

function assertHercmOptionalLineage(
  code: typeof RESUMPTION_CODE | typeof REENTRY_CODE,
  act: {
    readonly preparationId: string;
    readonly gpraId: string;
    readonly reviewId: string;
    readonly determinationId: string;
  },
  context: {
    preparation?: GovernedHandoffPreparationRecord | null;
    gpra?: GpraGrantRecord | null;
    review?: ProductionReadinessReview | null;
    determination?: ReviewDeterminationRecord | null;
  },
): void {
  if (context.preparation && context.preparation.preparationId !== act.preparationId) {
    reject(code, "HERCM act preparation does not match", ["FI-DSN-STD-015-R130"]);
  }
  if (context.gpra && context.gpra.gpraId !== act.gpraId) {
    reject(code, "HERCM act GPRA does not match", ["FI-DSN-STD-015-R130"]);
  }
  if (context.review && context.review.reviewId !== act.reviewId) {
    reject(code, "HERCM act Review does not match", ["FI-DSN-STD-015-R130"]);
  }
  if (
    context.determination &&
    (context.determination.determinationId !== act.determinationId ||
      context.determination.reviewId !== act.reviewId)
  ) {
    reject(code, "HERCM act Determination does not match", ["FI-DSN-STD-015-R130"]);
  }
}
