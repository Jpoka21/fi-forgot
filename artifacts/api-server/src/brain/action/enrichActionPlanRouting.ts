/**
 * Enriches a mapped ActionPlan with server-side product routing metadata.
 *
 * Pure enrichment after mapDecisionToPlan — no URLs or side effects.
 */

import { getBrainEventDefinition } from "../events/brainEventCatalog";
import { ruleTargetEventId } from "../events/ruleEventTargeting";
import type { BrainDecisionOutcome } from "../types";
import { RULE_ID_TO_QUESTION_CATEGORY } from "../questions/ruleIdQuestionCategoryMapping";
import type { ActionPlan, ActionPlanRouting } from "./actionPlanTypes";

const CATALOG_FOLLOW_UP_SOURCE_RULE_IDS = new Set(
  Object.keys(RULE_ID_TO_QUESTION_CATEGORY),
);

export function enrichActionPlanRouting(
  plan: Omit<ActionPlan, "routing">,
  outcome: BrainDecisionOutcome,
): ActionPlan {
  const routing = resolveActionPlanRouting(plan.sourceRuleId, outcome);
  if (routing == null) {
    return plan;
  }

  return { ...plan, routing };
}

function resolveActionPlanRouting(
  sourceRuleId: string,
  outcome: BrainDecisionOutcome,
): ActionPlanRouting | undefined {
  const targetEventId = ruleTargetEventId(sourceRuleId);

  if (targetEventId != null) {
    const definition = getBrainEventDefinition(targetEventId);

    if (outcome === "ask_question") {
      return {
        experience: "event_briefing",
        eventId: targetEventId,
        briefingEventLabel: definition.briefingEventLabel,
      };
    }

    if (outcome === "prepare_card") {
      return {
        experience: "card_preparation_briefing",
        eventId: targetEventId,
        briefingEventLabel: definition.briefingEventLabel,
      };
    }
  }

  if (outcome === "ask_question" && CATALOG_FOLLOW_UP_SOURCE_RULE_IDS.has(sourceRuleId)) {
    return { experience: "catalog_follow_up_question" };
  }

  return undefined;
}
