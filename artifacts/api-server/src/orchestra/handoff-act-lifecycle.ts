/**
 * Governed Handoff Act-Layer Lifecycle — FI-DSN-STD-015 HOF-G5 (R48–R57).
 *
 * Closed HSLM act-layer vocabulary + Completion act.
 * Rejected remains R48 vocabulary / R51 meaning (withheld auth or posture) — not an HGA act type.
 * Evaluation scoped to one HCCM binding + one authoritative HPPM posture chain (R50).
 * Does NOT create expire operative acts (HOF-G6 expiry deferred).
 * HOF-G6-U2 suspension, HOF-G6-U3 withdrawal, and HOF-G6-U4 recall projection are supplied by evaluate callers.
 * Does NOT promote lifecycle via GPRA invalidation alone (R57).
 * Does NOT invent Rejected from absence of authorization or posture (R57).
 *
 * Raw constructors — prefer Domain3Repository.completeGovernedHandoff.
 * NOT exported from orchestra barrel.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffCompletionActId,
  GovernedHandoffCompletionActRecord,
  GovernedHandoffCompletionAssessment,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreparationRecord,
  GpraValidityPosture,
  HandoffActLayerLifecycleEvaluation,
  HandoffActLayerLifecycleState,
  HandoffAuthorizationCurrency,
  HandoffCompletionCurrency,
  HandoffConsumerBindingCurrency,
  HandoffConsumerCategoryKey,
  HandoffEligibilityLayerCondition,
  HandoffEntryCurrency,
  HandoffPostureDeclarationCurrency,
  HandoffPreparationCurrency,
  HoemCompletionOperativeRecord,
  HoemCompletionOperativeRecordId,
  GovernedHandoffSuspensionActRecord,
  GovernedHandoffWithdrawalActRecord,
  GovernedHandoffRecallActRecord,
  GovernedHandoffResumptionActRecord,
  GovernedHandoffReentryActRecord,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertEstablishedHandoffGovernanceAuthorityForCompletion,
  resolveEstablishedHandoffGovernanceAuthorityClass,
} from "./handoff-governance-authority.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G5_REQUIREMENTS = [
  "FI-DSN-STD-015-R48",
  "FI-DSN-STD-015-R49",
  "FI-DSN-STD-015-R50",
  "FI-DSN-STD-015-R51",
  "FI-DSN-STD-015-R52",
  "FI-DSN-STD-015-R53",
  "FI-DSN-STD-015-R54",
  "FI-DSN-STD-015-R55",
  "FI-DSN-STD-015-R56",
  "FI-DSN-STD-015-R57",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_ACT_LAYER_LIFECYCLE_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G5_REQUIREMENTS]);

/**
 * Frozen closed HSLM act-layer vocabulary (R48). Exact ids only.
 */
export const FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES = [
  "eligible_for_consideration",
  "authorized",
  "completed",
  "rejected",
  "suspended",
  "withdrawn",
  "recalled",
  "expired",
] as const satisfies readonly HandoffActLayerLifecycleState[];

const LIFECYCLE_STATE_SET = new Set<string>(FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES);

export function isFrozenHandoffActLayerLifecycleState(
  value: unknown,
): value is HandoffActLayerLifecycleState {
  return typeof value === "string" && LIFECYCLE_STATE_SET.has(value);
}

export function assertFrozenHandoffActLayerLifecycleState(
  value: unknown,
): asserts value is HandoffActLayerLifecycleState {
  if (!isFrozenHandoffActLayerLifecycleState(value)) {
    throw new OrchestraConstitutionalError(
      "Handoff act-layer lifecycle requires a frozen HSLM state id; invented labels are prohibited (R48)",
      "invalid_handoff_act_lifecycle",
      ["FI-DSN-STD-015-R48"],
    );
  }
}

