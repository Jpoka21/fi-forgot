/**
 * Governed Handoff Resumption — FI-DSN-STD-015 HERCM REC-02 (R126–R139).
 *
 * Distinct peer NON-MATRIX HGA act (R126): the suspension pause is lifted and forward
 * reliance resumes on the EXISTING authorization + posture chain (R132). Resumption
 * mints no authorization, declares no posture, and completes/withdraws/recalls nothing.
 *
 * REC-02 only. Re-entry (REC-01/03/04/05) lives in handoff-reentry.ts.
 * The HGA act-type matrix stays exactly six — resumption is never routed through
 * assertHgaMatrixActMayBePerformed.
 *
 * Raw constructors — prefer Domain3Repository.resumeGovernedHandoff.
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
  GovernedHandoffResumptionActId,
  GovernedHandoffResumptionActRecord,
  GovernedHandoffResumptionAssessment,
  GovernedHandoffSuspensionActRecord,
  GpraValidityPosture,
  HandoffActLayerLifecycleState,
  HandoffAuthorizationCurrency,
  HandoffConsumerBindingCurrency,
  HandoffConsumerCategoryKey,
  HandoffEligibilityLayerCondition,
  HandoffEntryCurrency,
  HandoffPostureDeclarationCurrency,
  HandoffResumptionCurrency,
  HoemResumptionOperativeRecord,
  HoemResumptionOperativeRecordId,
  ResumptionConstitutionalBasisKind,
  ResumptionConstitutionalBasisProvenance,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertEstablishedHandoffGovernanceAuthorityForResumption,
  resolveEstablishedHandoffGovernanceAuthorityClass,
} from "./handoff-governance-authority.js";
import {
  assertExportReadyDoesNotMintHercmAct,
  assertHercmBasisKindMatchesCategory,
  assertHercmActSubjectScope,
  assertHercmResumptionCategoryId,
  assertHgaSolePerformerForHercmAct,
  assertNoAutomaticHercmRecovery,
  assertResumptionConstitutionalBasisKind,
  assessHercmSharedPreconditions,
  isResumptionConstitutionalBasisKind,
  resolveHercmCategory,
} from "./handoff-hercm.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HERCM_RESUMPTION_REQUIREMENTS = [
  "FI-DSN-STD-015-R126",
  "FI-DSN-STD-015-R127",
  "FI-DSN-STD-015-R128",
  "FI-DSN-STD-015-R129",
  "FI-DSN-STD-015-R130",
  "FI-DSN-STD-015-R131",
  "FI-DSN-STD-015-R132",
  "FI-DSN-STD-015-R133",
  "FI-DSN-STD-015-R134",
  "FI-DSN-STD-015-R135",
  "FI-DSN-STD-015-R136",
  "FI-DSN-STD-015-R137",
  "FI-DSN-STD-015-R138",
  "FI-DSN-STD-015-R139",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_RESUMPTION_TRACEABILITY =
  createStd015GovernanceTraceability([...HERCM_RESUMPTION_REQUIREMENTS]);

/**
 * R129 / R139 — resumption may not re-enter, restore, recover automatically, mint a new
 * authorization or posture, or stand in for any peer act.
 */
