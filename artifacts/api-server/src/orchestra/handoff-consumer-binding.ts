/**
 * Governed Handoff Consumer Class Binding — FI-DSN-STD-015 HOF-G3 (R33–R39).
 *
 * Operative HCCM binding only. Distinct from HGA authorization (R38).
 * Prerequisite-gated by G11 eligibility export + Handoff entry conditions (R39 / R07).
 * Does NOT declare posture, complete, accept downstream, or execute (R40+ deferred).
 *
 * Raw constructor — prefer Domain3Repository.bindHccmConsumerClass.
 * NOT exported from orchestra barrel.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  GovernedHandoffConsumerBindingAssessment,
  GovernedHandoffConsumerBindingId,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPreparationRecord,
  GpraValidityPosture,
  HandoffConsumerCategoryKey,
  HandoffEligibilityLayerCondition,
  HandoffEntryCurrency,
  HandoffPreparationCurrency,
  HccmConsumerClassId,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertHccmConsumerClassId,
  resolveConsumedHcbmBoundaryKeysForBinding,
  resolveHccmConsumerClass,
} from "./hccm-consumer-classes.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G3_REQUIREMENTS = [
  "FI-DSN-STD-015-R33",
  "FI-DSN-STD-015-R34",
  "FI-DSN-STD-015-R35",
  "FI-DSN-STD-015-R36",
  "FI-DSN-STD-015-R37",
  "FI-DSN-STD-015-R38",
  "FI-DSN-STD-015-R39",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_CONSUMER_BINDING_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G3_REQUIREMENTS]);

const BINDING_FORBIDDEN_KEYS = [
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
  "brainBindsConsumerClass",
  "implicitAuthorization",
  "implicitBinding",
  "automaticInheritanceBinding",
  "configurationDrivenBinding",
  "downstreamAcceptanceId",
  "permanentCollectionMembershipId",
  "handoffAuthorizationActId",
  "authorizationActId",
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

export function createGovernedHandoffConsumerBindingId(): GovernedHandoffConsumerBindingId {
  return `governed-handoff-consumer-binding-${randomUUID()}` as GovernedHandoffConsumerBindingId;
}

export function assertNoHandoffConsumerBindingPostureOrExecutionClaims(
  input: Record<string, unknown>,
): void {
  for (const key of BINDING_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "HCCM consumer binding must not authorize Handoff, declare posture, accept downstream, or execute (R38; R40+ deferred)",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R38", "FI-DSN-STD-015-R39"],
      );
    }
  }
}

/**
 * Binding performer attribution — not a Handoff authorization authority class.
 * Brain / HAAM-prohibited class tokens cannot mint binding records.
 */
export function assertGovernedHandoffConsumerBindingActor(input: {
  boundBy: string;
  authorityClassId?: unknown;
  sourceAttribution?: unknown;
}): string {
  assertNoHandoffConsumerBindingPostureOrExecutionClaims(
    input as unknown as Record<string, unknown>,
  );

  if (input.authorityClassId != null) {
    const cls = String(input.authorityClassId).trim().toLowerCase();
    if (
      cls === "handoff_governance_authority" ||
      cls === "hga" ||
      cls.includes("approval_authority") ||
      cls.includes("invalidation_authority") ||
      cls.includes("supersession_authority") ||
      cls.includes("downstream_disposition") ||
      cls.includes("magac") ||
      cls.includes("ddac") ||
      cls.includes("dsra") ||
      cls.includes("ivac") ||
      cls.includes("ssac") ||
      cls === "brain" ||
      cls.includes("brain_")
    ) {
      throw new OrchestraConstitutionalError(
        "HCCM consumer binding is not minted by HGA, MAGAC, DDAC, DSRA, IVAC, SSAC, or Brain authority classes (R38/R39)",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R38", "FI-DSN-STD-015-R39"],
      );
    }
  }

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot perform HCCM consumer class binding (R39)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R39", "FI-DSN-STD-015-R22"],
    );
  }

  const boundBy = input.boundBy?.trim() ?? "";
  if (!boundBy) {
    throw new OrchestraConstitutionalError(
      "HCCM consumer binding requires attributable boundBy actor (R39)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R39"],
    );
  }
  const lower = boundBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_ACTOR_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "boundBy must not mint Brain or HAAM-prohibited authority-class identity as HCCM binder (R39)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R39"],
    );
  }
  return boundBy;
}

/**
 * R39 — eligibility/entry gated. Does NOT require HGA authorization (R38).
 */
