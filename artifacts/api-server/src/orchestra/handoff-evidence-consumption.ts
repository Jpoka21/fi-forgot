/**
 * Governed Handoff Evidence and Validity Consumption — FI-DSN-STD-015 HOF-G7 (R08–R15).
 *
 * Consumes G1 entry + linked G11 HEPM/HVEM for Handoff *consideration* only.
 * Does NOT authorize Handoff, declare Posture, create HOEM act instances (R16+ / G10),
 * or execute manufacturing/fulfillment.
 *
 * Raw constructor — prefer Domain3Repository.recordGovernedHandoffEvidenceConsumption.
 * NOT exported from orchestra barrel (G8/G9/G10/G11/G1 discipline).
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  DeferredHoemOperativeRecordClass,
  Domain3BrainAdvisoryId,
  GovernedHandoffEntryRecord,
  GovernedHandoffEvidenceConsumptionAssessment,
  GovernedHandoffEvidenceConsumptionId,
  GovernedHandoffEvidenceConsumptionRecord,
  GovernedHandoffPreparationRecord,
  GpraId,
  HandoffConsumerCategoryKey,
  HandoffEntryCurrency,
  HandoffEvidenceConsumptionCurrency,
  HandoffEvidenceModelId,
  HandoffEvidencePackageRefs,
  HandoffPreparationCurrency,
  HandoffValidityExportSnapshot,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G7_REQUIREMENTS = [
  "FI-DSN-STD-015-R08",
  "FI-DSN-STD-015-R09",
  "FI-DSN-STD-015-R10",
  "FI-DSN-STD-015-R11",
  "FI-DSN-STD-015-R12",
  "FI-DSN-STD-015-R13",
  "FI-DSN-STD-015-R14",
  "FI-DSN-STD-015-R15",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_EVIDENCE_CONSUMPTION_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G7_REQUIREMENTS]);

/** R08 — four peer-distinct evidence models (catalog only). */
export const HANDOFF_EVIDENCE_MODELS = [
  "hepm",
  "hvem",
  "hoem",
  "advisory",
] as const satisfies readonly HandoffEvidenceModelId[];

/**
 * R11 — deferred HOEM operative record class catalog (framework only).
 * Matches HGA matrix: authorization, posture_declaration, completion, suspension, recall, withdrawal.
 */
export const DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES = [
  "authorization",
  "posture_declaration",
  "completion",
  "suspension",
  "recall",
  "withdrawal",
] as const satisfies readonly DeferredHoemOperativeRecordClass[];

const HANDOFF_CONSUMPTION_EXECUTION_FORBIDDEN_KEYS = [
  "handoffActId",
  "handoffAuthorized",
  "executesHandoff",
  "handoffAuthorization",
  "performHandoff",
  "handoffExecuted",
  "handoffPosture",
  "handoffAuthorizationActId",
  "postureDeclarationActId",
  "completionActId",
  "suspensionActId",
  "recallActId",
  "withdrawalActId",
  "hoemEvidenceId",
  "hoemOperativeEvidenceId",
  "hoemAuthorizationRecordId",
  "hoemPostureDeclarationRecordId",
  "hoemCompletionRecordId",
  "hoemSuspensionRecordId",
  "hoemRecallRecordId",
  "hoemWithdrawalRecordId",
  "preservationActId",
  "hofG10PreservationActId",
  "manufacturingExecutionId",
  "fulfillmentExecutionId",
  "productionExecutionId",
  "executionQueueId",
  "constitutionalQueueId",
  "consumptionQueueId",
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

export function createGovernedHandoffEvidenceConsumptionId(): GovernedHandoffEvidenceConsumptionId {
  return `governed-handoff-evidence-consumption-${randomUUID()}` as GovernedHandoffEvidenceConsumptionId;
}

export function isHandoffEvidenceModelId(value: unknown): value is HandoffEvidenceModelId {
  return (
    typeof value === "string" &&
    (HANDOFF_EVIDENCE_MODELS as readonly string[]).includes(value)
  );
}

export function isDeferredHoemOperativeRecordClass(
  value: unknown,
): value is DeferredHoemOperativeRecordClass {
  return (
    typeof value === "string" &&
    (DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES as readonly string[]).includes(value)
  );
}

/**
 * R15 / R11 / R16 boundary — reject execution, queue, HOEM act instances, and G10 preservation claims.
 */
export function assertNoHandoffEvidenceConsumptionExecutionOrActClaims(
  input: Record<string, unknown>,
): void {
  for (const key of HANDOFF_CONSUMPTION_EXECUTION_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Governed Handoff evidence consumption must not include Handoff execution, queue, HOEM act, or G10 preservation fields (R11/R15; R16+ deferred)",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R11", "FI-DSN-STD-015-R15"],
      );
    }
  }

  if (input.unknownEvidenceModel !== undefined && input.unknownEvidenceModel !== null) {
    throw new OrchestraConstitutionalError(
      "Unknown evidence model rejected; only hepm/hvem/hoem/advisory catalog (R08)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R08"],
    );
  }

  if (input.evidenceModels !== undefined) {
    if (!Array.isArray(input.evidenceModels)) {
      throw new OrchestraConstitutionalError(
        "evidenceModels override must be the frozen R08 catalog if provided",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R08"],
      );
    }
    for (const model of input.evidenceModels) {
      if (!isHandoffEvidenceModelId(model)) {
        throw new OrchestraConstitutionalError(
          `Unknown evidence model rejected: ${String(model)} (R08)`,
          "invalid_handoff_evidence_consumption",
          ["FI-DSN-STD-015-R08"],
        );
      }
    }
  }

  // Reject HOEM act *instances* if caller attempts to pass operative records.
  const hoemActs = input.hoemOperativeActRecords ?? input.hoemActInstances;
  if (hoemActs !== undefined && hoemActs !== null) {
    throw new OrchestraConstitutionalError(
      "HOEM operative act instances are not created in G7; framework catalog only (R11); R16+ deferred",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R11", "FI-DSN-STD-015-R15"],
    );
  }
}

