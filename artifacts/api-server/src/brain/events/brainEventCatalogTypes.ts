/**
 * Brain event catalog types — server-only calendar occasion definitions.
 *
 * Event identity (`eventId`) is stable across rules and sourced from
 * `@workspace/events` via the Brain eventDomain adapter.
 *
 * Rule identity (`sourceRuleId`) remains independent for attribution,
 * opportunity keys, and fatigue. eventId !== sourceRuleId by contract.
 */

import type { BrainCanonicalEventId } from "./eventDomain/index.js";

/**
 * Compatibility alias — must remain identical to Event Domain EVENT_IDS.
 * Authoritative source: `@workspace/events` via eventDomain adapter.
 */
export type BrainEventId = BrainCanonicalEventId;

export type BrainEventRecipientDateField = "birthday" | "anniversary";

/**
 * Fixed-calendar month-day string from Event Domain timing metadata.
 * Not an independent Brain calendar catalog — values come from the adapter.
 */
export type BrainEventFixedCalendarMonthDay = string;

export type BrainEventTimingDefinition =
  | {
      kind: "recipient_date";
      field: BrainEventRecipientDateField;
    }
  | {
      kind: "fixed_calendar";
      monthDay: BrainEventFixedCalendarMonthDay;
    };

/**
 * Compatibility facade shape for existing Brain consumers.
 * Static fields are populated from eventDomain preparation metadata.
 */
export interface BrainEventDefinition {
  eventId: BrainEventId;
  briefingEventLabel: string;
  timing: BrainEventTimingDefinition;
}
