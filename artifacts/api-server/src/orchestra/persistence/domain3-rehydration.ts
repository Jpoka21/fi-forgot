/**
 * Safe rehydration for Domain 3 persisted state — validate, clone, deep-freeze.
 *
 * G6 Approval / withholding / GPRA require joint persisted constitutional
 * coherence (ORCH-IMP-010.2). Structural field shape alone is insufficient.
 */

import type {
  ApprovalActRecord,
  ApprovalWithholdingRecord,
  DesignTimeFeasibilityEvaluationRecord,
  GpraGrantRecord,
  ProductionReadinessReview,
  ReviewDeterminationRecord,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
} from "../domain3-types.js";
import {
  assertPersistedApprovalAuthorityCoherence,
  assertPersistedApprovalWithholdingCoherence,
  assertPersistedGpraGrantCoherence,
} from "./g6-rehydration-coherence.js";
import {
  validatePersistedApprovalAct,
  validatePersistedApprovalWithholding,
  validatePersistedDesignTimeFeasibilityEvaluation,
  validatePersistedGpraGrant,
  validatePersistedProductionReadinessReview,
  validatePersistedReviewDetermination,
  validatePersistedReviewDimensionActivity,
  validatePersistedReviewEvidence,
} from "./domain3-validation.js";

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item);
    }
    return Object.freeze(value);
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    deepFreeze(record[key]);
  }
  return Object.freeze(value);
}

export interface G6AuthorityRehydrationContext {
  readonly review: unknown;
  readonly determination: unknown;
  readonly evidenceRecords: readonly unknown[];
  readonly activityRecords: readonly unknown[];
}

export interface G6GpraRehydrationContext extends G6AuthorityRehydrationContext {
  readonly approval: unknown;
}

function validateEvidenceAndActivityContext(context: G6AuthorityRehydrationContext): {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  evidenceRecords: ReviewEvidenceRecord[];
  activityRecords: ReviewDimensionActivityRecord[];
} {
  validatePersistedProductionReadinessReview(context.review);
  validatePersistedReviewDetermination(context.determination);
  const evidenceRecords = context.evidenceRecords.map((item) => {
    validatePersistedReviewEvidence(item);
    return item as ReviewEvidenceRecord;
  });
  const activityRecords = context.activityRecords.map((item) => {
    validatePersistedReviewDimensionActivity(item);
    return item as ReviewDimensionActivityRecord;
  });
  return {
    review: context.review as ProductionReadinessReview,
    determination: context.determination as ReviewDeterminationRecord,
    evidenceRecords,
    activityRecords,
  };
}

export function rehydrateProductionReadinessReview(raw: unknown): ProductionReadinessReview {
  validatePersistedProductionReadinessReview(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateReviewEvidence(raw: unknown): ReviewEvidenceRecord {
  validatePersistedReviewEvidence(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateReviewDimensionActivity(raw: unknown): ReviewDimensionActivityRecord {
  validatePersistedReviewDimensionActivity(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateDesignTimeFeasibilityEvaluation(
  raw: unknown,
): DesignTimeFeasibilityEvaluationRecord {
  validatePersistedDesignTimeFeasibilityEvaluation(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateReviewDetermination(raw: unknown): ReviewDeterminationRecord {
  validatePersistedReviewDetermination(raw);
  return deepFreeze(structuredClone(raw));
}

/**
 * Trusted G6 Approval rehydration — structural + joint Review/Determination/evidence coherence.
 */
export function rehydrateApprovalAct(
  raw: unknown,
  context: G6AuthorityRehydrationContext,
): ApprovalActRecord {
  validatePersistedApprovalAct(raw);
  const linked = validateEvidenceAndActivityContext(context);
  assertPersistedApprovalAuthorityCoherence({
    approval: raw as ApprovalActRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}

/**
 * Trusted G6 withholding rehydration — structural + joint Pass Review coherence.
 */
export function rehydrateApprovalWithholding(
  raw: unknown,
  context: G6AuthorityRehydrationContext,
): ApprovalWithholdingRecord {
  validatePersistedApprovalWithholding(raw);
  const linked = validateEvidenceAndActivityContext(context);
  assertPersistedApprovalWithholdingCoherence({
    withholding: raw as ApprovalWithholdingRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}

/**
 * Trusted G6 GPRA rehydration — requires persisted Approval and joint subject coherence.
 * Does not infer GPRA from Approval alone.
 */
export function rehydrateGpraGrant(
  raw: unknown,
  context: G6GpraRehydrationContext,
): GpraGrantRecord {
  validatePersistedGpraGrant(raw);
  validatePersistedApprovalAct(context.approval);
  const linked = validateEvidenceAndActivityContext(context);
  assertPersistedGpraGrantCoherence({
    gpra: raw as GpraGrantRecord,
    approval: context.approval as ApprovalActRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}
