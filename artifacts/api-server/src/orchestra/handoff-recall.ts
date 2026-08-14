/**
 * Governed Handoff Recall — FI-DSN-STD-015 HOF-G6-U4 (R112–R125).
 *
 * Distinct HGA recall act; responsive forward-reliance termination (R55 / R119)
 * via satisfied HRTCM RTC-01 through RTC-04 triggers. Peer-distinct from
 * suspension temporary pause (R52) and withdrawal HGA-initiated retraction (R53).
 *
 * Does NOT suspend-as-recall, withdraw-as-recall, resume, restore, or reenter.
 * Does NOT mint a generic performHgaAct factory.
 *
 * Raw constructors — prefer Domain3Repository.recallGovernedHandoff.
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
  GovernedHandoffRecallActId,
  GovernedHandoffRecallActRecord,
  GovernedHandoffRecallAssessment,
  GpraValidityPosture,
  HandoffActLayerLifecycleState,
  HandoffAuthorizationCurrency,
  HandoffConsumerBindingCurrency,
  HandoffConsumerCategoryKey,
  HandoffEligibilityLayerCondition,
  HandoffEntryCurrency,
  HandoffPostureDeclarationCurrency,
  HandoffRecallCurrency,
  HoemRecallOperativeRecord,
  HoemRecallOperativeRecordId,
  HrtcmRecallTriggerId,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import { assertHgaMatrixActMayBePerformed } from "./handoff-authority-catalog.js";
import {
  assertEstablishedHandoffGovernanceAuthorityForRecall,
  resolveEstablishedHandoffGovernanceAuthorityClass,
} from "./handoff-governance-authority.js";
import {
  HRTCM_RECALL_TRIGGER_IDS,
  isHrtcmRecallTriggerId,
  normalizeSatisfiedHrtcmTriggers,
} from "./handoff-hrtcm.js";
import {
  assertG6LifecycleActSubjectScope,
  assertHgaSolePerformerForG6LifecycleAct,
  assessG6SharedPreconditions,
} from "./handoff-lifecycle-g6-foundation.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G6_U4_REQUIREMENTS = [
  "FI-DSN-STD-015-R112",
  "FI-DSN-STD-015-R113",
  "FI-DSN-STD-015-R114",
  "FI-DSN-STD-015-R115",
  "FI-DSN-STD-015-R116",
  "FI-DSN-STD-015-R117",
  "FI-DSN-STD-015-R118",
  "FI-DSN-STD-015-R119",
  "FI-DSN-STD-015-R120",
  "FI-DSN-STD-015-R121",
  "FI-DSN-STD-015-R122",
  "FI-DSN-STD-015-R123",
  "FI-DSN-STD-015-R124",
  "FI-DSN-STD-015-R125",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_RECALL_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G6_U4_REQUIREMENTS]);

const RECALL_FORBIDDEN_KEYS = [
  "withdrawalActId",
  "expiryActId",
  "resumeHandoff",
  "restoreHandoff",
  "reenterHandoff",
  "reinstateHandoff",
  "reviveHandoff",
  "reactivateHandoff",
  "withdrawHandoff",
  "expireHandoff",
  "executesHandoff",
  "handoffExecuted",
  "performHandoff",
  "manufacturingExecutionId",
  "fulfillmentExecutionId",
  "productionExecutionId",
  "executionQueueId",
  "constitutionalQueueId",
  "brainRecallHandoff",
  "brainHandoffRecall",
  "brainAuthorizesHandoff",
  "implicitRecall",
  "automaticInheritanceRecall",
  "inferredEligibilityRecall",
  "configurationDrivenRecall",
  "rtcCatalogAlone",
  "hrtcmRtcAlone",
  "rejectHandoff",
  "hoemWithdrawalRecordId",
  "hercmReentryId",
  "resumptionActId",
  "restorationActId",
  "performHgaAct",
  "performG6LifecycleAct",
  "applyLifecycleState",
  "constitutionalBasisKind",
  "constitutionalBasisNotes",
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

export function createGovernedHandoffRecallActId(): GovernedHandoffRecallActId {
  return `governed-handoff-recall-act-${randomUUID()}` as GovernedHandoffRecallActId;
}

export function createHoemRecallOperativeRecordId(): HoemRecallOperativeRecordId {
  return `hoem-recall-operative-${randomUUID()}` as HoemRecallOperativeRecordId;
}

export function assertNoHandoffRecallWithdrawalOrReentryClaims(
  input: Record<string, unknown>,
): void {
  for (const key of RECALL_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Handoff recall must not withdraw, resume, restore, reenter, execute, reject, or claim RTC-alone mint (R112/R124/R125)",
        "invalid_handoff_recall",
        ["FI-DSN-STD-015-R112", "FI-DSN-STD-015-R124", "FI-DSN-STD-015-R125"],
      );
    }
  }
}

function parseClaimedSatisfiedHrtcmTriggers(
  value: unknown,
): readonly HrtcmRecallTriggerId[] {
  if (!Array.isArray(value) || value.length === 0) return [];
  const out: HrtcmRecallTriggerId[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!isHrtcmRecallTriggerId(item) || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return Object.freeze([...out]);
}

function evaluateHrtcmTriggerSatisfaction(input: {
  satisfiedHrtcmTriggers: readonly HrtcmRecallTriggerId[];
  gpraValidityPosture: GpraValidityPosture | null;
  hrwmEligibilityLossSatisfied?: unknown;
  postureChainGovernanceCessationSatisfied?: unknown;
}): string[] {
  const denialReasons: string[] = [];
  const triggers = input.satisfiedHrtcmTriggers;
  if (triggers.length === 0) {
    denialReasons.push("at_least_one_hrtcm_rtc_required");
    return denialReasons;
  }

  for (const trigger of triggers) {
    if (trigger === "RTC-01") {
      if (input.gpraValidityPosture !== "invalidated") {
        denialReasons.push("rtc_01_requires_gpra_invalidated");
      }
    } else if (trigger === "RTC-02") {
      if (input.gpraValidityPosture !== "superseded") {
        denialReasons.push("rtc_02_requires_gpra_superseded");
      }
    } else if (trigger === "RTC-03") {
      if (
        input.gpraValidityPosture === "invalidated" ||
        input.gpraValidityPosture === "superseded"
      ) {
        denialReasons.push("rtc_03_incompatible_with_gpra_invalidated_or_superseded");
      } else if (input.hrwmEligibilityLossSatisfied !== true) {
        denialReasons.push("rtc_03_requires_hrwm_eligibility_loss_satisfied");
      }
    } else if (trigger === "RTC-04") {
      if (input.gpraValidityPosture === "invalidated") {
        denialReasons.push("rtc_04_incompatible_with_gpra_invalidated");
      } else if (input.gpraValidityPosture === "superseded") {
        denialReasons.push("rtc_04_incompatible_with_gpra_superseded");
      } else if (input.postureChainGovernanceCessationSatisfied !== true) {
        denialReasons.push("rtc_04_requires_posture_chain_governance_cessation_satisfied");
      }
    }
  }

  return denialReasons;
}

/**
 * R70 / R112 — HGA class required; actor attribution is distinct and cannot mint authority.
 */
