import { ROUTE_PATHS } from "@/app/routes/routePaths";

export const searchPageDefaults = {
  title: "Search",
  subtitle:
    "Ask your Relationship Concierge where someone is, what is coming up, or what needs your attention.",
  inputLabel: "Search people, cards, timeline, and more",
  categoriesTitle: "Search categories",
  categoriesDescription:
    "Filter by people, timeline, cards, occasions, notifications, concierge, settings, or actions.",
  keyboardTitle: "Keyboard shortcuts",
  keyboardDescription: "Open search from anywhere with the shortcut below.",
} as const;

/**
 * Preserved integration surfaces — presentation only; do not alter contracts.
 */
export const SEARCH_API_INTEGRATION_POINTS = [
  "lib/data: getRecipients, getCards, getBriefings (client-side index)",
  "notificationEngine: loadNotificationInbox (notification results)",
  "searchStorage: recent searches in localStorage",
  "SearchProvider: Cmd/Ctrl+K keyboard shortcut",
] as const;

export const searchPageHref = ROUTE_PATHS.search;
