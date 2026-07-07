/**
 * Signal extraction — read-only scaffold.
 *
 * Aggregates contributor outputs for a loaded relationship context.
 * Phase 1 contributors return empty arrays; no scoring, no AI, no recommendations.
 */

import { signalContributors } from "./contributors";
import type { BrainSignal, RelationshipContextLoadResult } from "../types";

/**
 * Returns extracted signals for a loaded relationship context.
 */
export function extractSignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  return signalContributors.flatMap((contributor) => contributor(context));
}
