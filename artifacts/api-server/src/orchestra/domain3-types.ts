/**
 * Domain 3 constitutional types — FI-DSN-STD-014 G2–G6
 * (Review entry through Approval Authority and GPRA Grant).
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

export type ReviewDeterminationId = string & {
  readonly __brand: "ReviewDeterminationId";
};

/**
 * Production-readiness Review posture (architecture §15.1 / §12).
 * - under_review: admitted; G3/G4 activity may proceed (incomplete until Determination — R27)
 * - review_determined: exactly one Review Determination recorded; Review completed (R27)
 * Neither posture is Approval or GPRA (R29, R33).
 */
export type ProductionReadinessReviewPosture = "under_review" | "review_determined";

/**
 * Review entry eligibility posture — G2 gate outcome (R08–R13).
 * Eligibility admits into Review; it is not a Review Determination or GPRA grant.
 */
export type ReviewEntryEligibilityStatus = "review_entry_eligible";

/**
 * Review Determination outcomes — exhaustive closed set (FI-DSN-STD-014-R28).
 * Authority labels: Pass | Conditional | Fail (Failed Review Determination).
 */
export type ReviewDeterminationOutcome = "pass" | "conditional" | "fail";

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
 * into Under Review per FI-DSN-STD-014-R08–R13; completed by G5 Determination (R27).
 *
 * Principal subject: Review-Entry Ready RVA instance accepted into Review.
 * Admission does not grant Determination, Approval, or GPRA (R13).
 * Determination does not grant Approval or GPRA (R29, R33).
 */
export interface ProductionReadinessReview {
  readonly reviewId: ProductionReadinessReviewId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly posture: ProductionReadinessReviewPosture;
  readonly eligibilityStatus: ReviewEntryEligibilityStatus;
  readonly domain2EntryEvidence: Domain2ReviewEntryEvidence;
  /** Null while under_review; set to exactly one Determination when review_determined (R27). */
  readonly determinationId: ReviewDeterminationId | null;
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
 * Immutable Review Determination — constitutional G5 object (R27–R33).
 * Distinct from Review Activity completeness, DTF evidence, Approval, and GPRA.
 * Exactly one per completed Review; Conditional cannot mutate to Pass (R31).
 */
export interface ReviewDeterminationRecord {
  readonly determinationId: ReviewDeterminationId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly outcome: ReviewDeterminationOutcome;
  /** Immutable evidence IDs grounding the Determination (R30). */
  readonly evidenceBasisIds: readonly ReviewEvidenceId[];
  /** Immutable activity IDs grounding the Determination (R30). */
  readonly activityBasisIds: readonly ReviewDimensionActivityId[];
  /**
   * Bounded documented conditions — required non-empty for Conditional (R29, R31);
   * must be empty for Pass and Fail.
   */
  readonly conditions: readonly string[];
  /**
   * Documented grounds / rationale. Required for Fail (R29);
   * required for Conditional (why conditions apply) and Pass (determination rationale).
   */
  readonly grounds: string;
  readonly determinedAt: string;
  readonly determinedBy: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

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

export type ApprovalActId = string & { readonly __brand: "ApprovalActId" };
export type ApprovalWithholdingId = string & { readonly __brand: "ApprovalWithholdingId" };
export type GpraId = string & { readonly __brand: "GpraId" };

/**
 * MAGAC constitutional scope kinds established by PD-STD-014-002 / R36–R37.
 * Classes are established by frozen governance; Program/Obligation activate scope only.
 */
export type ApprovalAuthorityConstitutionalScope =
  | "production_obligation"
  | "production_program";

/**
 * Frozen-established Approval authority class identity (MAGAC catalog entry).
 * Not an implementation role, reviewer title, or injectable authority.
 */
export type ApprovalAuthorityClassId =
  | "approval_authority_production_obligation_scope"
  | "approval_authority_production_program_scope";

/**
 * EGWG mandatory withholding ground families (R39 / PD-STD-014-003).
 */
export type ApprovalWithholdingGroundFamily =
  | "bound_governing_prerequisites_not_satisfied"
  | "authority_or_provenance_defects"
  | "unresolved_production_program_or_obligation_conflicts";

/**
 * Approval consideration eligibility — distinct from Approval act and GPRA (R34).
 */
export interface ApprovalConsiderationEligibility {
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId | null;
  readonly rvaId: RealizedVisualArtifactId;
  readonly eligibleForApprovalConsideration: boolean;
  readonly passDeterminationPresent: boolean;
  readonly withholdingPresent: boolean;
  readonly approvalAlreadyRecorded: boolean;
}

/**
 * Decision-stage Approval act — distinct from Review Determination and GPRA (R41).
 * Necessary but not sufficient for GPRA.
 */
export interface ApprovalActRecord {
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly authorityClassId: ApprovalAuthorityClassId;
  readonly authorityGoverningSourceId: string;
  readonly authorityConstitutionalScope: ApprovalAuthorityConstitutionalScope;
  readonly activationScope:
    | { readonly kind: "production_obligation"; readonly obligationId: ProductionObligationId }
    | { readonly kind: "production_program"; readonly programId: ProductionProgramId };
  readonly approvedAt: string;
  readonly approvedBy: string;
  /** R41/R42 — Approval does not itself create GPRA. */
  readonly gpraNotCreatedByThisAct: true;
  readonly manufacturingValidationNotPerformed: true;
  readonly fulfillmentExecutionNotPerformed: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * Approval withholding after Pass — EGWG (R39–R40). Preserves Pass Determination.
 * Blocks Approval and GPRA only; does not create Conditional/Fail or return posture.
 */
export interface ApprovalWithholdingRecord {
  readonly withholdingId: ApprovalWithholdingId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly groundFamily: ApprovalWithholdingGroundFamily;
  readonly grounds: string;
  /** Optional governed extension source — only when additional ground beyond mandatory families. */
  readonly additionalGoverningSourceId: string | null;
  readonly withheldAt: string;
  readonly withheldBy: string;
  readonly passDeterminationPreserved: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * Explicit governed GPRA grant (R42–R43).
 * Binds specific RVA version under defined Production Obligation scope.
 * Distinct from Approval, membership, and STD-015 Handoff.
 */
export interface GpraGrantRecord {
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly authorityClassId: ApprovalAuthorityClassId;
  readonly authorityGoverningSourceId: string;
  readonly grantedAt: string;
  readonly grantedBy: string;
  /** Membership and Handoff exclusion (R43). */
  readonly collectionMembershipNotConferred: true;
  readonly governedHandoffNotAuthorized: true;
  readonly manufacturingValidationNotPerformed: true;
  readonly fulfillmentExecutionNotPerformed: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}
