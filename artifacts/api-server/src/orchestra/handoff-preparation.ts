/**
 * Governed Handoff Preparation / STD-015 Consumption Boundary — FI-DSN-STD-014-R83–R95 (G11).
 *
 * Non-executing output-contract boundary for later STD-015 consumption.
 * Raw constructor — prefer Domain3Repository.prepareGovernedHandoff for persistence.
 * NOT exported from orchestra barrel (G8/G9/G10 discipline).
 *
 * Does NOT authorize/execute Handoff, declare Handoff Posture, or do manufacturing/fulfillment.
 * Does NOT invent a Handoff authority class (HAAM R86).
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernanceTraceability } from "./domain3-authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  ApprovalActId,
  Domain3BrainAdvisoryId,
  GovernedHandoffEligibilityAssessment,
  GovernedHandoffPreparationId,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  GpraId,
  GpraSupersessionActId,
  GpraValidityAssessment,
  GpraValidityPosture,
  HandoffConsumerCategoryKey,
  HandoffEligibilityLayerCondition,
  HandoffEvidencePackageRefs,
  HandoffValidityExportSnapshot,
  ProductionReadinessReviewId,
  ReviewDeterminationId,
} from "./domain3-types.js";
import type { RealizedVisualArtifactId } from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionObligationId, ProductionProgramId } from "./types.js";

const G11_REQUIREMENTS = [
  "FI-DSN-STD-014-R83",
  "FI-DSN-STD-014-R84",
  "FI-DSN-STD-014-R85",
  "FI-DSN-STD-014-R86",
  "FI-DSN-STD-014-R87",
  "FI-DSN-STD-014-R88",
  "FI-DSN-STD-014-R89",
  "FI-DSN-STD-014-R90",
  "FI-DSN-STD-014-R91",
  "FI-DSN-STD-014-R92",
  "FI-DSN-STD-014-R93",
  "FI-DSN-STD-014-R94",
  "FI-DSN-STD-014-R95",
] as const;

export const GOVERNED_HANDOFF_PREPARATION_TRACEABILITY = createDomain3GovernanceTraceability([
  ...G11_REQUIREMENTS,
]);

/** HCBM catalog (R89) — abstract consumer-category boundary keys only. */
export const HANDOFF_CONSUMER_CATEGORY_KEYS = [
  "manufacturing",
  "production",
  "catalog",
  "fulfillment",
  "publication",
  "distribution",
  "archival",
] as const satisfies readonly HandoffConsumerCategoryKey[];

/** HSLM catalog (R90) — eligibility-layer conditions; not STD-015 act states. */
export const HANDOFF_ELIGIBILITY_LAYER_CONDITIONS = [
  "not_export_ready",
  "export_ready",
  "blocked",
] as const satisfies readonly HandoffEligibilityLayerCondition[];

const HANDOFF_EXECUTION_FORBIDDEN_KEYS = [
  "handoffActId",
  "handoffAuthorized",
  "executesHandoff",
  "handoffAuthorization",
  "performHandoff",
  "handoffExecuted",
  "handoffPosture",
  "manufacturingExecutionId",
  "fulfillmentExecutionId",
  "productionExecutionId",
] as const;

const FORBIDDEN_HANDOFF_AUTHORITY_TOKENS = [
  "magac",
  "ddac",
  "dsra",
  "ivac",
  "ssac",
  "brain",
  "handoff_authority",
  "handoff_auth",
] as const;

export function createGovernedHandoffPreparationId(): GovernedHandoffPreparationId {
  return `governed-handoff-preparation-${randomUUID()}` as GovernedHandoffPreparationId;
}

export function isHandoffConsumerCategoryKey(
  value: unknown,
): value is HandoffConsumerCategoryKey {
  return (
    typeof value === "string" &&
    (HANDOFF_CONSUMER_CATEGORY_KEYS as readonly string[]).includes(value)
  );
}

export function isHandoffEligibilityLayerCondition(
  value: unknown,
): value is HandoffEligibilityLayerCondition {
  return (
    typeof value === "string" &&
    (HANDOFF_ELIGIBILITY_LAYER_CONDITIONS as readonly string[]).includes(value)
  );
}

export function assertHandoffConsumerCategoryKeys(
  keys: readonly unknown[],
): asserts keys is readonly HandoffConsumerCategoryKey[] {
  if (!Array.isArray(keys) || keys.length === 0) {
    throw new OrchestraConstitutionalError(
      "Handoff preparation requires nonempty consumerCategoryKeys (HCBM R89)",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R89"],
    );
  }
  for (const key of keys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        `Unknown Handoff consumer category key (HCBM): ${String(key)}`,
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R89"],
      );
    }
  }
}