const RESUMPTION_FORBIDDEN_KEYS = [
  "reenterHandoff",
  "reentryActId",
  "hercmReentryId",
  "hoemReentryRecordId",
  "restoreHandoff",
  "restorationActId",
  "reinstateHandoff",
  "reviveHandoff",
  "reactivateHandoff",
  "autoResume",
  "autoRestore",
  "automaticRecovery",
  "automaticRetry",
  "automaticInheritanceResumption",
  "inferredEligibilityResumption",
  "configurationDrivenResumption",
  "implicitResumption",
  "exportReadyAlone",
  "eligibilityAlone",
  "g11ExportReadyMintsResumption",
  "suspendHandoff",
  "withdrawHandoff",
  "recallHandoff",
  "expireHandoff",
  "withdrawalActId",
  "recallActId",
  "expiryActId",
  "newAuthorizationActId",
  "mintAuthorization",
  "authorizeHandoff",
  "declarePosture",
  "newPostureDeclarationActId",
  "executesHandoff",
  "handoffExecuted",
  "performHandoff",
  "manufacturingExecutionId",
  "fulfillmentExecutionId",
  "productionExecutionId",
  "executionQueueId",
  "constitutionalQueueId",
  "brainResumeHandoff",
  "brainHandoffResumption",
  "brainAuthorizesHandoff",
  "rejectHandoff",
  "performHgaAct",
  "performG6LifecycleAct",
  "applyLifecycleState",
  "hslmState",
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

/** R131 — cessation, not pause. These states mean REC-02 is not the applicable category. */
const CESSATION_LIFECYCLE_STATES = new Set<HandoffActLayerLifecycleState>([
  "withdrawn",
  "recalled",
  "expired",
  "rejected",
]);

export function createGovernedHandoffResumptionActId(): GovernedHandoffResumptionActId {
  return `governed-handoff-resumption-act-${randomUUID()}` as GovernedHandoffResumptionActId;
}

export function createHoemResumptionOperativeRecordId(): HoemResumptionOperativeRecordId {
  return `hoem-resumption-operative-${randomUUID()}` as HoemResumptionOperativeRecordId;
}

export function assertNoHandoffResumptionReentryRestorationOrAutoRecoveryClaims(
  input: Record<string, unknown>,
): void {
  for (const key of RESUMPTION_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Handoff resumption must not reenter, restore, recover automatically, mint authorization or posture, execute, or reject (R129/R138/R139)",
        "invalid_handoff_resumption",
        [
          "FI-DSN-STD-015-R129",
          "FI-DSN-STD-015-R138",
          "FI-DSN-STD-015-R139",
        ],
      );
    }
  }
}

/**
 * R70 / R126 — established HGA class required; actor attribution cannot mint authority.
 */
export function assertGovernedHandoffResumptionActor(input: {
  resumedBy: string;
  authorityClassId: unknown;
  sourceAttribution?: unknown;
  performerClass?: unknown;
}): string {
  assertHgaSolePerformerForHercmAct({
    authorityClassId: input.authorityClassId,
    performerClass: input.performerClass,
    actKind: "resumption",
  });
  assertEstablishedHandoffGovernanceAuthorityForResumption(input.authorityClassId);
  assertNoHandoffResumptionReentryRestorationOrAutoRecoveryClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot perform HERCM resumption acts (R22/R70/R126)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R22", "FI-DSN-STD-015-R70", "FI-DSN-STD-015-R126"],
    );
  }

  const resumedBy = input.resumedBy?.trim() ?? "";
  if (!resumedBy) {
    throw new OrchestraConstitutionalError(
      "Handoff resumption requires attributable resumedBy actor within HGA scope; actor string alone is not HGA authority (R126)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R126"],
    );
  }
  const lower = resumedBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_ACTOR_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "resumedBy must not mint Brain or HAAM-prohibited authority-class identity as Handoff resumer (R70/R126)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R126"],
    );
  }
  return resumedBy;
}

/**
 * R126–R139 — assess whether a lawful HGA REC-02 resumption act may be performed.
 *
 * Requires a current suspension tip on the same binding and the same posture chain
 * (R133), cleared suspension grounds (R131), Retention GPRA with matching lineage
 * (R129), and the existing authorization + posture still attributable (R132).
 * Does NOT require G11 export_ready — REC-02 lifts a pause rather than re-entering.
 */
