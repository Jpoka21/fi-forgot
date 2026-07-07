/**
 * Signal extraction — read-only scaffold.
 *
 * Accepts relationship context from loadRelationshipContext() and returns
 * contributor signals for the decision engine. Phase 1 returns an empty array;
 * no scoring, no AI, no recommendations.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../types";

/**
 * Returns extracted signals for a loaded relationship context.
 * Context is accepted to establish the contract; it is not evaluated yet.
 */
export function extractSignals(
  _context: RelationshipContextLoadResult,
): BrainSignal[] {
  return [];
}
