import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiTimelineContainerClassName(className = ""): string {
  return [
    "fi-timeline",
    spacingUtilityClasses.stackTimeline,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiTimelineGroupClassName(className = ""): string {
  return ["fi-timeline-group", className].filter(Boolean).join(" ");
}

export function getFiTimelineItemClassName(options: {
  archived?: boolean;
  typeToneClass?: string;
  className?: string;
}): string {
  const { archived = false, typeToneClass = "", className = "" } = options;

  return [
    "fi-timeline-item",
    archived ? "fi-timeline-item--archived" : "",
    typeToneClass,
    motionUtilityClasses.timelineEnter,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiTimelineFilterChipClassName(options: {
  active?: boolean;
  className?: string;
}): string {
  const { active = false, className = "" } = options;

  return [
    "fi-timeline-filter-chip",
    active ? "fi-timeline-filter-chip--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
