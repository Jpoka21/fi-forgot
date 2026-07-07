/**
 * Brain orchestrator — read-only scaffold.
 *
 * Connects loadRelationshipContext() → extractSignals() → decide() → BrainResponse.
 * No scoring, no AI, no side effects beyond existing context reads.
 */

import { loadRelationshipContext } from "./context/loadRelationshipContext";
import { decide, type DecideResult } from "./decision/decide";
import { extractSignals } from "./signals/extractSignals";
import type { SignalExtractionResult } from "./signals/extractionTypes";
import type { BrainResponse, RelationshipContextLoadResult } from "./types";

export interface BrainExecutionResult {
  loadResult: RelationshipContextLoadResult;
  extraction: SignalExtractionResult;
  decideResult: DecideResult;
}

/**
 * Runs the Brain pipeline once: load → extract → decide.
 * Not re-exported from brain/index.ts — intended for dev debug use.
 */
export async function executeBrain(
  recipientId: string,
  userId: string,
): Promise<BrainExecutionResult> {
  const loadResult = await loadRelationshipContext(recipientId, userId);
  const extraction = extractSignals(loadResult);
  const decideResult = decide(loadResult);

  return { loadResult, extraction, decideResult };
}

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

export async function runBrain(
  recipientId: string,
  userId: string,
): Promise<BrainResponse> {
  const execution = await executeBrain(recipientId, userId);
  return toBrainResponse(
    execution.loadResult,
    execution.extraction,
    execution.decideResult,
  );
}
