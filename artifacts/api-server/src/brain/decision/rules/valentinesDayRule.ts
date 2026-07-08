/**
 * ValentinesDayRule — recommends Valentine's Day preparation for romantic relationships
 * when the holiday falls inside the preview window.
 *
 * Decides WHAT is needed (ask_question). Wording and execution belong to the
 * future Action Planner.
 */

import type { DecisionContext } from "../decisionContextTypes";
import { isEventWithinPreparationWindow } from "../eventWindow";
import { isRomanticRelationshipType } from "../relationshipTypeMatchers";
import type { RuleEvaluationTrace } from "./internal/ruleEvaluationTrace";
import type { DecisionRule, RuleCandidate } from "./types";

const VALENTINES_DAY_CANDIDATE: RuleCandidate = {
  ruleId: "valentines_day",
  priority: 42,
  confidence: 60,
  decision: { outcome: "ask_question" },
  reasons: ["valentines_preparation_window"],
  debugNotes: ["ValentinesDayRule matched"],
};

export const valentinesDayRule: DecisionRule = {
  id: "valentines_day",
  evaluate(context: DecisionContext, trace?: RuleEvaluationTrace): RuleCandidate | null {
    if (!isRomanticRelationshipType(context.relationshipType)) {
      trace?.recordNoMatch({
        reasons: ["not_romantic_relationship"],
        debugNotes: [`relationshipType: ${context.relationshipType}`],
      });
      return null;
    }

    const { valentinesDaysAway, preparationWindowDays } = context;
    if (!isEventWithinPreparationWindow(valentinesDaysAway, preparationWindowDays)) {
      trace?.recordNoMatch({
        reasons: ["outside_preparation_window"],
        debugNotes: [
          `valentines days away: ${valentinesDaysAway}`,
          `preparation window: ${preparationWindowDays}`,
        ],
      });
      return null;
    }

    return {
      ...VALENTINES_DAY_CANDIDATE,
      debugNotes: [
        "ValentinesDayRule matched",
        `valentines days away: ${valentinesDaysAway}`,
        `preparation window: ${preparationWindowDays}`,
      ],
    };
  },
};