/**
 * R93 / R95 — preparation must not carry manufacturing/production execution or Handoff auth fields.
 */
export function assertNoHandoffExecutionOrAuthorityClaims(
  input: Record<string, unknown>,
): void {
  for (const key of HANDOFF_EXECUTION_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim())) {
      throw new OrchestraConstitutionalError(
        "Governed Handoff preparation must not include Handoff execution or manufacturing/fulfillment fields (R93/R95)",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R93", "FI-DSN-STD-014-R95"],
      );
    }
  }
}

/**
 * R86 HAAM / R92 — do not invent Handoff authority; Brain cannot mint preparation.
 * Preparation is a Domain 3 constitutional record by human/governed process actor string.
 */
export function assertGovernedPreparationActor(input: {
  preparedBy: string;
  sourceAttribution?: unknown;
  authorityClassId?: unknown;
  handoffAuthorityClassId?: unknown;
}): string {
  assertNoHandoffExecutionOrAuthorityClaims(input as unknown as Record<string, unknown>);

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot create or authorize Handoff preparation (R92); preparation is a Domain 3 governed actor record",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R86", "FI-DSN-STD-014-R92"],
    );
  }
  if (typeof input.sourceAttribution === "string" && input.sourceAttribution.trim()) {
    const attr = input.sourceAttribution.trim().toLowerCase();
    if (attr.includes("brain") || FORBIDDEN_HANDOFF_AUTHORITY_TOKENS.some((t) => attr.includes(t))) {
      throw new OrchestraConstitutionalError(
        "Handoff preparation must not claim Brain or Domain 3 authority-class attribution as Handoff auth (R86/R92)",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R86", "FI-DSN-STD-014-R92"],
      );
    }
  }
  if (
    (typeof input.authorityClassId === "string" && input.authorityClassId.trim()) ||
    (typeof input.handoffAuthorityClassId === "string" && input.handoffAuthorityClassId.trim())
  ) {
    throw new OrchestraConstitutionalError(
      "Do not invent or mint a Handoff authority class on preparation (HAAM R86)",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R86"],
    );
  }

  const preparedBy = input.preparedBy?.trim() ?? "";
  if (!preparedBy) {
    throw new OrchestraConstitutionalError(
      "Handoff preparation requires attributable preparedBy actor string",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R94"],
    );
  }
  const lower = preparedBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_HANDOFF_AUTHORITY_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "preparedBy must not mint Brain or Handoff authority-class identity (R86/R92)",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R86", "FI-DSN-STD-014-R92"],
    );
  }
  return preparedBy;
}

export function buildHandoffValidityExport(input: {
  gpra: GpraGrantRecord;
  validity: GpraValidityAssessment;
  handoffConsumerContextId: string;
  successorGpraId?: GpraId | null;
}): HandoffValidityExportSnapshot {
  return Object.freeze({
    evaluationPoint: Object.freeze({
      gpraId: input.gpra.gpraId,
      posture: input.validity.posture,
      obligationId: input.gpra.obligationId,
      handoffConsumerContextId: input.handoffConsumerContextId,
    }),
    authoritativeGpraId: input.gpra.gpraId,
    successorGpraId: input.successorGpraId ?? null,
    forwardHandoffEligibility: input.validity.newHandoffEligibility,
    approvalActId: input.gpra.approvalActId,
    gpraGrantRef: input.gpra.gpraId,
    invalidationActId: input.validity.invalidationActId,
    supersessionActId: input.validity.supersessionActId,
  });
}

export function buildHandoffEvidencePackage(input: {
  gpra: GpraGrantRecord;
  posture: GpraValidityPosture;
  handoffConsumerContextId: string;
  consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  dispositionRecordIds?: readonly string[];
  supersessionActId?: GpraSupersessionActId | null;
  unresolvedBlockers?: readonly string[];
  brainAdvisoryIds?: readonly Domain3BrainAdvisoryId[];
}): HandoffEvidencePackageRefs {
  return Object.freeze({
    rvaId: input.gpra.rvaId,
    determinationId: input.gpra.determinationId,
    approvalActId: input.gpra.approvalActId,
    gpraId: input.gpra.gpraId,
    obligationId: input.gpra.obligationId,
    posture: input.posture,
    dispositionRecordIds: Object.freeze([...(input.dispositionRecordIds ?? [])]),
    supersessionActId: input.supersessionActId ?? null,
    unresolvedBlockers: Object.freeze([...(input.unresolvedBlockers ?? [])]),
    handoffConsumerContextId: input.handoffConsumerContextId,
    consumerCategoryKeys: Object.freeze([...input.consumerCategoryKeys]),
    brainAdvisoryIds: Object.freeze([...(input.brainAdvisoryIds ?? [])]),
  });
}

