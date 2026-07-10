/**
 * Centralized surfaced exposure recording.
 */

import { logger } from "../../../lib/logger";
import type { FatigueOpportunity } from "../fatigueTypes";
import { recordExposureEvent } from "./recordExposureEvent";

export interface RecordSurfacedOpportunitiesInput {
  userId: string;
  occurredAt: string;
  opportunities: readonly FatigueOpportunity[];
}

export function dedupeSurfacedFatigueOpportunities(
  opportunities: readonly FatigueOpportunity[],
): FatigueOpportunity[] {
  const seen = new Set<string>();
  const unique: FatigueOpportunity[] = [];

  for (const item of opportunities) {
    const key = item.opportunity.opportunityKey;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return unique;
}

export async function recordSurfacedOpportunities(
  input: RecordSurfacedOpportunitiesInput,
): Promise<void> {
  const delivered = dedupeSurfacedFatigueOpportunities(input.opportunities);

  const results = await Promise.allSettled(
    delivered.map((item) =>
      recordExposureEvent({
        userId: input.userId,
        opportunityKey: item.opportunity.opportunityKey,
        recipientId: item.opportunity.recipientId,
        sourceRuleId: item.opportunity.decision.sourceRuleId,
        eventType: "surfaced",
        occurredAt: input.occurredAt,
      }),
    ),
  );

  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length > 0) {
    logger.warn(
      {
        userId: input.userId,
        failureCount: failures.length,
        deliveredCount: delivered.length,
      },
      "recordSurfacedOpportunities had write failures",
    );
  }
}
