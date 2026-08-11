/**
 * Safe rehydration for Domain 2 persisted state.
 */

import type {
  ExplorationPostureRecord,
  RealizationCommitment,
  RealizedVisualArtifact,
  ReviewEntryReadiness,
} from "../domain2-types.js";
import {
  validatePersistedExplorationPosture,
  validatePersistedRealizationCommitment,
  validatePersistedReviewEntryReadiness,
  validatePersistedRva,
} from "./domain2-validation.js";

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

export function rehydrateExplorationPosture(raw: unknown): ExplorationPostureRecord {
  validatePersistedExplorationPosture(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateRealizationCommitment(raw: unknown): RealizationCommitment {
  validatePersistedRealizationCommitment(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateRva(raw: unknown): RealizedVisualArtifact {
  validatePersistedRva(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateReviewEntryReadiness(raw: unknown): ReviewEntryReadiness {
  validatePersistedReviewEntryReadiness(raw);
  return deepFreeze(structuredClone(raw));
}