export function assessGovernedHandoffResumption(input: {
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
  hercmCategory?: unknown;
  constitutionalBasisKind?: unknown;
  constitutionalBasisNotes?: unknown;
  suspension?: GovernedHandoffSuspensionActRecord | null;
  suspensionIsCurrent?: unknown;
  purportedWithdrawalRecordPresent?: unknown;
  purportedRecallRecordPresent?: unknown;
  lifecycleProjectedState?: HandoffActLayerLifecycleState | null;
  authorityClassId?: unknown;
  performerClass?: unknown;
  advisoryEvidenceAlone?: unknown;
  implementationInferenceAlone?: unknown;
  downstreamOperationalEventAlone?: unknown;
  hercmCatalogAlone?: unknown;
  exportReadyAlone?: unknown;
  eligibilityAlone?: unknown;
  suspensionRecordAlone?: unknown;
  spansMultipleBindings?: unknown;
  mergesPostureChains?: unknown;
  silentCrossContextPropagation?: unknown;
  foreignBinding?: unknown;
  unattributedGpraPropagation?: unknown;
  priorRecordsPreservedReconstructable?: unknown;
}): GovernedHandoffResumptionAssessment {
  const denialReasons: string[] = [];

  const hercmCategory =
    input.hercmCategory === undefined || input.hercmCategory === "REC-02"
      ? ("REC-02" as const)
      : null;
  if (!hercmCategory) {
    denialReasons.push("hercm_category_not_rec_02");
  }

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

  // R132 — forward reliance resumes on the EXISTING authorization; it must still hold.
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

  // R129 — Invalidated / Superseded GPRA blocks predecessor-context HERCM.
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

  // R131 — REC-02 category condition: suspension grounds constitutionally cleared.
  const basisKind = isResumptionConstitutionalBasisKind(input.constitutionalBasisKind)
    ? input.constitutionalBasisKind
    : null;
  if (!basisKind) {
    denialReasons.push("suspension_grounds_cleared_basis_required");
  }
  if (
    typeof input.constitutionalBasisNotes === "string" &&
    input.constitutionalBasisNotes.trim() &&
    !basisKind
  ) {
    denialReasons.push("notes_cannot_be_sole_constitutional_basis");
  }

  // R131 / R133 — qualifying prior state on the same binding and posture chain.
  const suspension = input.suspension ?? null;
  const suspensionIsCurrent = input.suspensionIsCurrent === true;
  if (!suspension) {
    denialReasons.push("qualifying_prior_suspension_missing");
  } else {
    if (input.binding && suspension.bindingId !== input.binding.bindingId) {
      denialReasons.push("suspension_foreign_to_binding");
    }
    if (input.entry && suspension.entryId !== input.entry.entryId) {
      denialReasons.push("suspension_foreign_to_entry");
    }
    if (!suspensionIsCurrent) {
      denialReasons.push("suspension_tip_not_current");
    }
    // R133 — REC-02 must target the SAME posture chain that was suspended.
    if (
      input.posture &&
      suspension.postureDeclarationActId !== input.posture.postureDeclarationActId
    ) {
      denialReasons.push("suspension_posture_chain_mismatch");
    }
    if (
      input.authorization &&
      suspension.authorizationActId !== input.authorization.authorizationActId
    ) {
      denialReasons.push("suspension_authorization_mismatch");
    }
  }

  // R131 — REC-02 is not applicable once forward reliance has ceased; a withdrawal or
  // recall tip supersedes the suspension and only re-entry (REC-03/REC-04) can follow.
  if (
    input.purportedWithdrawalRecordPresent === true ||
    input.purportedRecallRecordPresent === true
  ) {
    denialReasons.push("suspension_superseded_by_cessation");
  }
  if (
    input.lifecycleProjectedState != null &&
    CESSATION_LIFECYCLE_STATES.has(input.lifecycleProjectedState)
  ) {
    denialReasons.push("forward_reliance_already_ceased");
  }
  if (
    input.lifecycleProjectedState != null &&
    input.lifecycleProjectedState !== "suspended" &&
    !CESSATION_LIFECYCLE_STATES.has(input.lifecycleProjectedState)
  ) {
    denialReasons.push("qualifying_prior_state_not_suspended");
  }

  const soleClaimedSubstitutes = [
    input.advisoryEvidenceAlone === true ? "advisory_evidence_alone" : null,
    input.implementationInferenceAlone === true ? "implementation_inference_alone" : null,
    input.downstreamOperationalEventAlone === true
      ? "downstream_operational_event_alone"
      : null,
    input.hercmCatalogAlone === true ? "hercm_catalog_alone" : null,
    input.exportReadyAlone === true ? "export_ready_alone" : null,
    input.eligibilityAlone === true ? "eligibility_alone" : null,
    input.suspensionRecordAlone === true ? "suspension_record_alone" : null,
  ].filter((x): x is string => x !== null);

  if (soleClaimedSubstitutes.length > 0) {
    denialReasons.push(...soleClaimedSubstitutes.map((s) => `${s}_cannot_be_sole_basis`));
  }

  const shared = assessHercmSharedPreconditions({
    hercmCategory: hercmCategory ?? input.hercmCategory,
    bindingId: input.binding?.bindingId,
    hasPriorAuthorization:
      !!input.authorization && input.authorizationCurrency === "current",
    hasPriorPosture: !!input.posture && input.postureCurrency === "current",
    hasLifecycleOperativeHistory: !!suspension,
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
    assertHercmActSubjectScope({
      hercmCategory: hercmCategory ?? input.hercmCategory,
      bindingId: input.binding?.bindingId,
      spansMultipleBindings: input.spansMultipleBindings,
      mergesPostureChains: input.mergesPostureChains,
      silentCrossContextPropagation: input.silentCrossContextPropagation,
      foreignBinding: input.foreignBinding,
      unattributedGpraPropagation: input.unattributedGpraPropagation,
    });
  } catch {
    denialReasons.push("hercm_subject_scope_denied");
  }

  const mayResume = denialReasons.length === 0;
  return Object.freeze({
    mayResume,
    denialReasons: Object.freeze([...denialReasons]),
    authorityClassId: mayResume ? ("handoff_governance_authority" as const) : null,
    hercmCategory: mayResume ? ("REC-02" as const) : hercmCategory,
    entryCurrency: input.entryCurrency,
    bindingCurrency: input.bindingCurrency,
    authorizationCurrency: input.authorizationCurrency,
    postureDeclarationCurrency: input.postureCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    eligibilityLayerCondition: input.eligibilityLayerCondition,
    constitutionalBasisKind: basisKind,
    qualifyingPriorState: suspension ? ("suspended" as const) : null,
    resumedSuspensionActId: suspension?.suspensionActId ?? null,
    resumedPostureDeclarationActId: suspension?.postureDeclarationActId ?? null,
    doesNotAuthorizeActMintViaCatalogAlone: true as const,
    doesNotAuthorizeActMintViaExportReadyAlone: true as const,
    doesNotAuthorizeActMintViaAdvisoryAlone: true as const,
    doesNotAuthorizeAutomaticRecovery: true as const,
    notNewHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffCompletion: true as const,
    notHandoffSuspension: true as const,
    notHandoffWithdrawal: true as const,
    notHandoffRecall: true as const,
    notHercmReentry: true as const,
    notHgaMatrixActType: true as const,
  });
}

/**
 * R139 — repeated resumptions are additive; the tip is the latest by resumedAt.
 * Currency evaluation is separate and subordinate.
 */
export function selectAuthoritativeGovernedHandoffResumption(
  resumptions: readonly GovernedHandoffResumptionActRecord[],
): GovernedHandoffResumptionActRecord | null {
  if (resumptions.length === 0) return null;
  return [...resumptions].sort((a, b) => a.resumedAt.localeCompare(b.resumedAt)).at(-1)!;
}

/**
 * True when the resumption tip supersedes the suspension tip for lifecycle projection.
 * A resumption never deletes the suspension record; it only lifts its control (R135).
 */
export function resumptionSupersedesSuspension(input: {
  suspension: GovernedHandoffSuspensionActRecord | null;
  resumption: GovernedHandoffResumptionActRecord | null;
}): boolean {
  const { suspension, resumption } = input;
  if (!suspension || !resumption) return false;
  if (resumption.bindingId !== suspension.bindingId) return false;
  return resumption.resumedAt.localeCompare(suspension.suspendedAt) >= 0;
}

export function evaluateHandoffResumptionCurrencyFromFacts(input: {
  resumption: GovernedHandoffResumptionActRecord;
  currentEntryCurrency: HandoffEntryCurrency;
  currentBindingCurrency: HandoffConsumerBindingCurrency;
  authoritativeResumptionActId: GovernedHandoffResumptionActId | null;
  gpraValidityPosture: GpraValidityPosture | null;
  lineageMatchesAuthoritativeGpra: boolean;
  /** A later suspension re-pauses forward reliance and supersedes this resumption. */
  supersedingSuspensionAt?: string | null;
  /** A later withdrawal/recall ceases forward reliance outright. */
  supersedingCessationAt?: string | null;
}): HandoffResumptionCurrency {
  if (
    input.authoritativeResumptionActId != null &&
    input.resumption.resumptionActId !== input.authoritativeResumptionActId
  ) {
    return "stale";
  }
  if (
    input.currentEntryCurrency !== "current" ||
    input.currentBindingCurrency !== "current"
  ) {
    return "stale";
  }
  if (input.gpraValidityPosture !== "retention" || !input.lineageMatchesAuthoritativeGpra) {
    return "stale";
  }
  if (
    input.supersedingSuspensionAt != null &&
    input.supersedingSuspensionAt.localeCompare(input.resumption.resumedAt) > 0
  ) {
    return "stale";
  }
  if (
    input.supersedingCessationAt != null &&
    input.supersedingCessationAt.localeCompare(input.resumption.resumedAt) > 0
  ) {
    return "stale";
  }
  return "current";
}

export interface CreateGovernedHandoffResumptionActInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly binding: GovernedHandoffConsumerBindingRecord;
  readonly authorization: GovernedHandoffAuthorizationActRecord;
  readonly posture: GovernedHandoffPostureDeclarationActRecord;
  readonly suspension: GovernedHandoffSuspensionActRecord;
  readonly authorityClassId: unknown;
  readonly resumedBy: string;
  readonly resumedAt?: string;
  readonly hercmCategory?: unknown;
  readonly constitutionalBasisKind: unknown;
  readonly constitutionalBasisNotes?: unknown;
  readonly sourceAttribution?: unknown;
  readonly performerClass?: unknown;
  readonly reenterHandoff?: unknown;
  readonly reentryActId?: unknown;
  readonly hercmReentryId?: unknown;
  readonly restoreHandoff?: unknown;
  readonly restorationActId?: unknown;
  readonly reinstateHandoff?: unknown;
  readonly reviveHandoff?: unknown;
  readonly autoResume?: unknown;
  readonly autoRestore?: unknown;
  readonly automaticRecovery?: unknown;
  readonly automaticRetry?: unknown;
  readonly implicitResumption?: unknown;
  readonly exportReadyAlone?: unknown;
  readonly withdrawalActId?: unknown;
  readonly recallActId?: unknown;
  readonly expiryActId?: unknown;
  readonly newAuthorizationActId?: unknown;
  readonly mintAuthorization?: unknown;
  readonly authorizeHandoff?: unknown;
  readonly declarePosture?: unknown;
  readonly executesHandoff?: unknown;
  readonly handoffExecuted?: unknown;
  readonly performHandoff?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillmentExecutionId?: unknown;
  readonly executionQueueId?: unknown;
  readonly constitutionalQueueId?: unknown;
  readonly brainResumeHandoff?: unknown;
  readonly brainHandoffResumption?: unknown;
  readonly rejectHandoff?: unknown;
}

