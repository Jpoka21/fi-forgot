/**
 * Deterministic batch projection helper for replay and recovery tests.
 *
 * Does not query the database or scan users — operates only on provided events.
 */

import type { BrainOutcomeEvent } from "../outcomeTypes";
import type { BrainOutcomeExposureProjector, BrainOutcomeProjectionResult } from "./outcomeProjectionTypes";

export async function projectBrainOutcomeEvents(
  events: readonly BrainOutcomeEvent[],
  projector: BrainOutcomeExposureProjector,
): Promise<BrainOutcomeProjectionResult[]> {
  const results: BrainOutcomeProjectionResult[] = [];

  for (const event of events) {
    results.push(await projector.project(event));
  }

  return results;
}
