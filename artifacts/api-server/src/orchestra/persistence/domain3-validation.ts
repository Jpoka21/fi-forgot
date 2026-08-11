/**
 * Domain 3 persistence validation — FI-DSN-STD-014-R08–R13.
 * ORCH-IMP-006.2: strengthened nested entry-evidence structural integrity (BC-ORCH-018).
 */

import { DOMAIN3_GOVERNING_STANDARD } from "../domain3-authority.js";
import { isValidDomain3GovernedCreationMarker } from "../domain3-entry.js";
import type { ProductionReadinessReview } from "../domain3-types.js";
import type { RealizationPath, RealizedVisualArtifactId } from "../domain2-types.js";
import { OrchestraConstitutionalError } from "../errors.js";
import { validateLineageCoherence } from "../rva-lifecycle.js";

const ID_PREFIXES = {
  review: "production-readiness-review-",
  rva: "rva-",
  program: "program-",
  obligation: "obligation-",
  readiness: "review-entry-readiness-",
} as const;

const LEGAL_REALIZATION_PATHS: readonly RealizationPath[] = [
  "created",
  "generated",
  "commissioned",
  "licensed_or_acquired",
];

function assertBrandedId(value: unknown, prefix: string, label: string): void {
  if (typeof value !== "string" || !value.startsWith(prefix)) {
    throw new OrchestraConstitutionalError(
      `Invalid Domain 3 ${label} identity`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
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

  const audit = record.audit as Record<string, unknown> | null;
  if (!audit || typeof audit !== "object") {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review requires audit metadata",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }
  if (typeof audit.createdAt !== "string" || typeof audit.createdBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review requires audit createdAt and createdBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }
  const auditTraceability = audit.traceability as Record<string, unknown> | null;
  if (
    !auditTraceability ||
    typeof auditTraceability !== "object" ||
    !Array.isArray(auditTraceability.requirementIds)
  ) {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review requires audit traceability",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }

  const traceability = record.traceability as Record<string, unknown> | null;
  if (
    !traceability ||
    typeof traceability !== "object" ||
    traceability.governingStandardId !== DOMAIN3_GOVERNING_STANDARD ||
    !Array.isArray(traceability.requirementIds) ||
    traceability.requirementIds.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review requires Domain 3 FI-DSN-STD-014 traceability",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }
}
