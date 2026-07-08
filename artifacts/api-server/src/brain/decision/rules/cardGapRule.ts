/**
 * CardGapRule — recommends a handwritten card when the card channel has gone quiet.
 *
 * Operates purely on factual card and activity recency from DecisionContext.
 */

import { CARD_GAP_THRESHOLD_DAYS } from "../../config/opportunityThresholds";
import { RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS } from "../../config/relationshipThresholds";
import type { DecisionContext } from "../decisionContextTypes";
import { isEventWithinPreparationWindow } from "../eventWindow";
import { isRomanticRelationshipType } from "../relationshipTypeMatchers";
import type { RuleEvaluationTrace } from "./internal/ruleEvaluationTrace";
import type { DecisionRule, RuleCandidate } from "./types";

const CARD_GAP_CANDIDATE: RuleCandidate = {
  ruleId: "card_gap",
  priority: 35,
  confidence: 45,
  decision: { outcome: "ask_question" },
  reasons: ["card_channel_quiet"],
  debugNotes: ["CardGapRule matched"],
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

export const cardGapRule: DecisionRule = {
  id: "card_gap",
  evaluate(context: DecisionContext, trace?: RuleEvaluationTrace): RuleCandidate | null {
    const {
      lastCardActivityDaysAgo,
      lastRelationshipActivityDaysAgo,
      freshness,
      identity,
      writing,
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

    if (lastCardActivityDaysAgo == null) {
      if (writing === "none") {
        trace?.recordNoMatch({
          reasons: ["no_card_history_and_no_writing"],
          debugNotes: ["lastCardActivityDaysAgo: null", "writing: none"],
        });
      } else {
        trace?.recordNoMatch({
          reasons: ["no_card_activity"],
          debugNotes: ["lastCardActivityDaysAgo: null"],
        });
      }
      return null;
    }

    if (lastCardActivityDaysAgo <= CARD_GAP_THRESHOLD_DAYS) {
      trace?.recordNoMatch({
        reasons: ["card_activity_within_threshold"],
        debugNotes: [
          `last card activity days ago: ${lastCardActivityDaysAgo}`,
          `threshold days: ${CARD_GAP_THRESHOLD_DAYS}`,
        ],
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

    if (freshness === "stale") {
      trace?.recordNoMatch({
        reasons: ["freshness_stale"],
        debugNotes: ["freshness: stale"],
      });
      return null;
    }

    if (identity !== "developing" && identity !== "established") {
      trace?.recordNoMatch({
        reasons: ["identity_not_mature_enough"],
        debugNotes: [`identity: ${identity}`],
      });
      return null;
    }

    return {
      ...CARD_GAP_CANDIDATE,
      debugNotes: [
        "CardGapRule matched",
        `last card activity days ago: ${lastCardActivityDaysAgo}`,
        `card gap threshold days: ${CARD_GAP_THRESHOLD_DAYS}`,
        `last relationship activity days ago: ${lastRelationshipActivityDaysAgo}`,
      ],
    };
  },
};
