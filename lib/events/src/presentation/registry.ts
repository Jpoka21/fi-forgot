/**
 * Presentation registry — UI metadata only.
 * Never consumed by Brain decision logic.
 */

import {
  assertCompleteEventRecord,
  type CompleteEventRecord,
  type EventId,
} from "../core/eventIds.js";
import type { EventPresentation } from "./types.js";

function freezePresentation(entry: EventPresentation): EventPresentation {
  return Object.freeze({
    ...entry,
    calendar: Object.freeze({ ...entry.calendar }),
    timeline: Object.freeze({ ...entry.timeline }),
    onboarding: Object.freeze({ ...entry.onboarding }),
  });
}

export const EVENT_PRESENTATION_REGISTRY: CompleteEventRecord<EventPresentation> =
  Object.freeze(
    assertCompleteEventRecord(
      {
        birthday: freezePresentation({
          eventId: "birthday",
          emoji: "🎂",
          adminBadgeClass: "bg-pink-100 text-pink-700",
          calendar: { visible: true, filterGroup: "birthdays" },
          timeline: { visible: true },
          onboarding: { defaultWeight: 100 },
        }),
        anniversary: freezePresentation({
          eventId: "anniversary",
          emoji: "💕",
          adminBadgeClass: "bg-rose-100 text-rose-700",
          calendar: { visible: true, filterGroup: "anniversaries" },
          timeline: { visible: true },
          onboarding: { defaultWeight: 90 },
        }),
        valentines_day: freezePresentation({
          eventId: "valentines_day",
          emoji: "❤️",
          adminBadgeClass: "bg-red-100 text-red-700",
          calendar: { visible: true, filterGroup: "holidays" },
          timeline: { visible: true },
          onboarding: { defaultWeight: 80 },
        }),
      },
      "EVENT_PRESENTATION_REGISTRY",
    ),
  );

export function getEventPresentation(eventId: EventId): EventPresentation | null {
  return EVENT_PRESENTATION_REGISTRY[eventId] ?? null;
}

export function getEventEmoji(eventId: EventId): string | null {
  return getEventPresentation(eventId)?.emoji ?? null;
}

export function listEventPresentations(): readonly EventPresentation[] {
  return Object.values(EVENT_PRESENTATION_REGISTRY);
}
