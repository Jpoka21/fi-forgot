/**
 * Domain 3 constitutional types — FI-DSN-STD-014 G2–G11
 * (Review entry through Governed Handoff Preparation / STD-015 consumption boundary).
 */

import type { Domain3GovernanceTraceability } from "./domain3-authority.js";
import type {
  Std015GovernanceTraceability,
  Std015RequirementId,
} from "./std015-authority.js";
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

// --- STD-015 HOF-G10 Preservation and Audit (R16–R21) ---

export type GovernedHandoffPreservationAuditId = string & {
  readonly __brand: "GovernedHandoffPreservationAuditId";
};

/**
 * R16 / R20 — deferred operative audit classes (framework catalog only).
 * Does NOT create authorization/posture/completion/suspension/recall/withdrawal act instances.
 */
export type DeferredOperativeAuditClass =
  | "authorization"
  | "posture_declaration"
  | "completion"
  | "suspension"
  | "recall"
  | "withdrawal";

/**
 * History ≠ current authority — preservation audit never restores constitutional force.
 * Always `"historical_only"`; never `"restores_authority"`.
 */
export type HandoffPreservationAuditAuthorityEffect = "historical_only";

/**
 * Optional linked-currency view: reports G1/G7 currency separately without elevating preservation.
 */
export interface HandoffPreservationAuditLinkedCurrency {
  readonly authorityEffect: HandoffPreservationAuditAuthorityEffect;
  readonly doesNotRestoreConstitutionalForce: true;
  readonly linkedEntryCurrency: HandoffEntryCurrency;
  readonly linkedConsumptionCurrency: HandoffEvidenceConsumptionCurrency;
  readonly preservationAuditId: GovernedHandoffPreservationAuditId;
}

/**
 * Additive immutable Governed Handoff preservation audit record (HOF-G10 R16–R21).
 * Preserves consideration history (and framework for future operative acts) without
 * restoring force, overwriting upstream, collapsing G11 prep history, or creating HOEM acts.
 */
