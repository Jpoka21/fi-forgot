/**
 * Domain 3 persistence validation — FI-DSN-STD-014 G2–G11.
 */

import {
  isCanonicalEstablishedApprovalAuthorityClassId,
  resolveEstablishedApprovalAuthorityClass,
} from "../approval-authority.js";
import { isMandatoryApprovalWithholdingGroundFamily } from "../approval-withholding-grounds.js";
import {
  DOMAIN3_REEVALUATION_REQUEST_ALLOWED_STAGES,
  DOMAIN3_REEVALUATION_REQUEST_ROUTE,
  isDomain3BrainAuthorityRouteKind,
  isDomain3BrainReevaluationRequestType,
} from "../brain-domain3-advisory.js";
import {
  assertOutputClassAllowedForStage,
  isDomain3BrainOutputClass,
  isDomain3DecisionStage,
} from "../brain-domain3-decision-stage.js";
import { isMandatoryGovernedDeficiencyFamily } from "../deficiency-families.js";
import { DOMAIN3_GOVERNING_STANDARD } from "../domain3-authority.js";
import { isValidDomain3GovernedCreationMarker } from "../domain3-entry.js";
import { isCanonicalEstablishedDownstreamDispositionAuthorityClassId } from "../downstream-disposition-authority.js";
import type {
  ApprovalActRecord,
  ApprovalWithholdingRecord,
  DesignTimeFeasibilityEvaluationRecord,
  Domain3BrainAdvisoryRecord,
  DownstreamDeficiencyRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffPreparationRecord,
  GpraGrantRecord,
  GpraInvalidationActRecord,
  GpraSupersessionActRecord,
  ProductionReadinessReview,
  ResubmissionEligibilityRecord,
  ReturnPostureRecord,
  ReviewDeterminationRecord,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
  ReworkAuthorizationRecord,
  ReworkAuthorizationWithholdingRecord,
} from "../domain3-types.js";
import type { RealizationPath, RealizedVisualArtifactId } from "../domain2-types.js";
import { OrchestraConstitutionalError } from "../errors.js";
import {
  HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS,
  HOF_P_DISTINCTIONS_PRESERVED,
  isHandoffDeferredPrincipalSubject,
  isHandoffHofPDistinctionId,
} from "../handoff-entry.js";
import {
  isHandoffConsumerCategoryKey,
} from "../handoff-preparation.js";
import {
  isCanonicalEstablishedInvalidationAuthorityClassId,
  resolveEstablishedInvalidationAuthorityClass,
} from "../invalidation-authority.js";
import { isMandatoryInvalidationTriggerFamily } from "../invalidation-trigger-families.js";
import { isCanonicalFrozenBindingFiMfgStandardId } from "../manufacturing-authority.js";
import { isLegalReviewDeterminationOutcome } from "../review-determination.js";
import { isMandatoryReviewDimensionId } from "../review-dimensions.js";
import { validateLineageCoherence } from "../rva-lifecycle.js";
import { STD015_GOVERNING_STANDARD } from "../std015-authority.js";
import {
  isCanonicalEstablishedSupersessionAuthorityClassId,
  resolveEstablishedSupersessionAuthorityClass,
} from "../supersession-authority.js";
import { isMandatorySupersessionTriggerFamily } from "../supersession-trigger-families.js";

const ID_PREFIXES = {
  review: "production-readiness-review-",
  rva: "rva-",
  program: "program-",
  obligation: "obligation-",
  readiness: "review-entry-readiness-",
  evidence: "review-evidence-",
  activity: "review-dimension-activity-",
  dtfEvaluation: "design-time-feasibility-evaluation-",
  determination: "review-determination-",
  approvalAct: "approval-act-",
  withholding: "approval-withholding-",
  gpra: "gpra-",
  gpraInvalidation: "gpra-invalidation-",
  gpraSupersession: "gpra-supersession-",
  downstreamDeficiency: "downstream-deficiency-",
  reworkAuthorization: "rework-authorization-",
  reworkAuthorizationWithholding: "rework-authorization-withholding-",
  returnPosture: "return-posture-",
  resubmissionEligibility: "resubmission-eligibility-",
  brainAdvisory: "domain3-brain-advisory-",
  handoffPreparation: "governed-handoff-preparation-",
  handoffEntry: "governed-handoff-entry-",
} as const;

const LEGAL_CONDITIONAL_FAIL_ROUTES = ["conditional_route", "fail_route"] as const;
const LEGAL_DOWNSTREAM_ROUTES = [
  "conditional_route",
  "fail_route",
  "withholding_return_only",
] as const;
const LEGAL_RETURN_KINDS = [
  "correction_return_to_realization",
  "rework_return_to_realization",
  "return_authorized_after_approval_withholding",
] as const;

const LEGAL_REALIZATION_PATHS: readonly RealizationPath[] = [
  "created",
  "generated",
  "commissioned",
  "licensed_or_acquired",
];

const LEGAL_SOURCE_KINDS = [
  "compliance_boundary",
  "domain2_entry_evidence",
  "realization_traceability_package",
  "observation",
] as const;

function assertBrandedId(value: unknown, prefix: string, label: string): void {
  if (typeof value !== "string" || !value.startsWith(prefix)) {
    throw new OrchestraConstitutionalError(
      `Invalid Domain 3 ${label} identity`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }
}

function assertDomain3Traceability(traceability: unknown, label: string): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== DOMAIN3_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires Domain 3 FI-DSN-STD-014 traceability`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }
}

function assertStd015Traceability(traceability: unknown, label: string): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G1 traceability`,
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R01", "FI-DSN-STD-015-R07"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of [
    "FI-DSN-STD-015-R01",
    "FI-DSN-STD-015-R02",
    "FI-DSN-STD-015-R03",
    "FI-DSN-STD-015-R04",
    "FI-DSN-STD-015-R05",
    "FI-DSN-STD-015-R06",
    "FI-DSN-STD-015-R07",
  ]) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R01", "FI-DSN-STD-015-R07"],
      );
    }
  }
}

