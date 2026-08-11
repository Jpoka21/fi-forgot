/**
 * Domain 2 ownership — Review-Entry Readiness freshness for Domain 3 admission.
 * FI-DSN-STD-013-R49/R50; consumed by FI-DSN-STD-014-R08–R10 without recreating readiness.
 */

import type { ComplianceBoundaryBinding } from "./compliance-boundary.js";
import type {
  Domain1EntryEvidence,
  RealizationTraceabilityPackage,
  TraceabilityWaiverEvidence,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function bindingKey(binding: ComplianceBoundaryBinding): string {
  return `${binding.sourceStandardId}\u0000${binding.scopeDescription}`;
}

function domain1EvidenceFingerprint(evidence: Domain1EntryEvidence): string {
  return [
    evidence.programId,
    evidence.explorationDeterminationId,
    evidence.explorationEntryPosture,
    evidence.constitutionalCurrentnessVerified ? "true" : "false",
  ].join("\u0000");
}

function waiverIds(evidence: readonly TraceabilityWaiverEvidence[]): string[] {
  return sortedUnique(evidence.map((item) => item.waiverId));
}

/**
 * Compare readiness-relevant constitutional package components.
 * Omits incidental fields (packageId, assembledAt) and CB event IDs
 * (blocking CB consequences are enforced separately by Domain 2 policy).
 */
export function assertReadinessRelevantPackageConsistency(
  readinessPackage: RealizationTraceabilityPackage,
  livePackage: RealizationTraceabilityPackage,
): void {
  if (
    readinessPackage.rvaId !== livePackage.rvaId ||
    readinessPackage.programId !== livePackage.programId ||
    readinessPackage.obligationId !== livePackage.obligationId ||
    readinessPackage.realizationCommitmentId !== livePackage.realizationCommitmentId ||
    readinessPackage.explorationPostureRecordId !== livePackage.explorationPostureRecordId ||
    readinessPackage.realizationPath !== livePackage.realizationPath ||
    readinessPackage.rvaPosture !== livePackage.rvaPosture ||
    readinessPackage.explorationWaiverRecordId !== livePackage.explorationWaiverRecordId
  ) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness package is stale relative to live Domain 2 Traceability Package",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49", "FI-DSN-STD-013-R41"],
    );
  }

  if (
    readinessPackage.lineage.rootRvaId !== livePackage.lineage.rootRvaId ||
    readinessPackage.lineage.versionSequence !== livePackage.lineage.versionSequence ||
    readinessPackage.lineage.priorVersionId !== livePackage.lineage.priorVersionId
  ) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness lineage is stale relative to live Domain 2 Traceability Package",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49", "FI-DSN-STD-013-R27"],
    );
  }

  if (
    domain1EvidenceFingerprint(readinessPackage.domain1EntryEvidence) !==
    domain1EvidenceFingerprint(livePackage.domain1EntryEvidence)
  ) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness Domain 1 entry evidence is stale relative to live package",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49", "FI-DSN-STD-013-R10"],
    );
  }

  const readinessBindings = sortedUnique(
    readinessPackage.complianceBoundaryBindings.map(bindingKey),
  );
  const liveBindings = sortedUnique(livePackage.complianceBoundaryBindings.map(bindingKey));
  if (JSON.stringify(readinessBindings) !== JSON.stringify(liveBindings)) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness Compliance Boundary bindings drifted from live Domain 2 package",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49", "FI-DSN-STD-013-R29"],
    );
  }

  const readinessConstraints = sortedUnique(
    readinessPackage.unresolvedConstraints.map((c) => c.constraintId),
  );
  const liveConstraints = sortedUnique(
    livePackage.unresolvedConstraints.map((c) => c.constraintId),
  );
  if (JSON.stringify(readinessConstraints) !== JSON.stringify(liveConstraints)) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness unresolved constraints drifted from live Domain 2 package",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49", "FI-DSN-STD-013-R41"],
    );
  }

  if (
    JSON.stringify(waiverIds(readinessPackage.consumedWaiverEvidence)) !==
    JSON.stringify(waiverIds(livePackage.consumedWaiverEvidence))
  ) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness waiver evidence drifted from live Domain 2 package",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49", "FI-DSN-STD-013-R41"],
    );
  }

  const readinessRights = readinessPackage.rightsPosture?.intakeId ?? null;
  const liveRights = livePackage.rightsPosture?.intakeId ?? null;
  if (readinessRights !== liveRights) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness rights intake evidence drifted from live Domain 2 package",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49", "FI-DSN-STD-013-R39"],
    );
  }

  if (
    JSON.stringify(sortedUnique(readinessPackage.sharedSourceLinkageIds)) !==
    JSON.stringify(sortedUnique(livePackage.sharedSourceLinkageIds))
  ) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness Shared-Source Linkage evidence drifted from live Domain 2 package",
      "invalid_review_entry_readiness",
      ["FI-DSN-STD-013-R49", "FI-DSN-STD-013-R47"],
    );
  }
}
