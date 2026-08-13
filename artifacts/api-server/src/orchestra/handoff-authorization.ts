/**
 * Governed Handoff Authorization Acts — FI-DSN-STD-015 HOF-G2 (R25–R32).
 *
 * Operative HGA authorization only. Does NOT declare posture, complete, suspend,
 * recall, withdraw, or execute Handoff (HOF-G4/G5/G6 deferred).
 *
 * Raw constructor — prefer Domain3Repository.authorizeGovernedHandoff.
 * NOT exported from orchestra barrel.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  GovernedHandoffAuthorizationActId,
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffAuthorizationAssessment,
  GovernedHandoffEntryRecord,
  GovernedHandoffEvidenceConsumptionRecord,
  GovernedHandoffPreparationRecord,
  GpraValidityPosture,
  HandoffConsumerCategoryKey,
  HandoffEligibilityLayerCondition,
  HandoffEntryCurrency,
  HandoffEvidenceConsumptionCurrency,
  HandoffPreparationCurrency,
  HccmConsumerClassId,
  HoemAuthorizationOperativeRecord,
  HoemAuthorizationOperativeRecordId,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertHccmConsumerClassId,
  resolveConsumedHcbmBoundaryKeysForAuthorization,
} from "./hccm-consumer-classes.js";
import {
  assertEstablishedHandoffGovernanceAuthorityClass,
  resolveEstablishedHandoffGovernanceAuthorityClass,
} from "./handoff-governance-authority.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G2_REQUIREMENTS = [
  "FI-DSN-STD-015-R25",
  "FI-DSN-STD-015-R26",
  "FI-DSN-STD-015-R27",
  "FI-DSN-STD-015-R28",
  "FI-DSN-STD-015-R29",
  "FI-DSN-STD-015-R30",
  "FI-DSN-STD-015-R31",
  "FI-DSN-STD-015-R32",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_AUTHORIZATION_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G2_REQUIREMENTS]);

const AUTHORIZATION_FORBIDDEN_KEYS = [
  "handoffPosture",
  "postureDeclarationActId",
  "completionActId",
  "suspensionActId",
  "recallActId",
  "withdrawalActId",
  "executesHandoff",
  "handoffExecuted",
  "performHandoff",
  "manufacturingExecutionId",
  "fulfillmentExecutionId",
  "productionExecutionId",
  "executionQueueId",
  "constitutionalQueueId",
  "brainAuthorizesHandoff",
  "brainAuthorizeHandoff",
  "brainHandoffAuthorization",
  "implicitAuthorization",
  "automaticInheritanceAuthorization",
  "inferredEligibilityAuthorization",
  "configurationDrivenAuthorization",
  "hoemPostureDeclarationRecordId",
  "hoemCompletionRecordId",
  "hoemSuspensionRecordId",
  "hoemRecallRecordId",
  "hoemWithdrawalRecordId",
] as const;

const FORBIDDEN_ACTOR_TOKENS = [
  "brain",
  "writing_engine",
  "magac",
  "ddac",
  "dsra",
  "ivac",
  "ssac",
  "approval_authority",
] as const;

export function createGovernedHandoffAuthorizationActId(): GovernedHandoffAuthorizationActId {
  return `governed-handoff-authorization-act-${randomUUID()}` as GovernedHandoffAuthorizationActId;
}

export function createHoemAuthorizationOperativeRecordId(): HoemAuthorizationOperativeRecordId {
  return `hoem-authorization-operative-${randomUUID()}` as HoemAuthorizationOperativeRecordId;
}

export function assertNoHandoffAuthorizationPostureOrExecutionClaims(
  input: Record<string, unknown>,
): void {
  for (const key of AUTHORIZATION_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Handoff authorization must not declare posture, complete, suspend, recall, withdraw, execute, or claim implicit authorization (R26/R30; R33+ deferred)",
        "invalid_handoff_authorization",
        ["FI-DSN-STD-015-R26", "FI-DSN-STD-015-R30"],
      );
    }
  }
}

/**
 * R25 / R32 — HGA class required; actor attribution is distinct and cannot mint authority.
 */
export function assertGovernedHandoffAuthorizationActor(input: {
  authorizedBy: string;
  authorityClassId: unknown;
  sourceAttribution?: unknown;
}): string {
  assertEstablishedHandoffGovernanceAuthorityClass(input.authorityClassId);
  assertNoHandoffAuthorizationPostureOrExecutionClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot perform Handoff authorization acts (R22/R32)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R22", "FI-DSN-STD-015-R32"],
    );
  }

  const authorizedBy = input.authorizedBy?.trim() ?? "";
  if (!authorizedBy) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization requires attributable authorizedBy actor within HGA scope; actor string alone is not HGA authority (R25)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25"],
    );
  }
  const lower = authorizedBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_ACTOR_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "authorizedBy must not mint Brain or HAAM-prohibited authority-class identity as Handoff authorizer (R32)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R32"],
    );
  }
  return authorizedBy;
}

