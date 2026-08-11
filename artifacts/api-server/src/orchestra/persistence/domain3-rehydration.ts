/**
 * Safe rehydration for Domain 3 persisted state — validate, clone, deep-freeze.
 */

import type {
  ProductionReadinessReview,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
} from "../domain3-types.js";
import {
  validatePersistedProductionReadinessReview,
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
