/**
 * Domain 3 persistence validation — FI-DSN-STD-014 G2 entry + G3 Review activity.
 */

import { DOMAIN3_GOVERNING_STANDARD } from "../domain3-authority.js";
import { isValidDomain3GovernedCreationMarker } from "../domain3-entry.js";
import type {
  ProductionReadinessReview,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
} from "../domain3-types.js";
import type { RealizationPath, RealizedVisualArtifactId } from "../domain2-types.js";
import { OrchestraConstitutionalError } from "../errors.js";
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

  if (record.posture !== "under_review") {
    throw new OrchestraConstitutionalError(
      "Invalid Production-readiness Review posture",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08"],
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
