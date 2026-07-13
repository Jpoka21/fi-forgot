/**
 * Briefing reference registry — refs only, no question content.
 */

import {
  assertCompleteEventRecord,
  type CompleteEventRecord,
  type EventId,
} from "../core/eventIds.js";
import {
  asBriefingQuestionSetId,
  type BriefingQuestionSetMeta,
  type EventBriefingRef,
} from "./types.js";

function freezeBriefingRef(entry: EventBriefingRef): EventBriefingRef {
  return Object.freeze({ ...entry });
}

function freezeMeta(entry: BriefingQuestionSetMeta): BriefingQuestionSetMeta {
  return Object.freeze({ ...entry });
}

const BIRTHDAY_BRIEFING = freezeBriefingRef({
  eventId: "birthday",
  questionSetId: asBriefingQuestionSetId("birthday"),
  version: 1,
});

const ANNIVERSARY_BRIEFING = freezeBriefingRef({
  eventId: "anniversary",
  questionSetId: asBriefingQuestionSetId("anniversary"),
  version: 1,
});

const VALENTINES_DAY_BRIEFING = freezeBriefingRef({
  eventId: "valentines_day",
  questionSetId: asBriefingQuestionSetId("valentines_day"),
  version: 1,
});

export const EVENT_BRIEFING_REGISTRY: CompleteEventRecord<EventBriefingRef> =
  Object.freeze(
    assertCompleteEventRecord(
      {
        birthday: BIRTHDAY_BRIEFING,
        anniversary: ANNIVERSARY_BRIEFING,
        valentines_day: VALENTINES_DAY_BRIEFING,
      },
      "EVENT_BRIEFING_REGISTRY",
    ),
  );

export const BRIEFING_QUESTION_SET_META: Readonly<
  Record<string, BriefingQuestionSetMeta>
> = Object.freeze({
  birthday: freezeMeta({
    questionSetId: asBriefingQuestionSetId("birthday"),
    title: "Birthday",
    version: 1,
  }),
  anniversary: freezeMeta({
    questionSetId: asBriefingQuestionSetId("anniversary"),
    title: "Anniversary",
    version: 1,
  }),
  valentines_day: freezeMeta({
    questionSetId: asBriefingQuestionSetId("valentines_day"),
    title: "Valentine's Day",
    version: 1,
  }),
});

export function getEventBriefingRef(eventId: EventId): EventBriefingRef | null {
  return EVENT_BRIEFING_REGISTRY[eventId] ?? null;
}

export function getBriefingQuestionSetMeta(
  questionSetId: string,
): BriefingQuestionSetMeta | null {
  return BRIEFING_QUESTION_SET_META[questionSetId] ?? null;
}

export function listEventBriefingRefs(): readonly EventBriefingRef[] {
  return Object.values(EVENT_BRIEFING_REGISTRY);
}
