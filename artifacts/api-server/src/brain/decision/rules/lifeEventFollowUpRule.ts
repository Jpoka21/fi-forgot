/**
 * LifeEventFollowUpRule — recommends follow-up when a supported life event
 * has reached its configured follow-up window.
 *
 * Operates only on DecisionContext.lifeEvent.
 */

import type { DecisionContext } from "../decisionContextTypes";
import type { RuleEvaluationTrace } from "./internal/ruleEvaluationTrace";
import type { DecisionRule, RuleCandidate } from "./types";

const LIFE_EVENT_FOLLOW_UP_CANDIDATE: RuleCandidate = {
  ruleId: "life_event_follow_up",
  priority: 38,
  confidence: 46,
  decision: { outcome: "ask_question" },
  reasons: ["life_event_follow_up_ready"],
  debugNotes: ["LifeEventFollowUpRule matched"],
};

export const lifeEventFollowUpRule: DecisionRule = {
  id: "life_event_follow_up",
  evaluate(context: DecisionContext, trace?: RuleEvaluationTrace): RuleCandidate | null {
    const { lifeEvent } = context;

    if (lifeEvent == null) {
      trace?.recordNoMatch({
        reasons: ["no_life_event"],
        debugNotes: ["lifeEvent: null"],
      });
      return null;
    }

    if (!lifeEvent.classified) {
      trace?.recordNoMatch({
        reasons: ["life_event_not_classified"],
        debugNotes: [`classified: ${lifeEvent.classified}`],
      });
      return null;
    }

    if (!lifeEvent.supported) {
      trace?.recordNoMatch({
        reasons: ["life_event_not_supported"],
        debugNotes: [`supported: ${lifeEvent.supported}`],
      });
      return null;
    }

    if (!lifeEvent.followUpReady) {
      trace?.recordNoMatch({
        reasons: ["life_event_follow_up_not_ready"],
        debugNotes: [
          `followUpReady: ${lifeEvent.followUpReady}`,
          `days ago: ${lifeEvent.daysAgo}`,
          `follow up window days: ${lifeEvent.followUpWindowDays}`,
        ],
      });
      return null;
    }

    return {
      ...LIFE_EVENT_FOLLOW_UP_CANDIDATE,
      debugNotes: [
        "LifeEventFollowUpRule matched",
        `type: ${lifeEvent.type}`,
        `category: ${lifeEvent.category}`,
        `days ago: ${lifeEvent.daysAgo}`,
        `follow up window days: ${lifeEvent.followUpWindowDays}`,
        `followUpReady: ${lifeEvent.followUpReady}`,
        `source: ${lifeEvent.source}`,
      ],
    };
  },
};
