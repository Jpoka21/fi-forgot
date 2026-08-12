/**
 * Governed Domain 3 repository — G2–G6 (Review through GPRA grant).
 */

import type { Domain2Repository } from "./domain2-repository.js";
import type { Domain1Repository } from "./domain1-repository.js";
import { createInMemoryDomain3Storage } from "./domain3-in-memory-storage.js";
import {
  rehydrateApprovalAct,
  rehydrateApprovalWithholding,
  rehydrateDesignTimeFeasibilityEvaluation,
  rehydrateGpraGrant,
  rehydrateProductionReadinessReview,
  rehydrateReviewDetermination,
  rehydrateReviewDimensionActivity,
  rehydrateReviewEvidence,
} from "./domain3-rehydration.js";
import type { Domain3StoragePort } from "./domain3-storage-port.js";
import {
  validatePersistedApprovalAct,
  validatePersistedApprovalWithholding,
  validatePersistedDesignTimeFeasibilityEvaluation,
  validatePersistedGpraGrant,
  validatePersistedProductionReadinessReview,
  validatePersistedReviewDetermination,
} from "./domain3-validation.js";
import type {
  ApprovalActId,
  ApprovalActRecord,
  ApprovalAuthorityClassId,
  ApprovalConsiderationEligibility,
  ApprovalWithholdingGroundFamily,
  ApprovalWithholdingId,
  ApprovalWithholdingRecord,
  DesignTimeFeasibilityEvaluationId,
  DesignTimeFeasibilityEvaluationRecord,
  DesignTimeFeasibilityObservationKind,
  GpraGrantRecord,
  GpraId,
  MandatoryReviewActivityCompleteness,
  ProductionReadinessReview,
  ProductionReadinessReviewId,
  ReviewDeterminationId,
  ReviewDeterminationOutcome,
  ReviewDeterminationRecord,
  ReviewDimensionActivityId,
  ReviewDimensionActivityRecord,
  ReviewEvidenceId,
  ReviewEvidenceRecord,
  ReviewEvidenceSourceKind,
} from "../domain3-types.js";
import type { RealizedVisualArtifactId } from "../domain2-types.js";
import {
  createApprovalAct,
  createApprovalWithholding,
  createGpraGrant,
  evaluateApprovalConsiderationEligibility,
} from "../approval-and-gpra.js";
import {
  attachDesignTimeFeasibilityEvidenceLinkage,
  buildDesignTimeFeasibilityEvidenceSnapshot,
  createDesignTimeFeasibilityEvaluation,
  DESIGN_TIME_FEASIBILITY_DIMENSION_ID,
} from "../design-time-feasibility.js";
import { OrchestraConstitutionalError } from "../errors.js";
import {
  createFrozenManufacturingAuthoritySource,
  type ManufacturingAuthoritySource,
} from "../manufacturing-authority.js";
import {
  createReviewDimensionActivityRecord,
  createReviewEvidenceRecord,
  evaluateMandatoryReviewActivityCompleteness,
} from "../review-activity.js";
import { createReviewDetermination } from "../review-determination.js";
import { admitProductionReadinessReview } from "../review-entry-eligibility.js";
import type { MandatoryReviewDimensionId } from "../review-dimensions.js";
import { isTerminalRvaPosture } from "../rva-lifecycle.js";
import { assertProgramIsActiveAuthority, isActiveProgramPosture } from "../transitions.js";
import type { ProductionObligationId, ProductionProgramId } from "../types.js";

/**
 * Narrow Domain 2 read surface consumed by Domain 3.
 * Domain 3 must not mutate Domain 2 constitutional state.
 */
export type Domain2ReviewEntrySource = Pick<
  Domain2Repository,
  "assertReviewEntryReadinessCurrentForAdmission" | "assembleTraceabilityPackage" | "loadRva"
>;

/** Narrow Domain 1 Program surface for G6 Program/Obligation activation checks. */
export type Domain1ProgramSource = Pick<
  Domain1Repository,
  "loadProgram" | "isConstitutionallyCurrent"
>;

export interface Domain3Repository {
  admitToProductionReadinessReview(input: {
    rvaId: RealizedVisualArtifactId;
    admittedBy: string;
  }): Promise<ProductionReadinessReview>;

  loadProductionReadinessReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ProductionReadinessReview | null>;

  loadActiveProductionReadinessReviewByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<ProductionReadinessReview | null>;

  /**
   * Record immutable Review evidence and append dimension activity (R14–R20).
   * Does not produce Review Determination, Approval, or GPRA.
   */
  recordReviewDimensionActivity(input: {
    reviewId: ProductionReadinessReviewId;
    dimensionId: MandatoryReviewDimensionId;
    sourceKind: ReviewEvidenceSourceKind;
    sourceRecordId: string;
    sourceSnapshot: string;
    observation: string;
    recordedBy: string;
  }): Promise<{
    evidence: ReviewEvidenceRecord;
    activity: ReviewDimensionActivityRecord;
  }>;

