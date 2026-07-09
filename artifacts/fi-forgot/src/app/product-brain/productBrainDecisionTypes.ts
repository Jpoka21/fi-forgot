/**
 * Product Brain Decision — frontend mirror of the public API contract (v1).
 */

export const PRODUCT_BRAIN_DECISION_VERSION = 1 as const;

export type BrainDecisionOutcome =
  | "wait"
  | "do_nothing"
  | "ask_question"
  | "prepare_card"
  | "recommend_action"
  | "show_dashboard_insight";

export type ActionPlanType = BrainDecisionOutcome;

export type ActionCategory =
  | "none"
  | "fresh_update"
  | "profile_information"
  | "follow_up"
  | "birthday"
  | "anniversary"
  | "holiday"
  | "card_opportunity"
  | "dashboard_insight";

export type ActionPriority = "low" | "medium" | "high";

export type FollowUpQuestionCategory =
  | "life_event_follow_up"
  | "fresh_update_follow_up"
  | "accomplishment_follow_up"
  | "inactivity_reconnect"
  | "memory_collection"
  | "card_gap_context";

export type FollowUpQuestionSensitivity = "low" | "medium" | "high";

export interface ProductBrainSelectedQuestion {
  questionId: string;
  questionText: string;
  category: FollowUpQuestionCategory;
  sensitivity: FollowUpQuestionSensitivity;
}

export interface ProductBrainActionPlan {
  type: ActionPlanType;
  category: ActionCategory;
  priority: ActionPriority;
  primaryReason: string;
}

export interface ProductBrainDisplay {
  title: string;
  explanation: string;
}

export interface ProductBrainDecisionDebug {
  generatedAt: string;
  confidence: number;
  reasons: string[];
  brainContextVersion: number;
  ruleEvaluation: unknown;
}

export interface ProductBrainDecision {
  version: typeof PRODUCT_BRAIN_DECISION_VERSION;
  recipientId: string;
  decision: {
    outcome: BrainDecisionOutcome;
  };
  sourceRuleId: string;
  actionPlan: ProductBrainActionPlan;
  selectedFollowUpQuestion: ProductBrainSelectedQuestion | null;
  display: ProductBrainDisplay;
  debug?: ProductBrainDecisionDebug;
}
