/**
 * InactivityRule — recommends a follow-up question when the relationship has been quiet.
 *
 * Operates purely on factual activity recency from DecisionContext (timeline-derived).
 */

import type { DecisionContext } from "../decisionContextTypes";
import { RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS } from "../../config/relationshipThresholds";
import type { DecisionRule, RuleCandidate } from "./types";

const INACTIVITY_CANDIDATE: RuleCandidate = {
  ruleId: "inactivity",
  priority: 41,
  confidence: 48,
  decision: { outcome: "ask_question" },
  reasons: ["relationship_inactive"],
  debugNotes: ["InactivityRule matched"],
};

export const inactivityRule: DecisionRule = {
  id: "inactivity",
  evaluate(context: DecisionContext): RuleCandidate | null {
    const { lastRelationshipActivityDaysAgo } = context;
    if (lastRelationshipActivityDaysAgo == null) {
      return null;
    }

    if (lastRelationshipActivityDaysAgo <= RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS) {
      return null;
    }

    return {
      ...INACTIVITY_CANDIDATE,
      debugNotes: [
        "InactivityRule matched",
        `last relationship activity days ago: ${lastRelationshipActivityDaysAgo}`,
        `threshold days: ${RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS}`,
      ],
    };
  },
};

