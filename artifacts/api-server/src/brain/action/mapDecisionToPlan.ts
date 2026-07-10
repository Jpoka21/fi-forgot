/**
 * Deterministic mapping from rule attribution + outcome to plan category.
 */

import type { BrainDecisionOutcome } from "../types";
import type { ActionCategory, ActionPlanType, ActionPriority } from "./actionPlanTypes";

interface PlanMapping {
  type: ActionPlanType;
  category: ActionCategory;
}

const PLAN_MAPPINGS: Record<string, Partial<Record<BrainDecisionOutcome, PlanMapping>>> =
  {
    wait: {
      wait: { type: "wait", category: "none" },
    },
    fresh_update: {
      ask_question: { type: "ask_question", category: "fresh_update" },
    },
    birthday: {
      ask_question: { type: "ask_question", category: "birthday" },
      prepare_card: { type: "prepare_card", category: "birthday" },
    },
    anniversary: {
      ask_question: { type: "ask_question", category: "anniversary" },
      prepare_card: { type: "prepare_card", category: "anniversary" },
    },
    valentines_day: {
      ask_question: { type: "ask_question", category: "holiday" },
      prepare_card: { type: "prepare_card", category: "holiday" },
    },
    inactivity: {
      ask_question: { type: "ask_question", category: "follow_up" },
    },
    card_gap: {
      ask_question: { type: "ask_question", category: "card_opportunity" },
    },
    memory_accumulation: {
      ask_question: { type: "ask_question", category: "profile_information" },
    },
    accomplishment_follow_up: {
      ask_question: { type: "ask_question", category: "follow_up" },
    },
    life_event_follow_up: {
      ask_question: { type: "ask_question", category: "follow_up" },
    },
  };

export function mapDecisionToPlan(
  sourceRuleId: string,
  outcome: BrainDecisionOutcome,
): PlanMapping {
  const ruleMappings = PLAN_MAPPINGS[sourceRuleId];
  if (!ruleMappings) {
    throw new Error(`Action Planner: unknown sourceRuleId "${sourceRuleId}"`);
  }

  const mapping = ruleMappings[outcome];
  if (!mapping) {
    throw new Error(
      `Action Planner: mismatched sourceRuleId "${sourceRuleId}" and outcome "${outcome}"`,
    );
  }

  return mapping;
}

export function confidenceToPriority(confidence: number): ActionPriority {
  if (confidence <= 0) {
    return "low";
  }
  if (confidence <= 60) {
    return "medium";
  }
  return "high";
}
