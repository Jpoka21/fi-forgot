/**
 * Design-Time Feasibility integration — FI-DSN-STD-014-R21 through R26 (G4).
 * Produces DTF Review evidence under the existing G3 design_time_feasibility dimension.
 * Does not record Review Determination, Approval, or GPRA.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import type { ComplianceBoundaryBinding } from "./compliance-boundary.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  DesignTimeFeasibilityEvaluationId,
  DesignTimeFeasibilityEvaluationRecord,
  DesignTimeFeasibilityObservationKind,
  ProductionReadinessReview,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertFrozenBindingManufacturingAuthority,
  isCanonicalFrozenBindingFiMfgStandardId,
  resolveCanonicalFrozenBindingBoundary,
  type ManufacturingAuthoritySource,
  type ManufacturingComplianceBoundaryReference,
} from "./manufacturing-authority.js";
import { createDomain3GovernanceTraceability } from "./domain3-authority.js";

export const DESIGN_TIME_FEASIBILITY_TRACEABILITY = createDomain3GovernanceTraceability([
  "FI-DSN-STD-014-R21",
  "FI-DSN-STD-014-R22",
  "FI-DSN-STD-014-R23",
  "FI-DSN-STD-014-R24",
  "FI-DSN-STD-014-R25",
  "FI-DSN-STD-014-R26",
]);

export const DESIGN_TIME_FEASIBILITY_DIMENSION_ID = "design_time_feasibility" as const;

const PROHIBITED_OUTCOME_PATTERN =
  /\b(pass|fail|failed|approved|rejected|gpra|production[_\s-]?ready|determination)\b/i;

function assertNoProhibitedOutcomeLanguage(text: string, field: string): void {
  if (PROHIBITED_OUTCOME_PATTERN.test(text)) {
    throw new OrchestraConstitutionalError(
      `Design-Time Feasibility ${field} must not encode Review Determination, Approval, or GPRA language`,
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R22", "FI-DSN-STD-014-R25"],
    );
  }
}

export function createDesignTimeFeasibilityEvaluationId(): DesignTimeFeasibilityEvaluationId {
  return `design-time-feasibility-evaluation-${randomUUID()}` as DesignTimeFeasibilityEvaluationId;
}

/**
 * Applicable FI-MFG-* set = program-bound Compliance Boundaries whose sourceStandardId
 * is in the canonical frozen binding catalog (R21 / STD-012 obligation scope).
 * Injectable ManufacturingAuthoritySource cannot expand this eligibility set.
 */
export function resolveApplicableManufacturingBoundaries(input: {
  manufacturingAuthority: ManufacturingAuthoritySource;
  programComplianceBoundaries: readonly ComplianceBoundaryBinding[];
}): {
  applicable: readonly ManufacturingComplianceBoundaryReference[];
  consideredNonApplicableSourceStandardIds: readonly string[];
} {
  // Retain parameter for repository call-site compatibility; eligibility is canonical-only.
  void input.manufacturingAuthority;

  const applicable: ManufacturingComplianceBoundaryReference[] = [];
  const seen = new Set<string>();
  const consideredNonApplicable: string[] = [];

  for (const binding of input.programComplianceBoundaries) {
    const id = binding.sourceStandardId.trim();
    if (!id.startsWith("FI-MFG-")) {
      continue;
    }
    if (isCanonicalFrozenBindingFiMfgStandardId(id)) {
      if (!seen.has(id)) {
        seen.add(id);
        const canonical = resolveCanonicalFrozenBindingBoundary(id);
        if (canonical) {
          applicable.push(canonical);
        }
      }
    } else {
      consideredNonApplicable.push(id);
    }
  }

  return {
    applicable: Object.freeze(applicable),
    consideredNonApplicableSourceStandardIds: Object.freeze(consideredNonApplicable),
  };
}

/**
 * Construct append-only Design-Time Feasibility evaluation (R21–R26).
 * Decision-stage only; method-neutral; evidence-oriented — not Determination.
 */