  /**
   * G4 Design-Time Feasibility evaluation under design_time_feasibility (R21–R26).
   * Internally creates governed G3 evidence/activity; does not create Determination/GPRA.
   */
  recordDesignTimeFeasibilityEvaluation(input: {
    reviewId: ProductionReadinessReviewId;
    evaluationMethodDescription: string;
    observations: readonly {
      kind: DesignTimeFeasibilityObservationKind;
      text: string;
      relatedSourceStandardId?: string;
    }[];
    /**
     * Required R26 affirmation: DTF is performed at decision stage without
     * Manufacturing Validation or Fulfillment Execution waiving the evaluation.
     */
    affirmsDecisionStageWithoutManufacturingExecution: true;
    evaluatedBy: string;
  }): Promise<{
    evaluation: DesignTimeFeasibilityEvaluationRecord;
    evidence: ReviewEvidenceRecord;
    activity: ReviewDimensionActivityRecord;
  }>;

  listReviewEvidenceByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly ReviewEvidenceRecord[]>;

  listReviewDimensionActivitiesByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly ReviewDimensionActivityRecord[]>;

  loadReviewEvidence(evidenceId: ReviewEvidenceId): Promise<ReviewEvidenceRecord | null>;

  loadReviewDimensionActivity(
    activityId: ReviewDimensionActivityId,
  ): Promise<ReviewDimensionActivityRecord | null>;

  loadDesignTimeFeasibilityEvaluation(
    evaluationId: DesignTimeFeasibilityEvaluationId,
  ): Promise<DesignTimeFeasibilityEvaluationRecord | null>;

  listDesignTimeFeasibilityEvaluationsByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<readonly DesignTimeFeasibilityEvaluationRecord[]>;

  /**
   * Pure completeness query over persisted G3 activity — not Determination/GPRA.
   * Readable while under_review or after review_determined.
   */
  evaluateMandatoryReviewActivityCompleteness(
    reviewId: ProductionReadinessReviewId,
  ): Promise<MandatoryReviewActivityCompleteness>;

  /**
   * G5 Review Determination Outcomes (R27–R33).
   * Completes the Review (review_determined); does not grant Approval or GPRA.
   */
  recordReviewDetermination(input: {
    reviewId: ProductionReadinessReviewId;
    outcome: ReviewDeterminationOutcome;
    conditions?: readonly string[];
    grounds: string;
    determinedBy: string;
  }): Promise<{
    determination: ReviewDeterminationRecord;
    review: ProductionReadinessReview;
  }>;

  loadReviewDetermination(
    determinationId: ReviewDeterminationId,
  ): Promise<ReviewDeterminationRecord | null>;

  loadReviewDeterminationByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ReviewDeterminationRecord | null>;

