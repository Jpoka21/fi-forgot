/**
 * Governed Handoff Downstream Exit Boundary — FI-DSN-STD-015 HOF-G8 partial (R58–R65).
 *
 * Volume 06 terminus BOUNDARY attribution only. NOT an HGA matrix act type (§20.5.3.14).
 * Does NOT implement exit-completeness (R66 / R142–R145 deferred), acceptance, membership,
 * manufacturing, intake, or G6 suspend/recall/withdraw.
 *
 * Raw constructors — prefer Domain3Repository.attributeGovernedHandoffDownstreamExitBoundary.
 * NOT exported from orchestra barrel.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  GovernedHandoffAuthorizationActId,
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffCompletionActId,
  GovernedHandoffCompletionActRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffDownstreamExitBoundaryAssessment,
  GovernedHandoffDownstreamExitBoundaryAttributionId,
  GovernedHandoffDownstreamExitBoundaryAttributionRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreparationRecord,
  GpraValidityPosture,
  HandoffCompletionCurrency,
  HandoffConsumerBindingCurrency,
  HandoffConsumerCategoryKey,
  HandoffDownstreamExitBoundaryCurrency,
  HandoffDownstreamExitConsiderationEvaluation,
  HandoffEligibilityLayerCondition,
  HandoffEntryCurrency,
  HandoffPostureDeclarationCurrency,
  HandoffPreparationCurrency,
  HccmConsumerClassId,
  HoemExitBoundaryRecord,
  HoemExitBoundaryRecordId,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertEstablishedHandoffGovernanceAuthorityClass,
  isCanonicalEstablishedHandoffGovernanceAuthorityClassId,
  resolveEstablishedHandoffGovernanceAuthorityClass,
} from "./handoff-governance-authority.js";
import {
  resolveHccmConsumerClass,
  type HccmConsumerClassCatalogEntry,
} from "./hccm-consumer-classes.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G8_REQUIREMENTS = [
  "FI-DSN-STD-015-R58",
  "FI-DSN-STD-015-R59",
  "FI-DSN-STD-015-R60",
  "FI-DSN-STD-015-R61",
  "FI-DSN-STD-015-R62",
  "FI-DSN-STD-015-R63",
  "FI-DSN-STD-015-R64",
  "FI-DSN-STD-015-R65",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_DOWNSTREAM_EXIT_BOUNDARY_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G8_REQUIREMENTS]);

/**
 * R58 — Volume 06 / STD-015 is the principal Handoff authority terminus.
 * Downstream domains retain acceptance / admission / validation / execution / intake.
 */
export const VOLUME_06_HANDOFF_AUTHORITY_TERMINUS = Object.freeze({
  volumeId: "volume_06" as const,
  principalAuthorityLimit: "FI-DSN-STD-015" as const,
  terminusKind: "handoff_governance_authority_terminus" as const,
  doesNotAbsorbDownstreamAcceptance: true as const,
  doesNotAbsorbDownstreamAdmission: true as const,
  doesNotAbsorbDownstreamValidation: true as const,
  doesNotAbsorbDownstreamExecution: true as const,
  doesNotAbsorbDownstreamIntake: true as const,
  exitCompletenessDeferred: true as const,
  r58Volume06Terminus: true as const,
});

export const DOWNSTREAM_EXIT_BOUNDARY_ATTRIBUTION_KIND =
  "downstream_exit_boundary_attribution" as const;

export const HOEM_EXIT_BOUNDARY_ACT_TYPE = "exit_boundary" as const;

