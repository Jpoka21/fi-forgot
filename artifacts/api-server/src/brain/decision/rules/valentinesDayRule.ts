/**
 * ValentinesDayRule — event preparation branching for Valentine's Day.
 *
 * Romantic relationship eligibility is enforced by event preparation projection;
 * ineligible relationships omit valentines_day facts and this rule no-matches.
 */

import type { DecisionContext } from "../decisionContextTypes";
import { ruleTargetEventId } from "../../events/ruleEventTargeting";
import {
  evaluateCalendarEventRule,
  type CalendarEventRuleConfig,
} from "./calendarEventRuleEvaluation";
import type { RuleEvaluationTrace } from "./internal/ruleEvaluationTrace";
import type { DecisionRule } from "./types";

const TARGET_EVENT_ID = ruleTargetEventId("valentines_day");
if (!TARGET_EVENT_ID) {
  throw new Error("ValentinesDayRule requires a calendar event target mapping");
}

const VALENTINES_DAY_RULE_CONFIG: CalendarEventRuleConfig = {
  ruleId: "valentines_day",
  targetEventId: TARGET_EVENT_ID,
  priority: 42,
  confidence: 60,
  debugLabel: "ValentinesDayRule",
};

export const valentinesDayRule: DecisionRule = {
  id: "valentines_day",
  evaluate(context: DecisionContext, trace?: RuleEvaluationTrace) {
    return evaluateCalendarEventRule(context, VALENTINES_DAY_RULE_CONFIG, trace);
  },
};
