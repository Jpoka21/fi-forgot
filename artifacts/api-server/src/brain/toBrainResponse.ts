/**
 * Maps orchestrator execution artifacts to the production BrainResponse contract.
 */

import type { DecideResult } from "./decision/decide";
import type { SignalExtractionResult } from "./signals/extractionTypes";
import type { BrainResponse, RelationshipContextLoadResult } from "./types";

export function toBrainResponse(
  loadResult: RelationshipContextLoadResult,
  extraction: SignalExtractionResult,
  decideResult: DecideResult,
): BrainResponse {
  return {
    relationshipId: loadResult.relationshipId,
    relationshipContext: loadResult.relationshipContext,
    availableSignals: extraction.availableSignals,
    decision: decideResult.decision,
    confidence: decideResult.confidence,
    reasons: decideResult.reasons,
    debugNotes: decideResult.debugNotes,
  };
}
