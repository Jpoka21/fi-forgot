/**
 * Enriches a mapped ActionPlan with server-side product routing metadata.
 *
 * Pure enrichment after mapDecisionToPlan — no URLs or side effects.
 * Briefing labels come from Event Domain briefing refs via the Brain adapter.
 */

import { getBrainEventBriefingMetadata } from "../events/eventDomain/index.js";
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
    const briefing = getBrainEventBriefingMetadata(targetEventId);

    if (outcome === "ask_question") {
      return {
        experience: "event_briefing",
        eventId: targetEventId,
        briefingEventLabel: briefing.questionSetTitle,
      };
    }

    if (outcome === "prepare_card") {
      return {
        experience: "card_preparation_briefing",
        eventId: targetEventId,
        briefingEventLabel: briefing.questionSetTitle,
      };
    }
  }

  if (outcome === "ask_question" && CATALOG_FOLLOW_UP_SOURCE_RULE_IDS.has(sourceRuleId)) {
    return { experience: "catalog_follow_up_question" };
  }

  return undefined;
}
