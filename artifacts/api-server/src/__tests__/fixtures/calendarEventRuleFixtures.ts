/**
 * Shared fixtures for calendar event rule tests.
 */

import { buildDecisionContext } from "../../brain/decision/buildDecisionContext.js";
import type { DecisionContext } from "../../brain/decision/decisionContextTypes.js";
import type { NormalizedRelationshipState } from "../../brain/normalization/index.js";
import type {
  BriefingSummary,
  RecipientContext,
  WritingHistoryCard,
} from "../../services/recipient-context.js";
import {
  minimalRelationshipContext,
  type MinimalRelationshipContextOptions,
} from "./minimalRelationshipContext.js";

export function normalized(
  overrides: Partial<NormalizedRelationshipState> = {},
): NormalizedRelationshipState {
  const { derivedFrom: derivedOverride, ...rest } = overrides;
  return {
    identity: "empty",
    freshness: "unknown",
    history: "none",
    writing: "none",
    engagement: "none",
    momentum: "new",
    ...rest,
    derivedFrom: {
      signalCount: 0,
      sourcesPresent: [],
      ...derivedOverride,
    },
  };
}

export function briefingSummaryFor(
  eventType: string,
  eventYear: number,
  answer = "Substantive saved answer",
): BriefingSummary {
  const key = `${eventType}_${eventYear}`;
  const entry = {
    questionKey: "memory",
    question: "Memory?",
    answer,
    eventType,
    eventYear,
  };
  return {
    totalAnswers: 1,
    byEvent: { [key]: [entry] },
    allAnswers: [entry],
  };
}

export function writingHistoryCard(
  overrides: Partial<WritingHistoryCard> & Pick<WritingHistoryCard, "status">,
): WritingHistoryCard {
  return {
    id: "card-1",
    eventType: "Birthday",
    eventDate: "2026-07-08",
    dueDateFromData: null,
    storedEventYear: null,
    wasEdited: false,
    createdAt: "2026-06-01T00:00:00.000Z",
    daysAgo: 30,
    hasMessageFinal: true,
    hasMessageOriginal: true,
    messageWordCount: 10,
    archetype: null,
    generationVersion: "v1",
    approvedAt: null,
    rejectedAt: null,
    mailedAt: null,
    ...overrides,
  };
}

export function buildCalendarDecisionContext(options: {
  relationship?: MinimalRelationshipContextOptions;
  briefingSummary?: BriefingSummary;
  cards?: WritingHistoryCard[];
} = {}): DecisionContext {
  const relationshipContext: RecipientContext = {
    ...minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      previewDays: 14,
      ...options.relationship,
    }),
    briefingSummary: options.briefingSummary ?? {
      totalAnswers: 0,
      byEvent: {},
      allAnswers: [],
    },
    writingHistory: { cards: options.cards ?? [] },
  };

  return buildDecisionContext(normalized(), relationshipContext);
}