export function assertGovernedHandoffRecallActor(input: {
  recalledBy: string;
  authorityClassId: unknown;
  sourceAttribution?: unknown;
  performerClass?: unknown;
}): string {
  try {
    assertHgaSolePerformerForG6LifecycleAct({
      authorityClassId: input.authorityClassId,
      performerClass: input.performerClass,
      actType: "recall",
    });
  } catch (err) {
    if (err instanceof OrchestraConstitutionalError) {
      throw new OrchestraConstitutionalError(
        err.message,
        "invalid_handoff_recall",
        ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R112"],
      );
    }
    throw err;
  }
  assertEstablishedHandoffGovernanceAuthorityForRecall(input.authorityClassId);
  assertNoHandoffRecallWithdrawalOrReentryClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot perform Handoff recall acts (R22/R70/R112)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R22", "FI-DSN-STD-015-R70", "FI-DSN-STD-015-R112"],
    );
  }

  const recalledBy = input.recalledBy?.trim() ?? "";
  if (!recalledBy) {
    throw new OrchestraConstitutionalError(
      "Handoff recall requires attributable recalledBy actor within HGA scope; actor string alone is not HGA authority (R112)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R112"],
    );
  }
  const lower = recalledBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_ACTOR_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "recalledBy must not mint Brain or HAAM-prohibited authority-class identity as Handoff recaller (R70/R112)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R112"],
    );
  }
  return recalledBy;
}

