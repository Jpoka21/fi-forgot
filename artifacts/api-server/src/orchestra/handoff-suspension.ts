/**
 * Governed Handoff Suspension — FI-DSN-STD-015 HOF-G6-U2 (R84–R97).
 *
 * Distinct HGA suspension act; temporary forward-reliance pause.
 * Does NOT withdraw, recall, complete, resume, restore, or reenter.
 * Does NOT mint a generic performHgaAct factory.
 *
 * Raw constructors — prefer Domain3Repository.suspendGovernedHandoff.
 * NOT exported from orchestra barrel.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffSuspensionActId,
  GovernedHandoffSuspensionActRecord,
  GovernedHandoffSuspensionAssessment,
  GpraValidityPosture,
  HandoffActLayerLifecycleState,
  HandoffAuthorizationCurrency,
  HandoffConsumerBindingCurrency,
  HandoffConsumerCategoryKey,
  HandoffEligibilityLayerCondition,
  HandoffEntryCurrency,
  HandoffPostureDeclarationCurrency,
  HandoffSuspensionCurrency,
  HoemSuspensionOperativeRecord,
  HoemSuspensionOperativeRecordId,
  SuspensionConstitutionalBasisKind,
  SuspensionConstitutionalBasisProvenance,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import { assertHgaMatrixActMayBePerformed } from "./handoff-authority-catalog.js";
import {
  assertEstablishedHandoffGovernanceAuthorityForSuspension,
  resolveEstablishedHandoffGovernanceAuthorityClass,
} from "./handoff-governance-authority.js";
import {
  assertG6LifecycleActSubjectScope,
  assertHgaSolePerformerForG6LifecycleAct,
  assessG6SharedPreconditions,
} from "./handoff-lifecycle-g6-foundation.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G6_U2_REQUIREMENTS = [
  "FI-DSN-STD-015-R84",
  "FI-DSN-STD-015-R85",
  "FI-DSN-STD-015-R86",
  "FI-DSN-STD-015-R87",
  "FI-DSN-STD-015-R88",
  "FI-DSN-STD-015-R89",
  "FI-DSN-STD-015-R90",
  "FI-DSN-STD-015-R91",
  "FI-DSN-STD-015-R92",
  "FI-DSN-STD-015-R93",
  "FI-DSN-STD-015-R94",
  "FI-DSN-STD-015-R95",
  "FI-DSN-STD-015-R96",
  "FI-DSN-STD-015-R97",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_SUSPENSION_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G6_U2_REQUIREMENTS]);

const SUSPENSION_BASIS_KIND_SET = new Set<string>([
  "temporary_forward_reliance_pause_warranted",
]);

export function isSuspensionConstitutionalBasisKind(
  value: unknown,
): value is SuspensionConstitutionalBasisKind {
  return typeof value === "string" && SUSPENSION_BASIS_KIND_SET.has(value);
}

export function assertSuspensionConstitutionalBasisKind(
  value: unknown,
): asserts value is SuspensionConstitutionalBasisKind {
  if (!isSuspensionConstitutionalBasisKind(value)) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension requires a closed constitutional basisKind; free-text notes cannot be the sole basis (R85b/R89)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R85", "FI-DSN-STD-015-R89"],
    );
  }
}

const SUSPENSION_FORBIDDEN_KEYS = [
  "withdrawalActId",
  "recallActId",
  "expiryActId",
  "resumeHandoff",
  "restoreHandoff",
  "reenterHandoff",
  "reinstateHandoff",
  "reviveHandoff",
  "withdrawHandoff",
  "recallHandoff",
  "expireHandoff",
  "executesHandoff",
  "handoffExecuted",
  "performHandoff",
  "manufacturingExecutionId",
  "fulfillmentExecutionId",
  "productionExecutionId",
  "executionQueueId",
  "constitutionalQueueId",
  "brainSuspendHandoff",
  "brainHandoffSuspension",
  "brainAuthorizesHandoff",
  "implicitSuspension",
  "automaticInheritanceSuspension",
  "inferredEligibilitySuspension",
  "configurationDrivenSuspension",
  "rtcCatalogAlone",
  "hrtcmRtcAlone",
  "rejectHandoff",
  "hoemWithdrawalRecordId",
  "hoemRecallRecordId",
  "hercmReentryId",
  "resumptionActId",
  "restorationActId",
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

const RELIANCE_CEASED_LIFECYCLE_STATES = new Set<HandoffActLayerLifecycleState>([
  "withdrawn",
  "recalled",
  "expired",
  "rejected",
]);

export function createGovernedHandoffSuspensionActId(): GovernedHandoffSuspensionActId {
  return `governed-handoff-suspension-act-${randomUUID()}` as GovernedHandoffSuspensionActId;
}

export function createHoemSuspensionOperativeRecordId(): HoemSuspensionOperativeRecordId {
  return `hoem-suspension-operative-${randomUUID()}` as HoemSuspensionOperativeRecordId;
}

export function assertNoHandoffSuspensionWithdrawalRecallOrReentryClaims(
  input: Record<string, unknown>,
): void {
  for (const key of SUSPENSION_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Handoff suspension must not withdraw, recall, resume, restore, reenter, execute, reject, or claim RTC-alone mint (R84/R96/R97)",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R84", "FI-DSN-STD-015-R96", "FI-DSN-STD-015-R97"],
      );
    }
  }
}

/**
 * R70 / R84 — HGA class required; actor attribution is distinct and cannot mint authority.
 */
