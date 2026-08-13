/**
 * HOF-G10 persisted Handoff preservation audit coherence — FI-DSN-STD-015-R16–R21.
 *
 * Rehydration must reject forged preservation markers, foreign entry/consumption/GPRA
 * linkage, HOEM act instances, erase/redact/overwrite claims, and authority-restore claims.
 * Does not mutate constitutional history. Does not create HOEM operative acts or perform R22+.
 */

import {
  DEFERRED_OPERATIVE_AUDIT_CLASSES,
  isDeferredOperativeAuditClass,
} from "../handoff-preservation-audit.js";
import { isHandoffConsumerCategoryKey } from "../handoff-preparation.js";
import type {
  GovernedHandoffEntryRecord,
  GovernedHandoffEvidenceConsumptionRecord,
  GovernedHandoffPreparationRecord,
  GovernedHandoffPreservationAuditRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedGovernedHandoffPreservationAuditCoherence(input: {
  audit: GovernedHandoffPreservationAuditRecord;
  entry: GovernedHandoffEntryRecord;
  consumption: GovernedHandoffEvidenceConsumptionRecord;
  preparation?: GovernedHandoffPreparationRecord | null;
  gpra?: GpraGrantRecord | null;
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
}): void {
  const { audit, entry, consumption } = input;

  if (audit.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff preservation audit entryId does not match provided entry",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
    );
  }
  if (audit.evidenceConsumptionId !== consumption.consumptionId) {
    throw new OrchestraConstitutionalError(
      "Handoff preservation audit evidenceConsumptionId does not match provided consumption",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
    );
  }
  if (consumption.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption does not belong to provided entry for preservation audit coherence",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
    );
  }

  if (
    audit.historicalPreservationOnly !== true ||
    audit.doesNotRestoreConstitutionalForce !== true ||
    audit.doesNotOverwriteUpstreamConstitutionalRecords !== true ||
    audit.doesNotCollapsePreparationAndOperativeHistory !== true ||
    audit.doesNotAuthorizeErasureOrRedaction !== true ||
    audit.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    audit.notHandoffAuthorization !== true ||
    audit.notHandoffPostureDeclaration !== true ||
    audit.notHandoffExecution !== true ||
    audit.hpamExtensionFrameworkOnly !== true ||
    audit.doesNotCreateOperativeHoemActRecords !== true ||
    audit.evidencePackageIsNotErasureAuthorization !== true ||
    audit.r16AdditiveHistoricalPreservation !== true ||
    audit.r17NoOverwriteUpstreamConstitutionalRecords !== true ||
    audit.r18HpamExtensionFrameworkOnly !== true ||
    audit.r19HistoryRemainsLoadableAfterInvalidation !== true ||
    audit.r20AuditableConsiderationEvents !== true ||
    audit.r21EvidencePackageIsNotErasureAuthorization !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit must carry HOF-G10 historical-only / non-erasure / framework markers (R16–R21)",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R18", "FI-DSN-STD-015-R21"],
    );
  }

  if (
    !Array.isArray(audit.deferredOperativeAuditClasses) ||
    audit.deferredOperativeAuditClasses.length !== DEFERRED_OPERATIVE_AUDIT_CLASSES.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit deferredOperativeAuditClasses catalog incomplete (R16/R20)",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
    );
  }
  for (const cls of audit.deferredOperativeAuditClasses) {
    if (!isDeferredOperativeAuditClass(cls)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preservation audit has forged deferred operative audit class",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
      );
    }
  }

  if (
    audit.preparationId !== entry.preparationId ||
    audit.gpraId !== entry.gpraId ||
    audit.approvalActId !== entry.approvalActId ||
    audit.reviewId !== entry.reviewId ||
    audit.determinationId !== entry.determinationId ||
    audit.rvaId !== entry.rvaId ||
    audit.programId !== entry.programId ||
    audit.obligationId !== entry.obligationId ||
    audit.handoffConsumerContextId !== entry.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff preservation audit lineage does not match entry subject",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R17", "FI-DSN-STD-015-R20"],
    );
  }

  if (
    audit.preparationId !== consumption.preparationId ||
    audit.gpraId !== consumption.gpraId ||
    audit.approvalActId !== consumption.approvalActId ||
    audit.reviewId !== consumption.reviewId ||
    audit.determinationId !== consumption.determinationId ||
    audit.rvaId !== consumption.rvaId ||
    audit.programId !== consumption.programId ||
    audit.obligationId !== consumption.obligationId ||
    audit.handoffConsumerContextId !== consumption.handoffConsumerContextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff preservation audit lineage does not match consumption subject",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R17", "FI-DSN-STD-015-R20"],
    );
  }

  if (
    !Array.isArray(audit.consumerCategoryKeys) ||
    audit.consumerCategoryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit requires nonempty consumerCategoryKeys from entry",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }
  if (audit.consumerCategoryKeys.length !== entry.consumerCategoryKeys.length) {
    throw new OrchestraConstitutionalError(
      "Handoff preservation audit consumerCategoryKeys must equal entry keys",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }
  for (let i = 0; i < audit.consumerCategoryKeys.length; i++) {
    const key = audit.consumerCategoryKeys[i]!;
    if (!isHandoffConsumerCategoryKey(key) || key !== entry.consumerCategoryKeys[i]) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preservation audit has forged or mismatched consumer category key",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R20"],
      );
    }
  }

  if (!Array.isArray(audit.brainAdvisoryIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit requires brainAdvisoryIds array (provenance; may be empty)",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }
  if (audit.brainAdvisoryIds.length !== consumption.brainAdvisoryIds.length) {
    throw new OrchestraConstitutionalError(
      "Handoff preservation audit brainAdvisoryIds must equal consumption provenance",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }
  for (let i = 0; i < audit.brainAdvisoryIds.length; i++) {
    if (audit.brainAdvisoryIds[i] !== consumption.brainAdvisoryIds[i]) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preservation audit has forged brainAdvisoryIds provenance",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R20"],
      );
    }
  }

  if (input.preparation) {
    if (input.preparation.preparationId !== audit.preparationId) {
      throw new OrchestraConstitutionalError(
        "Handoff preservation audit preparationId does not match provided preparation",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R17", "FI-DSN-STD-015-R18"],
      );
    }
    if (
      input.preparation.gpraId !== audit.gpraId ||
      input.preparation.handoffConsumerContextId !== audit.handoffConsumerContextId
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff preservation audit does not match preparation subject (R17/R18 — do not collapse prep history)",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R17", "FI-DSN-STD-015-R18"],
      );
    }
  }

  if (input.gpra) {
    if (input.gpra.gpraId !== audit.gpraId) {
      throw new OrchestraConstitutionalError(
        "Handoff preservation audit GPRA identity does not match provided GPRA grant",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R17"],
      );
    }
    if (
      input.gpra.approvalActId !== audit.approvalActId ||
      input.gpra.reviewId !== audit.reviewId ||
      input.gpra.determinationId !== audit.determinationId ||
      input.gpra.rvaId !== audit.rvaId ||
      input.gpra.programId !== audit.programId ||
      input.gpra.obligationId !== audit.obligationId
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff preservation audit lineage does not match GPRA grant subject",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R17"],
      );
    }
  }

  if (input.review) {
    if (input.review.reviewId !== audit.reviewId) {
      throw new OrchestraConstitutionalError(
        "Handoff preservation audit reviewId does not match provided Review",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R17"],
      );
    }
  }

  if (input.determination) {
    if (
      input.determination.determinationId !== audit.determinationId ||
      input.determination.reviewId !== audit.reviewId
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff preservation audit Determination does not match Review lineage",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R17"],
      );
    }
  }

  // R16–R21 / R22 boundary — reject HOEM act / erase / restore / Brain-authorize fields.
  const raw = audit as unknown as Record<string, unknown>;
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
    "hoemOperativeActRecords",
    "hoemActInstances",
    "eraseUpstreamHistory",
    "redactUpstreamHistory",
    "overwriteUpstreamHistory",
    "mergeUpstreamHistory",
    "substituteUpstreamHistory",
    "collapsePreparationHistory",
    "restoreConstitutionalForce",
    "restoresAuthority",
    "brainAuthorizesHandoff",
    "brainHandoffAuthorization",
    "brainAuthorizeHandoff",
    "r22BrainAuthorizeHandoff",
    "executionQueueId",
    "constitutionalQueueId",
    "preservationAuthorityClassId",
  ];
  for (const key of forbidden) {
    const value = raw[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preservation audit must not carry HOEM act / erase / restore / R22 / authority-class fields (R16–R21)",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R17", "FI-DSN-STD-015-R21"],
      );
    }
  }
}
