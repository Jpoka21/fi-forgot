import { randomUUID } from "node:crypto";

import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import type { ComplianceBoundaryBinding, UnresolvedConstraintRecord } from "./compliance-boundary.js";
import type {
  ComplianceBoundaryChangeEvent,
  ExplorationPostureRecord,
  LicensedAcquiredRightsPosture,
  RealizationCommitment,
  RealizationTraceabilityPackage,
  RealizedVisualArtifact,
  SharedSourceLinkageRecord,
  TraceabilityDomain2DecisionEntry,
  TraceabilityExplorationPostureEntry,
  TraceabilityWaiverEvidence,
} from "./domain2-types.js";
import type { WaiverRecord } from "./waiver.js";
import { OrchestraConstitutionalError } from "./errors.js";

const TRACEABILITY_PACKAGE_REQUIREMENTS = [
  "FI-DSN-STD-013-R40",
  "FI-DSN-STD-013-R41",
  "FI-DSN-STD-013-R42",
  "FI-DSN-STD-013-R43",
] as const;

function buildDomain2DecisionHistory(rva: RealizedVisualArtifact): readonly TraceabilityDomain2DecisionEntry[] {
  const entries: TraceabilityDomain2DecisionEntry[] = [];

  if (rva.existsPromotion) {
    entries.push(
      Object.freeze({
        kind: "exists_promotion",
        at: rva.existsPromotion.promotedAt,
        by: rva.existsPromotion.promotedBy,
        basis: rva.existsPromotion.basis,
      }),
    );
  }

  if (rva.terminalTransition) {
    entries.push(
      Object.freeze({
        kind: rva.terminalTransition.kind,
        at: rva.terminalTransition.transitionedAt,
        by: rva.terminalTransition.transitionedBy,
        basis: rva.terminalTransition.reason,
      }),
    );
  }

  return Object.freeze(entries);
}

function buildWaiverEvidence(
  waivers: readonly WaiverRecord[],
  obligationWaiverIds: readonly string[],
): readonly TraceabilityWaiverEvidence[] {
  const waiverById = new Map(waivers.map((w) => [w.waiverId, w]));
  const evidence: TraceabilityWaiverEvidence[] = [];

  for (const waiverId of obligationWaiverIds) {
    const waiver = waiverById.get(waiverId);
    if (waiver) {
      evidence.push(
        Object.freeze({
          waiverId: waiver.waiverId,
          affectedTarget: waiver.affectedTarget,
          constitutionalBasis: waiver.constitutionalBasis,
        }),
      );
    }
  }

  return Object.freeze(evidence);
}

/**
 * Assemble Realization Traceability Package from constitutional source records — R41.
 * Derived assembly only; not a competing source of truth.
 */
