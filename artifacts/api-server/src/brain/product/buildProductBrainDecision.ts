/**
 * Maps BrainExecutionResult to the versioned ProductBrainDecision public contract.
 *
 * Consumes only BrainExecutionResult — not BrainResponse, BrainInspector, or DecisionContext.
 */

import type { BrainExecutionResult } from "../orchestrator";
import { resolveProductBrainDisplay } from "./productBrainDisplayCopy";
import {
  PRODUCT_BRAIN_DECISION_VERSION,
  type ProductBrainDecision,
} from "./productBrainDecisionTypes";

export function buildProductBrainDecision(
  recipientId: string,
  execution: BrainExecutionResult,
  options?: { includeDebug?: boolean },
): ProductBrainDecision {
  const { decideResult, actionPlan, selectedFollowUpQuestion, ruleEvaluation, loadResult } =
    execution;

  const decision: ProductBrainDecision = {
    version: PRODUCT_BRAIN_DECISION_VERSION,
    recipientId,
    decision: {
      outcome: decideResult.decision.outcome,
    },
    sourceRuleId: actionPlan.sourceRuleId,
    actionPlan: {
      type: actionPlan.type,
      category: actionPlan.category,
      priority: actionPlan.priority,
      primaryReason: actionPlan.primaryReason,
    },
    selectedFollowUpQuestion: selectedFollowUpQuestion
      ? {
          questionId: selectedFollowUpQuestion.questionId,
          questionText: selectedFollowUpQuestion.questionText,
          category: selectedFollowUpQuestion.category,
          sensitivity: selectedFollowUpQuestion.sensitivity,
        }
      : null,
    display: resolveProductBrainDisplay(actionPlan.sourceRuleId),
  };

  if (options?.includeDebug) {
    decision.debug = {
      generatedAt: new Date().toISOString(),
      confidence: decideResult.confidence,
      reasons: [...decideResult.reasons],
      brainContextVersion: loadResult.brainContextVersion,
      ruleEvaluation,
    };
  }

  return decision;
}
