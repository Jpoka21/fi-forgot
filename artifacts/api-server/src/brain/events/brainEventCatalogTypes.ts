/**
 * Brain event catalog types — server-only calendar occasion definitions.
 *
 * Event identity (`eventId`) is stable across rules. Rule identity (`sourceRuleId`)
 * remains independent for attribution, opportunity keys, and fatigue.
 */

/** Registered calendar occasion ids in the Brain event catalog. */
export type BrainEventId = "birthday" | "anniversary" | "valentines_day";

export type BrainEventRecipientDateField = "birthday" | "anniversary";

export type BrainEventFixedCalendarMonthDay = "02-14";

export type BrainEventTimingDefinition =
  | {
      kind: "recipient_date";
      field: BrainEventRecipientDateField;
    }
  | {
      kind: "fixed_calendar";
      monthDay: BrainEventFixedCalendarMonthDay;
    };

export interface BrainEventConstraints {
  /** When set, the occasion applies only to matching relationship types. */
  relationshipTypes?: readonly string[];
}

export interface BrainEventDefinition {
  eventId: BrainEventId;
  briefingEventLabel: string;
  timing: BrainEventTimingDefinition;
  constraints?: BrainEventConstraints;
}
