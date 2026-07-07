export const fiTimelineItemTypes = [
  "profile_gap",
  "fresh_update",
  "event_briefing",
  "card",
  "important_date",
  "follow_up",
] as const;

export type FiTimelineItemType = (typeof fiTimelineItemTypes)[number];

export const fiTimelineFilterOptions = [
  "all",
  "influences_cards",
  "profile",
  "briefings",
  "cards",
  "archived",
] as const;

export type FiTimelineFilterOption = (typeof fiTimelineFilterOptions)[number];

export interface FiTimelineItem {
  id: string;
  date: string;
  type: FiTimelineItemType;
  label: string;
  summary: string;
  source: string;
  canArchive: boolean;
  canEdit: boolean;
  isArchived: boolean;
}

export interface FiTimelineMonthGroup {
  key: string;
  label: string;
  items: FiTimelineItem[];
}

export const timelineTypeLabels: Record<FiTimelineItemType, string> = {
  fresh_update: "Fresh update",
  profile_gap: "Profile",
  event_briefing: "Briefing",
  card: "Card",
  important_date: "Important date",
  follow_up: "Follow Up",
};

export const timelineInfluencesCardTypes = new Set<FiTimelineItemType>([
  "profile_gap",
  "fresh_update",
]);

export const timelineDefaults = {
  debounceMs: 200,
  pageSize: 8,
  title: "Relationship history",
  description: "Everything we know about this person — the complete memory ledger.",
  errorLabel: "We could not load this timeline right now.",
  refreshLabel: "Refresh timeline",
  loadMoreLabel: "Load earlier moments",
  searchPlaceholder: "Search memories",
  searchAriaLabel: "Search timeline memories",
} as const;

export function isTimelineItem(value: unknown): value is FiTimelineItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<FiTimelineItem>;
  return (
    typeof item.id === "string"
    && typeof item.date === "string"
    && typeof item.type === "string"
    && typeof item.label === "string"
    && typeof item.summary === "string"
  );
}

export function normalizeTimelineItem(value: unknown): FiTimelineItem | null {
  if (!isTimelineItem(value)) return null;

  return {
    id: value.id,
    date: value.date,
    type: fiTimelineItemTypes.includes(value.type) ? value.type : "profile_gap",
    label: value.label,
    summary: value.summary,
    source: typeof value.source === "string" ? value.source : "",
    canArchive: Boolean(value.canArchive),
    canEdit: Boolean(value.canEdit),
    isArchived: Boolean(value.isArchived),
  };
}
