/**
 * Writing history signal contributor.
 *
 * Emits read-only inventory signals from relationshipContext.writingHistory.
 * Metadata and counts only — no message text, no topic analysis, no recommendations.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

type WritingDepth = "none" | "light" | "moderate" | "rich";

function depthFromCardCount(cardCount: number): WritingDepth {
  if (cardCount === 0) return "none";
  if (cardCount <= 2) return "light";
  if (cardCount <= 5) return "moderate";
  return "rich";
}

export function contributeWritingHistorySignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const cards = context.relationshipContext.writingHistory.cards;

  const cardCount = cards.length;
  const cardsWithFinalMessageCount = cards.filter((card) => card.hasMessageFinal).length;
  const cardsWithOriginalMessageCount = cards.filter(
    (card) => card.hasMessageOriginal,
  ).length;
  const latestCardDaysAgo = cards[0]?.daysAgo ?? null;
  const cardsLast365Days = cards.filter((card) => card.daysAgo <= 365).length;

  const wordCounts = cards
    .map((card) => card.messageWordCount)
    .filter((count): count is number => count != null);
  const totalWordCount = wordCounts.reduce((sum, count) => sum + count, 0);
  const averageWordCount =
    wordCounts.length > 0 ? totalWordCount / wordCounts.length : null;

  const uniqueEventTypeCount = new Set(cards.map((card) => card.eventType)).size;
  const uniqueArchetypeCount = new Set(
    cards
      .map((card) => card.archetype)
      .filter((archetype): archetype is string => archetype != null),
  ).size;

  const editedCount = cards.filter((card) => card.wasEdited).length;
  const editRate = cardCount > 0 ? editedCount / cardCount : null;

  return [
    {
      source: "writing_history",
      label: "card_count",
      value: cardCount,
    },
    {
      source: "writing_history",
      label: "cards_with_final_message_count",
      value: cardsWithFinalMessageCount,
    },
    {
      source: "writing_history",
      label: "cards_with_original_message_count",
      value: cardsWithOriginalMessageCount,
    },
    {
      source: "writing_history",
      label: "latest_card_days_ago",
      value: latestCardDaysAgo,
    },
    {
      source: "writing_history",
      label: "cards_last_365_days",
      value: cardsLast365Days,
    },
    {
      source: "writing_history",
      label: "total_word_count",
      value: totalWordCount,
    },
    {
      source: "writing_history",
      label: "average_word_count",
      value: averageWordCount,
    },
    {
      source: "writing_history",
      label: "unique_event_type_count",
      value: uniqueEventTypeCount,
    },
    {
      source: "writing_history",
      label: "unique_archetype_count",
      value: uniqueArchetypeCount,
    },
    {
      source: "writing_history",
      label: "edit_rate",
      value: editRate,
    },
    {
      source: "writing_history",
      label: "writing_depth",
      value: depthFromCardCount(cardCount),
    },
  ];
}
