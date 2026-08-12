/**
 * Domain 3 persistence validation — FI-DSN-STD-014 G2–G6.
 */

import {
  isCanonicalEstablishedApprovalAuthorityClassId,
  resolveEstablishedApprovalAuthorityClass,
} from "../approval-authority.js";
import { isMandatoryApprovalWithholdingGroundFamily } from "../approval-withholding-grounds.js";
import { DOMAIN3_GOVERNING_STANDARD } from "../domain3-authority.js";
import { isValidDomain3GovernedCreationMarker } from "../domain3-entry.js";
import type {
  ApprovalActRecord,
  ApprovalWithholdingRecord,
  DesignTimeFeasibilityEvaluationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
} from "../domain3-types.js";
import type { RealizationPath, RealizedVisualArtifactId } from "../domain2-types.js";
import { OrchestraConstitutionalError } from "../errors.js";
import { isCanonicalFrozenBindingFiMfgStandardId } from "../manufacturing-authority.js";
import { isLegalReviewDeterminationOutcome } from "../review-determination.js";
import { isMandatoryReviewDimensionId } from "../review-dimensions.js";
import { validateLineageCoherence } from "../rva-lifecycle.js";

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
} as const;

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

