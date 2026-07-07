import type { CardOrder, Recipient } from "@/lib/data";

export const dashboardDefaults = {
  title: "Dashboard",
  refreshLabel: "Refresh",
  errorLabel: "We couldn't load your dashboard right now.",
  retryLabel: "Try again",
  viewAllMomentsLabel: "View all",
  viewAllMomentsHref: "/moments",
  reviewCardsLabel: "Review cards",
  reviewCardsHref: "/cards/review",
  footerReassuranceAutopilot: "Cards go out automatically once they're ready.",
  footerReassuranceManual: "You'll see each card before it goes out.",
  footerReassuranceClosing: "Everything important is under control.",
  reminderPreferencesLabel: "Reminder preferences",
  reminderPreferencesHref: "/settings/reminders",
  cardStyleLabel: "Card style & signature",
} as const;

export interface FiDashboardUpcomingEvent {
  recipient: Recipient;
  event: string;
  daysAway: number;
  dateStr: string;
  briefingDone: boolean;
}

export interface FiDashboardUpcomingCta {
  label: string;
  href: string;
}

export interface FiDashboardUpcomingOutcome {
  line: string;
  viewCardId?: string;
}

export interface FiDashboardAttentionItem {
  id: string;
  title: string;
  detail?: string;
  actionLabel: string;
  href: string;
}

export interface FiDashboardHighlight {
  id: string;
  title: string;
  detail: string;
  href: string;
}

export interface FiDashboardActivityItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  sortKey: number;
}

export interface FiDashboardSpotlight {
  recipient: Recipient;
  summary: string;
  suggestedActionLabel: string;
  suggestedActionHref: string;
  healthInsight?: string;
}

export interface FiDashboardWelcome {
  dateLabel: string;
  headline: string;
  subheadline: string;
  conciergeSummary?: string;
  pendingReviewCount: number;
}

export interface FiDashboardQuickAction {
  id: string;
  label: string;
  href: string;
  testId?: string;
}

export interface FiDashboardSnapshot {
  recipients: Recipient[];
  cards: CardOrder[];
  upcomingEvents: FiDashboardUpcomingEvent[];
  upcomingMoments: FiDashboardUpcomingEvent[];
  pendingReviewCount: number;
  attentionItems: FiDashboardAttentionItem[];
  highlights: FiDashboardHighlight[];
  recentActivity: FiDashboardActivityItem[];
  spotlight: FiDashboardSpotlight | null;
  welcome: FiDashboardWelcome;
  quickActions: FiDashboardQuickAction[];
  isEmpty: boolean;
  isFirstTime: boolean;
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function calmOccasionLine(
  event: string,
  daysAway: number,
  dateStr: string,
  sincere: boolean,
): string {
  const longDate = new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  if (sincere) {
    if (daysAway === 0) return `${event} is today.`;
    if (daysAway === 1) return `${event} is tomorrow.`;
    if (daysAway <= 14) return `${event} in ${daysAway} days.`;
    return `${event} on ${longDate}.`;
  }
  if (daysAway === 0) return `${event} is today.`;
  if (daysAway === 1) return `${event} is tomorrow.`;
  if (daysAway <= 14) return `${event} in ${daysAway} days.`;
  return `${event} on ${longDate}.`;
}

export function cardOutcomeLabel(status: CardOrder["status"]): string {
  if (status === "Approved") return "Queued to mail";
  if (status === "Ready for approval") return "Ready for your review";
  return "We'll prepare this for you";
}