/**
 * R112–R115 / R75 — assess whether a lawful HGA recall act may be performed.
 * Does NOT require G11 export_ready. Does NOT require prior suspension (R113a).
 * RTC-01/02 permit historical auth/posture attributability under stale currency.
 */
export function assessGovernedHandoffRecall(input: {
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
  satisfiedHrtcmTriggers?: unknown;
  hrtcmTriggerEvidenceNotes?: unknown;
  hrwmEligibilityLossSatisfied?: unknown;
  postureChainGovernanceCessationSatisfied?: unknown;
  authorityClassId?: unknown;
  performerClass?: unknown;
  advisoryEvidenceAlone?: unknown;
  implementationInferenceAlone?: unknown;
  downstreamOperationalEventAlone?: unknown;
  rtcCatalogAlone?: unknown;
  hrtcmRtcAlone?: unknown;
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
  currentRecallAlreadyCeasedReliance?: unknown;
  lifecycleProjectedState?: HandoffActLayerLifecycleState | null;
  priorRecordsPreservedReconstructable?: unknown;
}): GovernedHandoffRecallAssessment {
  const denialReasons: string[] = [];
  const satisfiedHrtcmTriggers = parseClaimedSatisfiedHrtcmTriggers(
    input.satisfiedHrtcmTriggers,
  );
  const usesHistoricalAttribution =
    satisfiedHrtcmTriggers.includes("RTC-01") ||
    satisfiedHrtcmTriggers.includes("RTC-02");
  const usesRetentionAttribution =
    satisfiedHrtcmTriggers.includes("RTC-03") ||
    satisfiedHrtcmTriggers.includes("RTC-04");

  if (!input.entry) {
    denialReasons.push("missing_governed_handoff_entry");
  } else if (!usesHistoricalAttribution && input.entryCurrency !== "current") {
    denialReasons.push("stale_governed_handoff_entry");
  }

  if (!input.binding) {
    denialReasons.push("missing_hccm_consumer_binding");
  } else if (!usesHistoricalAttribution && input.bindingCurrency !== "current") {
    denialReasons.push("stale_hccm_consumer_binding");
  } else if (input.entry && input.binding.entryId !== input.entry.entryId) {
    denialReasons.push("binding_foreign_to_entry");
  }

  // R113(a): prior authorization + posture-relevant chain remain attributable even under suspension pause.
  if (!input.authorization) {
    denialReasons.push("missing_attributable_handoff_authorization");
  } else if (!usesHistoricalAttribution && input.authorizationCurrency !== "current") {
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
  } else if (!usesHistoricalAttribution && input.postureCurrency !== "current") {
    denialReasons.push("stale_authoritative_handoff_posture");
  } else if (input.binding && input.posture.bindingId !== input.binding.bindingId) {
    denialReasons.push("posture_foreign_to_binding");
  } else if (input.entry && input.posture.entryId !== input.entry.entryId) {
    denialReasons.push("posture_foreign_to_entry");
  }

  if (usesRetentionAttribution) {
    if (input.gpraValidityPosture === "invalidated") {
      denialReasons.push("gpra_invalidated");
    } else if (input.gpraValidityPosture === "superseded") {
      denialReasons.push("gpra_superseded");
    } else if (input.gpraValidityPosture !== "retention") {
      denialReasons.push("gpra_not_retention");
    }
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

  for (const reason of evaluateHrtcmTriggerSatisfaction({
    satisfiedHrtcmTriggers,
    gpraValidityPosture: input.gpraValidityPosture,
    hrwmEligibilityLossSatisfied: input.hrwmEligibilityLossSatisfied,
    postureChainGovernanceCessationSatisfied:
      input.postureChainGovernanceCessationSatisfied,
  })) {
    if (!denialReasons.includes(reason)) denialReasons.push(reason);
  }

  const notesOnly =
    typeof input.hrtcmTriggerEvidenceNotes === "string" &&
    input.hrtcmTriggerEvidenceNotes.trim() &&
    satisfiedHrtcmTriggers.length === 0;
  if (notesOnly) {
    denialReasons.push("notes_cannot_be_sole_hrtcm_trigger_basis");
  }

  const soleClaimedSubstitutes = [
    input.advisoryEvidenceAlone === true ? "advisory_evidence_alone" : null,
    input.implementationInferenceAlone === true ? "implementation_inference_alone" : null,
    input.downstreamOperationalEventAlone === true
      ? "downstream_operational_event_alone"
      : null,
    input.rtcCatalogAlone === true ? "rtc_catalog_alone" : null,
    input.hrtcmRtcAlone === true ? "hrtcm_rtc_alone" : null,
    input.gpraInvalidatedAlone === true ? "gpra_invalidated_alone" : null,
    input.gpraSupersededAlone === true ? "gpra_superseded_alone" : null,
    input.g11BlockedAlone === true ? "g11_blocked_alone" : null,
    input.hrwmLossAlone === true ? "hrwm_loss_alone" : null,
  ].filter((x): x is string => x !== null);

  if (soleClaimedSubstitutes.length > 0) {
    denialReasons.push(...soleClaimedSubstitutes.map((s) => `${s}_cannot_be_sole_basis`));
  }

  // R114 — prior withdrawal / recall / Expired / Rejected. Suspension (R52) does NOT count.
  if (
    input.purportedWithdrawalRecordPresent === true ||
    input.purportedRecallRecordPresent === true ||
    input.currentRecallAlreadyCeasedReliance === true ||
    (input.lifecycleProjectedState != null &&
      RELIANCE_CEASED_LIFECYCLE_STATES.has(input.lifecycleProjectedState))
  ) {
    denialReasons.push("forward_reliance_already_ceased");
  }

  const shared = assessG6SharedPreconditions({
    actType: "recall",
    bindingId: input.binding?.bindingId,
    hasPriorAuthorization: !!input.authorization,
    hasPriorPosture: !!input.posture,
    hasLifecycleOperativeHistory:
      !!input.authorization || !!input.posture,
    hccmBoundContextEstablished: !!input.binding,
    authorityClassId: input.authorityClassId ?? "handoff_governance_authority",
    performerClass: input.performerClass,
    traceableConstitutionalBasis:
      satisfiedHrtcmTriggers.length > 0 && soleClaimedSubstitutes.length === 0,
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
      actType: "recall",
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

  const mayRecall = denialReasons.length === 0;
  return Object.freeze({
    mayRecall,
    denialReasons: Object.freeze([...denialReasons]),
    authorityClassId: mayRecall ? ("handoff_governance_authority" as const) : null,
    entryCurrency: input.entryCurrency,
    bindingCurrency: input.bindingCurrency,
    authorizationCurrency: input.authorizationCurrency,
    postureDeclarationCurrency: input.postureCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    eligibilityLayerCondition: input.eligibilityLayerCondition,
    satisfiedHrtcmTriggers,
    doesNotAuthorizeActMintViaCatalogAlone: true as const,
    doesNotAuthorizeActMintViaRtcCatalogAlone: true as const,
    doesNotAuthorizeActMintViaGpraInvalidatedOrSupersededAlone: true as const,
    doesNotAuthorizeActMintViaG11BlockedAlone: true as const,
    doesNotAuthorizeActMintViaHrwmLossAlone: true as const,
    doesNotAuthorizeActMintViaAdvisoryAlone: true as const,
    notHandoffSuspension: true as const,
    notHandoffWithdrawal: true as const,
    notHandoffCompletion: true as const,
    notHercmReentryOrResumption: true as const,
    suspensionPauseDoesNotNegateAttributability: true as const,
  });
}

/**
 * R123 — tip selection by recalledAt; currency evaluation is separate and subordinate.
 */
export function selectAuthoritativeGovernedHandoffRecall(
  recalls: readonly GovernedHandoffRecallActRecord[],
): GovernedHandoffRecallActRecord | null {
  if (recalls.length === 0) return null;
  return [...recalls].sort((a, b) => a.recalledAt.localeCompare(b.recalledAt)).at(-1)!;
}

export function evaluateHandoffRecallCurrencyFromFacts(input: {
  recall: GovernedHandoffRecallActRecord;
  currentEntryCurrency: HandoffEntryCurrency;
  currentBindingCurrency: HandoffConsumerBindingCurrency;
  authoritativeRecallActId: GovernedHandoffRecallActId | null;
  gpraValidityPosture: GpraValidityPosture | null;
  lineageMatchesAuthoritativeGpra: boolean;
}): HandoffRecallCurrency {
  if (
    input.authoritativeRecallActId != null &&
    input.recall.recallActId !== input.authoritativeRecallActId
  ) {
    return "stale";
  }
  if (!input.lineageMatchesAuthoritativeGpra) {
    return "stale";
  }

  const usesHistoricalAttribution =
    input.recall.satisfiedHrtcmTriggers.includes("RTC-01") ||
    input.recall.satisfiedHrtcmTriggers.includes("RTC-02");

  if (usesHistoricalAttribution) {
    if (
      input.recall.satisfiedHrtcmTriggers.includes("RTC-01") &&
      input.gpraValidityPosture !== "invalidated"
    ) {
      return "stale";
    }
    if (
      input.recall.satisfiedHrtcmTriggers.includes("RTC-02") &&
      input.gpraValidityPosture !== "superseded"
    ) {
      return "stale";
    }
    return "current";
  }

  if (
    input.currentEntryCurrency !== "current" ||
    input.currentBindingCurrency !== "current"
  ) {
    return "stale";
  }
  if (input.gpraValidityPosture !== "retention") {
    return "stale";
  }
  return "current";
}

export interface CreateGovernedHandoffRecallActInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly binding: GovernedHandoffConsumerBindingRecord;
  readonly authorization: GovernedHandoffAuthorizationActRecord;
  readonly posture: GovernedHandoffPostureDeclarationActRecord;
  readonly authorityClassId: unknown;
  readonly recalledBy: string;
  readonly recalledAt?: string;
  readonly satisfiedHrtcmTriggers: unknown;
  readonly hrtcmTriggerEvidenceNotes?: unknown;
  readonly sourceAttribution?: unknown;
  readonly performerClass?: unknown;
  readonly withdrawalActId?: unknown;
  readonly expiryActId?: unknown;
  readonly resumeHandoff?: unknown;
  readonly restoreHandoff?: unknown;
  readonly reenterHandoff?: unknown;
  readonly withdrawHandoff?: unknown;
  readonly expireHandoff?: unknown;
  readonly executesHandoff?: unknown;
  readonly handoffExecuted?: unknown;
  readonly performHandoff?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillmentExecutionId?: unknown;
  readonly executionQueueId?: unknown;
  readonly constitutionalQueueId?: unknown;
  readonly brainRecallHandoff?: unknown;
  readonly brainHandoffRecall?: unknown;
  readonly implicitRecall?: unknown;
  readonly rtcCatalogAlone?: unknown;
  readonly hrtcmRtcAlone?: unknown;
  readonly rejectHandoff?: unknown;
  readonly hercmReentryId?: unknown;
  readonly resumptionActId?: unknown;
  readonly restorationActId?: unknown;
}

/**
 * Construct an operative HGA recall act + HOEM recall record.
 * Caller must have verified R113–R116 prerequisites.
 */
export function createGovernedHandoffRecallActRecord(
  input: CreateGovernedHandoffRecallActInput,
): GovernedHandoffRecallActRecord {
  assertNoHandoffRecallWithdrawalOrReentryClaims(
    input as unknown as Record<string, unknown>,
  );
  const recalledBy = assertGovernedHandoffRecallActor(input);
  assertEstablishedHandoffGovernanceAuthorityForRecall(input.authorityClassId);
  assertHgaMatrixActMayBePerformed("recall");
  const satisfiedHrtcmTriggers = normalizeSatisfiedHrtcmTriggers(
    input.satisfiedHrtcmTriggers,
  );
  if (!satisfiedHrtcmTriggers.every((t) => HRTCM_RECALL_TRIGGER_IDS.includes(t))) {
    throw new OrchestraConstitutionalError(
      "Handoff recall requires closed HRTCM RTC-01 through RTC-04 triggers (R115/R117)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R115", "FI-DSN-STD-015-R117"],
    );
  }
  const hga = resolveEstablishedHandoffGovernanceAuthorityClass(
    input.authorityClassId as "handoff_governance_authority",
  );

  const entry = input.entry;
  const binding = input.binding;
  const authorization = input.authorization;
  const posture = input.posture;

  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff recall requires HCCM binding belonging to the provided G1 entry (R116)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R116"],
    );
  }
  if (authorization.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff recall requires authorization belonging to the provided entry (R113a/R116)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R113", "FI-DSN-STD-015-R116"],
    );
  }
  if (authorization.consumerClassId !== binding.consumerClassId) {
    throw new OrchestraConstitutionalError(
      "Handoff recall requires authorization matching the binding consumer class (R113a/R116)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R113", "FI-DSN-STD-015-R116"],
    );
  }
  if (posture.bindingId !== binding.bindingId || posture.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff recall requires authoritative posture belonging to the provided binding and entry (R113a/R116)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R113", "FI-DSN-STD-015-R116"],
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
      "Handoff recall rejected: binding lineage does not match entry (R116)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R116"],
    );
  }

  const notes =
    typeof input.hrtcmTriggerEvidenceNotes === "string" &&
    input.hrtcmTriggerEvidenceNotes.trim()
      ? input.hrtcmTriggerEvidenceNotes.trim()
      : null;

  const now = input.recalledAt ?? new Date().toISOString();
  const recallActId = createGovernedHandoffRecallActId();
  const hoemRecallRecord: HoemRecallOperativeRecord = Object.freeze({
    hoemRecallRecordId: createHoemRecallOperativeRecordId(),
    recallActId,
    actType: "recall" as const,
    gpraId: entry.gpraId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    bindingId: binding.bindingId,
    consumerClassId: binding.consumerClassId,
    authorizationActId: authorization.authorizationActId,
    postureDeclarationActId: posture.postureDeclarationActId,
    satisfiedHrtcmTriggers,
    effectiveAt: now,
    doesNotMergeAuthorizationAttribution: true as const,
    doesNotMergePostureDeclarationAttribution: true as const,
    doesNotMergeCompletionAttribution: true as const,
    doesNotMergeSuspensionAttribution: true as const,
    doesNotMergeLifecycleAttribution: true as const,
    doesNotMergeWithdrawalAttribution: true as const,
  });

  return Object.freeze({
    recallActId,
    authorityClassId: hga.authorityClassId,
    authorityGoverningSourceId: hga.governingSourceId,
    authorityConstitutionalScope: "handoff_recall_act" as const,
    recalledBy,
    recalledAt: now,
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
    satisfiedHrtcmTriggers,
    hrtcmTriggerEvidenceNotes: notes,
    forwardRelianceCeased: true as const,
    doesNotEraseAuthorization: true as const,
    doesNotErasePosture: true as const,
    doesNotEraseSuspensionHistory: true as const,
    doesNotEraseWithdrawalHistory: true as const,
    notHandoffSuspension: true as const,
    notHandoffWithdrawal: true as const,
    notHandoffCompletion: true as const,
    notHercmReentry: true as const,
    notResumption: true as const,
    notRestoration: true as const,
    effectFraming: "responsive_forward_reliance_termination" as const,
    hoemRecallRecord,
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
    r112DistinctHgaRecallAct: true as const,
    r113SharedPreconditionsPlusTriggers: true as const,
    r114NoRecallAfterRelianceCeased: true as const,
    r115NoSoleRtcGpraG11HrwmBasis: true as const,
    r116SingleBindingPostureChain: true as const,
    r117HrtcmTriggerEvidenceRecording: true as const,
    r118EffectFromRecalledAtForward: true as const,
    r119ResponsiveForwardRelianceCessation: true as const,
    r120AttributedBindingOnly: true as const,
    r121HoemRecallOperativeRecord: true as const,
    r122NotAutomaticHslmPromotion: true as const,
    r123RepeatedRecallsAdditive: true as const,
    r124InvalidAttemptsNonOperative: true as const,
    r125NotSuspensionWithdrawalOrReentry: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: recalledBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_RECALL_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
