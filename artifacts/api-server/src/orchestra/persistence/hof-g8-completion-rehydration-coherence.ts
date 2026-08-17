/**
 * HOF-G8 completion persisted exit-completeness coherence — FI-DSN-STD-015-R142–R145.
 *
 * Rehydration must reject forged matrix-exit scopes, foreign binding/completion/posture/
 * exit-boundary, acceptance/membership/mfg fields, and invented HSLM/HGA types.
 * Does not mutate upstream history, including the required R58–R65 exit-boundary record.
 */

import { isHccmConsumerClassId, resolveHccmConsumerClass } from "../hccm-consumer-classes.js";
import { isCanonicalEstablishedHandoffGovernanceAuthorityClassId } from "../handoff-governance-authority.js";
import {
  DOWNSTREAM_EXIT_COMPLETENESS_SATISFACTION_KIND,
  EXIT_COMPLETENESS_SATISFACTION_EVIDENCE_CATEGORIES,
} from "../handoff-downstream-exit-completeness.js";
import { HOEM_EXIT_BOUNDARY_ACT_TYPE } from "../handoff-downstream-exit-boundary.js";
import type {
  GovernedHandoffCompletionActRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffDownstreamExitBoundaryAttributionRecord,
  GovernedHandoffDownstreamExitCompletenessSatisfactionRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffDownstreamExitCompletenessCoherence(input: {
  satisfaction: GovernedHandoffDownstreamExitCompletenessSatisfactionRecord;
  entry: GovernedHandoffEntryRecord;
  binding: GovernedHandoffConsumerBindingRecord;
  posture: GovernedHandoffPostureDeclarationActRecord;
  completion: GovernedHandoffCompletionActRecord;
  exitBoundary: GovernedHandoffDownstreamExitBoundaryAttributionRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { satisfaction, entry, binding, posture, completion, exitBoundary } = input;

  if (satisfaction.constitutionalArtifactKind !== DOWNSTREAM_EXIT_COMPLETENESS_SATISFACTION_KIND) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness artifact kind is required (R142)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R142"],
    );
  }
  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(satisfaction.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness requires established HGA class (R142)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R142"],
    );
  }
  if (satisfaction.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness entryId does not match provided entry",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143"],
    );
  }
  if (satisfaction.bindingId !== binding.bindingId || binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness binding is foreign to entry",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143", "FI-DSN-STD-015-R145"],
    );
  }
  if (
    satisfaction.postureDeclarationActId !== posture.postureDeclarationActId ||
    posture.bindingId !== binding.bindingId
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness posture is foreign to binding (R143)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143"],
    );
  }
  if (
    satisfaction.completionActId !== completion.completionActId ||
    completion.bindingId !== binding.bindingId
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness Completion is foreign to binding (R143)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143"],
    );
  }
  if (
    satisfaction.exitBoundaryAttributionId !== exitBoundary.exitBoundaryAttributionId ||
    exitBoundary.bindingId !== binding.bindingId
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness requires the matching R58–R65 exit-boundary attribution (R143)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143", "FI-DSN-STD-015-R64"],
    );
  }
  if (!isHccmConsumerClassId(satisfaction.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness consumer class is not in the frozen HCCM catalog (R145)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R145"],
    );
  }
  const catalog = resolveHccmConsumerClass(satisfaction.consumerClassId);
  if (satisfaction.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness domain does not match frozen catalog routing (R145)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R145"],
    );
  }
  if (
    satisfaction.hoemExitBoundaryRecord.hoemExitBoundaryRecordId !==
      exitBoundary.hoemExitBoundaryRecord.hoemExitBoundaryRecordId ||
    satisfaction.hoemExitBoundaryRecord.actType !== HOEM_EXIT_BOUNDARY_ACT_TYPE
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness must carry the existing R64 HOEM exit_boundary linkage (R144)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R144", "FI-DSN-STD-015-R64"],
    );
  }
  const categories = satisfaction.satisfactionEvidence.categories;
  if (
    categories.length !== EXIT_COMPLETENESS_SATISFACTION_EVIDENCE_CATEGORIES.length ||
    EXIT_COMPLETENESS_SATISFACTION_EVIDENCE_CATEGORIES.some((c) => !categories.includes(c))
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness evidence categories must be the closed R143 set (R143/R145)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143", "FI-DSN-STD-015-R145"],
    );
  }
  if (input.gpra && input.gpra.gpraId !== satisfaction.gpraId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness GPRA identity does not match provided GPRA grant",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143"],
    );
  }
  if (input.review && input.review.reviewId !== satisfaction.reviewId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness reviewId does not match provided Review",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143"],
    );
  }
  if (
    input.determination &&
    (input.determination.determinationId !== satisfaction.determinationId ||
      input.determination.reviewId !== satisfaction.reviewId)
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness Determination does not match Review lineage",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143"],
    );
  }
  if (input.preparation && input.preparation.preparationId !== satisfaction.preparationId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness preparationId does not match provided preparation",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143"],
    );
  }

  const raw = satisfaction as unknown as Record<string, unknown>;
  const forbidden = [
    "authorityConstitutionalScope",
    "handoff_exit_completeness_act",
    "handoff_exit_act",
    "handoff_downstream_exit_act",
    "handoff_lifecycle_rejection_act",
    "executesHandoff",
    "executionQueueId",
    "downstreamAcceptanceId",
    "permanentCollectionMembershipId",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
    "brainExitCompleteness",
    "booleanComplete",
  ];
  for (const key of forbidden) {
    const value = raw[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted downstream exit completeness must not carry acceptance/mfg/matrix-exit-scope fields (R142/R144)",
        "invalid_handoff_downstream_exit_completeness",
        ["FI-DSN-STD-015-R142", "FI-DSN-STD-015-R144"],
      );
    }
  }
}
