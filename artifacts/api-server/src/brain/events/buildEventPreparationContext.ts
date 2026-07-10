/**
 * Builds normalized event preparation facts for all applicable catalog events.
 *
 * Events that do not apply (missing recipient date, failed relationship constraints)
 * are omitted from byEventId rather than populated with placeholder facts.
 */

import { evaluateEventBriefingCompletion } from "../../services/event-briefing";
import { projectEventCardCycleStatus } from "../../services/event-cards";
import type { RelationshipContext } from "../types";
import { isEventWithinPreparationWindow } from "../decision/eventWindow";
import { BRAIN_EVENT_IDS, getBrainEventDefinition } from "./brainEventCatalog";
import type { BrainEventId } from "./brainEventCatalogTypes";
import type { EventPreparationContext, EventPreparationFacts } from "./eventPreparationTypes";
import { resolveCatalogEventTiming } from "./resolveCatalogEventTiming";
import { resolveOccurrenceDateStr } from "./resolveOccurrenceDateStr";

export function buildEventPreparationContext(input: {
  relationshipContext: RelationshipContext;
  referenceDate: Date;
  preparationWindowDays: number | null;
}): EventPreparationContext {
  const { relationshipContext, referenceDate, preparationWindowDays } = input;
  const byEventId: Partial<Record<BrainEventId, EventPreparationFacts>> = {};

  for (const eventId of BRAIN_EVENT_IDS) {
    const definition = getBrainEventDefinition(eventId);
    const timing = resolveCatalogEventTiming(definition, relationshipContext, referenceDate);

    if (!timing.applicable || timing.cycleYear == null) {
      continue;
    }

    const briefingComplete = evaluateEventBriefingCompletion({
      eventId,
      briefingEventLabel: definition.briefingEventLabel,
      cycleYear: timing.cycleYear,
      briefingSummary: relationshipContext.briefingSummary,
    }).complete;

    const cardCycleStatus = projectEventCardCycleStatus({
      eventId,
      briefingEventLabel: definition.briefingEventLabel,
      cycleYear: timing.cycleYear,
      occurrenceDateStr: resolveOccurrenceDateStr(definition, relationshipContext),
      briefingSummary: relationshipContext.briefingSummary,
      cards: relationshipContext.writingHistory.cards,
      referenceDate,
    });

    byEventId[eventId] = {
      eventId,
      cycleYear: timing.cycleYear,
      daysUntilEvent: timing.daysUntilEvent,
      withinPreparationWindow: isEventWithinPreparationWindow(
        timing.daysUntilEvent,
        preparationWindowDays,
      ),
      briefingComplete,
      cardCycleStatus,
    };
  }

  return { byEventId };
}
