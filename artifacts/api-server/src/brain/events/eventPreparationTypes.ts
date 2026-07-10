/**
 * Event preparation facts — decision-facing normalized state for calendar occasions.
 *
 * Populated by buildEventPreparationContext() from briefing and card domain projectors.
 */

import type { BrainEventId } from "./brainEventCatalogTypes";

export type EventCardCycleStatus =
  | "none"
  | "in_progress"
  | "ready_for_approval"
  | "approved"
  | "mailed"
  | "terminal";

export interface EventPreparationFacts {
  eventId: BrainEventId;
  cycleYear: number;
  daysUntilEvent: number | null;
  withinPreparationWindow: boolean;
  briefingComplete: boolean;
  cardCycleStatus: EventCardCycleStatus;
}

export interface EventPreparationContext {
  byEventId: Readonly<Partial<Record<BrainEventId, EventPreparationFacts>>>;
}

export function createEmptyEventPreparationContext(): EventPreparationContext {
  return { byEventId: {} };
}