export function assertGovernedHandoffSuspensionActor(input: {
  suspendedBy: string;
  authorityClassId: unknown;
  sourceAttribution?: unknown;
  performerClass?: unknown;
}): string {
  try {
    assertHgaSolePerformerForG6LifecycleAct({
      authorityClassId: input.authorityClassId,
      performerClass: input.performerClass,
      actType: "suspension",
    });
  } catch (err) {
    if (err instanceof OrchestraConstitutionalError) {
      throw new OrchestraConstitutionalError(
        err.message,
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R84"],
      );
    }
    throw err;
  }
  assertEstablishedHandoffGovernanceAuthorityForSuspension(input.authorityClassId);
  assertNoHandoffSuspensionWithdrawalRecallOrReentryClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot perform Handoff suspension acts (R22/R70/R84)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R22", "FI-DSN-STD-015-R70", "FI-DSN-STD-015-R84"],
    );
  }

  const suspendedBy = input.suspendedBy?.trim() ?? "";
  if (!suspendedBy) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension requires attributable suspendedBy actor within HGA scope; actor string alone is not HGA authority (R84)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R84"],
    );
  }
  const lower = suspendedBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_ACTOR_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "suspendedBy must not mint Brain or HAAM-prohibited authority-class identity as Handoff suspender (R70/R84)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R84"],
    );
  }
  return suspendedBy;
}

/**
 * R84–R87 / R75 — assess whether a lawful HGA suspension act may be performed.
 * Does NOT require G11 export_ready. Does NOT mint from catalog/RTC/GPRA/G11/HRWM alone.
 */
