/**
 * Governed Handoff Entry — FI-DSN-STD-015 HOF-G1 Upstream Entry (R01–R07).
 *
 * Constitutional gate: whether GPRA + G11 exports may be consumed for Handoff
 * *consideration*. Does NOT authorize Handoff, declare Posture, perform G11 prep,
 * grant GPRA/Approval, bind HOF-G3 consumer catalogs, or execute manufacturing.
 *
 * Raw constructor — prefer Domain3Repository.admitGovernedHandoffEntry for persistence.
 * NOT exported from orchestra barrel (G8/G9/G10/G11 discipline).
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  ApprovalActId,
  GovernedHandoffEntryAssessment,
  GovernedHandoffEntryId,
  GovernedHandoffEntryRecord,
  GovernedHandoffPreparationId,
  GovernedHandoffPreparationRecord,
  GpraId,
  HandoffConsumerCategoryKey,
  HandoffDeferredPrincipalSubject,
  HandoffEntryCurrency,
  HandoffHofPDistinctionId,
  HandoffPreparationCurrency,
  ProductionReadinessReviewId,
  ReviewDeterminationId,
} from "./domain3-types.js";
import type { RealizedVisualArtifactId } from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";
import type { ProductionObligationId, ProductionProgramId } from "./types.js";

const HOF_G1_REQUIREMENTS = [
  "FI-DSN-STD-015-R01",
  "FI-DSN-STD-015-R02",
  "FI-DSN-STD-015-R03",
  "FI-DSN-STD-015-R04",
  "FI-DSN-STD-015-R05",
  "FI-DSN-STD-015-R06",
  "FI-DSN-STD-015-R07",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_ENTRY_TRACEABILITY = createStd015GovernanceTraceability([
  ...HOF_G1_REQUIREMENTS,
]);

/**
 * R01 — HOF-P distinctions preserved at entry (P1–P6, P9–P10).
 * P7 (historical preservation) and P8 (upstream consume) are operationalized by
 * immutable history + G11 consumption; not listed as R05 principal-subject markers.
 */
export const HOF_P_DISTINCTIONS_PRESERVED = [
  "HOF-P1",
  "HOF-P2",
  "HOF-P3",
  "HOF-P4",
  "HOF-P5",
  "HOF-P6",
  "HOF-P9",
  "HOF-P10",
] as const satisfies readonly HandoffHofPDistinctionId[];

/**
 * R05 — principal subjects of STD-015 deferred from G1 entry.
 * Entry only records that consideration may commence.
 */
export const HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS = [
  "handoff_authorization",
  "handoff_posture_declaration",
  "handoff_act_lifecycle",
  "handoff_recall_withdrawal_suspension",
  "handoff_evidence_consumption_at_authorization_boundary",
  "auditable_transition_rules",
] as const satisfies readonly HandoffDeferredPrincipalSubject[];

/** R01–R06 constitutional boundary invariant catalog (not separate acts). */
export const HOF_G1_BOUNDARY_INVARIANTS = Object.freeze({
  r01InheritanceLock: true as const,
  r02DoesNotWeakenStd012Or013: true as const,
  r03MfgComplianceBoundaryContextOnly: true as const,
  r04DecisionStagePolicyOnly: true as const,
  r05PrincipalSubjectsDeferred: true as const,
  r06DoesNotPerformReviewApprovalGpraOrG11Prep: true as const,
  hofPDistinctionsPreserved: HOF_P_DISTINCTIONS_PRESERVED,
  deferredPrincipalSubjects: HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS,
});

