/**
 * Product Brain Decision — versioned public contract for product integration.
 */

import type { BrainDecisionOutcome } from "../types";
import type {
  ActionCategory,
  ActionPlanType,
  ActionPriority,
} from "../action/actionPlanTypes";
import type {
  FollowUpQuestionCategory,
  FollowUpQuestionSensitivity,
} from "../questions/questionTypes";
import type { RuleEvaluationSummary } from "../decision/rules/ruleEvaluationTypes";

/** Public contract version. Increment only on breaking DTO changes. */
export const PRODUCT_BRAIN_DECISION_VERSION = 1 as const;

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

/** Development-only diagnostics. Never present in production responses. */
export interface ProductBrainDecisionDebug {
  generatedAt: string;
  confidence: number;
  reasons: string[];
  brainContextVersion: number;
  ruleEvaluation: RuleEvaluationSummary;
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