export function assessGovernedHandoffSuspension(input: {
  entry: GovernedHandoffEntryRecord | null;
  entryCurrency: HandoffEntryCurrency | null;
  binding: GovernedHandoffConsumerBindingRecord | null;
  bindingCurrency: HandoffConsumerBindingCurrency | null;
  authorization: GovernedHandoffAuthorizationActRecord | null;
  authorizationCurrency: HandoffAuthorizationCurrency | null;
  posture: GovernedHandoffPostureDeclarationActRecord | null;
  postureCurrency: HandoffPostureDeclarationCurrency | null;
  gpraValidityPosture: GpraValidityPosture | null;
  eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  lineageMatchesAuthoritativeGpra: boolean;
  constitutionalBasisKind?: unknown;
  constitutionalBasisNotes?: unknown;
  authorityClassId?: unknown;
  performerClass?: unknown;
  advisoryEvidenceAlone?: unknown;
  implementationInferenceAlone?: unknown;
  downstreamOperationalEventAlone?: unknown;
  rtcCatalogAlone?: unknown;
  gpraInvalidatedAlone?: unknown;
  gpraSupersededAlone?: unknown;
  g11BlockedAlone?: unknown;
  hrwmLossAlone?: unknown;
  spansMultipleBindings?: unknown;
  mergesPostureChains?: unknown;
  silentCrossContextPropagation?: unknown;
  foreignBinding?: unknown;
  unattributedGpraPropagation?: unknown;
  purportedWithdrawalRecordPresent?: unknown;
  purportedRecallRecordPresent?: unknown;
  lifecycleProjectedState?: HandoffActLayerLifecycleState | null;
  priorRecordsPreservedReconstructable?: unknown;
}): GovernedHandoffSuspensionAssessment {
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

  if (!input.authorization) {
    denialReasons.push("missing_current_handoff_authorization");
  } else if (input.authorizationCurrency !== "current") {
    denialReasons.push("stale_handoff_authorization");
  } else if (input.entry && input.authorization.entryId !== input.entry.entryId) {
    denialReasons.push("authorization_foreign_to_entry");
  } else if (
    input.binding &&
    input.authorization.consumerClassId !== input.binding.consumerClassId
  ) {
    denialReasons.push("authorization_foreign_to_binding_consumer_class");
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

  const basisKind = isSuspensionConstitutionalBasisKind(input.constitutionalBasisKind)
    ? input.constitutionalBasisKind
    : null;
  if (!basisKind) {
    denialReasons.push("constitutional_basis_kind_required");
  }

  const notesOnly =
    (typeof input.constitutionalBasisNotes === "string" &&
      input.constitutionalBasisNotes.trim() &&
      !basisKind) ||
    false;
  if (notesOnly) {
    denialReasons.push("notes_cannot_be_sole_constitutional_basis");
  }

  const soleClaimedSubstitutes = [
    input.advisoryEvidenceAlone === true ? "advisory_evidence_alone" : null,
    input.implementationInferenceAlone === true ? "implementation_inference_alone" : null,
    input.downstreamOperationalEventAlone === true
      ? "downstream_operational_event_alone"
      : null,
    input.rtcCatalogAlone === true ? "rtc_catalog_alone" : null,
    input.gpraInvalidatedAlone === true ? "gpra_invalidated_alone" : null,
    input.gpraSupersededAlone === true ? "gpra_superseded_alone" : null,
    input.g11BlockedAlone === true ? "g11_blocked_alone" : null,
    input.hrwmLossAlone === true ? "hrwm_loss_alone" : null,
  ].filter((x): x is string => x !== null);

  if (soleClaimedSubstitutes.length > 0) {
    denialReasons.push(...soleClaimedSubstitutes.map((s) => `${s}_cannot_be_sole_basis`));
  }

  if (
    input.purportedWithdrawalRecordPresent === true ||
    input.purportedRecallRecordPresent === true ||
    (input.lifecycleProjectedState != null &&
      RELIANCE_CEASED_LIFECYCLE_STATES.has(input.lifecycleProjectedState))
  ) {
    denialReasons.push("forward_reliance_already_ceased");
  }

  const shared = assessG6SharedPreconditions({
    actType: "suspension",
    bindingId: input.binding?.bindingId,
    hasPriorAuthorization:
      !!input.authorization && input.authorizationCurrency === "current",
    hasPriorPosture: !!input.posture && input.postureCurrency === "current",
    hasLifecycleOperativeHistory:
      (!!input.authorization && input.authorizationCurrency === "current") ||
      (!!input.posture && input.postureCurrency === "current"),
    hccmBoundContextEstablished: !!input.binding && input.bindingCurrency === "current",
    authorityClassId: input.authorityClassId ?? "handoff_governance_authority",
    performerClass: input.performerClass,
    traceableConstitutionalBasis: basisKind !== null && soleClaimedSubstitutes.length === 0,
    advisoryEvidenceAlone: input.advisoryEvidenceAlone,
    implementationInferenceAlone: input.implementationInferenceAlone,
    downstreamOperationalEventAlone: input.downstreamOperationalEventAlone,
    priorRecordsPreservedReconstructable: input.priorRecordsPreservedReconstructable,
  });
  if (!shared.sharedCategoriesSatisfied) {
    for (const reason of shared.denialReasons) {
      if (!denialReasons.includes(reason)) denialReasons.push(reason);
    }
  }

  try {
    assertG6LifecycleActSubjectScope({
      actType: "suspension",
      bindingId: input.binding?.bindingId,
      spansMultipleBindings: input.spansMultipleBindings,
      mergesPostureChains: input.mergesPostureChains,
      silentCrossContextPropagation: input.silentCrossContextPropagation,
      foreignBinding: input.foreignBinding,
      unattributedGpraPropagation: input.unattributedGpraPropagation,
    });
  } catch {
    denialReasons.push("g6_subject_scope_denied");
  }

  const maySuspend = denialReasons.length === 0;
  return Object.freeze({
    maySuspend,
    denialReasons: Object.freeze([...denialReasons]),
    authorityClassId: maySuspend ? ("handoff_governance_authority" as const) : null,
    entryCurrency: input.entryCurrency,
    bindingCurrency: input.bindingCurrency,
    authorizationCurrency: input.authorizationCurrency,
    postureDeclarationCurrency: input.postureCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    eligibilityLayerCondition: input.eligibilityLayerCondition,
    constitutionalBasisKind: basisKind,
    doesNotAuthorizeActMintViaCatalogAlone: true as const,
    doesNotAuthorizeActMintViaRtcCatalogAlone: true as const,
    doesNotAuthorizeActMintViaGpraInvalidatedOrSupersededAlone: true as const,
    doesNotAuthorizeActMintViaG11BlockedAlone: true as const,
    doesNotAuthorizeActMintViaHrwmLossAlone: true as const,
    doesNotAuthorizeActMintViaAdvisoryAlone: true as const,
    notHandoffWithdrawal: true as const,
    notHandoffRecall: true as const,
    notHandoffCompletion: true as const,
    notHercmReentryOrResumption: true as const,
  });
}

/**
 * R95 — current authoritative suspension = latest additive suspension for the binding.
 * Tip by suspendedAt; currency evaluation is separate and subordinate.
 */
export function selectAuthoritativeGovernedHandoffSuspension(
  suspensions: readonly GovernedHandoffSuspensionActRecord[],
): GovernedHandoffSuspensionActRecord | null {
  if (suspensions.length === 0) return null;
  return [...suspensions].sort((a, b) => a.suspendedAt.localeCompare(b.suspendedAt)).at(-1)!;
}

export function evaluateHandoffSuspensionCurrencyFromFacts(input: {
  suspension: GovernedHandoffSuspensionActRecord;
  currentEntryCurrency: HandoffEntryCurrency;
  currentBindingCurrency: HandoffConsumerBindingCurrency;
  authoritativeSuspensionActId: GovernedHandoffSuspensionActId | null;
  gpraValidityPosture: GpraValidityPosture | null;
  lineageMatchesAuthoritativeGpra: boolean;
}): HandoffSuspensionCurrency {
  if (
    input.currentEntryCurrency !== "current" ||
    input.currentBindingCurrency !== "current"
  ) {
    return "stale";
  }
  if (
    input.authoritativeSuspensionActId != null &&
    input.suspension.suspensionActId !== input.authoritativeSuspensionActId
  ) {
    return "stale";
  }
  if (input.gpraValidityPosture !== "retention" || !input.lineageMatchesAuthoritativeGpra) {
    return "stale";
  }
  return "current";
}

export interface CreateGovernedHandoffSuspensionActInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly binding: GovernedHandoffConsumerBindingRecord;
  readonly authorization: GovernedHandoffAuthorizationActRecord;
  readonly posture: GovernedHandoffPostureDeclarationActRecord;
  readonly authorityClassId: unknown;
  readonly suspendedBy: string;
  readonly suspendedAt?: string;
  readonly constitutionalBasisKind: unknown;
  readonly constitutionalBasisNotes?: unknown;
  readonly sourceAttribution?: unknown;
  readonly performerClass?: unknown;
  readonly withdrawalActId?: unknown;
  readonly recallActId?: unknown;
  readonly expiryActId?: unknown;
  readonly resumeHandoff?: unknown;
  readonly restoreHandoff?: unknown;
  readonly reenterHandoff?: unknown;
  readonly withdrawHandoff?: unknown;
  readonly recallHandoff?: unknown;
  readonly expireHandoff?: unknown;
  readonly executesHandoff?: unknown;
  readonly handoffExecuted?: unknown;
  readonly performHandoff?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillmentExecutionId?: unknown;
  readonly executionQueueId?: unknown;
  readonly constitutionalQueueId?: unknown;
  readonly brainSuspendHandoff?: unknown;
  readonly brainHandoffSuspension?: unknown;
  readonly implicitSuspension?: unknown;
  readonly rtcCatalogAlone?: unknown;
  readonly rejectHandoff?: unknown;
  readonly hercmReentryId?: unknown;
  readonly resumptionActId?: unknown;
  readonly restorationActId?: unknown;
}