/**
 * Construct an operative HGA REC-02 resumption act + HOEM resumption record.
 * Caller must have verified the R126–R139 prerequisites via assessGovernedHandoffResumption.
 */
export function createGovernedHandoffResumptionActRecord(
  input: CreateGovernedHandoffResumptionActInput,
): GovernedHandoffResumptionActRecord {
  assertNoHandoffResumptionReentryRestorationOrAutoRecoveryClaims(
    input as unknown as Record<string, unknown>,
  );
  assertNoAutomaticHercmRecovery(
    "resumption",
    input as unknown as Record<string, unknown>,
  );
  assertExportReadyDoesNotMintHercmAct({
    actKind: "resumption",
    exportReadyAlone: input.exportReadyAlone,
  });
  const resumedBy = assertGovernedHandoffResumptionActor(input);
  assertEstablishedHandoffGovernanceAuthorityForResumption(input.authorityClassId);

  const hercmCategory = input.hercmCategory ?? "REC-02";
  assertHercmResumptionCategoryId(hercmCategory);
  assertResumptionConstitutionalBasisKind(input.constitutionalBasisKind);
  assertHercmBasisKindMatchesCategory(hercmCategory, input.constitutionalBasisKind);
  const category = resolveHercmCategory(hercmCategory);

  const hga = resolveEstablishedHandoffGovernanceAuthorityClass(
    input.authorityClassId as "handoff_governance_authority",
  );

  const { entry, binding, authorization, posture, suspension } = input;
  const basisKind = input.constitutionalBasisKind;

  assertHercmActSubjectScope({
    hercmCategory,
    bindingId: binding.bindingId,
  });

  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff resumption requires HCCM binding belonging to the provided G1 entry (R130)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R130"],
    );
  }
  if (
    authorization.entryId !== entry.entryId ||
    authorization.consumerClassId !== binding.consumerClassId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff resumption requires the existing authorization to belong to the entry and binding consumer class (R130/R132)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R130", "FI-DSN-STD-015-R132"],
    );
  }
  if (posture.bindingId !== binding.bindingId || posture.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff resumption requires the authoritative posture to belong to the provided binding and entry (R130/R133)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R130", "FI-DSN-STD-015-R133"],
    );
  }
  if (suspension.bindingId !== binding.bindingId || suspension.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff resumption requires the resumed suspension to belong to the provided binding and entry (R131/R133)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R131", "FI-DSN-STD-015-R133"],
    );
  }
  // R133 — posture-chain fidelity: the resumed suspension must name this posture chain.
  if (suspension.postureDeclarationActId !== posture.postureDeclarationActId) {
    throw new OrchestraConstitutionalError(
      "Handoff resumption must target the same posture chain that was suspended (R133)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R133"],
    );
  }
  if (suspension.authorizationActId !== authorization.authorizationActId) {
    throw new OrchestraConstitutionalError(
      "Handoff resumption must resume forward reliance on the same authorization that was suspended (R132/R133)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R132", "FI-DSN-STD-015-R133"],
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
      "Handoff resumption rejected: binding lineage does not match entry (R130)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R130"],
    );
  }

  const notes =
    typeof input.constitutionalBasisNotes === "string" &&
    input.constitutionalBasisNotes.trim()
      ? input.constitutionalBasisNotes.trim()
      : null;
  const provenance: ResumptionConstitutionalBasisProvenance = Object.freeze({
    basisKind: basisKind as ResumptionConstitutionalBasisKind,
    notes,
    notesCannotBeSoleBasis: true as const,
  });

  const now = input.resumedAt ?? new Date().toISOString();
  const resumptionActId = createGovernedHandoffResumptionActId();
  const hoemResumptionRecord: HoemResumptionOperativeRecord = Object.freeze({
    hoemResumptionRecordId: createHoemResumptionOperativeRecordId(),
    resumptionActId,
    actType: "resumption" as const,
    hercmCategory: "REC-02" as const,
    qualifyingPriorState: category.qualifyingPriorState,
    gpraId: entry.gpraId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    bindingId: binding.bindingId,
    consumerClassId: binding.consumerClassId,
    authorizationActId: authorization.authorizationActId,
    postureDeclarationActId: posture.postureDeclarationActId,
    resumedSuspensionActId: suspension.suspensionActId,
    constitutionalBasisKind: basisKind as ResumptionConstitutionalBasisKind,
    effectiveAt: now,
    doesNotMergeAuthorizationAttribution: true as const,
    doesNotMergePostureDeclarationAttribution: true as const,
    doesNotMergeCompletionAttribution: true as const,
    doesNotMergeSuspensionAttribution: true as const,
    doesNotMergeWithdrawalAttribution: true as const,
    doesNotMergeRecallAttribution: true as const,
    doesNotMergeReentryAttribution: true as const,
    doesNotMergeLifecycleAttribution: true as const,
    notHgaMatrixActType: true as const,
  });

  return Object.freeze({
    resumptionActId,
    authorityClassId: hga.authorityClassId,
    authorityGoverningSourceId: hga.governingSourceId,
    authorityConstitutionalScope: "handoff_resumption_act" as const,
    hercmCategory: "REC-02" as const,
    resumedBy,
    resumedAt: now,
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorizationActId: authorization.authorizationActId,
    postureDeclarationActId: posture.postureDeclarationActId,
    resumedSuspensionActId: suspension.suspensionActId,
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
    hercmQualifyingPriorState: category.qualifyingPriorState,
    constitutionalBasisKind: basisKind as ResumptionConstitutionalBasisKind,
    constitutionalBasisProvenance: provenance,
    forwardRelianceRestoredOnExistingAuthorization: true as const,
    samePostureChainRetained: true as const,
    doesNotMintNewAuthorization: true as const,
    doesNotMintNewPostureDeclaration: true as const,
    doesNotEraseSuspensionHistory: true as const,
    doesNotEraseWithdrawalHistory: true as const,
    doesNotEraseRecallHistory: true as const,
    notHandoffSuspension: true as const,
    notHandoffWithdrawal: true as const,
    notHandoffRecall: true as const,
    notHandoffCompletion: true as const,
    notHercmReentry: true as const,
    notRestoration: true as const,
    notAutomaticRecovery: true as const,
    effectFraming: "forward_reliance_resumption_on_existing_authorization" as const,
    hoemResumptionRecord,
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
    hslmRemainsEightStates: true as const,
    notHgaMatrixActType: true as const,
    r126DistinctHercmResumptionAct: true as const,
    r127ClosedHercmCategorySet: true as const,
    r128ExportReadyAuthorizesConsiderationOnly: true as const,
    r129NoAutomaticRecoveryAndInvalidatedBlocks: true as const,
    r130SingleBindingPostureChain: true as const,
    r131CategoryConditionsSatisfied: true as const,
    r132ForwardRelianceOnExistingAuthorization: true as const,
    r133SamePostureChainAndQualifyingPriorState: true as const,
    r134ProspectiveFromResumedAtNoRewrite: true as const,
    r135AdditivePreservationOfPriorHistory: true as const,
    r136HoemResumptionOperativeRecord: true as const,
    r137NotAutomaticHslmPromotionHslmStaysEight: true as const,
    r138InvalidAttemptsNonOperative: true as const,
    r139RepeatedHercmActsAdditiveNotSubstitute: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: resumedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_RESUMPTION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
