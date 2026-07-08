/**
 * FreshUpdateRule — recommends a fresh update when information is stale.
 *
 * Decides WHAT is needed (ask_question). Wording and execution belong to the
 * future Action Planner.
 */

import type { DecisionContext } from "../decisionContextTypes";
import type { DecisionRule, RuleCandidate } from "./types";

const FRESH_UPDATE_CANDIDATE: RuleCandidate = {
  ruleId: "fresh_update",
  priority: 40,
  confidence: 52,
  decision: { outcome: "ask_question" },
  reasons: ["information_stale", "fresh_update_due"],
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
};

export const freshUpdateRule: DecisionRule = {
  id: "fresh_update",
  evaluate(context: DecisionContext): RuleCandidate | null {
    if (context.freshness !== "stale") {
      return null;
    }
    return FRESH_UPDATE_CANDIDATE;
  },
};
