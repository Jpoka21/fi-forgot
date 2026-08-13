/**
 * Governed Handoff Posture Declaration — FI-DSN-STD-015 HOF-G4 (R40–R47).
 *
 * Operative HGA posture declaration + HOEM posture_declaration record only.
 * Requires valid HCCM bound consumer context (R43) and minimum entry conditions (R47).
 * Does NOT require prior HGA authorization act (R44; §20.5.5.9 sequencing not mandated).
 * Does NOT complete, suspend, recall, withdraw, accept downstream, or execute (R41; R48+ deferred).
 *
 * Raw constructor — prefer Domain3Repository.declareHandoffPosture.
 * NOT exported from orchestra barrel.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPostureDeclarationActId,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPostureDeclarationAssessment,
  GovernedHandoffPreparationRecord,
  GpraValidityPosture,
  HandoffConsumerCategoryKey,
  HandoffConsumerBindingCurrency,
  HandoffEligibilityLayerCondition,
  HandoffEntryCurrency,
  HandoffPostureClass,
  HandoffPostureDeclarationCurrency,
  HandoffPreparationCurrency,
  HoemPostureDeclarationOperativeRecord,
  HoemPostureDeclarationOperativeRecordId,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertEstablishedHandoffGovernanceAuthorityForPostureDeclaration,
  resolveEstablishedHandoffGovernanceAuthorityClass,
} from "./handoff-governance-authority.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G4_REQUIREMENTS = [
  "FI-DSN-STD-015-R40",
  "FI-DSN-STD-015-R41",
  "FI-DSN-STD-015-R42",
  "FI-DSN-STD-015-R43",
  "FI-DSN-STD-015-R44",
  "FI-DSN-STD-015-R45",
  "FI-DSN-STD-015-R46",
  "FI-DSN-STD-015-R47",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_POSTURE_DECLARATION_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G4_REQUIREMENTS]);

/**
 * Frozen Handoff posture classes (Volume 06 §12.2 / HPPM affinity vocabulary).
 * `none` is catalog affinity for CC-03–CC-06 — not an invented lifecycle label.
 */
export const FROZEN_HANDOFF_POSTURE_CLASSES = [
  "library_intake_posture",
  "production_catalog_posture",
  "none",
] as const satisfies readonly HandoffPostureClass[];

const POSTURE_CLASS_SET = new Set<string>(FROZEN_HANDOFF_POSTURE_CLASSES);

export function isFrozenHandoffPostureClass(
  value: unknown,
): value is HandoffPostureClass {
  return typeof value === "string" && POSTURE_CLASS_SET.has(value);
}

export function assertFrozenHandoffPostureClass(
  value: unknown,
): asserts value is HandoffPostureClass {
  if (!isFrozenHandoffPostureClass(value)) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration requires a frozen posture class (library_intake_posture | production_catalog_posture | none); invented labels are prohibited (R46/R47)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R46", "FI-DSN-STD-015-R47"],
    );
  }
}

const POSTURE_FORBIDDEN_KEYS = [
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
  "brainDeclareHandoffPosture",
  "brainHandoffPosture",
  "implicitPosture",
  "automaticInheritancePosture",
  "inferredEligibilityPosture",
  "configurationDrivenPosture",
  "downstreamAcceptanceId",
  "permanentCollectionMembershipId",
  "hoemAuthorizationRecordId",
  "hoemCompletionRecordId",
  "hoemSuspensionRecordId",
  "hoemRecallRecordId",
  "hoemWithdrawalRecordId",
  "unifiedCc01Cc02Posture",
  "mergedCrossCcPosture",
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

export function createGovernedHandoffPostureDeclarationActId(): GovernedHandoffPostureDeclarationActId {
  return `governed-handoff-posture-declaration-act-${randomUUID()}` as GovernedHandoffPostureDeclarationActId;
}

export function createHoemPostureDeclarationOperativeRecordId(): HoemPostureDeclarationOperativeRecordId {
  return `hoem-posture-declaration-operative-${randomUUID()}` as HoemPostureDeclarationOperativeRecordId;
}

export function assertNoHandoffPostureCompletionOrExecutionClaims(
  input: Record<string, unknown>,
): void {
  for (const key of POSTURE_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Handoff posture declaration must not complete, suspend, recall, withdraw, accept downstream, execute, or claim implicit posture (R41/R47; R48+ deferred)",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R41", "FI-DSN-STD-015-R47"],
      );
    }
  }
}

/**
 * R40 / R47 — HGA class required; actor attribution is distinct and cannot mint authority.
 */
