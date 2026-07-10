/**
 * Exposure read models for the Fatigue Engine.
 *
 * Internal only — never exposed through public API responses.
 */

export type ExposureEventType =
  | "surfaced"
  | "dismissed"
  | "read"
  | "completed"
  | "deferred";

/** Append-only event shape (persistence in Sprint 5d+). */
export interface ExposureEvent {
  opportunityKey: string;
  recipientId: string;
  sourceRuleId: string;
  eventType: ExposureEventType;
  occurredAt: string;
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
