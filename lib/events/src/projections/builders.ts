/**
 * Projection builders — assemble isolated, immutable consumer read models.
 *
 * Never return live registry references for mutable arrays.
 * Never expose the full internal event definition.
 */

import { getEvent, listEvents } from "../core/identity.js";
import type { EventId } from "../core/types.js";
import {
  getBriefingQuestionSetMeta,
  getEventBriefingRef,
} from "../briefing/registry.js";
import { getEventAvailability } from "../availability/registry.js";
import { getEventScheduling } from "../scheduling/registry.js";
import { getEventPresentation } from "../presentation/registry.js";
import {
  getAiGenerationIntegration,
  getCardClassifierIntegration,
  getCardLibraryIntegration,
  getHandwryttenIntegration,
} from "../integrations/registry.js";
import type {
  AdminProjection,
  AiProjection,
  BriefingProjection,
  CalendarProjection,
  CardLibraryProjection,
  CatalogProjection,
  FrontendOccasionProjection,
  HandwryttenProjection,
} from "./types.js";

function freezeProjection<T extends object>(value: T): Readonly<T> {
  return Object.freeze(value);
}

export function getCatalogProjection(eventId: EventId): CatalogProjection | null {
  const identity = getEvent(eventId);
  if (!identity) {
    return null;
  }
  return freezeProjection({
    eventId: identity.eventId,
    displayLabel: identity.displayLabel,
    category: identity.category,
    kind: identity.kind,
    active: identity.active,
  });
}

export function listCatalogProjections(options?: {
  activeOnly?: boolean;
}): readonly CatalogProjection[] {
  return listEvents(options)
    .map((identity) => getCatalogProjection(identity.eventId))
    .filter((p): p is CatalogProjection => p != null);
}

export function getFrontendOccasionProjection(
  eventId: EventId,
): FrontendOccasionProjection | null {
  const identity = getEvent(eventId);
  if (!identity || !identity.active) {
    return null;
  }
  const availability = getEventAvailability(eventId);
  const briefing = getEventBriefingRef(eventId);
  const presentation = getEventPresentation(eventId);

  return freezeProjection({
    eventId: identity.eventId,
    displayLabel: identity.displayLabel,
    emoji: presentation?.emoji ?? null,
    personal: availability?.surfaces.personal ?? false,
    business: availability?.surfaces.business ?? false,
    briefingQuestionSetId: briefing?.questionSetId ?? null,
  });
}

export function listFrontendOccasionProjections(): readonly FrontendOccasionProjection[] {
  return listEvents({ activeOnly: true })
    .map((identity) => getFrontendOccasionProjection(identity.eventId))
    .filter((p): p is FrontendOccasionProjection => p != null);
}

export function getCalendarProjection(eventId: EventId): CalendarProjection | null {
  const identity = getEvent(eventId);
  if (!identity || !identity.active) {
    return null;
  }
  const presentation = getEventPresentation(eventId);
  const scheduling = getEventScheduling(eventId);

  return freezeProjection({
    eventId: identity.eventId,
    displayLabel: identity.displayLabel,
    emoji: presentation?.emoji ?? null,
    calendarVisible: presentation?.calendar.visible ?? false,
    filterGroup: presentation?.calendar.filterGroup ?? null,
    // Expose timing kind only — not full timing definition / constraints
    timingKind: scheduling?.timing.kind ?? null,
  });
}

export function listCalendarProjections(): readonly CalendarProjection[] {
  return listEvents({ activeOnly: true })
    .map((identity) => getCalendarProjection(identity.eventId))
    .filter((p): p is CalendarProjection => p != null && p.calendarVisible);
}

export function getBriefingProjection(eventId: EventId): BriefingProjection | null {
  const identity = getEvent(eventId);
  const briefing = getEventBriefingRef(eventId);
  if (!identity || !briefing) {
    return null;
  }
  const meta = getBriefingQuestionSetMeta(briefing.questionSetId);
  if (!meta) {
    return null;
  }

  return freezeProjection({
    eventId: identity.eventId,
    displayLabel: identity.displayLabel,
    questionSetId: briefing.questionSetId,
    questionSetVersion: briefing.version,
    questionSetTitle: meta.title,
  });
}

export function listBriefingProjections(): readonly BriefingProjection[] {
  return listEvents({ activeOnly: true })
    .map((identity) => getBriefingProjection(identity.eventId))
    .filter((p): p is BriefingProjection => p != null);
}

export function getAdminProjection(eventId: EventId): AdminProjection | null {
  const identity = getEvent(eventId);
  if (!identity) {
    return null;
  }
  const presentation = getEventPresentation(eventId);
  return freezeProjection({
    eventId: identity.eventId,
    displayLabel: identity.displayLabel,
    adminBadgeClass: presentation?.adminBadgeClass ?? null,
    calendarVisible: presentation?.calendar.visible ?? false,
    active: identity.active,
  });
}

export function getHandwryttenProjection(
  eventId: EventId,
): HandwryttenProjection | null {
  const identity = getEvent(eventId);
  const hw = getHandwryttenIntegration(eventId);
  const library = getCardLibraryIntegration(eventId);
  if (!identity || !hw) {
    return null;
  }
  return freezeProjection({
    eventId: identity.eventId,
    displayLabel: identity.displayLabel,
    categories: Object.freeze([...hw.categories]),
    libraryCategories: Object.freeze([...(library?.libraryCategories ?? [])]),
    scoringHints: Object.freeze([...(hw.scoringHints ?? [])]),
  });
}

export function getAiProjection(eventId: EventId): AiProjection | null {
  const identity = getEvent(eventId);
  const ai = getAiGenerationIntegration(eventId);
  const classifier = getCardClassifierIntegration(eventId);
  if (!identity || !ai) {
    return null;
  }
  return freezeProjection({
    eventId: identity.eventId,
    displayLabel: identity.displayLabel,
    archetypes: Object.freeze([...ai.archetypes]),
    matchKeywords: Object.freeze([...(classifier?.matchKeywords ?? [])]),
    excludeKeywords: Object.freeze([...(classifier?.excludeKeywords ?? [])]),
  });
}

export function getCardLibraryProjection(
  eventId: EventId,
): CardLibraryProjection | null {
  const identity = getEvent(eventId);
  const library = getCardLibraryIntegration(eventId);
  if (!identity || !library) {
    return null;
  }
  return freezeProjection({
    eventId: identity.eventId,
    displayLabel: identity.displayLabel,
    libraryCategories: Object.freeze([...library.libraryCategories]),
  });
}
