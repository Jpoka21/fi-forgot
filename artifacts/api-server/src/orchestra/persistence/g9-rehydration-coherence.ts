/**
 * G9 persisted constitutional coherence — GPRA Supersession / Succession.
 *
 * Rehydration must reject contradictory predecessor/successor GPRA / Approval /
 * Review / supersession linkage. Does not repair history. Does not mutate Domain 2.
 */

import type { RealizedVisualArtifact } from "../domain2-types.js";
import type {
  ApprovalActRecord,
  GpraGrantRecord,
  GpraSupersessionActRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";
import { isCanonicalEstablishedSupersessionAuthorityClassId } from "../supersession-authority.js";
import { isMandatorySupersessionTriggerFamily } from "../supersession-trigger-families.js";
import { assertPersistedGpraGrantCoherence } from "./g6-rehydration-coherence.js";

export function assertPersistedGpraSupersessionCoherence(input: {
  supersession: GpraSupersessionActRecord;
  predecessorGpra: GpraGrantRecord;
  successorGpra: GpraGrantRecord;
  predecessorApproval: ApprovalActRecord;
  successorApproval: ApprovalActRecord;
  predecessorReview: ProductionReadinessReview;
  successorReview: ProductionReadinessReview;
  predecessorDetermination: ReviewDeterminationRecord;
  successorDetermination: ReviewDeterminationRecord;
  predecessorEvidenceRecords: readonly ReviewEvidenceRecord[];
  predecessorActivityRecords: readonly ReviewDimensionActivityRecord[];
  successorEvidenceRecords: readonly ReviewEvidenceRecord[];
  successorActivityRecords: readonly ReviewDimensionActivityRecord[];
  /**
   * Caller-supplied storage fact: predecessor already has Invalidated posture.
   * R70 — Invalidated cannot become Superseded.
   */
  predecessorInvalidated: boolean;
  /**
   * Caller-supplied storage fact: predecessor already has a supersession act
   * (duplicate / already superseded in context).
   */
  predecessorAlreadySupersededInContext: boolean;
  /** Optional Domain 2 RVAs — when both provided, require same lineage.rootRvaId. */
  predecessorRva?: RealizedVisualArtifact | null;
  successorRva?: RealizedVisualArtifact | null;
}): void {
  assertPersistedGpraGrantCoherence({
    gpra: input.predecessorGpra,
    approval: input.predecessorApproval,
    review: input.predecessorReview,
    determination: input.predecessorDetermination,
    evidenceRecords: input.predecessorEvidenceRecords,
    activityRecords: input.predecessorActivityRecords,
  });
  assertPersistedGpraGrantCoherence({
    gpra: input.successorGpra,
    approval: input.successorApproval,
    review: input.successorReview,
    determination: input.successorDetermination,
    evidenceRecords: input.successorEvidenceRecords,
    activityRecords: input.successorActivityRecords,
  });

  const { supersession } = input;

  if (!isCanonicalEstablishedSupersessionAuthorityClassId(supersession.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession SSAC authority class is not established",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R68"],
    );
  }
  if (!isMandatorySupersessionTriggerFamily(supersession.stFamily)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession ST family is not a mandatory ST family",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R66"],
    );
  }

  if (input.predecessorInvalidated) {
    throw new OrchestraConstitutionalError(
      "Invalidated predecessor cannot become Superseded; replacement after Invalidated remains G8/G6 path without supersession act",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R70"],
    );
  }
  if (input.predecessorAlreadySupersededInContext) {
    throw new OrchestraConstitutionalError(
      "Predecessor GPRA already has a supersession act; duplicate supersession is forbidden",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69", "FI-DSN-STD-014-R70"],
    );
  }

  if (supersession.predecessorGpraId !== input.predecessorGpra.gpraId) {
    throw new OrchestraConstitutionalError(
      "Supersession act predecessor GPRA identity does not match provided predecessor grant",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
  if (supersession.successorGpraId !== input.successorGpra.gpraId) {
    throw new OrchestraConstitutionalError(
      "Supersession act successor GPRA identity does not match provided successor grant",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }

  if (
    supersession.predecessorApprovalActId !== input.predecessorGpra.approvalActId ||
    supersession.predecessorApprovalActId !== input.predecessorApproval.approvalActId ||
    supersession.successorApprovalActId !== input.successorGpra.approvalActId ||
    supersession.successorApprovalActId !== input.successorApproval.approvalActId
  ) {
    throw new OrchestraConstitutionalError(
      "Supersession act Approval identities do not match GPRA grant lineages",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }

  if (
    supersession.predecessorReviewId !== input.predecessorReview.reviewId ||
    supersession.predecessorReviewId !== input.predecessorGpra.reviewId ||
    supersession.successorReviewId !== input.successorReview.reviewId ||
    supersession.successorReviewId !== input.successorGpra.reviewId ||
    supersession.predecessorDeterminationId !== input.predecessorDetermination.determinationId ||
    supersession.predecessorDeterminationId !== input.predecessorGpra.determinationId ||
    supersession.successorDeterminationId !== input.successorDetermination.determinationId ||
    supersession.successorDeterminationId !== input.successorGpra.determinationId
  ) {
    throw new OrchestraConstitutionalError(
      "Supersession act Review/Determination identities do not match GPRA grant lineages",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }

  if (
    supersession.predecessorRvaId !== input.predecessorGpra.rvaId ||
    supersession.successorRvaId !== input.successorGpra.rvaId ||
    supersession.programId !== input.predecessorGpra.programId ||
    supersession.programId !== input.successorGpra.programId
  ) {
    throw new OrchestraConstitutionalError(
      "Supersession act RVA/Program does not match predecessor/successor GPRA subjects",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }

  if (
    supersession.stFamily === "replacement_gpra_grant" ||
    supersession.stFamily === "authoritative_succession_rule"
  ) {
    if (
      supersession.obligationId !== input.predecessorGpra.obligationId ||
      supersession.obligationId !== input.successorGpra.obligationId ||
      input.predecessorGpra.obligationId !== input.successorGpra.obligationId
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted ST-1/ST-2 supersession requires matching Production Obligation across act and both GPRAs",
        "invalid_gpra_supersession",
        ["FI-DSN-STD-014-R66", "FI-DSN-STD-014-R69"],
      );
    }
  } else if (supersession.obligationId !== input.successorGpra.obligationId) {
    throw new OrchestraConstitutionalError(
      "Persisted ST-3 supersession obligationId must match successor GPRA obligation",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R66", "FI-DSN-STD-014-R69"],
    );
  }

  if (input.predecessorGpra.programId !== input.successorGpra.programId) {
    throw new OrchestraConstitutionalError(
      "Foreign program mismatch between predecessor and successor GPRA for supersession",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }

  if (
    supersession.historicalPredecessorPreserved !== true ||
    supersession.determinationNotRevised !== true ||
    supersession.notLifecycleTermination !== true ||
    supersession.notInvalidation !== true ||
    supersession.predecessorForwardAuthorityTerminatedInContext !== true ||
    supersession.successorAuthoritativeInContext !== true ||
    supersession.cannotOverwritePredecessor !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession must preserve historical predecessor, forbid overwrite, and terminate predecessor forward authority in context without invalidation or lifecycle termination",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R70", "FI-DSN-STD-014-R71"],
    );
  }

  if (input.predecessorRva && input.successorRva) {
    if (input.predecessorRva.lineage.rootRvaId !== input.successorRva.lineage.rootRvaId) {
      throw new OrchestraConstitutionalError(
        "Persisted GPRA supersession predecessor and successor RVAs must share Domain 2 lineage.rootRvaId",
        "invalid_gpra_supersession",
        ["FI-DSN-STD-014-R69"],
      );
    }
  }
}
