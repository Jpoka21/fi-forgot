/**
 * Governed Handoff Preservation and Audit — FI-DSN-STD-015 HOF-G10 (R16–R21).
 *
 * Additive historical preservation of Handoff consideration / (future) act records.
 * Does NOT restore constitutional force, overwrite upstream history, collapse G11 prep
 * into operative history, authorize erasure/redaction, create HOEM operative act
 * instances, or invent Handoff authorization (R22+ deferred).
 *
 * Raw constructor — prefer Domain3Repository.recordGovernedHandoffPreservationAudit.
 * NOT exported from orchestra barrel (G8/G9/G10/G11/G1/G7 discipline).
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  DeferredOperativeAuditClass,
  Domain3BrainAdvisoryId,
  GovernedHandoffEntryRecord,
  GovernedHandoffEvidenceConsumptionRecord,
  GovernedHandoffPreservationAuditId,
  GovernedHandoffPreservationAuditRecord,
  HandoffConsumerCategoryKey,
  HandoffPreservationAuditAuthorityEffect,
  HandoffPreservationAuditLinkedCurrency,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G10_REQUIREMENTS = [
  "FI-DSN-STD-015-R16",
  "FI-DSN-STD-015-R17",
  "FI-DSN-STD-015-R18",
  "FI-DSN-STD-015-R19",
  "FI-DSN-STD-015-R20",
  "FI-DSN-STD-015-R21",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_PRESERVATION_AUDIT_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G10_REQUIREMENTS]);

/**
 * R16 / R20 — deferred operative audit class catalog (framework labels only).
 * Does NOT create authorization/posture/completion/suspension/recall/withdrawal act instances.
 */
export const DEFERRED_OPERATIVE_AUDIT_CLASSES = [
  "authorization",
  "posture_declaration",
  "completion",
  "suspension",
  "recall",
  "withdrawal",
] as const satisfies readonly DeferredOperativeAuditClass[];

const PRESERVATION_AUDIT_FORBIDDEN_KEYS = [
  "handoffActId",
  "handoffAuthorized",
  "executesHandoff",
  "handoffAuthorization",
  "performHandoff",
  "handoffExecuted",
  "handoffPosture",
  "handoffAuthorizationActId",
  "postureDeclarationActId",
  "completionActId",
  "suspensionActId",
  "recallActId",
  "withdrawalActId",
  "hoemEvidenceId",
  "hoemOperativeEvidenceId",
  "hoemAuthorizationRecordId",
  "hoemPostureDeclarationRecordId",
  "hoemCompletionRecordId",
  "hoemSuspensionRecordId",
  "hoemRecallRecordId",
  "hoemWithdrawalRecordId",
  "hoemOperativeActRecords",
  "hoemActInstances",
  "manufacturingExecutionId",
  "fulfillmentExecutionId",
  "productionExecutionId",
  "executionQueueId",
  "constitutionalQueueId",
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
] as const;

const FORBIDDEN_PRESERVATION_AUTHORITY_TOKENS = [
  "magac",
  "ddac",
  "dsra",
  "ivac",
  "ssac",
  "brain",
  "handoff_authority",
  "handoff_auth",
  "preservation_authority",
] as const;

export function createGovernedHandoffPreservationAuditId(): GovernedHandoffPreservationAuditId {
  return `governed-handoff-preservation-audit-${randomUUID()}` as GovernedHandoffPreservationAuditId;
}

export function isDeferredOperativeAuditClass(
  value: unknown,
): value is DeferredOperativeAuditClass {
  return (
    typeof value === "string" &&
    (DEFERRED_OPERATIVE_AUDIT_CLASSES as readonly string[]).includes(value)
  );
}

/**
 * R16–R21 / R22 boundary — reject HOEM act instances, erase/redact/overwrite claims,
 * authority restore claims, and Brain-authorize-Handoff claims.
 */
export function assertNoHandoffPreservationAuditActOrErasureClaims(
  input: Record<string, unknown>,
): void {
  for (const key of PRESERVATION_AUDIT_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Governed Handoff preservation audit must not include HOEM act, erase/redact/overwrite, restore-force, or R22 Brain-authorize fields (R16–R21; R22+ deferred)",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R17", "FI-DSN-STD-015-R21"],
      );
    }
  }

  if (input.hoemOperativeActRecords != null || input.hoemActInstances != null) {
    throw new OrchestraConstitutionalError(
      "HOEM operative act instances are not created in G10; deferredOperativeAuditClasses catalog only (R16/R20)",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
    );
  }
}

/**
 * R18 HPAM / R20 — Brain cannot mint preservation audit; do not invent preservation or Handoff authority class.
 */
