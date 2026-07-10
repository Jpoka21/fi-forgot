/**
 * Resolves the preparation cycle year for a card using strict evidence precedence.
 *
 * Precedence:
 * 1. Explicit event date, due date, scheduled date, or stored event year
 * 2. Briefing cycle metadata (eventYear from saved briefing answers)
 * 3. Catalog occurrence derivation from card timing + event date pattern
 * 4. Unknown — returns null; card will not match any cycle
 */

import { resolveEventCycleYear } from "../../brain/decision/eventTimingUtils";
import type { BriefingSummary } from "../recipient-context";
import type { EventCardInput } from "./eventCardMatching";
import { normalizeEventLabel } from "./normalizeEventLabel";

export interface EventCardCycleMatchContext {
  briefingEventLabel: string;
  occurrenceDateStr: string | null;
  briefingSummary: BriefingSummary;
}

function parseFullDateYear(value: string | null | undefined): number | null {
  if (!value?.trim()) {
    return null;
  }

  const parts = value.trim().split("-");
  if (parts.length >= 3) {
    const year = parseInt(parts[0]!, 10);
    if (!Number.isNaN(year)) {
      return year;
    }
  }

  return null;
}

function briefingEventYears(
  briefingEventLabel: string,
  briefingSummary: BriefingSummary,
): number[] {
  const years = new Set<number>();
  for (const answer of briefingSummary.allAnswers) {
    if (normalizeEventLabel(answer.eventType) !== normalizeEventLabel(briefingEventLabel)) {
      continue;
    }
    if (answer.answer.trim().length === 0) {
      continue;
    }
    years.add(answer.eventYear);
  }
  return [...years].sort((a, b) => a - b);
}

function resolveBriefingMetadataCycleYear(
  card: EventCardInput,
  context: EventCardCycleMatchContext,
): number | null {
  const years = briefingEventYears(context.briefingEventLabel, context.briefingSummary);
  if (years.length === 0) {
    return null;
  }

  if (years.length === 1) {
    return years[0]!;
  }

  if (!context.occurrenceDateStr) {
    return null;
  }

  const derived = resolveEventCycleYear(
    context.occurrenceDateStr,
    new Date(card.createdAt),
  );
  if (derived != null && years.includes(derived)) {
    return derived;
  }

  return null;
}

export function resolveCardCycleYear(
  card: EventCardInput,
  context: EventCardCycleMatchContext,
): number | null {
  const explicitYear =
    parseFullDateYear(card.eventDate)
    ?? parseFullDateYear(card.dueDateFromData)
    ?? card.storedEventYear
    ?? null;
  if (explicitYear != null) {
    return explicitYear;
  }

  const briefingYear = resolveBriefingMetadataCycleYear(card, context);
  if (briefingYear != null) {
    return briefingYear;
  }

  if (context.occurrenceDateStr) {
    return resolveEventCycleYear(
      context.occurrenceDateStr,
      new Date(card.createdAt),
    );
  }

  return null;
}