  /** R34 — Approval consideration eligibility (not Approval, not GPRA). */
  evaluateApprovalConsiderationEligibility(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ApprovalConsiderationEligibility>;

  /**
   * R38/R41 — record Approval act after Pass. Does not create GPRA.
   */
  recordApprovalAct(input: {
    reviewId: ProductionReadinessReviewId;
    authorityClassId: ApprovalAuthorityClassId;
    approvedBy: string;
  }): Promise<ApprovalActRecord>;

  /**
   * R39–R40 — withhold Approval after Pass on EGWG grounds. Preserves Pass Determination.
   */
  withholdApproval(input: {
    reviewId: ProductionReadinessReviewId;
    groundFamily: ApprovalWithholdingGroundFamily;
    grounds: string;
    withheldBy: string;
    additionalGoverningSourceId?: string | null;
  }): Promise<ApprovalWithholdingRecord>;

  /**
   * R42–R43 — explicit GPRA grant after Approval. Binds RVA under Production Obligation.
   */
  grantGpra(input: {
    reviewId: ProductionReadinessReviewId;
    grantedBy: string;
  }): Promise<GpraGrantRecord>;

  loadApprovalAct(approvalActId: ApprovalActId): Promise<ApprovalActRecord | null>;
  loadApprovalActByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ApprovalActRecord | null>;
  loadApprovalWithholding(
    withholdingId: ApprovalWithholdingId,
  ): Promise<ApprovalWithholdingRecord | null>;
  loadApprovalWithholdingByReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ApprovalWithholdingRecord | null>;
  loadGpraGrant(gpraId: GpraId): Promise<GpraGrantRecord | null>;
  loadGpraGrantByReview(reviewId: ProductionReadinessReviewId): Promise<GpraGrantRecord | null>;
  loadGpraGrantByRvaObligation(input: {
    rvaId: RealizedVisualArtifactId;
    obligationId: ProductionObligationId;
  }): Promise<GpraGrantRecord | null>;
}

export function createDomain3Repository(
  domain2: Domain2ReviewEntrySource,
  manufacturingAuthority: ManufacturingAuthoritySource = createFrozenManufacturingAuthoritySource(),
  domain1?: Domain1ProgramSource,
): Domain3Repository {
  return createDomain3RepositoryWithStorage(
    domain2,
    createInMemoryDomain3Storage(),
    manufacturingAuthority,
    domain1,
  );
}

export function createDomain3RepositoryWithStorage(
  domain2: Domain2ReviewEntrySource,
  storage: Domain3StoragePort,
  manufacturingAuthority: ManufacturingAuthoritySource = createFrozenManufacturingAuthoritySource(),
  domain1?: Domain1ProgramSource,
): Domain3Repository {
  async function persistReview(
    review: ProductionReadinessReview,
  ): Promise<ProductionReadinessReview> {
    validatePersistedProductionReadinessReview(review);
    const existingActive = await storage.getActiveProductionReadinessReviewByRva(review.rvaId);
    if (existingActive && existingActive.reviewId !== review.reviewId) {
      throw new OrchestraConstitutionalError(
        "Active Production-readiness Review already exists for this RVA",
        "invalid_review_entry_eligibility",
        ["FI-DSN-STD-014-R08"],
      );
    }
    await storage.putProductionReadinessReview(review);
    const loaded = await storage.getProductionReadinessReview(review.reviewId);
    if (!loaded) {
      throw new OrchestraConstitutionalError(
        "Failed to persist Production-readiness Review",
        "invalid_domain3_persistence_state",
        ["FI-DSN-STD-014-R08"],
      );
    }
    return rehydrateProductionReadinessReview(loaded);
  }

  async function requireExistingReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ProductionReadinessReview> {
    const raw = await storage.getProductionReadinessReview(reviewId);
    if (!raw) {
      throw new OrchestraConstitutionalError(
        "Production-readiness Review not found",
        "invalid_review_activity",
        ["FI-DSN-STD-014-R14"],
      );
    }
    return rehydrateProductionReadinessReview(raw);
  }

  /**
   * Load persisted Review, Determination, evidence, and activity for G6 rehydration.
   * Rejects missing or contradictory Review↔Determination linkage before trust.
   */
  async function loadG6AuthorityRehydrationContext(reviewId: ProductionReadinessReviewId): Promise<{
    review: ProductionReadinessReview;
    determination: ReviewDeterminationRecord;
    evidenceRecords: readonly ReviewEvidenceRecord[];
    activityRecords: readonly ReviewDimensionActivityRecord[];
  }> {
    const reviewRaw = await storage.getProductionReadinessReview(reviewId);
    if (!reviewRaw) {
      throw new OrchestraConstitutionalError(
        "G6 authority requires persisted Production-readiness Review",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34"],
      );
    }
    const review = rehydrateProductionReadinessReview(reviewRaw);
    if (review.posture !== "review_determined" || !review.determinationId) {
      throw new OrchestraConstitutionalError(
        "G6 authority requires completed Review with Determination linkage",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }

    const byId = await storage.getReviewDetermination(review.determinationId);
    const byReview = await storage.getReviewDeterminationByReview(review.reviewId);
    if (!byId) {
      throw new OrchestraConstitutionalError(
        "review.determinationId points to no persisted Determination",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }
    if (!byReview || byReview.determinationId !== byId.determinationId) {
      throw new OrchestraConstitutionalError(
        "Contradictory Review Determination linkage blocks G6 authority rehydration",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }

    const determination = rehydrateReviewDetermination(byId);
    const evidenceRecords = await storage.listReviewEvidenceByReview(review.reviewId);
    const activityRecords = await storage.listReviewDimensionActivitiesByReview(review.reviewId);
    return { review, determination, evidenceRecords, activityRecords };
  }

  async function rehydrateTrustedApprovalAct(raw: ApprovalActRecord): Promise<ApprovalActRecord> {
    const context = await loadG6AuthorityRehydrationContext(raw.reviewId);
    return rehydrateApprovalAct(raw, context);
  }

  async function rehydrateTrustedApprovalWithholding(
    raw: ApprovalWithholdingRecord,
  ): Promise<ApprovalWithholdingRecord> {
    const context = await loadG6AuthorityRehydrationContext(raw.reviewId);
    return rehydrateApprovalWithholding(raw, context);
  }

  async function rehydrateTrustedGpraGrant(raw: GpraGrantRecord): Promise<GpraGrantRecord> {
    const context = await loadG6AuthorityRehydrationContext(raw.reviewId);
    const approvalRaw = await storage.getApprovalAct(raw.approvalActId);
    if (!approvalRaw) {
      throw new OrchestraConstitutionalError(
        "GPRA requires a persisted Approval act; missing Approval cannot support GPRA rehydration",
        "invalid_gpra_grant",
        ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R42"],
      );
    }
    // Structural Approval validation only here — joint Approval↔Review coherence runs inside rehydrateGpraGrant.
    return rehydrateGpraGrant(raw, { ...context, approval: approvalRaw });
  }

  async function requireUnderReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ProductionReadinessReview> {
    const review = await requireExistingReview(reviewId);
    if (review.posture !== "under_review") {
      throw new OrchestraConstitutionalError(
        "Review activity requires Under Review posture",
        "invalid_review_activity",
        ["FI-DSN-STD-014-R14"],
      );
    }
    return review;
  }

  async function assertEvidenceBasisIntegrity(
    review: ProductionReadinessReview,
    determination: ReviewDeterminationRecord,
  ): Promise<void> {
    for (const evidenceId of determination.evidenceBasisIds) {
      const evidence = await storage.getReviewEvidence(evidenceId);
      if (!evidence) {
        throw new OrchestraConstitutionalError(
          "Review Determination evidence basis references nonexistent evidence",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R30"],
        );
      }
      if (evidence.reviewId !== review.reviewId || evidence.rvaId !== review.rvaId) {
        throw new OrchestraConstitutionalError(
          "Review Determination evidence basis does not belong to the subject Review",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R30"],
        );
      }
    }
    for (const activityId of determination.activityBasisIds) {
      const activity = await storage.getReviewDimensionActivity(activityId);
      if (!activity) {
        throw new OrchestraConstitutionalError(
          "Review Determination activity basis references nonexistent activity",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R30"],
        );
      }
      if (activity.reviewId !== review.reviewId || activity.rvaId !== review.rvaId) {
        throw new OrchestraConstitutionalError(
          "Review Determination activity basis does not belong to the subject Review",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R30"],
        );
      }
      for (const evidenceId of activity.evidenceIds) {
        const linked = await storage.getReviewEvidence(evidenceId);
        if (!linked || linked.reviewId !== review.reviewId) {
          throw new OrchestraConstitutionalError(
            "Review activity evidence basis contains unresolved or foreign evidence",
            "invalid_review_determination",
            ["FI-DSN-STD-014-R30"],
          );
        }
      }
    }
  }

  /**
   * G6 trust boundary: jointly resolve Review ↔ Determination and re-verify evidence basis.
   */
  async function requireLinkedPassDeterminationForApproval(
    reviewId: ProductionReadinessReviewId,
  ): Promise<{
    review: ProductionReadinessReview;
    determination: ReviewDeterminationRecord;
  }> {
    const review = await requireExistingReview(reviewId);
    if (review.posture !== "review_determined" || !review.determinationId) {
      throw new OrchestraConstitutionalError(
        "Approval requires completed Review with Determination linkage",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34"],
      );
    }

    const byReview = await storage.getReviewDeterminationByReview(review.reviewId);
    const byId = await storage.getReviewDetermination(review.determinationId);
    if (!byReview || !byId) {
      throw new OrchestraConstitutionalError(
        "Review Determination required for Approval is missing",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }
    if (byReview.determinationId !== byId.determinationId) {
      throw new OrchestraConstitutionalError(
        "Contradictory Review Determination linkage blocks Approval",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }
    if (review.determinationId !== byId.determinationId) {
      throw new OrchestraConstitutionalError(
        "review.determinationId does not resolve to the persisted Determination for this Review",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R35"],
      );
    }

    const determination = rehydrateReviewDetermination(byId);
    await assertEvidenceBasisIntegrity(review, determination);

    if (!domain1) {
      throw new OrchestraConstitutionalError(
        "Approval requires Domain 1 Program authority source for Program/Obligation activation",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R39"],
      );
    }

    const program = await domain1.loadProgram(review.programId);
    if (!program) {
      throw new OrchestraConstitutionalError(
        "Approval requires existing Production Program",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R39"],
      );
    }
    assertProgramIsActiveAuthority(program.posture);
    if (!isActiveProgramPosture(program.posture)) {
      throw new OrchestraConstitutionalError(
        "Approval requires active Production Program authority",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R39"],
      );
    }
    const current = await domain1.isConstitutionallyCurrent(program);
    if (!current) {
      throw new OrchestraConstitutionalError(
        "Approval requires constitutionally current Production Program",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R39"],
      );
    }
    const obligation = program.obligations.find((item) => item.id === review.obligationId);
    if (!obligation) {
      throw new OrchestraConstitutionalError(
        "Approval requires Review Production Obligation on the Program",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R43"],
      );
    }

    const rva = await domain2.loadRva(review.rvaId);
    if (!rva) {
      throw new OrchestraConstitutionalError(
        "Approval requires the reviewed RVA to exist",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R34", "FI-DSN-STD-014-R43"],
      );
    }
    if (isTerminalRvaPosture(rva.posture)) {
      throw new OrchestraConstitutionalError(
        "Approval cannot bind a superseded or invalidated RVA",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R43"],
      );
    }
    if (rva.id !== review.rvaId || rva.programId !== review.programId || rva.obligationId !== review.obligationId) {
      throw new OrchestraConstitutionalError(
        "Live RVA identity does not match Review subject for Approval",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R43"],
      );
    }

    return { review, determination };
  }

  async function persistEvidenceAndActivity(input: {
    evidence: ReviewEvidenceRecord;
    activity: ReviewDimensionActivityRecord;
  }): Promise<{
    evidence: ReviewEvidenceRecord;
    activity: ReviewDimensionActivityRecord;
  }> {
    await storage.putReviewEvidence(input.evidence);
    const loadedEvidence = await storage.getReviewEvidence(input.evidence.evidenceId);
    if (!loadedEvidence) {
      throw new OrchestraConstitutionalError(
        "Failed to persist Review evidence before dimension activity",
        "invalid_domain3_persistence_state",
        ["FI-DSN-STD-014-R20", "FI-DSN-STD-014-R25"],
      );
    }

    for (const evidenceId of input.activity.evidenceIds) {
      const linked = await storage.getReviewEvidence(evidenceId);
      if (!linked) {
        throw new OrchestraConstitutionalError(
          "Review dimension activity references nonexistent Review evidence",
          "invalid_review_activity",
          ["FI-DSN-STD-014-R20"],
        );
      }
    }

    await storage.putReviewDimensionActivity(input.activity);
    const loadedActivity = await storage.getReviewDimensionActivity(input.activity.activityId);
    if (!loadedActivity) {
      throw new OrchestraConstitutionalError(
        "Failed to persist Review dimension activity",
        "invalid_domain3_persistence_state",
        ["FI-DSN-STD-014-R14", "FI-DSN-STD-014-R20"],
      );
    }

    return {
      evidence: rehydrateReviewEvidence(loadedEvidence),
      activity: rehydrateReviewDimensionActivity(loadedActivity),
    };
  }

  return {
    async admitToProductionReadinessReview(input) {
      let freshness;
      try {
        freshness = await domain2.assertReviewEntryReadinessCurrentForAdmission({
          rvaId: input.rvaId,
        });
      } catch (error) {
        if (error instanceof OrchestraConstitutionalError) {
          throw new OrchestraConstitutionalError(
            error.message,
            "invalid_review_entry_eligibility",
            ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R09", "FI-DSN-STD-014-R10"],
          );
        }
        throw error;
      }

      const existingActive = await storage.getActiveProductionReadinessReviewByRva(input.rvaId);
      if (existingActive) {
        throw new OrchestraConstitutionalError(
          "Duplicate Production-readiness Review admission rejected while Under Review",
          "invalid_review_entry_eligibility",
          ["FI-DSN-STD-014-R08"],
        );
      }

      const review = admitProductionReadinessReview({
        rva: freshness.rva,
        reviewEntryReadiness: freshness.readiness,
        traceabilityPackage: freshness.readiness.traceabilityPackage,
        admittedBy: input.admittedBy,
      });

      return persistReview(review);
    },

    async loadProductionReadinessReview(reviewId) {
      const loaded = await storage.getProductionReadinessReview(reviewId);
      if (!loaded) return null;
      return rehydrateProductionReadinessReview(loaded);
    },

    async loadActiveProductionReadinessReviewByRva(rvaId) {
      const loaded = await storage.getActiveProductionReadinessReviewByRva(rvaId);
      if (!loaded) return null;
      return rehydrateProductionReadinessReview(loaded);
    },

    async recordReviewDimensionActivity(input) {
      const review = await requireUnderReview(input.reviewId);

      const evidence = createReviewEvidenceRecord({
        review,
        dimensionId: input.dimensionId,
        sourceKind: input.sourceKind,
        sourceRecordId: input.sourceRecordId,
        sourceSnapshot: input.sourceSnapshot,
        capturedBy: input.recordedBy,
      });

      const activity = createReviewDimensionActivityRecord({
        review,
        dimensionId: input.dimensionId,
        evidence: [evidence],
        observation: input.observation,
        addressedBy: input.recordedBy,
      });

      return persistEvidenceAndActivity({ evidence, activity });
    },

    async recordDesignTimeFeasibilityEvaluation(input) {
      const review = await requireUnderReview(input.reviewId);

      const livePackage = await domain2.assembleTraceabilityPackage({
        rvaId: review.rvaId,
      });

      if (livePackage.rvaId !== review.rvaId) {
        throw new OrchestraConstitutionalError(
          "Design-Time Feasibility package RVA does not match Review subject",
          "invalid_design_time_feasibility",
          ["FI-DSN-STD-014-R21"],
        );
      }

      if (
        livePackage.programId !== review.programId ||
        livePackage.obligationId !== review.obligationId
      ) {
        throw new OrchestraConstitutionalError(
          "Design-Time Feasibility package Program/Obligation does not match Review subject",
          "invalid_design_time_feasibility",
          ["FI-DSN-STD-014-R21"],
        );
      }

      const draftEvaluation = createDesignTimeFeasibilityEvaluation({
        review,
        manufacturingAuthority,
        programComplianceBoundaries: livePackage.complianceBoundaryBindings,
        evaluationMethodDescription: input.evaluationMethodDescription,
        observations: input.observations,
        affirmsDecisionStageWithoutManufacturingExecution:
          input.affirmsDecisionStageWithoutManufacturingExecution,
        evaluatedBy: input.evaluatedBy,
      });

      const snapshot = buildDesignTimeFeasibilityEvidenceSnapshot(draftEvaluation);
      const evidence = createReviewEvidenceRecord({
        review,
        dimensionId: DESIGN_TIME_FEASIBILITY_DIMENSION_ID,
        sourceKind: "compliance_boundary",
        sourceRecordId: draftEvaluation.evaluationId,
        sourceSnapshot: snapshot,
        capturedBy: input.evaluatedBy,
        capturedAt: draftEvaluation.evaluatedAt,
      });

      const observationSummary = input.observations.map((item) => item.text).join("; ");
      const activity = createReviewDimensionActivityRecord({
        review,
        dimensionId: DESIGN_TIME_FEASIBILITY_DIMENSION_ID,
        evidence: [evidence],
        observation: `Design-Time Feasibility evaluation ${draftEvaluation.evaluationId}: ${observationSummary}`,
        addressedBy: input.evaluatedBy,
        addressedAt: draftEvaluation.evaluatedAt,
      });

      const persisted = await persistEvidenceAndActivity({ evidence, activity });

      const linked = attachDesignTimeFeasibilityEvidenceLinkage(
        draftEvaluation,
        [persisted.evidence.evidenceId],
        persisted.activity.activityId,
      );

      validatePersistedDesignTimeFeasibilityEvaluation(linked);
      await storage.putDesignTimeFeasibilityEvaluation(linked);
      const loadedEvaluation = await storage.getDesignTimeFeasibilityEvaluation(
        linked.evaluationId,
      );
      if (!loadedEvaluation) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Design-Time Feasibility evaluation",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R21", "FI-DSN-STD-014-R25"],
        );
      }

      return {
        evaluation: rehydrateDesignTimeFeasibilityEvaluation(loadedEvaluation),
        evidence: persisted.evidence,
        activity: persisted.activity,
      };
    },

    async listReviewEvidenceByReview(reviewId) {
      await requireExistingReview(reviewId);
      const list = await storage.listReviewEvidenceByReview(reviewId);
      return Object.freeze(list.map((item) => rehydrateReviewEvidence(item)));
    },

    async listReviewDimensionActivitiesByReview(reviewId) {
      await requireExistingReview(reviewId);
      const list = await storage.listReviewDimensionActivitiesByReview(reviewId);
      return Object.freeze(list.map((item) => rehydrateReviewDimensionActivity(item)));
    },

    async loadReviewEvidence(evidenceId) {
      const loaded = await storage.getReviewEvidence(evidenceId);
      if (!loaded) return null;
      return rehydrateReviewEvidence(loaded);
    },

    async loadReviewDimensionActivity(activityId) {
      const loaded = await storage.getReviewDimensionActivity(activityId);
      if (!loaded) return null;
      return rehydrateReviewDimensionActivity(loaded);
    },

    async loadDesignTimeFeasibilityEvaluation(evaluationId) {
      const loaded = await storage.getDesignTimeFeasibilityEvaluation(evaluationId);
      if (!loaded) return null;
      return rehydrateDesignTimeFeasibilityEvaluation(loaded);
    },

    async listDesignTimeFeasibilityEvaluationsByReview(reviewId) {
      await requireExistingReview(reviewId);
      const list = await storage.listDesignTimeFeasibilityEvaluationsByReview(reviewId);
      return Object.freeze(list.map((item) => rehydrateDesignTimeFeasibilityEvaluation(item)));
    },

    async evaluateMandatoryReviewActivityCompleteness(reviewId) {
      const review = await requireExistingReview(reviewId);
      const activities = await storage.listReviewDimensionActivitiesByReview(reviewId);
      const frozenActivities = activities.map((item) => rehydrateReviewDimensionActivity(item));
      return evaluateMandatoryReviewActivityCompleteness({
        review,
        activities: frozenActivities,
      });
    },

    async recordReviewDetermination(input) {
      const review = await requireExistingReview(input.reviewId);

      if (review.posture === "review_determined" || review.determinationId !== null) {
        throw new OrchestraConstitutionalError(
          "Exactly one Review Determination may be recorded per completed Review",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R27"],
        );
      }

      if (review.posture !== "under_review") {
        throw new OrchestraConstitutionalError(
          "Review Determination requires Under Review posture",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R27"],
        );
      }

      const existing = await storage.getReviewDeterminationByReview(review.reviewId);
      if (existing) {
        throw new OrchestraConstitutionalError(
          "Exactly one Review Determination may be recorded per completed Review",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R27"],
        );
      }

      const evidenceRaw = await storage.listReviewEvidenceByReview(review.reviewId);
      const activitiesRaw = await storage.listReviewDimensionActivitiesByReview(review.reviewId);
      const evidence = evidenceRaw.map((item) => rehydrateReviewEvidence(item));
      const activities = activitiesRaw.map((item) => rehydrateReviewDimensionActivity(item));

      const completeness = evaluateMandatoryReviewActivityCompleteness({
        review,
        activities,
      });

      const { determination, completedReview } = createReviewDetermination({
        review,
        completeness,
        evidence,
        activities,
        outcome: input.outcome,
        conditions: input.conditions,
        grounds: input.grounds,
        determinedBy: input.determinedBy,
      });

      validatePersistedReviewDetermination(determination);
      await assertEvidenceBasisIntegrity(review, determination);

      try {
        await storage.putReviewDetermination(determination);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Review Determination",
          "invalid_review_determination",
          ["FI-DSN-STD-014-R27"],
        );
      }

      const persistedReview = await persistReview(completedReview);

      const loadedDetermination = await storage.getReviewDetermination(
        determination.determinationId,
      );
      if (!loadedDetermination) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Review Determination",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R27"],
        );
      }

      if (persistedReview.determinationId !== determination.determinationId) {
        throw new OrchestraConstitutionalError(
          "Review Determination linkage integrity failure after persistence",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R27"],
        );
      }

      return {
        determination: rehydrateReviewDetermination(loadedDetermination),
        review: persistedReview,
      };
    },

