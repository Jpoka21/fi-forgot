/**
 * Governed Domain 3 repository — G2 Review entry + G3 Review activity (R14–R20).
 */

import type { Domain2Repository } from "./domain2-repository.js";
import { createInMemoryDomain3Storage } from "./domain3-in-memory-storage.js";
import {
  rehydrateProductionReadinessReview,
  rehydrateReviewDimensionActivity,
  rehydrateReviewEvidence,
} from "./domain3-rehydration.js";
import type { Domain3StoragePort } from "./domain3-storage-port.js";
import { validatePersistedProductionReadinessReview } from "./domain3-validation.js";
import type {
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
import { OrchestraConstitutionalError } from "../errors.js";
import {
  createReviewDimensionActivityRecord,
  createReviewEvidenceRecord,
  evaluateMandatoryReviewActivityCompleteness,
} from "../review-activity.js";
import { admitProductionReadinessReview } from "../review-entry-eligibility.js";
import type { MandatoryReviewDimensionId } from "../review-dimensions.js";

/**
 * Narrow Domain 2 read surface consumed by Domain 3 Review entry.
 * Domain 3 must not mutate Domain 2 constitutional state.
 */
export type Domain2ReviewEntrySource = Pick<
  Domain2Repository,
  "assertReviewEntryReadinessCurrentForAdmission"
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

  /**
   * Pure completeness query over persisted G3 activity — not Determination/GPRA.
   */
  evaluateMandatoryReviewActivityCompleteness(
    reviewId: ProductionReadinessReviewId,
  ): Promise<MandatoryReviewActivityCompleteness>;
}

export function createDomain3Repository(domain2: Domain2ReviewEntrySource): Domain3Repository {
  return createDomain3RepositoryWithStorage(domain2, createInMemoryDomain3Storage());
}

export function createDomain3RepositoryWithStorage(
  domain2: Domain2ReviewEntrySource,
  storage: Domain3StoragePort,
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

      await storage.putReviewEvidence(evidence);
      await storage.putReviewDimensionActivity(activity);

      const loadedEvidence = await storage.getReviewEvidence(evidence.evidenceId);
      const loadedActivity = await storage.getReviewDimensionActivity(activity.activityId);
      if (!loadedEvidence || !loadedActivity) {
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
