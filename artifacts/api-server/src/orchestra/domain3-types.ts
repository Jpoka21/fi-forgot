/**
 * Domain 3 constitutional types — FI-DSN-STD-014 G2–G11
 * (Review entry through Governed Handoff Preparation / STD-015 consumption boundary).
 */

import type { Domain3GovernanceTraceability } from "./domain3-authority.js";
import type { Std015GovernanceTraceability } from "./std015-authority.js";
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

export type ResubmissionEligibilityId = string & {
  readonly __brand: "ResubmissionEligibilityId";
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
  /**
   * G7 subsequent Review linkage (R51) — null for first Review on an RVA path.
   * When set, admission was authorized by a resubmission eligibility act.
   */
  readonly priorReviewId: ProductionReadinessReviewId | null;
  readonly resubmissionEligibilityId: ResubmissionEligibilityId | null;
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
 * Runtime MAGAC class identity encoding (PD-STD-014-002 / R36–R38).
 * Machine encodings of Section 20.16.2 scope kinds — not literal frozen Standard IDs.
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

// --- G7 Downstream Disposition (R44–R51) ---

export type DownstreamDeficiencyRecordId = string & {
  readonly __brand: "DownstreamDeficiencyRecordId";
};
export type ReworkAuthorizationId = string & { readonly __brand: "ReworkAuthorizationId" };
export type ReworkAuthorizationWithholdingId = string & {
  readonly __brand: "ReworkAuthorizationWithholdingId";
};
export type ReturnPostureId = string & { readonly __brand: "ReturnPostureId" };

/**
 * DDAC constitutional scope kinds — PD-STD-014-012 / R45.
 */
export type DownstreamDispositionConstitutionalScope =
  | "production_obligation"
  | "production_program";

/**
 * Runtime DDAC class identity encoding under PD-STD-014-012.
 * Machine encodings of constitutional scope kinds — not literal frozen Standard IDs.
 */
export type DownstreamDispositionAuthorityClassId =
  | "downstream_disposition_authority_production_obligation_scope"
  | "downstream_disposition_authority_production_program_scope";

/**
 * EGDF mandatory deficiency families (R46 / PD-STD-014-008).
 */
export type GovernedDeficiencyFamily =
  | "identity_compliance"
  | "surface_fit"
  | "contextual_obligations"
  | "design_time_feasibility";

/**
 * TRPM route (R49 / PD-STD-014-010).
 * Route C (withholding) does not create EGDF/DSRA eligibility by itself.
 * Route C Return Posture is currently dormant — no frozen exceptional
 * return-authorizing source is established (ORCH-IMP-011.2 Outcome B).
 */
export type DownstreamDispositionRoute =
  | "conditional_route"
  | "fail_route"
  | "withholding_return_only";

/**
 * Return posture kinds. `return_authorized_after_approval_withholding` is reserved
 * vocabulary for a future frozen Route C ground catalog; creation and trusted
 * rehydration currently reject it (block-without-return baseline).
 */
export type ReturnPostureKind =
  | "correction_return_to_realization"
  | "rework_return_to_realization"
  | "return_authorized_after_approval_withholding";

/**
 * EGDF downstream deficiency disposition record — distinct from Review evidence,
 * Determination, Approval, and GPRA (R44, R46).
 */
export interface DownstreamDeficiencyRecord {
  readonly deficiencyRecordId: DownstreamDeficiencyRecordId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly route: "conditional_route" | "fail_route";
  readonly deficiencyFamily: GovernedDeficiencyFamily;
  readonly grounds: string;
  readonly evidenceBasisIds: readonly ReviewEvidenceId[];
  readonly authorityClassId: DownstreamDispositionAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-014-012";
  readonly recordedAt: string;
  readonly recordedBy: string;
  readonly determinationNotRevised: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * DSRA rework authorization — separate from Determination, deficiency, return (R47).
 */
export interface ReworkAuthorizationRecord {
  readonly reworkAuthorizationId: ReworkAuthorizationId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly route: "conditional_route" | "fail_route";
  readonly authorityClassId: DownstreamDispositionAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-014-012";
  readonly authorizedAt: string;
  readonly authorizedBy: string;
  readonly determinationNotRevised: true;
  readonly notApproval: true;
  readonly notGpra: true;
  readonly manufacturingValidationNotPerformed: true;
  readonly fulfillmentExecutionNotPerformed: true;
  readonly std013IterationNotPerformed: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * DSRA rework authorization withholding (R48).
 */
export interface ReworkAuthorizationWithholdingRecord {
  readonly withholdingId: ReworkAuthorizationWithholdingId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly route: "conditional_route" | "fail_route";
  readonly grounds: string;
  readonly governingSourceId: "PD-STD-014-009";
  readonly authorityClassId: DownstreamDispositionAuthorityClassId;
  readonly withheldAt: string;
  readonly withheldBy: string;
  readonly determinationNotRevised: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * TRPM return posture — separate disposition act (R49). Does not mutate Domain 2.
 */
export interface ReturnPostureRecord {
  readonly returnPostureId: ReturnPostureId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly route: DownstreamDispositionRoute;
  readonly returnKind: ReturnPostureKind;
  readonly targetObligationScope: "same_obligation" | "successor_obligation" | null;
  readonly approvalWithholdingId: ApprovalWithholdingId | null;
  readonly returnGoverningSourceId: string;
  readonly authorityClassId: DownstreamDispositionAuthorityClassId;
  readonly establishedAt: string;
  readonly establishedBy: string;
  readonly determinationNotRevised: true;
  readonly terminationNotAuthorized: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * Resubmission / re-entry eligibility for a subsequent Review (R51).
 */
export interface ResubmissionEligibilityRecord {
  readonly eligibilityId: ResubmissionEligibilityId;
  readonly priorReviewId: ProductionReadinessReviewId;
  readonly priorDeterminationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly route: "conditional_route" | "fail_route";
  readonly authorityClassId: DownstreamDispositionAuthorityClassId;
  readonly authorizedAt: string;
  readonly authorizedBy: string;
  readonly priorDeterminationPreserved: true;
  readonly satisfiedConditionalNotRecognized: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * Query: Conditional/Fail create G7 disposition eligibility — not authorization (R47–R49).
 */
export interface DownstreamDispositionEligibility {
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId | null;
  readonly route: DownstreamDispositionRoute | null;
  readonly dispositionEligible: boolean;
  readonly reworkAuthorizationEligible: boolean;
  readonly returnPostureEligible: boolean;
  readonly resubmissionEligibilityActEligible: boolean;
  readonly withholdingBlocksApprovalOnly: boolean;
}

// --- G8 GPRA Retention and Invalidated Posture (R52–R63) ---

export type GpraInvalidationActId = string & { readonly __brand: "GpraInvalidationActId" };

/**
 * RIVP peer postures at Layer B. G8 owns Retention default and Invalidated.
 * G9 owns Superseded via separate supersession acts (R64–R72).
 */
export type GpraValidityPosture = "retention" | "invalidated" | "superseded";

/** PVTA IT families (R56) — machine encodings of IT-1 / IT-2 / IT-3. */
export type InvalidationTriggerFamily =
  | "governing_law_failure"
  | "material_compliance_boundary_change"
  | "post_grant_discovered_non_compliance";

export type InvalidationAuthorityConstitutionalScope =
  | "production_obligation"
  | "production_program";

export type InvalidationAuthorityClassId =
  | "invalidation_authority_production_obligation_scope"
  | "invalidation_authority_production_program_scope";

/**
 * Separate governed invalidation act establishing GPRA Invalidated posture (R54–R59).
 * Does not mutate GpraGrantRecord; additive and historically preservative (R55, R60).
 */
export interface GpraInvalidationActRecord {
  readonly invalidationActId: GpraInvalidationActId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly itFamily: InvalidationTriggerFamily;
  /**
   * For IT-2: must be true — propagated CB change renders GPRA-bound RVA non-compliant
   * under Production Obligation scope (R58). Null for IT-1 / IT-3.
   */
  readonly materialNonComplianceEstablished: true | null;
  readonly triggeringGoverningSourceId: string;
  readonly constitutionalEvidence: string;
  readonly authorityClassId: InvalidationAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-014-007";
  readonly invalidatedAt: string;
  readonly invalidatedBy: string;
  readonly historicalGrantPreserved: true;
  readonly determinationNotRevised: true;
  readonly notLifecycleTermination: true;
  readonly forwardHandoffEligibilityTerminated: true;
  readonly newIntakeAuthorityTerminated: true;
  readonly cannotSilentlyReactivate: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

// --- G9 GPRA Supersession and Succession (R64–R72) ---

export type GpraSupersessionActId = string & { readonly __brand: "GpraSupersessionActId" };

/** ST families (R66) — machine encodings of ST-1 / ST-2 / ST-3. */
export type SupersessionTriggerFamily =
  | "replacement_gpra_grant"
  | "authoritative_succession_rule"
  | "context_rebinding";

export type SupersessionAuthorityConstitutionalScope =
  | "production_obligation"
  | "production_program";

export type SupersessionAuthorityClassId =
  | "supersession_authority_production_obligation_scope"
  | "supersession_authority_production_program_scope";

/**
 * Separate governed supersession act establishing GPRA Superseded posture for the
 * predecessor in a handoff consumer context (R64–R71). Does not mutate GpraGrantRecord;
 * additive and historically preservative (R65). Not invalidation (R70) and not lifecycle
 * termination. Does not establish withdrawal/suspension/third-revocation posture (R72).
 */
export interface GpraSupersessionActRecord {
  readonly supersessionActId: GpraSupersessionActId;
  readonly predecessorGpraId: GpraId;
  readonly successorGpraId: GpraId;
  readonly predecessorApprovalActId: ApprovalActId;
  readonly successorApprovalActId: ApprovalActId;
  readonly predecessorReviewId: ProductionReadinessReviewId;
  readonly successorReviewId: ProductionReadinessReviewId;
  readonly predecessorDeterminationId: ReviewDeterminationId;
  readonly successorDeterminationId: ReviewDeterminationId;
  readonly predecessorRvaId: RealizedVisualArtifactId;
  readonly successorRvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  /** Successor obligation; ST-1/ST-2 require match with predecessor (R69). */
  readonly obligationId: ProductionObligationId;
  readonly stFamily: SupersessionTriggerFamily;
  /**
   * Opaque handoff consumer context identifier (R69). Catalog deferred to G11 —
   * do not invent catalog membership here. For ST-3, this is the superseded context.
   */
  readonly handoffConsumerContextId: string;
  readonly triggeringGoverningSourceId: string;
  readonly constitutionalEvidence: string;
  readonly authorityClassId: SupersessionAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-014-014";
  readonly supersededAt: string;
  readonly supersededBy: string;
  readonly historicalPredecessorPreserved: true;
  readonly determinationNotRevised: true;
  readonly notLifecycleTermination: true;
  readonly notInvalidation: true;
  readonly predecessorForwardAuthorityTerminatedInContext: true;
  readonly successorAuthoritativeInContext: true;
  readonly cannotOverwritePredecessor: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * Constitutional distinction: historical GPRA grant record vs forward-active force (R52–R53, R60–R62, R70–R71).
 */
export interface GpraValidityAssessment {
  readonly gpraId: GpraId;
  readonly posture: GpraValidityPosture;
  /** True only under forward-active Retention. */
  readonly forwardActive: boolean;
  readonly invalidationActId: GpraInvalidationActId | null;
  readonly supersessionActId: GpraSupersessionActId | null;
  readonly newHandoffEligibility: boolean;
  readonly newIntakeAuthority: boolean;
}

// --- G10 Brain and Decision-Stage Interaction (R73–R82) ---

export type Domain3BrainAdvisoryId = string & {
  readonly __brand: "Domain3BrainAdvisoryId";
};

/** DSIB Decision-stage catalog (R77). */
export type Domain3DecisionStage =
  | "pre_review"
  | "active_review"
  | "completed_review"
  | "approval_consideration"
  | "gpra_grant_consumed"
  | "retention"
  | "invalidated"
  | "superseded"
  | "downstream_disposition"
  | "handoff_preparation";

/** BOCM permitted output classes (R75). */
export type Domain3BrainOutputClass =
  | "evidence_consumption_analysis"
  | "evaluative_treatment"
  | "nonbinding_recommendation"
  | "inconsistency_detection_signal"
  | "routing_suggestion"
  | "nonbinding_reevaluation_request";

/** BRRM reevaluation request types (R80). */
export type Domain3BrainReevaluationRequestType =
  | "new_review"
  | "re_review"
  | "downstream_correction"
  | "rework_authorization_review"
  | "invalidation_review"
  | "supersession_review"
  | "approval_reconsideration"
  | "handoff_eligibility_review";

/** BRRM governed authority route kinds (R80). */
export type Domain3BrainAuthorityRouteKind =
  | "reviewer_path"
  | "ddac"
  | "dsra"
  | "ivac"
  | "ssac"
  | "magac"
  | "handoff_authority_boundary";

/** BRPAM source attribution — Brain Runtime or Writing Engine only (R78). */
export type Domain3BrainSourceAttribution = "brain_runtime" | "writing_engine";

/**
 * Append-only nonbinding Brain advisory operational record (BRPAM R78).
 * Never constitutional authority; never Determination / Approval / GPRA / posture act.
 */
export interface Domain3BrainAdvisoryRecord {
  readonly advisoryId: Domain3BrainAdvisoryId;
  readonly sourceAttribution: Domain3BrainSourceAttribution;
  /** Event time distinct from constitutional act time. */
  readonly eventTime: string;
  readonly brainRuntimeVersion: string;
  readonly decisionStage: Domain3DecisionStage;
  readonly outputClass: Domain3BrainOutputClass;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly rvaId: RealizedVisualArtifactId;
  /** Optional at pre_review entry context only; required for other stages. */
  readonly reviewId: ProductionReadinessReviewId | null;
  readonly evidenceIds: readonly ReviewEvidenceId[];
  readonly determinationId: ReviewDeterminationId | null;
  readonly gpraId: GpraId | null;
  readonly postureState: GpraValidityPosture | null;
  readonly advisoryContent: string;
  /** Required iff outputClass is nonbinding_reevaluation_request. */
  readonly reevaluationRequestType: Domain3BrainReevaluationRequestType | null;
  /** Required iff outputClass is nonbinding_reevaluation_request. */
  readonly routesToAuthorityKind: Domain3BrainAuthorityRouteKind | null;
  readonly doesNotAuthorize: true;
  readonly nonbinding: true;
  readonly notConstitutionalAuthority: true;
  readonly distinguishableFromConstitutionalActs: true;
  readonly doesNotCompelConstitutionalAction: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

// --- G11 Governed Handoff Preparation / STD-015 Consumption Boundary (R83–R95) ---

export type GovernedHandoffPreparationId = string & {
  readonly __brand: "GovernedHandoffPreparationId";
};

/** HCBM consumer-category boundary keys (R89) — abstract classes only. */
export type HandoffConsumerCategoryKey =
  | "manufacturing"
  | "production"
  | "catalog"
  | "fulfillment"
  | "publication"
  | "distribution"
  | "archival";

/** HSLM eligibility-layer condition (R90) — distinct from STD-015 act states. */
export type HandoffEligibilityLayerCondition =
  | "not_export_ready"
  | "export_ready"
  | "blocked";

/** Historical preparation currency vs current authoritative posture (R88). */
export type HandoffPreparationCurrency = "current" | "stale";

/**
 * HVEM validity export snapshot (R88) — evaluation-point identity for stale detection.
 * Not a new validity act and not authorization.
 */
export interface HandoffValidityExportSnapshot {
  readonly evaluationPoint: {
    readonly gpraId: GpraId;
    readonly posture: GpraValidityPosture;
    readonly obligationId: ProductionObligationId;
    readonly handoffConsumerContextId: string;
  };
  readonly authoritativeGpraId: GpraId;
  readonly successorGpraId: GpraId | null;
  readonly forwardHandoffEligibility: boolean;
  readonly approvalActId: ApprovalActId;
  readonly gpraGrantRef: GpraId;
  readonly invalidationActId: GpraInvalidationActId | null;
  readonly supersessionActId: GpraSupersessionActId | null;
}

/**
 * HEPM evidence package (R87) — read-only references; does not rewrite sources.
 */
export interface HandoffEvidencePackageRefs {
  readonly rvaId: RealizedVisualArtifactId;
  readonly determinationId: ReviewDeterminationId;
  readonly approvalActId: ApprovalActId;
  readonly gpraId: GpraId;
  readonly obligationId: ProductionObligationId;
  readonly posture: GpraValidityPosture;
  /** Optional G7 disposition ids where material. */
  readonly dispositionRecordIds: readonly string[];
  /** G9 supersession lineage where applicable. */
  readonly supersessionActId: GpraSupersessionActId | null;
  readonly unresolvedBlockers: readonly string[];
  readonly handoffConsumerContextId: string;
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  /** Optional G10 BRPAM advisory ids (advisory only). */
  readonly brainAdvisoryIds: readonly Domain3BrainAdvisoryId[];
}

/**
 * Non-persisting HEIM eligibility assessment (R85) — may be *considered*; not authorization.
 */
export interface GovernedHandoffEligibilityAssessment {
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition;
  readonly gpraId: GpraId | null;
  readonly validityExport: HandoffValidityExportSnapshot | null;
  readonly evidencePackage: HandoffEvidencePackageRefs | null;
  readonly forwardHandoffEligibility: boolean;
  readonly notHandoffAuthorization: true;
  readonly notHandoffExecution: true;
  readonly notHandoffPostureDeclaration: true;
  readonly std015ConsumptionBoundaryOnly: true;
  readonly reasons: readonly string[];
}

/**
 * HPAM additive immutable preparation record (R83–R95).
 * Preparation only — STD-015 owns authorization/execution. Never overwrites history.
 */
export interface GovernedHandoffPreparationRecord {
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  /** Persisted preparations are only created when export_ready (R90/R94). */
  readonly eligibilityLayerCondition: "export_ready";
  readonly validityExport: HandoffValidityExportSnapshot;
  readonly evidencePackage: HandoffEvidencePackageRefs;
  readonly brainAdvisoryIds: readonly Domain3BrainAdvisoryId[];
  readonly forwardHandoffEligibility: true;
  readonly notHandoffAuthorization: true;
  readonly notHandoffExecution: true;
  readonly notHandoffPostureDeclaration: true;
  readonly std015ConsumptionBoundaryOnly: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly preparedAt: string;
  readonly preparedBy: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Domain3GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

// --- STD-015 HOF-G1 Upstream Entry (R01–R07) ---

export type GovernedHandoffEntryId = string & {
  readonly __brand: "GovernedHandoffEntryId";
};

/** R05 deferred principal subjects — G1 only records consideration may commence. */
export type HandoffDeferredPrincipalSubject =
  | "handoff_authorization"
  | "handoff_posture_declaration"
  | "handoff_act_lifecycle"
  | "handoff_recall_withdrawal_suspension"
  | "handoff_evidence_consumption_at_authorization_boundary"
  | "auditable_transition_rules";

/** R01 permanent HOF-P distinctions preserved at entry (P1–P6, P9–P10). */
export type HandoffHofPDistinctionId =
  | "HOF-P1"
  | "HOF-P2"
  | "HOF-P3"
  | "HOF-P4"
  | "HOF-P5"
  | "HOF-P6"
  | "HOF-P9"
  | "HOF-P10";

/** Historical entry currency vs current preparation posture (optional; history remains loadable). */
export type HandoffEntryCurrency = "current" | "stale";

/**
 * Non-persisting R07 entry assessment — mayCommence means consideration may begin;
 * never authorization, posture, or execution.
 */
export interface GovernedHandoffEntryAssessment {
  readonly mayCommence: boolean;
  readonly preparationId: GovernedHandoffPreparationId | null;
  readonly gpraId: GpraId | null;
  readonly reasons: readonly string[];
  readonly considerationMayCommence: true;
  readonly notHandoffAuthorization: true;
  readonly notHandoffExecution: true;
  readonly notHandoffPostureDeclaration: true;
  readonly doesNotPerformG11Preparation: true;
  readonly doesNotGrantGpraOrApproval: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotBindConsumerClassCatalog: true;
  readonly hofG1Only: true;
  readonly std015HofG1EntryBoundaryOnly: true;
  readonly deferredPrincipalSubjects: readonly HandoffDeferredPrincipalSubject[];
  readonly hofPDistinctionsPreserved: readonly HandoffHofPDistinctionId[];
  readonly r01InheritanceLock: true;
  readonly r02DoesNotWeakenStd012Or013: true;
  readonly r03MfgComplianceBoundaryContextOnly: true;
  readonly r04DecisionStagePolicyOnly: true;
  readonly r05PrincipalSubjectsDeferred: true;
  readonly r06DoesNotPerformReviewApprovalGpraOrG11Prep: true;
}

/**
 * Additive immutable Governed Handoff entry record (HOF-G1 R01–R07).
 * Entry gate only — does not authorize Handoff, declare Posture, or execute.
 * Historical entries remain loadable after later GPRA invalidation.
 */
export interface GovernedHandoffEntryRecord {
  readonly entryId: GovernedHandoffEntryId;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  /** Copied from preparation — abstract HCBM keys only; HOF-G3 binding deferred. */
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly preparationCurrencyAtEntry: "current";
  readonly eligibilityLayerConditionConsumed: "export_ready";
  readonly considerationMayCommence: true;
  readonly notHandoffAuthorization: true;
  readonly notHandoffExecution: true;
  readonly notHandoffPostureDeclaration: true;
  readonly doesNotPerformG11Preparation: true;
  readonly doesNotGrantGpraOrApproval: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotBindConsumerClassCatalog: true;
  readonly hofG1Only: true;
  readonly std015HofG1EntryBoundaryOnly: true;
  readonly deferredPrincipalSubjects: readonly HandoffDeferredPrincipalSubject[];
  readonly hofPDistinctionsPreserved: readonly HandoffHofPDistinctionId[];
  readonly r01InheritanceLock: true;
  readonly r02DoesNotWeakenStd012Or013: true;
  readonly r03MfgComplianceBoundaryContextOnly: true;
  readonly r04DecisionStagePolicyOnly: true;
  readonly r05PrincipalSubjectsDeferred: true;
  readonly r06DoesNotPerformReviewApprovalGpraOrG11Prep: true;
  readonly enteredAt: string;
  /** Governed actor string — not an authority class. */
  readonly enteredBy: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

// --- STD-015 HOF-G7 Evidence and Validity Consumption (R08–R15) ---

export type GovernedHandoffEvidenceConsumptionId = string & {
  readonly __brand: "GovernedHandoffEvidenceConsumptionId";
};

/**
 * R08 — four peer-distinct evidence models (catalog only; no substitution).
 * hepm / hvem / hoem / advisory remain distinct; HOEM is framework-only in G7.
 */
export type HandoffEvidenceModelId = "hepm" | "hvem" | "hoem" | "advisory";

/**
 * R11 — deferred HOEM operative record classes (framework catalog only).
 * Does NOT create authorization/posture/completion/suspension/recall/withdrawal act instances.
 */
export type DeferredHoemOperativeRecordClass =
  | "authorization"
  | "posture_declaration"
  | "completion"
  | "suspension"
  | "recall"
  | "withdrawal";

/** Historical consumption currency vs current entry/prep posture. */
export type HandoffEvidenceConsumptionCurrency = "current" | "stale";

/**
 * Non-persisting R08–R15 consumption assessment — mayConsume means evidence/validity
 * may be consumed for consideration; never authorization, posture, or execution.
 */
export interface GovernedHandoffEvidenceConsumptionAssessment {
  readonly mayConsume: boolean;
  readonly entryId: GovernedHandoffEntryId | null;
  readonly preparationId: GovernedHandoffPreparationId | null;
  readonly gpraId: GpraId | null;
  readonly reasons: readonly string[];
  readonly evidenceModelsPreserved: readonly HandoffEvidenceModelId[];
  readonly deferredHoemOperativeRecordClasses: readonly DeferredHoemOperativeRecordClass[];
  readonly upstreamFreshnessAtConsumption: "current" | null;
  readonly hepmReferencesAvailable: boolean;
  readonly hvemFactsCurrent: boolean;
  readonly factualInputsToConsiderationOnly: true;
  readonly notHandoffAuthorization: true;
  readonly notHandoffExecution: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notEvidenceOfHandoffAuthorization: true;
  readonly notEvidenceOfHandoffPostureDeclaration: true;
  readonly doesNotElevateAdvisoryToConstitutionalFact: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly hoemFrameworkOnly: true;
  readonly doesNotCreateOperativeHandoffActRecords: true;
  readonly fourModelsPeerDistinct: true;
  readonly r08FourPeerDistinctEvidenceModels: true;
  readonly r09HepmReadOnlyConsumption: true;
  readonly r10HvemEvaluationPointConsumption: true;
  readonly r11HoemFrameworkOnly: true;
  readonly r12AdvisoryNonbinding: true;
  readonly r13EligibilityNotAuthorization: true;
  readonly r14UpstreamFreshnessRequired: true;
  readonly r15NoInventedConstitutionalQueueOrSchema: true;
}

/**
 * Additive immutable Governed Handoff evidence/validity consumption record (HOF-G7 R08–R15).
 * Consumes G1 entry + G11 HEPM/HVEM for consideration only.
 * Does NOT authorize Handoff, declare Posture, create HOEM act instances, or execute.
 */
export interface GovernedHandoffEvidenceConsumptionRecord {
  readonly consumptionId: GovernedHandoffEvidenceConsumptionId;
  readonly entryId: GovernedHandoffEntryId;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  /** R09 — frozen HEPM refs copied from preparation.evidencePackage (read-only). */
  readonly hepmRefs: HandoffEvidencePackageRefs;
  /** R10 — frozen HVEM snapshot copied from preparation.validityExport. */
  readonly hvemSnapshot: HandoffValidityExportSnapshot;
  /** R10 — evaluation-point identity for stale detection. */
  readonly hvemEvaluationPoint: HandoffValidityExportSnapshot["evaluationPoint"];
  readonly evidenceModelsPreserved: readonly HandoffEvidenceModelId[];
  readonly deferredHoemOperativeRecordClasses: readonly DeferredHoemOperativeRecordClass[];
  readonly brainAdvisoryIds: readonly Domain3BrainAdvisoryId[];
  readonly upstreamFreshnessAtConsumption: "current";
  readonly hepmReferencesAvailable: true;
  readonly hvemFactsCurrent: true;
  readonly factualInputsToConsiderationOnly: true;
  readonly notHandoffAuthorization: true;
  readonly notHandoffExecution: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notEvidenceOfHandoffAuthorization: true;
  readonly notEvidenceOfHandoffPostureDeclaration: true;
  readonly doesNotElevateAdvisoryToConstitutionalFact: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly hoemFrameworkOnly: true;
  readonly doesNotCreateOperativeHandoffActRecords: true;
  readonly fourModelsPeerDistinct: true;
  readonly r08FourPeerDistinctEvidenceModels: true;
  readonly r09HepmReadOnlyConsumption: true;
  readonly r10HvemEvaluationPointConsumption: true;
  readonly r11HoemFrameworkOnly: true;
  readonly r12AdvisoryNonbinding: true;
  readonly r13EligibilityNotAuthorization: true;
  readonly r14UpstreamFreshnessRequired: true;
  readonly r15NoInventedConstitutionalQueueOrSchema: true;
  readonly consumedAt: string;
  /** Governed actor string — not an authority class. */
  readonly consumedBy: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}
