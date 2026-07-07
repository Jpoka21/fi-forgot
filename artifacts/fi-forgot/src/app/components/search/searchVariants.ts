import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiGlobalSearchClassName(options: {
  mobile?: boolean;
  className?: string;
}): string {
  const { mobile = false, className = "" } = options;

  return [
    "fi-global-search",
    mobile ? "fi-global-search--mobile" : "fi-global-search--desktop",
    spacingUtilityClasses.stackSm,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiSearchResultItemClassName(options: {
  selected?: boolean;
  className?: string;
}): string {
  const { selected = false, className = "" } = options;

  return [
    "fi-search-result-item",
    selected ? "fi-search-result-item--selected" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiSearchFilterChipClassName(options: {
  active?: boolean;
  className?: string;
}): string {
  const { active = false, className = "" } = options;

  return [
    "fi-search-filter-chip",
    active ? "fi-search-filter-chip--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