    async loadReviewDetermination(determinationId) {
      const loaded = await storage.getReviewDetermination(determinationId);
      if (!loaded) return null;
      return rehydrateReviewDetermination(loaded);
    },

    async loadReviewDeterminationByReview(reviewId) {
      const loaded = await storage.getReviewDeterminationByReview(reviewId);
      if (!loaded) return null;
      return rehydrateReviewDetermination(loaded);
    },

    async evaluateApprovalConsiderationEligibility(reviewId) {
      const review = await requireExistingReview(reviewId);
      let determination: ReviewDeterminationRecord | null = null;
      if (review.determinationId) {
        const raw = await storage.getReviewDetermination(review.determinationId);
        const byReview = await storage.getReviewDeterminationByReview(review.reviewId);
        if (
          raw &&
          byReview &&
          raw.determinationId === byReview.determinationId &&
          review.determinationId === raw.determinationId
        ) {
          determination = rehydrateReviewDetermination(raw);
        }
      }
      const withholdingRaw = await storage.getApprovalWithholdingByReview(reviewId);
      const approvalRaw = await storage.getApprovalActByReview(reviewId);
      return evaluateApprovalConsiderationEligibility({
        review,
        determination,
        withholding: withholdingRaw
          ? await rehydrateTrustedApprovalWithholding(withholdingRaw)
          : null,
        existingApproval: approvalRaw
          ? await rehydrateTrustedApprovalAct(approvalRaw)
          : null,
      });
    },