const COMPLETION_FORBIDDEN_KEYS = [
  "suspensionActId",
  "recallActId",
  "withdrawalActId",
  "expiryActId",
  "executesHandoff",
  "handoffExecuted",
  "performHandoff",
  "manufacturingExecutionId",
  "fulfillmentExecutionId",
  "productionExecutionId",
  "executionQueueId",
  "constitutionalQueueId",
  "brainAuthorizesHandoff",
  "brainCompleteHandoff",
  "brainHandoffCompletion",
  "implicitCompletion",
  "automaticInheritanceCompletion",
  "inferredEligibilityCompletion",
  "configurationDrivenCompletion",
  "downstreamAcceptanceId",
  "permanentCollectionMembershipId",
  "hoemAuthorizationRecordId",
  "hoemPostureDeclarationRecordId",
  "hoemSuspensionRecordId",
  "hoemRecallRecordId",
  "hoemWithdrawalRecordId",
  "suspendHandoff",
  "recallHandoff",
  "withdrawHandoff",
  "expireHandoff",
  "acceptDownstream",
  "membershipAdmission",
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

export function createGovernedHandoffCompletionActId(): GovernedHandoffCompletionActId {
  return `governed-handoff-completion-act-${randomUUID()}` as GovernedHandoffCompletionActId;
}

export function createHoemCompletionOperativeRecordId(): HoemCompletionOperativeRecordId {
  return `hoem-completion-operative-${randomUUID()}` as HoemCompletionOperativeRecordId;
}

export function assertNoHandoffCompletionExecutionOrDeferredLifecycleClaims(
  input: Record<string, unknown>,
): void {
  for (const key of COMPLETION_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Handoff completion must not suspend, recall, withdraw, expire, accept downstream, execute, or claim implicit completion (R51/R57; G6 deferred)",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R57"],
      );
    }
  }
}

/**
 * R51 / R56 / R57 — HGA class required; actor attribution is distinct and cannot mint authority.
 */
export function assertGovernedHandoffCompletionActor(input: {
  completedBy: string;
  authorityClassId: unknown;
  sourceAttribution?: unknown;
}): string {
  assertEstablishedHandoffGovernanceAuthorityForCompletion(input.authorityClassId);
  assertNoHandoffCompletionExecutionOrDeferredLifecycleClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot perform Handoff completion acts (R22/R57)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R22", "FI-DSN-STD-015-R57"],
    );
  }

  const completedBy = input.completedBy?.trim() ?? "";
  if (!completedBy) {
    throw new OrchestraConstitutionalError(
      "Handoff completion requires attributable completedBy actor within HGA scope; actor string alone is not HGA authority (R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }
  const lower = completedBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_ACTOR_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "completedBy must not mint Brain or HAAM-prohibited authority-class identity as Handoff completer (R57)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R57"],
    );
  }
  return completedBy;
}

/**
 * R51 — completion requires current binding + entry + authoritative current posture.
 * Does NOT require prior authorization act (G4 independence preserved).
 */
export function assessGovernedHandoffCompletion(input: {
  entry: GovernedHandoffEntryRecord | null;
  entryCurrency: HandoffEntryCurrency | null;
  binding: GovernedHandoffConsumerBindingRecord | null;
  bindingCurrency: HandoffConsumerBindingCurrency | null;
  posture: GovernedHandoffPostureDeclarationActRecord | null;
  postureCurrency: HandoffPostureDeclarationCurrency | null;
  preparation: GovernedHandoffPreparationRecord | null;
  preparationCurrency: HandoffPreparationCurrency | null;
  gpraValidityPosture: GpraValidityPosture | null;
  eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  lineageMatchesAuthoritativeGpra: boolean;
}): GovernedHandoffCompletionAssessment {
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

  const mayComplete = denialReasons.length === 0;
  return Object.freeze({
    mayComplete,
    denialReasons: Object.freeze([...denialReasons]),
    authorityClassId: mayComplete ? ("handoff_governance_authority" as const) : null,
    entryCurrency: input.entryCurrency,
    bindingCurrency: input.bindingCurrency,
    postureDeclarationCurrency: input.postureCurrency,
    preparationCurrency: input.preparationCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    eligibilityLayerCondition: input.eligibilityLayerCondition,
    notHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffExecution: true as const,
    notDownstreamAcceptance: true as const,
    notPermanentCollectionMembership: true as const,
    notCompletionSuspensionRecallOrWithdrawalMechanics: true as const,
    substitutesRejected: true as const,
  });
}

/**
 * R56 — current authoritative completion = latest additive completion for the binding.
 */
export function selectAuthoritativeGovernedHandoffCompletion(
  completions: readonly GovernedHandoffCompletionActRecord[],
): GovernedHandoffCompletionActRecord | null {
  if (completions.length === 0) return null;
  return [...completions].sort((a, b) => a.completedAt.localeCompare(b.completedAt)).at(-1)!;
}

