/**
 * Pure materialization from append-only exposure events to snapshot records.
 */

import type { ExposureEvent, ExposureRecord, ExposureSnapshot } from "./exposureTypes";

function maxIsoTimestamp(current: string | null, candidate: string): string {
  if (current === null) return candidate;
  return candidate > current ? candidate : current;
}

function upsertRecord(
  records: Record<string, ExposureRecord>,
  event: ExposureEvent,
): void {
  const existing = records[event.opportunityKey] ?? {
    opportunityKey: event.opportunityKey,
    recipientId: event.recipientId,
    sourceRuleId: event.sourceRuleId,
    lastSurfacedAt: null,
    lastDismissedAt: null,
    lastCompletedAt: null,
    surfacedCount: 0,
    dismissedCount: 0,
  };

  if (event.eventType === "surfaced") {
    existing.lastSurfacedAt = maxIsoTimestamp(existing.lastSurfacedAt, event.occurredAt);
    existing.surfacedCount += 1;
  } else if (event.eventType === "dismissed") {
    existing.lastDismissedAt = maxIsoTimestamp(existing.lastDismissedAt, event.occurredAt);
    existing.dismissedCount += 1;
  } else if (event.eventType === "completed") {
    existing.lastCompletedAt = maxIsoTimestamp(existing.lastCompletedAt, event.occurredAt);
  }

  records[event.opportunityKey] = existing;
}

export function materializeExposureSnapshot(
  events: readonly ExposureEvent[],
  loadedAt: string,
): ExposureSnapshot {
  const byOpportunityKey: Record<string, ExposureRecord> = {};

  for (const event of events) {
    upsertRecord(byOpportunityKey, event);
  }

  return {
    loadedAt,
    byOpportunityKey,
  };
}