    async recordApprovalAct(input) {
      const { review, determination } = await requireLinkedPassDeterminationForApproval(
        input.reviewId,
      );
      const existingWithholding = await storage.getApprovalWithholdingByReview(review.reviewId);
      if (existingWithholding) {
        throw new OrchestraConstitutionalError(
          "Approval act blocked by recorded Approval withholding after Pass",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R39"],
        );
      }
      const existingApproval = await storage.getApprovalActByReview(review.reviewId);
      if (existingApproval) {
        throw new OrchestraConstitutionalError(
          "Exactly one Approval act may be recorded per completed Review",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R41"],
        );
      }

      const approval = createApprovalAct({
        review,
        determination,
        authorityClassId: input.authorityClassId,
        approvedBy: input.approvedBy,
      });
      validatePersistedApprovalAct(approval);
      try {
        await storage.putApprovalAct(approval);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Approval act",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R41"],
        );
      }
      const loaded = await storage.getApprovalAct(approval.approvalActId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Approval act",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R41"],
        );
      }
      return rehydrateTrustedApprovalAct(loaded);
    },

    async withholdApproval(input) {
      const { review, determination } = await requireLinkedPassDeterminationForApproval(
        input.reviewId,
      );
      const existingApproval = await storage.getApprovalActByReview(review.reviewId);
      if (existingApproval) {
        throw new OrchestraConstitutionalError(
          "Cannot withhold Approval after Approval act has been recorded",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R39"],
        );
      }
      const existingWithholding = await storage.getApprovalWithholdingByReview(review.reviewId);
      if (existingWithholding) {
        throw new OrchestraConstitutionalError(
          "Exactly one Approval withholding may be recorded per Review",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R39"],
        );
      }

      const withholding = createApprovalWithholding({
        review,
        determination,
        groundFamily: input.groundFamily,
        grounds: input.grounds,
        withheldBy: input.withheldBy,
        additionalGoverningSourceId: input.additionalGoverningSourceId,
      });
      validatePersistedApprovalWithholding(withholding);
      try {
        await storage.putApprovalWithholding(withholding);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist Approval withholding",
          "invalid_approval_authority",
          ["FI-DSN-STD-014-R39"],
        );
      }
      const loaded = await storage.getApprovalWithholding(withholding.withholdingId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist Approval withholding",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R39"],
        );
      }
      return rehydrateTrustedApprovalWithholding(loaded);
    },

    async grantGpra(input) {
      const { review, determination } = await requireLinkedPassDeterminationForApproval(
        input.reviewId,
      );
      const existingWithholding = await storage.getApprovalWithholdingByReview(review.reviewId);
      if (existingWithholding) {
        throw new OrchestraConstitutionalError(
          "GPRA grant blocked by Approval withholding",
          "invalid_gpra_grant",
          ["FI-DSN-STD-014-R39", "FI-DSN-STD-014-R42"],
        );
      }
      const approvalRaw = await storage.getApprovalActByReview(review.reviewId);
      if (!approvalRaw) {
        throw new OrchestraConstitutionalError(
          "GPRA requires a prior Approval act; Approval is necessary but not sufficient and does not auto-create GPRA",
          "invalid_gpra_grant",
          ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R42"],
        );
      }
      const approval = await rehydrateTrustedApprovalAct(approvalRaw);
      const existingGpra = await storage.getGpraGrantByReview(review.reviewId);
      if (existingGpra) {
        throw new OrchestraConstitutionalError(
          "Exactly one GPRA grant may be recorded per Review",
          "invalid_gpra_grant",
          ["FI-DSN-STD-014-R42", "FI-DSN-STD-014-R43"],
        );
      }
      const existingByScope = await storage.getGpraGrantByRvaObligation(
        review.rvaId,
        review.obligationId,
      );
      if (existingByScope) {
        throw new OrchestraConstitutionalError(
          "GPRA already exists for this RVA under the Production Obligation; supersession is deferred to G9",
          "invalid_gpra_grant",
          ["FI-DSN-STD-014-R43"],
        );
      }

      const gpra = createGpraGrant({
        review,
        determination,
        approval,
        grantedBy: input.grantedBy,
      });
      validatePersistedGpraGrant(gpra);
      try {
        await storage.putGpraGrant(gpra);
      } catch (error) {
        throw new OrchestraConstitutionalError(
          error instanceof Error ? error.message : "Failed to persist GPRA grant",
          "invalid_gpra_grant",
          ["FI-DSN-STD-014-R42"],
        );
      }
      const loaded = await storage.getGpraGrant(gpra.gpraId);
      if (!loaded) {
        throw new OrchestraConstitutionalError(
          "Failed to persist GPRA grant",
          "invalid_domain3_persistence_state",
          ["FI-DSN-STD-014-R42"],
        );
      }
      return rehydrateTrustedGpraGrant(loaded);
    },

    async loadApprovalAct(approvalActId) {
      const loaded = await storage.getApprovalAct(approvalActId);
      if (!loaded) return null;
      return rehydrateTrustedApprovalAct(loaded);
    },

    async loadApprovalActByReview(reviewId) {
      const loaded = await storage.getApprovalActByReview(reviewId);
      if (!loaded) return null;
      return rehydrateTrustedApprovalAct(loaded);
    },

    async loadApprovalWithholding(withholdingId) {
      const loaded = await storage.getApprovalWithholding(withholdingId);
      if (!loaded) return null;
      return rehydrateTrustedApprovalWithholding(loaded);
    },

    async loadApprovalWithholdingByReview(reviewId) {
      const loaded = await storage.getApprovalWithholdingByReview(reviewId);
      if (!loaded) return null;
      return rehydrateTrustedApprovalWithholding(loaded);
    },

    async loadGpraGrant(gpraId) {
      const loaded = await storage.getGpraGrant(gpraId);
      if (!loaded) return null;
      return rehydrateTrustedGpraGrant(loaded);
    },

    async loadGpraGrantByReview(reviewId) {
      const loaded = await storage.getGpraGrantByReview(reviewId);
      if (!loaded) return null;
      return rehydrateTrustedGpraGrant(loaded);
    },

    async loadGpraGrantByRvaObligation(input) {
      const loaded = await storage.getGpraGrantByRvaObligation(input.rvaId, input.obligationId);
      if (!loaded) return null;
      return rehydrateTrustedGpraGrant(loaded);
    },
  };
}
