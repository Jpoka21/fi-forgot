import { ROUTE_PATHS } from "@/app/routes/routePaths";

export const fiSearchEntityTypes = [
  "recipient",
  "memory",
  "timeline",
  "card",
  "occasion",
  "setting",
  "action",
  "notification",
  "concierge",
] as const;

export type FiSearchEntityType = (typeof fiSearchEntityTypes)[number];

export const fiSearchSortOptions = ["relevance", "recent", "alphabetical"] as const;

export type FiSearchSortOption = (typeof fiSearchSortOptions)[number];

export const fiSearchFilterOptions = [
  "all",
  "people",
  "timeline",
  "cards",
  "occasions",
  "notifications",
  "concierge",
  "settings",
  "actions",
] as const;

export type FiSearchFilterOption = (typeof fiSearchFilterOptions)[number];

export interface FiSearchResult {
  id: string;
  label: string;
  description?: string;
  group?: string;
  entityType: FiSearchEntityType;
  href?: string;
  keywords?: string[];
  updatedAt?: string;
  relevance?: number;
}

export interface FiSearchSuggestion {
  id: string;
  label: string;
  query: string;
  description?: string;
  entityType?: FiSearchEntityType;
}

export interface FiRecentSearchEntry {
  query: string;
  searchedAt: number;
}

export const searchFilterEntityMap: Record<
  Exclude<FiSearchFilterOption, "all">,
  FiSearchEntityType[]
> = {
  people: ["recipient"],
  timeline: ["timeline", "memory"],
  cards: ["card"],
  occasions: ["occasion"],
  notifications: ["notification"],
  concierge: ["concierge"],
  settings: ["setting"],
  actions: ["action"],
};

export const searchGroupLabels: Record<FiSearchEntityType, string> = {
  recipient: "People",
  memory: "Memories",
  timeline: "Timeline",
  card: "Cards",
  occasion: "Occasions",
  setting: "Settings",
  action: "Actions",
  notification: "Notifications",
  concierge: "Concierge",
};

export const defaultSearchSuggestions: FiSearchSuggestion[] = [
  {
    id: "find-person",
    label: "Find a person",
    query: "person",
    description: "Search your relationships",
    entityType: "recipient",
  },
  {
    id: "search-timeline",
    label: "Search timeline",
    query: "memory",
    description: "Briefings and saved moments",
    entityType: "timeline",
  },
  {
    id: "find-card",
    label: "Find an upcoming card",
    query: "card",
    description: "Drafts and sent cards",
    entityType: "card",
  },
  {
    id: "search-settings",
    label: "Search settings",
    query: "settings",
    description: "Account and reminders",
    entityType: "setting",
  },
  {
    id: "important-dates",
    label: "See important dates",
    query: "birthday",
    description: "Occasions coming up",
    entityType: "occasion",
  },
  {
    id: "quick-card",
    label: "Create a quick card",
    query: "quick card",
    description: "Start a thoughtful card",
    entityType: "action",
  },
  {
    id: "concierge-autopilot",
    label: "Check autopilot",
    query: "autopilot",
    description: "Concierge automation",
    entityType: "concierge",
  },
];

export const popularSearches = [
  { query: "birthday", label: "Birthday" },
  { query: "anniversary", label: "Anniversary" },
  { query: "mom", label: "Mom" },
  { query: "draft", label: "Card drafts" },
  { query: "reminders", label: "Reminders" },
] as const;

export const staticSearchIndex: FiSearchResult[] = [
  {
    id: "nav-dashboard",
    label: "Dashboard",
    description: "Your relationship briefing",
    group: searchGroupLabels.action,
    entityType: "action",
    href: ROUTE_PATHS.dashboard,
    keywords: ["home", "briefing", "overview"],
  },
  {
    id: "nav-people",
    label: "Your People",
    description: "Browse relationships",
    group: searchGroupLabels.recipient,
    entityType: "recipient",
    href: ROUTE_PATHS.people,
    keywords: ["people", "recipients", "relationships"],
  },
  {
    id: "nav-moments",
    label: "Moments",
    description: "Shared memories and timeline",
    group: searchGroupLabels.timeline,
    entityType: "timeline",
    href: ROUTE_PATHS.moments,
    keywords: ["memories", "timeline", "moments"],
  },
  {
    id: "nav-quick-card",
    label: "Quick Card",
    description: "Create a thoughtful card",
    group: searchGroupLabels.action,
    entityType: "action",
    href: ROUTE_PATHS.quickCard,
    keywords: ["create", "card", "write"],
  },
  {
    id: "nav-settings-reminders",
    label: "Reminder Settings",
    description: "Manage notification preferences",
    group: searchGroupLabels.setting,
    entityType: "setting",
    href: ROUTE_PATHS.settingsReminders,
    keywords: ["settings", "reminders", "notifications"],
  },
  {
    id: "nav-cards-generate",
    label: "Generate a Card",
    description: "Start card creation",
    group: searchGroupLabels.card,
    entityType: "card",
    href: ROUTE_PATHS.cardsGenerate,
    keywords: ["card", "generate", "draft"],
  },
  {
    id: "nav-notifications",
    label: "Notifications",
    description: "Updates and communication history",
    group: searchGroupLabels.notification,
    entityType: "notification",
    href: ROUTE_PATHS.notifications,
    keywords: ["notifications", "alerts", "reminders"],
  },
  {
    id: "nav-search",
    label: "Search",
    description: "Find people, cards, and moments",
    group: searchGroupLabels.action,
    entityType: "action",
    href: ROUTE_PATHS.search,
    keywords: ["search", "find", "discover"],
  },
  {
    id: "nav-concierge",
    label: "Concierge",
    description: "Ask your Relationship Concierge",
    group: searchGroupLabels.concierge,
    entityType: "concierge",
    href: ROUTE_PATHS.concierge,
    keywords: ["concierge", "ask", "conversation", "help"],
  },
  {
    id: "nav-autopilot",
    label: "Autopilot",
    description: "Concierge automation and approvals",
    group: searchGroupLabels.concierge,
    entityType: "concierge",
    href: ROUTE_PATHS.autopilot,
    keywords: ["autopilot", "concierge", "automation"],
  },
  {
    id: "nav-relationship-settings",
    label: "Relationship preferences",
    description: "Concierge tone and card defaults",
    group: searchGroupLabels.concierge,
    entityType: "concierge",
    href: ROUTE_PATHS.settingsRelationship,
    keywords: ["concierge", "relationship", "preferences"],
  },
];

export const searchDefaults = {
  debounceMs: 250,
  minQueryLength: 1,
  maxRecentSearches: 10,
  maxDisplayedRecentSearches: 5,
  placeholder: "Search people, cards, memories…",
  emptyLabel: "Nothing matched that yet.",
  errorLabel: "We could not load search right now.",
  shortcutHintMac: "⌘ K",
  shortcutHintWin: "Ctrl K",
  viewAllHref: ROUTE_PATHS.search,
  viewAllLabel: "Open full search",
} as const;