export function assertGovernedHandoffPostureDeclarationActor(input: {
  declaredBy: string;
  authorityClassId: unknown;
  sourceAttribution?: unknown;
}): string {
  assertEstablishedHandoffGovernanceAuthorityForPostureDeclaration(
    input.authorityClassId,
  );
  assertNoHandoffPostureCompletionOrExecutionClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot perform Handoff posture declaration acts (R22/R47)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R22", "FI-DSN-STD-015-R47"],
    );
  }

  const declaredBy = input.declaredBy?.trim() ?? "";
  if (!declaredBy) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration requires attributable declaredBy actor within HGA scope; actor string alone is not HGA authority (R40)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40"],
    );
  }
  const lower = declaredBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_ACTOR_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "declaredBy must not mint Brain or HAAM-prohibited authority-class identity as Handoff posture declarer (R47)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R47"],
    );
  }
  return declaredBy;
}

/**
 * R43 / R47 — binding + entry conditions gated. Does NOT require prior authorization act (R44).
 */
export function assessGovernedHandoffPostureDeclaration(input: {
  entry: GovernedHandoffEntryRecord | null;
  entryCurrency: HandoffEntryCurrency | null;
  binding: GovernedHandoffConsumerBindingRecord | null;
  bindingCurrency: HandoffConsumerBindingCurrency | null;
  preparation: GovernedHandoffPreparationRecord | null;
  preparationCurrency: HandoffPreparationCurrency | null;
  gpraValidityPosture: GpraValidityPosture | null;
  eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  lineageMatchesAuthoritativeGpra: boolean;
  declaredPostureClass: HandoffPostureClass | null;
}): GovernedHandoffPostureDeclarationAssessment {
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

  if (!input.declaredPostureClass) {
    denialReasons.push("missing_posture_class");
  } else if (!isFrozenHandoffPostureClass(input.declaredPostureClass)) {
    denialReasons.push("unknown_posture_class");
  } else if (
    input.binding &&
    input.declaredPostureClass !== input.binding.postureClassAffinity
  ) {
    denialReasons.push("posture_class_mismatch_binding_affinity");
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

  const mayDeclare = denialReasons.length === 0;
  return Object.freeze({
    mayDeclare,
    denialReasons: Object.freeze([...denialReasons]),
    authorityClassId: mayDeclare ? ("handoff_governance_authority" as const) : null,
    entryCurrency: input.entryCurrency,
    bindingCurrency: input.bindingCurrency,
    preparationCurrency: input.preparationCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    eligibilityLayerCondition: input.eligibilityLayerCondition,
    declaredPostureClass: mayDeclare ? input.declaredPostureClass : null,
    notHandoffAuthorization: true as const,
    notHandoffCompletion: true as const,
    notHandoffExecution: true as const,
    notCompletionSuspensionRecallOrWithdrawal: true as const,
    substitutesRejected: true as const,
  });
}

/**
 * R46 — current authoritative forward posture = latest additive declaration for the binding.
 * Prior declarations remain historical; this does not rewrite them.
 */
export function selectAuthoritativeHandoffPostureDeclaration(
  declarations: readonly GovernedHandoffPostureDeclarationActRecord[],
): GovernedHandoffPostureDeclarationActRecord | null {
  if (declarations.length === 0) return null;
  return [...declarations].sort((a, b) =>
    a.declaredAt.localeCompare(b.declaredAt),
  ).at(-1)!;
}

export function evaluateHandoffPostureDeclarationCurrencyFromFacts(input: {
  declaration: GovernedHandoffPostureDeclarationActRecord;
  currentEntryCurrency: HandoffEntryCurrency;
  currentBindingCurrency: HandoffConsumerBindingCurrency;
  authoritativeDeclarationId: GovernedHandoffPostureDeclarationActId | null;
}): HandoffPostureDeclarationCurrency {
  if (
    input.currentEntryCurrency !== "current" ||
    input.currentBindingCurrency !== "current"
  ) {
    return "stale";
  }
  if (
    input.authoritativeDeclarationId != null &&
    input.declaration.postureDeclarationActId !== input.authoritativeDeclarationId
  ) {
    return "stale";
  }
  return "current";
}

export interface CreateGovernedHandoffPostureDeclarationActInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly binding: GovernedHandoffConsumerBindingRecord;
  readonly authorityClassId: unknown;
  readonly declaredBy: string;
  readonly declaredAt?: string;
  readonly declaredPostureClass?: unknown;
  readonly sourceAttribution?: unknown;
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
  readonly brainDeclareHandoffPosture?: unknown;
  readonly brainHandoffPosture?: unknown;
  readonly implicitPosture?: unknown;
  readonly automaticInheritancePosture?: unknown;
  readonly inferredEligibilityPosture?: unknown;
  readonly configurationDrivenPosture?: unknown;
  readonly downstreamAcceptanceId?: unknown;
  readonly permanentCollectionMembershipId?: unknown;
  readonly unifiedCc01Cc02Posture?: unknown;
  readonly mergedCrossCcPosture?: unknown;
}

