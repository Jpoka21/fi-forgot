/**
 * Collects ProductBrainDecision for all owned recipients.
 * No ranking, filtering, mapping, or DTO shaping.
 */

import { buildProductBrainDecision } from "../product/buildProductBrainDecision";
import type { ProductBrainDecision } from "../product/productBrainDecisionTypes";
import type { BrainExecutionResult } from "../orchestrator";

export interface AttentionRecipientInput {
  recipientId: string;
}

export type RunBrainForRecipient = (
  recipientId: string,
  userId: string,
) => Promise<BrainExecutionResult>;

export interface CollectProductBrainDecisionsOptions {
  userId: string;
  recipients: AttentionRecipientInput[];
  runBrain: RunBrainForRecipient;
}

export async function collectProductBrainDecisions(
  options: CollectProductBrainDecisionsOptions,
): Promise<ProductBrainDecision[]> {
  const { userId, recipients, runBrain } = options;
  const decisions: ProductBrainDecision[] = [];

  for (const recipient of recipients) {
    const execution = await runBrain(recipient.recipientId, userId);
    decisions.push(buildProductBrainDecision(recipient.recipientId, execution));
  }

  return decisions;
}
