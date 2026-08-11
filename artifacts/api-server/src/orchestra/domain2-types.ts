import type { ComplianceBoundaryBinding } from "./compliance-boundary.js";
import type { Domain2GovernanceTraceability } from "./domain2-authority.js";
import type { ExplorationEntryDetermination } from "./exploration-entry.js";
import type { ConstitutionalAuditMetadata } from "./types.js";
import type { ProductionObligationId, ProductionProgramId } from "./types.js";
import type { UnresolvedConstraintRecord } from "./compliance-boundary.js";

/** Stable identifier for a Realized Visual Artifact. FI-DSN-STD-013-R26 */
export type RealizedVisualArtifactId = string & {
  readonly __brand: "RealizedVisualArtifactId";
};

/** Stable identifier for a Realization Commitment record. FI-DSN-STD-013-R17 */
export type RealizationCommitmentId = string & {
  readonly __brand: "RealizationCommitmentId";
};

/** Stable identifier for an Exploration Posture operation record. FI-DSN-STD-013-R12 */
export type ExplorationPostureRecordId = string & {
  readonly __brand: "ExplorationPostureRecordId";
};

/** Stable identifier for a Review-Entry Readiness record. FI-DSN-STD-013-R49 */
export type ReviewEntryReadinessId = string & {
  readonly __brand: "ReviewEntryReadinessId";
};

/** Stable identifier for a Shared-Source Linkage record. FI-DSN-STD-013-R47 */
export type SharedSourceLinkageId = string & {
  readonly __brand: "SharedSourceLinkageId";
};

/** Stable identifier for a Compliance Boundary change event. FI-DSN-STD-013-R29/R46 */
export type ComplianceBoundaryChangeEventId = string & {
  readonly __brand: "ComplianceBoundaryChangeEventId";
};

/** Stable identifier for licensed/acquired intake traceability. FI-DSN-STD-013-R39 */
export type LicensedAcquiredIntakeId = string & {
  readonly __brand: "LicensedAcquiredIntakeId";
};

/** Stable identifier for consumed external rework trigger. FI-DSN-STD-013-R32 */
export type ExternalReworkTriggerId = string & {
  readonly __brand: "ExternalReworkTriggerId";
};

/** Governed consequence of a compliance-boundary change — R29, R46. */
export type ComplianceBoundaryChangeConsequence =
  | "reconsideration"
  | "successor_required"
  | "invalidation_required"
  | "rework_required";

/**
 * Exploration Posture constitutional postures — STD-013 §11.1.
 * Labels describe constitutional postures only.
 */
export type ExplorationPostureStatus =
  | "exploration_not_authorized"
  | "exploration_authorized"
  | "exploration_active"
  | "exploration_waived"
  | "exploration_exit_ready";

/**
 * Realization and RVA constitutional postures — STD-013 §11.2.
 * Labels describe constitutional postures only.
 */
export type RealizationPostureStatus =
  | "realization_committed"
  | "rva_candidate"
  | "rva_exists"
  | "rva_iteration"
  | "rva_superseded"
  | "rva_invalidated";

/** Executable RVA postures persisted in this runtime. */
export type RvaExecutablePosture =
  | "rva_candidate"
  | "rva_exists"
  | "rva_superseded"
  | "rva_invalidated";

/** Method-neutral realization path — STD-013 §15. */
export type RealizationPath =
  | "created"
  | "generated"
  | "commissioned"
  | "licensed_or_acquired";

/**
 * Auditable evidence that Domain 2 entry consumed lawful Domain 1 readiness.
 * FI-DSN-STD-013-R07, R10, R19
 */
export interface Domain1EntryEvidence {
  readonly programId: ProductionProgramId;
  readonly explorationDeterminationId: string;
  readonly explorationEntryPosture: ExplorationEntryDetermination["posture"];
  readonly domain1ReadinessEstablishedAt: string;
  readonly constitutionalCurrentnessVerified: true;
}

/**
 * Governed RVA Version Lineage — FI-DSN-STD-013-R27.
 */
export interface RvaVersionLineage {
  readonly rootRvaId: RealizedVisualArtifactId;
  readonly versionSequence: number;
  readonly priorVersionId: RealizedVisualArtifactId | null;
}

/**
 * Opaque marker set only by governed Domain 2 creation functions.
 */
export type Domain2GovernedCreationMarker = string & {
  readonly __brand: "Domain2GovernedCreationMarker";
};

/** Terminal lifecycle transition provenance for RVA — R44, R45. */
export interface RvaTerminalTransition {
  readonly kind: "superseded" | "invalidated";
  readonly transitionedAt: string;
  readonly transitionedBy: string;
  readonly reason: string;
  readonly successorRvaId?: RealizedVisualArtifactId;
}

/** RVA Exists promotion provenance — separate from creation audit. */
export interface RvaExistsPromotionRecord {
  readonly promotedAt: string;
  readonly promotedBy: string;
  readonly basis: string;
}

/**
 * Governed Exploration Posture operation record — R11 through R16.
 */
export interface ExplorationPostureRecord {
  readonly recordId: ExplorationPostureRecordId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly posture: ExplorationPostureStatus;
  readonly domain1EntryEvidence: Domain1EntryEvidence;
  readonly governingBasis: string;
  /** Domain 1 waiver supporting exploration-posture bypass — R14. */
  readonly explorationWaiverRecordId: string | null;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain2GovernanceTraceability;
  readonly governedCreationMarker: Domain2GovernedCreationMarker;
}

/**
 * Governed Realization Commitment — R17 through R21.
 */
