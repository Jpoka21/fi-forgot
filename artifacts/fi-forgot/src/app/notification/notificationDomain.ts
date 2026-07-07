import { ROUTE_PATHS } from "@/app/routes/routePaths";

export const fiNotificationCategories = [
  "relationship",
  "card",
  "autopilot",
  "recipient",
  "payment",
  "subscription",
  "delivery",
  "question",
  "reminder",
  "security",
  "account",
  "feature",
  "system",
] as const;

export type FiNotificationCategory = (typeof fiNotificationCategories)[number];

export const fiNotificationReadStates = ["unread", "read"] as const;

export type FiNotificationReadState = (typeof fiNotificationReadStates)[number];

export const fiNotificationFilterOptions = [
  "all",
  "unread",
  "cards",
  "relationships",
  "reminders",
  "system",
] as const;

export type FiNotificationFilterOption = (typeof fiNotificationFilterOptions)[number];

export const fiNotificationTimeGroups = [
  "Today",
  "Yesterday",
  "Earlier this week",
  "Earlier",
] as const;

export type FiNotificationTimeGroup = (typeof fiNotificationTimeGroups)[number];

export interface FiNotificationAction {
  id: string;
  label: string;
  href?: string;
}

export interface FiNotification {
  id: string;
  title: string;
  body?: string;
  category: FiNotificationCategory;
  readState: FiNotificationReadState;
  createdAt: string;
  href?: string;
  actions?: FiNotificationAction[];
  groupKey?: string;
}

export const notificationCategoryLabels: Record<FiNotificationCategory, string> = {
  relationship: "Relationship",
  card: "Card",
  autopilot: "Autopilot",
  recipient: "Recipient",
  payment: "Payment",
  subscription: "Subscription",
  delivery: "Delivery",
  question: "Question",
  reminder: "Reminder",
  security: "Security",
  account: "Account",
  feature: "Feature",
  system: "System",
};

export const notificationFilterCategoryMap: Record<
  Exclude<FiNotificationFilterOption, "all" | "unread">,
  FiNotificationCategory[]
> = {
  cards: ["card", "delivery", "autopilot"],
  relationships: ["relationship", "recipient", "question"],
  reminders: ["reminder"],
  system: ["system", "security", "account", "feature", "payment", "subscription"],
};

export const notificationDefaults = {
  debounceMs: 200,
  drawerTitle: "Notifications",
  emptySearchLabel: "No notifications match that search.",
  errorLabel: "We could not load notifications right now.",
  settingsLabel: "Notification settings",
  settingsHref: ROUTE_PATHS.settingsReminders,
  viewAllHref: ROUTE_PATHS.notifications,
  viewAllLabel: "View all notifications",
  markAllReadLabel: "Mark all as read",
  searchPlaceholder: "Search notifications",
  searchAriaLabel: "Search notifications",
} as const;

function daysAgo(days: number, hours = 12): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

export const seedNotifications: FiNotification[] = [
  {
    id: "notif-1",
    title: "Alex's birthday card is ready for review",
    body: "A thoughtful draft is waiting for your approval.",
    category: "card",
    readState: "unread",
    createdAt: daysAgo(0, 9),
    href: ROUTE_PATHS.cardsReview,
    actions: [{ id: "review", label: "Review card", href: ROUTE_PATHS.cardsReview }],
    groupKey: "alex-birthday",
  },
  {
    id: "notif-2",
    title: "Relationship Health improved for Mom",
    body: "You've been staying thoughtfully connected.",
    category: "relationship",
    readState: "unread",
    createdAt: daysAgo(0, 7),
    href: ROUTE_PATHS.people,
    groupKey: "mom-health",
  },
  {
    id: "notif-3",
    title: "A new question is available",
    body: "Help us personalize the next card for Jamie.",
    category: "question",
    readState: "read",
    createdAt: daysAgo(1, 16),
    href: ROUTE_PATHS.people,
  },
  {
    id: "notif-4",
    title: "Reminder: Anniversary coming up",
    body: "Taylor and Jordan celebrate in five days.",
    category: "reminder",
    readState: "unread",
    createdAt: daysAgo(1, 8),
    href: ROUTE_PATHS.dashboard,
  },
  {
    id: "notif-5",
    title: "Card mailed successfully",
    body: "Dad's thank-you note is on its way.",
    category: "delivery",
    readState: "read",
    createdAt: daysAgo(3, 11),
    href: ROUTE_PATHS.dashboard,
    groupKey: "dad-card",
  },
  {
    id: "notif-6",
    title: "Autopilot completed a thoughtful check-in",
    body: "No action needed right now.",
    category: "autopilot",
    readState: "read",
    createdAt: daysAgo(8, 10),
    href: ROUTE_PATHS.dashboard,
  },
];