/**
 * R12 / HAAM — Brain cannot mint consumption; do not invent Handoff authority class.
 */
export function assertGovernedEvidenceConsumptionActor(input: {
  consumedBy: string;
  sourceAttribution?: unknown;
  authorityClassId?: unknown;
  handoffAuthorityClassId?: unknown;
}): string {
  assertNoHandoffEvidenceConsumptionExecutionOrActClaims(
    input as unknown as Record<string, unknown>,
  );

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot create or authorize Handoff evidence consumption (R12); consumption is a Domain 3 governed actor record",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R12"],
    );
  }
  if (typeof input.sourceAttribution === "string" && input.sourceAttribution.trim()) {
    const attr = input.sourceAttribution.trim().toLowerCase();
    if (attr.includes("brain") || FORBIDDEN_HANDOFF_AUTHORITY_TOKENS.some((t) => attr.includes(t))) {
      throw new OrchestraConstitutionalError(
        "Handoff evidence consumption must not claim Brain or Domain 3 authority-class attribution (R12)",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R12"],
      );
    }
  }
  if (
    (typeof input.authorityClassId === "string" && input.authorityClassId.trim()) ||
    (typeof input.handoffAuthorityClassId === "string" && input.handoffAuthorityClassId.trim())
  ) {
    throw new OrchestraConstitutionalError(
      "Do not invent or mint a Handoff authority class on evidence consumption (R12/R15)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R12", "FI-DSN-STD-015-R15"],
    );
  }

  const consumedBy = input.consumedBy?.trim() ?? "";
  if (!consumedBy) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption requires attributable consumedBy actor string",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R15"],
    );
  }
  const lower = consumedBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_HANDOFF_AUTHORITY_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "consumedBy must not mint Brain or Handoff authority-class identity (R12)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R12"],
    );
  }
  return consumedBy;
}

function freezeConsumptionBoundaryMarkers() {
  return Object.freeze({
    factualInputsToConsiderationOnly: true as const,
    notHandoffAuthorization: true as const,
    notHandoffExecution: true as const,
    notHandoffPostureDeclaration: true as const,
    notEvidenceOfHandoffAuthorization: true as const,
    notEvidenceOfHandoffPostureDeclaration: true as const,
    doesNotElevateAdvisoryToConstitutionalFact: true as const,
    doesNotAuthorizeManufacturingOrFulfillment: true as const,
    hoemFrameworkOnly: true as const,
    doesNotCreateOperativeHandoffActRecords: true as const,
    fourModelsPeerDistinct: true as const,
    r08FourPeerDistinctEvidenceModels: true as const,
    r09HepmReadOnlyConsumption: true as const,
    r10HvemEvaluationPointConsumption: true as const,
    r11HoemFrameworkOnly: true as const,
    r12AdvisoryNonbinding: true as const,
    r13EligibilityNotAuthorization: true as const,
    r14UpstreamFreshnessRequired: true as const,
    r15NoInventedConstitutionalQueueOrSchema: true as const,
    evidenceModelsPreserved: Object.freeze([...HANDOFF_EVIDENCE_MODELS]),
    deferredHoemOperativeRecordClasses: Object.freeze([
      ...DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES,
    ]),
  });
}

