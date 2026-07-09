/**
 * Integrates Action Planner output with the Follow Up Question catalog.
 *
 * Internal only — not part of BrainResponse.
 */

import type { ActionPlan } from "../action/actionPlanTypes";
import type { DecideResult } from "../decision/decide";
import type { DecisionContext } from "../decision/decisionContextTypes";
import { questionCategoryForSourceRuleId } from "./ruleIdQuestionCategoryMapping";
import type { SelectedFollowUpQuestion } from "./selectedFollowUpQuestionTypes";
import { selectFollowUpQuestion } from "./selectFollowUpQuestion";

export interface SelectQuestionForActionPlanInput {
  decisionContext: DecisionContext;
  decideResult: DecideResult;
  actionPlan: ActionPlan;
}

export function selectQuestionForActionPlan(
  input: SelectQuestionForActionPlanInput,
): SelectedFollowUpQuestion | null {
  const { actionPlan } = input;

  if (actionPlan.type !== "ask_question") {
    return null;
  }

  const category = questionCategoryForSourceRuleId(actionPlan.sourceRuleId);
  if (category == null) {
    return null;
  }

  const question = selectFollowUpQuestion({ category });
  if (question == null) {
    return null;
  }

  return {
    questionId: question.id,
    questionText: question.text,
    category: question.category,
    sourceRuleId: actionPlan.sourceRuleId,
    reason: actionPlan.primaryReason,
    sensitivity: question.sensitivity,
    rotationKey: question.category,
  };
}
