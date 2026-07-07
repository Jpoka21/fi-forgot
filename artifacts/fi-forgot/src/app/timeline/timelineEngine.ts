import { normalizeSearchQuery } from "@/app/search/searchHighlight";
import {
  timelineInfluencesCardTypes,
  type FiTimelineFilterOption,
  type FiTimelineItem,
  type FiTimelineItemType,
  type FiTimelineMonthGroup,
} from "@/app/timeline/timelineDomain";

export function formatTimelineDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getMonthKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "0000-00";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  if (key === "0000-00") return "Unknown date";
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function groupTimelineByMonth(items: FiTimelineItem[]): FiTimelineMonthGroup[] {
  const buckets = new Map<string, FiTimelineItem[]>();

  items.forEach((item) => {
    const key = getMonthKey(item.date);
    const bucket = buckets.get(key) ?? [];
    bucket.push(item);
    buckets.set(key, bucket);
  });

  return Array.from(buckets.entries())
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([key, groupItems]) => ({
      key,
      label: getMonthLabel(key),
      items: groupItems,
    }));
}

export function filterTimelineItems(
  items: FiTimelineItem[],
  filter: FiTimelineFilterOption,
): FiTimelineItem[] {
  switch (filter) {
    case "influences_cards":
      return items.filter(
        (item) => timelineInfluencesCardTypes.has(item.type) && !item.isArchived,
      );
    case "profile":
      return items.filter((item) => item.type === "profile_gap");
    case "briefings":
      return items.filter((item) => item.type === "event_briefing");
    case "cards":
      return items.filter((item) => item.type === "card" || item.type === "follow_up");
    case "archived":
      return items.filter((item) => item.isArchived);
    default:
      return items;
  }
}

export function searchTimelineItems(items: FiTimelineItem[], query: string): FiTimelineItem[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return items;

  return items.filter((item) => {
    const haystack = [item.label, item.summary, item.source, item.type].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function paginateTimelineItems(items: FiTimelineItem[], visibleCount: number): {
  visibleItems: FiTimelineItem[];
  hasMore: boolean;
} {
  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore: items.length > visibleCount,
  };
}

export type FiTimelineImpactBadge = "used_in_cards" | "reference_only" | "not_used_for_cards";

export function resolveTimelineImpactBadge(item: FiTimelineItem): FiTimelineImpactBadge {
  if (item.isArchived) return "not_used_for_cards";
  if (timelineInfluencesCardTypes.has(item.type)) return "used_in_cards";
  return "reference_only";
}

export function resolveTimelineTypeTone(type: FiTimelineItemType): string {
  return `fi-timeline-item--${type.replace(/_/g, "-")}`;
}