export function evaluateHandoffCompletionCurrencyFromFacts(input: {
  completion: GovernedHandoffCompletionActRecord;
  currentEntryCurrency: HandoffEntryCurrency;
  currentBindingCurrency: HandoffConsumerBindingCurrency;
  authoritativeCompletionActId: GovernedHandoffCompletionActId | null;
}): HandoffCompletionCurrency {
  if (
    input.currentEntryCurrency !== "current" ||
    input.currentBindingCurrency !== "current"
  ) {
    return "stale";
  }
  if (
    input.authoritativeCompletionActId != null &&
    input.completion.completionActId !== input.authoritativeCompletionActId
  ) {
    return "stale";
  }
  return "current";
}

/**
 * Priority: current authoritative recall → current authoritative withdrawal →
 * current authoritative suspension → completed → authorized → eligible_for_consideration.
 * Does NOT invent Rejected from absence of auth/posture (R57).
 * Does NOT invent suspended/withdrawn/recalled/expired from GPRA invalidation.
 * Rejected remains R48 vocabulary / R51 meaning until G2/G4 withhold facts exist.
 *
 * HERCM (R126–R139) is additive and adds NO HSLM state — the vocabulary stays exactly
 * eight, with no `reentered` or `resumed` (R137). A current HERCM tip only changes which
 * prior tip controls the projection:
 *
 * - A current REC-02 resumption lifts the suspension pause, so `suspended` is no longer
 *   projected and the binding continues to completed/authorized/eligible on its EXISTING
 *   authorization and posture chain (R132/R133).
 * - A current REC-01/03/04/05 re-entry makes the qualifying cessation tip historical, so
 *   `withdrawn`/`recalled` are no longer projected. Re-entry returns the binding toward
 *   `eligible_for_consideration` ONLY: the predecessor authorization is never resurrected,
 *   and `authorized` requires a NEW authorization minted at or after the re-entry (R132).
 *
 * Neither act deletes a tip (R135) — cessation records remain loadable and still block a
 * second withdrawal or recall under R100/R114.
 */
