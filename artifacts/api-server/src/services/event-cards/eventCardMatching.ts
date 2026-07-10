/**
 * Card-to-event cycle matching helpers for the card domain projector.
 */

import { normalizeEventLabel } from "./normalizeEventLabel";
import {
  resolveCardCycleYear,
  type EventCardCycleMatchContext,
} from "./resolveCardCycleYear";

export interface EventCardInput {
  eventType: string;
  eventDate: string | null;
  dueDateFromData: string | null;
  storedEventYear: number | null;
  status: string;
  createdAt: string;
}

export function cardMatchesEventCycle(
  card: EventCardInput,
  briefingEventLabel: string,
  cycleYear: number,
  context: EventCardCycleMatchContext,
): boolean {
  if (normalizeEventLabel(card.eventType) !== normalizeEventLabel(briefingEventLabel)) {
    return false;
  }

  const cardCycleYear = resolveCardCycleYear(card, context);
  if (cardCycleYear == null) {
    return false;
  }

  return cardCycleYear === cycleYear;
}

export type { EventCardCycleMatchContext };