const EXIT_BOUNDARY_FORBIDDEN_KEYS = [
  "acceptDownstream",
  "downstreamAcceptanceId",
  "membershipAdmission",
  "permanentCollectionMembershipId",
  "manufacturingExecution",
  "manufacturingExecutionId",
  "fulfillment",
  "fulfillmentExecutionId",
  "publication",
  "publicationExecutionId",
  "distribution",
  "distributionExecutionId",
  "exitCompleteness",
  "exitCompletenessSatisfactionId",
  "satisfyExitCompleteness",
  "suspendHandoff",
  "suspensionActId",
  "recallHandoff",
  "recallActId",
  "withdrawHandoff",
  "withdrawalActId",
  "rejectHandoff",
  "rejectHandoffActLayer",
  "handoff_lifecycle_rejection_act",
  "brainExit",
  "brainDownstreamExit",
  "implicitExit",
  "automaticInheritanceExit",
  "inferredEligibilityExit",
  "configurationDrivenExit",
  "acceptanceSignalExit",
  "executesHandoff",
  "handoffExecuted",
  "performHandoff",
  "executionQueueId",
  "constitutionalQueueId",
  "intakeCompletionId",
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

export function createGovernedHandoffDownstreamExitBoundaryAttributionId(): GovernedHandoffDownstreamExitBoundaryAttributionId {
  return `governed-handoff-downstream-exit-boundary-attribution-${randomUUID()}` as GovernedHandoffDownstreamExitBoundaryAttributionId;
}

export function createHoemExitBoundaryRecordId(): HoemExitBoundaryRecordId {
  return `hoem-exit-boundary-${randomUUID()}` as HoemExitBoundaryRecordId;
}

/**
 * R61 — resolve frozen HCCM catalog downstream consideration domain for a consumer class.
 */
export function resolveDownstreamConsiderationDomain(
  consumerClassId: HccmConsumerClassId,
): string {
  return resolveHccmConsumerClass(consumerClassId).downstreamConsiderationDomain;
}

export function resolveDownstreamExitCatalogEntry(
  consumerClassId: HccmConsumerClassId,
): HccmConsumerClassCatalogEntry {
  return resolveHccmConsumerClass(consumerClassId);
}

export function assertNoDownstreamExitAcceptanceMembershipOrExecutionClaims(
  input: Record<string, unknown>,
): void {
  for (const key of EXIT_BOUNDARY_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Downstream exit boundary must not accept, admit membership, manufacture, fulfill, publish, distribute, satisfy exit-completeness, suspend/recall/withdraw, reject, or claim implicit exit (R58–R65)",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R59", "FI-DSN-STD-015-R63", "FI-DSN-STD-015-R65"],
      );
    }
  }
}

/**
 * R58/R63/R65 — HGA class required as performer class only (not a ninth matrix act scope).
 * Uses established HGA class identity without claiming matrix constitutional scope.
 */
export function assertGovernedHandoffDownstreamExitBoundaryActor(input: {
  attributedBy: string;
  authorityClassId: unknown;
  sourceAttribution?: unknown;
}): string {
  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(input.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary attribution requires constitutionally established HGA class; Brain, MAGAC, DDAC, DSRA, IVAC, SSAC, GPRA, workflow, actor string, or fabricated ID cannot mint exit-boundary authority (R58/R65)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R65"],
    );
  }
  // Class-only check — does not claim/extend HGA matrix act scopes.
  assertEstablishedHandoffGovernanceAuthorityClass(input.authorityClassId);
  assertNoDownstreamExitAcceptanceMembershipOrExecutionClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot attribute Handoff downstream exit boundary (R58/R65)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R65"],
    );
  }

  const attributedBy = input.attributedBy?.trim() ?? "";
  if (!attributedBy) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary requires attributable attributedBy actor within HGA class; actor string alone is not HGA authority (R58/R65)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R65"],
    );
  }
  const lower = attributedBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_ACTOR_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "attributedBy must not mint Brain or HAAM-prohibited authority-class identity as exit-boundary attribuitor (R58/R65)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R65"],
    );
  }
  return attributedBy;
}

function hcbmKeysMatchCatalog(
  consumed: readonly HandoffConsumerCategoryKey[],
  catalogKeys: readonly HandoffConsumerCategoryKey[],
): boolean {
  if (consumed.length === 0) return false;
  const catalogSet = new Set(catalogKeys);
  return consumed.every((key) => catalogSet.has(key));
}

/**
 * R58–R65 — assess whether a lawful exit-boundary attribution may be recorded.
 * Completed enables consideration (R60); attribution linkage is the attributable exit (R64/R65).
 * Prior G2 authorization is NOT required.
 */
