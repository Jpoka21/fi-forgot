/**
 * Resolves timing inputs for a catalog event from RelationshipContext.
 */

import { isRomanticRelationshipType } from "../decision/relationshipTypeMatchers";
import {
  computeAnniversaryDaysAway,
  computeBirthdayDaysAway,
  computeValentinesDaysAway,
  resolveEventCycleYear,
} from "../decision/eventTimingUtils";
import type { RelationshipContext } from "../types";
import type { BrainEventDefinition } from "./brainEventCatalogTypes";

const VALENTINES_MONTH_DAY = "02-14";

export interface ResolvedEventTiming {
  applicable: boolean;
  daysUntilEvent: number | null;
  cycleYear: number | null;
}

export function resolveCatalogEventTiming(
  definition: BrainEventDefinition,
  relationshipContext: RelationshipContext,
  referenceDate: Date,
): ResolvedEventTiming {
  const generatedAt = relationshipContext.generatedAt;

  if (definition.timing.kind === "recipient_date") {
    const dateStr =
      definition.timing.field === "birthday"
        ? relationshipContext.relationship?.birthday
        : relationshipContext.relationship?.anniversary;

    if (!dateStr) {
      return { applicable: false, daysUntilEvent: null, cycleYear: null };
    }

    const daysUntilEvent =
      definition.timing.field === "birthday"
        ? computeBirthdayDaysAway(dateStr, generatedAt)
        : computeAnniversaryDaysAway(dateStr, generatedAt);

    return {
      applicable: true,
      daysUntilEvent,
      cycleYear: resolveEventCycleYear(dateStr, referenceDate),
    };
  }

  const relationshipType = relationshipContext.relationship?.type ?? null;
  if (!isRomanticRelationshipType(relationshipType)) {
    return { applicable: false, daysUntilEvent: null, cycleYear: null };
  }

  return {
    applicable: true,
    daysUntilEvent: computeValentinesDaysAway(generatedAt),
    cycleYear: resolveEventCycleYear(VALENTINES_MONTH_DAY, referenceDate),
  };
}
