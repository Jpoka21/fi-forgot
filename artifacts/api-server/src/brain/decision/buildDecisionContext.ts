/**
 * DecisionContext builder — pure, read-only.
 *
 * Maps NormalizedRelationshipState into decision-facing vocabulary.
 * Does not call normalizeSignals, decide, contributors, or load context.
 */

import type { NormalizedRelationshipState } from "../normalization";
import type { DecisionContext } from "./decisionContextTypes";

/**
 * Builds a DecisionContext from already-normalized relationship state.
 * Deterministic pass-through / alias mapping only.
 */
export function buildDecisionContext(
  normalized: NormalizedRelationshipState,
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
