/**
 * Pure Brain outcome → exposure append mapping.
 *
 * No database access, no mutation, no clock reads.
 */

import type { InsertExposureEventInput } from "../../fatigue/exposure/exposureRepository";
import type { ExposureEventType } from "../../fatigue/exposure/exposureTypes";
import type { BrainOutcomeEvent, BrainOutcomeType } from "../outcomeTypes";

const PROJECTING_OUTCOME_TO_EXPOSURE: Partial<
  Record<BrainOutcomeType, Extract<ExposureEventType, "completed" | "dismissed">>
> = {
  question_answered: "completed",
  card_sent: "completed",
  opportunity_dismissed: "dismissed",
};

export type OutcomeDerivedExposureAppendInput = InsertExposureEventInput & {
  sourceOutcomeEventId: string;
  eventType: Extract<ExposureEventType, "completed" | "dismissed">;
};

function sourceRuleIdFromOpportunityKey(event: BrainOutcomeEvent): string {
  return event.opportunityKey.slice(event.recipientId.length + 1);
}

export function mapBrainOutcomeToExposure(
  event: BrainOutcomeEvent,
): OutcomeDerivedExposureAppendInput | null {
  const eventType = PROJECTING_OUTCOME_TO_EXPOSURE[event.outcomeType];
  if (!eventType) {
    return null;
  }

  return {
    userId: event.userId,
    opportunityKey: event.opportunityKey,
    recipientId: event.recipientId,
    sourceRuleId: sourceRuleIdFromOpportunityKey(event),
    eventType,
    occurredAt: event.occurredAt,
    sourceOutcomeEventId: event.id,
  };
}
