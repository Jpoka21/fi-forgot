/**
 * Follow Up Question Engine types — deterministic catalog entries only.
 *
 * No AI fields, embeddings, or templates.
 */

export type FollowUpQuestionCategory =
  | "life_event_follow_up"
  | "fresh_update_follow_up"
  | "accomplishment_follow_up"
  | "inactivity_reconnect"
  | "memory_collection"
  | "card_gap_context";

export type FollowUpQuestionSensitivity = "low" | "medium" | "high";

export interface FollowUpQuestion {
  id: string;
  category: FollowUpQuestionCategory;
  text: string;
  sensitivity: FollowUpQuestionSensitivity;
  rotationOrder: number;
}