const HANDOFF_ENTRY_EXECUTION_FORBIDDEN_KEYS = [
  "handoffActId",
  "handoffAuthorized",
  "executesHandoff",
  "handoffAuthorization",
  "performHandoff",
  "handoffExecuted",
  "handoffPosture",
  "handoffAuthorizationActId",
  "postureDeclarationActId",
  "hoemEvidenceId",
  "hoemOperativeEvidenceId",
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

export function createGovernedHandoffEntryId(): GovernedHandoffEntryId {
  return `governed-handoff-entry-${randomUUID()}` as GovernedHandoffEntryId;
}

export function isHandoffDeferredPrincipalSubject(
  value: unknown,
): value is HandoffDeferredPrincipalSubject {
  return (
    typeof value === "string" &&
    (HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS as readonly string[]).includes(value)
  );
}

export function isHandoffHofPDistinctionId(value: unknown): value is HandoffHofPDistinctionId {
  return (
    typeof value === "string" &&
    (HOF_P_DISTINCTIONS_PRESERVED as readonly string[]).includes(value)
  );
}

/**
 * R04 / R07 / HAAM — reject execution, posture, HOEM, and invented authority claims at entry.
 */
export function assertNoHandoffEntryExecutionOrAuthorityClaims(
  input: Record<string, unknown>,
): void {
  for (const key of HANDOFF_ENTRY_EXECUTION_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim())) {
      throw new OrchestraConstitutionalError(
        "Governed Handoff entry must not include Handoff execution, posture, HOEM, or manufacturing fields (R04/R07)",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R04", "FI-DSN-STD-015-R07"],
      );
    }
  }
}

/**
 * R06 / R01 / HAAM / HOF-P6 — Brain cannot mint entry; do not invent Handoff authority class.
 * Entry is a Domain 3 constitutional record by human/governed process actor string.
 */