export interface GovernedHandoffPreservationAuditRecord {
  readonly preservationAuditId: GovernedHandoffPreservationAuditId;
  /** G1 — required; must exist historically even if now stale. */
  readonly entryId: GovernedHandoffEntryId;
  /** G7 — required for R20 reconstruction of HEPM/HVEM consumption. */
  readonly evidenceConsumptionId: GovernedHandoffEvidenceConsumptionId;
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
  /** Provenance only — copied from consumption; nonbinding. */
  readonly brainAdvisoryIds: readonly Domain3BrainAdvisoryId[];
  readonly deferredOperativeAuditClasses: readonly DeferredOperativeAuditClass[];
  readonly historicalPreservationOnly: true;
  readonly doesNotRestoreConstitutionalForce: true;
  readonly doesNotOverwriteUpstreamConstitutionalRecords: true;
  readonly doesNotCollapsePreparationAndOperativeHistory: true;
  readonly doesNotAuthorizeErasureOrRedaction: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly hpamExtensionFrameworkOnly: true;
  readonly doesNotCreateOperativeHoemActRecords: true;
  readonly evidencePackageIsNotErasureAuthorization: true;
  readonly r16AdditiveHistoricalPreservation: true;
  readonly r17NoOverwriteUpstreamConstitutionalRecords: true;
  readonly r18HpamExtensionFrameworkOnly: true;
  readonly r19HistoryRemainsLoadableAfterInvalidation: true;
  readonly r20AuditableConsiderationEvents: true;
  readonly r21EvidencePackageIsNotErasureAuthorization: true;
  readonly preservedAt: string;
  /** Governed actor string — NOT a preservation authority class. */
  readonly preservedBy: string;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

// --- STD-015 HOF-G9 Partial Authority Prohibitions (R22–R24) ---

/**
 * Sole Handoff authorization authority class acknowledged at R24 (PD-STD-015-001).
 * Framework acknowledgment only — operative HGA authorization acts are R25+ (HOF-G2).
 */
export type HandoffGovernanceAuthorityClassId = "handoff_governance_authority";

/**
 * R24 peer-distinct constitutional decision classes — must not collapse into one another.
 */
export type HandoffPeerDistinctDecisionClass =
  | "handoff_eligibility"
  | "handoff_authorization"
  | "handoff_posture_declaration"
  | "handoff_act_completion"
  | "handoff_recall"
  | "handoff_withdrawal"
  | "handoff_suspension"
  | "downstream_acceptance"
  | "permanent_collection_membership"
  | "manufacturing_validation_and_execution";

/**
 * R24 HAAM — upstream / non-Handoff domains that MUST NOT be assigned Handoff authorization.
 */
export type HaamProhibitedHandoffAuthorizationAssignee =
  | "magac_approval_authority"
  | "ddac_downstream_disposition"
  | "dsra_rework_authorization"
  | "ivac_invalidation_authority"
  | "ssac_supersession_authority"
  | "brain_domain3"
  | "g11_export_contract"
  | "downstream_consumer_domain";

/**
 * R23 — STD-014 subjects that remain exclusive principal authority (non-absorption).
 */
export type Std014NonabsorbedAuthoritySubject =
  | "review"
  | "review_determination"
  | "approval"
  | "approval_withholding"
  | "gpra_grant"
  | "invalidated_posture"
  | "superseded_posture"
  | "ddac_downstream_disposition"
  | "dsra_rework_authorization"
  | "g11_handoff_preparation";

/**
 * R22 — Brain may only occupy these roles at the Handoff boundary.
 */
export type BrainPermittedHandoffRole =
  | "constitutional_input_consumer"
  | "evidence_and_posture_evaluator"
  | "advisory_treatment_recommender"
  | "routing_participant";

/**
 * R22 — Brain SHALL NOT perform these Handoff acts.
 */
export type BrainProhibitedHandoffAct =
  | "authorize_handoff"
  | "declare_handoff_posture"
  | "complete_handoff"
  | "recall_handoff"
  | "withdraw_handoff"
  | "suspend_handoff"
  | "reenter_handoff"
  | "resume_handoff"
  | "terminate_downstream_reliance";

/**
 * Framework-only HOF-G9 authority-boundary assessment (R22–R24).
 * Does NOT authorize Handoff, create HGA acts, or absorb STD-014 authority.
 */
export interface HandoffAuthorityBoundaryAssessment {
  readonly brainMayAuthorizeHandoff: false;
  readonly brainMayDeclareHandoffPosture: false;
  readonly brainMayCompleteHandoff: false;
  readonly brainMayRecallWithdrawOrSuspendHandoff: false;
  readonly brainMayReenterOrResumeHandoff: false;
  readonly brainMayElevateAdvisoryToOperativeHoemEvidence: false;
  readonly brainPermittedRolesOnly: true;
  readonly std014AuthorityNotAbsorbed: true;
  readonly haamProhibitionsPreserved: true;
  readonly peerDistinctDecisionClassesPreserved: true;
  readonly hgaAcknowledgedAsSoleHandoffAuthorizationClass: true;
  readonly doesNotInventAdditionalHandoffAuthorizationClass: true;
  readonly doesNotCreateOperativeHgaAuthorizationActs: true;
  readonly operativeHgaAuthorizationActsDeferredToR25: true;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly r22BrainNonauthorityAtHandoff: true;
  readonly r23Std014Nonabsorption: true;
  readonly r24HaamPeerDistinctHgaAcknowledgment: true;
  readonly peerDistinctDecisionClasses: readonly HandoffPeerDistinctDecisionClass[];
  readonly haamProhibitedAssignees: readonly HaamProhibitedHandoffAuthorizationAssignee[];
  readonly std014NonabsorbedSubjects: readonly Std014NonabsorbedAuthoritySubject[];
  readonly brainPermittedRoles: readonly BrainPermittedHandoffRole[];
  readonly brainProhibitedActs: readonly BrainProhibitedHandoffAct[];
  readonly acknowledgedHandoffGovernanceAuthorityClassId: HandoffGovernanceAuthorityClassId;
  readonly traceability: Std015GovernanceTraceability;
}

// --- STD-015 HOF-G2 Operative Handoff Authorization (R25–R32) ---

/** Closed HCCM catalog IDs — PD-STD-015-002 / Section 20.5.4.7; consumed by R28. */
export type HccmConsumerClassId =
  | "CC-01"
  | "CC-02"
  | "CC-03"
  | "CC-04"
  | "CC-05"
  | "CC-06";

export type GovernedHandoffAuthorizationActId = string & {
  readonly __brand: "GovernedHandoffAuthorizationActId";
};

export type HoemAuthorizationOperativeRecordId = string & {
  readonly __brand: "HoemAuthorizationOperativeRecordId";
};

/**
 * R29 — additive HOEM authorization operative record (authorization act type only).
 * Peer-distinct from posture/completion/suspension/recall/withdrawal HOEM records.
 */
export interface HoemAuthorizationOperativeRecord {
  readonly hoemAuthorizationRecordId: HoemAuthorizationOperativeRecordId;
  readonly authorizationActId: GovernedHandoffAuthorizationActId;
  readonly actType: "authorization";
  readonly gpraId: GpraId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerClassId: HccmConsumerClassId;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly doesNotMergePostureDeclarationAttribution: true;
  readonly doesNotMergeCompletionAttribution: true;
  readonly doesNotMergeSuspensionAttribution: true;
  readonly doesNotMergeWithdrawalAttribution: true;
  readonly doesNotMergeRecallAttribution: true;
}

export type HandoffAuthorizationCurrency = "current" | "stale";

/**
 * Assessment for whether a lawful HGA authorization act may be performed.
 */
export interface GovernedHandoffAuthorizationAssessment {
  readonly mayAuthorize: boolean;
  readonly denialReasons: readonly string[];
  readonly authorityClassId: HandoffGovernanceAuthorityClassId | null;
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly consumptionCurrency: HandoffEvidenceConsumptionCurrency | null;
  readonly preparationCurrency: HandoffPreparationCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly notCompletionSuspensionRecallOrWithdrawal: true;
  readonly substitutesRejected: true;
}

/**
 * Operative HGA Handoff authorization act — FI-DSN-STD-015-R25–R32.
 * Does NOT declare posture, complete, suspend, recall, withdraw, or execute Handoff.
 */
export interface GovernedHandoffAuthorizationActRecord {
  readonly authorizationActId: GovernedHandoffAuthorizationActId;
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-015-001";
  readonly authorityConstitutionalScope: "handoff_authorization_act";
  /** Attributable actor within HGA scope — not the authority class itself. */
  readonly authorizedBy: string;
  readonly authorizedAt: string;
  readonly entryId: GovernedHandoffEntryId;
  readonly evidenceConsumptionId: GovernedHandoffEvidenceConsumptionId;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerClassId: HccmConsumerClassId;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly hoemAuthorizationRecord: HoemAuthorizationOperativeRecord;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly notHandoffCompletion: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffRecall: true;
  readonly notHandoffWithdrawal: true;
  readonly notDownstreamAcceptance: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotCollapsePeerDecisionClasses: true;
  readonly doesNotSubstituteGpraOrEligibilityOrAdvisory: true;
  readonly r25HgaSoleAuthorizationOwner: true;
  readonly r26PeerDistinctAuthorizationClass: true;
  readonly r27NoSubstituteInputs: true;
  readonly r28BoundHccmConsumerContext: true;
  readonly r29HoemAuthorizationOperativeRecord: true;
  readonly r30NoImplicitAuthorization: true;
  readonly r31PrerequisiteGated: true;
  readonly r32HaamProhibitedPerformersExcluded: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

// --- STD-015 HOF-G3 Consumer Class Catalog and Binding (R33–R39) ---

export type GovernedHandoffConsumerBindingId = string & {
  readonly __brand: "GovernedHandoffConsumerBindingId";
};

export type HandoffConsumerBindingCurrency = "current" | "stale";

/**
 * Assessment for whether a lawful HCCM consumer class binding may be recorded.
 * Binding is eligibility/entry-gated (R39) and is NOT Handoff authorization (R38).
 */
export interface GovernedHandoffConsumerBindingAssessment {
  readonly mayBind: boolean;
  readonly denialReasons: readonly string[];
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly preparationCurrency: HandoffPreparationCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly notDownstreamAcceptance: true;
  readonly notPermanentCollectionMembership: true;
  readonly catalogClosedCc01ThroughCc06: true;
}

/**
 * Operative HCCM consumer class binding — FI-DSN-STD-015-R33–R39.
 * Identifies the constitutional consideration target for HGA acts.
 * Does NOT authorize Handoff, declare posture, accept downstream, or execute.
 */
export interface GovernedHandoffConsumerBindingRecord {
  readonly bindingId: GovernedHandoffConsumerBindingId;
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
  readonly consumerClassId: HccmConsumerClassId;
  readonly constitutionalConsumerClass: string;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly postureClassAffinity:
    | "library_intake_posture"
    | "production_catalog_posture"
    | "none";
  readonly downstreamConsiderationDomain: string;
  /** Entry export keys (HCBM abstract) — binding selects CC; keys alone do not mint CC (R37). */
  readonly entryConsumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly boundBy: string;
  readonly boundAt: string;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffCompletion: true;
  readonly notDownstreamAcceptance: true;
  readonly notPermanentCollectionMembership: true;
  readonly notOperationalIntake: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotInferCc01VsCc02FromHcbmAlone: true;
  readonly r33ClosedHccmCatalog: true;
  readonly r34HcbmMappedToSelectedCc: true;
  readonly r35BoundConsumerContextTuple: true;
  readonly r36SingleCcPerBinding: true;
  readonly r37Cc01Cc02CatalogDisambiguation: true;
  readonly r38NotAuthorizationOrPostureOrIntake: true;
  readonly r39EligibilityGatedClosedCatalog: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

// --- STD-015 HOF-G4 Operative Handoff Posture Declaration (R40–R47) ---

/**
 * Frozen Handoff posture classes — Volume 06 §12.2 / HPPM affinity vocabulary.
 * `none` is catalog affinity for CC-03–CC-06 bound contexts (not an invented lifecycle label).
 */
export type HandoffPostureClass =
  | "library_intake_posture"
  | "production_catalog_posture"
  | "none";

export type GovernedHandoffPostureDeclarationActId = string & {
  readonly __brand: "GovernedHandoffPostureDeclarationActId";
};

export type HoemPostureDeclarationOperativeRecordId = string & {
  readonly __brand: "HoemPostureDeclarationOperativeRecordId";
};

/**
 * R45 — additive HOEM posture declaration operative record (posture_declaration act type only).
 * Peer-distinct from authorization/completion/suspension/recall/withdrawal HOEM records.
 */
export interface HoemPostureDeclarationOperativeRecord {
  readonly hoemPostureDeclarationRecordId: HoemPostureDeclarationOperativeRecordId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId;
  readonly actType: "posture_declaration";
  readonly gpraId: GpraId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly consumerClassId: HccmConsumerClassId;
  readonly declaredPostureClass: HandoffPostureClass;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly doesNotMergeAuthorizationAttribution: true;
  readonly doesNotMergeCompletionAttribution: true;
  readonly doesNotMergeSuspensionAttribution: true;
  readonly doesNotMergeWithdrawalAttribution: true;
  readonly doesNotMergeRecallAttribution: true;
}

export type HandoffPostureDeclarationCurrency = "current" | "stale";

/**
 * Assessment for whether a lawful HGA posture declaration act may be performed.
 */
export interface GovernedHandoffPostureDeclarationAssessment {
  readonly mayDeclare: boolean;
  readonly denialReasons: readonly string[];
  readonly authorityClassId: HandoffGovernanceAuthorityClassId | null;
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly bindingCurrency: HandoffConsumerBindingCurrency | null;
  readonly preparationCurrency: HandoffPreparationCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly declaredPostureClass: HandoffPostureClass | null;
  readonly notHandoffAuthorization: true;
  readonly notHandoffCompletion: true;
  readonly notHandoffExecution: true;
  readonly notCompletionSuspensionRecallOrWithdrawal: true;
  readonly substitutesRejected: true;
}

/**
 * Operative HGA Handoff posture declaration act — FI-DSN-STD-015-R40–R47.
 * Does NOT authorize, complete, suspend, recall, withdraw, or execute Handoff.
 */
export interface GovernedHandoffPostureDeclarationActRecord {
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId;
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-015-001";
  readonly authorityConstitutionalScope: "handoff_posture_declaration_act";
  /** Attributable actor within HGA scope — not the authority class itself. */
  readonly declaredBy: string;
  readonly declaredAt: string;
  readonly entryId: GovernedHandoffEntryId;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerClassId: HccmConsumerClassId;
  readonly declaredPostureClass: HandoffPostureClass;
  /** Catalog affinity metadata from the binding — distinct from the operative declaration act. */
  readonly postureClassAffinity: HandoffPostureClass;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly hoemPostureDeclarationRecord: HoemPostureDeclarationOperativeRecord;
  readonly notHandoffAuthorization: true;
  readonly notHandoffExecution: true;
  readonly notHandoffCompletion: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffRecall: true;
  readonly notHandoffWithdrawal: true;
  readonly notDownstreamAcceptance: true;
  readonly notPermanentCollectionMembership: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotCollapsePeerDecisionClasses: true;
  readonly doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory: true;
  readonly doesNotMergeAcrossConsumerClasses: true;
  readonly r40HgaSolePostureOwner: true;
  readonly r41PeerDistinctPostureClass: true;
  readonly r42NoSubstituteInputs: true;
  readonly r43BoundHccmConsumerContext: true;
  readonly r44NotAuthorizationSubstitute: true;
  readonly r45HoemPostureDeclarationOperativeRecord: true;
  readonly r46HppmAuthoritativeCardinality: true;
  readonly r47NoImplicitPostureEntryGated: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

// --- STD-015 HOF-G5 Baseline Handoff Act-Layer Lifecycle (R48–R57) ---

/**
 * Closed HSLM act-layer vocabulary — FI-DSN-STD-015-R48.
 * Suspended is projectable from an authoritative current HOF-G6-U2 suspension act (R84–R97).
 * Withdrawn/recalled/expired HSLM states; operative G6-U3 withdrawal and G6-U4 recall acts project lifecycle.
 */
export type HandoffActLayerLifecycleState =
  | "eligible_for_consideration"
  | "authorized"
  | "completed"
  | "rejected"
  | "suspended"
  | "withdrawn"
  | "recalled"
  | "expired";

export type GovernedHandoffCompletionActId = string & {
  readonly __brand: "GovernedHandoffCompletionActId";
};

export type HoemCompletionOperativeRecordId = string & {
  readonly __brand: "HoemCompletionOperativeRecordId";
};

export type HandoffCompletionCurrency = "current" | "stale";

export type GovernedHandoffSuspensionActId = string & {
  readonly __brand: "GovernedHandoffSuspensionActId";
};

export type HoemSuspensionOperativeRecordId = string & {
  readonly __brand: "HoemSuspensionOperativeRecordId";
};

export type HandoffSuspensionCurrency = "current" | "stale";

export type GovernedHandoffWithdrawalActId = string & {
  readonly __brand: "GovernedHandoffWithdrawalActId";
};

export type HoemWithdrawalOperativeRecordId = string & {
  readonly __brand: "HoemWithdrawalOperativeRecordId";
};

export type HandoffWithdrawalCurrency = "current" | "stale";

/**
 * Closed vocabulary for HOF-G6-U2 constitutional suspension basis (R85b / R89).
 * Free-text notes MUST NOT be the sole basis.
 */
export type SuspensionConstitutionalBasisKind =
  "temporary_forward_reliance_pause_warranted";

/**
 * R51 / R56 / §20.5.3.14 — additive HOEM completion operative record (completion act type only).
 * Peer-distinct from authorization/posture/suspension/recall/withdrawal HOEM records.
 */
export interface HoemCompletionOperativeRecord {
  readonly hoemCompletionRecordId: HoemCompletionOperativeRecordId;
  readonly completionActId: GovernedHandoffCompletionActId;
  readonly actType: "completion";
  readonly gpraId: GpraId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly consumerClassId: HccmConsumerClassId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId;
  readonly declaredPostureClass: HandoffPostureClass;
  readonly doesNotMergeAuthorizationAttribution: true;
  readonly doesNotMergePostureDeclarationAttribution: true;
  readonly doesNotMergeLifecycleAttribution: true;
  readonly doesNotMergeSuspensionAttribution: true;
  readonly doesNotMergeWithdrawalAttribution: true;
  readonly doesNotMergeRecallAttribution: true;
}

/**
 * Assessment for whether a lawful HGA completion act may be performed.
 */
export interface GovernedHandoffCompletionAssessment {
  readonly mayComplete: boolean;
  readonly denialReasons: readonly string[];
  readonly authorityClassId: HandoffGovernanceAuthorityClassId | null;
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly bindingCurrency: HandoffConsumerBindingCurrency | null;
  readonly postureDeclarationCurrency: HandoffPostureDeclarationCurrency | null;
  readonly preparationCurrency: HandoffPreparationCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly notDownstreamAcceptance: true;
  readonly notPermanentCollectionMembership: true;
  readonly notCompletionSuspensionRecallOrWithdrawalMechanics: true;
  readonly substitutesRejected: true;
}

/**
 * Operative HGA Handoff completion act — FI-DSN-STD-015-R48–R57 (Completed meaning; R51/R56).
 * Does NOT authorize, declare posture, suspend, recall, withdraw, accept downstream, or execute.
 */
export interface GovernedHandoffCompletionActRecord {
  readonly completionActId: GovernedHandoffCompletionActId;
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-015-001";
  readonly authorityConstitutionalScope: "handoff_completion_act";
  /** Attributable actor within HGA scope — not the authority class itself. */
  readonly completedBy: string;
  readonly completedAt: string;
  readonly entryId: GovernedHandoffEntryId;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerClassId: HccmConsumerClassId;
  readonly declaredPostureClass: HandoffPostureClass;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly hoemCompletionRecord: HoemCompletionOperativeRecord;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffRecall: true;
  readonly notHandoffWithdrawal: true;
  readonly notDownstreamAcceptance: true;
  readonly notPermanentCollectionMembership: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotCollapsePeerDecisionClasses: true;
  readonly doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory: true;
  readonly doesNotMergeAcrossConsumerClasses: true;
  readonly r48ClosedHslmVocabulary: true;
  readonly r49PeerDistinctLifecycle: true;
  readonly r50SingleBindingPostureChain: true;
  readonly r51CompletedMeaning: true;
  readonly r56HoemCompletionOperativeRecord: true;
  readonly r57NoImplicitLifecyclePromotion: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * Evaluation of baseline act-layer lifecycle state for one HCCM binding (R48–R57).
 *
 * Rejected remains in the R48 HSLM vocabulary and R51 meaning (withheld auth/posture),
 * but is not reachable via evaluate until G2/G4 encode constitutional withhold facts —
 * absence of authorization or posture must not invent Rejected (R57).
 */
export interface HandoffActLayerLifecycleEvaluation {
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly entryId: GovernedHandoffEntryId | null;
  readonly consumerClassId: HccmConsumerClassId | null;
  readonly currentState: HandoffActLayerLifecycleState | null;
  readonly authoritativeCompletionActId: GovernedHandoffCompletionActId | null;
  readonly authoritativeSuspensionActId: GovernedHandoffSuspensionActId | null;
  readonly authoritativeWithdrawalActId: GovernedHandoffWithdrawalActId | null;
  readonly authoritativeRecallActId: GovernedHandoffRecallActId | null;
  /** HERCM tips (R126–R139) — additive; they do not add HSLM states. */
  readonly authoritativeResumptionActId: GovernedHandoffResumptionActId | null;
  readonly authoritativeReentryActId: GovernedHandoffReentryActId | null;
  /** True when a current resumption tip supersedes the suspension tip for projection. */
  readonly resumptionClearsSuspendedProjection: boolean;
  /** True when a current re-entry tip supersedes withdrawn/recalled projection. */
  readonly reentryClearsCessationProjection: boolean;
  /** Always null at G5 — Rejected is not an HGA act tip and no G2/G4 withhold facts exist. */
  readonly authoritativeRejectionAttributionId: null;
  readonly authoritativePostureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly matchingAuthorizationActId: GovernedHandoffAuthorizationActId | null;
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly bindingCurrency: HandoffConsumerBindingCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffAcceptance: true;
  readonly notManufacturingClearance: true;
  readonly notG11EligibilityLayerState: true;
  readonly withdrawalRecallExpiredMechanicsDeferred: false;
  readonly recallExpiredMechanicsDeferred: false;
  readonly suspensionMechanicsOperative: true;
  readonly withdrawalMechanicsOperative: true;
  readonly recallMechanicsOperative: true;
  readonly hercmMechanicsOperative: true;
  readonly hslmRemainsEightStates: true;
  readonly noReenteredOrResumedHslmState: true;
  /** R140–R141 catalog integration is complete; the matrix has eight types. */
  readonly r140PlusUnavailable: false;
  /** R142+ exit-completeness and invented ninth/expiry/restoration acts remain deferred. */
  readonly r142PlusUnavailable: true;
  readonly r48ClosedHslmVocabulary: true;
  readonly r49PeerDistinctLifecycle: true;
  readonly r50SingleBindingPostureChain: true;
  readonly r57NoImplicitLifecyclePromotion: true;
}

/**
 * HOF-G8 partial R58–R65 — downstream exit BOUNDARY attribution (NOT an HGA matrix act).
 */
export type GovernedHandoffDownstreamExitBoundaryAttributionId = string & {
  readonly __brand: "GovernedHandoffDownstreamExitBoundaryAttributionId";
};

export type HoemExitBoundaryRecordId = string & {
  readonly __brand: "HoemExitBoundaryRecordId";
};

export type HandoffDownstreamExitBoundaryCurrency = "current" | "stale";

/**
 * R64 — additive HOEM exit-boundary evidence linkage.
 * Does NOT prescribe intake/acceptance/routing/storage/notification mechanics.
 */
export interface HoemExitBoundaryRecord {
  readonly hoemExitBoundaryRecordId: HoemExitBoundaryRecordId;
  readonly exitBoundaryAttributionId: GovernedHandoffDownstreamExitBoundaryAttributionId;
  readonly actType: "exit_boundary";
  readonly gpraId: GpraId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly consumerClassId: HccmConsumerClassId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId;
  readonly completionActId: GovernedHandoffCompletionActId;
  readonly downstreamConsiderationDomain: string;
  readonly doesNotPrescribeIntakeWorkflow: true;
  readonly doesNotPrescribeAcceptanceMechanics: true;
  readonly doesNotPrescribeRoutingMechanics: true;
  readonly doesNotPrescribeStorageMechanics: true;
  readonly doesNotPrescribeNotificationMechanics: true;
  readonly doesNotMergeAuthorizationAttribution: true;
  readonly doesNotMergePostureDeclarationAttribution: true;
  readonly doesNotMergeCompletionAttribution: true;
  readonly doesNotMergeLifecycleAttribution: true;
  readonly doesNotMergeSuspensionAttribution: true;
  readonly doesNotMergeWithdrawalAttribution: true;
  readonly doesNotMergeRecallAttribution: true;
}

export interface Volume06HandoffAuthorityTerminus {
  readonly volumeId: "volume_06";
  readonly principalAuthorityLimit: "FI-DSN-STD-015";
  readonly terminusKind: "handoff_governance_authority_terminus";
  readonly doesNotAbsorbDownstreamAcceptance: true;
  readonly doesNotAbsorbDownstreamAdmission: true;
  readonly doesNotAbsorbDownstreamValidation: true;
  readonly doesNotAbsorbDownstreamExecution: true;
  readonly doesNotAbsorbDownstreamIntake: true;
  readonly exitCompletenessDeferred: true;
  readonly r58Volume06Terminus: true;
}

/**
 * Assessment for whether a lawful downstream exit-boundary attribution may be recorded.
 */
export interface GovernedHandoffDownstreamExitBoundaryAssessment {
  readonly mayAttribute: boolean;
  readonly denialReasons: readonly string[];
  readonly authorityClassId: HandoffGovernanceAuthorityClassId | null;
  readonly catalogDownstreamConsiderationDomain: string | null;
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly bindingCurrency: HandoffConsumerBindingCurrency | null;
  readonly postureDeclarationCurrency: HandoffPostureDeclarationCurrency | null;
  readonly completionCurrency: HandoffCompletionCurrency | null;
  readonly preparationCurrency: HandoffPreparationCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly volume06Terminus: Volume06HandoffAuthorityTerminus;
  readonly notHgaMatrixActType: true;
  readonly notHandoffCompletionAct: true;
  readonly notDownstreamAcceptance: true;
  readonly notMembershipAdmission: true;
  readonly notManufacturingOrFulfillmentOrExecution: true;
  readonly notExitCompletenessSatisfaction: true;
  readonly exitCompletenessDeferred: true;
  readonly r58Volume06Terminus: true;
  readonly r59BoundedExportDenotation: true;
  readonly r60CompletedEnablesConsiderationOnly: true;
  readonly r65NoImplicitExit: true;
}

/**
 * Operative downstream exit-boundary attribution — FI-DSN-STD-015-R58–R65.
 * Denotes bounded export toward HCCM-mapped consideration domain.
 * Does NOT accept, admit, manufacture, fulfill, or satisfy exit-completeness.
 * NOT a ninth HGA matrix act type.
 */
export interface GovernedHandoffDownstreamExitBoundaryAttributionRecord {
  readonly exitBoundaryAttributionId: GovernedHandoffDownstreamExitBoundaryAttributionId;
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-015-001";
  readonly attributionKind: "downstream_exit_boundary_attribution";
  readonly constitutionalArtifactKind: "downstream_exit_boundary_attribution";
  readonly attributedBy: string;
  readonly attributedAt: string;
  readonly entryId: GovernedHandoffEntryId;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly consumerClassId: HccmConsumerClassId;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly downstreamConsiderationDomain: string;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId;
  readonly completionActId: GovernedHandoffCompletionActId;
  /** Optional export of auth facts when present — NOT a gate (R59). */
  readonly authorizationActId: GovernedHandoffAuthorizationActId | null;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly hoemExitBoundaryRecord: HoemExitBoundaryRecord;
  readonly volume06Terminus: Volume06HandoffAuthorityTerminus;
  readonly notHgaMatrixActType: true;
  readonly notHandoffCompletionAct: true;
  readonly notDownstreamAcceptance: true;
  readonly notMembershipAdmission: true;
  readonly notManufacturingOrFulfillmentOrExecution: true;
  readonly notExitCompletenessSatisfaction: true;
  readonly exitCompletenessDeferred: true;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffRecall: true;
  readonly notHandoffWithdrawal: true;
  readonly doesNotCollapsePeerDecisionClasses: true;
  readonly doesNotMergeAcrossConsumerClasses: true;
  readonly r58Volume06Terminus: true;
  readonly r59BoundedExportDenotation: true;
  readonly r60CompletedEnablesConsiderationOnly: true;
  readonly r61SingleBindingRouting: true;
  readonly r62TupleConsistency: true;
  readonly r63PeerDistinctExitBoundary: true;
  readonly r64HoemExitBoundaryLinkage: true;
  readonly r65NoImplicitExit: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * R60/R65 — Completed enables consideration; linkage establishes attributed exit.
 */
export interface HandoffDownstreamExitConsiderationEvaluation {
  readonly considerationEnabled: boolean;
  readonly exitAttributed: boolean;
  readonly completionActId: GovernedHandoffCompletionActId | null;
  readonly exitBoundaryAttributionId: GovernedHandoffDownstreamExitBoundaryAttributionId | null;
  readonly downstreamConsiderationDomain: string | null;
  readonly notIntake: true;
  readonly notAcceptance: true;
  readonly notExitCompleteness: true;
  readonly exitCompletenessDeferred: true;
  readonly r60CompletedEnablesConsiderationOnly: true;
  readonly r65NoImplicitExitFromCompletedAlone: true;
}

// --- STD-015 HOF-G9 Catalog Integration (R66–R69) ---

/**
 * R66 adopted six matrix ids; R140–R141 complete the catalog to eight by integrating
 * reentry and resumption without redrafting R66–R69. Rejection and exit remain absent.
 */
export type HgaMatrixActType =
  | "authorization"
  | "posture_declaration"
  | "completion"
  | "suspension"
  | "withdrawal"
  | "recall"
  | "reentry"
  | "resumption";

/** R70–R83 — peer-distinct G6 lifecycle matrix act types (foundation only until U2–U4). */
export type G6LifecycleMatrixActType = "suspension" | "withdrawal" | "recall";

/**
 * R76 shared effect framing vocabulary — descriptive only in U1;
 * act-specific effect mechanics remain HOF-G6-U2 through U4.
 */
export type G6SharedEffectFramingKind =
  | "temporary_forward_reliance_pause"
  | "hga_initiated_retraction"
  | "responsive_forward_reliance_termination";

export type HgaMatrixActOperativeStatus = "operative" | "cataloged_deferred";

export interface HgaMatrixActTypeCatalogEntry {
  readonly actType: HgaMatrixActType;
  readonly operativeStatus: HgaMatrixActOperativeStatus;
  readonly hoemExpectation: HgaMatrixActType;
  readonly hccmBoundRequired: true;
  readonly hppmmPostureChainRequired: boolean;
  readonly requirementIds: readonly Std015RequirementId[];
  readonly catalogedDeferredHofG6: boolean;
  /** U1 shared foundation established; act minting still deferred when true. */
  readonly sharedFoundationEstablishedHofG6U1: boolean;
}

export interface HoemExpectationCatalogEntry {
  readonly hoemExpectation: string;
  readonly matrixMembership: "matrix" | "peer_non_matrix";
  readonly operativeStatus: HgaMatrixActOperativeStatus | "operative";
  readonly isSeventhMatrixType: false;
  readonly isNinthMatrixType: false;
  readonly forbiddenAsMatrix: boolean;
  readonly requirementIds: readonly Std015RequirementId[];
}

export type HslmCatalogStateStatusKind =
  | "denotation"
  | "operative_transition"
  | "denotation_only"
  | "vocabulary_deferred";

export interface HslmCatalogStateEntry {
  readonly stateId: HandoffActLayerLifecycleState;
  readonly statusKind: HslmCatalogStateStatusKind;
}

/**
 * R69 — performer classes that MUST NOT be assigned operative Handoff act performance.
 */
export type ProhibitedHandoffActPerformerClass =
  | "gpra_grant"
  | "magac_approval_authority"
  | "approval"
  | "ddac_downstream_disposition"
  | "dsra_rework_authorization"
  | "ivac_invalidation_authority"
  | "ssac_supersession_authority"
  | "brain_domain3"
  | "g11_export_contract"
  | "downstream_consumer_domain"
  | "implementation_ad_hoc_class";

/**
 * R68 — assessment that an HGA act binds exactly one HCCM context (no multi-merge).
 * Catalog membership alone never authorizes/binds/declares/completes/exits.
 */
export interface HgaActCatalogBindingScopeAssessment {
  readonly mayBindSingleContext: boolean;
  readonly denialReasons: readonly string[];
  readonly actType: HgaMatrixActType | null;
  readonly bindingId: string | null;
  readonly hccmBoundRequired: boolean;
  readonly hppmmPostureChainRequired: boolean;
  readonly doesNotAllowMultiContextMerge: true;
  readonly doesNotAllowActTypeMerge: true;
  readonly catalogMembershipDoesNotCreateAuthority: true;
  readonly catalogMembershipDoesNotAuthorize: true;
  readonly catalogMembershipDoesNotBind: true;
  readonly catalogMembershipDoesNotDeclare: true;
  readonly catalogMembershipDoesNotComplete: true;
  readonly catalogMembershipDoesNotExit: true;
  readonly r68SingleHccmBoundConsumerContext: true;
  readonly traceability: Std015GovernanceTraceability;
}

/**
 * Frozen R66–R69 catalog integrity assessment (read-only; no minting).
 */
export interface HandoffAuthorityCatalogIntegrationAssessment {
  readonly integrityOk: boolean;
  readonly soleAuthorityClassId: HandoffGovernanceAuthorityClassId;
  readonly soleAuthorityClassCount: 1;
  readonly matrixActTypes: readonly HgaMatrixActType[];
  readonly matrixActTypeCount: 8;
  readonly operativeMatrixActTypes: readonly HgaMatrixActType[];
  readonly catalogedDeferredMatrixActTypes: readonly HgaMatrixActType[];
  readonly hoemMatrixExpectations: readonly HgaMatrixActType[];
  readonly peerNonMatrixHoemExpectation: "exit_boundary";
  readonly exitBoundaryIsSeventhMatrixType: false;
  readonly exitBoundaryIsNinthMatrixType: false;
  readonly rejectionForbiddenAsMatrix: true;
  readonly hslmStateIds: readonly HandoffActLayerLifecycleState[];
  readonly hslmStateCount: 8;
  readonly hslmExcludesExitedAndAccepted: true;
  readonly hccmConsumerClassIds: readonly HccmConsumerClassId[];
  readonly hccmConsumerClassCount: 6;
  readonly hppmmAffinities: readonly HandoffPostureClass[];
  readonly noneAffinityIsNotThirdVolume06PostureClass: true;
  readonly volume06PostureClassCount: 2;
  readonly prohibitedPerformerClasses: readonly ProhibitedHandoffActPerformerClass[];
  readonly haamProhibitedAssigneesPreserved: readonly HaamProhibitedHandoffAuthorizationAssignee[];
  readonly frozenHgaConstitutionalScopes: readonly string[];
  /** Eight HGA scopes: six R66 matrix acts plus reentry and resumption (R140–R141). */
  readonly frozenHgaConstitutionalScopeCount: 8;
  readonly hercmConstitutionalScopesPresent: true;
  readonly hercmActsAreMatrixActTypes: true;
  readonly catalogMembershipDoesNotReenter: true;
  readonly catalogMembershipDoesNotResume: true;
  readonly r140EightTypeMatrixComplete: true;
  readonly r142PlusDeferred: true;
  readonly handoffLifecycleRejectionActAbsentFromHgaScopes: true;
  readonly rejectHandoffActLayerUndefined: true;
  readonly withdrawRecallApisNotProvided: false;
  readonly withdrawGovernedHandoffMayBeProvided: true;
  readonly recallApisNotProvided: false;
  readonly recallGovernedHandoffMayBeProvided: true;
  readonly suspendGovernedHandoffMayBeProvided: true;
  readonly performHgaActFactoryNotProvided: true;
  readonly catalogMembershipDoesNotCreateAuthority: true;
  readonly catalogMembershipDoesNotAuthorize: true;
  readonly catalogMembershipDoesNotBind: true;
  readonly catalogMembershipDoesNotDeclare: true;
  readonly catalogMembershipDoesNotComplete: true;
  readonly catalogMembershipDoesNotExit: true;
  readonly r66SoleHgaAndSixTypeMatrix: true;
  readonly r67DistinctActTypeAttributionAndHoem: true;
  readonly r68SingleHccmBindingNoMerge: true;
  readonly r69ProhibitedPerformers: true;
  /** HOF-G6-U1 R70–R83 shared foundation is established. */
  readonly hofG6U1SharedFoundationEstablished: true;
  /** Act-specific recall minting is operative at HOF-G6-U4 (R112+). */
  readonly hofG6ActSpecificMechanicsDeferredToU3U4: false;
  readonly hofG6RecallMechanicsDeferredToU4: false;
  readonly hofG9CompletionThemesTranche3: true;
  readonly traceability: Std015GovernanceTraceability;
}

/**
 * HOF-G6-U1 shared precondition categories (R75 a–e).
 * Satisfaction of shared categories does not mint suspension/withdrawal/recall.
 */
export interface G6SharedPreconditionCategoryFlags {
  readonly a_validGovernedHandoffTarget: boolean;
  readonly b_hccmBoundContextEstablished: boolean;
  readonly c_authorizedHgaPerformerAttributable: boolean;
  readonly d_traceableConstitutionalBasis: boolean;
  readonly e_priorRecordsPreservedReconstructable: boolean;
}

export interface G6SharedPreconditionAssessment {
  readonly sharedCategoriesSatisfied: boolean;
  readonly denialReasons: readonly string[];
  readonly actType: G6LifecycleMatrixActType | null;
  readonly bindingId: string | null;
  readonly categories: G6SharedPreconditionCategoryFlags;
  readonly actSpecificTriggersDeferredToU2U3U4: true;
  readonly doesNotAuthorizeActMint: true;
  readonly doesNotApplyActSpecificEffects: true;
  readonly catalogMembershipDoesNotCreateAuthority: true;
  readonly r75SharedPreconditionCategories: true;
  readonly traceability: Std015GovernanceTraceability;
}

export interface G6LifecycleActSubjectScopeAssessment {
  readonly scopeOk: boolean;
  readonly denialReasons: readonly string[];
  readonly actType: G6LifecycleMatrixActType | null;
  readonly bindingId: string | null;
  readonly singleHccmBoundContext: true;
  readonly atMostOneAuthoritativePostureChain: true;
  readonly noMultiContextSpan: true;
  readonly noSilentCrossContextPropagation: true;
  readonly r72R73ScopeRules: true;
  readonly traceability: Std015GovernanceTraceability;
}

/**
 * Frozen HOF-G6-U1 shared foundation integrity assessment (no act minting).
 */
export interface HofG6U1SharedLifecycleFoundationAssessment {
  readonly integrityOk: boolean;
  readonly g6LifecycleActTypes: readonly G6LifecycleMatrixActType[];
  readonly g6LifecycleActTypeCount: 3;
  readonly peerDistinctActsPreserved: true;
  readonly noGenericLifecycleAction: true;
  readonly hgaSolePerformerForG6Acts: true;
  readonly actPerformanceDistinctFromHslmState: true;
  readonly sharedPreconditionCategoriesDefined: true;
  readonly actSpecificTriggersDeferred: true;
  readonly sharedEffectFramingsDefined: true;
  readonly actSpecificEffectMechanicsDeferred: true;
  readonly additiveHoemModelPerActType: true;
  readonly additivePreservationRequired: true;
  readonly noHistoricalRewrite: true;
  readonly noPeerAuthorityAbsorption: true;
  readonly noImpliedReentryOrResumption: true;
  readonly noAutomaticRetryOrRecovery: true;
  readonly withdrawRecallMintApisAbsent: false;
  readonly recallMintApisAbsent: false;
  readonly performHgaActFactoryAbsent: true;
  readonly rejectionActAbsent: true;
  readonly exitHgaMatrixActAbsent: true;
  readonly hslmEightStatesPreserved: true;
  /** HERCM R126–R139 is operative; invented restoration/expiry acts remain deferred (R142+). */
  readonly restorationResumptionReentryDeferred: false;
  readonly resumptionMechanicsOperative: true;
  readonly reentryMechanicsOperative: true;
  readonly hercmActsAreMatrixActTypes: true;
  readonly r140PlusUnavailable: false;
  readonly r142PlusUnavailable: true;
  readonly suspensionMechanicsOperative: true;
  readonly withdrawalMechanicsOperative: true;
  readonly r84PlusUnavailable: false;
  readonly r98PlusUnavailable: false;
  readonly r112PlusUnavailable: false;
  readonly recallMechanicsOperative: true;
  readonly r70ThroughR83: true;
  readonly traceability: Std015GovernanceTraceability;
}

/**
 * R89 — provenance for a suspension constitutional basis.
 * Optional notes cannot be the sole basis.
 */
export interface SuspensionConstitutionalBasisProvenance {
  readonly basisKind: SuspensionConstitutionalBasisKind;
  readonly notes: string | null;
  readonly notesCannotBeSoleBasis: true;
}

/**
 * R93 — additive HOEM suspension operative record (suspension act type only).
 * Peer-distinct from authorization/posture/completion/withdrawal/recall HOEM records.
 */
export interface HoemSuspensionOperativeRecord {
  readonly hoemSuspensionRecordId: HoemSuspensionOperativeRecordId;
  readonly suspensionActId: GovernedHandoffSuspensionActId;
  readonly actType: "suspension";
  readonly gpraId: GpraId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly consumerClassId: HccmConsumerClassId;
  readonly authorizationActId: GovernedHandoffAuthorizationActId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly constitutionalBasisKind: SuspensionConstitutionalBasisKind;
  readonly effectiveAt: string;
  readonly doesNotMergeAuthorizationAttribution: true;
  readonly doesNotMergePostureDeclarationAttribution: true;
  readonly doesNotMergeCompletionAttribution: true;
  readonly doesNotMergeLifecycleAttribution: true;
  readonly doesNotMergeWithdrawalAttribution: true;
  readonly doesNotMergeRecallAttribution: true;
}

/**
 * Assessment for whether a lawful HGA suspension act may be performed (R84–R97).
 */
export interface GovernedHandoffSuspensionAssessment {
  readonly maySuspend: boolean;
  readonly denialReasons: readonly string[];
  readonly authorityClassId: HandoffGovernanceAuthorityClassId | null;
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly bindingCurrency: HandoffConsumerBindingCurrency | null;
  readonly authorizationCurrency: HandoffAuthorizationCurrency | null;
  readonly postureDeclarationCurrency: HandoffPostureDeclarationCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly constitutionalBasisKind: SuspensionConstitutionalBasisKind | null;
  readonly doesNotAuthorizeActMintViaCatalogAlone: true;
  readonly doesNotAuthorizeActMintViaRtcCatalogAlone: true;
  readonly doesNotAuthorizeActMintViaGpraInvalidatedOrSupersededAlone: true;
  readonly doesNotAuthorizeActMintViaG11BlockedAlone: true;
  readonly doesNotAuthorizeActMintViaHrwmLossAlone: true;
  readonly doesNotAuthorizeActMintViaAdvisoryAlone: true;
  readonly notHandoffWithdrawal: true;
  readonly notHandoffRecall: true;
  readonly notHandoffCompletion: true;
  readonly notHercmReentryOrResumption: true;
}

/**
 * Operative HGA Handoff suspension act — FI-DSN-STD-015-R84–R97.
 * Temporary forward-reliance pause. Does NOT withdraw, recall, complete, resume, or restore.
 */
export interface GovernedHandoffSuspensionActRecord {
  readonly suspensionActId: GovernedHandoffSuspensionActId;
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-015-001";
  readonly authorityConstitutionalScope: "handoff_suspension_act";
  readonly suspendedBy: string;
  readonly suspendedAt: string;
  readonly entryId: GovernedHandoffEntryId;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly authorizationActId: GovernedHandoffAuthorizationActId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerClassId: HccmConsumerClassId;
  readonly declaredPostureClass: HandoffPostureClass | null;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly constitutionalBasisKind: SuspensionConstitutionalBasisKind;
  readonly constitutionalBasisProvenance: SuspensionConstitutionalBasisProvenance;
  readonly forwardReliancePaused: true;
  readonly doesNotTerminatePosture: true;
  readonly doesNotEraseAuthorization: true;
  readonly notHandoffWithdrawal: true;
  readonly notHandoffRecall: true;
  readonly notHandoffCompletion: true;
  readonly notHercmReentry: true;
  readonly notResumption: true;
  readonly notRestoration: true;
  readonly effectFraming: "temporary_forward_reliance_pause";
  readonly hoemSuspensionRecord: HoemSuspensionOperativeRecord;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly notDownstreamAcceptance: true;
  readonly notPermanentCollectionMembership: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotCollapsePeerDecisionClasses: true;
  readonly doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory: true;
  readonly doesNotMergeAcrossConsumerClasses: true;
  readonly notAutomaticHslmPromotion: true;
  readonly hslmProjectionFromActFacts: true;
  readonly r84DistinctHgaSuspensionAct: true;
  readonly r85SharedPreconditionsPlusTriggers: true;
  readonly r86NoSuspendAfterRelianceCeased: true;
  readonly r87NoSoleRtcGpraG11HrwmBasis: true;
  readonly r88SingleBindingPostureChain: true;
  readonly r89ConstitutionalBasisAndProvenance: true;
  readonly r90EffectFromSuspendedAtForward: true;
  readonly r91TemporaryForwardReliancePause: true;
  readonly r92AttributedBindingOnly: true;
  readonly r93HoemSuspensionOperativeRecord: true;
  readonly r94NotAutomaticHslmPromotion: true;
  readonly r95RepeatedSuspensionsAdditive: true;
  readonly r96InvalidAttemptsNonOperative: true;
  readonly r97NotWithdrawalRecallOrReentry: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * Closed vocabulary for HOF-G6-U3 constitutional withdrawal basis (R99b / R103).
 * Faithful encoding of R53 HGA-initiated retraction warrant — not a separately frozen catalog id.
 */
export type WithdrawalConstitutionalBasisKind =
  "hga_initiated_forward_reliance_retraction_warranted";

/** R105 / R107 — retraction target(s) identified in the withdrawal act. */
export type WithdrawalRetractionTarget = "authorization" | "posture";

/**
 * R103 — provenance for a withdrawal constitutional basis.
 * Optional notes cannot be the sole basis.
 */
export interface WithdrawalConstitutionalBasisProvenance {
  readonly basisKind: WithdrawalConstitutionalBasisKind;
  readonly notes: string | null;
  readonly notesCannotBeSoleBasis: true;
}

/**
 * R107 — additive HOEM withdrawal operative record (withdrawal act type only).
 * Peer-distinct from authorization/posture/completion/suspension/recall HOEM records.
 */
export interface HoemWithdrawalOperativeRecord {
  readonly hoemWithdrawalRecordId: HoemWithdrawalOperativeRecordId;
  readonly withdrawalActId: GovernedHandoffWithdrawalActId;
  readonly actType: "withdrawal";
  readonly gpraId: GpraId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly consumerClassId: HccmConsumerClassId;
  readonly authorizationActId: GovernedHandoffAuthorizationActId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly retractionTargets: readonly WithdrawalRetractionTarget[];
  readonly constitutionalBasisKind: WithdrawalConstitutionalBasisKind;
  readonly effectiveAt: string;
  readonly doesNotMergeAuthorizationAttribution: true;
  readonly doesNotMergePostureDeclarationAttribution: true;
  readonly doesNotMergeCompletionAttribution: true;
  readonly doesNotMergeSuspensionAttribution: true;
  readonly doesNotMergeLifecycleAttribution: true;
  readonly doesNotMergeRecallAttribution: true;
}

/**
 * Assessment for whether a lawful HGA withdrawal act may be performed (R98–R111).
 */
export interface GovernedHandoffWithdrawalAssessment {
  readonly mayWithdraw: boolean;
  readonly denialReasons: readonly string[];
  readonly authorityClassId: HandoffGovernanceAuthorityClassId | null;
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly bindingCurrency: HandoffConsumerBindingCurrency | null;
  readonly authorizationCurrency: HandoffAuthorizationCurrency | null;
  readonly postureDeclarationCurrency: HandoffPostureDeclarationCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly constitutionalBasisKind: WithdrawalConstitutionalBasisKind | null;
  readonly doesNotAuthorizeActMintViaCatalogAlone: true;
  readonly doesNotAuthorizeActMintViaRtcCatalogAlone: true;
  readonly doesNotAuthorizeActMintViaGpraInvalidatedOrSupersededAlone: true;
  readonly doesNotAuthorizeActMintViaG11BlockedAlone: true;
  readonly doesNotAuthorizeActMintViaHrwmLossAlone: true;
  readonly doesNotAuthorizeActMintViaAdvisoryAlone: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffRecall: true;
  readonly notHandoffCompletion: true;
  readonly notHercmReentryOrResumption: true;
  readonly suspensionPauseDoesNotNegateAttributability: true;
}

/**
 * Operative HGA Handoff withdrawal act — FI-DSN-STD-015-R98–R111.
 * HGA-initiated retraction / active cessation of forward reliance.
 * Does NOT recall, suspend-as-withdrawal, resume, restore, or reenter.
 */
export interface GovernedHandoffWithdrawalActRecord {
  readonly withdrawalActId: GovernedHandoffWithdrawalActId;
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-015-001";
  readonly authorityConstitutionalScope: "handoff_withdrawal_act";
  readonly withdrawnBy: string;
  readonly withdrawnAt: string;
  readonly entryId: GovernedHandoffEntryId;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly authorizationActId: GovernedHandoffAuthorizationActId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerClassId: HccmConsumerClassId;
  readonly declaredPostureClass: HandoffPostureClass | null;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly constitutionalBasisKind: WithdrawalConstitutionalBasisKind;
  readonly constitutionalBasisProvenance: WithdrawalConstitutionalBasisProvenance;
  readonly retractionTargets: readonly WithdrawalRetractionTarget[];
  readonly forwardRelianceCeased: true;
  readonly doesNotEraseAuthorization: true;
  readonly doesNotErasePosture: true;
  readonly doesNotEraseSuspensionHistory: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffRecall: true;
  readonly notHandoffCompletion: true;
  readonly notHercmReentry: true;
  readonly notResumption: true;
  readonly notRestoration: true;
  readonly effectFraming: "hga_initiated_retraction";
  readonly hoemWithdrawalRecord: HoemWithdrawalOperativeRecord;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly notDownstreamAcceptance: true;
  readonly notPermanentCollectionMembership: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotCollapsePeerDecisionClasses: true;
  readonly doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory: true;
  readonly doesNotMergeAcrossConsumerClasses: true;
  readonly notAutomaticHslmPromotion: true;
  readonly hslmProjectionFromActFacts: true;
  readonly r98DistinctHgaWithdrawalAct: true;
  readonly r99SharedPreconditionsPlusTriggers: true;
  readonly r100NoWithdrawAfterRelianceCeased: true;
  readonly r101NoSoleRtcGpraG11HrwmBasis: true;
  readonly r102SingleBindingPostureChain: true;
  readonly r103ConstitutionalBasisAndProvenance: true;
  readonly r104EffectFromWithdrawnAtForward: true;
  readonly r105HgaInitiatedRetractionCessation: true;
  readonly r106AttributedBindingOnly: true;
  readonly r107HoemWithdrawalOperativeRecord: true;
  readonly r108NotAutomaticHslmPromotion: true;
  readonly r109NoAdditionalCessationAfterCeased: true;
  readonly r110InvalidAttemptsNonOperative: true;
  readonly r111NotSuspensionRecallOrReentry: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/** HRTCM closed recall trigger ids — PD-STD-015-004 / §20.5.6. */
export type HrtcmRecallTriggerId = "RTC-01" | "RTC-02" | "RTC-03" | "RTC-04";

export type GovernedHandoffRecallActId = string & {
  readonly __brand: "GovernedHandoffRecallActId";
};

export type HoemRecallOperativeRecordId = string & {
  readonly __brand: "HoemRecallOperativeRecordId";
};

export type HandoffRecallCurrency = "current" | "stale";

/**
 * R121 — additive HOEM recall operative record (recall act type only).
 * Peer-distinct from authorization/posture/completion/suspension/withdrawal HOEM records.
 */
export interface HoemRecallOperativeRecord {
  readonly hoemRecallRecordId: HoemRecallOperativeRecordId;
  readonly recallActId: GovernedHandoffRecallActId;
  readonly actType: "recall";
  readonly gpraId: GpraId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly consumerClassId: HccmConsumerClassId;
  readonly authorizationActId: GovernedHandoffAuthorizationActId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly satisfiedHrtcmTriggers: readonly HrtcmRecallTriggerId[];
  readonly effectiveAt: string;
  readonly doesNotMergeAuthorizationAttribution: true;
  readonly doesNotMergePostureDeclarationAttribution: true;
  readonly doesNotMergeCompletionAttribution: true;
  readonly doesNotMergeSuspensionAttribution: true;
  readonly doesNotMergeLifecycleAttribution: true;
  readonly doesNotMergeWithdrawalAttribution: true;
}

/**
 * Assessment for whether a lawful HGA recall act may be performed (R112–R125).
 */
export interface GovernedHandoffRecallAssessment {
  readonly mayRecall: boolean;
  readonly denialReasons: readonly string[];
  readonly authorityClassId: HandoffGovernanceAuthorityClassId | null;
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly bindingCurrency: HandoffConsumerBindingCurrency | null;
  readonly authorizationCurrency: HandoffAuthorizationCurrency | null;
  readonly postureDeclarationCurrency: HandoffPostureDeclarationCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly satisfiedHrtcmTriggers: readonly HrtcmRecallTriggerId[];
  readonly doesNotAuthorizeActMintViaCatalogAlone: true;
  readonly doesNotAuthorizeActMintViaRtcCatalogAlone: true;
  readonly doesNotAuthorizeActMintViaGpraInvalidatedOrSupersededAlone: true;
  readonly doesNotAuthorizeActMintViaG11BlockedAlone: true;
  readonly doesNotAuthorizeActMintViaHrwmLossAlone: true;
  readonly doesNotAuthorizeActMintViaAdvisoryAlone: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffWithdrawal: true;
  readonly notHandoffCompletion: true;
  readonly notHercmReentryOrResumption: true;
  readonly suspensionPauseDoesNotNegateAttributability: true;
}

/**
 * Operative HGA Handoff recall act — FI-DSN-STD-015-R112–R125.
 * Responsive forward-reliance termination via satisfied HRTCM triggers.
 * Does NOT suspend-as-recall, withdraw-as-recall, resume, restore, or reenter.
 */
export interface GovernedHandoffRecallActRecord {
  readonly recallActId: GovernedHandoffRecallActId;
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-015-001";
  readonly authorityConstitutionalScope: "handoff_recall_act";
  readonly recalledBy: string;
  readonly recalledAt: string;
  readonly entryId: GovernedHandoffEntryId;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly authorizationActId: GovernedHandoffAuthorizationActId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerClassId: HccmConsumerClassId;
  readonly declaredPostureClass: HandoffPostureClass | null;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly satisfiedHrtcmTriggers: readonly HrtcmRecallTriggerId[];
  readonly hrtcmTriggerEvidenceNotes: string | null;
  readonly forwardRelianceCeased: true;
  readonly doesNotEraseAuthorization: true;
  readonly doesNotErasePosture: true;
  readonly doesNotEraseSuspensionHistory: true;
  readonly doesNotEraseWithdrawalHistory: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffWithdrawal: true;
  readonly notHandoffCompletion: true;
  readonly notHercmReentry: true;
  readonly notResumption: true;
  readonly notRestoration: true;
  readonly effectFraming: "responsive_forward_reliance_termination";
  readonly hoemRecallRecord: HoemRecallOperativeRecord;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly notDownstreamAcceptance: true;
  readonly notPermanentCollectionMembership: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotCollapsePeerDecisionClasses: true;
  readonly doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory: true;
  readonly doesNotMergeAcrossConsumerClasses: true;
  readonly notAutomaticHslmPromotion: true;
  readonly hslmProjectionFromActFacts: true;
  readonly r112DistinctHgaRecallAct: true;
  readonly r113SharedPreconditionsPlusTriggers: true;
  readonly r114NoRecallAfterRelianceCeased: true;
  readonly r115NoSoleRtcGpraG11HrwmBasis: true;
  readonly r116SingleBindingPostureChain: true;
  readonly r117HrtcmTriggerEvidenceRecording: true;
  readonly r118EffectFromRecalledAtForward: true;
  readonly r119ResponsiveForwardRelianceCessation: true;
  readonly r120AttributedBindingOnly: true;
  readonly r121HoemRecallOperativeRecord: true;
  readonly r122NotAutomaticHslmPromotion: true;
  readonly r123RepeatedRecallsAdditive: true;
  readonly r124InvalidAttemptsNonOperative: true;
  readonly r125NotSuspensionWithdrawalOrReentry: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

// --- STD-015 HERCM re-entry / resumption (R126–R139) ---

/**
 * HERCM closed category ids — Handoff Re-entry & Resumption Category Model.
 * REC-02 is the sole resumption category; REC-01/03/04/05 are re-entry categories.
 * HERCM acts are performed under the established HGA class. R140–R141 integrate
 * reentry and resumption into the eight-type HGA matrix without changing REC semantics.
 */
export type HercmCategoryId = "REC-01" | "REC-02" | "REC-03" | "REC-04" | "REC-05";

/** REC-02 only — restores forward reliance on existing authorization + posture. */
export type HercmResumptionCategoryId = "REC-02";

/** Re-entry categories — return toward Eligible-for-consideration only. */
export type HercmReentryCategoryId = "REC-01" | "REC-03" | "REC-04" | "REC-05";

export type HercmActKind = "resumption" | "reentry";

/**
 * Closed vocabulary for the REC-02 resumption constitutional basis.
 * R131 supplies the category condition (suspension grounds cleared); the basis is
 * recorded additively on the HOEM record under R136.
 */
export type ResumptionConstitutionalBasisKind =
  "suspension_grounds_constitutionally_cleared";

/**
 * Closed vocabulary for HERCM re-entry constitutional basis, per R131 category condition.
 */
export type ReentryConstitutionalBasisKind =
  | "rejection_grounds_constitutionally_addressable"
  | "g11_export_ready_and_entry_inputs_satisfied_anew"
  | "validity_or_time_boundary_addressed_upstream";

/**
 * HSLM state each HERCM category requires as the qualifying prior state.
 * R131 fixes which prior state belongs to which category; R133 requires the
 * qualifying prior state to actually hold (and, for REC-02, on the same posture chain).
 */
export type HercmQualifyingPriorState =
  | "rejected"
  | "suspended"
  | "withdrawn"
  | "recalled"
  | "expired";

/**
 * Frozen HERCM category catalog entry — catalog membership does not mint HERCM acts.
 */
export interface HercmCategoryCatalogEntry {
  readonly categoryId: HercmCategoryId;
  readonly actKind: HercmActKind;
  readonly qualifyingPriorState: HercmQualifyingPriorState;
  readonly basisKind: ResumptionConstitutionalBasisKind | ReentryConstitutionalBasisKind;
  /**
   * R128 — G11 export_ready authorizes consideration only. Re-entry categories require it
   * anew before the act may be considered; REC-02 does not (the pause is lifted, not re-entered).
   */
  readonly requiresExportReadyAnew: boolean;
  /** R132 — re-entry returns toward eligible only; new authorization is required via HOF-G2. */
  readonly requiresNewAuthorizationViaG2: boolean;
  /** R132 — REC-04 additionally requires a new posture path after the new authorization. */
  readonly requiresNewPostureAfterNewAuthorization: boolean;
  /** R140–R141 — reentry and resumption are HGA matrix act types. Catalog membership does not mint. */
  readonly isHgaMatrixActType: true;
  readonly hgaConstitutionalScope:
    | "handoff_resumption_act"
    | "handoff_reentry_act";
  readonly requirementIds: readonly Std015RequirementId[];
}

/**
 * Frozen HERCM catalog integrity assessment (read-only; no minting).
 */
export interface HercmCatalogIntegrityAssessment {
  readonly integrityOk: boolean;
  readonly categoryIds: readonly HercmCategoryId[];
  readonly categoryCount: 5;
  readonly resumptionCategoryIds: readonly HercmResumptionCategoryId[];
  readonly reentryCategoryIds: readonly HercmReentryCategoryId[];
  readonly hgaMatrixActTypeCount: 8;
  readonly hercmActsAreMatrixActTypes: true;
  readonly hercmConstitutionalScopesPresent: true;
  readonly hslmStateCount: 8;
  readonly noReenteredHslmState: true;
  readonly noResumedHslmState: true;
  readonly catalogMembershipDoesNotCreateAuthority: true;
  readonly catalogMembershipDoesNotReenter: true;
  readonly catalogMembershipDoesNotResume: true;
  readonly exportReadyAloneDoesNotReenterOrResume: true;
  readonly noAutomaticRecovery: true;
  readonly r126ThroughR139: true;
  readonly r140R141Complete: true;
  readonly r142PlusDeferred: true;
  readonly traceability: Std015GovernanceTraceability;
}

export type GovernedHandoffResumptionActId = string & {
  readonly __brand: "GovernedHandoffResumptionActId";
};

export type HoemResumptionOperativeRecordId = string & {
  readonly __brand: "HoemResumptionOperativeRecordId";
};

export type GovernedHandoffReentryActId = string & {
  readonly __brand: "GovernedHandoffReentryActId";
};

export type HoemReentryOperativeRecordId = string & {
  readonly __brand: "HoemReentryOperativeRecordId";
};

export type HandoffResumptionCurrency = "current" | "stale";

export type HandoffReentryCurrency = "current" | "stale";

/**
 * R131 — provenance for the REC-02 resumption category basis.
 * Optional notes cannot be the sole basis.
 */
export interface ResumptionConstitutionalBasisProvenance {
  readonly basisKind: ResumptionConstitutionalBasisKind;
  readonly notes: string | null;
  readonly notesCannotBeSoleBasis: true;
}

/**
 * R131 — provenance for a HERCM re-entry category basis.
 * Optional notes cannot be the sole basis.
 */
export interface ReentryConstitutionalBasisProvenance {
  readonly basisKind: ReentryConstitutionalBasisKind;
  readonly notes: string | null;
  readonly notesCannotBeSoleBasis: true;
}

/**
 * R136 — additive HOEM resumption operative record (resumption act type only), carrying
 * the REC category and the qualifying prior-state linkage.
 * Peer-distinct from authorization/posture/completion/suspension/withdrawal/recall/reentry.
 */
export interface HoemResumptionOperativeRecord {
  readonly hoemResumptionRecordId: HoemResumptionOperativeRecordId;
  readonly resumptionActId: GovernedHandoffResumptionActId;
  readonly actType: "resumption";
  readonly hercmCategory: HercmResumptionCategoryId;
  /** R136 — prior-state linkage; always "suspended" for REC-02. */
  readonly qualifyingPriorState: HercmQualifyingPriorState;
  readonly gpraId: GpraId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly consumerClassId: HccmConsumerClassId;
  readonly authorizationActId: GovernedHandoffAuthorizationActId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly resumedSuspensionActId: GovernedHandoffSuspensionActId;
  readonly constitutionalBasisKind: ResumptionConstitutionalBasisKind;
  readonly effectiveAt: string;
  readonly doesNotMergeAuthorizationAttribution: true;
  readonly doesNotMergePostureDeclarationAttribution: true;
  readonly doesNotMergeCompletionAttribution: true;
  readonly doesNotMergeSuspensionAttribution: true;
  readonly doesNotMergeWithdrawalAttribution: true;
  readonly doesNotMergeRecallAttribution: true;
  readonly doesNotMergeReentryAttribution: true;
  readonly doesNotMergeLifecycleAttribution: true;
  readonly notHgaMatrixActType: true;
}

/**
 * R136 — additive HOEM re-entry operative record (reentry act type only), carrying
 * the REC category and the qualifying prior-state linkage.
 */
export interface HoemReentryOperativeRecord {
  readonly hoemReentryRecordId: HoemReentryOperativeRecordId;
  readonly reentryActId: GovernedHandoffReentryActId;
  readonly actType: "reentry";
  readonly hercmCategory: HercmReentryCategoryId;
  /** R136 — prior-state linkage: rejected | withdrawn | recalled | expired. */
  readonly qualifyingPriorState: HercmQualifyingPriorState;
  readonly gpraId: GpraId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly consumerClassId: HccmConsumerClassId;
  readonly predecessorAuthorizationActId: GovernedHandoffAuthorizationActId;
  readonly predecessorPostureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly predecessorWithdrawalActId: GovernedHandoffWithdrawalActId | null;
  readonly predecessorRecallActId: GovernedHandoffRecallActId | null;
  /**
   * REC-01 Rejected is an HSLM denotation (R48/R51), not an HGA act — no rejection act
   * id can exist in this runtime, so the linkage is the projected/attributable rejected
   * fact and this stays null. REC-05 Expired likewise has no operative expiry act
   * (deferred to R140+).
   */
  readonly predecessorRejectionAttributionId: null;
  readonly predecessorExpiryActId: null;
  readonly constitutionalBasisKind: ReentryConstitutionalBasisKind;
  readonly effectiveAt: string;
  readonly doesNotMergeAuthorizationAttribution: true;
  readonly doesNotMergePostureDeclarationAttribution: true;
  readonly doesNotMergeCompletionAttribution: true;
  readonly doesNotMergeSuspensionAttribution: true;
  readonly doesNotMergeWithdrawalAttribution: true;
  readonly doesNotMergeRecallAttribution: true;
  readonly doesNotMergeResumptionAttribution: true;
  readonly doesNotMergeLifecycleAttribution: true;
  readonly notHgaMatrixActType: true;
}

/**
 * Assessment for whether a lawful HGA REC-02 resumption act may be performed (R126–R139).
 */
export interface GovernedHandoffResumptionAssessment {
  readonly mayResume: boolean;
  readonly denialReasons: readonly string[];
  readonly authorityClassId: HandoffGovernanceAuthorityClassId | null;
  readonly hercmCategory: HercmResumptionCategoryId | null;
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly bindingCurrency: HandoffConsumerBindingCurrency | null;
  readonly authorizationCurrency: HandoffAuthorizationCurrency | null;
  readonly postureDeclarationCurrency: HandoffPostureDeclarationCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly constitutionalBasisKind: ResumptionConstitutionalBasisKind | null;
  readonly qualifyingPriorState: HercmQualifyingPriorState | null;
  readonly resumedSuspensionActId: GovernedHandoffSuspensionActId | null;
  readonly resumedPostureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly doesNotAuthorizeActMintViaCatalogAlone: true;
  readonly doesNotAuthorizeActMintViaExportReadyAlone: true;
  readonly doesNotAuthorizeActMintViaAdvisoryAlone: true;
  readonly doesNotAuthorizeAutomaticRecovery: true;
  readonly notNewHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffCompletion: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffWithdrawal: true;
  readonly notHandoffRecall: true;
  readonly notHercmReentry: true;
  readonly notHgaMatrixActType: true;
}

/**
 * Assessment for whether a lawful HGA REC-01/03/04/05 re-entry act may be performed (R126–R139).
 */
export interface GovernedHandoffReentryAssessment {
  readonly mayReenter: boolean;
  readonly denialReasons: readonly string[];
  readonly authorityClassId: HandoffGovernanceAuthorityClassId | null;
  readonly hercmCategory: HercmReentryCategoryId | null;
  readonly entryCurrency: HandoffEntryCurrency | null;
  readonly bindingCurrency: HandoffConsumerBindingCurrency | null;
  readonly authorizationCurrency: HandoffAuthorizationCurrency | null;
  readonly postureDeclarationCurrency: HandoffPostureDeclarationCurrency | null;
  readonly gpraValidityPosture: GpraValidityPosture | null;
  readonly eligibilityLayerCondition: HandoffEligibilityLayerCondition | null;
  readonly constitutionalBasisKind: ReentryConstitutionalBasisKind | null;
  readonly qualifyingPriorState: HercmQualifyingPriorState | null;
  readonly predecessorWithdrawalActId: GovernedHandoffWithdrawalActId | null;
  readonly predecessorRecallActId: GovernedHandoffRecallActId | null;
  readonly requiresNewPostureAfterNewAuthorization: boolean;
  readonly returnsTowardEligibleForConsiderationOnly: true;
  readonly requiresNewAuthorizationViaG2: true;
  readonly doesNotResurrectAuthorization: true;
  readonly doesNotResurrectPosture: true;
  readonly doesNotAuthorizeActMintViaCatalogAlone: true;
  readonly doesNotAuthorizeActMintViaExportReadyAlone: true;
  readonly doesNotAuthorizeActMintViaAdvisoryAlone: true;
  readonly doesNotAuthorizeAutomaticRecovery: true;
  readonly notNewHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffCompletion: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffWithdrawal: true;
  readonly notHandoffRecall: true;
  readonly notHercmResumption: true;
  readonly notHgaMatrixActType: true;
}

/**
 * Operative HGA Handoff resumption act (REC-02) — FI-DSN-STD-015-R126–R139.
 * Restores forward reliance on the EXISTING authorization + posture chain after
 * Suspension. Does NOT authorize anew, declare posture, complete, or reenter.
 * R140–R141 catalog membership is matrix; minting remains the HERCM path, not a
 * generic HGA factory. Persisted `notHgaMatrixActType` is the pre-R140 mint-path
 * marker and remains lawful on historical records.
 */
export interface GovernedHandoffResumptionActRecord {
  readonly resumptionActId: GovernedHandoffResumptionActId;
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-015-001";
  readonly authorityConstitutionalScope: "handoff_resumption_act";
  readonly hercmCategory: HercmResumptionCategoryId;
  readonly resumedBy: string;
  readonly resumedAt: string;
  readonly entryId: GovernedHandoffEntryId;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly authorizationActId: GovernedHandoffAuthorizationActId;
  readonly postureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly resumedSuspensionActId: GovernedHandoffSuspensionActId;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerClassId: HccmConsumerClassId;
  readonly declaredPostureClass: HandoffPostureClass | null;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly hercmQualifyingPriorState: HercmQualifyingPriorState;
  readonly constitutionalBasisKind: ResumptionConstitutionalBasisKind;
  readonly constitutionalBasisProvenance: ResumptionConstitutionalBasisProvenance;
  readonly forwardRelianceRestoredOnExistingAuthorization: true;
  readonly samePostureChainRetained: true;
  readonly doesNotMintNewAuthorization: true;
  readonly doesNotMintNewPostureDeclaration: true;
  readonly doesNotEraseSuspensionHistory: true;
  readonly doesNotEraseWithdrawalHistory: true;
  readonly doesNotEraseRecallHistory: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffWithdrawal: true;
  readonly notHandoffRecall: true;
  readonly notHandoffCompletion: true;
  readonly notHercmReentry: true;
  readonly notRestoration: true;
  readonly notAutomaticRecovery: true;
  readonly effectFraming: "forward_reliance_resumption_on_existing_authorization";
  readonly hoemResumptionRecord: HoemResumptionOperativeRecord;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly notDownstreamAcceptance: true;
  readonly notPermanentCollectionMembership: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotCollapsePeerDecisionClasses: true;
  readonly doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory: true;
  readonly doesNotMergeAcrossConsumerClasses: true;
  readonly notAutomaticHslmPromotion: true;
  readonly hslmProjectionFromActFacts: true;
  readonly hslmRemainsEightStates: true;
  readonly notHgaMatrixActType: true;
  /** R126 — distinct peer NON-matrix HGA resumption act-type attribution. */
  readonly r126DistinctHercmResumptionAct: true;
  /** R127 — closed HERCM category set REC-01..REC-05. */
  readonly r127ClosedHercmCategorySet: true;
  /** R128 — export_ready / eligibility authorize consideration only, never the act. */
  readonly r128ExportReadyAuthorizesConsiderationOnly: true;
  /** R129 — no automatic recovery; Invalidated/Superseded GPRA blocks predecessor-context HERCM. */
  readonly r129NoAutomaticRecoveryAndInvalidatedBlocks: true;
  /** R130 — one HCCM binding; at most one authoritative posture chain. */
  readonly r130SingleBindingPostureChain: true;
  /** R131 — REC-02 category conditions satisfied (suspension grounds cleared, not withdrawal/recall). */
  readonly r131CategoryConditionsSatisfied: true;
  /** R132 — restores forward reliance on the EXISTING authorization + posture; mints neither. */
  readonly r132ForwardRelianceOnExistingAuthorization: true;
  /** R133 — same posture chain as the suspension; qualifying prior state required. */
  readonly r133SamePostureChainAndQualifyingPriorState: true;
  /** R134 — prospective from resumedAt; no retroactive rewrite. */
  readonly r134ProspectiveFromResumedAtNoRewrite: true;
  /** R135 — additive preservation of all prior Handoff constitutional history. */
  readonly r135AdditivePreservationOfPriorHistory: true;
  /** R136 — additive HOEM resumption record with REC category + prior-state linkage. */
  readonly r136HoemResumptionOperativeRecord: true;
  /** R137 — not automatic HSLM promotion; HSLM remains exactly eight states. */
  readonly r137NotAutomaticHslmPromotionHslmStaysEight: true;
  /** R138 — invalid attempts are non-operative. */
  readonly r138InvalidAttemptsNonOperative: true;
  /** R139 — repeated HERCM acts are additive and substitute for no peer act. */
  readonly r139RepeatedHercmActsAdditiveNotSubstitute: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}

/**
 * Operative HGA Handoff re-entry act (REC-01/03/04/05) — FI-DSN-STD-015-R126–R139.
 * Returns the binding toward Eligible-for-consideration only. Requires NEW
 * authorization via HOF-G2 afterward; REC-04 additionally requires a new posture
 * declaration after the new authorization. Does NOT resurrect withdrawn/recalled
 * authorization or posture. R140–R141 catalog membership is matrix; minting remains
 * the HERCM path. Persisted `notHgaMatrixActType` remains lawful on historical records.
 */
export interface GovernedHandoffReentryActRecord {
  readonly reentryActId: GovernedHandoffReentryActId;
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly authorityGoverningSourceId: "PD-STD-015-001";
  readonly authorityConstitutionalScope: "handoff_reentry_act";
  readonly hercmCategory: HercmReentryCategoryId;
  readonly reenteredBy: string;
  readonly reenteredAt: string;
  readonly entryId: GovernedHandoffEntryId;
  readonly bindingId: GovernedHandoffConsumerBindingId;
  readonly predecessorAuthorizationActId: GovernedHandoffAuthorizationActId;
  readonly predecessorPostureDeclarationActId: GovernedHandoffPostureDeclarationActId | null;
  readonly predecessorWithdrawalActId: GovernedHandoffWithdrawalActId | null;
  readonly predecessorRecallActId: GovernedHandoffRecallActId | null;
  /** Rejected is denotation-only and expiry acts are deferred — these stay null. */
  readonly predecessorRejectionAttributionId: null;
  readonly predecessorExpiryActId: null;
  readonly hercmQualifyingPriorState: HercmQualifyingPriorState;
  readonly preparationId: GovernedHandoffPreparationId;
  readonly gpraId: GpraId;
  readonly approvalActId: ApprovalActId;
  readonly reviewId: ProductionReadinessReviewId;
  readonly determinationId: ReviewDeterminationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly handoffConsumerContextId: string;
  readonly consumerClassId: HccmConsumerClassId;
  readonly declaredPostureClass: HandoffPostureClass | null;
  readonly consumedHcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly consumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
  readonly constitutionalBasisKind: ReentryConstitutionalBasisKind;
  readonly constitutionalBasisProvenance: ReentryConstitutionalBasisProvenance;
  readonly returnsTowardEligibleForConsiderationOnly: true;
  readonly requiresNewAuthorizationViaG2: true;
  readonly requiresNewPostureAfterNewAuthorization: boolean;
  readonly doesNotResurrectAuthorization: true;
  readonly doesNotResurrectPosture: true;
  readonly doesNotMintNewAuthorization: true;
  readonly doesNotMintNewPostureDeclaration: true;
  readonly doesNotEraseSuspensionHistory: true;
  readonly doesNotEraseWithdrawalHistory: true;
  readonly doesNotEraseRecallHistory: true;
  readonly notHandoffSuspension: true;
  readonly notHandoffWithdrawal: true;
  readonly notHandoffRecall: true;
  readonly notHandoffCompletion: true;
  readonly notHercmResumption: true;
  readonly notRestoration: true;
  readonly notAutomaticRecovery: true;
  readonly effectFraming: "return_toward_eligible_for_consideration";
  readonly hoemReentryRecord: HoemReentryOperativeRecord;
  readonly notHandoffAuthorization: true;
  readonly notHandoffPostureDeclaration: true;
  readonly notHandoffExecution: true;
  readonly notDownstreamAcceptance: true;
  readonly notPermanentCollectionMembership: true;
  readonly doesNotAuthorizeManufacturingOrFulfillment: true;
  readonly doesNotCollapsePeerDecisionClasses: true;
  readonly doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory: true;
  readonly doesNotMergeAcrossConsumerClasses: true;
  readonly notAutomaticHslmPromotion: true;
  readonly hslmProjectionFromActFacts: true;
  readonly hslmRemainsEightStates: true;
  readonly notHgaMatrixActType: true;
  /** R126 — distinct peer NON-matrix HGA re-entry act-type attribution. */
  readonly r126DistinctHercmReentryAct: true;
  /** R127 — closed HERCM category set REC-01..REC-05. */
  readonly r127ClosedHercmCategorySet: true;
  /** R128 — export_ready / eligibility authorize consideration only, never the act. */
  readonly r128ExportReadyAuthorizesConsiderationOnly: true;
  /** R129 — no automatic recovery; Invalidated/Superseded GPRA blocks predecessor-context HERCM. */
  readonly r129NoAutomaticRecoveryAndInvalidatedBlocks: true;
  /** R130 — one HCCM binding; at most one authoritative posture chain. */
  readonly r130SingleBindingPostureChain: true;
  /** R131 — category conditions satisfied for REC-01/03/04/05. */
  readonly r131CategoryConditionsSatisfied: true;
  /** R132 — returns toward Eligible-for-consideration only; new G2 authorization required after. */
  readonly r132ReturnTowardEligibleRequiresNewAuthorization: true;
  /** R133 — qualifying prior state required. */
  readonly r133QualifyingPriorStateRequired: true;
  /** R134 — prospective from reenteredAt; no retroactive rewrite. */
  readonly r134ProspectiveFromReenteredAtNoRewrite: true;
  /** R135 — additive preservation of all prior Handoff constitutional history. */
  readonly r135AdditivePreservationOfPriorHistory: true;
  /** R136 — additive HOEM re-entry record with REC category + prior-state linkage. */
  readonly r136HoemReentryOperativeRecord: true;
  /** R137 — not automatic HSLM promotion; HSLM remains exactly eight states. */
  readonly r137NotAutomaticHslmPromotionHslmStaysEight: true;
  /** R138 — invalid attempts are non-operative. */
  readonly r138InvalidAttemptsNonOperative: true;
  /** R139 — repeated HERCM acts are additive and substitute for no peer act. */
  readonly r139RepeatedHercmActsAdditiveNotSubstitute: true;
  readonly audit: ConstitutionalAuditMetadata;
  readonly traceability: Std015GovernanceTraceability;
  readonly governedCreationMarker: Domain3GovernedCreationMarker;
}