export function assertGovernedPreservationAuditActor(input: {
  preservedBy: string;
  sourceAttribution?: unknown;
  authorityClassId?: unknown;
  handoffAuthorityClassId?: unknown;
  preservationAuthorityClassId?: unknown;
}): string {
  assertNoHandoffPreservationAuditActOrErasureClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot create or authorize Handoff preservation audit (R18/R20); preservation is a Domain 3 governed actor record",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R18", "FI-DSN-STD-015-R20"],
    );
  }
  if (typeof input.sourceAttribution === "string" && input.sourceAttribution.trim()) {
    const attr = input.sourceAttribution.trim().toLowerCase();
    if (
      attr.includes("brain") ||
      FORBIDDEN_PRESERVATION_AUTHORITY_TOKENS.some((t) => attr.includes(t))
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff preservation audit must not claim Brain or Domain 3 authority-class attribution (R18)",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R18"],
      );
    }
  }

  for (const classField of [
    input.authorityClassId,
    input.handoffAuthorityClassId,
    input.preservationAuthorityClassId,
  ]) {
    if (typeof classField === "string" && classField.trim()) {
      const lower = classField.trim().toLowerCase();
      if (
        FORBIDDEN_PRESERVATION_AUTHORITY_TOKENS.some(
          (t) => lower === t || lower.includes(t) || lower.includes("approval_authority") ||
            lower.includes("invalidation_authority") ||
            lower.includes("supersession_authority"),
        )
      ) {
        throw new OrchestraConstitutionalError(
          "MAGAC/IVAC/SSAC/Brain must not be used as preservationAuthorityClassId; do not invent Handoff or preservation authority class (R17/R18)",
          "invalid_handoff_preservation_audit",
          ["FI-DSN-STD-015-R17", "FI-DSN-STD-015-R18"],
        );
      }
      throw new OrchestraConstitutionalError(
        "Do not invent or mint a Handoff / preservation authority class on preservation audit (R17/R18)",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R17", "FI-DSN-STD-015-R18"],
      );
    }
  }

  const preservedBy = input.preservedBy?.trim() ?? "";
  if (!preservedBy) {
    throw new OrchestraConstitutionalError(
      "Handoff preservation audit requires attributable preservedBy actor string",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }
  const lower = preservedBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_PRESERVATION_AUTHORITY_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "preservedBy must not mint Brain or Handoff/preservation authority-class identity (R18)",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R18"],
    );
  }
  return preservedBy;
}

function freezePreservationBoundaryMarkers() {
  return Object.freeze({
    historicalPreservationOnly: true as const,
    doesNotRestoreConstitutionalForce: true as const,
    doesNotOverwriteUpstreamConstitutionalRecords: true as const,
    doesNotCollapsePreparationAndOperativeHistory: true as const,
    doesNotAuthorizeErasureOrRedaction: true as const,
    doesNotAuthorizeManufacturingOrFulfillment: true as const,
    notHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffExecution: true as const,
    hpamExtensionFrameworkOnly: true as const,
    doesNotCreateOperativeHoemActRecords: true as const,
    evidencePackageIsNotErasureAuthorization: true as const,
    r16AdditiveHistoricalPreservation: true as const,
    r17NoOverwriteUpstreamConstitutionalRecords: true as const,
    r18HpamExtensionFrameworkOnly: true as const,
    r19HistoryRemainsLoadableAfterInvalidation: true as const,
    r20AuditableConsiderationEvents: true as const,
    r21EvidencePackageIsNotErasureAuthorization: true as const,
    deferredOperativeAuditClasses: Object.freeze([
      ...DEFERRED_OPERATIVE_AUDIT_CLASSES,
    ]),
  });
}

export interface CreateGovernedHandoffPreservationAuditInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly consumption: GovernedHandoffEvidenceConsumptionRecord;
  readonly preservedBy: string;
  readonly preservedAt?: string;
  readonly sourceAttribution?: unknown;
  readonly authorityClassId?: unknown;
  readonly handoffAuthorityClassId?: unknown;
  readonly preservationAuthorityClassId?: unknown;
  readonly handoffActId?: unknown;
  readonly handoffAuthorized?: unknown;
  readonly executesHandoff?: unknown;
  readonly handoffAuthorization?: unknown;
  readonly performHandoff?: unknown;
  readonly handoffExecuted?: unknown;
  readonly handoffPosture?: unknown;
  readonly handoffAuthorizationActId?: unknown;
  readonly postureDeclarationActId?: unknown;
  readonly completionActId?: unknown;
  readonly suspensionActId?: unknown;
  readonly recallActId?: unknown;
  readonly withdrawalActId?: unknown;
  readonly hoemEvidenceId?: unknown;
  readonly hoemOperativeEvidenceId?: unknown;
  readonly hoemOperativeActRecords?: unknown;
  readonly hoemActInstances?: unknown;
  readonly eraseUpstreamHistory?: unknown;
  readonly redactUpstreamHistory?: unknown;
  readonly overwriteUpstreamHistory?: unknown;
  readonly mergeUpstreamHistory?: unknown;
  readonly substituteUpstreamHistory?: unknown;
  readonly collapsePreparationHistory?: unknown;
  readonly restoreConstitutionalForce?: unknown;
  readonly restoresAuthority?: unknown;
  readonly brainAuthorizesHandoff?: unknown;
  readonly brainHandoffAuthorization?: unknown;
  readonly brainAuthorizeHandoff?: unknown;
  readonly r22BrainAuthorizeHandoff?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillmentExecutionId?: unknown;
  readonly executionQueueId?: unknown;
  readonly constitutionalQueueId?: unknown;
  /** Rejected if provided — audit copies keys from entry/consumption only. */
  readonly consumerCategoryKeys?: unknown;
}

/**
 * Construct a preservation audit record. Does not persist.
 * Caller must have verified entry exists historically and consumption belongs to entry.
 * May succeed when upstream is already stale (R19) — record is historical fact only.
 */
export function createGovernedHandoffPreservationAuditRecord(
  input: CreateGovernedHandoffPreservationAuditInput,
): GovernedHandoffPreservationAuditRecord {
  assertNoHandoffPreservationAuditActOrErasureClaims(
    input as unknown as Record<string, unknown>,
  );
  const preservedBy = assertGovernedPreservationAuditActor(input);

  if (input.consumerCategoryKeys !== undefined) {
    throw new OrchestraConstitutionalError(
      "Handoff preservation audit must not invent or override consumerCategoryKeys; copy entry keys only (R20)",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }

  const entry = input.entry;
  const consumption = input.consumption;

  if (consumption.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Preservation audit requires evidence consumption belonging to the provided G1 entry",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
    );
  }

  if (
    consumption.preparationId !== entry.preparationId ||
    consumption.gpraId !== entry.gpraId ||
    consumption.handoffConsumerContextId !== entry.handoffConsumerContextId ||
    consumption.approvalActId !== entry.approvalActId ||
    consumption.reviewId !== entry.reviewId ||
    consumption.determinationId !== entry.determinationId ||
    consumption.rvaId !== entry.rvaId ||
    consumption.programId !== entry.programId ||
    consumption.obligationId !== entry.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Preservation audit rejected: consumption lineage does not match entry (R17/R20)",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R17", "FI-DSN-STD-015-R20"],
    );
  }

  const now = input.preservedAt ?? new Date().toISOString();
  const markers = freezePreservationBoundaryMarkers();
  const brainAdvisoryIds = Object.freeze([
    ...consumption.brainAdvisoryIds,
  ]) as readonly Domain3BrainAdvisoryId[];

  return Object.freeze({
    preservationAuditId: createGovernedHandoffPreservationAuditId(),
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    preparationId: entry.preparationId,
    gpraId: entry.gpraId,
    approvalActId: entry.approvalActId,
    reviewId: entry.reviewId,
    determinationId: entry.determinationId,
    rvaId: entry.rvaId,
    programId: entry.programId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    consumerCategoryKeys: Object.freeze([
      ...entry.consumerCategoryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    brainAdvisoryIds,
    ...markers,
    preservedAt: now,
    preservedBy,
    audit: Object.freeze({
      createdAt: now,
      createdBy: preservedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_PRESERVATION_AUDIT_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

/**
 * History ≠ current authority — preservation never restores constitutional force.
 */
export function evaluateHandoffPreservationAuditAuthorityEffectFromFacts(_input: {
  audit: GovernedHandoffPreservationAuditRecord;
}): HandoffPreservationAuditAuthorityEffect {
  return "historical_only";
}

/**
 * Optional: report linked entry/consumption currency without treating preservation as current authority.
 */
export function evaluateHandoffPreservationAuditLinkedCurrencyFromFacts(input: {
  audit: GovernedHandoffPreservationAuditRecord;
  entryCurrency: "current" | "stale";
  consumptionCurrency: "current" | "stale";
}): HandoffPreservationAuditLinkedCurrency {
  return Object.freeze({
    authorityEffect: "historical_only" as const,
    doesNotRestoreConstitutionalForce: true as const,
    linkedEntryCurrency: input.entryCurrency,
    linkedConsumptionCurrency: input.consumptionCurrency,
    preservationAuditId: input.audit.preservationAuditId,
  });
}
