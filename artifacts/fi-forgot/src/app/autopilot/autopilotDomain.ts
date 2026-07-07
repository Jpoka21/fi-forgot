import type { PersonalSettings } from "@/lib/data";
import type { FiConciergeSuggestion } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";
import type { FiCalendarEvent } from "@/app/calendar/calendarDomain";

export const autopilotDefaults = {
  title: "Autopilot",
  description: "Your Relationship Concierge, quietly watching what matters.",
  refreshLabel: "Refresh",
  errorLabel: "We could not load Autopilot right now.",
  retryLabel: "Try again",
  offlineLabel: "You're offline. Autopilot will catch up when you're back online.",
  emptyTitle: "Autopilot is ready when you are",
  emptyDescription: "Add someone important and we'll quietly prepare thoughtful cards on schedule.",
  addPersonLabel: "Add someone",
  helpTitle: "How Autopilot works",
  helpDescription:
    "We remember dates, prepare drafts, and mail cards on your schedule. You stay in control — approve each card or let us send when ready.",
  settingsHref: "/settings/reminders",
  reviewHref: "/cards/review",
  reviewLabel: "Review cards",
  enableLabel: "Enable Autopilot",
  disableLabel: "Switch to manual review",
  pauseLabel: "Pause Autopilot",
  resumeLabel: "Resume Autopilot",
  preferencesLabel: "Automation preferences",
  reminderPreferencesLabel: "Reminder preferences",
  deliveryPreferencesLabel: "Delivery preferences",
} as const;

export const AUTOPILOT_PAUSED_KEY = "fi_forgot_autopilot_paused";

export type FiAutopilotRuntimeState = "active" | "paused" | "manual";

export interface FiAutopilotCoverageSummary {
  activeRecipients: number;
  pausedRecipients: number;
  trackedOccasions: number;
  averageHealthScore: number;
  relationshipsNeedingAttention: number;
}

export interface FiAutopilotInsight {
  id: string;
  title: string;
  detail: string;
  href?: string;
}

export interface FiAutopilotActivityItem {
  id: string;
  title: string;
  detail: string;
  href: string;
}

export interface FiAutopilotSnapshot {
  settings: PersonalSettings;
  runtimeState: FiAutopilotRuntimeState;
  isOnline: boolean;
  coverage: FiAutopilotCoverageSummary;
  pendingReviewCount: number;
  upcomingAutomated: FiCalendarEvent[];
  recommendations: FiConciergeSuggestion[];
  recentActivity: FiAutopilotActivityItem[];
  insights: FiAutopilotInsight[];
  isEmpty: boolean;
}

export function resolveAutopilotRuntimeState(
  settings: PersonalSettings,
  paused: boolean,
): FiAutopilotRuntimeState {
  if (paused) return "paused";
  if (settings.automationMode === "autopilot") return "active";
  return "manual";
}

export function autopilotStatusLabel(state: FiAutopilotRuntimeState): string {
  if (state === "active") return "Autopilot is on";
  if (state === "paused") return "Autopilot is paused";
  return "Manual review mode";
}

export function autopilotStatusDescription(state: FiAutopilotRuntimeState): string {
  if (state === "active") return "Cards go out automatically once they're ready.";
  if (state === "paused") return "Automation is temporarily paused. Nothing will mail until you resume.";
  return "You'll review each card before it goes out.";
}
