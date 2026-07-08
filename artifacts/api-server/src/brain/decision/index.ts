/**
 * Decision package — public surface for DecisionContext types and builder.
 *
 * decide() remains a separate frozen scaffold and is not re-exported here
 * to avoid implying DecisionContext is already consumed by the decision engine.
 */

export { buildDecisionContext } from "./buildDecisionContext";

export type {
  DecisionContext,
  DecisionContextDerivedFrom,
  EngagementLevel,
  InformationFreshness,
  RelationshipMaturity,
  RelationshipMomentum,
  TimelineHistory,
  WritingReadiness,
} from "./decisionContextTypes";
