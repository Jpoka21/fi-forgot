import { ROUTE_PATHS } from "@/app/routes/routePaths";

export const notificationsPageSections = [
  "inbox",
  "archive",
  "preferences",
  "history",
] as const;

export type NotificationsPageSection = (typeof notificationsPageSections)[number];

export const communicationHistoryTabs = [
  "email",
  "cards",
  "delivery",
  "reminders",
] as const;

export type CommunicationHistoryTab = (typeof communicationHistoryTabs)[number];

export interface CommunicationHistoryEntry {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  href?: string;
  statusLabel?: string;
}

export const notificationsPageDefaults = {
  title: "Notifications",
  subtitle:
    "A calm record of what needs your attention — and what has already been handled thoughtfully.",
  inboxTitle: "Inbox",
  inboxDescription: "Timely updates that help you stay prepared without feeling overwhelmed.",
  archiveTitle: "Archive",
  archiveDescription: "Dismissed notifications stay here quietly until you restore them.",
  preferencesTitle: "Notification preferences",
  preferencesDescription:
    "Choose how the concierge reaches you. Changes are saved in your account and reminder settings.",
  historyTitle: "Communication history",
  historyDescription:
    "A read-only timeline of cards, deliveries, reminders, and approval emails from your existing activity.",
  categoriesTitle: "Notification categories",
  categoriesDescription:
    "Every notification is labeled so you can filter quickly and understand what kind of help it offers.",
  emptyArchiveTitle: "Your archive is clear",
  emptyArchiveDescription: "Dismissed notifications will appear here when you no longer need them in your inbox.",
  restoreLabel: "Restore to inbox",
  accountSettingsLabel: "Account notification settings",
  reminderSettingsLabel: "Reminder timing",
  accountSettingsHref: ROUTE_PATHS.settingsAccount,
  reminderSettingsHref: ROUTE_PATHS.settingsReminders,
  cardsReviewHref: ROUTE_PATHS.cardsReview,
  dashboardHref: ROUTE_PATHS.dashboard,
} as const;

export const communicationHistoryTabLabels: Record<CommunicationHistoryTab, string> = {
  email: "Email",
  cards: "Cards",
  delivery: "Delivery",
  reminders: "Reminders",
};

export const communicationHistoryEmptyCopy: Record<
  CommunicationHistoryTab,
  { title: string; description: string }
> = {
  email: {
    title: "No approval emails yet",
    description: "When a card needs your review, the concierge will note it here calmly.",
  },
  cards: {
    title: "No card activity yet",
    description: "Cards you create and approve will appear in this history.",
  },
  delivery: {
    title: "No deliveries tracked yet",
    description: "Mailed and delivered cards will show their journey here.",
  },
  reminders: {
    title: "No reminder history yet",
    description: "Upcoming reminders and nudges will be listed when they matter.",
  },
};

/**
 * Preserved integration surfaces — presentation only; do not alter contracts.
 */
export const NOTIFICATIONS_API_INTEGRATION_POINTS = [
  "notificationEngine: loadNotificationInbox, dismissNotification (local read/dismiss state)",
  "notificationService: brownie balance endpoints only",
  "lib/data: getCards, getPersonalSettings (communication history display)",
  "account-settings: notification channel save via savePersonalSettings",
  "reminder-settings: legacy reminder timing preferences",
] as const;
