/**
 * Card cycle status projector — owned by the card domain, not Brain rules.
 *
 * Resolves the normalized cycle status for one catalog event occurrence.
 * Rules never see raw card rows or persistence status strings.
 */

import type { BrainEventId } from "../../brain/events/brainEventCatalogTypes";
import type { EventCardCycleStatus } from "../../brain/events/eventPreparationTypes";
import type { BriefingSummary } from "../recipient-context";
import {
  cardMatchesEventCycle,
  type EventCardCycleMatchContext,
  type EventCardInput,
} from "./eventCardMatching";
import {
  mapCardPersistenceStatus,
  normalizedCardCycleStatusRank,
} from "./mapCardPersistenceStatus";

export function projectEventCardCycleStatus(input: {
  eventId: BrainEventId;
  briefingEventLabel: string;
  cycleYear: number;
  occurrenceDateStr: string | null;
  briefingSummary: BriefingSummary;
  cards: readonly EventCardInput[];
  referenceDate: Date;
}): EventCardCycleStatus {
  void input.eventId;
  void input.referenceDate;

  const matchContext: EventCardCycleMatchContext = {
    briefingEventLabel: input.briefingEventLabel,
    occurrenceDateStr: input.occurrenceDateStr,
    briefingSummary: input.briefingSummary,
  };

  const matchingCards = input.cards.filter((card) =>
    cardMatchesEventCycle(
      card,
      input.briefingEventLabel,
      input.cycleYear,
      matchContext,
    ),
  );

  if (matchingCards.length === 0) {
    return "none";
  }

  let selected = matchingCards[0]!;
  let selectedRank = normalizedCardCycleStatusRank(
    mapCardPersistenceStatus(selected.status),
  );

  for (let index = 1; index < matchingCards.length; index++) {
    const candidate = matchingCards[index]!;
    const candidateStatus = mapCardPersistenceStatus(candidate.status);
    const candidateRank = normalizedCardCycleStatusRank(candidateStatus);

    if (candidateRank > selectedRank) {
      selected = candidate;
      selectedRank = candidateRank;
      continue;
    }

    if (
      candidateRank === selectedRank &&
      new Date(candidate.createdAt).getTime() > new Date(selected.createdAt).getTime()
    ) {
      selected = candidate;
    }
  }

  return mapCardPersistenceStatus(selected.status);
}
