/**
 * Governed Handoff Re-entry — FI-DSN-STD-015 HERCM REC-01/03/04/05 (R126–R139).
 *
 * Distinct peer NON-MATRIX HGA act (R126). Re-entry returns the binding toward
 * Eligible-for-consideration ONLY (R132): it resurrects no withdrawn or recalled
 * authorization or posture, and a NEW HOF-G2 authorization is required afterward.
 * REC-04 additionally requires a new posture path after that new authorization.
 *
 * REC-02 resumption lives in handoff-resumption.ts. The HGA act-type matrix stays
 * exactly six — re-entry is never routed through assertHgaMatrixActMayBePerformed.
 *
 * Raw constructors — prefer Domain3Repository.reenterGovernedHandoff.
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
  GovernedHandoffRecallActRecord,
  GovernedHandoffReentryActId,
  GovernedHandoffReentryActRecord,
  GovernedHandoffReentryAssessment,
  GovernedHandoffWithdrawalActRecord,
  GpraValidityPosture,
  HandoffActLayerLifecycleState,
  HandoffAuthorizationCurrency,
  HandoffConsumerBindingCurrency,
  HandoffConsumerCategoryKey,
  HandoffEligibilityLayerCondition,
  HandoffEntryCurrency,
  HandoffPostureDeclarationCurrency,
  HandoffReentryCurrency,
  HercmReentryCategoryId,
  HoemReentryOperativeRecord,
  HoemReentryOperativeRecordId,
  ReentryConstitutionalBasisKind,
  ReentryConstitutionalBasisProvenance,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertEstablishedHandoffGovernanceAuthorityForReentry,
  resolveEstablishedHandoffGovernanceAuthorityClass,
} from "./handoff-governance-authority.js";
import {
  assertExportReadyDoesNotMintHercmAct,
  assertHercmActSubjectScope,
  assertHercmBasisKindMatchesCategory,
  assertHercmReentryCategoryId,
  assertHgaSolePerformerForHercmAct,
  assertNoAutomaticHercmRecovery,
  assertReentryConstitutionalBasisKind,
  assessHercmSharedPreconditions,
  isHercmReentryCategoryId,
  isReentryConstitutionalBasisKind,
  resolveHercmCategory,
} from "./handoff-hercm.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HERCM_REENTRY_REQUIREMENTS = [
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

export const GOVERNED_HANDOFF_REENTRY_TRACEABILITY =
  createStd015GovernanceTraceability([...HERCM_REENTRY_REQUIREMENTS]);

/**
 * R132 / R139 — re-entry may not resume an existing authorization, resurrect a
 * withdrawn/recalled authorization or posture, mint new ones, or recover automatically.
 */
const REENTRY_FORBIDDEN_KEYS = [
  "resumeHandoff",
  "resumptionActId",
  "hoemResumptionRecordId",
  "resumedSuspensionActId",
  "restoreHandoff",
  "restorationActId",
  "reinstateHandoff",
  "reviveHandoff",
  "reactivateHandoff",
  "resurrectAuthorization",
  "resurrectPosture",
  "reuseWithdrawnAuthorization",
  "reuseRecalledPosture",
  "autoReenter",
  "autoRestore",
  "automaticRecovery",
  "automaticRetry",
  "automaticInheritanceReentry",
  "inferredEligibilityReentry",
  "configurationDrivenReentry",
  "implicitReentry",
  "exportReadyAlone",
  "eligibilityAlone",
  "g11ExportReadyMintsReentry",
  "suspendHandoff",
  "withdrawHandoff",
  "recallHandoff",
  "expireHandoff",
  "suspensionActId",
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
  "brainReenterHandoff",
  "brainHandoffReentry",
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

export function createGovernedHandoffReentryActId(): GovernedHandoffReentryActId {
  return `governed-handoff-reentry-act-${randomUUID()}` as GovernedHandoffReentryActId;
}

export function createHoemReentryOperativeRecordId(): HoemReentryOperativeRecordId {
  return `hoem-reentry-operative-${randomUUID()}` as HoemReentryOperativeRecordId;
}

export function assertNoHandoffReentryResumptionRestorationOrResurrectionClaims(
  input: Record<string, unknown>,
): void {
  for (const key of REENTRY_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Handoff re-entry must not resume, restore, resurrect withdrawn or recalled authority, mint authorization or posture, recover automatically, execute, or reject (R132/R138/R139)",
        "invalid_handoff_reentry",
        [
          "FI-DSN-STD-015-R132",
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
export function assertGovernedHandoffReentryActor(input: {
  reenteredBy: string;
  authorityClassId: unknown;
  sourceAttribution?: unknown;
  performerClass?: unknown;
}): string {
  assertHgaSolePerformerForHercmAct({
    authorityClassId: input.authorityClassId,
    performerClass: input.performerClass,
    actKind: "reentry",
  });
  assertEstablishedHandoffGovernanceAuthorityForReentry(input.authorityClassId);
  assertNoHandoffReentryResumptionRestorationOrResurrectionClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot perform HERCM re-entry acts (R22/R70/R126)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R22", "FI-DSN-STD-015-R70", "FI-DSN-STD-015-R126"],
    );
  }

  const reenteredBy = input.reenteredBy?.trim() ?? "";
  if (!reenteredBy) {
    throw new OrchestraConstitutionalError(
      "Handoff re-entry requires attributable reenteredBy actor within HGA scope; actor string alone is not HGA authority (R126)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R126"],
    );
  }
  const lower = reenteredBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_ACTOR_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "reenteredBy must not mint Brain or HAAM-prohibited authority-class identity as Handoff re-enterer (R70/R126)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R126"],
    );
  }
  return reenteredBy;
}