export function assertGovernedEntryActor(input: {
  enteredBy: string;
  sourceAttribution?: unknown;
  authorityClassId?: unknown;
  handoffAuthorityClassId?: unknown;
}): string {
  assertNoHandoffEntryExecutionOrAuthorityClaims(input as unknown as Record<string, unknown>);

  if (
    input.sourceAttribution === "brain_runtime" ||
    input.sourceAttribution === "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain cannot create or authorize Handoff entry (HOF-P6); entry is a Domain 3 governed actor record",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R01", "FI-DSN-STD-015-R05", "FI-DSN-STD-015-R06"],
    );
  }
  if (typeof input.sourceAttribution === "string" && input.sourceAttribution.trim()) {
    const attr = input.sourceAttribution.trim().toLowerCase();
    if (attr.includes("brain") || FORBIDDEN_HANDOFF_AUTHORITY_TOKENS.some((t) => attr.includes(t))) {
      throw new OrchestraConstitutionalError(
        "Handoff entry must not claim Brain or Domain 3 authority-class attribution as Handoff auth (R01/R06)",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R01", "FI-DSN-STD-015-R06"],
      );
    }
  }
  if (
    (typeof input.authorityClassId === "string" && input.authorityClassId.trim()) ||
    (typeof input.handoffAuthorityClassId === "string" && input.handoffAuthorityClassId.trim())
  ) {
    throw new OrchestraConstitutionalError(
      "Do not invent or mint a Handoff authority class on entry (HAAM / R06); MAGAC/IVAC/SSAC/DDAC are not handoff authority",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R05", "FI-DSN-STD-015-R06"],
    );
  }

  const enteredBy = input.enteredBy?.trim() ?? "";
  if (!enteredBy) {
    throw new OrchestraConstitutionalError(
      "Handoff entry requires attributable enteredBy actor string",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  const lower = enteredBy.toLowerCase();
  if (
    lower === "brain_runtime" ||
    lower === "writing_engine" ||
    lower.startsWith("brain") ||
    FORBIDDEN_HANDOFF_AUTHORITY_TOKENS.some((t) => lower === t || lower.includes(`${t}_`))
  ) {
    throw new OrchestraConstitutionalError(
      "enteredBy must not mint Brain or Handoff authority-class identity (R01/R06)",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R01", "FI-DSN-STD-015-R06"],
    );
  }
  return enteredBy;
}

function freezeEntryBoundaryMarkers() {
  return Object.freeze({
    considerationMayCommence: true as const,
    notHandoffAuthorization: true as const,
    notHandoffExecution: true as const,
    notHandoffPostureDeclaration: true as const,
    doesNotPerformG11Preparation: true as const,
    doesNotGrantGpraOrApproval: true as const,
    doesNotAuthorizeManufacturingOrFulfillment: true as const,
    doesNotBindConsumerClassCatalog: true as const,
    hofG1Only: true as const,
    std015HofG1EntryBoundaryOnly: true as const,
    deferredPrincipalSubjects: Object.freeze([...HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS]),
    hofPDistinctionsPreserved: Object.freeze([...HOF_P_DISTINCTIONS_PRESERVED]),
    r01InheritanceLock: true as const,
    r02DoesNotWeakenStd012Or013: true as const,
    r03MfgComplianceBoundaryContextOnly: true as const,
    r04DecisionStagePolicyOnly: true as const,
    r05PrincipalSubjectsDeferred: true as const,
    r06DoesNotPerformReviewApprovalGpraOrG11Prep: true as const,
  });
}

/**
 * Pure R07 entry assessment from loaded facts. Does not persist.
 * Consideration ≠ authorization / posture / execution.
 */
export function assessGovernedHandoffEntry(input: {
  preparation: GovernedHandoffPreparationRecord | null;
  preparationCurrency: HandoffPreparationCurrency | null;
  /** Authoritative Retention GPRA for preparation obligation+consumer context, if any. */
  authoritativeGpraId: GpraId | null;
  /** True when preparation lineage ids match authoritative GPRA grant subject. */
  lineageMatchesAuthoritativeGpra: boolean;
}): GovernedHandoffEntryAssessment {
  const reasons: string[] = [];
  const markers = freezeEntryBoundaryMarkers();

  if (!input.preparation) {
    reasons.push("Governed Handoff preparation not found (R07 requires existing G11 preparation)");
    return freezeAssessment({
      mayCommence: false,
      preparationId: null,
      gpraId: null,
      reasons,
      markers,
    });
  }

  const prep = input.preparation;

  if (prep.eligibilityLayerCondition !== "export_ready") {
    reasons.push(
      `preparation eligibilityLayerCondition is ${prep.eligibilityLayerCondition}; requires export_ready (R07 / §5.1)`,
    );
  }

  if (input.preparationCurrency !== "current") {
    reasons.push(
      "preparation is not current at consumption (R07 requires current GPRA posture / §5.1 validity export)",
    );
  }

  if (!input.authoritativeGpraId) {
    reasons.push("no authoritative Retention GPRA for obligation+consumer context (R07 / G8–G9)");
  } else if (input.authoritativeGpraId !== prep.gpraId) {
    reasons.push(
      "preparation GPRA is not the authoritative Retention GPRA for obligation+consumer context",
    );
  }

  if (!input.lineageMatchesAuthoritativeGpra) {
    reasons.push(
      "preparation lineage does not match authoritative GPRA (Approval/Review/Determination/RVA/Program/Obligation)",
    );
  }

  if (
    !Array.isArray(prep.consumerCategoryKeys) ||
    prep.consumerCategoryKeys.length === 0
  ) {
    reasons.push("preparation missing consumerCategoryKeys (HCBM consume-only)");
  }

  const mayCommence =
    reasons.length === 0 &&
    prep.eligibilityLayerCondition === "export_ready" &&
    input.preparationCurrency === "current" &&
    input.authoritativeGpraId === prep.gpraId &&
    input.lineageMatchesAuthoritativeGpra;

  if (mayCommence) {
    reasons.push(
      "G11 export_ready preparation is current; consideration may commence (not authorization)",
    );
  }

  return freezeAssessment({
    mayCommence,
    preparationId: prep.preparationId,
    gpraId: prep.gpraId,
    reasons,
    markers,
  });
}

function freezeAssessment(partial: {
  mayCommence: boolean;
  preparationId: GovernedHandoffPreparationId | null;
  gpraId: GpraId | null;
  reasons: readonly string[];
  markers: ReturnType<typeof freezeEntryBoundaryMarkers>;
}): GovernedHandoffEntryAssessment {
  return Object.freeze({
    mayCommence: partial.mayCommence,
    preparationId: partial.preparationId,
    gpraId: partial.gpraId,
    reasons: Object.freeze([...partial.reasons]),
    ...partial.markers,
  });
}

export interface CreateGovernedHandoffEntryInput {
  readonly preparation: GovernedHandoffPreparationRecord;
  readonly enteredBy: string;
  readonly enteredAt?: string;
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
  readonly hoemEvidenceId?: unknown;
  readonly manufacturingExecutionId?: unknown;
  readonly fulfillmentExecutionId?: unknown;
  /** Rejected if provided — entry copies keys from preparation only (HOF-G3 deferred). */
  readonly consumerCategoryKeys?: unknown;
}

/**
 * Construct an entry record when R07 mayCommence. Does not persist.
 * Caller must have already assessed mayCommence === true.
 */
export function createGovernedHandoffEntryRecord(
  input: CreateGovernedHandoffEntryInput,
): GovernedHandoffEntryRecord {
  assertNoHandoffEntryExecutionOrAuthorityClaims(input as unknown as Record<string, unknown>);
  const enteredBy = assertGovernedEntryActor(input);

  if (input.consumerCategoryKeys !== undefined) {
    throw new OrchestraConstitutionalError(
      "Handoff entry must not invent or override consumerCategoryKeys; consume preparation keys only (HOF-G3 deferred / R07)",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R05", "FI-DSN-STD-015-R07"],
    );
  }

  const prep = input.preparation;
  if (prep.eligibilityLayerCondition !== "export_ready") {
    throw new OrchestraConstitutionalError(
      "Handoff entry requires preparation eligibilityLayerCondition export_ready",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }

  const now = input.enteredAt ?? new Date().toISOString();
  const markers = freezeEntryBoundaryMarkers();

  return Object.freeze({
    entryId: createGovernedHandoffEntryId(),
    preparationId: prep.preparationId,
    gpraId: prep.gpraId,
    approvalActId: prep.approvalActId,
    reviewId: prep.reviewId,
    determinationId: prep.determinationId,
    rvaId: prep.rvaId,
    programId: prep.programId,
    obligationId: prep.obligationId,
    handoffConsumerContextId: prep.handoffConsumerContextId,
    consumerCategoryKeys: Object.freeze([...prep.consumerCategoryKeys]) as readonly HandoffConsumerCategoryKey[],
    preparationCurrencyAtEntry: "current" as const,
    eligibilityLayerConditionConsumed: "export_ready" as const,
    ...markers,
    enteredAt: now,
    enteredBy,
    audit: Object.freeze({
      createdAt: now,
      createdBy: enteredBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GOVERNED_HANDOFF_ENTRY_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

/**
 * Optional currency of a historical entry vs current preparation currency.
 * Historical entries remain loadable after later invalidation (immutable history).
 */
export function evaluateHandoffEntryCurrencyFromFacts(input: {
  entry: GovernedHandoffEntryRecord;
  currentPreparationCurrency: HandoffPreparationCurrency;
}): HandoffEntryCurrency {
  if (input.currentPreparationCurrency === "current") {
    return "current";
  }
  return "stale";
}

/** Type-only helpers for rehydration / validation lineage checks. */
export type HandoffEntryLineageSnapshot = {
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
};

export function handoffEntryLineageMatchesGpra(
  entryOrPrep: HandoffEntryLineageSnapshot,
  gpra: HandoffEntryLineageSnapshot,
): boolean {
  return (
    entryOrPrep.gpraId === gpra.gpraId &&
    entryOrPrep.approvalActId === gpra.approvalActId &&
    entryOrPrep.reviewId === gpra.reviewId &&
    entryOrPrep.determinationId === gpra.determinationId &&
    entryOrPrep.rvaId === gpra.rvaId &&
    entryOrPrep.programId === gpra.programId &&
    entryOrPrep.obligationId === gpra.obligationId
  );
}