/**
 * Construct an operative HGA suspension act + HOEM suspension record.
 * Caller must have verified R85–R88 prerequisites.
 */
export function createGovernedHandoffSuspensionActRecord(
  input: CreateGovernedHandoffSuspensionActInput,
): GovernedHandoffSuspensionActRecord {
  assertNoHandoffSuspensionWithdrawalRecallOrReentryClaims(
    input as unknown as Record<string, unknown>,
  );
  const suspendedBy = assertGovernedHandoffSuspensionActor(input);
  assertEstablishedHandoffGovernanceAuthorityForSuspension(input.authorityClassId);
  assertHgaMatrixActMayBePerformed("suspension");
  assertSuspensionConstitutionalBasisKind(input.constitutionalBasisKind);
  const hga = resolveEstablishedHandoffGovernanceAuthorityClass(
    input.authorityClassId as "handoff_governance_authority",
  );

  const entry = input.entry;
  const binding = input.binding;
  const authorization = input.authorization;
  const posture = input.posture;
  const basisKind = input.constitutionalBasisKind;

  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension requires HCCM binding belonging to the provided G1 entry (R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  if (authorization.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension requires authorization belonging to the provided entry (R85a/R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R85", "FI-DSN-STD-015-R88"],
    );
  }
  if (authorization.consumerClassId !== binding.consumerClassId) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension requires authorization matching the binding consumer class (R85a/R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R85", "FI-DSN-STD-015-R88"],
    );
  }
  if (posture.bindingId !== binding.bindingId || posture.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff suspension requires authoritative posture belonging to the provided binding and entry (R85a/R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R85", "FI-DSN-STD-015-R88"],
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
      "Handoff suspension rejected: binding lineage does not match entry (R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }

  const notes =
    typeof input.constitutionalBasisNotes === "string" &&
    input.constitutionalBasisNotes.trim()
      ? input.constitutionalBasisNotes.trim()
      : null;
  const provenance: SuspensionConstitutionalBasisProvenance = Object.freeze({
    basisKind,
    notes,
    notesCannotBeSoleBasis: true as const,
  });

  const now = input.suspendedAt ?? new Date().toISOString();
  const suspensionActId = createGovernedHandoffSuspensionActId();
  const hoemSuspensionRecord: HoemSuspensionOperativeRecord = Object.freeze({
    hoemSuspensionRecordId: createHoemSuspensionOperativeRecordId(),
    suspensionActId,
    actType: "suspension" as const,
    gpraId: entry.gpraId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    bindingId: binding.bindingId,
    consumerClassId: binding.consumerClassId,
    authorizationActId: authorization.authorizationActId,
    postureDeclarationActId: posture.postureDeclarationActId,
    constitutionalBasisKind: basisKind,
    effectiveAt: now,
    doesNotMergeAuthorizationAttribution: true as const,
    doesNotMergePostureDeclarationAttribution: true as const,
    doesNotMergeCompletionAttribution: true as const,
    doesNotMergeLifecycleAttribution: true as const,
    doesNotMergeWithdrawalAttribution: true as const,
    doesNotMergeRecallAttribution: true as const,
  });

  return Object.freeze({
    suspensionActId,
    authorityClassId: hga.authorityClassId,
    authorityGoverningSourceId: hga.governingSourceId,
    authorityConstitutionalScope: "handoff_suspension_act" as const,
    suspendedBy,
    suspendedAt: now,
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorizationActId: authorization.authorizationActId,
    postureDeclarationActId: posture.postureDeclarationActId,
    preparationId: entry.preparationId,
    gpraId: entry.gpraId,
    approvalActId: entry.approvalActId,
    reviewId: entry.reviewId,
    determinationId: entry.determinationId,
    rvaId: entry.rvaId,
    programId: entry.programId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    consumerClassId: binding.consumerClassId,
    declaredPostureClass: posture.declaredPostureClass,
    consumedHcbmBoundaryKeys: Object.freeze([
      ...binding.consumedHcbmBoundaryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    consumerCategoryKeys: Object.freeze([
      ...entry.consumerCategoryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    constitutionalBasisKind: basisKind,
    constitutionalBasisProvenance: provenance,
    forwardReliancePaused: true as const,
    doesNotTerminatePosture: true as const,
    doesNotEraseAuthorization: true as const,
    notHandoffWithdrawal: true as const,
    notHandoffRecall: true as const,
    notHandoffCompletion: true as const,
    notHercmReentry: true as const,
    notResumption: true as const,
    notRestoration: true as const,
    effectFraming: "temporary_forward_reliance_pause" as const,
    hoemSuspensionRecord,
    notHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffExecution: true as const,
    notDownstreamAcceptance: true as const,
    notPermanentCollectionMembership: true as const,
    doesNotAuthorizeManufacturingOrFulfillment: true as const,
    doesNotCollapsePeerDecisionClasses: true as const,
    doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory: true as const,
    doesNotMergeAcrossConsumerClasses: true as const,
    notAutomaticHslmPromotion: true as const,
    hslmProjectionFromActFacts: true as const,
    r84DistinctHgaSuspensionAct: true as const,
    r85SharedPreconditionsPlusTriggers: true as const,
    r86NoSuspendAfterRelianceCeased: true as const,
    r87NoSoleRtcGpraG11HrwmBasis: true as const,
    r88SingleBindingPostureChain: true as const,
    r89ConstitutionalBasisAndProvenance: true as const,
    r90EffectFromSuspendedAtForward: true as const,
    r91TemporaryForwardReliancePause: true as const,
    r92AttributedBindingOnly: true as const,
    r93HoemSuspensionOperativeRecord: true as const,
    r94NotAutomaticHslmPromotion: true as const,
    r95RepeatedSuspensionsAdditive: true as const,
    r96InvalidAttemptsNonOperative: true as const,
    r97NotWithdrawalRecallOrReentry: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: suspendedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_SUSPENSION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
