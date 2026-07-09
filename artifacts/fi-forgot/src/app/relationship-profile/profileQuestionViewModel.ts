/**
 * Profile question presentation contract — source-agnostic UI model.
 */

export type ProfileQuestionSource = "brain" | "profile_gap";

export type ProfileQuestionSaveTriggerType = "profile_gap" | "fresh_update" | "follow_up";

export interface ProfileQuestionViewModel {
  title: string;
  explanation: string;
  question: string;
  category: string;
  priority: string;
  source: ProfileQuestionSource;

  /** Consumed by save handler only — not rendered. */
  saveFieldKey: string;
  saveTriggerType: ProfileQuestionSaveTriggerType;
  followUpId?: string;
}
