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
import type { RuleEvaluationSummary } from "./decision/rules/ruleEvaluationTypes";
import { planFromDecisionContext } from "./planFromDecisionContext";
import { normalizeSignals } from "./normalization";
import type { NormalizedRelationshipState } from "./normalization";
import { extractSignals } from "./signals/extractSignals";
import type { SignalExtractionResult } from "./signals/extractionTypes";
import { classifyLifeEvents } from "./lifeEvents";
import type { BrainResponse, RelationshipContextLoadResult } from "./types";
import { toBrainResponse } from "./toBrainResponse";

export interface BrainExecutionResult {
  loadResult: RelationshipContextLoadResult;
  extraction: SignalExtractionResult;
  normalized: NormalizedRelationshipState;
  decisionContext: DecisionContext;
  decideResult: DecideResult;
  actionPlan: ActionPlan;
  /** Development-only rule evaluation trace. Not part of BrainResponse. */
  ruleEvaluation: RuleEvaluationSummary;
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
  const lifeEventClassifications = classifyLifeEvents(loadResult.relationshipContext);
  const decisionContext = buildDecisionContext(
    normalized,
    loadResult.relationshipContext,
    lifeEventClassifications,
  );
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(decisionContext);

  return {
    loadResult,
    extraction,
    normalized,
    decisionContext,
    decideResult,
    actionPlan,
    ruleEvaluation,
  };
}

export { toBrainResponse } from "./toBrainResponse";

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
