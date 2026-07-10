/**
 * Deterministic follow-up question catalog.
 *
 * Owned by the Follow Up Question Engine — not rules, Action Planner, or BrainResponse.
 */

import type { FollowUpQuestion } from "./questionTypes";

export const FOLLOW_UP_QUESTION_CATALOG: readonly FollowUpQuestion[] = [
  // life_event_follow_up (4)
  {
    id: "life_event_follow_up_01",
    category: "life_event_follow_up",
    text: "How has everything been going with that update lately?",
    sensitivity: "low",
    rotationOrder: 1,
  },
  {
    id: "life_event_follow_up_02",
    category: "life_event_follow_up",
    text: "How did everything turn out?",
    sensitivity: "low",
    rotationOrder: 2,
  },
  {
    id: "life_event_follow_up_03",
    category: "life_event_follow_up",
    text: "Is there anything new I should remember about what happened?",
    sensitivity: "low",
    rotationOrder: 3,
  },
  {
    id: "life_event_follow_up_04",
    category: "life_event_follow_up",
    text: "How are things going now that some time has passed?",
    sensitivity: "low",
    rotationOrder: 4,
  },

  // fresh_update_follow_up (4)
  {
    id: "fresh_update_follow_up_01",
    category: "fresh_update_follow_up",
    text: "What's been going on with them lately?",
    sensitivity: "low",
    rotationOrder: 1,
  },
  {
    id: "fresh_update_follow_up_02",
    category: "fresh_update_follow_up",
    text: "Is there anything new I should know before writing for them?",
    sensitivity: "low",
    rotationOrder: 2,
  },
  {
    id: "fresh_update_follow_up_03",
    category: "fresh_update_follow_up",
    text: "Has anything changed since we last caught up on them?",
    sensitivity: "low",
    rotationOrder: 3,
  },
  {
    id: "fresh_update_follow_up_04",
    category: "fresh_update_follow_up",
    text: "What's the latest I should keep in mind about this person?",
    sensitivity: "low",
    rotationOrder: 4,
  },

  // accomplishment_follow_up (4)
  {
    id: "accomplishment_follow_up_01",
    category: "accomplishment_follow_up",
    text: "How did that accomplishment turn out?",
    sensitivity: "low",
    rotationOrder: 1,
  },
  {
    id: "accomplishment_follow_up_02",
    category: "accomplishment_follow_up",
    text: "Did anything new happen after that?",
    sensitivity: "low",
    rotationOrder: 2,
  },
  {
    id: "accomplishment_follow_up_03",
    category: "accomplishment_follow_up",
    text: "Is there anything about that moment you would want reflected in a future card?",
    sensitivity: "low",
    rotationOrder: 3,
  },
  {
    id: "accomplishment_follow_up_04",
    category: "accomplishment_follow_up",
    text: "Has anything developed since they shared that accomplishment?",
    sensitivity: "low",
    rotationOrder: 4,
  },

  // inactivity_reconnect (4)
  {
    id: "inactivity_reconnect_01",
    category: "inactivity_reconnect",
    text: "Anything new going on with this person lately?",
    sensitivity: "medium",
    rotationOrder: 1,
  },
  {
    id: "inactivity_reconnect_02",
    category: "inactivity_reconnect",
    text: "Has anything changed with them recently?",
    sensitivity: "medium",
    rotationOrder: 2,
  },
  {
    id: "inactivity_reconnect_03",
    category: "inactivity_reconnect",
    text: "Is there something recent I should know before writing for them again?",
    sensitivity: "medium",
    rotationOrder: 3,
  },
  {
    id: "inactivity_reconnect_04",
    category: "inactivity_reconnect",
    text: "What's worth catching up on with them?",
    sensitivity: "medium",
    rotationOrder: 4,
  },

  // memory_collection (3)
  {
    id: "memory_collection_01",
    category: "memory_collection",
    text: "What's a meaningful memory I should know about them?",
    sensitivity: "low",
    rotationOrder: 1,
  },
  {
    id: "memory_collection_02",
    category: "memory_collection",
    text: "Is there a story or moment that would help write more personally for them?",
    sensitivity: "low",
    rotationOrder: 2,
  },
  {
    id: "memory_collection_03",
    category: "memory_collection",
    text: "What detail about them would make a future card feel more personal?",
    sensitivity: "low",
    rotationOrder: 3,
  },

  // card_gap_context (3)
  {
    id: "card_gap_context_01",
    category: "card_gap_context",
    text: "What's a good reason to reach out with a card right now?",
    sensitivity: "low",
    rotationOrder: 1,
  },
  {
    id: "card_gap_context_02",
    category: "card_gap_context",
    text: "Is there something recent worth acknowledging in a card?",
    sensitivity: "low",
    rotationOrder: 2,
  },
  {
    id: "card_gap_context_03",
    category: "card_gap_context",
    text: "What would make a thoughtful card feel timely for them?",
    sensitivity: "low",
    rotationOrder: 3,
  },
] as const;

export function findFollowUpCatalogQuestionById(questionId: string) {
  return FOLLOW_UP_QUESTION_CATALOG.find((question) => question.id === questionId) ?? null;
}
