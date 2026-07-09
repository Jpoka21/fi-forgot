/**
 * Life Event domain types — structured classifications, not Brain Signals.
 */

export type LifeEventCategory =
  | "career"
  | "home"
  | "family"
  | "health"
  | "education"
  | "business"
  | "retirement";

export type LifeEventSource = "fresh_update";

export interface LifeEventClassification {
  type: string;
  category: LifeEventCategory;
  daysAgo: number;
  followUpWindowDays: number;
  followUpReady: boolean;
  source: LifeEventSource;
  capturedAt: string;
  classified: boolean;
  supported: boolean;
}
