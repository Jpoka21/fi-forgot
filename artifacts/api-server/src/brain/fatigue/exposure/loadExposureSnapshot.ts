/**
 * Exposure snapshot loader — in-memory stub in Sprint 5c.
 */

import type { ExposureSnapshot } from "./exposureTypes";

export interface LoadExposureSnapshotInput {
  userId: string;
  evaluatedAt: string;
}

export function createEmptyExposureSnapshot(loadedAt: string): ExposureSnapshot {
  return {
    loadedAt,
    byOpportunityKey: {},
  };
}

export function loadExposureSnapshot(input: LoadExposureSnapshotInput): ExposureSnapshot {
  return createEmptyExposureSnapshot(input.evaluatedAt);
}
