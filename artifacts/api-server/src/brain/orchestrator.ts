/**
 * Brain orchestrator — read-only scaffold.
 *
 * Connects loadRelationshipContext() → decide() → BrainResponse.
 * No scoring, no AI, no side effects beyond existing context reads.
 */

import { loadRelationshipContext } from "./context/loadRelationshipContext";
import { decide } from "./decision/decide";
import type { BrainResponse } from "./types";

export async function runBrain(
  recipientId: string,
  userId: string,
): Promise<BrainResponse> {
  const loadResult = await loadRelationshipContext(recipientId, userId);
  const decideResult = decide(loadResult);

  return {
    relationshipId: loadResult.relationshipId,
    relationshipContext: loadResult.relationshipContext,
    availableSignals: [],
    decision: decideResult.decision,
    confidence: decideResult.confidence,
    reasons: decideResult.reasons,
    debugNotes: decideResult.debugNotes,
  };
}
