/**
 * Presentation metadata — UI only, never consumed by Brain decision logic.
 */

import type { EventId } from "../core/types.js";

export type CalendarFilterGroup =
  | "birthdays"
  | "anniversaries"
  | "holidays"
  | "other";

export interface EventPresentation {
  readonly eventId: EventId;
  readonly emoji?: string;
  readonly adminBadgeClass?: string;
  readonly calendar: {
    readonly visible: boolean;
    readonly filterGroup?: CalendarFilterGroup;
  };
  readonly timeline: {
    readonly visible: boolean;
  };
  readonly onboarding: {
    readonly defaultWeight?: number;
  };
}
