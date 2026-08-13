/**
 * HOF-G2 persisted Handoff authorization coherence — FI-DSN-STD-015-R25–R32.
 *
 * Rehydration must reject forged HGA, foreign entry/consumption/GPRA lineage,
 * peer-class collapse claims, and posture/execution claims.
 * Does not mutate upstream history. Does not create posture/completion/recall acts.
 */

import { isCanonicalEstablishedHandoffGovernanceAuthorityClassId } from "../handoff-governance-authority.js";
import { isHccmConsumerClassId, resolveHccmConsumerClass } from "../hccm-consumer-classes.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import type {
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffEvidenceConsumptionRecord,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffAuthorizationCoherence(input: {
  act: GovernedHandoffAuthorizationActRecord;
  entry: GovernedHandoffEntryRecord;
  consumption: GovernedHandoffEvidenceConsumptionRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { act, entry, consumption } = input;

  if (act.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization entryId does not match provided entry",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }
  if (act.evidenceConsumptionId !== consumption.consumptionId) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization evidenceConsumptionId does not match provided consumption",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }
  if (consumption.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption does not belong to provided entry for authorization coherence",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }

  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(act.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization must carry established HGA authority class (R25)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25", "FI-DSN-STD-015-R32"],
    );
  }
  if (act.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization must cite PD-STD-015-001 as HGA governing source",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25"],
    );
  }

  if (
    act.notHandoffPostureDeclaration !== true ||
    act.notHandoffExecution !== true ||
    act.notHandoffCompletion !== true ||
    act.notHandoffSuspension !== true ||
    act.notHandoffRecall !== true ||
    act.notHandoffWithdrawal !== true ||
    act.notDownstreamAcceptance !== true ||
    act.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    act.doesNotCollapsePeerDecisionClasses !== true ||
    act.doesNotSubstituteGpraOrEligibilityOrAdvisory !== true ||
    act.r25HgaSoleAuthorizationOwner !== true ||
    act.r26PeerDistinctAuthorizationClass !== true ||
    act.r27NoSubstituteInputs !== true ||
    act.r28BoundHccmConsumerContext !== true ||
    act.r29HoemAuthorizationOperativeRecord !== true ||
    act.r30NoImplicitAuthorization !== true ||
    act.r31PrerequisiteGated !== true ||
    act.r32HaamProhibitedPerformersExcluded !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization must carry HOF-G2 peer-distinct / non-execution markers (R25–R32)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R26", "FI-DSN-STD-015-R29"],
    );
  }

  if (!isHccmConsumerClassId(act.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization has forged HCCM consumer class",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R28"],
    );
  }
  const catalog = resolveHccmConsumerClass(act.consumerClassId);
  if (
    !Array.isArray(act.consumedHcbmBoundaryKeys) ||
    act.consumedHcbmBoundaryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization requires nonempty consumed HCBM boundary keys (R28)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R28"],
    );
  }
  for (const key of act.consumedHcbmBoundaryKeys) {
    if (
      !isHandoffConsumerCategoryKey(key) ||
      !(catalog.hcbmBoundaryKeys as readonly string[]).includes(key) ||
      !entry.consumerCategoryKeys.includes(key)
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff authorization has forged or mismatched HCBM boundary keys for bound context (R28)",
        "invalid_handoff_authorization",
        ["FI-DSN-STD-015-R28"],
      );
    }
  }

  if (
    act.preparationId !== entry.preparationId ||
    act.gpraId !== entry.gpraId ||
    act.approvalActId !== entry.approvalActId ||
    act.reviewId !== entry.reviewId ||
    act.determinationId !== entry.determinationId ||
    act.rvaId !== entry.rvaId ||
    act.programId !== entry.programId ||
    act.obligationId !== entry.obligationId ||
    act.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization lineage does not match entry subject",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }

  if (
    act.preparationId !== consumption.preparationId ||
    act.gpraId !== consumption.gpraId ||
    act.obligationId !== consumption.obligationId ||
    act.handoffConsumerContextId !== consumption.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization lineage does not match consumption subject",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }

  const hoem = act.hoemAuthorizationRecord;
  if (
    !hoem ||
    hoem.actType !== "authorization" ||
    hoem.authorizationActId !== act.authorizationActId ||
    hoem.gpraId !== act.gpraId ||
    hoem.obligationId !== act.obligationId ||
    hoem.handoffConsumerContextId !== act.handoffConsumerContextId ||
    hoem.consumerClassId !== act.consumerClassId ||
    hoem.doesNotMergePostureDeclarationAttribution !== true ||
    hoem.doesNotMergeCompletionAttribution !== true ||
    hoem.doesNotMergeSuspensionAttribution !== true ||
    hoem.doesNotMergeWithdrawalAttribution !== true ||
    hoem.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HOEM authorization operative record must be peer-distinct and bound to authorization act (R29)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R29"],
    );
  }

  if (input.preparation && input.preparation.preparationId !== act.preparationId) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization preparationId does not match provided preparation",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }
  if (input.gpra && input.gpra.gpraId !== act.gpraId) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization GPRA identity does not match provided GPRA grant",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }
  if (input.review && input.review.reviewId !== act.reviewId) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization reviewId does not match provided Review",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }
  if (
    input.determination &&
    (input.determination.determinationId !== act.determinationId ||
      input.determination.reviewId !== act.reviewId)
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization Determination does not match Review lineage",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }

  const raw = act as unknown as Record<string, unknown>;
  const forbidden = [
    "handoffPosture",
    "postureDeclarationActId",
    "completionActId",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "executesHandoff",
    "handoffExecuted",
    "executionQueueId",
    "brainAuthorizesHandoff",
    "implicitAuthorization",
  ];
  for (const key of forbidden) {
    const value = raw[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff authorization must not carry posture/execution/implicit fields (R26/R30)",
        "invalid_handoff_authorization",
        ["FI-DSN-STD-015-R26", "FI-DSN-STD-015-R30"],
      );
    }
  }
}
