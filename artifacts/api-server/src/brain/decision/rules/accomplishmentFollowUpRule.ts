/**
 * AccomplishmentFollowUpRule — recommends follow-up when a recent accomplishment
 * was captured and the moment is still timely.
 *
 * Operates on factual fresh-update recency from DecisionContext.
 */

import { ACCOMPLISHMENT_FOLLOW_UP_THRESHOLD_DAYS } from "../../config/opportunityThresholds";
import { RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS } from "../../config/relationshipThresholds";
import type { DecisionContext } from "../decisionContextTypes";
import { isEventWithinPreparationWindow } from "../eventWindow";
import { isRomanticRelationshipType } from "../relationshipTypeMatchers";
import type { RuleEvaluationTrace } from "./internal/ruleEvaluationTrace";
import type { DecisionRule, RuleCandidate } from "./types";

const ACCOMPLISHMENT_QUESTION_KEY = "recent_accomplishment";

const ACCOMPLISHMENT_FOLLOW_UP_CANDIDATE: RuleCandidate = {
  ruleId: "accomplishment_follow_up",
  priority: 33,
  confidence: 43,
  decision: { outcome: "ask_question" },
  reasons: ["accomplishment_follow_up_due"],
  debugNotes: ["AccomplishmentFollowUpRule matched"],
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

export const accomplishmentFollowUpRule: DecisionRule = {
  id: "accomplishment_follow_up",
  evaluate(context: DecisionContext, trace?: RuleEvaluationTrace): RuleCandidate | null {
    const {
      freshness,
      lastRelationshipActivityDaysAgo,
      mostRecentFreshUpdateDaysAgo,
      mostRecentFreshUpdateQuestionKey,
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

    if (mostRecentFreshUpdateQuestionKey !== ACCOMPLISHMENT_QUESTION_KEY) {
      trace?.recordNoMatch({
        reasons: ["no_recent_accomplishment_update"],
        debugNotes: [
          `most recent fresh update question key: ${mostRecentFreshUpdateQuestionKey}`,
        ],
      });
      return null;
    }

    if (mostRecentFreshUpdateDaysAgo == null) {
      trace?.recordNoMatch({
        reasons: ["no_qualifying_accomplishment_signal"],
        debugNotes: ["mostRecentFreshUpdateDaysAgo: null"],
      });
      return null;
    }

    if (mostRecentFreshUpdateDaysAgo > ACCOMPLISHMENT_FOLLOW_UP_THRESHOLD_DAYS) {
      trace?.recordNoMatch({
        reasons: ["accomplishment_outside_window"],
        debugNotes: [
          `most recent fresh update days ago: ${mostRecentFreshUpdateDaysAgo}`,
          `accomplishment follow up threshold days: ${ACCOMPLISHMENT_FOLLOW_UP_THRESHOLD_DAYS}`,
        ],
      });
      return null;
    }

    return {
      ...ACCOMPLISHMENT_FOLLOW_UP_CANDIDATE,
      debugNotes: [
        "AccomplishmentFollowUpRule matched",
        `most recent fresh update question key: ${mostRecentFreshUpdateQuestionKey}`,
        `most recent fresh update days ago: ${mostRecentFreshUpdateDaysAgo}`,
        `accomplishment follow up threshold days: ${ACCOMPLISHMENT_FOLLOW_UP_THRESHOLD_DAYS}`,
        `freshness: ${freshness}`,
        `last relationship activity days ago: ${lastRelationshipActivityDaysAgo}`,
      ],
    };
  },
};
