/**
 * Brain orchestrator — read-only scaffold.
 *
 * Connects loadRelationshipContext() → extractSignals() → normalize →
 * buildDecisionContext → decideInternal() → buildActionPlan() → BrainResponse.
 * No scoring, no AI, no side effects beyond existing context reads.
 */

import type { ActionPlan } from "./action/actionPlanTypes";
import { loadRelationshipContext } from "./context/loadRelationshipContext";
import { buildDecisionContext } from "./decision/buildDecisionContext";
import type { DecisionContext } from "./decision/decisionContextTypes";
import type { DecideResult } from "./decision/decide";
import { planFromDecisionContext } from "./planFromDecisionContext";
import { normalizeSignals } from "./normalization";
import type { NormalizedRelationshipState } from "./normalization";
import { extractSignals } from "./signals/extractSignals";
import type { SignalExtractionResult } from "./signals/extractionTypes";
import type { BrainResponse, RelationshipContextLoadResult } from "./types";

export interface BrainExecutionResult {
  loadResult: RelationshipContextLoadResult;
  extraction: SignalExtractionResult;
  normalized: NormalizedRelationshipState;
  decisionContext: DecisionContext;
  decideResult: DecideResult;
  actionPlan: ActionPlan;
}

/**
 * Runs the Brain pipeline once: load → extract → normalize → decision → action plan.
 * Not re-exported from brain/index.ts — intended for dev debug use.
 */
export async function executeBrain(
  recipientId: string,
  userId: string,
): Promise<BrainExecutionResult> {
  const loadResult = await loadRelationshipContext(recipientId, userId);
  const extraction = extractSignals(loadResult);
  const normalized = normalizeSignals(extraction.availableSignals);
  const decisionContext = buildDecisionContext(normalized);
  const { decideResult, actionPlan } = planFromDecisionContext(decisionContext);

  return { loadResult, extraction, normalized, decisionContext, decideResult, actionPlan };
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
