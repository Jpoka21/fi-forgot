/**
 * Attention planner + fatigue evaluation for product builders.
 */

import { planAttentionOrder } from "../attention/planAttentionOrder";
import type { GlobalOpportunityRecipientDisplay } from "../attention/buildGlobalOpportunityPool";
import type { ProductBrainDecision } from "../product/productBrainDecisionTypes";
import { applyFatigue } from "./applyFatigue";
import { buildFatigueContext } from "./buildFatigueContext";
import type { FatigueOpportunity } from "./fatigueTypes";
import { getVisibleFatigueOpportunities } from "./getVisibleFatigueOpportunities";

export interface RunAttentionFatiguePipelineInput {
  userId: string;
  evaluatedAt: string;
  decisions: ProductBrainDecision[];
  recipients: GlobalOpportunityRecipientDisplay[];
}

function passThroughFatigueOpportunities(
  ranked: ReturnType<typeof planAttentionOrder>,
): FatigueOpportunity[] {
  return ranked.map((opportunity) => ({
    opportunity,
    fatigueDecision: "visible",
    suppressionReason: null,
    deferUntil: null,
  }));
}

export async function runAttentionFatiguePipeline(
  input: RunAttentionFatiguePipelineInput,
): Promise<FatigueOpportunity[]> {
  const ranked = planAttentionOrder({
    decisions: input.decisions,
    recipients: input.recipients,
  });

  try {
    const context = await buildFatigueContext({
      userId: input.userId,
      evaluatedAt: input.evaluatedAt,
    });
    const fatigued = applyFatigue(ranked, context);
    return getVisibleFatigueOpportunities(fatigued);
  } catch {
    return passThroughFatigueOpportunities(ranked);
  }
}
