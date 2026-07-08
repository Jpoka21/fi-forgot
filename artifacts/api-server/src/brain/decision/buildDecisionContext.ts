/**
 * DecisionContext builder — pure, read-only.
 *
 * Fuses NormalizedRelationshipState with RelationshipContext into the complete
 * decision model. Does not call normalizeSignals, decide, or contributors.
 */

import type { NormalizedRelationshipState } from "../normalization";
import type { RelationshipContext } from "../types";
import type { DecisionContext } from "./decisionContextTypes";
import { computeAnniversaryDaysAway, computeBirthdayDaysAway, computeValentinesDaysAway } from "./eventTimingUtils";

/**
 * Builds a DecisionContext from normalized relationship state and loaded context.
 * Deterministic mapping only — no rule evaluation.
 */
export function buildDecisionContext(
  normalized: NormalizedRelationshipState,
  relationshipContext: RelationshipContext,
): DecisionContext {
  const {
    identity,
    freshness,
    history,
    writing,
    engagement,
    momentum,
    derivedFrom,
  } = normalized;

  const birthdayDaysAway = computeBirthdayDaysAway(
    relationshipContext.relationship?.birthday,
    relationshipContext.generatedAt,
  );
  const anniversaryDaysAway = computeAnniversaryDaysAway(
    relationshipContext.relationship?.anniversary,
    relationshipContext.generatedAt,
  );
  const valentinesDaysAway = computeValentinesDaysAway(relationshipContext.generatedAt);
  const relationshipType = relationshipContext.relationship?.type ?? null;
  const preparationWindowDays = relationshipContext.delivery.previewDays;
  const lastRelationshipActivityDaysAgo =
    relationshipContext.relationshipTimeline.events[0]?.daysAgo ?? null;

  return {
    identity,
    freshness,
    history,
    writing,
    engagement,
    momentum,

    relationshipMaturity: identity,
    informationFreshness: freshness,
    writingReadiness: writing,
    engagementLevel: engagement,
    relationshipMomentum: momentum,
    timelineHistory: history,

    birthdayDaysAway,
    anniversaryDaysAway,
    valentinesDaysAway,
    relationshipType,
    preparationWindowDays,
    lastRelationshipActivityDaysAgo,

    derivedFrom: {
      signalCount: derivedFrom.signalCount,
      sourcesPresent: [...derivedFrom.sourcesPresent],
      normalizedSnapshot: {
        identity,
        freshness,
        history,
        writing,
        engagement,
        momentum,
      },
    },
  };
}
