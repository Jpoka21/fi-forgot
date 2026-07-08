/**
 * Minimal RelationshipContext fixture for brain unit tests.
 *
 * Type-only import from recipient-context — no database dependency.
 */

import type { RecipientContext } from "../../services/recipient-context.js";

const CONTEXT_VERSION = 3 as const;

export interface MinimalRelationshipContextOptions {
  generatedAt?: string;
  birthday?: string | null;
  previewDays?: number | null;
}

export function minimalRelationshipContext(
  options: MinimalRelationshipContextOptions = {},
): RecipientContext {
  const {
    generatedAt = "2026-07-01T00:00:00.000Z",
    birthday = null,
    previewDays = 14,
  } = options;

  return {
    contextVersion: CONTEXT_VERSION,
    generatedAt,
    recipientId: "recipient-1",
    userId: "user-1",
    identity: null,
    relationship: {
      type: "Friend",
      label: null,
      birthday,
      anniversary: null,
    },
    personality: { notes: null, traits: [] },
    interests: [],
    memories: { favoriteMemories: null, insideJokes: null },
    tone: {
      preferred: null,
      emotionalOpenness: null,
      thingsToAvoid: null,
      thingsToAlwaysInclude: null,
    },
    delivery: {
      preference: null,
      previewDays,
      senderNickname: null,
      signOff: null,
    },
    cardHistory: {
      totalSent: 0,
      approvedCount: 0,
      rejectedCount: 0,
      editedCount: 0,
      eventTypes: [],
      mostRecentCard: null,
    },
    writingHistory: { cards: [] },
    relationshipTimeline: { events: [] },
    briefingSummary: { totalAnswers: 0, byEvent: {}, allAnswers: [] },
    profileCompleteness: { score: 0, filled: [], missing: [] },
    freshUpdates: [],
    followUpAnswers: [],
  };
}
