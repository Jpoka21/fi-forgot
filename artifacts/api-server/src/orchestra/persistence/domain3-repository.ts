/**
 * Governed Domain 3 repository — Review Entry Eligibility / Production-readiness Review admission.
 * FI-DSN-STD-014-R08 through R13.
 */

import type { Domain2Repository } from "./domain2-repository.js";
import { createInMemoryDomain3Storage } from "./domain3-in-memory-storage.js";
import type { Domain3StoragePort } from "./domain3-storage-port.js";
import { validatePersistedProductionReadinessReview } from "./domain3-validation.js";
import type {
  ProductionReadinessReview,
  ProductionReadinessReviewId,
} from "../domain3-types.js";
import type {
  RealizationTraceabilityPackage,
  RealizedVisualArtifactId,
} from "../domain2-types.js";
import { OrchestraConstitutionalError } from "../errors.js";
import { admitProductionReadinessReview } from "../review-entry-eligibility.js";

/**
 * Narrow Domain 2 read surface consumed by Domain 3 Review entry.
 * Domain 3 must not mutate Domain 2 constitutional state.
 */
export type Domain2ReviewEntrySource = Pick<
  Domain2Repository,
  "loadRva" | "loadReviewEntryReadinessByRva" | "assembleTraceabilityPackage"
>;

export interface Domain3Repository {
  /**
   * Admit a Review-Entry Ready RVA into production-readiness Review (Under Review).
   * Consumes Domain 2 readiness and package; does not recreate Domain 2 readiness.
   */
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
}

function assertLivePackageConsistentWithEntry(
  entryPackage: RealizationTraceabilityPackage,
  livePackage: RealizationTraceabilityPackage,
): void {
  if (
    entryPackage.rvaId !== livePackage.rvaId ||
    entryPackage.programId !== livePackage.programId ||
    entryPackage.obligationId !== livePackage.obligationId ||
    entryPackage.realizationCommitmentId !== livePackage.realizationCommitmentId ||
    entryPackage.rvaPosture !== livePackage.rvaPosture ||
    entryPackage.realizationPath !== livePackage.realizationPath ||
    entryPackage.lineage.rootRvaId !== livePackage.lineage.rootRvaId ||
    entryPackage.lineage.versionSequence !== livePackage.lineage.versionSequence ||
    entryPackage.lineage.priorVersionId !== livePackage.lineage.priorVersionId
  ) {
    throw new OrchestraConstitutionalError(
      "Review-Entry Readiness evidence is stale relative to live Domain 2 Traceability Package",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R10"],
    );
  }
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
    return Object.freeze(structuredClone(loaded));
  }

  return {
    async admitToProductionReadinessReview(input) {
      const rva = await domain2.loadRva(input.rvaId);
      if (!rva) {
        throw new OrchestraConstitutionalError(
          "RVA not found for Review entry",
          "invalid_review_entry_eligibility",
          ["FI-DSN-STD-014-R08"],
        );
      }

      const readiness = await domain2.loadReviewEntryReadinessByRva(input.rvaId);
      if (!readiness) {
        throw new OrchestraConstitutionalError(
          "Missing Review-Entry Readiness for Review entry",
          "invalid_review_entry_eligibility",
          ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R09"],
        );
      }

      const livePackage = await domain2.assembleTraceabilityPackage({ rvaId: input.rvaId });
      assertLivePackageConsistentWithEntry(readiness.traceabilityPackage, livePackage);

      const existingActive = await storage.getActiveProductionReadinessReviewByRva(input.rvaId);
      if (existingActive) {
        throw new OrchestraConstitutionalError(
          "Duplicate Production-readiness Review admission rejected while Under Review",
          "invalid_review_entry_eligibility",
          ["FI-DSN-STD-014-R08"],
        );
      }

      const review = admitProductionReadinessReview({
        rva,
        reviewEntryReadiness: readiness,
        traceabilityPackage: readiness.traceabilityPackage,
        admittedBy: input.admittedBy,
      });

      return persistReview(review);
    },

    async loadProductionReadinessReview(reviewId) {
      const loaded = await storage.getProductionReadinessReview(reviewId);
      if (!loaded) return null;
      validatePersistedProductionReadinessReview(loaded);
      return Object.freeze(structuredClone(loaded));
    },

    async loadActiveProductionReadinessReviewByRva(rvaId) {
      const loaded = await storage.getActiveProductionReadinessReviewByRva(rvaId);
      if (!loaded) return null;
      validatePersistedProductionReadinessReview(loaded);
      return Object.freeze(structuredClone(loaded));
    },
  };
}
