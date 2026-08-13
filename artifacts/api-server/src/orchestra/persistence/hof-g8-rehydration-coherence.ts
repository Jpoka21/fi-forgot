/**
 * HOF-G8 persisted downstream exit-boundary coherence — FI-DSN-STD-015-R58–R65.
 *
 * Rehydration must reject forged authority, invented HGA matrix exit scopes, wrong domain,
 * foreign binding/posture/completion, acceptance/membership/mfg fields, and rejection-act fields.
 * Does not mutate upstream history.
 */

import { isHccmConsumerClassId, resolveHccmConsumerClass } from "../hccm-consumer-classes.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import { isCanonicalEstablishedHandoffGovernanceAuthorityClassId } from "../handoff-governance-authority.js";
import {
  DOWNSTREAM_EXIT_BOUNDARY_ATTRIBUTION_KIND,
  HOEM_EXIT_BOUNDARY_ACT_TYPE,
} from "../handoff-downstream-exit-boundary.js";
import type {
  GovernedHandoffCompletionActRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffDownstreamExitBoundaryAttributionRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffDownstreamExitBoundaryCoherence(input: {
  attribution: GovernedHandoffDownstreamExitBoundaryAttributionRecord;
  entry: GovernedHandoffEntryRecord;
  binding: GovernedHandoffConsumerBindingRecord;
  posture: GovernedHandoffPostureDeclarationActRecord;
  completion: GovernedHandoffCompletionActRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { attribution, entry, binding, posture, completion } = input;

  if (attribution.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary entryId does not match provided entry",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
    );
  }
  if (attribution.bindingId !== binding.bindingId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary bindingId does not match provided binding",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
    );
  }
  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary binding is foreign to entry",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
    );
  }
  if (
    attribution.postureDeclarationActId !== posture.postureDeclarationActId ||
    posture.bindingId !== binding.bindingId ||
    posture.entryId !== entry.entryId
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary posture declaration is foreign to binding/entry (R64)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R64"],
    );
  }
  if (
    attribution.completionActId !== completion.completionActId ||
    completion.bindingId !== binding.bindingId ||
    completion.entryId !== entry.entryId ||
    completion.postureDeclarationActId !== posture.postureDeclarationActId
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary completion is foreign to binding/entry/posture (R60/R64)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R60", "FI-DSN-STD-015-R64"],
    );
  }

  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(attribution.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary has forged HGA authority class (R58)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R65"],
    );
  }
  if (attribution.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary authority governing source must be PD-STD-015-001 (R58)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58"],
    );
  }
  if (
    attribution.attributionKind !== DOWNSTREAM_EXIT_BOUNDARY_ATTRIBUTION_KIND ||
    attribution.constitutionalArtifactKind !== DOWNSTREAM_EXIT_BOUNDARY_ATTRIBUTION_KIND
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary must use downstream_exit_boundary_attribution kind (not an HGA matrix act) (R58/R63)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R63"],
    );
  }

  if (!isHccmConsumerClassId(attribution.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary has forged consumer class (R61)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61"],
    );
  }
  if (attribution.consumerClassId !== binding.consumerClassId) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary consumer class does not match binding (R61/R62)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
    );
  }

  const catalog = resolveHccmConsumerClass(attribution.consumerClassId);
  if (attribution.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary domain does not match HCCM catalog (R61/R62)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
    );
  }
  if (binding.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain) {
    throw new OrchestraConstitutionalError(
      "Binding downstream consideration domain does not match catalog for exit boundary (R61)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61"],
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
      "Downstream exit boundary lineage does not match entry subject (R62)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R62"],
    );
  }

  const hoem = attribution.hoemExitBoundaryRecord;
  if (
    !hoem ||
    hoem.actType !== HOEM_EXIT_BOUNDARY_ACT_TYPE ||
    hoem.exitBoundaryAttributionId !== attribution.exitBoundaryAttributionId ||
    hoem.gpraId !== attribution.gpraId ||
    hoem.obligationId !== attribution.obligationId ||
    hoem.handoffConsumerContextId !== attribution.handoffConsumerContextId ||
    hoem.bindingId !== attribution.bindingId ||
    hoem.consumerClassId !== attribution.consumerClassId ||
    hoem.postureDeclarationActId !== attribution.postureDeclarationActId ||
    hoem.completionActId !== attribution.completionActId ||
    hoem.downstreamConsiderationDomain !== attribution.downstreamConsiderationDomain ||
    hoem.doesNotPrescribeIntakeWorkflow !== true ||
    hoem.doesNotPrescribeAcceptanceMechanics !== true ||
    hoem.doesNotPrescribeRoutingMechanics !== true ||
    hoem.doesNotPrescribeStorageMechanics !== true ||
    hoem.doesNotPrescribeNotificationMechanics !== true ||
    hoem.doesNotMergeAuthorizationAttribution !== true ||
    hoem.doesNotMergePostureDeclarationAttribution !== true ||
    hoem.doesNotMergeCompletionAttribution !== true ||
    hoem.doesNotMergeLifecycleAttribution !== true ||
    hoem.doesNotMergeSuspensionAttribution !== true ||
    hoem.doesNotMergeWithdrawalAttribution !== true ||
    hoem.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HOEM exit-boundary record is incoherent or merges peer act types / prescribes mechanics (R64)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R64"],
    );
  }

  if (
    attribution.notHgaMatrixActType !== true ||
    attribution.notHandoffCompletionAct !== true ||
    attribution.notDownstreamAcceptance !== true ||
    attribution.notMembershipAdmission !== true ||
    attribution.notManufacturingOrFulfillmentOrExecution !== true ||
    attribution.notExitCompletenessSatisfaction !== true ||
    attribution.exitCompletenessDeferred !== true ||
    attribution.notHandoffAuthorization !== true ||
    attribution.notHandoffPostureDeclaration !== true ||
    attribution.notHandoffSuspension !== true ||
    attribution.notHandoffRecall !== true ||
    attribution.notHandoffWithdrawal !== true ||
    attribution.doesNotCollapsePeerDecisionClasses !== true ||
    attribution.doesNotMergeAcrossConsumerClasses !== true ||
    attribution.r58Volume06Terminus !== true ||
    attribution.r59BoundedExportDenotation !== true ||
    attribution.r60CompletedEnablesConsiderationOnly !== true ||
    attribution.r61SingleBindingRouting !== true ||
    attribution.r62TupleConsistency !== true ||
    attribution.r63PeerDistinctExitBoundary !== true ||
    attribution.r64HoemExitBoundaryLinkage !== true ||
    attribution.r65NoImplicitExit !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary must carry HOF-G8 peer-distinct / non-execution markers (R58–R65)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R63", "FI-DSN-STD-015-R65"],
    );
  }

  if (
    !Array.isArray(attribution.consumedHcbmBoundaryKeys) ||
    attribution.consumedHcbmBoundaryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary requires nonempty consumed HCBM keys (R62)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R62"],
    );
  }
  for (const key of attribution.consumedHcbmBoundaryKeys) {
    if (
      !isHandoffConsumerCategoryKey(key) ||
      !binding.consumedHcbmBoundaryKeys.includes(key) ||
      !catalog.hcbmBoundaryKeys.includes(key)
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted downstream exit boundary has forged or mismatched HCBM keys (R62)",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R62"],
      );
    }
  }

  if (input.preparation && input.preparation.preparationId !== attribution.preparationId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary preparationId does not match provided preparation",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R62"],
    );
  }
  if (input.gpra && input.gpra.gpraId !== attribution.gpraId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary GPRA identity does not match provided GPRA grant",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R62"],
    );
  }
  if (input.review && input.review.reviewId !== attribution.reviewId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary reviewId does not match provided Review",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R62"],
    );
  }
  if (
    input.determination &&
    (input.determination.determinationId !== attribution.determinationId ||
      input.determination.reviewId !== attribution.reviewId)
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary Determination does not match Review lineage",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R62"],
    );
  }

  const raw = attribution as unknown as Record<string, unknown>;
  const forbidden = [
    "authorityConstitutionalScope",
    "handoff_downstream_exit_act",
    "handoff_lifecycle_rejection_act",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "executesHandoff",
    "executionQueueId",
    "downstreamAcceptanceId",
    "permanentCollectionMembershipId",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
    "exitCompletenessSatisfactionId",
    "brainExit",
    "implicitExit",
    "rejectHandoffActLayer",
  ];
  for (const key of forbidden) {
    const value = raw[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted downstream exit boundary must not carry acceptance/mfg/rejection/matrix-exit-scope fields (R58/R63/R65)",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R63", "FI-DSN-STD-015-R65"],
      );
    }
  }
}