export function assessGovernedHandoffDownstreamExitBoundary(input: {
  entry: GovernedHandoffEntryRecord | null;
  entryCurrency: HandoffEntryCurrency | null;
  binding: GovernedHandoffConsumerBindingRecord | null;
  bindingCurrency: HandoffConsumerBindingCurrency | null;
  posture: GovernedHandoffPostureDeclarationActRecord | null;
  postureCurrency: HandoffPostureDeclarationCurrency | null;
  completion: GovernedHandoffCompletionActRecord | null;
  completionCurrency: HandoffCompletionCurrency | null;
  preparation: GovernedHandoffPreparationRecord | null;
  preparationCurrency: HandoffPreparationCurrency | null;
  gpraValidityPosture: GpraValidityPosture | null;
  eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  lineageMatchesAuthoritativeGpra: boolean;
  downstreamConsiderationDomain?: string | null;
}): GovernedHandoffDownstreamExitBoundaryAssessment {
  const denialReasons: string[] = [];

  if (!input.entry) {
    denialReasons.push("missing_governed_handoff_entry");
  } else if (input.entryCurrency !== "current") {
    denialReasons.push("stale_governed_handoff_entry");
  }

  if (!input.binding) {
    denialReasons.push("missing_hccm_consumer_binding");
  } else if (input.bindingCurrency !== "current") {
    denialReasons.push("stale_hccm_consumer_binding");
  } else if (input.entry && input.binding.entryId !== input.entry.entryId) {
    denialReasons.push("binding_foreign_to_entry");
  }

  if (!input.posture) {
    denialReasons.push("missing_authoritative_handoff_posture");
  } else if (input.postureCurrency !== "current") {
    denialReasons.push("stale_authoritative_handoff_posture");
  } else if (input.binding && input.posture.bindingId !== input.binding.bindingId) {
    denialReasons.push("posture_foreign_to_binding");
  } else if (input.entry && input.posture.entryId !== input.entry.entryId) {
    denialReasons.push("posture_foreign_to_entry");
  }

  if (!input.completion) {
    denialReasons.push("missing_current_handoff_completion");
  } else if (input.completionCurrency !== "current") {
    denialReasons.push("stale_handoff_completion");
  } else if (input.binding && input.completion.bindingId !== input.binding.bindingId) {
    denialReasons.push("completion_foreign_to_binding");
  } else if (input.entry && input.completion.entryId !== input.entry.entryId) {
    denialReasons.push("completion_foreign_to_entry");
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

  let catalogDomain: string | null = null;
  if (input.binding) {
    const catalog = resolveHccmConsumerClass(input.binding.consumerClassId);
    catalogDomain = catalog.downstreamConsiderationDomain;
    if (
      !hcbmKeysMatchCatalog(input.binding.consumedHcbmBoundaryKeys, catalog.hcbmBoundaryKeys)
    ) {
      denialReasons.push("hcbm_keys_mismatch_catalog_mapping");
    }
    if (
      input.downstreamConsiderationDomain != null &&
      input.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain
    ) {
      denialReasons.push("downstream_consideration_domain_mismatch_catalog");
    }
    if (
      input.binding.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain
    ) {
      denialReasons.push("binding_downstream_domain_mismatch_catalog");
    }
  }

  if (
    input.binding &&
    input.entry &&
    (input.binding.gpraId !== input.entry.gpraId ||
      input.binding.obligationId !== input.entry.obligationId ||
      input.binding.handoffConsumerContextId !== input.entry.handoffConsumerContextId ||
      input.binding.programId !== input.entry.programId ||
      input.binding.rvaId !== input.entry.rvaId ||
      input.binding.reviewId !== input.entry.reviewId ||
      input.binding.determinationId !== input.entry.determinationId ||
      input.binding.approvalActId !== input.entry.approvalActId)
  ) {
    denialReasons.push("binding_lineage_mismatch_entry");
  }

  const mayAttribute = denialReasons.length === 0;
  return Object.freeze({
    mayAttribute,
    denialReasons: Object.freeze([...denialReasons]),
    authorityClassId: mayAttribute ? ("handoff_governance_authority" as const) : null,
    catalogDownstreamConsiderationDomain: catalogDomain,
    entryCurrency: input.entryCurrency,
    bindingCurrency: input.bindingCurrency,
    postureDeclarationCurrency: input.postureCurrency,
    completionCurrency: input.completionCurrency,
    preparationCurrency: input.preparationCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    eligibilityLayerCondition: input.eligibilityLayerCondition,
    volume06Terminus: VOLUME_06_HANDOFF_AUTHORITY_TERMINUS,
    notHgaMatrixActType: true as const,
    notHandoffCompletionAct: true as const,
    notDownstreamAcceptance: true as const,
    notMembershipAdmission: true as const,
    notManufacturingOrFulfillmentOrExecution: true as const,
    notExitCompletenessSatisfaction: true as const,
    exitCompletenessDeferred: true as const,
    r58Volume06Terminus: true as const,
    r59BoundedExportDenotation: true as const,
    r60CompletedEnablesConsiderationOnly: true as const,
    r65NoImplicitExit: true as const,
  });
}

/**
 * R64 — current authoritative exit-boundary attribution = latest additive tip by attributedAt.
 */
export function selectAuthoritativeGovernedHandoffDownstreamExitBoundary(
  attributions: readonly GovernedHandoffDownstreamExitBoundaryAttributionRecord[],
): GovernedHandoffDownstreamExitBoundaryAttributionRecord | null {
  if (attributions.length === 0) return null;
  return [...attributions]
    .sort((a, b) => a.attributedAt.localeCompare(b.attributedAt))
    .at(-1)!;
}

/**
 * Forward currency requires tip match + current entry/binding + current completion/posture.
 */
export function evaluateHandoffDownstreamExitBoundaryCurrencyFromFacts(input: {
  attribution: GovernedHandoffDownstreamExitBoundaryAttributionRecord;
  currentEntryCurrency: HandoffEntryCurrency;
  currentBindingCurrency: HandoffConsumerBindingCurrency;
  currentCompletionCurrency: HandoffCompletionCurrency;
  currentPostureCurrency: HandoffPostureDeclarationCurrency;
  authoritativeExitBoundaryAttributionId: GovernedHandoffDownstreamExitBoundaryAttributionId | null;
}): HandoffDownstreamExitBoundaryCurrency {
  if (
    input.currentEntryCurrency !== "current" ||
    input.currentBindingCurrency !== "current" ||
    input.currentCompletionCurrency !== "current" ||
    input.currentPostureCurrency !== "current"
  ) {
    return "stale";
  }
  if (
    input.authoritativeExitBoundaryAttributionId != null &&
    input.attribution.exitBoundaryAttributionId !==
      input.authoritativeExitBoundaryAttributionId
  ) {
    return "stale";
  }
  return "current";
}

/**
 * R60/R65 — Completed current enables exit *consideration* only.
 * Exit is attributed only when exit-boundary linkage exists.
 */
export function evaluateDownstreamExitConsiderationFromFacts(input: {
  completion: GovernedHandoffCompletionActRecord | null;
  completionIsCurrent: boolean;
  authoritativeExitBoundary: GovernedHandoffDownstreamExitBoundaryAttributionRecord | null;
  exitBoundaryIsCurrent: boolean;
}): HandoffDownstreamExitConsiderationEvaluation {
  const considerationEnabled = !!(input.completion && input.completionIsCurrent);
  const exitAttributed = !!(
    considerationEnabled &&
    input.authoritativeExitBoundary &&
    input.exitBoundaryIsCurrent
  );
  return Object.freeze({
    considerationEnabled,
    exitAttributed,
    completionActId: input.completion?.completionActId ?? null,
    exitBoundaryAttributionId:
      input.authoritativeExitBoundary?.exitBoundaryAttributionId ?? null,
    downstreamConsiderationDomain:
      input.authoritativeExitBoundary?.downstreamConsiderationDomain ?? null,
    notIntake: true as const,
    notAcceptance: true as const,
    notExitCompleteness: true as const,
    exitCompletenessDeferred: true as const,
    r60CompletedEnablesConsiderationOnly: true as const,
    r65NoImplicitExitFromCompletedAlone: true as const,
  });
}

export interface CreateGovernedHandoffDownstreamExitBoundaryAttributionInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly binding: GovernedHandoffConsumerBindingRecord;
  readonly posture: GovernedHandoffPostureDeclarationActRecord;
  readonly completion: GovernedHandoffCompletionActRecord;
  readonly authorityClassId: unknown;
  readonly attributedBy: string;
  readonly attributedAt?: string;
  readonly downstreamConsiderationDomain?: string;
  readonly authorizationActId?: GovernedHandoffAuthorizationActId | null;
  readonly matchingAuthorization?: GovernedHandoffAuthorizationActRecord | null;
  readonly sourceAttribution?: unknown;
  readonly acceptDownstream?: unknown;
  readonly downstreamAcceptanceId?: unknown;
  readonly membershipAdmission?: unknown;
  readonly permanentCollectionMembershipId?: unknown;
  readonly manufacturingExecution?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillment?: unknown;
  readonly fulfillmentExecutionId?: unknown;
  readonly publication?: unknown;
  readonly distribution?: unknown;
  readonly exitCompleteness?: unknown;
  readonly exitCompletenessSatisfactionId?: unknown;
  readonly satisfyExitCompleteness?: unknown;
  readonly suspendHandoff?: unknown;
  readonly suspensionActId?: unknown;
  readonly recallHandoff?: unknown;
  readonly recallActId?: unknown;
  readonly withdrawHandoff?: unknown;
  readonly withdrawalActId?: unknown;
  readonly rejectHandoff?: unknown;
  readonly rejectHandoffActLayer?: unknown;
  readonly brainExit?: unknown;
  readonly implicitExit?: unknown;
  readonly automaticInheritanceExit?: unknown;
  readonly inferredEligibilityExit?: unknown;
  readonly configurationDrivenExit?: unknown;
  readonly acceptanceSignalExit?: unknown;
  readonly executesHandoff?: unknown;
  readonly handoffExecuted?: unknown;
  readonly performHandoff?: unknown;
  readonly executionQueueId?: unknown;
  readonly constitutionalQueueId?: unknown;
  readonly intakeCompletionId?: unknown;
}

