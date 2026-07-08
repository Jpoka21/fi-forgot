/**
 * Pure Brain planning segment — decision + action plan from DecisionContext.
 */

import { buildActionPlan } from "./action/buildActionPlan";
import type { ActionPlan } from "./action/actionPlanTypes";
import type { DecideResult } from "./decision/decide";
import type { DecisionContext } from "./decision/decisionContextTypes";
import { decideInternal } from "./decision/decideInternal";

/**
 * Plans decision output and action categorization from an existing DecisionContext.
 */
export function planFromDecisionContext(decisionContext: DecisionContext): {
  decideResult: DecideResult;
  actionPlan: ActionPlan;
} {
  const ruleResult = decideInternal(decisionContext);
  const actionPlan = buildActionPlan({
    decideResult: ruleResult.decideResult,
    sourceRuleId: ruleResult.sourceRuleId,
  });
  return { decideResult: ruleResult.decideResult, actionPlan };
}
