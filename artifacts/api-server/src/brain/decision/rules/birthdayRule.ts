/**
 * BirthdayRule — recommends birthday preparation when inside the preview window.
 *
 * Decides WHAT is needed (ask_question). Wording and execution belong to the
 * future Action Planner.
 */

import type { DecisionContext } from "../decisionContextTypes";
import type { DecisionRule, RuleCandidate } from "./types";

const BIRTHDAY_CANDIDATE: RuleCandidate = {
  ruleId: "birthday",
  priority: 50,
  confidence: 60,
  decision: { outcome: "ask_question" },
  reasons: ["birthday_preparation_window"],
  debugNotes: ["BirthdayRule matched"],
};

export const birthdayRule: DecisionRule = {
  id: "birthday",
  evaluate(context: DecisionContext): RuleCandidate | null {
    const { birthdayDaysAway, preparationWindowDays } = context;
    if (
      birthdayDaysAway == null ||
      preparationWindowDays == null ||
      birthdayDaysAway > preparationWindowDays
    ) {
      return null;
    }

    return {
      ...BIRTHDAY_CANDIDATE,
      debugNotes: [
        "BirthdayRule matched",
        `birthday days away: ${birthdayDaysAway}`,
        `preparation window: ${preparationWindowDays}`,
      ],
    };
  },
};
