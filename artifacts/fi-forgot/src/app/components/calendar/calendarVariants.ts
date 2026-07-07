import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiCalendarContainerClassName(className = ""): string {
  return [
    "fi-calendar",
    spacingUtilityClasses.stackMd,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiCalendarClassName(className = ""): string {
  return ["fi-calendar-page", className].filter(Boolean).join(" ");
}

export function getFiCalendarSectionClassName(className = ""): string {
  return ["fi-calendar__section", className].filter(Boolean).join(" ");
}

export function getFiCalendarViewTabClassName(options: { active?: boolean; className?: string }): string {
  const { active = false, className = "" } = options;

  return [
    "fi-calendar__view-tab",
    active ? "fi-calendar__view-tab--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiCalendarFilterChipClassName(options: { active?: boolean; className?: string }): string {
  const { active = false, className = "" } = options;

  return [
    "fi-calendar-filter-chip",
    active ? "fi-calendar-filter-chip--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiCalendarDayButtonClassName(options: {
  selected?: boolean;
  today?: boolean;
  outside?: boolean;
  className?: string;
}): string {
  const { selected = false, today = false, outside = false, className = "" } = options;

  return [
    "fi-calendar__day-button",
    selected ? "fi-calendar__day-button--selected" : "",
    today ? "fi-calendar__day-button--today" : "",
    outside ? "fi-calendar__day-button--outside" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiCalendarEventCardClassName(className = ""): string {
  return ["fi-calendar-event-card", motionUtilityClasses.calendarEnter, className]
    .filter(Boolean)
    .join(" ");
}