export function assembleRealizationTraceabilityPackage(input: {
  rva: RealizedVisualArtifact;
  commitment: RealizationCommitment;
  explorationPosture: ExplorationPostureRecord;
  complianceBoundaryBindings: readonly ComplianceBoundaryBinding[];
  unresolvedConstraints: readonly UnresolvedConstraintRecord[];
  consumedWaivers: readonly WaiverRecord[];
  rightsPosture: LicensedAcquiredRightsPosture | null;
  sharedSourceLinkages: readonly SharedSourceLinkageRecord[];
  complianceBoundaryChangeEvents: readonly ComplianceBoundaryChangeEvent[];
  assembledAt?: string;
}): RealizationTraceabilityPackage {
  if (input.rva.realizationCommitmentId !== input.commitment.commitmentId) {
    throw new OrchestraConstitutionalError(
      "Traceability Package commitment does not match RVA",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (input.rva.programId !== input.commitment.programId) {
    throw new OrchestraConstitutionalError(
      "Traceability Package program identity mismatch",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (input.explorationPosture.recordId !== input.commitment.explorationPostureRecordId) {
    throw new OrchestraConstitutionalError(
      "Traceability Package exploration posture does not match commitment",
      "invalid_realization_commitment",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (input.rva.obligationId !== input.commitment.obligationId) {
    throw new OrchestraConstitutionalError(
      "Traceability Package obligation identity mismatch",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  const obligationWaiverIds = input.consumedWaivers.map((w) => w.waiverId);
  const explorationHistory: TraceabilityExplorationPostureEntry[] = [
    Object.freeze({
      recordId: input.explorationPosture.recordId,
      posture: input.explorationPosture.posture,
      governingBasis: input.explorationPosture.governingBasis,
    }),
  ];

  const linkageIds = input.sharedSourceLinkages
    .filter((l) => l.sourceRvaId === input.rva.id || l.consumerRvaId === input.rva.id)
    .map((l) => l.linkageId);

  const cbEventIds = input.complianceBoundaryChangeEvents
    .filter((e) => e.rvaId === input.rva.id)
    .map((e) => e.eventId);

  const now = input.assembledAt ?? new Date().toISOString();

  return Object.freeze({
    packageId: `traceability-package-${randomUUID()}`,
    rvaId: input.rva.id,
    programId: input.rva.programId,
    obligationId: input.rva.obligationId,
    realizationCommitmentId: input.commitment.commitmentId,
    explorationPostureRecordId: input.explorationPosture.recordId,
    realizationCommitmentBasis: input.commitment.governingBasis,
    realizationPath: input.rva.realizationPath,
    rvaPosture: input.rva.posture,
    lineage: input.rva.lineage,
    domain1EntryEvidence: input.rva.domain1EntryEvidence,
    explorationWaiverRecordId: input.explorationPosture.explorationWaiverRecordId,
    explorationPostureHistory: Object.freeze(explorationHistory),
    complianceBoundaryBindings: Object.freeze([...input.complianceBoundaryBindings]),
    unresolvedConstraints: Object.freeze([...input.unresolvedConstraints]),
    consumedWaiverEvidence: buildWaiverEvidence(input.consumedWaivers, obligationWaiverIds),
    rightsPosture: input.rightsPosture,
    sharedSourceLinkageIds: Object.freeze([...linkageIds]),
    complianceBoundaryChangeEventIds: Object.freeze([...cbEventIds]),
    domain2DecisionHistory: buildDomain2DecisionHistory(input.rva),
    assembledAt: now,
    traceability: createDomain2GovernanceTraceability([...TRACEABILITY_PACKAGE_REQUIREMENTS]),
  });
}

/**
 * Verify traceability package has R41 minimum required components — R41, R43.
 */
export function assertTraceabilityPackageComplete(
  pkg: RealizationTraceabilityPackage,
): void {
  if (!pkg.rvaId || !pkg.programId || !pkg.obligationId) {
    throw new OrchestraConstitutionalError(
      "Realization Traceability Package is incomplete",
      "invalid_rva",
      ["FI-DSN-STD-013-R41", "FI-DSN-STD-013-R43"],
    );
  }

  if (!pkg.realizationCommitmentId || !pkg.explorationPostureRecordId) {
    throw new OrchestraConstitutionalError(
      "Realization Traceability Package missing governing commitment or exploration evidence",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (!pkg.realizationCommitmentBasis?.trim()) {
    throw new OrchestraConstitutionalError(
      "Realization Traceability Package missing Realization Commitment basis",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (!pkg.domain1EntryEvidence.constitutionalCurrentnessVerified) {
    throw new OrchestraConstitutionalError(
      "Realization Traceability Package requires Domain 1 entry evidence",
      "domain2_not_ready",
      ["FI-DSN-STD-013-R10"],
    );
  }

  if (pkg.complianceBoundaryBindings.length === 0) {
    throw new OrchestraConstitutionalError(
      "Realization Traceability Package requires Compliance Boundary bindings",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (pkg.explorationPostureHistory.length === 0) {
    throw new OrchestraConstitutionalError(
      "Realization Traceability Package requires Exploration Posture history",
      "invalid_rva",
      ["FI-DSN-STD-013-R41"],
    );
  }

  if (pkg.realizationPath === "licensed_or_acquired" && !pkg.rightsPosture) {
    throw new OrchestraConstitutionalError(
      "Licensed or acquired realization requires rights posture in traceability package",
      "invalid_licensed_acquired_intake",
      ["FI-DSN-STD-013-R39", "FI-DSN-STD-013-R41"],
    );
  }

  const isWaivedPath =
    pkg.explorationWaiverRecordId !== null ||
    pkg.explorationPostureHistory.some((entry) => entry.posture === "exploration_waived");

  if (isWaivedPath) {
    if (!pkg.explorationWaiverRecordId) {
      throw new OrchestraConstitutionalError(
        "Waived exploration path requires exploration waiver record identity in traceability package",
        "invalid_rva",
        ["FI-DSN-STD-013-R14", "FI-DSN-STD-013-R41"],
      );
    }
    const hasWaiverEvidence = pkg.consumedWaiverEvidence.some(
      (evidence) => evidence.waiverId === pkg.explorationWaiverRecordId,
    );
    if (!hasWaiverEvidence) {
      throw new OrchestraConstitutionalError(
        "Waived exploration path requires governing waiver evidence in traceability package",
        "invalid_rva",
        ["FI-DSN-STD-013-R14", "FI-DSN-STD-013-R41"],
      );
    }
  }
}

export const REALIZATION_TRACEABILITY_PACKAGE_TRACEABILITY = createDomain2GovernanceTraceability([
  ...TRACEABILITY_PACKAGE_REQUIREMENTS,
]);
