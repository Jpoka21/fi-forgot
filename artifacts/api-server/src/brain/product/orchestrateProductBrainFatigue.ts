/**
 * Shared product Brain + Fatigue orchestration.
 *
 * Owns fatigue evaluation and centralized surfaced exposure recording.
 * Product builders remain responsible for caps and DTO mapping only.
 */

import type { GlobalOpportunityRecipientDisplay } from "../attention/buildGlobalOpportunityPool";
import { logger } from "../../lib/logger";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import { recordSurfacedOpportunities } from "../fatigue/exposure/recordSurfacedOpportunities";
import type { FatigueOpportunity } from "../fatigue/fatigueTypes";
import { runAttentionFatiguePipeline } from "../fatigue/runAttentionFatiguePipeline";

export interface ProductBrainFatigueBuildResult<TProduct> {
  product: TProduct;
  deliveredFatigueOpportunities: FatigueOpportunity[];
}

export interface OrchestrateProductBrainFatigueInput<TProduct> {
  userId: string;
  generatedAt: string;
  decisions: ProductBrainDecision[];
  recipients: GlobalOpportunityRecipientDisplay[];
  buildFromVisible: (
    visibleFatigueOpportunities: FatigueOpportunity[],
    generatedAt: string,
  ) => ProductBrainFatigueBuildResult<TProduct>;
}

export async function orchestrateProductBrainFatigue<TProduct>(
  input: OrchestrateProductBrainFatigueInput<TProduct>,
): Promise<TProduct> {
  const visibleFatigueOpportunities = await runAttentionFatiguePipeline({
    userId: input.userId,
    evaluatedAt: input.generatedAt,
    decisions: input.decisions,
    recipients: input.recipients,
  });

  const { product, deliveredFatigueOpportunities } = input.buildFromVisible(
    visibleFatigueOpportunities,
    input.generatedAt,
  );

  void recordSurfacedOpportunities({
    userId: input.userId,
    occurredAt: input.generatedAt,
    opportunities: deliveredFatigueOpportunities,
  }).catch((error) => {
    logger.warn(
      { err: error, userId: input.userId },
      "recordSurfacedOpportunities failed",
    );
  });

  return product;
}
