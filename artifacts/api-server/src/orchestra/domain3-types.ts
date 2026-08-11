/**
 * Domain 3 constitutional types — FI-DSN-STD-014 G2 entry + G3 Review activity.
 */

import type { Domain3GovernanceTraceability } from "./domain3-authority.js";
import type {
  RealizationTraceabilityPackage,
  RealizedVisualArtifactId,
  ReviewEntryReadinessId,
  RvaVersionLineage,
} from "./domain2-types.js";
import type {
  MandatoryReviewDimensionId,
  ReviewEvidenceCategoryId,
} from "./review-dimensions.js";
import type {
  ConstitutionalAuditMetadata,
  ProductionObligationId,
  ProductionProgramId,
} from "./types.js";

export type ProductionReadinessReviewId = string & {
  readonly __brand: "ProductionReadinessReviewId";
};

export type Domain3GovernedCreationMarker = string & {
  readonly __brand: "Domain3GovernedCreationMarker";
};

/**
 * Lawful initial Domain 3 posture after Review entry admission — architecture §15.1.
 * Not Review Determination, Approval, or GPRA.
 */
export type ProductionReadinessReviewPosture = "under_review";

/**
 * Review entry eligibility posture — G2 gate outcome (R08–R13).
 * Eligibility admits into Review; it is not a Review Determination or GPRA grant.
 */
export type ReviewEntryEligibilityStatus = "review_entry_eligible";

/**
 * Immutable Domain 2 entry evidence retained by Domain 3 — R10, R11.
 * References Domain 2 outputs; does not recreate readiness semantics.
 */
export interface Domain2ReviewEntryEvidence {
  readonly rvaId: RealizedVisualArtifactId;
  readonly rvaPostureAtEntry: "rva_exists";
  readonly reviewEntryReadinessId: ReviewEntryReadinessId;
  readonly traceabilityPackageId: string;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly lineage: RvaVersionLineage;
  readonly realizationPath: RealizationTraceabilityPackage["realizationPath"];
}

/**
 * Production-readiness Review — Domain 3 admission of a Review-Entry Ready RVA
 * into Under Review per FI-DSN-STD-014-R08–R13.
 *
 * Principal subject: Review-Entry Ready RVA instance accepted into Review.
 * Does not grant Review Determination, Approval, or GPRA (R13).
 */
export interface ProductionReadinessReview {
  readonly reviewId: ProductionReadinessReviewId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly posture: ProductionReadinessReviewPosture;
  readonly eligibilityStatus: ReviewEntryEligibilityStatus;
  readonly domain2EntryEvidence: Domain2ReviewEntryEvidence;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

export type ReviewEvidenceId = string & {
  readonly __brand: "ReviewEvidenceId";
};

export type ReviewDimensionActivityId = string & {
  readonly __brand: "ReviewDimensionActivityId";
};

/**
 * Provenance kind for immutable Review evidence snapshots (R20 / GOV-002).
 * Does not grant Determination or GPRA.
 */
export type ReviewEvidenceSourceKind =
  | "compliance_boundary"
  | "domain2_entry_evidence"
  | "realization_traceability_package"
  | "observation";

/**
 * Immutable Review evidence record organized by dimension category (R20).
 * Captures a snapshot of what was examined; later Domain 2 change cannot rewrite it.
 */
export interface ReviewEvidenceRecord {
  readonly evidenceId: ReviewEvidenceId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly dimensionId: MandatoryReviewDimensionId;
  readonly evidenceCategoryId: ReviewEvidenceCategoryId;
  readonly sourceKind: ReviewEvidenceSourceKind;
  readonly sourceRecordId: string;
  /** Immutable snapshot of examined constitutional content. */
  readonly sourceSnapshot: string;
  readonly capturedAt: string;
  readonly capturedBy: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * Append-only Review dimension activity — records that a dimension was addressed
 * with evidence under an under_review Production-readiness Review (R14–R16, R20).
 * Not a Review Determination, Approval, or GPRA grant.
 */
export interface ReviewDimensionActivityRecord {
  readonly activityId: ReviewDimensionActivityId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly dimensionId: MandatoryReviewDimensionId;
  readonly evidenceIds: readonly ReviewEvidenceId[];
  readonly observation: string;
  readonly addressedAt: string;
  readonly addressedBy: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * Pure query: whether mandatory G3 Review activity is complete enough for a later
 * constitutional stage to consider Determination/G4 — not a Determination itself.
 */
export interface MandatoryReviewActivityCompleteness {
  readonly reviewId: ProductionReadinessReviewId;
  readonly allMandatoryDimensionsAddressed: boolean;
  readonly addressedDimensionIds: readonly MandatoryReviewDimensionId[];
  readonly missingDimensionIds: readonly MandatoryReviewDimensionId[];
}

export type DesignTimeFeasibilityEvaluationId = string & {
  readonly __brand: "DesignTimeFeasibilityEvaluationId";
};

/**
 * Observation kinds for Design-Time Feasibility (G4) — evidence for later Determination.
 * Not Review Determination outcomes (R25 / R23).
 */
export type DesignTimeFeasibilityObservationKind =
  | "compatibility_observation"
  | "feasibility_concern"
  | "boundary_conflict"
  | "applicability_gap";

/**
 * Append-only Design-Time Feasibility evaluation under design_time_feasibility (R21–R26).
 * Does not grant Determination, Approval, or GPRA.
 */
export interface DesignTimeFeasibilityEvaluationRecord {
  readonly evaluationId: DesignTimeFeasibilityEvaluationId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly dimensionId: "design_time_feasibility";
  readonly applicableManufacturingBoundaries: readonly {
    readonly sourceStandardId: string;
    readonly title: string;
    readonly kind: string;
    readonly bindingPosture: "frozen_binding";
    readonly governingVolume: "01";
  }[];
  /** FI-MFG-* ids bound on the program but not frozen/binding — not consumed as applicable. */
  readonly consideredNonApplicableSourceStandardIds: readonly string[];
  /** Method-neutral provenance (R24) — not an Approval or Determination. */
  readonly evaluationMethodDescription: string;
  readonly observations: readonly {
    readonly kind: DesignTimeFeasibilityObservationKind;
    readonly text: string;
    readonly relatedSourceStandardId?: string;
  }[];
  /** R23 / R26 — DTF proceeds without Manufacturing Validation or Fulfillment Execution. */
  readonly manufacturingValidationNotPerformed: true;
  readonly fulfillmentExecutionNotPerformed: true;
  readonly decisionStageAffirmed: true;
  readonly evaluatedAt: string;
  readonly evaluatedBy: string;
  /** Linked after G3 evidence/activity persistence. */
  readonly evidenceIds: readonly ReviewEvidenceId[];
  readonly activityId: ReviewDimensionActivityId | null;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}