/**
 * Pure HEIM/HSLM assessment from loaded facts (R85/R90/R91).
 * Does not persist. Eligibility ≠ authorization.
 */
export function assessGovernedHandoffEligibility(input: {
  obligationId: ProductionObligationId;
  handoffConsumerContextId: string;
  consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  /** Authoritative Retention GPRA for obligation+context, if any. */
  authoritativeGpra: GpraGrantRecord | null;
  /** Validity of authoritative GPRA under the consumer context (when present). */
  authoritativeValidity: GpraValidityAssessment | null;
  /** True when obligation has grants that are invalidated or superseded in this context (no Retention authoritative). */
  hasBlockedPredecessorInContext: boolean;
  /** Missing required lineage on the candidate GPRA (review/determination/approval/rva). */
  missingRequiredLineage: boolean;
  dispositionRecordIds?: readonly string[];
  brainAdvisoryIds?: readonly Domain3BrainAdvisoryId[];
  successorGpraId?: GpraId | null;
  unresolvedBlockers?: readonly string[];
}): GovernedHandoffEligibilityAssessment {
  const contextId = input.handoffConsumerContextId.trim();
  const reasons: string[] = [];

  if (!contextId) {
    reasons.push("handoffConsumerContextId required");
    return freezeAssessment({
      eligibilityLayerCondition: "not_export_ready",
      gpraId: null,
      validityExport: null,
      evidencePackage: null,
      forwardHandoffEligibility: false,
      reasons,
    });
  }

  if (input.missingRequiredLineage) {
    reasons.push("missing required GPRA/Approval/Review/Determination/RVA lineage");
    return freezeAssessment({
      eligibilityLayerCondition: "not_export_ready",
      gpraId: input.authoritativeGpra?.gpraId ?? null,
      validityExport: null,
      evidencePackage: null,
      forwardHandoffEligibility: false,
      reasons,
    });
  }

  if (!input.authoritativeGpra || !input.authoritativeValidity) {
    if (input.hasBlockedPredecessorInContext) {
      reasons.push("Invalidated or Superseded GPRA — not export_ready (blocked) (R91)");
      return freezeAssessment({
        eligibilityLayerCondition: "blocked",
        gpraId: null,
        validityExport: null,
        evidencePackage: null,
        forwardHandoffEligibility: false,
        reasons,
      });
    }
    reasons.push("no authoritative Retention GPRA for obligation+consumer context");
    return freezeAssessment({
      eligibilityLayerCondition: "not_export_ready",
      gpraId: null,
      validityExport: null,
      evidencePackage: null,
      forwardHandoffEligibility: false,
      reasons,
    });
  }

  const gpra = input.authoritativeGpra;
  const validity = input.authoritativeValidity;

  if (gpra.obligationId !== input.obligationId) {
    reasons.push("GPRA obligation does not match evaluation obligation");
    return freezeAssessment({
      eligibilityLayerCondition: "not_export_ready",
      gpraId: gpra.gpraId,
      validityExport: null,
      evidencePackage: null,
      forwardHandoffEligibility: false,
      reasons,
    });
  }

  if (validity.posture === "invalidated" || validity.posture === "superseded") {
    reasons.push(`GPRA posture ${validity.posture} — blocked (R91)`);
    const validityExport = buildHandoffValidityExport({
      gpra,
      validity,
      handoffConsumerContextId: contextId,
      successorGpraId: input.successorGpraId ?? null,
    });
    const evidencePackage = buildHandoffEvidencePackage({
      gpra,
      posture: validity.posture,
      handoffConsumerContextId: contextId,
      consumerCategoryKeys: input.consumerCategoryKeys,
      dispositionRecordIds: input.dispositionRecordIds,
      supersessionActId: validity.supersessionActId,
      unresolvedBlockers: input.unresolvedBlockers ?? reasons,
      brainAdvisoryIds: input.brainAdvisoryIds,
    });
    return freezeAssessment({
      eligibilityLayerCondition: "blocked",
      gpraId: gpra.gpraId,
      validityExport,
      evidencePackage,
      forwardHandoffEligibility: false,
      reasons,
    });
  }

  if (
    validity.posture === "retention" &&
    validity.forwardActive === true &&
    validity.newHandoffEligibility === true
  ) {
    const validityExport = buildHandoffValidityExport({
      gpra,
      validity,
      handoffConsumerContextId: contextId,
      successorGpraId: input.successorGpraId ?? null,
    });
    const evidencePackage = buildHandoffEvidencePackage({
      gpra,
      posture: "retention",
      handoffConsumerContextId: contextId,
      consumerCategoryKeys: input.consumerCategoryKeys,
      dispositionRecordIds: input.dispositionRecordIds,
      supersessionActId: validity.supersessionActId,
      unresolvedBlockers: input.unresolvedBlockers ?? [],
      brainAdvisoryIds: input.brainAdvisoryIds,
    });
    return freezeAssessment({
      eligibilityLayerCondition: "export_ready",
      gpraId: gpra.gpraId,
      validityExport,
      evidencePackage,
      forwardHandoffEligibility: true,
      reasons: ["authoritative Retention GPRA with forward handoff eligibility"],
    });
  }

  reasons.push("authoritative GPRA is not Retention with forwardActive and newHandoffEligibility");
  return freezeAssessment({
    eligibilityLayerCondition: "not_export_ready",
    gpraId: gpra.gpraId,
    validityExport: buildHandoffValidityExport({
      gpra,
      validity,
      handoffConsumerContextId: contextId,
      successorGpraId: input.successorGpraId ?? null,
    }),
    evidencePackage: buildHandoffEvidencePackage({
      gpra,
      posture: validity.posture,
      handoffConsumerContextId: contextId,
      consumerCategoryKeys: input.consumerCategoryKeys,
      dispositionRecordIds: input.dispositionRecordIds,
      supersessionActId: validity.supersessionActId,
      unresolvedBlockers: reasons,
      brainAdvisoryIds: input.brainAdvisoryIds,
    }),
    forwardHandoffEligibility: false,
    reasons,
  });
}