/**
 * R126–R139 — assess whether a lawful HGA REC-01/03/04/05 re-entry act may be performed.
 *
 * Each category must match its qualifying prior state (R131/R133): REC-03 the withdrawal
 * tip, REC-04 the recall tip, REC-01 the projected/attributable Rejected fact, and REC-05
 * the projected Expired fact. G11 export_ready must hold anew, but authorizes the
 * consideration only (R128). Invalidated/Superseded GPRA blocks re-entry outright (R129).
 */
export function assessGovernedHandoffReentry(input: {
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
  withdrawal?: GovernedHandoffWithdrawalActRecord | null;
  withdrawalIsCurrent?: unknown;
  recall?: GovernedHandoffRecallActRecord | null;
  recallIsCurrent?: unknown;
  lifecycleProjectedState?: HandoffActLayerLifecycleState | null;
  authorityClassId?: unknown;
  performerClass?: unknown;
  advisoryEvidenceAlone?: unknown;
  implementationInferenceAlone?: unknown;
  downstreamOperationalEventAlone?: unknown;
  hercmCatalogAlone?: unknown;
  exportReadyAlone?: unknown;
  eligibilityAlone?: unknown;
  spansMultipleBindings?: unknown;
  mergesPostureChains?: unknown;
  silentCrossContextPropagation?: unknown;
  foreignBinding?: unknown;
  unattributedGpraPropagation?: unknown;
  priorRecordsPreservedReconstructable?: unknown;
}): GovernedHandoffReentryAssessment {
  const denialReasons: string[] = [];

  const hercmCategory: HercmReentryCategoryId | null = isHercmReentryCategoryId(
    input.hercmCategory,
  )
    ? input.hercmCategory
    : null;
  if (!hercmCategory) {
    denialReasons.push("hercm_category_not_a_reentry_category");
  }
  const category = hercmCategory ? resolveHercmCategory(hercmCategory) : null;

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

  // R75(a) — a valid governed Handoff target requires attributable prior authorization
  // and posture history. Re-entry does NOT resurrect them (R132); they are lineage only.
  if (!input.authorization) {
    denialReasons.push("missing_attributable_predecessor_authorization");
  } else if (input.entry && input.authorization.entryId !== input.entry.entryId) {
    denialReasons.push("authorization_foreign_to_entry");
  } else if (
    input.binding &&
    input.authorization.consumerClassId !== input.binding.consumerClassId
  ) {
    denialReasons.push("authorization_foreign_to_binding_consumer_class");
  }

  if (!input.posture) {
    denialReasons.push("missing_attributable_predecessor_posture");
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

  // R128 — export_ready must hold anew for re-entry categories, and authorizes
  // consideration only; it never mints the act.
  if (category?.requiresExportReadyAnew) {
    if (input.eligibilityLayerCondition === "blocked") {
      denialReasons.push("g11_eligibility_blocked");
    } else if (input.eligibilityLayerCondition !== "export_ready") {
      denialReasons.push("g11_eligibility_not_export_ready_anew");
    }
  }

  // R131 — the basis kind is fixed per category.
  const basisKind = isReentryConstitutionalBasisKind(input.constitutionalBasisKind)
    ? input.constitutionalBasisKind
    : null;
  if (!basisKind) {
    denialReasons.push("constitutional_basis_kind_required");
  } else if (category && basisKind !== category.basisKind) {
    denialReasons.push("basis_kind_not_valid_for_hercm_category");
  }
  if (
    typeof input.constitutionalBasisNotes === "string" &&
    input.constitutionalBasisNotes.trim() &&
    !basisKind
  ) {
    denialReasons.push("notes_cannot_be_sole_constitutional_basis");
  }

  // R131 / R133 — qualifying prior state per category.
  const withdrawal = input.withdrawal ?? null;
  const recall = input.recall ?? null;
  const projected = input.lifecycleProjectedState ?? null;

  if (category) {
    if (category.categoryId === "REC-03") {
      if (!withdrawal) {
        denialReasons.push("qualifying_prior_withdrawal_missing");
      } else if (input.binding && withdrawal.bindingId !== input.binding.bindingId) {
        denialReasons.push("withdrawal_foreign_to_binding");
      } else if (input.withdrawalIsCurrent !== true) {
        denialReasons.push("qualifying_prior_withdrawal_not_controlling");
      }
      if (projected !== null && projected !== "withdrawn") {
        denialReasons.push("qualifying_prior_state_not_withdrawn");
      }
    } else if (category.categoryId === "REC-04") {
      if (!recall) {
        denialReasons.push("qualifying_prior_recall_missing");
      } else if (input.binding && recall.bindingId !== input.binding.bindingId) {
        denialReasons.push("recall_foreign_to_binding");
      } else if (input.recallIsCurrent !== true) {
        denialReasons.push("qualifying_prior_recall_not_controlling");
      }
      if (projected !== null && projected !== "recalled") {
        denialReasons.push("qualifying_prior_state_not_recalled");
      }
    } else if (category.categoryId === "REC-01") {
      // Rejected is an HSLM denotation (R48/R51), not an HGA act — the qualifying prior
      // fact is the projected/attributable Rejected state, never a claimed boolean.
      if (projected !== "rejected") {
        denialReasons.push("qualifying_prior_rejected_missing");
      }
    } else if (category.categoryId === "REC-05") {
      // Expiry acts remain deferred to R140+; the qualifying prior fact is the
      // projected/attributable Expired state.
      if (projected !== "expired") {
        denialReasons.push("qualifying_prior_expired_missing");
      }
    }
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
  ].filter((x): x is string => x !== null);

  if (soleClaimedSubstitutes.length > 0) {
    denialReasons.push(...soleClaimedSubstitutes.map((s) => `${s}_cannot_be_sole_basis`));
  }

  const shared = assessHercmSharedPreconditions({
    hercmCategory: hercmCategory ?? input.hercmCategory,
    bindingId: input.binding?.bindingId,
    hasPriorAuthorization: !!input.authorization,
    hasPriorPosture: !!input.posture,
    hasLifecycleOperativeHistory:
      !!withdrawal || !!recall || projected === "rejected" || projected === "expired",
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

  const mayReenter = denialReasons.length === 0;
  return Object.freeze({
    mayReenter,
    denialReasons: Object.freeze([...denialReasons]),
    authorityClassId: mayReenter ? ("handoff_governance_authority" as const) : null,
    hercmCategory,
    entryCurrency: input.entryCurrency,
    bindingCurrency: input.bindingCurrency,
    authorizationCurrency: input.authorizationCurrency,
    postureDeclarationCurrency: input.postureCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    eligibilityLayerCondition: input.eligibilityLayerCondition,
    constitutionalBasisKind: basisKind,
    qualifyingPriorState: category?.qualifyingPriorState ?? null,
    predecessorWithdrawalActId:
      category?.categoryId === "REC-03" ? withdrawal?.withdrawalActId ?? null : null,
    predecessorRecallActId:
      category?.categoryId === "REC-04" ? recall?.recallActId ?? null : null,
    requiresNewPostureAfterNewAuthorization:
      category?.requiresNewPostureAfterNewAuthorization ?? false,
    returnsTowardEligibleForConsiderationOnly: true as const,
    requiresNewAuthorizationViaG2: true as const,
    doesNotResurrectAuthorization: true as const,
    doesNotResurrectPosture: true as const,
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
    notHercmResumption: true as const,
    notHgaMatrixActType: true as const,
  });
}

/**
 * R139 — repeated re-entries are additive; the tip is the latest by reenteredAt.
 */
export function selectAuthoritativeGovernedHandoffReentry(
  reentries: readonly GovernedHandoffReentryActRecord[],
): GovernedHandoffReentryActRecord | null {
  if (reentries.length === 0) return null;
  return [...reentries].sort((a, b) => a.reenteredAt.localeCompare(b.reenteredAt)).at(-1)!;
}

/**
 * True when the re-entry tip supersedes a cessation tip for lifecycle projection.
 * Re-entry never deletes the withdrawal/recall record; it only lifts its control (R135).
 */
export function reentrySupersedesCessation(input: {
  cessationAt: string | null;
  reentry: GovernedHandoffReentryActRecord | null;
}): boolean {
  if (!input.reentry || input.cessationAt == null) return false;
  return input.reentry.reenteredAt.localeCompare(input.cessationAt) >= 0;
}

export function evaluateHandoffReentryCurrencyFromFacts(input: {
  reentry: GovernedHandoffReentryActRecord;
  currentEntryCurrency: HandoffEntryCurrency;
  currentBindingCurrency: HandoffConsumerBindingCurrency;
  authoritativeReentryActId: GovernedHandoffReentryActId | null;
  gpraValidityPosture: GpraValidityPosture | null;
  lineageMatchesAuthoritativeGpra: boolean;
  /** A later cessation act supersedes this re-entry. */
  supersedingCessationAt?: string | null;
}): HandoffReentryCurrency {
  if (
    input.authoritativeReentryActId != null &&
    input.reentry.reentryActId !== input.authoritativeReentryActId
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
    input.supersedingCessationAt != null &&
    input.supersedingCessationAt.localeCompare(input.reentry.reenteredAt) > 0
  ) {
    return "stale";
  }
  return "current";
}

export interface CreateGovernedHandoffReentryActInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly binding: GovernedHandoffConsumerBindingRecord;
  readonly predecessorAuthorization: GovernedHandoffAuthorizationActRecord;
  readonly predecessorPosture: GovernedHandoffPostureDeclarationActRecord;
  readonly predecessorWithdrawal?: GovernedHandoffWithdrawalActRecord | null;
  readonly predecessorRecall?: GovernedHandoffRecallActRecord | null;
  readonly authorityClassId: unknown;
  readonly reenteredBy: string;
  readonly reenteredAt?: string;
  readonly hercmCategory: unknown;
  readonly constitutionalBasisKind: unknown;
  readonly constitutionalBasisNotes?: unknown;
  readonly sourceAttribution?: unknown;
  readonly performerClass?: unknown;
  readonly resumeHandoff?: unknown;
  readonly resumptionActId?: unknown;
  readonly restoreHandoff?: unknown;
  readonly restorationActId?: unknown;
  readonly reinstateHandoff?: unknown;
  readonly reviveHandoff?: unknown;
  readonly resurrectAuthorization?: unknown;
  readonly resurrectPosture?: unknown;
  readonly autoReenter?: unknown;
  readonly autoRestore?: unknown;
  readonly automaticRecovery?: unknown;
  readonly automaticRetry?: unknown;
  readonly implicitReentry?: unknown;
  readonly exportReadyAlone?: unknown;
  readonly suspensionActId?: unknown;
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
  readonly brainReenterHandoff?: unknown;
  readonly brainHandoffReentry?: unknown;
  readonly rejectHandoff?: unknown;
}

/**
 * Construct an operative HGA re-entry act + HOEM re-entry record.
 * Caller must have verified the R126–R139 prerequisites via assessGovernedHandoffReentry.
 */
export function createGovernedHandoffReentryActRecord(
  input: CreateGovernedHandoffReentryActInput,
): GovernedHandoffReentryActRecord {
  assertNoHandoffReentryResumptionRestorationOrResurrectionClaims(
    input as unknown as Record<string, unknown>,
  );
  assertNoAutomaticHercmRecovery("reentry", input as unknown as Record<string, unknown>);
  assertExportReadyDoesNotMintHercmAct({
    actKind: "reentry",
    exportReadyAlone: input.exportReadyAlone,
  });
  const reenteredBy = assertGovernedHandoffReentryActor(input);
  assertEstablishedHandoffGovernanceAuthorityForReentry(input.authorityClassId);

  assertHercmReentryCategoryId(input.hercmCategory);
  assertReentryConstitutionalBasisKind(input.constitutionalBasisKind);
  assertHercmBasisKindMatchesCategory(input.hercmCategory, input.constitutionalBasisKind);
  const category = resolveHercmCategory(input.hercmCategory);

  const hga = resolveEstablishedHandoffGovernanceAuthorityClass(
    input.authorityClassId as "handoff_governance_authority",
  );

  const { entry, binding } = input;
  const authorization = input.predecessorAuthorization;
  const posture = input.predecessorPosture;
  const withdrawal = input.predecessorWithdrawal ?? null;
  const recall = input.predecessorRecall ?? null;
  const basisKind = input.constitutionalBasisKind;

  assertHercmActSubjectScope({
    hercmCategory: input.hercmCategory,
    bindingId: binding.bindingId,
  });

  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff re-entry requires HCCM binding belonging to the provided G1 entry (R130)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R130"],
    );
  }
  if (
    authorization.entryId !== entry.entryId ||
    authorization.consumerClassId !== binding.consumerClassId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff re-entry requires the predecessor authorization to belong to the entry and binding consumer class (R130)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R130"],
    );
  }
  if (posture.bindingId !== binding.bindingId || posture.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff re-entry requires the predecessor posture to belong to the provided binding and entry (R130)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R130"],
    );
  }
  if (category.categoryId === "REC-03") {
    if (!withdrawal) {
      throw new OrchestraConstitutionalError(
        "HERCM REC-03 re-entry requires the qualifying prior withdrawal act (R131/R133)",
        "invalid_handoff_reentry",
        ["FI-DSN-STD-015-R131", "FI-DSN-STD-015-R133"],
      );
    }
    if (withdrawal.bindingId !== binding.bindingId || withdrawal.entryId !== entry.entryId) {
      throw new OrchestraConstitutionalError(
        "HERCM REC-03 withdrawal is foreign to the provided binding or entry (R130/R133)",
        "invalid_handoff_reentry",
        ["FI-DSN-STD-015-R130", "FI-DSN-STD-015-R133"],
      );
    }
  } else if (withdrawal) {
    throw new OrchestraConstitutionalError(
      `HERCM ${category.categoryId} must not claim a withdrawal predecessor; REC-03 is the Post-Withdrawn category (R131)`,
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R131"],
    );
  }
  if (category.categoryId === "REC-04") {
    if (!recall) {
      throw new OrchestraConstitutionalError(
        "HERCM REC-04 re-entry requires the qualifying prior recall act (R131/R133)",
        "invalid_handoff_reentry",
        ["FI-DSN-STD-015-R131", "FI-DSN-STD-015-R133"],
      );
    }
    if (recall.bindingId !== binding.bindingId || recall.entryId !== entry.entryId) {
      throw new OrchestraConstitutionalError(
        "HERCM REC-04 recall is foreign to the provided binding or entry (R130/R133)",
        "invalid_handoff_reentry",
        ["FI-DSN-STD-015-R130", "FI-DSN-STD-015-R133"],
      );
    }
  } else if (recall) {
    throw new OrchestraConstitutionalError(
      `HERCM ${category.categoryId} must not claim a recall predecessor; REC-04 is the Post-Recalled category (R131)`,
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R131"],
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
      "Handoff re-entry rejected: binding lineage does not match entry (R130)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R130"],
    );
  }

  const notes =
    typeof input.constitutionalBasisNotes === "string" &&
    input.constitutionalBasisNotes.trim()
      ? input.constitutionalBasisNotes.trim()
      : null;
  const provenance: ReentryConstitutionalBasisProvenance = Object.freeze({
    basisKind: basisKind as ReentryConstitutionalBasisKind,
    notes,
    notesCannotBeSoleBasis: true as const,
  });

  const now = input.reenteredAt ?? new Date().toISOString();
  const reentryActId = createGovernedHandoffReentryActId();
  const hoemReentryRecord: HoemReentryOperativeRecord = Object.freeze({
    hoemReentryRecordId: createHoemReentryOperativeRecordId(),
    reentryActId,
    actType: "reentry" as const,
    hercmCategory: category.categoryId as HercmReentryCategoryId,
    qualifyingPriorState: category.qualifyingPriorState,
    gpraId: entry.gpraId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    bindingId: binding.bindingId,
    consumerClassId: binding.consumerClassId,
    predecessorAuthorizationActId: authorization.authorizationActId,
    predecessorPostureDeclarationActId: posture.postureDeclarationActId,
    predecessorWithdrawalActId: withdrawal?.withdrawalActId ?? null,
    predecessorRecallActId: recall?.recallActId ?? null,
    predecessorRejectionAttributionId: null,
    predecessorExpiryActId: null,
    constitutionalBasisKind: basisKind as ReentryConstitutionalBasisKind,
    effectiveAt: now,
    doesNotMergeAuthorizationAttribution: true as const,
    doesNotMergePostureDeclarationAttribution: true as const,
    doesNotMergeCompletionAttribution: true as const,
    doesNotMergeSuspensionAttribution: true as const,
    doesNotMergeWithdrawalAttribution: true as const,
    doesNotMergeRecallAttribution: true as const,
    doesNotMergeResumptionAttribution: true as const,
    doesNotMergeLifecycleAttribution: true as const,
    notHgaMatrixActType: true as const,
  });

  return Object.freeze({
    reentryActId,
    authorityClassId: hga.authorityClassId,
    authorityGoverningSourceId: hga.governingSourceId,
    authorityConstitutionalScope: "handoff_reentry_act" as const,
    hercmCategory: category.categoryId as HercmReentryCategoryId,
    reenteredBy,
    reenteredAt: now,
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    predecessorAuthorizationActId: authorization.authorizationActId,
    predecessorPostureDeclarationActId: posture.postureDeclarationActId,
    predecessorWithdrawalActId: withdrawal?.withdrawalActId ?? null,
    predecessorRecallActId: recall?.recallActId ?? null,
    predecessorRejectionAttributionId: null,
    predecessorExpiryActId: null,
    hercmQualifyingPriorState: category.qualifyingPriorState,
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
    constitutionalBasisKind: basisKind as ReentryConstitutionalBasisKind,
    constitutionalBasisProvenance: provenance,
    returnsTowardEligibleForConsiderationOnly: true as const,
    requiresNewAuthorizationViaG2: true as const,
    requiresNewPostureAfterNewAuthorization:
      category.requiresNewPostureAfterNewAuthorization,
    doesNotResurrectAuthorization: true as const,
    doesNotResurrectPosture: true as const,
    doesNotMintNewAuthorization: true as const,
    doesNotMintNewPostureDeclaration: true as const,
    doesNotEraseSuspensionHistory: true as const,
    doesNotEraseWithdrawalHistory: true as const,
    doesNotEraseRecallHistory: true as const,
    notHandoffSuspension: true as const,
    notHandoffWithdrawal: true as const,
    notHandoffRecall: true as const,
    notHandoffCompletion: true as const,
    notHercmResumption: true as const,
    notRestoration: true as const,
    notAutomaticRecovery: true as const,
    effectFraming: "return_toward_eligible_for_consideration" as const,
    hoemReentryRecord,
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
    r126DistinctHercmReentryAct: true as const,
    r127ClosedHercmCategorySet: true as const,
    r128ExportReadyAuthorizesConsiderationOnly: true as const,
    r129NoAutomaticRecoveryAndInvalidatedBlocks: true as const,
    r130SingleBindingPostureChain: true as const,
    r131CategoryConditionsSatisfied: true as const,
    r132ReturnTowardEligibleRequiresNewAuthorization: true as const,
    r133QualifyingPriorStateRequired: true as const,
    r134ProspectiveFromReenteredAtNoRewrite: true as const,
    r135AdditivePreservationOfPriorHistory: true as const,
    r136HoemReentryOperativeRecord: true as const,
    r137NotAutomaticHslmPromotionHslmStaysEight: true as const,
    r138InvalidAttemptsNonOperative: true as const,
    r139RepeatedHercmActsAdditiveNotSubstitute: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: reenteredBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_REENTRY_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
