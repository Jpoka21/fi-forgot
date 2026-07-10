/**
 * BirthdayRule — event preparation branching for birthday occasions.
 */

import type { DecisionContext } from "../decisionContextTypes";
import { ruleTargetEventId } from "../../events/ruleEventTargeting";
import {
  evaluateCalendarEventRule,
  type CalendarEventRuleConfig,
} from "./calendarEventRuleEvaluation";
import type { RuleEvaluationTrace } from "./internal/ruleEvaluationTrace";
import type { DecisionRule } from "./types";

const TARGET_EVENT_ID = ruleTargetEventId("birthday");
if (!TARGET_EVENT_ID) {
  throw new Error("BirthdayRule requires a calendar event target mapping");
}

const BIRTHDAY_RULE_CONFIG: CalendarEventRuleConfig = {
  ruleId: "birthday",
  targetEventId: TARGET_EVENT_ID,
  priority: 50,
  confidence: 60,
  debugLabel: "BirthdayRule",
};

export const birthdayRule: DecisionRule = {
  id: "birthday",
  evaluate(context: DecisionContext, trace?: RuleEvaluationTrace) {
    return evaluateCalendarEventRule(context, BIRTHDAY_RULE_CONFIG, trace);
  },
};
