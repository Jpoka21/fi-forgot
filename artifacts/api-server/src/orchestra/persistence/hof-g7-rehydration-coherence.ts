/**
 * HOF-G7 persisted Handoff evidence consumption coherence — FI-DSN-STD-015-R08–R15.
 *
 * Rehydration must reject forged consumption markers, foreign entry/prep/GPRA linkage,
 * invented evidence models, HOEM act instances, and execution/authorization claims.
 * Does not mutate constitutional history. Does not create HOEM acts or perform R16+.
 */

import {
  DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES,
  HANDOFF_EVIDENCE_MODELS,
  isDeferredHoemOperativeRecordClass,
  isHandoffEvidenceModelId,
} from "../handoff-evidence-consumption.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import type {
  GovernedHandoffEntryRecord,
  GovernedHandoffEvidenceConsumptionRecord,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffEvidenceConsumptionCoherence(input: {
  consumption: GovernedHandoffEvidenceConsumptionRecord;
  entry: GovernedHandoffEntryRecord;
  preparation: GovernedHandoffPreparationRecord;
  gpra: GpraGrantRecord;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { consumption, entry, preparation, gpra } = input;

  if (consumption.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption entryId does not match provided entry",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R14"],
    );
  }
  if (consumption.preparationId !== preparation.preparationId) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption preparationId does not match provided preparation",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R09", "FI-DSN-STD-015-R14"],
    );
  }
  if (entry.preparationId !== preparation.preparationId) {
    throw new OrchestraConstitutionalError(
      "Handoff entry preparationId does not match provided preparation for consumption coherence",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R14"],
    );
  }

  if (
    consumption.factualInputsToConsiderationOnly !== true ||
    consumption.notHandoffAuthorization !== true ||
    consumption.notHandoffExecution !== true ||
    consumption.notHandoffPostureDeclaration !== true ||
    consumption.notEvidenceOfHandoffAuthorization !== true ||
    consumption.notEvidenceOfHandoffPostureDeclaration !== true ||
    consumption.doesNotElevateAdvisoryToConstitutionalFact !== true ||
    consumption.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    consumption.hoemFrameworkOnly !== true ||
    consumption.doesNotCreateOperativeHandoffActRecords !== true ||
    consumption.fourModelsPeerDistinct !== true ||
    consumption.upstreamFreshnessAtConsumption !== "current" ||
    consumption.hepmReferencesAvailable !== true ||
    consumption.hvemFactsCurrent !== true ||
    consumption.r08FourPeerDistinctEvidenceModels !== true ||
    consumption.r09HepmReadOnlyConsumption !== true ||
    consumption.r10HvemEvaluationPointConsumption !== true ||
    consumption.r11HoemFrameworkOnly !== true ||
    consumption.r12AdvisoryNonbinding !== true ||
    consumption.r13EligibilityNotAuthorization !== true ||
    consumption.r14UpstreamFreshnessRequired !== true ||
    consumption.r15NoInventedConstitutionalQueueOrSchema !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption must carry HOF-G7 non-authorization / framework-only markers (R08–R15)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R08", "FI-DSN-STD-015-R11", "FI-DSN-STD-015-R13", "FI-DSN-STD-015-R15"],
    );
  }

  if (
    !Array.isArray(consumption.evidenceModelsPreserved) ||
    consumption.evidenceModelsPreserved.length !== HANDOFF_EVIDENCE_MODELS.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption evidenceModelsPreserved catalog incomplete (R08)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R08"],
    );
  }
  for (const model of consumption.evidenceModelsPreserved) {
    if (!isHandoffEvidenceModelId(model)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff evidence consumption has forged evidence model id",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R08"],
      );
    }
  }

  if (
    !Array.isArray(consumption.deferredHoemOperativeRecordClasses) ||
    consumption.deferredHoemOperativeRecordClasses.length !==
      DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption deferredHoemOperativeRecordClasses catalog incomplete (R11)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R11"],
    );
  }
  for (const cls of consumption.deferredHoemOperativeRecordClasses) {
    if (!isDeferredHoemOperativeRecordClass(cls)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff evidence consumption has forged deferred HOEM operative record class",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R11"],
      );
    }
  }

  if (
    consumption.gpraId !== gpra.gpraId ||
    consumption.gpraId !== entry.gpraId ||
    consumption.gpraId !== preparation.gpraId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption GPRA identity does not match entry / preparation / provided GPRA grant",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R14"],
    );
  }

  if (
    consumption.approvalActId !== entry.approvalActId ||
    consumption.reviewId !== entry.reviewId ||
    consumption.determinationId !== entry.determinationId ||
    consumption.rvaId !== entry.rvaId ||
    consumption.programId !== entry.programId ||
    consumption.obligationId !== entry.obligationId ||
    consumption.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption lineage does not match entry subject",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R14"],
    );
  }

  if (
    consumption.approvalActId !== preparation.approvalActId ||
    consumption.reviewId !== preparation.reviewId ||
    consumption.determinationId !== preparation.determinationId ||
    consumption.rvaId !== preparation.rvaId ||
    consumption.programId !== preparation.programId ||
    consumption.obligationId !== preparation.obligationId ||
    consumption.handoffConsumerContextId !== preparation.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption lineage does not match preparation subject",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R09", "FI-DSN-STD-015-R14"],
    );
  }

  if (
    consumption.approvalActId !== gpra.approvalActId ||
    consumption.reviewId !== gpra.reviewId ||
    consumption.determinationId !== gpra.determinationId ||
    consumption.rvaId !== gpra.rvaId ||
    consumption.programId !== gpra.programId ||
    consumption.obligationId !== gpra.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption lineage does not match GPRA grant subject",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R14"],
    );
  }

  // R09 HEPM refs must match preparation evidence package (read-only freeze).
  const hepm = consumption.hepmRefs;
  const prepHepm = preparation.evidencePackage;
  if (
    hepm.gpraId !== prepHepm.gpraId ||
    hepm.rvaId !== prepHepm.rvaId ||
    hepm.determinationId !== prepHepm.determinationId ||
    hepm.approvalActId !== prepHepm.approvalActId ||
    hepm.obligationId !== prepHepm.obligationId ||
    hepm.handoffConsumerContextId !== prepHepm.handoffConsumerContextId ||
    hepm.posture !== prepHepm.posture
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption HEPM refs do not match preparation evidence package (R09)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R09"],
    );
  }

  // R10 HVEM snapshot / evaluation-point must match preparation validity export.
  const hvem = consumption.hvemSnapshot;
  const prepHvem = preparation.validityExport;
  if (
    hvem.authoritativeGpraId !== prepHvem.authoritativeGpraId ||
    hvem.gpraGrantRef !== prepHvem.gpraGrantRef ||
    hvem.approvalActId !== prepHvem.approvalActId ||
    hvem.evaluationPoint.gpraId !== prepHvem.evaluationPoint.gpraId ||
    hvem.evaluationPoint.posture !== prepHvem.evaluationPoint.posture ||
    hvem.evaluationPoint.obligationId !== prepHvem.evaluationPoint.obligationId ||
    hvem.evaluationPoint.handoffConsumerContextId !==
      prepHvem.evaluationPoint.handoffConsumerContextId ||
    consumption.hvemEvaluationPoint.gpraId !== prepHvem.evaluationPoint.gpraId ||
    consumption.hvemEvaluationPoint.posture !== prepHvem.evaluationPoint.posture ||
    consumption.hvemEvaluationPoint.obligationId !== prepHvem.evaluationPoint.obligationId ||
    consumption.hvemEvaluationPoint.handoffConsumerContextId !==
      prepHvem.evaluationPoint.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption HVEM snapshot/evaluation-point does not match preparation (R10)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R10"],
    );
  }

  if (
    !Array.isArray(consumption.consumerCategoryKeys) ||
    consumption.consumerCategoryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires nonempty consumerCategoryKeys from entry",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R13"],
    );
  }
  if (consumption.consumerCategoryKeys.length !== entry.consumerCategoryKeys.length) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption consumerCategoryKeys must equal entry keys",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R13", "FI-DSN-STD-015-R15"],
    );
  }
  for (let i = 0; i < consumption.consumerCategoryKeys.length; i++) {
    const key = consumption.consumerCategoryKeys[i]!;
    if (!isHandoffConsumerCategoryKey(key) || key !== entry.consumerCategoryKeys[i]) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff evidence consumption has forged or mismatched consumer category key",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R13", "FI-DSN-STD-015-R15"],
      );
    }
  }

  if (input.review) {
    if (input.review.reviewId !== consumption.reviewId) {
      throw new OrchestraConstitutionalError(
        "Handoff evidence consumption reviewId does not match provided Review",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R14"],
      );
    }
    if (
      input.review.programId !== consumption.programId ||
      input.review.obligationId !== consumption.obligationId ||
      input.review.rvaId !== consumption.rvaId
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff evidence consumption Program/Obligation/RVA does not match Review lineage",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R14"],
      );
    }
  }

  if (input.determination) {
    if (
      input.determination.determinationId !== consumption.determinationId ||
      input.determination.reviewId !== consumption.reviewId
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff evidence consumption Determination does not match Review lineage",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R14"],
      );
    }
  }

  // R11 / R16 boundary — reject HOEM act / G10 preservation / queue fields if present.
  const raw = consumption as unknown as Record<string, unknown>;
  const forbidden = [
    "handoffActId",
    "handoffAuthorized",
    "handoffAuthorizationActId",
    "postureDeclarationActId",
    "completionActId",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "hoemEvidenceId",
    "hoemOperativeEvidenceId",
    "hoemAuthorizationRecordId",
    "preservationActId",
    "hofG10PreservationActId",
    "executionQueueId",
    "constitutionalQueueId",
    "hoemOperativeActRecords",
    "hoemActInstances",
  ];
  for (const key of forbidden) {
    const value = raw[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff evidence consumption must not carry HOEM act / G10 preservation / queue fields (R11/R15; R16+ deferred)",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R11", "FI-DSN-STD-015-R15"],
      );
    }
  }
}
