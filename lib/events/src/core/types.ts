/**
 * Core event identity types.
 *
 * EventId is a closed compile-time union derived from EVENT_IDS.
 * This package never defines Brain sourceRuleId — that identity belongs to Brain.
 */

import type { EventId } from "./eventIds.js";

export type { EventId } from "./eventIds.js";

export type EventCategory =
  | "calendar"
  | "life_milestone"
  | "sentiment"
  | "business"
  | "ad_hoc";

export type EventKind =
  | "recurring_scheduled"
  | "one_time"
  | "unscheduled";

/**
 * Authoritative identity record for a registered event.
 * Display labels are presentation/persistence strings — not permanent identity.
 * Stable identity is always `eventId`.
 */
export interface EventIdentity {
  readonly eventId: EventId;
  /** Canonical display / persistence label (e.g. "Valentine's Day"). */
  readonly displayLabel: string;
  /** Alternate spellings accepted by normalization. Not identity. */
  readonly aliases: readonly string[];
  readonly category: EventCategory;
  readonly kind: EventKind;
  readonly active: boolean;
}

/**
 * Occurrence identity is distinct from EventId.
 *
 * An occurrence is a specific cycle of an event (date + year).
 * This package defines the shape only — occurrence resolution is stubbed.
 * Do not confuse with Brain sourceRuleId or EventId.
 */
export interface EventOccurrenceRef {
  readonly eventId: EventId;
  readonly cycleYear: number;
  readonly occurrenceDateStr: string;
}