/**
 * Construct an additive HOEM-linked downstream exit-boundary attribution record.
 * NOT an HGA matrix act. Caller must have verified mayAttribute prerequisites.
 */
export function createGovernedHandoffDownstreamExitBoundaryAttributionRecord(
  input: CreateGovernedHandoffDownstreamExitBoundaryAttributionInput,
): GovernedHandoffDownstreamExitBoundaryAttributionRecord {
  assertNoDownstreamExitAcceptanceMembershipOrExecutionClaims(
    input as unknown as Record<string, unknown>,
  );
  const attributedBy = assertGovernedHandoffDownstreamExitBoundaryActor(input);
  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(input.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary attribution requires constitutionally established HGA class (R58/R65)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R65"],
    );
  }
  assertEstablishedHandoffGovernanceAuthorityClass(input.authorityClassId);
  const hga = resolveEstablishedHandoffGovernanceAuthorityClass(
    input.authorityClassId as "handoff_governance_authority",
  );

  const entry = input.entry;
  const binding = input.binding;
  const posture = input.posture;
  const completion = input.completion;
  const catalog = resolveHccmConsumerClass(binding.consumerClassId);
  const downstreamConsiderationDomain =
    input.downstreamConsiderationDomain ?? catalog.downstreamConsiderationDomain;

  if (downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary domain must equal frozen HCCM catalog domain for the binding consumer class (R61/R62)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
    );
  }
  if (binding.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain) {
    throw new OrchestraConstitutionalError(
      "Binding downstream consideration domain must match catalog domain for exit routing (R61/R62)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
    );
  }
  if (!hcbmKeysMatchCatalog(binding.consumedHcbmBoundaryKeys, catalog.hcbmBoundaryKeys)) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary requires HCBM keys consistent with catalog mapping for the consumer class (R62)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R62"],
    );
  }

  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary requires HCCM binding belonging to the provided G1 entry (R61/R62)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
    );
  }
  if (posture.bindingId !== binding.bindingId || posture.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary requires authoritative posture belonging to the provided binding and entry (R64)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R64"],
    );
  }
  if (
    completion.bindingId !== binding.bindingId ||
    completion.entryId !== entry.entryId ||
    completion.postureDeclarationActId !== posture.postureDeclarationActId
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary requires current completion belonging to the provided binding/entry/posture chain (R60/R64)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R60", "FI-DSN-STD-015-R64"],
    );
  }
  if (
    binding.preparationId !== entry.preparationId ||
    binding.gpraId !== entry.gpraId ||
    binding.handoffConsumerContextId !== entry.handoffConsumerContextId ||
    binding.obligationId !== entry.obligationId ||
    binding.programId !== entry.programId ||
    binding.rvaId !== entry.rvaId ||
    binding.reviewId !== entry.reviewId ||
    binding.determinationId !== entry.determinationId ||
    binding.approvalActId !== entry.approvalActId
  ) {
    throw new OrchestraConstitutionalError(
      "Downstream exit boundary rejected: binding lineage does not match entry (R62)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R62"],
    );
  }

  let authorizationActId: GovernedHandoffAuthorizationActId | null =
    input.authorizationActId ?? null;
  if (input.matchingAuthorization) {
    if (
      input.matchingAuthorization.consumerClassId !== binding.consumerClassId ||
      input.matchingAuthorization.entryId !== entry.entryId
    ) {
      throw new OrchestraConstitutionalError(
        "Optional authorization export must belong to the same entry and consumer class (R59/R62)",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R59", "FI-DSN-STD-015-R62"],
      );
    }
    authorizationActId = input.matchingAuthorization.authorizationActId;
  }

  const now = input.attributedAt ?? new Date().toISOString();
  const exitBoundaryAttributionId =
    createGovernedHandoffDownstreamExitBoundaryAttributionId();
  const hoemExitBoundaryRecord: HoemExitBoundaryRecord = Object.freeze({
    hoemExitBoundaryRecordId: createHoemExitBoundaryRecordId(),
    exitBoundaryAttributionId,
    actType: HOEM_EXIT_BOUNDARY_ACT_TYPE,
    gpraId: entry.gpraId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    bindingId: binding.bindingId,
    consumerClassId: binding.consumerClassId,
    postureDeclarationActId: posture.postureDeclarationActId,
    completionActId: completion.completionActId,
    downstreamConsiderationDomain,
    doesNotPrescribeIntakeWorkflow: true as const,
    doesNotPrescribeAcceptanceMechanics: true as const,
    doesNotPrescribeRoutingMechanics: true as const,
    doesNotPrescribeStorageMechanics: true as const,
    doesNotPrescribeNotificationMechanics: true as const,
    doesNotMergeAuthorizationAttribution: true as const,
    doesNotMergePostureDeclarationAttribution: true as const,
    doesNotMergeCompletionAttribution: true as const,
    doesNotMergeLifecycleAttribution: true as const,
    doesNotMergeSuspensionAttribution: true as const,
    doesNotMergeWithdrawalAttribution: true as const,
    doesNotMergeRecallAttribution: true as const,
  });

  return Object.freeze({
    exitBoundaryAttributionId,
    authorityClassId: hga.authorityClassId,
    authorityGoverningSourceId: hga.governingSourceId,
    attributionKind: DOWNSTREAM_EXIT_BOUNDARY_ATTRIBUTION_KIND,
    constitutionalArtifactKind: DOWNSTREAM_EXIT_BOUNDARY_ATTRIBUTION_KIND,
    attributedBy,
    attributedAt: now,
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    consumerClassId: binding.consumerClassId,
    consumedHcbmBoundaryKeys: Object.freeze([
      ...binding.consumedHcbmBoundaryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    downstreamConsiderationDomain,
    postureDeclarationActId: posture.postureDeclarationActId,
    completionActId: completion.completionActId,
    authorizationActId,
    preparationId: entry.preparationId,
    gpraId: entry.gpraId,
    approvalActId: entry.approvalActId,
    reviewId: entry.reviewId,
    determinationId: entry.determinationId,
    rvaId: entry.rvaId,
    programId: entry.programId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    hoemExitBoundaryRecord,
    volume06Terminus: VOLUME_06_HANDOFF_AUTHORITY_TERMINUS,
    notHgaMatrixActType: true as const,
    notHandoffCompletionAct: true as const,
    notDownstreamAcceptance: true as const,
    notMembershipAdmission: true as const,
    notManufacturingOrFulfillmentOrExecution: true as const,
    notExitCompletenessSatisfaction: true as const,
    exitCompletenessDeferred: true as const,
    notHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffSuspension: true as const,
    notHandoffRecall: true as const,
    notHandoffWithdrawal: true as const,
    doesNotCollapsePeerDecisionClasses: true as const,
    doesNotMergeAcrossConsumerClasses: true as const,
    r58Volume06Terminus: true as const,
    r59BoundedExportDenotation: true as const,
    r60CompletedEnablesConsiderationOnly: true as const,
    r61SingleBindingRouting: true as const,
    r62TupleConsistency: true as const,
    r63PeerDistinctExitBoundary: true as const,
    r64HoemExitBoundaryLinkage: true as const,
    r65NoImplicitExit: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: attributedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_DOWNSTREAM_EXIT_BOUNDARY_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