export interface RealizationCommitment {
  readonly commitmentId: RealizationCommitmentId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly explorationPostureRecordId: ExplorationPostureRecordId;
  readonly posture: "realization_committed";
  readonly domain1EntryEvidence: Domain1EntryEvidence;
  readonly governingBasis: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain2GovernanceTraceability;
  readonly governedCreationMarker: Domain2GovernedCreationMarker;
}

/**
 * Realized Visual Artifact (RVA) — principal Domain 2 constitutional object.
 * FI-DSN-STD-013-R22 through R26.
 */
export interface RealizedVisualArtifact {
  readonly id: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly realizationCommitmentId: RealizationCommitmentId;
  readonly posture: RvaExecutablePosture;
  readonly realizationPath: RealizationPath;
  readonly lineage: RvaVersionLineage;
  readonly domain1EntryEvidence: Domain1EntryEvidence;
  readonly existsPromotion: RvaExistsPromotionRecord | null;
  readonly terminalTransition: RvaTerminalTransition | null;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain2GovernanceTraceability;
  readonly governedCreationMarker: Domain2GovernedCreationMarker;
}

/** Consumed waiver evidence snapshot for traceability — R41. */
export interface TraceabilityWaiverEvidence {
  readonly waiverId: string;
  readonly affectedTarget: string;
  readonly constitutionalBasis: string;
}

/** Exploration posture history entry for traceability — R41. */
export interface TraceabilityExplorationPostureEntry {
  readonly recordId: ExplorationPostureRecordId;
  readonly posture: ExplorationPostureStatus;
  readonly governingBasis: string;
}

/** Material Domain 2 decision entry for traceability — R41. */
export interface TraceabilityDomain2DecisionEntry {
  readonly kind: "exists_promotion" | "superseded" | "invalidated";
  readonly at: string;
  readonly by: string;
  readonly basis: string;
}

/**
 * Realization Traceability Package — derived assembly per R41.
 * Not a competing source of truth.
 */
export interface RealizationTraceabilityPackage {
  readonly packageId: string;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly realizationCommitmentId: RealizationCommitmentId;
  readonly explorationPostureRecordId: ExplorationPostureRecordId;
  readonly realizationCommitmentBasis: string;
  readonly realizationPath: RealizationPath;
  readonly rvaPosture: RvaExecutablePosture;
  readonly lineage: RvaVersionLineage;
  readonly domain1EntryEvidence: Domain1EntryEvidence;
  readonly explorationWaiverRecordId: string | null;
  readonly explorationPostureHistory: readonly TraceabilityExplorationPostureEntry[];
  readonly complianceBoundaryBindings: readonly ComplianceBoundaryBinding[];
  readonly unresolvedConstraints: readonly UnresolvedConstraintRecord[];
  readonly consumedWaiverEvidence: readonly TraceabilityWaiverEvidence[];
  readonly rightsPosture: LicensedAcquiredRightsPosture | null;
  readonly sharedSourceLinkageIds: readonly SharedSourceLinkageId[];
  readonly complianceBoundaryChangeEventIds: readonly ComplianceBoundaryChangeEventId[];
  readonly domain2DecisionHistory: readonly TraceabilityDomain2DecisionEntry[];
  readonly assembledAt: string;
  readonly traceability: Domain2GovernanceTraceability;
}

/**
 * Shared-Source Linkage — explicit governed multi-obligation realization link per R47.
 */
export interface SharedSourceLinkageRecord {
  readonly linkageId: SharedSourceLinkageId;
  readonly sourceRvaId: RealizedVisualArtifactId;
  readonly sourceProgramId: ProductionProgramId;
  readonly sourceObligationId: ProductionObligationId;
  readonly consumerRvaId: RealizedVisualArtifactId;
  readonly consumerProgramId: ProductionProgramId;
  readonly consumerObligationId: ProductionObligationId;
  readonly linkageBasis: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain2GovernanceTraceability;
  readonly governedCreationMarker: Domain2GovernedCreationMarker;
}

/**
 * Compliance Boundary change event — R29, R46.
 */
export interface ComplianceBoundaryChangeEvent {
  readonly eventId: ComplianceBoundaryChangeEventId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly complianceBoundarySourceStandardId: string;
  readonly materiality: "material" | "nonmaterial";
  readonly consequence: ComplianceBoundaryChangeConsequence;
  readonly changeBasis: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain2GovernanceTraceability;
  readonly governedCreationMarker: Domain2GovernedCreationMarker;
}

/**
 * Licensed or acquired intake rights posture — R39.
 */
export interface LicensedAcquiredRightsPosture {
  readonly intakeId: LicensedAcquiredIntakeId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly sourceReference: string;
  readonly rightsBasis: string;
  readonly attributionRequirement: string;
  readonly usageRestrictions: string | null;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain2GovernanceTraceability;
  readonly governedCreationMarker: Domain2GovernedCreationMarker;
}

/**
 * Consumed external rework trigger from STD-014 boundary — R32.
 * Does not authorize rework; records consumption only.
 */
export interface ExternalReworkTriggerRecord {
  readonly triggerId: ExternalReworkTriggerId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly externalReviewReference: string;
  readonly triggerBasis: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain2GovernanceTraceability;
  readonly governedCreationMarker: Domain2GovernedCreationMarker;
}

/**
 * Review-Entry Readiness — STD-013 output boundary to STD-014 per R49, R50.
 * Not GPRA, not review determination.
 */
export interface ReviewEntryReadiness {
  readonly readinessId: ReviewEntryReadinessId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly posture: "review_entry_ready";
  readonly traceabilityPackage: RealizationTraceabilityPackage;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain2GovernanceTraceability;
  readonly governedCreationMarker: Domain2GovernedCreationMarker;
}