function assertAuditMetadata(audit: unknown, label: string): void {
  if (!audit || typeof audit !== "object") {
    throw new OrchestraConstitutionalError(
      `${label} requires audit metadata`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }
  const record = audit as Record<string, unknown>;
  if (typeof record.createdAt !== "string" || typeof record.createdBy !== "string") {
    throw new OrchestraConstitutionalError(
      `${label} requires audit createdAt and createdBy`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }
  const auditTraceability = record.traceability as Record<string, unknown> | null;
  if (
    !auditTraceability ||
    typeof auditTraceability !== "object" ||
    !Array.isArray(auditTraceability.requirementIds)
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires audit traceability`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }
}

export function validatePersistedProductionReadinessReview(
  raw: unknown,
): asserts raw is ProductionReadinessReview {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Production-readiness Review",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }

  const record = raw as Record<string, unknown>;
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (record.posture !== "under_review" && record.posture !== "review_determined") {
    throw new OrchestraConstitutionalError(
      "Invalid Production-readiness Review posture",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R27"],
    );
  }

  if (record.posture === "under_review") {
    if (record.determinationId !== null) {
      throw new OrchestraConstitutionalError(
        "Under Review posture must not carry a Review Determination identity",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R27"],
      );
    }
  } else if (
    typeof record.determinationId !== "string" ||
    !record.determinationId.startsWith(ID_PREFIXES.determination)
  ) {
    throw new OrchestraConstitutionalError(
      "Review Determined posture requires a valid Review Determination identity",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R27"],
    );
  }

  if (record.eligibilityStatus !== "review_entry_eligible") {
    throw new OrchestraConstitutionalError(
      "Invalid Review entry eligibility status",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R13"],
    );
  }

  const priorNull = record.priorReviewId === null || record.priorReviewId === undefined;
  const eligibilityNull =
    record.resubmissionEligibilityId === null || record.resubmissionEligibilityId === undefined;
  // Backward-compatible: missing fields treated as null (pre-G7 persisted reviews).
  if (record.priorReviewId === undefined && record.resubmissionEligibilityId === undefined) {
    // allow legacy — normalized at rehydration sites that construct reviews via admit
  } else if (priorNull !== eligibilityNull) {
    throw new OrchestraConstitutionalError(
      "Review priorReviewId and resubmissionEligibilityId must both be null or both set",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R51"],
    );
  } else if (!priorNull) {
    assertBrandedId(record.priorReviewId, ID_PREFIXES.review, "prior Production-readiness Review");
    if (
      typeof record.resubmissionEligibilityId !== "string" ||
      !record.resubmissionEligibilityId.startsWith("resubmission-eligibility-")
    ) {
      throw new OrchestraConstitutionalError(
        "Invalid resubmission eligibility identity on Review",
        "invalid_downstream_disposition",
        ["FI-DSN-STD-014-R51"],
      );
    }
  }

  const evidence = record.domain2EntryEvidence as Record<string, unknown> | null;
  if (!evidence || typeof evidence !== "object") {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review requires Domain 2 entry evidence",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R10"],
    );
  }

  assertBrandedId(evidence.rvaId, ID_PREFIXES.rva, "entry evidence RVA");
  assertBrandedId(
    evidence.reviewEntryReadinessId,
    ID_PREFIXES.readiness,
    "entry evidence Review-Entry Readiness",
  );
  assertBrandedId(evidence.programId, ID_PREFIXES.program, "entry evidence Production Program");
  assertBrandedId(
    evidence.obligationId,
    ID_PREFIXES.obligation,
    "entry evidence Production Obligation",
  );

  if (evidence.rvaId !== record.rvaId) {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence RVA does not match review subject",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08"],
    );
  }

  if (evidence.programId !== record.programId) {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence program does not match review subject",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R11"],
    );
  }

  if (evidence.obligationId !== record.obligationId) {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence obligation does not match review subject",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R11"],
    );
  }

  if (evidence.rvaPostureAtEntry !== "rva_exists") {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence requires legal Review-entry RVA posture",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R12"],
    );
  }

  if (typeof evidence.traceabilityPackageId !== "string" || !evidence.traceabilityPackageId) {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence requires Traceability Package reference",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R10"],
    );
  }

  if (
    typeof evidence.realizationPath !== "string" ||
    !(LEGAL_REALIZATION_PATHS as readonly string[]).includes(evidence.realizationPath)
  ) {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence requires legal realization path",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R10"],
    );
  }

  try {
    validateLineageCoherence(
      evidence.lineage as Parameters<typeof validateLineageCoherence>[0],
      evidence.rvaId as RealizedVisualArtifactId,
    );
  } catch (error) {
    if (error instanceof OrchestraConstitutionalError) {
      throw new OrchestraConstitutionalError(
        "Domain 2 entry evidence lineage is malformed",
        "invalid_domain3_persistence_state",
        ["FI-DSN-STD-014-R10"],
      );
    }
    throw error;
  }

  assertAuditMetadata(record.audit, "Production-readiness Review");
  assertDomain3Traceability(record.traceability, "Production-readiness Review");

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }
}

export function validatePersistedReviewEvidence(
  raw: unknown,
): asserts raw is ReviewEvidenceRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Review evidence",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R20"],
    );
  }

  const record = raw as Record<string, unknown>;
  assertBrandedId(record.evidenceId, ID_PREFIXES.evidence, "Review evidence");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");

  if (!isMandatoryReviewDimensionId(record.dimensionId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Review evidence requires a mandatory Review dimension",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R15", "FI-DSN-STD-014-R19"],
    );
  }

  if (record.evidenceCategoryId !== record.dimensionId) {
    throw new OrchestraConstitutionalError(
      "Review evidence category must match its Review dimension organization",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R20"],
    );
  }

  if (!(LEGAL_SOURCE_KINDS as readonly string[]).includes(record.sourceKind as string)) {
    throw new OrchestraConstitutionalError(
      "Persisted Review evidence requires legal source kind",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R20"],
    );
  }

  if (typeof record.sourceRecordId !== "string" || !record.sourceRecordId) {
    throw new OrchestraConstitutionalError(
      "Persisted Review evidence requires source record identity",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R20"],
    );
  }

  if (typeof record.sourceSnapshot !== "string" || !record.sourceSnapshot) {
    throw new OrchestraConstitutionalError(
      "Persisted Review evidence requires immutable source snapshot",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R20"],
    );
  }

  assertAuditMetadata(record.audit, "Review evidence");
  assertDomain3Traceability(record.traceability, "Review evidence");

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Review evidence requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R20"],
    );
  }
}

export function validatePersistedReviewDimensionActivity(
  raw: unknown,
): asserts raw is ReviewDimensionActivityRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Review dimension activity",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }

  const record = raw as Record<string, unknown>;
  assertBrandedId(record.activityId, ID_PREFIXES.activity, "Review dimension activity");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");

  if (!isMandatoryReviewDimensionId(record.dimensionId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Review dimension activity requires a mandatory Review dimension",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R15", "FI-DSN-STD-014-R19"],
    );
  }

  if (!Array.isArray(record.evidenceIds) || record.evidenceIds.length === 0) {
    throw new OrchestraConstitutionalError(
      "Review dimension activity requires at least one evidence identity",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R16", "FI-DSN-STD-014-R20"],
    );
  }

  for (const evidenceId of record.evidenceIds) {
    assertBrandedId(evidenceId, ID_PREFIXES.evidence, "Review evidence");
  }

  if (typeof record.observation !== "string" || !record.observation.trim()) {
    throw new OrchestraConstitutionalError(
      "Review dimension activity requires observation",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R14"],
    );
  }

  assertAuditMetadata(record.audit, "Review dimension activity");
  assertDomain3Traceability(record.traceability, "Review dimension activity");

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Review dimension activity requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }
}

const LEGAL_DTF_OBSERVATION_KINDS = [
  "compatibility_observation",
  "feasibility_concern",
  "boundary_conflict",
  "applicability_gap",
] as const;

export function validatePersistedDesignTimeFeasibilityEvaluation(
  raw: unknown,
): asserts raw is DesignTimeFeasibilityEvaluationRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Design-Time Feasibility evaluation",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R21"],
    );
  }

  const record = raw as Record<string, unknown>;
  assertBrandedId(record.evaluationId, ID_PREFIXES.dtfEvaluation, "Design-Time Feasibility evaluation");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");

  if (record.dimensionId !== "design_time_feasibility") {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation dimension must be design_time_feasibility",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R15", "FI-DSN-STD-014-R21"],
    );
  }

  if (!Array.isArray(record.applicableManufacturingBoundaries)) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation requires applicable manufacturing boundary list",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R21"],
    );
  }

  for (const boundary of record.applicableManufacturingBoundaries) {
    if (!boundary || typeof boundary !== "object") {
      throw new OrchestraConstitutionalError(
        "Invalid applicable manufacturing boundary reference",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R21"],
      );
    }
    const item = boundary as Record<string, unknown>;
    if (
      typeof item.sourceStandardId !== "string" ||
      !isCanonicalFrozenBindingFiMfgStandardId(item.sourceStandardId) ||
      item.bindingPosture !== "frozen_binding"
    ) {
      throw new OrchestraConstitutionalError(
        "Applicable manufacturing boundary must be a canonical frozen binding FI-MFG-* reference",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R21"],
      );
    }
  }

  if (!Array.isArray(record.observations) || record.observations.length === 0) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation requires observations",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R25"],
    );
  }

  for (const observation of record.observations) {
    if (!observation || typeof observation !== "object") {
      throw new OrchestraConstitutionalError(
        "Invalid Design-Time Feasibility observation",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R25"],
      );
    }
    const item = observation as Record<string, unknown>;
    if (
      !(LEGAL_DTF_OBSERVATION_KINDS as readonly string[]).includes(item.kind as string) ||
      typeof item.text !== "string" ||
      !item.text.trim()
    ) {
      throw new OrchestraConstitutionalError(
        "Design-Time Feasibility observation kind/text is invalid",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R25"],
      );
    }
    if (
      item.relatedSourceStandardId !== undefined &&
      !isCanonicalFrozenBindingFiMfgStandardId(item.relatedSourceStandardId)
    ) {
      throw new OrchestraConstitutionalError(
        "Design-Time Feasibility observation related manufacturing authority must be canonical frozen binding",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R21"],
      );
    }
  }

  if (
    record.manufacturingValidationNotPerformed !== true ||
    record.fulfillmentExecutionNotPerformed !== true ||
    record.decisionStageAffirmed !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility must affirm decision-stage evaluation without Manufacturing Validation or Fulfillment Execution",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R23", "FI-DSN-STD-014-R26"],
    );
  }

  if (typeof record.evaluationMethodDescription !== "string" || !record.evaluationMethodDescription.trim()) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility requires method-neutral provenance",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R24"],
    );
  }

  if (!Array.isArray(record.evidenceIds) || record.evidenceIds.length === 0) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation requires linked Review evidence identities",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R25"],
    );
  }

  for (const evidenceId of record.evidenceIds) {
    assertBrandedId(evidenceId, ID_PREFIXES.evidence, "Review evidence");
  }

  if (
    record.activityId !== null &&
    (typeof record.activityId !== "string" ||
      !record.activityId.startsWith(ID_PREFIXES.activity))
  ) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation activity identity is malformed",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R25"],
    );
  }

  assertAuditMetadata(record.audit, "Design-Time Feasibility evaluation");
  assertDomain3Traceability(record.traceability, "Design-Time Feasibility evaluation");

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R21"],
    );
  }
}

export function validatePersistedReviewDetermination(
  raw: unknown,
): asserts raw is ReviewDeterminationRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Review Determination",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R27"],
    );
  }

  const record = raw as Record<string, unknown>;
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!isLegalReviewDeterminationOutcome(record.outcome)) {
    throw new OrchestraConstitutionalError(
      "Persisted Review Determination requires legal outcome Pass, Conditional, or Fail",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R28"],
    );
  }

  if (!Array.isArray(record.evidenceBasisIds) || record.evidenceBasisIds.length === 0) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires non-empty evidence basis",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R30"],
    );
  }

  for (const evidenceId of record.evidenceBasisIds) {
    assertBrandedId(evidenceId, ID_PREFIXES.evidence, "Review evidence");
  }

  if (!Array.isArray(record.activityBasisIds) || record.activityBasisIds.length === 0) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires non-empty activity basis",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R30"],
    );
  }

  for (const activityId of record.activityBasisIds) {
    assertBrandedId(activityId, ID_PREFIXES.activity, "Review dimension activity");
  }

  if (!Array.isArray(record.conditions)) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires conditions array",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R29"],
    );
  }

  const conditions = record.conditions as unknown[];
  for (const condition of conditions) {
    if (typeof condition !== "string" || !condition.trim()) {
      throw new OrchestraConstitutionalError(
        "Review Determination conditions must be non-empty strings",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R29"],
      );
    }
  }

  if (typeof record.grounds !== "string" || !record.grounds.trim()) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires documented grounds",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R29"],
    );
  }

  if (record.outcome === "conditional") {
    if (conditions.length === 0) {
      throw new OrchestraConstitutionalError(
        "Conditional Review Determination requires bounded documented conditions",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R29", "FI-DSN-STD-014-R31"],
      );
    }
  } else if (conditions.length > 0) {
    throw new OrchestraConstitutionalError(
      "Pass and Fail Review Determinations must not carry Conditional conditions",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R28", "FI-DSN-STD-014-R29"],
    );
  }

  if (typeof record.determinedAt !== "string" || typeof record.determinedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Review Determination requires determinedAt and determinedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R27"],
    );
  }

  assertAuditMetadata(record.audit, "Review Determination");
  assertDomain3Traceability(record.traceability, "Review Determination");

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R27"],
    );
  }
}

export function validatePersistedApprovalAct(raw: unknown): asserts raw is ApprovalActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Approval act",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R41"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!isCanonicalEstablishedApprovalAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Approval act requires established MAGAC authority class",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R38"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-014-002") {
    throw new OrchestraConstitutionalError(
      "Persisted Approval act requires PD-STD-014-002 governing source",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36"],
    );
  }
  if (
    record.authorityConstitutionalScope !== "production_obligation" &&
    record.authorityConstitutionalScope !== "production_program"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Approval act requires lawful MAGAC constitutional scope",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
    );
  }

  const established = resolveEstablishedApprovalAuthorityClass(
    record.authorityClassId as ApprovalActRecord["authorityClassId"],
  );
  if (record.authorityConstitutionalScope !== established.authorizedConstitutionalScope) {
    throw new OrchestraConstitutionalError(
      "Persisted Approval MAGAC scope does not match established authority class",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
    );
  }

  const activation = record.activationScope;
  if (!activation || typeof activation !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Approval act requires MAGAC activation scope",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R38"],
    );
  }
  const activationRecord = activation as Record<string, unknown>;
  if (established.authorizedConstitutionalScope === "production_program") {
    if (activationRecord.kind !== "production_program") {
      throw new OrchestraConstitutionalError(
        "Program-scoped MAGAC class cannot activate under Production Obligation scope",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
      );
    }
    assertBrandedId(activationRecord.programId, ID_PREFIXES.program, "MAGAC Program activation");
    if (activationRecord.programId !== record.programId) {
      throw new OrchestraConstitutionalError(
        "MAGAC Program activation scope identity does not match Approval Program",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R38"],
      );
    }
  } else {
    if (activationRecord.kind !== "production_obligation") {
      throw new OrchestraConstitutionalError(
        "Obligation-scoped MAGAC class cannot activate under Production Program scope",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
      );
    }
    assertBrandedId(
      activationRecord.obligationId,
      ID_PREFIXES.obligation,
      "MAGAC Obligation activation",
    );
    if (activationRecord.obligationId !== record.obligationId) {
      throw new OrchestraConstitutionalError(
        "MAGAC Obligation activation scope identity does not match Approval Obligation",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R38"],
      );
    }
  }

  if (record.gpraNotCreatedByThisAct !== true) {
    throw new OrchestraConstitutionalError(
      "Approval act must affirm GPRA is not created by Approval alone",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R42"],
    );
  }
  if (
    record.manufacturingValidationNotPerformed !== true ||
    record.fulfillmentExecutionNotPerformed !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Approval must not claim Manufacturing Validation or Fulfillment Execution",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R41"],
    );
  }
  if (typeof record.approvedAt !== "string" || typeof record.approvedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Approval act requires approvedAt and approvedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R38"],
    );
  }
  assertAuditMetadata(record.audit, "Approval act");
  assertDomain3Traceability(record.traceability, "Approval act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Approval act requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R41"],
    );
  }
}

export function validatePersistedApprovalWithholding(
  raw: unknown,
): asserts raw is ApprovalWithholdingRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Approval withholding",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R39"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.withholdingId, ID_PREFIXES.withholding, "Approval withholding");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!isMandatoryApprovalWithholdingGroundFamily(record.groundFamily)) {
    throw new OrchestraConstitutionalError(
      "Persisted Approval withholding requires mandatory EGWG ground family",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R39", "FI-DSN-STD-014-R40"],
    );
  }
  if (typeof record.grounds !== "string" || !record.grounds.trim()) {
    throw new OrchestraConstitutionalError(
      "Approval withholding requires documented grounds",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R39"],
    );
  }
  if (record.passDeterminationPreserved !== true) {
    throw new OrchestraConstitutionalError(
      "Approval withholding must preserve Pass Determination",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R35", "FI-DSN-STD-014-R39"],
    );
  }
  assertAuditMetadata(record.audit, "Approval withholding");
  assertDomain3Traceability(record.traceability, "Approval withholding");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Approval withholding requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R39"],
    );
  }
}

export function validatePersistedGpraGrant(raw: unknown): asserts raw is GpraGrantRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted GPRA grant",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R42"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!isCanonicalEstablishedApprovalAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA requires established MAGAC authority class",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R42"],
    );
  }
  if (
    record.collectionMembershipNotConferred !== true ||
    record.governedHandoffNotAuthorized !== true
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA must exclude collection membership and Governed Handoff authorization",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R43"],
    );
  }
  if (
    record.manufacturingValidationNotPerformed !== true ||
    record.fulfillmentExecutionNotPerformed !== true
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA must not claim Manufacturing Validation or Fulfillment Execution",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R42"],
    );
  }
  if (typeof record.grantedAt !== "string" || typeof record.grantedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "GPRA grant requires grantedAt and grantedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R42"],
    );
  }
  assertAuditMetadata(record.audit, "GPRA grant");
  assertDomain3Traceability(record.traceability, "GPRA grant");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "GPRA grant requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R42"],
    );
  }
}

function assertReworkAuthorizationId(value: unknown): void {
  if (
    typeof value !== "string" ||
    !value.startsWith(ID_PREFIXES.reworkAuthorization) ||
    value.startsWith(ID_PREFIXES.reworkAuthorizationWithholding)
  ) {
    throw new OrchestraConstitutionalError(
      "Invalid Domain 3 Rework authorization identity",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R47"],
    );
  }
}

export function validatePersistedDownstreamDeficiencyRecord(
  raw: unknown,
): asserts raw is DownstreamDeficiencyRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Downstream deficiency record",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R46"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.deficiencyRecordId,
    ID_PREFIXES.downstreamDeficiency,
    "Downstream deficiency record",
  );
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!(LEGAL_CONDITIONAL_FAIL_ROUTES as readonly string[]).includes(record.route as string)) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency requires Conditional or Fail disposition route",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46", "FI-DSN-STD-014-R49"],
    );
  }
  if (!isMandatoryGovernedDeficiencyFamily(record.deficiencyFamily)) {
    throw new OrchestraConstitutionalError(
      "Persisted Downstream deficiency requires mandatory EGDF family",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46"],
    );
  }
  if (typeof record.grounds !== "string" || !record.grounds.trim()) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency requires documented grounds",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46"],
    );
  }
  if (!Array.isArray(record.evidenceBasisIds)) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency requires evidenceBasisIds array",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46"],
    );
  }
  for (const evidenceId of record.evidenceBasisIds) {
    assertBrandedId(evidenceId, ID_PREFIXES.evidence, "Review evidence");
  }
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Downstream deficiency requires established DDAC authority class",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-014-012") {
    throw new OrchestraConstitutionalError(
      "Persisted Downstream deficiency requires PD-STD-014-012 governing source",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45"],
    );
  }
  if (typeof record.recordedAt !== "string" || typeof record.recordedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency requires recordedAt and recordedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R46"],
    );
  }
  if (record.determinationNotRevised !== true) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency must affirm determinationNotRevised",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R44", "FI-DSN-STD-014-R46"],
    );
  }
  assertAuditMetadata(record.audit, "Downstream deficiency record");
  assertDomain3Traceability(record.traceability, "Downstream deficiency record");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R46"],
    );
  }
}

export function validatePersistedReworkAuthorization(
  raw: unknown,
): asserts raw is ReworkAuthorizationRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Rework authorization",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R47"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertReworkAuthorizationId(record.reworkAuthorizationId);
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!(LEGAL_CONDITIONAL_FAIL_ROUTES as readonly string[]).includes(record.route as string)) {
    throw new OrchestraConstitutionalError(
      "Rework authorization requires Conditional or Fail disposition route",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R47", "FI-DSN-STD-014-R49"],
    );
  }
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Rework authorization requires established DDAC authority class",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R47"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-014-012") {
    throw new OrchestraConstitutionalError(
      "Persisted Rework authorization requires PD-STD-014-012 governing source",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45"],
    );
  }
  if (typeof record.authorizedAt !== "string" || typeof record.authorizedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Rework authorization requires authorizedAt and authorizedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R47"],
    );
  }
  if (
    record.determinationNotRevised !== true ||
    record.notApproval !== true ||
    record.notGpra !== true ||
    record.manufacturingValidationNotPerformed !== true ||
    record.fulfillmentExecutionNotPerformed !== true ||
    record.std013IterationNotPerformed !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Rework authorization must affirm determination preservation and exclusion markers",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R47"],
    );
  }
  assertAuditMetadata(record.audit, "Rework authorization");
  assertDomain3Traceability(record.traceability, "Rework authorization");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Rework authorization requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R47"],
    );
  }
}

export function validatePersistedReworkAuthorizationWithholding(
  raw: unknown,
): asserts raw is ReworkAuthorizationWithholdingRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Rework authorization withholding",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R48"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.withholdingId,
    ID_PREFIXES.reworkAuthorizationWithholding,
    "Rework authorization withholding",
  );
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!(LEGAL_CONDITIONAL_FAIL_ROUTES as readonly string[]).includes(record.route as string)) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding requires Conditional or Fail disposition route",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R48", "FI-DSN-STD-014-R49"],
    );
  }
  if (typeof record.grounds !== "string" || !record.grounds.trim()) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding requires documented grounds",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R48"],
    );
  }
  if (record.governingSourceId !== "PD-STD-014-009") {
    throw new OrchestraConstitutionalError(
      "Persisted Rework authorization withholding requires PD-STD-014-009 governing source",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R48"],
    );
  }
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Rework authorization withholding requires established DDAC authority class",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R48"],
    );
  }
  if (typeof record.withheldAt !== "string" || typeof record.withheldBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding requires withheldAt and withheldBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R48"],
    );
  }
  if (record.determinationNotRevised !== true) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding must affirm determinationNotRevised",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R44", "FI-DSN-STD-014-R48"],
    );
  }
  assertAuditMetadata(record.audit, "Rework authorization withholding");
  assertDomain3Traceability(record.traceability, "Rework authorization withholding");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R48"],
    );
  }
}

export function validatePersistedReturnPosture(
  raw: unknown,
): asserts raw is ReturnPostureRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Return posture",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R49"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.returnPostureId, ID_PREFIXES.returnPosture, "Return posture");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!(LEGAL_DOWNSTREAM_ROUTES as readonly string[]).includes(record.route as string)) {
    throw new OrchestraConstitutionalError(
      "Return posture requires a legal Downstream disposition route",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (!(LEGAL_RETURN_KINDS as readonly string[]).includes(record.returnKind as string)) {
    throw new OrchestraConstitutionalError(
      "Return posture requires a legal return kind",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (
    record.targetObligationScope !== null &&
    record.targetObligationScope !== "same_obligation" &&
    record.targetObligationScope !== "successor_obligation"
  ) {
    throw new OrchestraConstitutionalError(
      "Return posture targetObligationScope is invalid",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (
    record.approvalWithholdingId !== null &&
    (typeof record.approvalWithholdingId !== "string" ||
      !record.approvalWithholdingId.startsWith(ID_PREFIXES.withholding))
  ) {
    throw new OrchestraConstitutionalError(
      "Return posture Approval withholding identity is malformed",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (record.route === "withholding_return_only") {
    throw new OrchestraConstitutionalError(
      "Persisted Route C Return Posture is not authorized: frozen TRPM baseline after Pass plus Approval withholding is block-without-return and no exceptional return-authorizing source is currently established",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (record.returnKind === "return_authorized_after_approval_withholding") {
    throw new OrchestraConstitutionalError(
      "Persisted Route C Return Posture kind is not authorized under the current frozen Route C authority catalog",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (record.approvalWithholdingId !== null) {
    throw new OrchestraConstitutionalError(
      "Conditional/Fail return posture must not carry Approval withholding identity",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (typeof record.returnGoverningSourceId !== "string" || !record.returnGoverningSourceId.trim()) {
    throw new OrchestraConstitutionalError(
      "Return posture requires returnGoverningSourceId",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Return posture requires established DDAC authority class",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R49"],
    );
  }
  if (typeof record.establishedAt !== "string" || typeof record.establishedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Return posture requires establishedAt and establishedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (record.determinationNotRevised !== true || record.terminationNotAuthorized !== true) {
    throw new OrchestraConstitutionalError(
      "Return posture must affirm determinationNotRevised and terminationNotAuthorized",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49", "FI-DSN-STD-014-R50"],
    );
  }
  assertAuditMetadata(record.audit, "Return posture");
  assertDomain3Traceability(record.traceability, "Return posture");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Return posture requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R49"],
    );
  }
}

export function validatePersistedResubmissionEligibility(
  raw: unknown,
): asserts raw is ResubmissionEligibilityRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Resubmission eligibility",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R51"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.eligibilityId,
    ID_PREFIXES.resubmissionEligibility,
    "Resubmission eligibility",
  );
  assertBrandedId(record.priorReviewId, ID_PREFIXES.review, "prior Production-readiness Review");
  assertBrandedId(
    record.priorDeterminationId,
    ID_PREFIXES.determination,
    "prior Review Determination",
  );
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!(LEGAL_CONDITIONAL_FAIL_ROUTES as readonly string[]).includes(record.route as string)) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility requires Conditional or Fail disposition route",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R51"],
    );
  }
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Resubmission eligibility requires established DDAC authority class",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R51"],
    );
  }
  if (typeof record.authorizedAt !== "string" || typeof record.authorizedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility requires authorizedAt and authorizedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R51"],
    );
  }
  if (
    record.priorDeterminationPreserved !== true ||
    record.satisfiedConditionalNotRecognized !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility must affirm priorDeterminationPreserved and satisfiedConditionalNotRecognized",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R51"],
    );
  }
  assertAuditMetadata(record.audit, "Resubmission eligibility");
  assertDomain3Traceability(record.traceability, "Resubmission eligibility");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R51"],
    );
  }
}

export function validatePersistedGpraInvalidationAct(
  raw: unknown,
): asserts raw is GpraInvalidationActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted GPRA invalidation act",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.invalidationActId, ID_PREFIXES.gpraInvalidation, "GPRA invalidation act");
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!isMandatoryInvalidationTriggerFamily(record.itFamily)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation requires mandatory PVTA IT family",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R56"],
    );
  }
  if (!isCanonicalEstablishedInvalidationAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation requires established IVAC authority class",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R57"],
    );
  }
  resolveEstablishedInvalidationAuthorityClass(
    record.authorityClassId as GpraInvalidationActRecord["authorityClassId"],
  );
  if (record.authorityGoverningSourceId !== "PD-STD-014-007") {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation requires PD-STD-014-007 governing source",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R57"],
    );
  }

  if (record.itFamily === "material_compliance_boundary_change") {
    if (record.materialNonComplianceEstablished !== true) {
      throw new OrchestraConstitutionalError(
        "Persisted IT-2 invalidation requires materialNonComplianceEstablished",
        "invalid_gpra_invalidation",
        ["FI-DSN-STD-014-R58"],
      );
    }
  } else if (record.materialNonComplianceEstablished !== null) {
    throw new OrchestraConstitutionalError(
      "Persisted non-IT-2 invalidation must not carry material non-compliance attribution",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R56", "FI-DSN-STD-014-R58"],
    );
  }

  if (
    typeof record.triggeringGoverningSourceId !== "string" ||
    !record.triggeringGoverningSourceId.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires triggeringGoverningSourceId",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
    );
  }
  if (typeof record.constitutionalEvidence !== "string" || !record.constitutionalEvidence.trim()) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires constitutionalEvidence",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R59"],
    );
  }
  if (typeof record.invalidatedAt !== "string" || typeof record.invalidatedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires invalidatedAt and invalidatedBy",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R57", "FI-DSN-STD-014-R59"],
    );
  }

  if (
    record.historicalGrantPreserved !== true ||
    record.determinationNotRevised !== true ||
    record.notLifecycleTermination !== true ||
    record.forwardHandoffEligibilityTerminated !== true ||
    record.newIntakeAuthorityTerminated !== true ||
    record.cannotSilentlyReactivate !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation must preserve historical grant and Determination, terminate forward force, and forbid silent reactivation",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R55", "FI-DSN-STD-014-R60", "FI-DSN-STD-014-R62"],
    );
  }

  assertAuditMetadata(record.audit, "GPRA invalidation act");
  assertDomain3Traceability(record.traceability, "GPRA invalidation act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation act requires valid governed creation marker",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
    );
  }
}

export function validatePersistedGpraSupersessionAct(
  raw: unknown,
): asserts raw is GpraSupersessionActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted GPRA supersession act",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.supersessionActId, ID_PREFIXES.gpraSupersession, "GPRA supersession act");
  assertBrandedId(record.predecessorGpraId, ID_PREFIXES.gpra, "predecessor GPRA");
  assertBrandedId(record.successorGpraId, ID_PREFIXES.gpra, "successor GPRA");
  assertBrandedId(record.predecessorApprovalActId, ID_PREFIXES.approvalAct, "predecessor Approval act");
  assertBrandedId(record.successorApprovalActId, ID_PREFIXES.approvalAct, "successor Approval act");
  assertBrandedId(
    record.predecessorReviewId,
    ID_PREFIXES.review,
    "predecessor Production-readiness Review",
  );
  assertBrandedId(
    record.successorReviewId,
    ID_PREFIXES.review,
    "successor Production-readiness Review",
  );
  assertBrandedId(
    record.predecessorDeterminationId,
    ID_PREFIXES.determination,
    "predecessor Review Determination",
  );
  assertBrandedId(
    record.successorDeterminationId,
    ID_PREFIXES.determination,
    "successor Review Determination",
  );
  assertBrandedId(record.predecessorRvaId, ID_PREFIXES.rva, "predecessor Realized Visual Artifact");
  assertBrandedId(record.successorRvaId, ID_PREFIXES.rva, "successor Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (record.predecessorGpraId === record.successorGpraId) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession requires distinct predecessor and successor GPRA identities",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }

  if (!isMandatorySupersessionTriggerFamily(record.stFamily)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession requires mandatory ST family",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R66"],
    );
  }
  if (!isCanonicalEstablishedSupersessionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession requires established SSAC authority class",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R68"],
    );
  }
  resolveEstablishedSupersessionAuthorityClass(
    record.authorityClassId as GpraSupersessionActRecord["authorityClassId"],
  );
  if (record.authorityGoverningSourceId !== "PD-STD-014-014") {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession requires PD-STD-014-014 governing source",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R68"],
    );
  }

  if (
    typeof record.handoffConsumerContextId !== "string" ||
    !record.handoffConsumerContextId.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires non-empty handoffConsumerContextId",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }
  if (
    typeof record.triggeringGoverningSourceId !== "string" ||
    !record.triggeringGoverningSourceId.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires triggeringGoverningSourceId",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
  if (typeof record.constitutionalEvidence !== "string" || !record.constitutionalEvidence.trim()) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires constitutionalEvidence",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }
  if (typeof record.supersededAt !== "string" || typeof record.supersededBy !== "string") {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires supersededAt and supersededBy",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R68", "FI-DSN-STD-014-R69"],
    );
  }

  if (
    record.historicalPredecessorPreserved !== true ||
    record.determinationNotRevised !== true ||
    record.notLifecycleTermination !== true ||
    record.notInvalidation !== true ||
    record.predecessorForwardAuthorityTerminatedInContext !== true ||
    record.successorAuthoritativeInContext !== true ||
    record.cannotOverwritePredecessor !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession must preserve historical predecessor, terminate forward authority in context, and forbid overwrite without invalidation or lifecycle termination",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R70", "FI-DSN-STD-014-R71"],
    );
  }

  assertAuditMetadata(record.audit, "GPRA supersession act");
  assertDomain3Traceability(record.traceability, "GPRA supersession act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession act requires valid governed creation marker",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
}

export function validatePersistedDomain3BrainAdvisory(
  raw: unknown,
): asserts raw is Domain3BrainAdvisoryRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Domain 3 Brain advisory",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.advisoryId, ID_PREFIXES.brainAdvisory, "Domain 3 Brain advisory");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");

  if (
    record.sourceAttribution !== "brain_runtime" &&
    record.sourceAttribution !== "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory sourceAttribution must be brain_runtime or writing_engine",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  if (typeof record.eventTime !== "string" || !record.eventTime.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory requires eventTime",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  if (typeof record.brainRuntimeVersion !== "string" || !record.brainRuntimeVersion.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory requires brainRuntimeVersion",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  if (!isDomain3DecisionStage(record.decisionStage)) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory has unknown decisionStage",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R77"],
    );
  }
  if (!isDomain3BrainOutputClass(record.outputClass)) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory has unknown outputClass",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R75"],
    );
  }
  assertOutputClassAllowedForStage(record.decisionStage, record.outputClass);

  if (record.reviewId === null) {
    if (record.decisionStage !== "pre_review") {
      throw new OrchestraConstitutionalError(
        "Persisted Brain advisory without reviewId is only valid at pre_review",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R77", "FI-DSN-STD-014-R78"],
      );
    }
  } else {
    assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  }

  if (record.determinationId != null) {
    assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  }
  if (record.gpraId != null) {
    assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  }
  if (
    record.postureState !== null &&
    record.postureState !== "retention" &&
    record.postureState !== "invalidated" &&
    record.postureState !== "superseded"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory postureState must be retention, invalidated, superseded, or null",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  if (!Array.isArray(record.evidenceIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory requires evidenceIds array",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  for (const evidenceId of record.evidenceIds) {
    assertBrandedId(evidenceId, ID_PREFIXES.evidence, "Review evidence");
  }
  if (typeof record.advisoryContent !== "string" || !record.advisoryContent.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory requires non-empty advisoryContent",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }

  if (record.outputClass === "nonbinding_reevaluation_request") {
    if (!isDomain3BrainReevaluationRequestType(record.reevaluationRequestType)) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory requires valid reevaluationRequestType",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    if (!isDomain3BrainAuthorityRouteKind(record.routesToAuthorityKind)) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory requires valid routesToAuthorityKind",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    if (
      DOMAIN3_REEVALUATION_REQUEST_ROUTE[record.reevaluationRequestType] !==
      record.routesToAuthorityKind
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory route does not match BRRM pairing",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    const stages = DOMAIN3_REEVALUATION_REQUEST_ALLOWED_STAGES[record.reevaluationRequestType];
    if (!(stages as readonly string[]).includes(record.decisionStage)) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory stage does not match request type",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R77", "FI-DSN-STD-014-R80"],
      );
    }
  } else if (record.reevaluationRequestType != null || record.routesToAuthorityKind != null) {
    throw new OrchestraConstitutionalError(
      "Persisted non-reevaluation advisory must not carry reevaluation routing fields",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R80"],
    );
  }

  if (
    record.nonbinding !== true ||
    record.notConstitutionalAuthority !== true ||
    record.distinguishableFromConstitutionalActs !== true ||
    record.doesNotCompelConstitutionalAction !== true ||
    record.doesNotAuthorize !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory must carry nonbinding non-authority BRPAM markers",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R76", "FI-DSN-STD-014-R78", "FI-DSN-STD-014-R79"],
    );
  }

  assertAuditMetadata(record.audit, "Domain 3 Brain advisory");
  assertDomain3Traceability(record.traceability, "Domain 3 Brain advisory");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Domain 3 Brain advisory requires valid governed creation marker",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
}

export function validatePersistedGovernedHandoffPreparation(
  raw: unknown,
): asserts raw is GovernedHandoffPreparationRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff preparation",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R94"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires non-empty handoffConsumerContextId",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R89"],
    );
  }
  if (!Array.isArray(record.consumerCategoryKeys) || record.consumerCategoryKeys.length === 0) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires nonempty consumerCategoryKeys",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R89"],
    );
  }
  for (const key of record.consumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preparation has unknown consumerCategoryKey",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R89"],
      );
    }
  }
  if (record.eligibilityLayerCondition !== "export_ready") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation eligibilityLayerCondition must be export_ready",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R90", "FI-DSN-STD-014-R94"],
    );
  }
  if (
    record.forwardHandoffEligibility !== true ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffExecution !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.std015ConsumptionBoundaryOnly !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation must carry non-authorization / non-execution boundary markers",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R93", "FI-DSN-STD-014-R95"],
    );
  }
  if (typeof record.preparedAt !== "string" || !record.preparedAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires preparedAt",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R94"],
    );
  }
  if (typeof record.preparedBy !== "string" || !record.preparedBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires preparedBy",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R94"],
    );
  }
  if (!Array.isArray(record.brainAdvisoryIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires brainAdvisoryIds array",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87", "FI-DSN-STD-014-R92"],
    );
  }
  for (const advisoryId of record.brainAdvisoryIds) {
    assertBrandedId(advisoryId, ID_PREFIXES.brainAdvisory, "Domain 3 Brain advisory");
  }

  if (!record.validityExport || typeof record.validityExport !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires validityExport snapshot",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }
  const validityExport = record.validityExport as Record<string, unknown>;
  if (!validityExport.evaluationPoint || typeof validityExport.evaluationPoint !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation validityExport requires evaluationPoint",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }
  const evaluationPoint = validityExport.evaluationPoint as Record<string, unknown>;
  assertBrandedId(evaluationPoint.gpraId, ID_PREFIXES.gpra, "validityExport evaluationPoint GPRA");
  assertBrandedId(
    evaluationPoint.obligationId,
    ID_PREFIXES.obligation,
    "validityExport evaluationPoint obligation",
  );
  if (
    typeof evaluationPoint.handoffConsumerContextId !== "string" ||
    !evaluationPoint.handoffConsumerContextId.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted validityExport evaluationPoint requires handoffConsumerContextId",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }
  if (
    evaluationPoint.posture !== "retention" &&
    evaluationPoint.posture !== "invalidated" &&
    evaluationPoint.posture !== "superseded"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted validityExport evaluationPoint posture must be retention, invalidated, or superseded",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }
  assertBrandedId(validityExport.authoritativeGpraId, ID_PREFIXES.gpra, "authoritative GPRA");
  assertBrandedId(validityExport.approvalActId, ID_PREFIXES.approvalAct, "validityExport approval");
  assertBrandedId(validityExport.gpraGrantRef, ID_PREFIXES.gpra, "validityExport gpraGrantRef");
  if (validityExport.successorGpraId != null) {
    assertBrandedId(validityExport.successorGpraId, ID_PREFIXES.gpra, "successor GPRA");
  }
  if (validityExport.invalidationActId != null) {
    assertBrandedId(
      validityExport.invalidationActId,
      ID_PREFIXES.gpraInvalidation,
      "invalidation act",
    );
  }
  if (validityExport.supersessionActId != null) {
    assertBrandedId(
      validityExport.supersessionActId,
      ID_PREFIXES.gpraSupersession,
      "supersession act",
    );
  }
  if (typeof validityExport.forwardHandoffEligibility !== "boolean") {
    throw new OrchestraConstitutionalError(
      "Persisted validityExport requires forwardHandoffEligibility boolean",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }

  if (!record.evidencePackage || typeof record.evidencePackage !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires evidencePackage",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87"],
    );
  }
  const evidence = record.evidencePackage as Record<string, unknown>;
  assertBrandedId(evidence.rvaId, ID_PREFIXES.rva, "evidencePackage RVA");
  assertBrandedId(evidence.determinationId, ID_PREFIXES.determination, "evidencePackage Determination");
  assertBrandedId(evidence.approvalActId, ID_PREFIXES.approvalAct, "evidencePackage Approval");
  assertBrandedId(evidence.gpraId, ID_PREFIXES.gpra, "evidencePackage GPRA");
  assertBrandedId(evidence.obligationId, ID_PREFIXES.obligation, "evidencePackage obligation");
  if (!Array.isArray(evidence.dispositionRecordIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted evidencePackage requires dispositionRecordIds array",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87"],
    );
  }
  if (!Array.isArray(evidence.unresolvedBlockers)) {
    throw new OrchestraConstitutionalError(
      "Persisted evidencePackage requires unresolvedBlockers array",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87"],
    );
  }
  if (!Array.isArray(evidence.brainAdvisoryIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted evidencePackage requires brainAdvisoryIds array",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87"],
    );
  }
  if (!Array.isArray(evidence.consumerCategoryKeys)) {
    throw new OrchestraConstitutionalError(
      "Persisted evidencePackage requires consumerCategoryKeys array",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87", "FI-DSN-STD-014-R89"],
    );
  }
  for (const key of evidence.consumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted evidencePackage has unknown consumerCategoryKey",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R89"],
      );
    }
  }
  if (evidence.supersessionActId != null) {
    assertBrandedId(
      evidence.supersessionActId,
      ID_PREFIXES.gpraSupersession,
      "evidencePackage supersession",
    );
  }

  // Reject execution-shaped fields if present on the raw record.
  const forbidden = [
    "handoffActId",
    "handoffAuthorized",
    "executesHandoff",
    "handoffAuthorization",
    "performHandoff",
    "handoffExecuted",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim())) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preparation must not carry Handoff execution fields",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R93", "FI-DSN-STD-014-R95"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff preparation");
  assertDomain3Traceability(record.traceability, "Governed Handoff preparation");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff preparation requires valid governed creation marker",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R94"],
    );
  }
}

export function validatePersistedGovernedHandoffEntry(
  raw: unknown,
): asserts raw is GovernedHandoffEntryRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff entry",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires non-empty handoffConsumerContextId",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  if (!Array.isArray(record.consumerCategoryKeys) || record.consumerCategoryKeys.length === 0) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires nonempty consumerCategoryKeys",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  for (const key of record.consumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry has unknown consumerCategoryKey",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R07"],
      );
    }
  }

  if (record.preparationCurrencyAtEntry !== "current") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry preparationCurrencyAtEntry must be current",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  if (record.eligibilityLayerConditionConsumed !== "export_ready") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry eligibilityLayerConditionConsumed must be export_ready",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }

  if (
    record.considerationMayCommence !== true ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffExecution !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.doesNotPerformG11Preparation !== true ||
    record.doesNotGrantGpraOrApproval !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotBindConsumerClassCatalog !== true ||
    record.hofG1Only !== true ||
    record.std015HofG1EntryBoundaryOnly !== true ||
    record.r01InheritanceLock !== true ||
    record.r02DoesNotWeakenStd012Or013 !== true ||
    record.r03MfgComplianceBoundaryContextOnly !== true ||
    record.r04DecisionStagePolicyOnly !== true ||
    record.r05PrincipalSubjectsDeferred !== true ||
    record.r06DoesNotPerformReviewApprovalGpraOrG11Prep !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry must carry HOF-G1 consideration-only / non-authorization markers",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R01", "FI-DSN-STD-015-R05", "FI-DSN-STD-015-R07"],
    );
  }

  if (
    !Array.isArray(record.deferredPrincipalSubjects) ||
    record.deferredPrincipalSubjects.length !== HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires complete deferredPrincipalSubjects catalog (R05)",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R05"],
    );
  }
  for (const subject of record.deferredPrincipalSubjects) {
    if (!isHandoffDeferredPrincipalSubject(subject)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry has forged deferredPrincipalSubject",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R05"],
      );
    }
  }

  if (
    !Array.isArray(record.hofPDistinctionsPreserved) ||
    record.hofPDistinctionsPreserved.length !== HOF_P_DISTINCTIONS_PRESERVED.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires complete hofPDistinctionsPreserved catalog (R01)",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R01"],
    );
  }
  for (const id of record.hofPDistinctionsPreserved) {
    if (!isHandoffHofPDistinctionId(id)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry has forged HOF-P distinction id",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R01"],
      );
    }
  }

  if (typeof record.enteredAt !== "string" || !record.enteredAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires enteredAt",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  if (typeof record.enteredBy !== "string" || !record.enteredBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires enteredBy",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }

  const forbidden = [
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
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim())) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry must not carry R08+ HOEM / authorization / execution fields",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R04", "FI-DSN-STD-015-R05", "FI-DSN-STD-015-R07"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff entry");
  assertStd015Traceability(record.traceability, "Governed Handoff entry");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff entry requires valid governed creation marker",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
}


