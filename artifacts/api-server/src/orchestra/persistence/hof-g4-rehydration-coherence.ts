/**
 * HOF-G4 persisted Handoff posture declaration coherence — FI-DSN-STD-015-R40–R47.
 *
 * Rehydration must reject forged posture class/authority, foreign binding/entry/GPRA lineage,
 * authorization/completion/execution collapse claims. Does not mutate upstream history.
 */

import { isHccmConsumerClassId, resolveHccmConsumerClass } from "../hccm-consumer-classes.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import { isFrozenHandoffPostureClass } from "../handoff-posture-declaration.js";
import { isCanonicalEstablishedHandoffGovernanceAuthorityClassId } from "../handoff-governance-authority.js";
import type {
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffPostureDeclarationCoherence(input: {
  declaration: GovernedHandoffPostureDeclarationActRecord;
  entry: GovernedHandoffEntryRecord;
  binding: GovernedHandoffConsumerBindingRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { declaration, entry, binding } = input;

  if (declaration.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration entryId does not match provided entry",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43", "FI-DSN-STD-015-R47"],
    );
  }
  if (declaration.bindingId !== binding.bindingId) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration bindingId does not match provided binding",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }
  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration binding is foreign to entry",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }

  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(declaration.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration has forged posture authority class (R40)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40", "FI-DSN-STD-015-R47"],
    );
  }
  if (declaration.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration authority governing source must be PD-STD-015-001 (R40)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40"],
    );
  }
  if (declaration.authorityConstitutionalScope !== "handoff_posture_declaration_act") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration must use handoff_posture_declaration_act scope (R40/R45)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40", "FI-DSN-STD-015-R45"],
    );
  }

  if (!isFrozenHandoffPostureClass(declaration.declaredPostureClass)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration has forged posture class (R46/R47)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R46", "FI-DSN-STD-015-R47"],
    );
  }
  if (declaration.declaredPostureClass !== binding.postureClassAffinity) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration class does not match binding posture-class affinity (R43/R46)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43", "FI-DSN-STD-015-R46"],
    );
  }
  if (declaration.postureClassAffinity !== binding.postureClassAffinity) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration affinity metadata does not match binding (R43)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }

  if (!isHccmConsumerClassId(declaration.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration has forged consumer class (R43)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }
  if (declaration.consumerClassId !== binding.consumerClassId) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration consumer class does not match binding (R43)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }
  const catalog = resolveHccmConsumerClass(declaration.consumerClassId);
  if (declaration.declaredPostureClass !== catalog.postureClassAffinity) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration class does not match HCCM catalog affinity (R46)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R46"],
    );
  }

  if (
    declaration.preparationId !== entry.preparationId ||
    declaration.gpraId !== entry.gpraId ||
    declaration.approvalActId !== entry.approvalActId ||
    declaration.reviewId !== entry.reviewId ||
    declaration.determinationId !== entry.determinationId ||
    declaration.rvaId !== entry.rvaId ||
    declaration.programId !== entry.programId ||
    declaration.obligationId !== entry.obligationId ||
    declaration.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration lineage does not match entry subject (R43/R47)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43", "FI-DSN-STD-015-R47"],
    );
  }

  if (
    binding.gpraId !== declaration.gpraId ||
    binding.obligationId !== declaration.obligationId ||
    binding.handoffConsumerContextId !== declaration.handoffConsumerContextId ||
    binding.programId !== declaration.programId ||
    binding.rvaId !== declaration.rvaId ||
    binding.reviewId !== declaration.reviewId ||
    binding.determinationId !== declaration.determinationId ||
    binding.approvalActId !== declaration.approvalActId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration bound context does not match binding tuple (R43)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }

  if (
    !Array.isArray(declaration.consumedHcbmBoundaryKeys) ||
    declaration.consumedHcbmBoundaryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires nonempty consumed HCBM keys (R43)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }
  for (const key of declaration.consumedHcbmBoundaryKeys) {
    if (
      !isHandoffConsumerCategoryKey(key) ||
      !binding.consumedHcbmBoundaryKeys.includes(key) ||
      !entry.consumerCategoryKeys.includes(key)
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff posture declaration has forged or mismatched HCBM keys (R43)",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R43"],
      );
    }
  }

  const hoem = declaration.hoemPostureDeclarationRecord;
  if (
    !hoem ||
    hoem.actType !== "posture_declaration" ||
    hoem.postureDeclarationActId !== declaration.postureDeclarationActId ||
    hoem.gpraId !== declaration.gpraId ||
    hoem.obligationId !== declaration.obligationId ||
    hoem.handoffConsumerContextId !== declaration.handoffConsumerContextId ||
    hoem.bindingId !== declaration.bindingId ||
    hoem.consumerClassId !== declaration.consumerClassId ||
    hoem.declaredPostureClass !== declaration.declaredPostureClass ||
    hoem.doesNotMergeAuthorizationAttribution !== true ||
    hoem.doesNotMergeCompletionAttribution !== true ||
    hoem.doesNotMergeSuspensionAttribution !== true ||
    hoem.doesNotMergeWithdrawalAttribution !== true ||
    hoem.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HOEM posture declaration operative record is incoherent or merges peer act types (R45)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R45"],
    );
  }

  if (
    declaration.notHandoffAuthorization !== true ||
    declaration.notHandoffExecution !== true ||
    declaration.notHandoffCompletion !== true ||
    declaration.notHandoffSuspension !== true ||
    declaration.notHandoffRecall !== true ||
    declaration.notHandoffWithdrawal !== true ||
    declaration.notDownstreamAcceptance !== true ||
    declaration.notPermanentCollectionMembership !== true ||
    declaration.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    declaration.doesNotCollapsePeerDecisionClasses !== true ||
    declaration.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    declaration.doesNotMergeAcrossConsumerClasses !== true ||
    declaration.r40HgaSolePostureOwner !== true ||
    declaration.r41PeerDistinctPostureClass !== true ||
    declaration.r42NoSubstituteInputs !== true ||
    declaration.r43BoundHccmConsumerContext !== true ||
    declaration.r44NotAuthorizationSubstitute !== true ||
    declaration.r45HoemPostureDeclarationOperativeRecord !== true ||
    declaration.r46HppmAuthoritativeCardinality !== true ||
    declaration.r47NoImplicitPostureEntryGated !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration must carry HOF-G4 peer-distinct / non-execution markers (R40–R47)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R41", "FI-DSN-STD-015-R44"],
    );
  }

  if (input.preparation && input.preparation.preparationId !== declaration.preparationId) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration preparationId does not match provided preparation",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R47"],
    );
  }
  if (input.gpra && input.gpra.gpraId !== declaration.gpraId) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration GPRA identity does not match provided GPRA grant",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }
  if (input.review && input.review.reviewId !== declaration.reviewId) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration reviewId does not match provided Review",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R47"],
    );
  }
  if (
    input.determination &&
    (input.determination.determinationId !== declaration.determinationId ||
      input.determination.reviewId !== declaration.reviewId)
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration Determination does not match Review lineage",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R47"],
    );
  }

  const raw = declaration as unknown as Record<string, unknown>;
  const forbidden = [
    "completionActId",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "executesHandoff",
    "executionQueueId",
    "downstreamAcceptanceId",
    "permanentCollectionMembershipId",
    "brainDeclareHandoffPosture",
    "implicitPosture",
    "unifiedCc01Cc02Posture",
    "mergedCrossCcPosture",
    "authorizationActId",
  ];
  for (const key of forbidden) {
    const value = raw[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff posture declaration must not carry authorization/completion/execution fields (R41/R44)",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R41", "FI-DSN-STD-015-R44"],
      );
    }
  }
}
