/**
 * No-op Brain outcome recorder — default while outcome producers are unwired.
 *
 * Accepts valid outcome input, performs no writes, emits no exposure events,
 * and does not mutate caller input.
 */

import type { BrainOutcomeRecorder } from "./brainOutcomeRecorder";

export function createNoOpBrainOutcomeRecorder(): BrainOutcomeRecorder {
  return {
    async record(_input): Promise<void> {
      // intentionally empty — persistence and projection are deferred
    },
  };
}

/** Shared default recorder while outcome persistence is absent. */
export const noOpBrainOutcomeRecorder = createNoOpBrainOutcomeRecorder();