function freezeHepmRefs(refs: HandoffEvidencePackageRefs): HandoffEvidencePackageRefs {
  return Object.freeze({
    rvaId: refs.rvaId,
    determinationId: refs.determinationId,
    approvalActId: refs.approvalActId,
    gpraId: refs.gpraId,
    obligationId: refs.obligationId,
    posture: refs.posture,
    dispositionRecordIds: Object.freeze([...refs.dispositionRecordIds]),
    supersessionActId: refs.supersessionActId,
    unresolvedBlockers: Object.freeze([...refs.unresolvedBlockers]),
    handoffConsumerContextId: refs.handoffConsumerContextId,
    consumerCategoryKeys: Object.freeze([
      ...refs.consumerCategoryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    brainAdvisoryIds: Object.freeze([...refs.brainAdvisoryIds]),
  });
}

function freezeHvemSnapshot(
  snapshot: HandoffValidityExportSnapshot,
): HandoffValidityExportSnapshot {
  return Object.freeze({
    evaluationPoint: Object.freeze({ ...snapshot.evaluationPoint }),
    authoritativeGpraId: snapshot.authoritativeGpraId,
    successorGpraId: snapshot.successorGpraId,
    forwardHandoffEligibility: snapshot.forwardHandoffEligibility,
    approvalActId: snapshot.approvalActId,
    gpraGrantRef: snapshot.gpraGrantRef,
    invalidationActId: snapshot.invalidationActId,
    supersessionActId: snapshot.supersessionActId,
  });
}

/**
 * Pure R08–R15 consumption assessment from loaded facts. Does not persist.
 * Eligibility / HEPM / advisory are factual inputs to consideration only (R13).
 */
export function assessGovernedHandoffEvidenceConsumption(input: {
  entry: GovernedHandoffEntryRecord | null;
  entryCurrency: HandoffEntryCurrency | null;
  preparation: GovernedHandoffPreparationRecord | null;
  preparationCurrency: HandoffPreparationCurrency | null;
  /** Authoritative Retention GPRA for entry obligation+consumer context, if any. */
  authoritativeGpraId: GpraId | null;
  /** True when entry lineage ids match authoritative GPRA grant subject. */
  lineageMatchesAuthoritativeGpra: boolean;
}): GovernedHandoffEvidenceConsumptionAssessment {
  const reasons: string[] = [];
  const markers = freezeConsumptionBoundaryMarkers();

  if (!input.entry) {
    reasons.push("Governed Handoff entry not found (R14 requires existing G1 entry)");
    return freezeAssessment({
      mayConsume: false,
      entryId: null,
      preparationId: null,
      gpraId: null,
      reasons,
      upstreamFreshnessAtConsumption: null,
      hepmReferencesAvailable: false,
      hvemFactsCurrent: false,
      markers,
    });
  }

  const entry = input.entry;

  if (!input.preparation) {
    reasons.push("Linked G11 preparation not found for entry (R09/R10/R14)");
  }

  if (input.entryCurrency !== "current") {
    reasons.push(
      "G1 entry is not current at consumption (R14 requires evaluateHandoffEntryCurrency === current)",
    );
  }

  if (input.preparationCurrency !== "current") {
    reasons.push(
      "Linked G11 preparation is not current at consumption (R14)",
    );
  }

  if (!input.authoritativeGpraId) {
    reasons.push("no authoritative Retention GPRA for obligation+consumer context (R14)");
  } else if (input.authoritativeGpraId !== entry.gpraId) {
    reasons.push(
      "entry GPRA is not the authoritative Retention GPRA for obligation+consumer context (R14)",
    );
  }

  if (input.preparation && input.authoritativeGpraId && input.authoritativeGpraId !== input.preparation.gpraId) {
    reasons.push(
      "preparation GPRA is not the authoritative Retention GPRA for obligation+consumer context (R14)",
    );
  }

  if (!input.lineageMatchesAuthoritativeGpra) {
    reasons.push(
      "entry lineage does not match authoritative GPRA (Approval/Review/Determination/RVA/Program/Obligation)",
    );
  }

  const prep = input.preparation;
  const hepmAvailable = !!prep?.evidencePackage;
  const hvemCurrent =
    !!prep &&
    input.preparationCurrency === "current" &&
    prep.validityExport.evaluationPoint.gpraId === entry.gpraId;

  if (prep && !hepmAvailable) {
    reasons.push("HEPM evidence package refs unavailable on preparation (R09)");
  }
  if (prep && !hvemCurrent) {
    reasons.push("HVEM validity export facts not current for entry evaluation-point (R10/R14)");
  }

  if (
    prep &&
    (prep.preparationId !== entry.preparationId ||
      prep.gpraId !== entry.gpraId ||
      prep.handoffConsumerContextId !== entry.handoffConsumerContextId)
  ) {
    reasons.push("entry/preparation linkage mismatch (R09/R14)");
  }

  const freshnessOk =
    input.entryCurrency === "current" &&
    input.preparationCurrency === "current" &&
    input.authoritativeGpraId === entry.gpraId &&
    (!prep || input.authoritativeGpraId === prep.gpraId) &&
    input.lineageMatchesAuthoritativeGpra;

  const mayConsume =
    reasons.length === 0 &&
    !!prep &&
    freshnessOk &&
    hepmAvailable &&
    hvemCurrent;

  if (mayConsume) {
    reasons.push(
      "G1 entry and G11 prep are current; HEPM/HVEM consumed as factual inputs to consideration only (not authorization)",
    );
  }

  return freezeAssessment({
    mayConsume,
    entryId: entry.entryId,
    preparationId: prep?.preparationId ?? entry.preparationId,
    gpraId: entry.gpraId,
    reasons,
    upstreamFreshnessAtConsumption: mayConsume ? "current" : null,
    hepmReferencesAvailable: hepmAvailable,
    hvemFactsCurrent: hvemCurrent,
    markers,
  });
}

function freezeAssessment(partial: {
  mayConsume: boolean;
  entryId: GovernedHandoffEvidenceConsumptionAssessment["entryId"];
  preparationId: GovernedHandoffEvidenceConsumptionAssessment["preparationId"];
  gpraId: GpraId | null;
  reasons: readonly string[];
  upstreamFreshnessAtConsumption: "current" | null;
  hepmReferencesAvailable: boolean;
  hvemFactsCurrent: boolean;
  markers: ReturnType<typeof freezeConsumptionBoundaryMarkers>;
}): GovernedHandoffEvidenceConsumptionAssessment {
  return Object.freeze({
    mayConsume: partial.mayConsume,
    entryId: partial.entryId,
    preparationId: partial.preparationId,
    gpraId: partial.gpraId,
    reasons: Object.freeze([...partial.reasons]),
    upstreamFreshnessAtConsumption: partial.upstreamFreshnessAtConsumption,
    hepmReferencesAvailable: partial.hepmReferencesAvailable,
    hvemFactsCurrent: partial.hvemFactsCurrent,
    ...partial.markers,
  });
}

export interface CreateGovernedHandoffEvidenceConsumptionInput {
  readonly entry: GovernedHandoffEntryRecord;
  readonly preparation: GovernedHandoffPreparationRecord;
  readonly consumedBy: string;
  readonly consumedAt?: string;
  readonly brainAdvisoryIds?: readonly Domain3BrainAdvisoryId[];
  readonly sourceAttribution?: unknown;
  readonly authorityClassId?: unknown;
  readonly handoffAuthorityClassId?: unknown;
  readonly handoffActId?: unknown;
  readonly handoffAuthorized?: unknown;
  readonly executesHandoff?: unknown;
  readonly handoffAuthorization?: unknown;
  readonly performHandoff?: unknown;
  readonly handoffExecuted?: unknown;
  readonly handoffPosture?: unknown;
  readonly handoffAuthorizationActId?: unknown;
  readonly postureDeclarationActId?: unknown;
  readonly completionActId?: unknown;
  readonly suspensionActId?: unknown;
  readonly recallActId?: unknown;
  readonly withdrawalActId?: unknown;
  readonly hoemEvidenceId?: unknown;
  readonly hoemOperativeEvidenceId?: unknown;
  readonly hoemOperativeActRecords?: unknown;
  readonly hoemActInstances?: unknown;
  readonly preservationActId?: unknown;
  readonly hofG10PreservationActId?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillmentExecutionId?: unknown;
  readonly executionQueueId?: unknown;
  readonly constitutionalQueueId?: unknown;
  readonly unknownEvidenceModel?: unknown;
  readonly evidenceModels?: unknown;
  /** Rejected if provided — consumption copies keys from entry/prep only. */
  readonly consumerCategoryKeys?: unknown;
}

/**
 * Construct a consumption record when mayConsume. Does not persist.
 * Caller must have already assessed mayConsume === true.
 */
export function createGovernedHandoffEvidenceConsumptionRecord(
  input: CreateGovernedHandoffEvidenceConsumptionInput,
): GovernedHandoffEvidenceConsumptionRecord {
  assertNoHandoffEvidenceConsumptionExecutionOrActClaims(
    input as unknown as Record<string, unknown>,
  );
  const consumedBy = assertGovernedEvidenceConsumptionActor(input);

  if (input.consumerCategoryKeys !== undefined) {
    throw new OrchestraConstitutionalError(
      "Handoff evidence consumption must not invent or override consumerCategoryKeys; consume entry/prep keys only (R13)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R13", "FI-DSN-STD-015-R15"],
    );
  }

  const entry = input.entry;
  const prep = input.preparation;

  if (entry.preparationId !== prep.preparationId) {
    throw new OrchestraConstitutionalError(
      "Evidence consumption requires entry linked to provided G11 preparation",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R09", "FI-DSN-STD-015-R14"],
    );
  }

  if (prep.eligibilityLayerCondition !== "export_ready") {
    throw new OrchestraConstitutionalError(
      "Evidence consumption requires preparation eligibilityLayerCondition export_ready (R13 factual input)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R13"],
    );
  }

  const now = input.consumedAt ?? new Date().toISOString();
  const markers = freezeConsumptionBoundaryMarkers();
  const hepmRefs = freezeHepmRefs(prep.evidencePackage);
  const hvemSnapshot = freezeHvemSnapshot(prep.validityExport);
  const brainAdvisoryIds = Object.freeze([
    ...(input.brainAdvisoryIds ?? []),
  ]) as readonly Domain3BrainAdvisoryId[];

  return Object.freeze({
    consumptionId: createGovernedHandoffEvidenceConsumptionId(),
    entryId: entry.entryId,
    preparationId: prep.preparationId,
    gpraId: entry.gpraId,
    approvalActId: entry.approvalActId,
    reviewId: entry.reviewId,
    determinationId: entry.determinationId,
    rvaId: entry.rvaId,
    programId: entry.programId,
    obligationId: entry.obligationId,
    handoffConsumerContextId: entry.handoffConsumerContextId,
    consumerCategoryKeys: Object.freeze([
      ...entry.consumerCategoryKeys,
    ]) as readonly HandoffConsumerCategoryKey[],
    hepmRefs,
    hvemSnapshot,
    hvemEvaluationPoint: Object.freeze({ ...hvemSnapshot.evaluationPoint }),
    brainAdvisoryIds,
    upstreamFreshnessAtConsumption: "current" as const,
    hepmReferencesAvailable: true as const,
    hvemFactsCurrent: true as const,
    ...markers,
    consumedAt: now,
    consumedBy,
    audit: Object.freeze({
      createdAt: now,
      createdBy: consumedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_EVIDENCE_CONSUMPTION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

/**
 * Optional currency of a historical consumption vs current entry/prep currency.
 * Historical consumptions remain loadable after later invalidation (immutable history).
 */
export function evaluateHandoffEvidenceConsumptionCurrencyFromFacts(input: {
  consumption: GovernedHandoffEvidenceConsumptionRecord;
  currentEntryCurrency: HandoffEntryCurrency;
  currentPreparationCurrency: HandoffPreparationCurrency;
}): HandoffEvidenceConsumptionCurrency {
  if (
    input.currentEntryCurrency === "current" &&
    input.currentPreparationCurrency === "current"
  ) {
    return "current";
  }
  return "stale";
}
