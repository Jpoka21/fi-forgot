export const fiTimelineItemTypes = [
  "profile_gap",
  "fresh_update",
  "event_briefing",
  "card",
  "important_date",
  "follow_up",
  "user_report",
  "generated_card_text",
  "user_edited_card_text",
  "platform_action",
  "profile_date",
  "derived",
  "unknown",
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
  date: string | null;
  type: FiTimelineItemType;
  label: string;
  summary: string;
  source: string;
  sourceKind: string;
  semanticClassification: string | null;
  canArchive: boolean;
  canEdit: boolean;
  isArchived: boolean;
  evidenceId: string | null;
  memberEvidenceIds: string[];
  recordedAt: string | null;
  activityAt: string | null;
  occurrenceAt: string | null;
  observationAt: string | null;
  canRestore: boolean;
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
  user_report: "Reported by you",
  generated_card_text: "Generated card text",
  user_edited_card_text: "User-edited card text",
  platform_action: "Platform activity",
  profile_date: "Profile date",
  derived: "Derived information",
  unknown: "Unclassified source",
};

export const timelineInfluencesCardTypes = new Set<FiTimelineItemType>([
  "profile_gap",
  "fresh_update",
]);

export const timelineDefaults = {
  debounceMs: 200,
  pageSize: 8,
  title: "Relationship history",
  description: "Source-backed relationship history. Report dates show when you saved an answer, not when the described experience happened.",
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
    && (typeof item.date === "string" || item.date === null)
    && typeof item.type === "string"
    && typeof item.label === "string"
    && typeof item.summary === "string"
  );
}

export function normalizeTimelineItem(value: unknown): FiTimelineItem | null {
  if (!isTimelineItem(value)) return null;

  return {
    id: value.id,
    date: normalizeTimelineTimestamp(value.date),
    type: fiTimelineItemTypes.includes(value.type) ? value.type : "unknown",
    label: value.label,
    summary: value.summary,
    source: typeof value.source === "string" ? value.source : "",
    sourceKind: typeof value.sourceKind === "string" ? value.sourceKind : value.type,
    semanticClassification: typeof value.semanticClassification === "string" ? value.semanticClassification : null,
    canArchive: Boolean(value.canArchive),
    canEdit: Boolean(value.canEdit),
    isArchived: Boolean(value.isArchived),
    evidenceId: typeof value.evidenceId === "string" ? value.evidenceId : null,
    memberEvidenceIds: Array.isArray(value.memberEvidenceIds) ? value.memberEvidenceIds.filter((id): id is string => typeof id === "string") : [],
    recordedAt: normalizeTimelineTimestamp(value.recordedAt),
    activityAt: normalizeTimelineTimestamp(value.activityAt),
    occurrenceAt: normalizeTimelineTimestamp(value.occurrenceAt),
    observationAt: normalizeTimelineTimestamp(value.observationAt),
    canRestore: Boolean(value.canRestore),
  };
}

export function normalizeTimelineTimestamp(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}
