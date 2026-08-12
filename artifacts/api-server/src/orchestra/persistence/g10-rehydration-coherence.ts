/**
 * G10 persisted Brain advisory coherence — FI-DSN-STD-014-R73–R82.
 *
 * Rehydration must reject forged stage/class, wrong attribution, binding claims,
 * and foreign Review / Determination / GPRA linkage. Does not mutate constitutional records.
 */

import {
  assertOutputClassAllowedForStage,
  isDomain3BrainOutputClass,
  isDomain3DecisionStage,
} from "../brain-domain3-decision-stage.js";
import {
  DOMAIN3_REEVALUATION_REQUEST_ALLOWED_STAGES,
  DOMAIN3_REEVALUATION_REQUEST_ROUTE,
  isDomain3BrainAuthorityRouteKind,
  isDomain3BrainReevaluationRequestType,
} from "../brain-domain3-advisory.js";
import type {
  Domain3BrainAdvisoryRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
} from "../domain3-types.js";
import { OrchestraConstitutionalError } from "../errors.js";

export function assertPersistedDomain3BrainAdvisoryCoherence(input: {
  advisory: Domain3BrainAdvisoryRecord;
  /** When advisory.reviewId is set, review must be provided and match. */
  review?: ProductionReadinessReview | null;
  determination?: ReviewDeterminationRecord | null;
  gpra?: GpraGrantRecord | null;
}): void {
  const { advisory } = input;

  if (advisory.nonbinding !== true) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory must be marked nonbinding",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78", "FI-DSN-STD-014-R76"],
    );
  }
  if (
    advisory.notConstitutionalAuthority !== true ||
    advisory.distinguishableFromConstitutionalActs !== true ||
    advisory.doesNotCompelConstitutionalAction !== true ||
    advisory.doesNotAuthorize !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory must carry non-authority BRPAM markers",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R73", "FI-DSN-STD-014-R78", "FI-DSN-STD-014-R79"],
    );
  }

  if (
    advisory.sourceAttribution !== "brain_runtime" &&
    advisory.sourceAttribution !== "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory sourceAttribution must be brain_runtime or writing_engine",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }

  if (!isDomain3DecisionStage(advisory.decisionStage)) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory has forged or unknown decisionStage",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R77"],
    );
  }
  if (!isDomain3BrainOutputClass(advisory.outputClass)) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory has forged or unknown outputClass",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R75"],
    );
  }
  assertOutputClassAllowedForStage(advisory.decisionStage, advisory.outputClass);

  if (advisory.outputClass === "nonbinding_reevaluation_request") {
    if (
      !advisory.reevaluationRequestType ||
      !isDomain3BrainReevaluationRequestType(advisory.reevaluationRequestType)
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory requires valid reevaluationRequestType",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    if (
      !advisory.routesToAuthorityKind ||
      !isDomain3BrainAuthorityRouteKind(advisory.routesToAuthorityKind)
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory requires valid routesToAuthorityKind",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    const expected = DOMAIN3_REEVALUATION_REQUEST_ROUTE[advisory.reevaluationRequestType];
    if (advisory.routesToAuthorityKind !== expected) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory route does not match BRRM pairing",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    const stages = DOMAIN3_REEVALUATION_REQUEST_ALLOWED_STAGES[advisory.reevaluationRequestType];
    if (!(stages as readonly string[]).includes(advisory.decisionStage)) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory stage does not match request type",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R77", "FI-DSN-STD-014-R80"],
      );
    }
  } else if (
    advisory.reevaluationRequestType != null ||
    advisory.routesToAuthorityKind != null
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted non-reevaluation advisory must not carry reevaluation routing fields",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R80"],
    );
  }

  if (advisory.reviewId) {
    if (!input.review) {
      throw new OrchestraConstitutionalError(
        "Persisted Brain advisory with reviewId requires Review for coherence",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R78"],
      );
    }
    if (input.review.reviewId !== advisory.reviewId) {
      throw new OrchestraConstitutionalError(
        "Brain advisory reviewId does not match provided Review",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R78"],
      );
    }
    if (
      advisory.programId !== input.review.programId ||
      advisory.obligationId !== input.review.obligationId ||
      advisory.rvaId !== input.review.rvaId
    ) {
      throw new OrchestraConstitutionalError(
        "Brain advisory Program/Obligation/RVA does not match Review lineage",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R78"],
      );
    }

    if (advisory.determinationId) {
      if (!input.determination) {
        throw new OrchestraConstitutionalError(
          "Brain advisory determinationId requires Determination for coherence",
          "invalid_domain3_brain_advisory",
          ["FI-DSN-STD-014-R78"],
        );
      }
      if (
        input.determination.determinationId !== advisory.determinationId ||
        input.determination.reviewId !== advisory.reviewId ||
        (input.review.determinationId != null &&
          input.review.determinationId !== advisory.determinationId)
      ) {
        throw new OrchestraConstitutionalError(
          "Brain advisory Determination does not match Review lineage",
          "invalid_domain3_brain_advisory",
          ["FI-DSN-STD-014-R78"],
        );
      }
    }

    if (advisory.gpraId) {
      if (!input.gpra) {
        throw new OrchestraConstitutionalError(
          "Brain advisory gpraId requires GPRA grant for coherence",
          "invalid_domain3_brain_advisory",
          ["FI-DSN-STD-014-R78"],
        );
      }
      if (
        input.gpra.gpraId !== advisory.gpraId ||
        input.gpra.reviewId !== advisory.reviewId ||
        input.gpra.programId !== advisory.programId ||
        input.gpra.obligationId !== advisory.obligationId ||
        input.gpra.rvaId !== advisory.rvaId
      ) {
        throw new OrchestraConstitutionalError(
          "Brain advisory GPRA does not match Review lineage",
          "invalid_domain3_brain_advisory",
          ["FI-DSN-STD-014-R78"],
        );
      }
    }
  } else if (advisory.decisionStage !== "pre_review") {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory without reviewId is only coherent at pre_review",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R77", "FI-DSN-STD-014-R78"],
    );
  }
}
