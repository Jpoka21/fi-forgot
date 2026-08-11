/**
 * Governed Domain 3 repository — G2 entry + G3 activity + G4 Design-Time Feasibility.
 */

import type { Domain2Repository } from "./domain2-repository.js";
import { createInMemoryDomain3Storage } from "./domain3-in-memory-storage.js";
import {
  rehydrateDesignTimeFeasibilityEvaluation,
  rehydrateProductionReadinessReview,
  rehydrateReviewDimensionActivity,
  rehydrateReviewEvidence,
} from "./domain3-rehydration.js";
import type { Domain3StoragePort } from "./domain3-storage-port.js";
import {
  validatePersistedDesignTimeFeasibilityEvaluation,
  validatePersistedProductionReadinessReview,
} from "./domain3-validation.js";
import type {
  DesignTimeFeasibilityEvaluationId,
  DesignTimeFeasibilityEvaluationRecord,
  DesignTimeFeasibilityObservationKind,
  MandatoryReviewActivityCompleteness,
  ProductionReadinessReview,
  ProductionReadinessReviewId,
  ReviewDimensionActivityId,
  ReviewDimensionActivityRecord,
  ReviewEvidenceId,
  ReviewEvidenceRecord,
  ReviewEvidenceSourceKind,
} from "../domain3-types.js";
import type { RealizedVisualArtifactId } from "../domain2-types.js";
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
import { admitProductionReadinessReview } from "../review-entry-eligibility.js";
import type { MandatoryReviewDimensionId } from "../review-dimensions.js";

/**
 * Narrow Domain 2 read surface consumed by Domain 3.
 * Domain 3 must not mutate Domain 2 constitutional state.
 */
export type Domain2ReviewEntrySource = Pick<
  Domain2Repository,
  "assertReviewEntryReadinessCurrentForAdmission" | "assembleTraceabilityPackage"
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
   */
  evaluateMandatoryReviewActivityCompleteness(
    reviewId: ProductionReadinessReviewId,
  ): Promise<MandatoryReviewActivityCompleteness>;
}

export function createDomain3Repository(
  domain2: Domain2ReviewEntrySource,
  manufacturingAuthority: ManufacturingAuthoritySource = createFrozenManufacturingAuthoritySource(),
): Domain3Repository {
  return createDomain3RepositoryWithStorage(
    domain2,
    createInMemoryDomain3Storage(),
    manufacturingAuthority,
  );
}

export function createDomain3RepositoryWithStorage(
  domain2: Domain2ReviewEntrySource,
  storage: Domain3StoragePort,
  manufacturingAuthority: ManufacturingAuthoritySource = createFrozenManufacturingAuthoritySource(),
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

  async function requireUnderReview(
    reviewId: ProductionReadinessReviewId,
  ): Promise<ProductionReadinessReview> {
    const raw = await storage.getProductionReadinessReview(reviewId);
    if (!raw) {
      throw new OrchestraConstitutionalError(
        "Production-readiness Review not found for Review activity",
        "invalid_review_activity",
        ["FI-DSN-STD-014-R14"],
      );
    }
    const review = rehydrateProductionReadinessReview(raw);
    if (review.posture !== "under_review") {
      throw new OrchestraConstitutionalError(
        "Review activity requires Under Review posture",
        "invalid_review_activity",
        ["FI-DSN-STD-014-R14"],
      );
    }
    return review;
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
      await requireUnderReview(reviewId);
      const list = await storage.listReviewEvidenceByReview(reviewId);
      return Object.freeze(list.map((item) => rehydrateReviewEvidence(item)));
    },

    async listReviewDimensionActivitiesByReview(reviewId) {
      await requireUnderReview(reviewId);
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
      await requireUnderReview(reviewId);
      const list = await storage.listDesignTimeFeasibilityEvaluationsByReview(reviewId);
      return Object.freeze(list.map((item) => rehydrateDesignTimeFeasibilityEvaluation(item)));
    },

    async evaluateMandatoryReviewActivityCompleteness(reviewId) {
      const review = await requireUnderReview(reviewId);
      const activities = await storage.listReviewDimensionActivitiesByReview(reviewId);
      const frozenActivities = activities.map((item) => rehydrateReviewDimensionActivity(item));
      return evaluateMandatoryReviewActivityCompleteness({
        review,
        activities: frozenActivities,
      });
    },
  };
}