export function assessGovernedHandoffAuthorization(input: {
  entry: GovernedHandoffEntryRecord | null;
  entryCurrency: HandoffEntryCurrency | null;
  consumption: GovernedHandoffEvidenceConsumptionRecord | null;
  consumptionCurrency: HandoffEvidenceConsumptionCurrency | null;
  preparation: GovernedHandoffPreparationRecord | null;
  preparationCurrency: HandoffPreparationCurrency | null;
  gpraValidityPosture: GpraValidityPosture | null;
  eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  consumerClassId: HccmConsumerClassId | null;
  lineageMatchesAuthoritativeGpra: boolean;
}): GovernedHandoffAuthorizationAssessment {
  const denialReasons: string[] = [];

  if (!input.entry) {
    denialReasons.push("missing_governed_handoff_entry");
  } else if (input.entryCurrency !== "current") {
    denialReasons.push("stale_governed_handoff_entry");
  }

  if (!input.consumption) {
    denialReasons.push("missing_evidence_consumption");
  } else if (input.consumptionCurrency !== "current") {
    denialReasons.push("stale_evidence_consumption");
  } else if (input.entry && input.consumption.entryId !== input.entry.entryId) {
    denialReasons.push("evidence_consumption_foreign_to_entry");
  }

  if (!input.preparation) {
    denialReasons.push("missing_preparation");
  } else if (input.preparationCurrency !== "current") {
    denialReasons.push("stale_preparation");
  } else if (input.eligibilityLayerCondition === "blocked") {
    denialReasons.push("g11_eligibility_blocked");
  } else if (input.eligibilityLayerCondition !== "export_ready") {
    denialReasons.push("g11_eligibility_not_export_ready");
  }

  if (input.gpraValidityPosture === "invalidated") {
    denialReasons.push("gpra_invalidated");
  } else if (input.gpraValidityPosture === "superseded") {
    denialReasons.push("gpra_superseded");
  } else if (input.gpraValidityPosture !== "retention") {
    denialReasons.push("gpra_not_retention");
  }

  if (!input.lineageMatchesAuthoritativeGpra) {
    denialReasons.push("lineage_mismatch_authoritative_gpra");
  }

  if (!input.consumerClassId || !input.entry) {
    if (!input.consumerClassId) denialReasons.push("missing_hccm_consumer_class");
  } else {
    try {
      resolveConsumedHcbmBoundaryKeysForAuthorization({
        consumerClassId: input.consumerClassId,
        entryConsumerCategoryKeys: input.entry.consumerCategoryKeys,
      });
    } catch {
      denialReasons.push("hccm_bound_context_keys_unavailable");
    }
  }

  const mayAuthorize = denialReasons.length === 0;
  return Object.freeze({
    mayAuthorize,
    denialReasons: Object.freeze([...denialReasons]),
    authorityClassId: mayAuthorize ? ("handoff_governance_authority" as const) : null,
    entryCurrency: input.entryCurrency,
    consumptionCurrency: input.consumptionCurrency,
    preparationCurrency: input.preparationCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    eligibilityLayerCondition: input.eligibilityLayerCondition,
    notHandoffPostureDeclaration: true as const,
    notHandoffExecution: true as const,
    notCompletionSuspensionRecallOrWithdrawal: true as const,
    substitutesRejected: true as const,
  });
}

export interface CreateGovernedHandoffAuthorizationActInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly consumption: GovernedHandoffEvidenceConsumptionRecord;
  readonly consumerClassId: HccmConsumerClassId;
  readonly authorityClassId: unknown;
  readonly authorizedBy: string;
  readonly authorizedAt?: string;
  readonly sourceAttribution?: unknown;
  readonly handoffPosture?: unknown;
  readonly postureDeclarationActId?: unknown;
  readonly completionActId?: unknown;
  readonly suspensionActId?: unknown;
  readonly recallActId?: unknown;
  readonly withdrawalActId?: unknown;
  readonly executesHandoff?: unknown;
  readonly handoffExecuted?: unknown;
  readonly performHandoff?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillmentExecutionId?: unknown;
  readonly executionQueueId?: unknown;
  readonly constitutionalQueueId?: unknown;
  readonly brainAuthorizesHandoff?: unknown;
  readonly brainAuthorizeHandoff?: unknown;
  readonly brainHandoffAuthorization?: unknown;
  readonly implicitAuthorization?: unknown;
  readonly automaticInheritanceAuthorization?: unknown;
  readonly inferredEligibilityAuthorization?: unknown;
  readonly configurationDrivenAuthorization?: unknown;
}