function freezeAssessment(partial: {
  eligibilityLayerCondition: HandoffEligibilityLayerCondition;
  gpraId: GpraId | null;
  validityExport: HandoffValidityExportSnapshot | null;
  evidencePackage: HandoffEvidencePackageRefs | null;
  forwardHandoffEligibility: boolean;
  reasons: readonly string[];
}): GovernedHandoffEligibilityAssessment {
  return Object.freeze({
    eligibilityLayerCondition: partial.eligibilityLayerCondition,
    gpraId: partial.gpraId,
    validityExport: partial.validityExport,
    evidencePackage: partial.evidencePackage,
    forwardHandoffEligibility: partial.forwardHandoffEligibility,
    notHandoffAuthorization: true as const,
    notHandoffExecution: true as const,
    notHandoffPostureDeclaration: true as const,
    std015ConsumptionBoundaryOnly: true as const,
    reasons: Object.freeze([...partial.reasons]),
  });
}

export interface CreateGovernedHandoffPreparationInput {
  readonly gpra: GpraGrantRecord;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly approvalActId: ApprovalActId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly validityExport: HandoffValidityExportSnapshot;
  readonly evidencePackage: HandoffEvidencePackageRefs;
  readonly brainAdvisoryIds?: readonly Domain3BrainAdvisoryId[];
  readonly preparedBy: string;
  readonly preparedAt?: string;
  readonly sourceAttribution?: unknown;
  readonly authorityClassId?: unknown;
  readonly handoffAuthorityClassId?: unknown;
  readonly handoffActId?: unknown;
  readonly handoffAuthorized?: unknown;
  readonly executesHandoff?: unknown;
  readonly handoffAuthorization?: unknown;
  readonly performHandoff?: unknown;
  readonly handoffExecuted?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillmentExecutionId?: unknown;
}

/**
 * Construct an export_ready preparation record (R94 HPAM). Does not persist.
 * Caller must have already assessed export_ready.
 */
