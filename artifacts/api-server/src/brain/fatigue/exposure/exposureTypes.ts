/**
 * Exposure read models for the Fatigue Engine.
 *
 * Internal only — never exposed through public API responses.
 */

export type ExposureEventType = "surfaced" | "dismissed" | "completed";

/** Append-only event shape. */
export interface ExposureEvent {
  id?: string;
  opportunityKey: string;
  recipientId: string;
  sourceRuleId: string;
  eventType: ExposureEventType;
  occurredAt: string;
  /** Present when derived from a Brain outcome projection. */
  sourceOutcomeEventId?: string;
}

/** Per-opportunity exposure state derived from events. */
export interface ExposureRecord {
  opportunityKey: string;
  recipientId: string;
  sourceRuleId: string;
  lastSurfacedAt: string | null;
  lastDismissedAt: string | null;
  lastCompletedAt: string | null;
  surfacedCount: number;
  dismissedCount: number;
}

/** Read-optimized snapshot passed into FatigueContext. */
export interface ExposureSnapshot {
  loadedAt: string;
  byOpportunityKey: Readonly<Record<string, ExposureRecord>>;
}

export function buildExposureOpportunityKey(recipientId: string, sourceRuleId: string): string {
  return `${recipientId}:${sourceRuleId}`;
}

export function assertValidExposureOpportunityIdentity(input: {
  opportunityKey: string;
  recipientId: string;
  sourceRuleId: string;
}): void {
  const expected = buildExposureOpportunityKey(input.recipientId, input.sourceRuleId);
  if (input.opportunityKey !== expected) {
    throw new Error(
      `Invalid exposure opportunity identity: opportunityKey "${input.opportunityKey}" does not match "${expected}"`,
    );
  }
}