/**
 * Construct an operative HGA authorization act + HOEM authorization operative record.
 * Caller must have verified current upstream prerequisites (R31).
 */
export function createGovernedHandoffAuthorizationActRecord(
  input: CreateGovernedHandoffAuthorizationActInput,
): GovernedHandoffAuthorizationActRecord {
  assertNoHandoffAuthorizationPostureOrExecutionClaims(
    input as unknown as Record<string, unknown>,
  );
  const authorizedBy = assertGovernedHandoffAuthorizationActor(input);
  assertEstablishedHandoffGovernanceAuthorityClass(input.authorityClassId);
  const hga = resolveEstablishedHandoffGovernanceAuthorityClass(
    input.authorityClassId as "handoff_governance_authority",
  );
  assertHccmConsumerClassId(input.consumerClassId);

  const entry = input.entry;
  const consumption = input.consumption;
  if (consumption.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization requires evidence consumption belonging to the provided G1 entry (R31)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }
  if (
    consumption.preparationId !== entry.preparationId ||
    consumption.gpraId !== entry.gpraId ||
    consumption.handoffConsumerContextId !== entry.handoffConsumerContextId ||
    consumption.obligationId !== entry.obligationId ||
    consumption.programId !== entry.programId ||
    consumption.rvaId !== entry.rvaId ||
    consumption.reviewId !== entry.reviewId ||
    consumption.determinationId !== entry.determinationId ||
    consumption.approvalActId !== entry.approvalActId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization rejected: consumption lineage does not match entry (R31)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R31"],
    );
  }

  const consumedHcbmBoundaryKeys = resolveConsumedHcbmBoundaryKeysForAuthorization({
    consumerClassId: input.consumerClassId,
    entryConsumerCategoryKeys: entry.consumerCategoryKeys,
  });

  const now = input.authorizedAt ?? new Date().toISOString();
  const authorizationActId = createGovernedHandoffAuthorizationActId();
  const hoemAuthorizationRecord: HoemAuthorizationOperativeRecord = Object.freeze({
    hoemAuthorizationRecordId: createHoemAuthorizationOperativeRecordId(),
    authorizationActId,
    actType: "authorization" as const,
    gpraId: entry.gpraId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    consumerClassId: input.consumerClassId,
    consumedHcbmBoundaryKeys,
    doesNotMergePostureDeclarationAttribution: true as const,
    doesNotMergeCompletionAttribution: true as const,
    doesNotMergeSuspensionAttribution: true as const,
    doesNotMergeWithdrawalAttribution: true as const,
    doesNotMergeRecallAttribution: true as const,
  });

  return Object.freeze({
    authorizationActId,
    authorityClassId: hga.authorityClassId,
    authorityGoverningSourceId: hga.governingSourceId,
    authorityConstitutionalScope: hga.authorizedConstitutionalScope,
    authorizedBy,
    authorizedAt: now,
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
    consumerClassId: input.consumerClassId,
    consumedHcbmBoundaryKeys,
    consumerCategoryKeys: Object.freeze([
      ...entry.consumerCategoryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    hoemAuthorizationRecord,
    notHandoffPostureDeclaration: true as const,
    notHandoffExecution: true as const,
    notHandoffCompletion: true as const,
    notHandoffSuspension: true as const,
    notHandoffRecall: true as const,
    notHandoffWithdrawal: true as const,
    notDownstreamAcceptance: true as const,
    doesNotAuthorizeManufacturingOrFulfillment: true as const,
    doesNotCollapsePeerDecisionClasses: true as const,
    doesNotSubstituteGpraOrEligibilityOrAdvisory: true as const,
    r25HgaSoleAuthorizationOwner: true as const,
    r26PeerDistinctAuthorizationClass: true as const,
    r27NoSubstituteInputs: true as const,
    r28BoundHccmConsumerContext: true as const,
    r29HoemAuthorizationOperativeRecord: true as const,
    r30NoImplicitAuthorization: true as const,
    r31PrerequisiteGated: true as const,
    r32HaamProhibitedPerformersExcluded: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: authorizedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_AUTHORIZATION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