export function assessGovernedHandoffConsumerBinding(input: {
  entry: GovernedHandoffEntryRecord | null;
  entryCurrency: HandoffEntryCurrency | null;
  preparation: GovernedHandoffPreparationRecord | null;
  preparationCurrency: HandoffPreparationCurrency | null;
  gpraValidityPosture: GpraValidityPosture | null;
  eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  consumerClassId: HccmConsumerClassId | null;
  lineageMatchesAuthoritativeGpra: boolean;
}): GovernedHandoffConsumerBindingAssessment {
  const denialReasons: string[] = [];

  if (!input.entry) {
    denialReasons.push("missing_governed_handoff_entry");
  } else if (input.entryCurrency !== "current") {
    denialReasons.push("stale_governed_handoff_entry");
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
      resolveConsumedHcbmBoundaryKeysForBinding({
        consumerClassId: input.consumerClassId,
        entryConsumerCategoryKeys: input.entry.consumerCategoryKeys,
      });
    } catch {
      denialReasons.push("hccm_bound_context_keys_unavailable");
    }
  }

  const mayBind = denialReasons.length === 0;
  return Object.freeze({
    mayBind,
    denialReasons: Object.freeze([...denialReasons]),
    entryCurrency: input.entryCurrency,
    preparationCurrency: input.preparationCurrency,
    gpraValidityPosture: input.gpraValidityPosture,
    eligibilityLayerCondition: input.eligibilityLayerCondition,
    notHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffExecution: true as const,
    notDownstreamAcceptance: true as const,
    notPermanentCollectionMembership: true as const,
    catalogClosedCc01ThroughCc06: true as const,
  });
}

export interface CreateGovernedHandoffConsumerBindingInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly consumerClassId: HccmConsumerClassId;
  readonly boundBy: string;
  readonly boundAt?: string;
  readonly authorityClassId?: unknown;
  readonly sourceAttribution?: unknown;
  readonly handoffPosture?: unknown;
  readonly postureDeclarationActId?: unknown;
  readonly completionActId?: unknown;
  readonly executesHandoff?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillmentExecutionId?: unknown;
  readonly authorizationActId?: unknown;
  readonly handoffAuthorizationActId?: unknown;
  readonly downstreamAcceptanceId?: unknown;
  readonly permanentCollectionMembershipId?: unknown;
  readonly brainBindsConsumerClass?: unknown;
  readonly implicitBinding?: unknown;
}

/**
 * Construct an operative HCCM consumer binding record.
 * Caller must have verified current entry/eligibility prerequisites (R39).
 * One binding = one CC (R36); multi-CC requires separate additive bindings.
 */
export function createGovernedHandoffConsumerBindingRecord(
  input: CreateGovernedHandoffConsumerBindingInput,
): GovernedHandoffConsumerBindingRecord {
  assertNoHandoffConsumerBindingPostureOrExecutionClaims(
    input as unknown as Record<string, unknown>,
  );
  const boundBy = assertGovernedHandoffConsumerBindingActor(input);
  assertHccmConsumerClassId(input.consumerClassId, {
    errorCode: "invalid_handoff_consumer_binding",
  });
  const catalog = resolveHccmConsumerClass(input.consumerClassId);
  const entry = input.entry;
  const consumedHcbmBoundaryKeys = resolveConsumedHcbmBoundaryKeysForBinding({
    consumerClassId: input.consumerClassId,
    entryConsumerCategoryKeys: entry.consumerCategoryKeys,
  });

  const now = input.boundAt ?? new Date().toISOString();
  return Object.freeze({
    bindingId: createGovernedHandoffConsumerBindingId(),
    entryId: entry.entryId,
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
    constitutionalConsumerClass: catalog.constitutionalConsumerClass,
    consumedHcbmBoundaryKeys,
    postureClassAffinity: catalog.postureClassAffinity,
    downstreamConsiderationDomain: catalog.downstreamConsiderationDomain,
    entryConsumerCategoryKeys: Object.freeze([
      ...entry.consumerCategoryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    boundBy,
    boundAt: now,
    notHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffCompletion: true as const,
    notDownstreamAcceptance: true as const,
    notPermanentCollectionMembership: true as const,
    notOperationalIntake: true as const,
    doesNotAuthorizeManufacturingOrFulfillment: true as const,
    doesNotInferCc01VsCc02FromHcbmAlone: true as const,
    r33ClosedHccmCatalog: true as const,
    r34HcbmMappedToSelectedCc: true as const,
    r35BoundConsumerContextTuple: true as const,
    r36SingleCcPerBinding: true as const,
    r37Cc01Cc02CatalogDisambiguation: true as const,
    r38NotAuthorizationOrPostureOrIntake: true as const,
    r39EligibilityGatedClosedCatalog: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy: boundBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_CONSUMER_BINDING_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
