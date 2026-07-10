/**
 * Exposure snapshot loader — database-backed in Sprint 5e.
 */

import { logger } from "../../../lib/logger";
import { materializeExposureSnapshot } from "./materializeExposureSnapshot";
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

export async function loadExposureSnapshot(
  input: LoadExposureSnapshotInput,
): Promise<ExposureSnapshot> {
  try {
    const { listExposureEventsForUser } = await import("./pgExposureRepository.js");
    const events = await listExposureEventsForUser(input.userId);
    return materializeExposureSnapshot(events, input.evaluatedAt);
  } catch (error) {
    logger.warn(
      { err: error, userId: input.userId },
      "loadExposureSnapshot failed; using empty snapshot",
    );
    return createEmptyExposureSnapshot(input.evaluatedAt);
  }
}
