/**
 * AnniversaryRule — event preparation branching for anniversary occasions.
 */

import type { DecisionContext } from "../decisionContextTypes";
import { ruleTargetEventId } from "../../events/ruleEventTargeting";
import {
  evaluateCalendarEventRule,
  type CalendarEventRuleConfig,
} from "./calendarEventRuleEvaluation";
import type { RuleEvaluationTrace } from "./internal/ruleEvaluationTrace";
import type { DecisionRule } from "./types";

const TARGET_EVENT_ID = ruleTargetEventId("anniversary");
if (!TARGET_EVENT_ID) {
  throw new Error("AnniversaryRule requires a calendar event target mapping");
}

const ANNIVERSARY_RULE_CONFIG: CalendarEventRuleConfig = {
  ruleId: "anniversary",
  targetEventId: TARGET_EVENT_ID,
  priority: 45,
  confidence: 60,
  debugLabel: "AnniversaryRule",
};

export const anniversaryRule: DecisionRule = {
  id: "anniversary",
  evaluate(context: DecisionContext, trace?: RuleEvaluationTrace) {
    return evaluateCalendarEventRule(context, ANNIVERSARY_RULE_CONFIG, trace);
  },
};