/**
 * Construct an operative HGA posture declaration act + HOEM posture_declaration record.
 * Caller must have verified current binding + entry prerequisites (R43/R47).
 */
export function createGovernedHandoffPostureDeclarationActRecord(
  input: CreateGovernedHandoffPostureDeclarationActInput,
): GovernedHandoffPostureDeclarationActRecord {
  assertNoHandoffPostureCompletionOrExecutionClaims(
    input as unknown as Record<string, unknown>,
  );
  const declaredBy = assertGovernedHandoffPostureDeclarationActor(input);
  assertEstablishedHandoffGovernanceAuthorityForPostureDeclaration(
    input.authorityClassId,
  );
  const hga = resolveEstablishedHandoffGovernanceAuthorityClass(
    input.authorityClassId as "handoff_governance_authority",
  );

  const entry = input.entry;
  const binding = input.binding;
  if (binding.entryId !== entry.entryId) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration requires HCCM binding belonging to the provided G1 entry (R43)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43", "FI-DSN-STD-015-R47"],
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
      "Handoff posture declaration rejected: binding lineage does not match entry (R43)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }

  const declaredPostureClass: HandoffPostureClass =
    input.declaredPostureClass === undefined || input.declaredPostureClass === null
      ? binding.postureClassAffinity
      : (assertFrozenHandoffPostureClass(input.declaredPostureClass),
        input.declaredPostureClass as HandoffPostureClass);

  if (declaredPostureClass !== binding.postureClassAffinity) {
    throw new OrchestraConstitutionalError(
      "Declared posture class must match the bound consumer context posture-class affinity; catalog affinity is not an operative posture declaration by itself (R43/R46)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43", "FI-DSN-STD-015-R46"],
    );
  }

  const now = input.declaredAt ?? new Date().toISOString();
  const postureDeclarationActId = createGovernedHandoffPostureDeclarationActId();
  const hoemPostureDeclarationRecord: HoemPostureDeclarationOperativeRecord = Object.freeze({
    hoemPostureDeclarationRecordId: createHoemPostureDeclarationOperativeRecordId(),
    postureDeclarationActId,
    actType: "posture_declaration" as const,
    gpraId: entry.gpraId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    bindingId: binding.bindingId,
    consumerClassId: binding.consumerClassId,
    declaredPostureClass,
    consumedHcbmBoundaryKeys: Object.freeze([
      ...binding.consumedHcbmBoundaryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    doesNotMergeAuthorizationAttribution: true as const,
    doesNotMergeCompletionAttribution: true as const,
    doesNotMergeSuspensionAttribution: true as const,
    doesNotMergeWithdrawalAttribution: true as const,
    doesNotMergeRecallAttribution: true as const,
  });

  return Object.freeze({
    postureDeclarationActId,
    authorityClassId: hga.authorityClassId,
    authorityGoverningSourceId: hga.governingSourceId,
    authorityConstitutionalScope: "handoff_posture_declaration_act" as const,
    declaredBy,
    declaredAt: now,
    entryId: entry.entryId,
    bindingId: binding.bindingId,
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
    declaredPostureClass,
    postureClassAffinity: binding.postureClassAffinity,
    consumedHcbmBoundaryKeys: Object.freeze([
      ...binding.consumedHcbmBoundaryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    consumerCategoryKeys: Object.freeze([
      ...entry.consumerCategoryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    hoemPostureDeclarationRecord,
    notHandoffAuthorization: true as const,
    notHandoffExecution: true as const,
    notHandoffCompletion: true as const,
    notHandoffSuspension: true as const,
    notHandoffRecall: true as const,
    notHandoffWithdrawal: true as const,
    notDownstreamAcceptance: true as const,
    notPermanentCollectionMembership: true as const,
    doesNotAuthorizeManufacturingOrFulfillment: true as const,
    doesNotCollapsePeerDecisionClasses: true as const,
    doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory: true as const,
    doesNotMergeAcrossConsumerClasses: true as const,
    r40HgaSolePostureOwner: true as const,
    r41PeerDistinctPostureClass: true as const,
    r42NoSubstituteInputs: true as const,
    r43BoundHccmConsumerContext: true as const,
    r44NotAuthorizationSubstitute: true as const,
    r45HoemPostureDeclarationOperativeRecord: true as const,
    r46HppmAuthoritativeCardinality: true as const,
    r47NoImplicitPostureEntryGated: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: declaredBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_POSTURE_DECLARATION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
