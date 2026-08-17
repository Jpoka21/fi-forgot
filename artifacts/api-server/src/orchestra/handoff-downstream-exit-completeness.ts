/**
 * Governed Handoff Downstream Exit Completeness — FI-DSN-STD-015 HOF-G8 completion (R142–R145).
 *
 * Operative SATISFACTION that a constitutionally attributable R58–R65 downstream exit
 * has met R143 qualifying conditions at the Volume 06 terminus.
 *
 * NOT an HGA matrix act. NOT a ninth type. NOT an HSLM state.
 * Does NOT mint downstream acceptance, membership, manufacturing, fulfillment, or execution.
 * Consumes existing HOEM exit_boundary linkage (R64); does not invent a new HOEM type.
 *
 * Raw constructors — prefer Domain3Repository.satisfyGovernedHandoffDownstreamExitCompleteness.
 * NOT exported from orchestra barrel.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  ExitCompletenessSatisfactionEvidence,
  ExitCompletenessSatisfactionEvidenceCategory,
  GovernedHandoffAuthorizationActId,
  GovernedHandoffCompletionActRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffDownstreamExitBoundaryAttributionRecord,
  GovernedHandoffDownstreamExitCompletenessAssessment,
  GovernedHandoffDownstreamExitCompletenessAttemptId,
  GovernedHandoffDownstreamExitCompletenessAttemptRecord,
  GovernedHandoffDownstreamExitCompletenessSatisfactionId,
  GovernedHandoffDownstreamExitCompletenessSatisfactionRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GpraValidityPosture,
  HandoffActLayerLifecycleState,
  HandoffCompletionCurrency,
  HandoffConsumerBindingCurrency,
  HandoffDownstreamExitBoundaryCurrency,
  HandoffDownstreamExitCompletenessCurrency,
  HandoffDownstreamExitCompletenessEvaluation,
  HandoffEntryCurrency,
  HandoffPostureDeclarationCurrency,
  HccmConsumerClassId,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertEstablishedHandoffGovernanceAuthorityClass,
  isCanonicalEstablishedHandoffGovernanceAuthorityClassId,
  resolveEstablishedHandoffGovernanceAuthorityClass,
} from "./handoff-governance-authority.js";
import {
  HOEM_EXIT_BOUNDARY_ACT_TYPE,
  VOLUME_06_HANDOFF_AUTHORITY_TERMINUS,
} from "./handoff-downstream-exit-boundary.js";
import { resolveHccmConsumerClass } from "./hccm-consumer-classes.js";
import { FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES } from "./handoff-act-lifecycle.js";
import { HGA_MATRIX_ACT_TYPES } from "./handoff-authority-catalog.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G8_COMPLETION_REQUIREMENTS = [
  "FI-DSN-STD-015-R142",
  "FI-DSN-STD-015-R143",
  "FI-DSN-STD-015-R144",
  "FI-DSN-STD-015-R145",
  "FI-DSN-STD-015-R58",
  "FI-DSN-STD-015-R59",
  "FI-DSN-STD-015-R61",
  "FI-DSN-STD-015-R62",
  "FI-DSN-STD-015-R63",
  "FI-DSN-STD-015-R64",
  "FI-DSN-STD-015-R65",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_DOWNSTREAM_EXIT_COMPLETENESS_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G8_COMPLETION_REQUIREMENTS]);

export const DOWNSTREAM_EXIT_COMPLETENESS_SATISFACTION_KIND =
  "downstream_exit_completeness_satisfaction" as const;

export const EXIT_COMPLETENESS_SATISFACTION_EVIDENCE_CATEGORIES = [
  "completed_lifecycle_attributable",
  "single_hccm_binding",
  "authoritative_hppm_posture_chain_forward_reliance_not_paused",
  "catalog_downstream_domain_routing",
  "hcbm_tuple_domain_consistency",
  "existing_exit_boundary_hoem_linkage",
] as const satisfies readonly ExitCompletenessSatisfactionEvidenceCategory[];

const EXIT_COMPLETENESS_FORBIDDEN_KEYS = [
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
  "executesHandoff",
  "handoffExecuted",
  "performHandoff",
  "executionQueueId",
  "constitutionalQueueId",
  "intakeCompletionId",
  "completeEqualsTrue",
  "brainExitCompleteness",
  "implicitExitCompleteness",
  "automaticInheritanceCompleteness",
  "resumptionSatisfiesCompleteness",
  "handoff_exit_completeness_act",
  "handoff_exit_act",
  "rejectHandoffActLayer",
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

const BLOCKING_LIFECYCLE_STATES = new Set<HandoffActLayerLifecycleState>([
  "recalled",
  "withdrawn",
  "rejected",
]);

export function createGovernedHandoffDownstreamExitCompletenessSatisfactionId(): GovernedHandoffDownstreamExitCompletenessSatisfactionId {
  return `governed-handoff-downstream-exit-completeness-satisfaction-${randomUUID()}` as GovernedHandoffDownstreamExitCompletenessSatisfactionId;
}

export function createGovernedHandoffDownstreamExitCompletenessAttemptId(): GovernedHandoffDownstreamExitCompletenessAttemptId {
  return `governed-handoff-downstream-exit-completeness-attempt-${randomUUID()}` as GovernedHandoffDownstreamExitCompletenessAttemptId;
}

export function assertNoDownstreamExitCompletenessAcceptanceMembershipOrExecutionClaims(
  input: Record<string, unknown>,
): void {
  for (const key of EXIT_COMPLETENESS_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Downstream exit completeness must not accept, admit membership, manufacture, fulfill, publish, distribute, execute, or treat Brain/boolean/resumption as satisfaction (R142/R144)",
        "invalid_handoff_downstream_exit_completeness",
        ["FI-DSN-STD-015-R142", "FI-DSN-STD-015-R144", "FI-DSN-STD-015-R145"],
      );
    }
  }
}

export function assertExitCompletenessIsNotHgaMatrixAct(): void {
  if ((HGA_MATRIX_ACT_TYPES as readonly string[]).includes("exit_completeness")) {
    throw new OrchestraConstitutionalError(
      "exit_completeness must not enter the eight-type HGA matrix (R140/R142)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R140", "FI-DSN-STD-015-R142"],
    );
  }
  if (
    (FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES as readonly string[]).includes("exit_complete") ||
    (FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES as readonly string[]).includes("exited")
  ) {
    throw new OrchestraConstitutionalError(
      "Exit completeness must not invent an HSLM state (R48/R142)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R48", "FI-DSN-STD-015-R142"],
    );
  }
}

export function assertGovernedHandoffDownstreamExitCompletenessActor(input: {
  satisfiedBy: string;
  authorityClassId: unknown;
  sourceAttribution?: unknown;
}): string {
  assertExitCompletenessIsNotHgaMatrixAct();
  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(input.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness requires constitutionally established HGA class; Brain, MAGAC, DDAC, DSRA, IVAC, SSAC, GPRA, workflow, actor string, or fabricated ID cannot mint completeness (R142)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R142", "FI-DSN-STD-015-R69"],
    );
  }
  assertEstablishedHandoffGovernanceAuthorityClass(input.authorityClassId);
  assertNoDownstreamExitCompletenessAcceptanceMembershipOrExecutionClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot satisfy Handoff downstream exit completeness (R142/R69)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R142", "FI-DSN-STD-015-R69"],
    );
  }

  const satisfiedBy = input.satisfiedBy?.trim() ?? "";
  if (!satisfiedBy) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness requires attributable satisfiedBy actor within HGA class; actor string alone is not HGA authority (R142)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R142"],
    );
  }
  const lower = satisfiedBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_ACTOR_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "satisfiedBy must not mint Brain or HAAM-prohibited authority-class identity as completeness satisfier (R142/R69)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R142", "FI-DSN-STD-015-R69"],
    );
  }
  return satisfiedBy;
}

function hcbmKeysMatchCatalog(
  consumed: readonly string[],
  catalogKeys: readonly string[],
): boolean {
  if (consumed.length === 0) return false;
  const catalogSet = new Set(catalogKeys);
  return consumed.every((key) => catalogSet.has(key));
}

export function assessGovernedHandoffDownstreamExitCompleteness(input: {
  entry: GovernedHandoffEntryRecord | null;
  entryCurrency: HandoffEntryCurrency | null;
  binding: GovernedHandoffConsumerBindingRecord | null;
  bindingCurrency: HandoffConsumerBindingCurrency | null;
  posture: GovernedHandoffPostureDeclarationActRecord | null;
  postureCurrency: HandoffPostureDeclarationCurrency | null;
  completion: GovernedHandoffCompletionActRecord | null;
  completionCurrency: HandoffCompletionCurrency | null;
  exitBoundary: GovernedHandoffDownstreamExitBoundaryAttributionRecord | null;
  exitBoundaryCurrency: HandoffDownstreamExitBoundaryCurrency | null;
  currentLifecycleState: HandoffActLayerLifecycleState | null;
  gpraValidityPosture: GpraValidityPosture | null;
  lineageMatchesAuthoritativeGpra: boolean;
  requestedExitBoundaryAttributionId?: string | null;
  requestedDownstreamConsiderationDomain?: string | null;
  booleanComplete?: unknown;
  catalogMembershipAlone?: unknown;
  exportReadyAlone?: unknown;
  completionAlone?: unknown;
  exitBoundaryAlone?: unknown;
  resumptionAlone?: unknown;
}): GovernedHandoffDownstreamExitCompletenessAssessment {
  const denialReasons: string[] = [];

  if (input.booleanComplete === true) {
    denialReasons.push("boolean_complete_insufficient");
  }
  if (input.catalogMembershipAlone === true) {
    denialReasons.push("catalog_membership_insufficient");
  }
  if (input.exportReadyAlone === true) {
    denialReasons.push("export_ready_alone_insufficient");
  }
  if (input.completionAlone === true) {
    denialReasons.push("completion_alone_insufficient");
  }
  if (input.exitBoundaryAlone === true) {
    denialReasons.push("exit_boundary_alone_insufficient");
  }
  if (input.resumptionAlone === true) {
    denialReasons.push("resumption_alone_does_not_satisfy");
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

  if (!input.posture) {
    denialReasons.push("missing_authoritative_handoff_posture");
  } else if (input.postureCurrency !== "current") {
    denialReasons.push("stale_authoritative_handoff_posture");
  } else if (input.binding && input.posture.bindingId !== input.binding.bindingId) {
    denialReasons.push("posture_foreign_to_binding");
  }

  if (!input.completion) {
    denialReasons.push("missing_current_handoff_completion");
  } else if (input.completionCurrency !== "current") {
    denialReasons.push("stale_handoff_completion");
  } else if (input.binding && input.completion.bindingId !== input.binding.bindingId) {
    denialReasons.push("completion_foreign_to_binding");
  }

  if (input.currentLifecycleState !== "completed") {
    denialReasons.push("completed_lifecycle_not_attributable");
  }
  if (
    input.currentLifecycleState &&
    BLOCKING_LIFECYCLE_STATES.has(input.currentLifecycleState)
  ) {
    denialReasons.push(`blocking_lifecycle_state_${input.currentLifecycleState}`);
  }
  if (input.currentLifecycleState === "suspended") {
    denialReasons.push("forward_reliance_paused_by_suspension");
  }

  if (!input.exitBoundary) {
    denialReasons.push("missing_exit_boundary_attribution");
  } else if (input.exitBoundaryCurrency !== "current") {
    denialReasons.push("stale_exit_boundary_attribution");
  } else if (input.binding && input.exitBoundary.bindingId !== input.binding.bindingId) {
    denialReasons.push("exit_boundary_foreign_to_binding");
  } else if (
    input.completion &&
    input.exitBoundary.completionActId !== input.completion.completionActId
  ) {
    denialReasons.push("exit_boundary_foreign_to_completion");
  } else if (
    input.posture &&
    input.exitBoundary.postureDeclarationActId !== input.posture.postureDeclarationActId
  ) {
    denialReasons.push("exit_boundary_foreign_to_posture");
  } else if (
    input.requestedExitBoundaryAttributionId &&
    input.requestedExitBoundaryAttributionId !== input.exitBoundary.exitBoundaryAttributionId
  ) {
    denialReasons.push("requested_exit_boundary_not_authoritative");
  } else if (input.exitBoundary.hoemExitBoundaryRecord.actType !== HOEM_EXIT_BOUNDARY_ACT_TYPE) {
    denialReasons.push("exit_boundary_hoem_type_invalid");
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
    if (input.binding.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain) {
      denialReasons.push("binding_downstream_domain_mismatch_catalog");
    }
    if (
      input.requestedDownstreamConsiderationDomain != null &&
      input.requestedDownstreamConsiderationDomain !== catalog.downstreamConsiderationDomain
    ) {
      denialReasons.push("downstream_consideration_domain_mismatch_catalog");
    }
    if (
      input.exitBoundary &&
      input.exitBoundary.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain
    ) {
      denialReasons.push("exit_boundary_domain_mismatch_catalog");
    }
    if (
      input.exitBoundary &&
      input.exitBoundary.consumerClassId !== input.binding.consumerClassId
    ) {
      denialReasons.push("exit_boundary_consumer_class_mismatch");
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

  const maySatisfy = denialReasons.length === 0;
  return Object.freeze({
    maySatisfy,
    denialReasons: Object.freeze([...denialReasons]),
    authorityClassId: maySatisfy ? ("handoff_governance_authority" as const) : null,
    catalogDownstreamConsiderationDomain: catalogDomain,
    currentLifecycleState: input.currentLifecycleState,
    entryCurrency: input.entryCurrency,
    bindingCurrency: input.bindingCurrency,
    postureDeclarationCurrency: input.postureCurrency,
    completionCurrency: input.completionCurrency,
    exitBoundaryCurrency: input.exitBoundaryCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    volume06Terminus: VOLUME_06_HANDOFF_AUTHORITY_TERMINUS,
    notHgaMatrixActType: true as const,
    notNinthHgaMatrixAct: true as const,
    notHandoffCompletionAct: true as const,
    notExitBoundaryAttribution: true as const,
    notDownstreamAcceptance: true as const,
    notMembershipAdmission: true as const,
    notManufacturingOrFulfillmentOrExecution: true as const,
    notHslmStateTransition: true as const,
    catalogMembershipDoesNotSatisfy: true as const,
    resumptionAloneDoesNotSatisfy: true as const,
    r142Volume06TerminusSatisfaction: true as const,
    r143QualifyingConditions: true as const,
    r144PeerDistinctFromExitBoundary: true as const,
    r145GenericCcRoutingNoClassInvention: true as const,
  });
}

export function selectAuthoritativeGovernedHandoffDownstreamExitCompleteness(
  records: readonly GovernedHandoffDownstreamExitCompletenessSatisfactionRecord[],
): GovernedHandoffDownstreamExitCompletenessSatisfactionRecord | null {
  if (records.length === 0) return null;
  return [...records].sort((a, b) => a.satisfiedAt.localeCompare(b.satisfiedAt)).at(-1)!;
}

export function evaluateHandoffDownstreamExitCompletenessCurrencyFromFacts(input: {
  satisfaction: GovernedHandoffDownstreamExitCompletenessSatisfactionRecord;
  currentEntryCurrency: HandoffEntryCurrency;
  currentBindingCurrency: HandoffConsumerBindingCurrency;
  currentCompletionCurrency: HandoffCompletionCurrency;
  currentPostureCurrency: HandoffPostureDeclarationCurrency;
  currentExitBoundaryCurrency: HandoffDownstreamExitBoundaryCurrency;
  currentLifecycleState: HandoffActLayerLifecycleState | null;
  authoritativeSatisfactionId: GovernedHandoffDownstreamExitCompletenessSatisfactionId | null;
}): HandoffDownstreamExitCompletenessCurrency {
  if (
    input.currentEntryCurrency !== "current" ||
    input.currentBindingCurrency !== "current" ||
    input.currentCompletionCurrency !== "current" ||
    input.currentPostureCurrency !== "current" ||
    input.currentExitBoundaryCurrency !== "current"
  ) {
    return "stale";
  }
  if (input.currentLifecycleState !== "completed") {
    return "stale";
  }
  if (
    input.authoritativeSatisfactionId != null &&
    input.satisfaction.exitCompletenessSatisfactionId !== input.authoritativeSatisfactionId
  ) {
    return "stale";
  }
  return "current";
}

export function evaluateDownstreamExitCompletenessFromFacts(input: {
  satisfaction: GovernedHandoffDownstreamExitCompletenessSatisfactionRecord | null;
  satisfactionIsCurrent: boolean;
  exitBoundary: GovernedHandoffDownstreamExitBoundaryAttributionRecord | null;
  completion: GovernedHandoffCompletionActRecord | null;
}): HandoffDownstreamExitCompletenessEvaluation {
  const completenessSatisfied = !!(input.satisfaction && input.satisfactionIsCurrent);
  return Object.freeze({
    completenessSatisfied,
    current: completenessSatisfied,
    exitCompletenessSatisfactionId:
      input.satisfaction?.exitCompletenessSatisfactionId ?? null,
    exitBoundaryAttributionId: input.exitBoundary?.exitBoundaryAttributionId ?? null,
    completionActId: input.completion?.completionActId ?? null,
    downstreamConsiderationDomain:
      input.satisfaction?.downstreamConsiderationDomain ??
      input.exitBoundary?.downstreamConsiderationDomain ??
      null,
    notIntake: true as const,
    notAcceptance: true as const,
    notMembership: true as const,
    notManufacturingOrExecution: true as const,
    notHgaMatrixAct: true as const,
    notHslmState: true as const,
    r142SatisfactionDistinctFromBoundary: true as const,
  });
}

export interface CreateGovernedHandoffDownstreamExitCompletenessSatisfactionInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly binding: GovernedHandoffConsumerBindingRecord;
  readonly posture: GovernedHandoffPostureDeclarationActRecord;
  readonly completion: GovernedHandoffCompletionActRecord;
  readonly exitBoundary: GovernedHandoffDownstreamExitBoundaryAttributionRecord;
  readonly authorityClassId: unknown;
  readonly satisfiedBy: string;
  readonly satisfiedAt?: string;
  readonly authorizationActId?: GovernedHandoffAuthorizationActId | null;
  readonly sourceAttribution?: unknown;
  readonly acceptDownstream?: unknown;
  readonly downstreamAcceptanceId?: unknown;
  readonly membershipAdmission?: unknown;
  readonly manufacturingExecution?: unknown;
  readonly fulfillment?: unknown;
  readonly publication?: unknown;
  readonly distribution?: unknown;
  readonly booleanComplete?: unknown;
  readonly brainExitCompleteness?: unknown;
  readonly resumptionSatisfiesCompleteness?: unknown;
}

function freezeSatisfactionEvidence(): ExitCompletenessSatisfactionEvidence {
  return Object.freeze({
    categories: Object.freeze([
      ...EXIT_COMPLETENESS_SATISFACTION_EVIDENCE_CATEGORIES,
    ]) as readonly ExitCompletenessSatisfactionEvidenceCategory[],
    booleanCompleteFlagInsufficient: true as const,
    freeTextInsufficient: true as const,
    brainRecommendationInsufficient: true as const,
    catalogMembershipInsufficient: true as const,
    exportReadyAloneInsufficient: true as const,
    completionAloneInsufficient: true as const,
    exitBoundaryAloneInsufficient: true as const,
  });
}

export function createGovernedHandoffDownstreamExitCompletenessSatisfactionRecord(
  input: CreateGovernedHandoffDownstreamExitCompletenessSatisfactionInput,
): GovernedHandoffDownstreamExitCompletenessSatisfactionRecord {
  assertNoDownstreamExitCompletenessAcceptanceMembershipOrExecutionClaims(
    input as unknown as Record<string, unknown>,
  );
  const satisfiedBy = assertGovernedHandoffDownstreamExitCompletenessActor(input);
  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(input.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Downstream exit completeness requires constitutionally established HGA class (R142)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R142"],
    );
  }
  const hga = resolveEstablishedHandoffGovernanceAuthorityClass(
    input.authorityClassId as "handoff_governance_authority",
  );

  const { entry, binding, posture, completion, exitBoundary } = input;
  const catalog = resolveHccmConsumerClass(binding.consumerClassId as HccmConsumerClassId);
  if (exitBoundary.bindingId !== binding.bindingId) {
    throw new OrchestraConstitutionalError(
      "Exit completeness requires the exit-boundary attribution of the same HCCM binding (R143/R145)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143", "FI-DSN-STD-015-R145"],
    );
  }
  if (exitBoundary.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain) {
    throw new OrchestraConstitutionalError(
      "Exit completeness domain must equal frozen HCCM catalog domain (R143/R145)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143", "FI-DSN-STD-015-R145"],
    );
  }
  if (exitBoundary.completionActId !== completion.completionActId) {
    throw new OrchestraConstitutionalError(
      "Exit completeness requires the current Completion bound by the exit-boundary attribution (R143)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143"],
    );
  }
  if (exitBoundary.postureDeclarationActId !== posture.postureDeclarationActId) {
    throw new OrchestraConstitutionalError(
      "Exit completeness requires the same authoritative posture chain as the exit-boundary attribution (R143)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R143"],
    );
  }
  if (exitBoundary.hoemExitBoundaryRecord.actType !== HOEM_EXIT_BOUNDARY_ACT_TYPE) {
    throw new OrchestraConstitutionalError(
      "Exit completeness must produce existing R64 HOEM exit_boundary linkage; new HOEM types are forbidden (R144)",
      "invalid_handoff_downstream_exit_completeness",
      ["FI-DSN-STD-015-R144", "FI-DSN-STD-015-R64"],
    );
  }

  const now = input.satisfiedAt ?? new Date().toISOString();
  return Object.freeze({
    exitCompletenessSatisfactionId:
      createGovernedHandoffDownstreamExitCompletenessSatisfactionId(),
    constitutionalArtifactKind: DOWNSTREAM_EXIT_COMPLETENESS_SATISFACTION_KIND,
    authorityClassId: hga.authorityClassId,
    authorityGoverningSourceId: hga.governingSourceId,
    satisfiedBy,
    satisfiedAt: now,
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    consumerClassId: binding.consumerClassId,
    consumedHcbmBoundaryKeys: Object.freeze([...binding.consumedHcbmBoundaryKeys]),
    downstreamConsiderationDomain: catalog.downstreamConsiderationDomain,
    exitBoundaryAttributionId: exitBoundary.exitBoundaryAttributionId,
    completionActId: completion.completionActId,
    postureDeclarationActId: posture.postureDeclarationActId,
    authorizationActId: input.authorizationActId ?? exitBoundary.authorizationActId,
    preparationId: entry.preparationId,
    gpraId: entry.gpraId,
    approvalActId: entry.approvalActId,
    reviewId: entry.reviewId,
    determinationId: entry.determinationId,
    rvaId: entry.rvaId,
    programId: entry.programId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    hoemExitBoundaryRecord: structuredClone(exitBoundary.hoemExitBoundaryRecord),
    satisfactionEvidence: freezeSatisfactionEvidence(),
    volume06Terminus: VOLUME_06_HANDOFF_AUTHORITY_TERMINUS,
    notHgaMatrixActType: true as const,
    notNinthHgaMatrixAct: true as const,
    notHandoffCompletionAct: true as const,
    notExitBoundaryAttribution: true as const,
    notDownstreamAcceptance: true as const,
    notMembershipAdmission: true as const,
    notManufacturingOrFulfillmentOrExecution: true as const,
    notHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffSuspension: true as const,
    notHandoffWithdrawal: true as const,
    notHandoffRecall: true as const,
    notHercmReentry: true as const,
    notHercmResumption: true as const,
    notHslmState: true as const,
    doesNotCollapsePeerDecisionClasses: true as const,
    doesNotMergeAcrossConsumerClasses: true as const,
    doesNotRewriteHistoricalRecords: true as const,
    producesR64HoemExitBoundaryLinkage: true as const,
    r142Volume06TerminusSatisfaction: true as const,
    r143QualifyingConditionsSatisfied: true as const,
    r144PeerDistinctProspective: true as const,
    r145SeparatelyAttributable: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: satisfiedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_DOWNSTREAM_EXIT_COMPLETENESS_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

export function createGovernedHandoffDownstreamExitCompletenessAttemptRecord(input: {
  attemptedBy: string;
  denialReasons: readonly string[];
  entryId?: string | null;
  bindingId?: string | null;
  currentLifecycleState?: HandoffActLayerLifecycleState | null;
  exitBoundaryAttributionId?: string | null;
  attemptedAt?: string;
}): GovernedHandoffDownstreamExitCompletenessAttemptRecord {
  const now = input.attemptedAt ?? new Date().toISOString();
  const attemptedBy = input.attemptedBy.trim() || "unknown-attempt-actor";
  return Object.freeze({
    attemptId: createGovernedHandoffDownstreamExitCompletenessAttemptId(),
    constitutionalArtifactKind: "downstream_exit_completeness_attempt_evidence" as const,
    attemptedBy,
    attemptedAt: now,
    entryId: (input.entryId ?? null) as never,
    bindingId: (input.bindingId ?? null) as never,
    denialReasons: Object.freeze([...input.denialReasons]),
    currentLifecycleState: input.currentLifecycleState ?? null,
    exitBoundaryAttributionId: (input.exitBoundaryAttributionId ?? null) as never,
    notSatisfaction: true as const,
    notHoemOperativeRecord: true as const,
    notHgaMatrixActType: true as const,
    notDownstreamAcceptance: true as const,
    r79AttemptEvidenceOnly: true as const,
    r145InvalidAttemptNonOperative: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: attemptedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_DOWNSTREAM_EXIT_COMPLETENESS_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