export function createGovernedHandoffPreparationRecord(
  input: CreateGovernedHandoffPreparationInput,
): GovernedHandoffPreparationRecord {
  assertNoHandoffExecutionOrAuthorityClaims(input as unknown as Record<string, unknown>);
  const preparedBy = assertGovernedPreparationActor(input);
  assertHandoffConsumerCategoryKeys(input.consumerCategoryKeys);

  const contextId = input.handoffConsumerContextId.trim();
  if (!contextId) {
    throw new OrchestraConstitutionalError(
      "Handoff preparation requires non-empty handoffConsumerContextId",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R89"],
    );
  }

  if (
    input.gpra.gpraId !== input.validityExport.authoritativeGpraId ||
    input.gpra.gpraId !== input.validityExport.evaluationPoint.gpraId ||
    input.gpra.obligationId !== input.obligationId ||
    input.validityExport.evaluationPoint.obligationId !== input.obligationId ||
    input.validityExport.evaluationPoint.handoffConsumerContextId !== contextId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff preparation validity export must bind authoritative GPRA + obligation + consumer context",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }

  if (
    input.gpra.approvalActId !== input.approvalActId ||
    input.gpra.reviewId !== input.reviewId ||
    input.gpra.determinationId !== input.determinationId ||
    input.gpra.rvaId !== input.rvaId ||
    input.gpra.programId !== input.programId ||
    input.gpra.obligationId !== input.obligationId
  ) {
    throw new OrchestraConstitutionalError(
      "Handoff preparation lineage must match GPRA grant subject (program/obligation/rva/review/determination/approval)",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R87"],
    );
  }

  if (input.validityExport.evaluationPoint.posture !== "retention") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires Retention evaluation-point posture (export_ready only)",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R90", "FI-DSN-STD-014-R91"],
    );
  }
  if (input.validityExport.forwardHandoffEligibility !== true) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires forwardHandoffEligibility on validity export",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R85", "FI-DSN-STD-014-R88"],
    );
  }

  const brainAdvisoryIds = Object.freeze([
    ...(input.brainAdvisoryIds ?? input.evidencePackage.brainAdvisoryIds),
  ]);
  const now = input.preparedAt ?? new Date().toISOString();

  return Object.freeze({
    preparationId: createGovernedHandoffPreparationId(),
    gpraId: input.gpra.gpraId,
    approvalActId: input.approvalActId,
    reviewId: input.reviewId,
    determinationId: input.determinationId,
    rvaId: input.rvaId,
    programId: input.programId,
    obligationId: input.obligationId,
    handoffConsumerContextId: contextId,
    consumerCategoryKeys: Object.freeze([...input.consumerCategoryKeys]),
    eligibilityLayerCondition: "export_ready" as const,
    validityExport: Object.freeze({
      ...input.validityExport,
      evaluationPoint: Object.freeze({ ...input.validityExport.evaluationPoint }),
    }),
    evidencePackage: Object.freeze({
      ...input.evidencePackage,
      dispositionRecordIds: Object.freeze([...input.evidencePackage.dispositionRecordIds]),
      unresolvedBlockers: Object.freeze([...input.evidencePackage.unresolvedBlockers]),
      consumerCategoryKeys: Object.freeze([...input.evidencePackage.consumerCategoryKeys]),
      brainAdvisoryIds: Object.freeze([...brainAdvisoryIds]),
    }),
    brainAdvisoryIds,
    forwardHandoffEligibility: true as const,
    notHandoffAuthorization: true as const,
    notHandoffExecution: true as const,
    notHandoffPostureDeclaration: true as const,
    std015ConsumptionBoundaryOnly: true as const,
    doesNotAuthorizeManufacturingOrFulfillment: true as const,
    preparedAt: now,
    preparedBy,
    audit: Object.freeze({
      createdAt: now,
      createdBy: preparedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_PREPARATION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

/**
 * R88 currency — compare historical snapshot evaluation-point to current authoritative posture.
 * Stale historical records remain loadable but must not be treated as currently usable export_ready.
 */
export function evaluateHandoffPreparationCurrencyFromFacts(input: {
  preparation: GovernedHandoffPreparationRecord;
  currentAuthoritativeGpraId: GpraId | null;
  currentValidity: GpraValidityAssessment | null;
  currentEligibilityCondition: HandoffEligibilityLayerCondition;
}): "current" | "stale" {
  const snap = input.preparation.validityExport.evaluationPoint;
  if (
    !input.currentAuthoritativeGpraId ||
    !input.currentValidity ||
    input.currentAuthoritativeGpraId !== snap.gpraId ||
    input.currentValidity.posture !== "retention" ||
    input.currentValidity.forwardActive !== true ||
    input.currentValidity.newHandoffEligibility !== true ||
    input.currentEligibilityCondition !== "export_ready"
  ) {
    return "stale";
  }
  return "current";
}
