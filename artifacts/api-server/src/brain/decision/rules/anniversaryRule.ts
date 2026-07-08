/**
 * AnniversaryRule — recommends anniversary preparation when inside the preview window.
 *
 * Decides WHAT is needed (ask_question). Wording and execution belong to the
 * future Action Planner.
 */

import type { DecisionContext } from "../decisionContextTypes";
import { isEventWithinPreparationWindow } from "../eventWindow";
import type { DecisionRule, RuleCandidate } from "./types";

const ANNIVERSARY_CANDIDATE: RuleCandidate = {
  ruleId: "anniversary",
  priority: 45,
  confidence: 60,
  decision: { outcome: "ask_question" },
  reasons: ["anniversary_preparation_window"],
  debugNotes: ["AnniversaryRule matched"],
};

export const anniversaryRule: DecisionRule = {
  id: "anniversary",
  evaluate(context: DecisionContext): RuleCandidate | null {
    const { anniversaryDaysAway, preparationWindowDays } = context;
    if (!isEventWithinPreparationWindow(anniversaryDaysAway, preparationWindowDays)) {
      return null;
    }

    return {
      ...ANNIVERSARY_CANDIDATE,
      debugNotes: [
        "AnniversaryRule matched",
        `anniversary days away: ${anniversaryDaysAway}`,
        `preparation window: ${preparationWindowDays}`,
      ],
    };
  },
};
