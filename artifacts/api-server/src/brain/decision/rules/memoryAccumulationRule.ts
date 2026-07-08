/**
 * MemoryAccumulationRule — recommends gathering richer memories when inventory is thin.
 *
 * Operates purely on normalized dimensions and factual activity recency from DecisionContext.
 */

import { CARD_GAP_THRESHOLD_DAYS } from "../../config/opportunityThresholds";
import { RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS } from "../../config/relationshipThresholds";
import type { DecisionContext } from "../decisionContextTypes";
import { isEventWithinPreparationWindow } from "../eventWindow";
import { isRomanticRelationshipType } from "../relationshipTypeMatchers";
import type { RuleEvaluationTrace } from "./internal/ruleEvaluationTrace";
import type { DecisionRule, RuleCandidate } from "./types";

const MEMORY_ACCUMULATION_CANDIDATE: RuleCandidate = {
  ruleId: "memory_accumulation",
  priority: 34,
  confidence: 44,
  decision: { outcome: "ask_question" },
  reasons: ["memory_inventory_thin"],
  debugNotes: ["MemoryAccumulationRule matched"],
};

function isCalendarPreparationActive(context: DecisionContext): boolean {
  const { birthdayDaysAway, anniversaryDaysAway, valentinesDaysAway, preparationWindowDays, relationshipType } =
    context;

  if (isEventWithinPreparationWindow(birthdayDaysAway, preparationWindowDays)) {
    return true;
  }

  if (isEventWithinPreparationWindow(anniversaryDaysAway, preparationWindowDays)) {
    return true;
  }

  if (
    isRomanticRelationshipType(relationshipType) &&
    isEventWithinPreparationWindow(valentinesDaysAway, preparationWindowDays)
  ) {
    return true;
  }

  return false;
}

function wouldCardGapMatch(context: DecisionContext): boolean {
  const {
    lastCardActivityDaysAgo,
    lastRelationshipActivityDaysAgo,
    freshness,
    identity,
  } = context;

  if (lastCardActivityDaysAgo == null) {
    return false;
  }

  if (lastCardActivityDaysAgo <= CARD_GAP_THRESHOLD_DAYS) {
    return false;
  }

  if (lastRelationshipActivityDaysAgo == null) {
    return false;
  }

  if (lastRelationshipActivityDaysAgo > RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS) {
    return false;
  }

  if (freshness === "stale") {
    return false;
  }

  if (identity !== "developing" && identity !== "established") {
    return false;
  }

  return true;
}

export const memoryAccumulationRule: DecisionRule = {
  id: "memory_accumulation",
  evaluate(context: DecisionContext, trace?: RuleEvaluationTrace): RuleCandidate | null {
    const {
      identity,
      history,
      writing,
      freshness,
      momentum,
      lastRelationshipActivityDaysAgo,
      lastCardActivityDaysAgo,
      birthdayDaysAway,
      anniversaryDaysAway,
      valentinesDaysAway,
      preparationWindowDays,
    } = context;

    if (isCalendarPreparationActive(context)) {
      trace?.recordNoMatch({
        reasons: ["calendar_preparation_window"],
        debugNotes: [
          `birthday days away: ${birthdayDaysAway}`,
          `anniversary days away: ${anniversaryDaysAway}`,
          `valentines days away: ${valentinesDaysAway}`,
          `preparation window: ${preparationWindowDays}`,
        ],
      });
      return null;
    }

    if (freshness === "stale") {
      trace?.recordNoMatch({
        reasons: ["freshness_stale"],
        debugNotes: ["freshness: stale"],
      });
      return null;
    }

    if (freshness !== "current" && freshness !== "aging") {
      trace?.recordNoMatch({
        reasons: ["freshness_not_current"],
        debugNotes: [`freshness: ${freshness}`],
      });
      return null;
    }

    if (lastRelationshipActivityDaysAgo == null) {
      trace?.recordNoMatch({
        reasons: ["no_timeline_activity"],
        debugNotes: ["lastRelationshipActivityDaysAgo: null"],
      });
      return null;
    }

    if (lastRelationshipActivityDaysAgo > RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS) {
      trace?.recordNoMatch({
        reasons: ["relationship_inactive"],
        debugNotes: [
          `last relationship activity days ago: ${lastRelationshipActivityDaysAgo}`,
          `inactivity threshold days: ${RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS}`,
        ],
      });
      return null;
    }

    if (wouldCardGapMatch(context)) {
      trace?.recordNoMatch({
        reasons: ["card_channel_quiet"],
        debugNotes: [
          `last card activity days ago: ${lastCardActivityDaysAgo}`,
          `card gap threshold days: ${CARD_GAP_THRESHOLD_DAYS}`,
        ],
      });
      return null;
    }

    if (identity === "empty" || identity === "thin") {
      trace?.recordNoMatch({
        reasons: ["identity_too_new"],
        debugNotes: [`identity: ${identity}`],
      });
      return null;
    }

    if (momentum === "new") {
      trace?.recordNoMatch({
        reasons: ["relationship_too_new"],
        debugNotes: ["momentum: new"],
      });
      return null;
    }

    if (history === "none") {
      trace?.recordNoMatch({
        reasons: ["timeline_too_sparse"],
        debugNotes: ["history: none"],
      });
      return null;
    }

    if (history === "rich") {
      trace?.recordNoMatch({
        reasons: ["memory_inventory_rich"],
        debugNotes: ["history: rich"],
      });
      return null;
    }

    if (history !== "light" && history !== "moderate") {
      trace?.recordNoMatch({
        reasons: ["history_not_accumulation_ready"],
        debugNotes: [`history: ${history}`],
      });
      return null;
    }

    return {
      ...MEMORY_ACCUMULATION_CANDIDATE,
      debugNotes: [
        "MemoryAccumulationRule matched",
        `identity: ${identity}`,
        `history: ${history}`,
        `writing: ${writing}`,
        `freshness: ${freshness}`,
        `momentum: ${momentum}`,
        `last relationship activity days ago: ${lastRelationshipActivityDaysAgo}`,
      ],
    };
  },
};
