/**
 * Pure Brain planning segment — decision + action plan from DecisionContext.
 */

import type { ActionPlan } from "./action/actionPlanTypes";
import { buildActionPlan } from "./action/buildActionPlan";
import type { DecideResult } from "./decision/decide";
import type { DecisionContext } from "./decision/decisionContextTypes";
import { decideInternal } from "./decision/decideInternal";
import type { RuleEvaluationSummary } from "./decision/rules/ruleEvaluationTypes";

/**
 * Plans decision output and action categorization from an existing DecisionContext.
 */
export function planFromDecisionContext(decisionContext: DecisionContext): {
  decideResult: DecideResult;
  actionPlan: ActionPlan;
  ruleEvaluation: RuleEvaluationSummary;
} {
  const ruleResult = decideInternal(decisionContext);
  const actionPlan = buildActionPlan({
    decideResult: ruleResult.decideResult,
    sourceRuleId: ruleResult.sourceRuleId,
  });
  return {
    decideResult: ruleResult.decideResult,
    actionPlan,
    ruleEvaluation: ruleResult.ruleEvaluation,
  };
}
