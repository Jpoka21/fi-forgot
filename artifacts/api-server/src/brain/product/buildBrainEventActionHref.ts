/**
 * Authoritative server-side Brain action destinations for product builders.
 *
 * Consumes Action Planner routing — never infers event identity from sourceRuleId.
 */

import type { ActionPlanRouting } from "../action/actionPlanTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";

export interface BuildBrainEventActionHrefInput {
  recipientId: string;
  sourceRuleId: string;
  routing: ActionPlanRouting;
}

export function buildRelationshipProfileHref(recipientId: string): string {
  return `/relationship/${recipientId}`;
}

/**
 * Builds an authoritative briefing URL when routing authorizes it.
 * Returns null for incomplete routing or unsupported experiences.
 */
export function buildBrainEventActionHref(
  input: BuildBrainEventActionHrefInput,
): string | null {
  const { recipientId, sourceRuleId, routing } = input;

  if (!routing.eventId || !routing.briefingEventLabel?.trim()) {
    return null;
  }

  const encodedLabel = encodeURIComponent(routing.briefingEventLabel.trim());
  const basePath = `/briefings/${recipientId}/${encodedLabel}`;

  if (routing.experience === "event_briefing") {
    return basePath;
  }

  if (routing.experience === "card_preparation_briefing") {
    const params = new URLSearchParams({
      brainSourceRuleId: sourceRuleId,
    });
    return `${basePath}?${params.toString()}`;
  }

  return null;
}

export function resolveProductBrainActionHref(
  decision: ProductBrainDecision,
  recipientId: string,
): string {
  const fallback = buildRelationshipProfileHref(recipientId);
  const routing = decision.actionPlan.routing;
  if (routing == null) {
    return fallback;
  }

  const href = buildBrainEventActionHref({
    recipientId,
    sourceRuleId: decision.sourceRuleId,
    routing,
  });

  return href ?? fallback;
}