export function evaluateHandoffActLayerLifecycleFromFacts(input: {
  binding: GovernedHandoffConsumerBindingRecord | null;
  entry: GovernedHandoffEntryRecord | null;
  entryCurrency: HandoffEntryCurrency | null;
  bindingCurrency: HandoffConsumerBindingCurrency | null;
  gpraValidityPosture: GpraValidityPosture | null;
  eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  lineageMatchesAuthoritativeGpra: boolean;
  authoritativeCompletion: GovernedHandoffCompletionActRecord | null;
  completionIsCurrent: boolean;
  matchingAuthorization: GovernedHandoffAuthorizationActRecord | null;
  authorizationCurrency: HandoffAuthorizationCurrency | null;
  authoritativePosture: GovernedHandoffPostureDeclarationActRecord | null;
  authoritativeSuspension?: GovernedHandoffSuspensionActRecord | null;
  suspensionIsCurrent?: boolean;
  authoritativeWithdrawal?: GovernedHandoffWithdrawalActRecord | null;
  withdrawalIsCurrent?: boolean;
  authoritativeRecall?: GovernedHandoffRecallActRecord | null;
  recallIsCurrent?: boolean;
  authoritativeResumption?: GovernedHandoffResumptionActRecord | null;
  resumptionIsCurrent?: boolean;
  authoritativeReentry?: GovernedHandoffReentryActRecord | null;
  reentryIsCurrent?: boolean;
}): HandoffActLayerLifecycleEvaluation {
  const recallControls = Boolean(input.authoritativeRecall && input.recallIsCurrent);
  const withdrawalControls = Boolean(
    input.authoritativeWithdrawal && input.withdrawalIsCurrent,
  );
  const suspensionControls = Boolean(
    input.authoritativeSuspension && input.suspensionIsCurrent,
  );

  const resumption =
    input.authoritativeResumption && input.resumptionIsCurrent
      ? input.authoritativeResumption
      : null;
  const reentry =
    input.authoritativeReentry && input.reentryIsCurrent ? input.authoritativeReentry : null;

  // R132/R133 — a resumption only lifts the pause of the suspension it targets, and only
  // when nothing later re-suspended the binding.
  const resumptionClearsSuspendedProjection = Boolean(
    resumption &&
      suspensionControls &&
      input.authoritativeSuspension &&
      resumption.resumedSuspensionActId ===
        input.authoritativeSuspension.suspensionActId &&
      resumption.resumedAt.localeCompare(input.authoritativeSuspension.suspendedAt) >= 0,
  );

  // R135 — the cessation tip survives; it simply stops controlling once a later re-entry
  // is current. A cessation minted after the re-entry controls again.
  const cessationAt = recallControls
    ? input.authoritativeRecall!.recalledAt
    : withdrawalControls
      ? input.authoritativeWithdrawal!.withdrawnAt
      : null;
  const reentryClearsCessationProjection = Boolean(
    reentry &&
      cessationAt != null &&
      reentry.reenteredAt.localeCompare(cessationAt) >= 0,
  );

  const bindingLineageEligible = Boolean(
    input.entry &&
      input.binding &&
      input.entryCurrency === "current" &&
      input.bindingCurrency === "current" &&
      input.eligibilityLayerCondition === "export_ready" &&
      input.gpraValidityPosture === "retention" &&
      input.lineageMatchesAuthoritativeGpra,
  );

  const authorizationControls = Boolean(
    input.matchingAuthorization &&
      input.authorizationCurrency === "current" &&
      input.binding &&
      input.matchingAuthorization.consumerClassId === input.binding.consumerClassId,
  );

  let currentState: HandoffActLayerLifecycleState | null = null;

  if (reentryClearsCessationProjection && reentry) {
    // R132 — return toward Eligible-for-consideration ONLY. The predecessor authorization
    // is not resurrected: `authorized` requires a NEW authorization at or after re-entry.
    const newAuthorizationAfterReentry = Boolean(
      authorizationControls &&
        input.matchingAuthorization!.authorizedAt.localeCompare(reentry.reenteredAt) >= 0,
    );
    if (newAuthorizationAfterReentry) {
      currentState = "authorized";
    } else if (bindingLineageEligible) {
      currentState = "eligible_for_consideration";
    }
  } else if (recallControls) {
    currentState = "recalled";
  } else if (withdrawalControls) {
    currentState = "withdrawn";
  } else if (suspensionControls && !resumptionClearsSuspendedProjection) {
    currentState = "suspended";
  } else if (input.authoritativeCompletion && input.completionIsCurrent) {
    currentState = "completed";
  } else if (authorizationControls) {
    currentState = "authorized";
  } else if (bindingLineageEligible) {
    currentState = "eligible_for_consideration";
  }

  return Object.freeze({
    bindingId: input.binding?.bindingId ?? ("governed-handoff-consumer-binding-missing" as never),
    entryId: input.entry?.entryId ?? null,
    consumerClassId: input.binding?.consumerClassId ?? null,
    currentState,
    authoritativeCompletionActId: input.authoritativeCompletion?.completionActId ?? null,
    authoritativeSuspensionActId: input.authoritativeSuspension?.suspensionActId ?? null,
    authoritativeWithdrawalActId: input.authoritativeWithdrawal?.withdrawalActId ?? null,
    authoritativeRecallActId: input.authoritativeRecall?.recallActId ?? null,
    authoritativeResumptionActId: resumption?.resumptionActId ?? null,
    authoritativeReentryActId: reentry?.reentryActId ?? null,
    resumptionClearsSuspendedProjection,
    reentryClearsCessationProjection,
    authoritativeRejectionAttributionId: null,
    authoritativePostureDeclarationActId:
      input.authoritativePosture?.postureDeclarationActId ?? null,
    matchingAuthorizationActId: input.matchingAuthorization?.authorizationActId ?? null,
    entryCurrency: input.entryCurrency,
    bindingCurrency: input.bindingCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    eligibilityLayerCondition: input.eligibilityLayerCondition,
    notHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffAcceptance: true as const,
    notManufacturingClearance: true as const,
    notG11EligibilityLayerState: true as const,
    withdrawalRecallExpiredMechanicsDeferred: false as const,
    recallExpiredMechanicsDeferred: false as const,
    suspensionMechanicsOperative: true as const,
    withdrawalMechanicsOperative: true as const,
    recallMechanicsOperative: true as const,
    hercmMechanicsOperative: true as const,
    hslmRemainsEightStates: true as const,
    noReenteredOrResumedHslmState: true as const,
    r140PlusUnavailable: true as const,
    r48ClosedHslmVocabulary: true as const,
    r49PeerDistinctLifecycle: true as const,
    r50SingleBindingPostureChain: true as const,
    r57NoImplicitLifecyclePromotion: true as const,
  });
}

export interface CreateGovernedHandoffCompletionActInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly binding: GovernedHandoffConsumerBindingRecord;
  readonly posture: GovernedHandoffPostureDeclarationActRecord;
  readonly authorityClassId: unknown;
  readonly completedBy: string;
  readonly completedAt?: string;
  readonly sourceAttribution?: unknown;
  readonly suspensionActId?: unknown;
  readonly recallActId?: unknown;
  readonly withdrawalActId?: unknown;
  readonly expiryActId?: unknown;
  readonly executesHandoff?: unknown;
  readonly handoffExecuted?: unknown;
  readonly performHandoff?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillmentExecutionId?: unknown;
  readonly executionQueueId?: unknown;
  readonly constitutionalQueueId?: unknown;
  readonly brainCompleteHandoff?: unknown;
  readonly brainHandoffCompletion?: unknown;
  readonly implicitCompletion?: unknown;
  readonly automaticInheritanceCompletion?: unknown;
  readonly inferredEligibilityCompletion?: unknown;
  readonly configurationDrivenCompletion?: unknown;
  readonly downstreamAcceptanceId?: unknown;
  readonly permanentCollectionMembershipId?: unknown;
  readonly suspendHandoff?: unknown;
  readonly recallHandoff?: unknown;
  readonly withdrawHandoff?: unknown;
  readonly expireHandoff?: unknown;
  readonly acceptDownstream?: unknown;
  readonly membershipAdmission?: unknown;
}

/**
 * Construct an operative HGA completion act + HOEM completion record.
 * Caller must have verified current posture + entry prerequisites (R51/R56).
 */
export function createGovernedHandoffCompletionActRecord(
  input: CreateGovernedHandoffCompletionActInput,
): GovernedHandoffCompletionActRecord {
  assertNoHandoffCompletionExecutionOrDeferredLifecycleClaims(
    input as unknown as Record<string, unknown>,
  );
  const completedBy = assertGovernedHandoffCompletionActor(input);
  assertEstablishedHandoffGovernanceAuthorityForCompletion(input.authorityClassId);
  const hga = resolveEstablishedHandoffGovernanceAuthorityClass(
    input.authorityClassId as "handoff_governance_authority",
  );

  const entry = input.entry;
  const binding = input.binding;
  const posture = input.posture;

  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff completion requires HCCM binding belonging to the provided G1 entry (R50/R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50", "FI-DSN-STD-015-R51"],
    );
  }
  if (posture.bindingId !== binding.bindingId || posture.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff completion requires authoritative posture belonging to the provided binding and entry (R50/R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50", "FI-DSN-STD-015-R51"],
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
      "Handoff completion rejected: binding lineage does not match entry (R50)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50"],
    );
  }

  const now = input.completedAt ?? new Date().toISOString();
  const completionActId = createGovernedHandoffCompletionActId();
  const hoemCompletionRecord: HoemCompletionOperativeRecord = Object.freeze({
    hoemCompletionRecordId: createHoemCompletionOperativeRecordId(),
    completionActId,
    actType: "completion" as const,
    gpraId: entry.gpraId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    bindingId: binding.bindingId,
    consumerClassId: binding.consumerClassId,
    postureDeclarationActId: posture.postureDeclarationActId,
    declaredPostureClass: posture.declaredPostureClass,
    doesNotMergeAuthorizationAttribution: true as const,
    doesNotMergePostureDeclarationAttribution: true as const,
    doesNotMergeLifecycleAttribution: true as const,
    doesNotMergeSuspensionAttribution: true as const,
    doesNotMergeWithdrawalAttribution: true as const,
    doesNotMergeRecallAttribution: true as const,
  });

  return Object.freeze({
    completionActId,
    authorityClassId: hga.authorityClassId,
    authorityGoverningSourceId: hga.governingSourceId,
    authorityConstitutionalScope: "handoff_completion_act" as const,
    completedBy,
    completedAt: now,
    entryId: entry.entryId,
    bindingId: binding.bindingId,
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
    hoemCompletionRecord,
    notHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffExecution: true as const,
    notHandoffSuspension: true as const,
    notHandoffRecall: true as const,
    notHandoffWithdrawal: true as const,
    notDownstreamAcceptance: true as const,
    notPermanentCollectionMembership: true as const,
    doesNotAuthorizeManufacturingOrFulfillment: true as const,
    doesNotCollapsePeerDecisionClasses: true as const,
    doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory: true as const,
    doesNotMergeAcrossConsumerClasses: true as const,
    r48ClosedHslmVocabulary: true as const,
    r49PeerDistinctLifecycle: true as const,
    r50SingleBindingPostureChain: true as const,
    r51CompletedMeaning: true as const,
    r56HoemCompletionOperativeRecord: true as const,
    r57NoImplicitLifecyclePromotion: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: completedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_ACT_LAYER_LIFECYCLE_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