export function createDesignTimeFeasibilityEvaluation(input: {
  review: ProductionReadinessReview;
  manufacturingAuthority: ManufacturingAuthoritySource;
  programComplianceBoundaries: readonly ComplianceBoundaryBinding[];
  /**
   * Method-neutral provenance of how feasibility was assessed (R24).
   * Must not encode Approval / Determination / GPRA.
   */
  evaluationMethodDescription: string;
  /**
   * Decision-stage observations / feasibility concerns for later G5 consumption.
   * Not pass/fail outcomes.
   */
  observations: readonly {
    kind: DesignTimeFeasibilityObservationKind;
    text: string;
    relatedSourceStandardId?: string;
  }[];
  /**
   * Explicit caller assertion that Manufacturing Validation / Fulfillment absence
   * is not being used to waive DTF (R26).
   */
  affirmsDecisionStageWithoutManufacturingExecution: true;
  evaluatedBy: string;
  evaluatedAt?: string;
}): DesignTimeFeasibilityEvaluationRecord {
  if (input.review.posture !== "under_review") {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility requires Production-readiness Review in Under Review posture",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R21", "FI-DSN-STD-014-R14"],
    );
  }

  if (input.affirmsDecisionStageWithoutManufacturingExecution !== true) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility cannot be waived by absence of Manufacturing Validation or Fulfillment Execution",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R26"],
    );
  }

  const method = input.evaluationMethodDescription.trim();
  const evaluatedBy = input.evaluatedBy.trim();
  if (!method || !evaluatedBy) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility requires method-neutral provenance and attributable actor",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R24"],
    );
  }
  assertNoProhibitedOutcomeLanguage(method, "method description");

  if (input.observations.length === 0) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility requires at least one decision-stage observation",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R22", "FI-DSN-STD-014-R25"],
    );
  }

  for (const observation of input.observations) {
    if (!observation.text.trim()) {
      throw new OrchestraConstitutionalError(
        "Design-Time Feasibility observation text is required",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R25"],
      );
    }
    assertNoProhibitedOutcomeLanguage(observation.text, "observation");
    if (observation.relatedSourceStandardId) {
      assertFrozenBindingManufacturingAuthority(
        input.manufacturingAuthority,
        observation.relatedSourceStandardId,
      );
    }
  }

  const { applicable, consideredNonApplicableSourceStandardIds } =
    resolveApplicableManufacturingBoundaries({
      manufacturingAuthority: input.manufacturingAuthority,
      programComplianceBoundaries: input.programComplianceBoundaries,
    });

  // R21: applicable set must be drawn from frozen FI-MFG bindings present on the program.
  // R26: empty applicable set does not waive DTF — record as applicability gap concern evidence.
  if (applicable.length === 0) {
    const hasGapObservation = input.observations.some(
      (item) => item.kind === "applicability_gap",
    );
    if (!hasGapObservation) {
      throw new OrchestraConstitutionalError(
        "When no applicable frozen FI-MFG Compliance Boundaries are bound, Design-Time Feasibility must record an applicability_gap observation — absence of manufacturing execution does not waive evaluation",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R21", "FI-DSN-STD-014-R26"],
      );
    }
  }

  const now = input.evaluatedAt ?? new Date().toISOString();

  return Object.freeze({
    evaluationId: createDesignTimeFeasibilityEvaluationId(),
    reviewId: input.review.reviewId,
    rvaId: input.review.rvaId,
    dimensionId: DESIGN_TIME_FEASIBILITY_DIMENSION_ID,
    applicableManufacturingBoundaries: Object.freeze(
      applicable.map((boundary) =>
        Object.freeze({
          sourceStandardId: boundary.sourceStandardId,
          title: boundary.title,
          kind: boundary.kind,
          bindingPosture: "frozen_binding" as const,
          governingVolume: boundary.governingVolume,
        }),
      ),
    ),
    consideredNonApplicableSourceStandardIds,
    evaluationMethodDescription: method,
    observations: Object.freeze(
      input.observations.map((item) =>
        Object.freeze({
          kind: item.kind,
          text: item.text.trim(),
          relatedSourceStandardId: item.relatedSourceStandardId?.trim(),
        }),
      ),
    ),
    manufacturingValidationNotPerformed: true as const,
    fulfillmentExecutionNotPerformed: true as const,
    decisionStageAffirmed: true as const,
    evaluatedAt: now,
    evaluatedBy,
    evidenceIds: Object.freeze([] as const),
    activityId: null,
    audit: Object.freeze({
      createdAt: now,
      createdBy: evaluatedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: DESIGN_TIME_FEASIBILITY_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}

/**
 * Immutable evidence snapshot for G3 ReviewEvidenceRecord under design_time_feasibility.
 */
export function buildDesignTimeFeasibilityEvidenceSnapshot(
  evaluation: DesignTimeFeasibilityEvaluationRecord,
): string {
  return JSON.stringify({
    evaluationId: evaluation.evaluationId,
    dimensionId: evaluation.dimensionId,
    applicableManufacturingBoundaries: evaluation.applicableManufacturingBoundaries,
    consideredNonApplicableSourceStandardIds:
      evaluation.consideredNonApplicableSourceStandardIds,
    evaluationMethodDescription: evaluation.evaluationMethodDescription,
    observations: evaluation.observations,
    manufacturingValidationNotPerformed: evaluation.manufacturingValidationNotPerformed,
    fulfillmentExecutionNotPerformed: evaluation.fulfillmentExecutionNotPerformed,
    decisionStageAffirmed: evaluation.decisionStageAffirmed,
    evaluatedAt: evaluation.evaluatedAt,
    evaluatedBy: evaluation.evaluatedBy,
  });
}

export function attachDesignTimeFeasibilityEvidenceLinkage(
  evaluation: DesignTimeFeasibilityEvaluationRecord,
  evidenceIds: readonly import("./domain3-types.js").ReviewEvidenceId[],
  activityId: import("./domain3-types.js").ReviewDimensionActivityId,
): DesignTimeFeasibilityEvaluationRecord {
  if (evidenceIds.length === 0) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation must link at least one persisted Review evidence record",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R25"],
    );
  }
  return Object.freeze({
    ...evaluation,
    evidenceIds: Object.freeze([...evidenceIds]),
    activityId,
  });
}
