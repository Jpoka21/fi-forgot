/**
 * Builds FatigueContext for applyFatigue().
 */

import type { FatigueContext } from "./fatigueTypes";
import { loadExposureSnapshot } from "./exposure/loadExposureSnapshot";

export async function buildFatigueContext(input: {
  userId: string;
  evaluatedAt: string;
}): Promise<FatigueContext> {
  const exposureSnapshot = await loadExposureSnapshot({
    userId: input.userId,
    evaluatedAt: input.evaluatedAt,
  });

  return {
    userId: input.userId,
    evaluatedAt: input.evaluatedAt,
    exposureSnapshot,
  };
}
