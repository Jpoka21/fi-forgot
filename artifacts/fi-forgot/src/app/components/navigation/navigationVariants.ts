import { motionUtilityClasses, radiusUtilityClasses, typographyUtilityClasses } from "@/app/design";

import type { FiNavItemVariant, FiSidebarMode } from "@/app/components/navigation/navigationDomain";

export const fiNavItemVariantClasses: Record<FiNavItemVariant, string> = {
  sidebar: "fi-nav-item--sidebar",
  top: "fi-nav-item--top",
  mobile: "fi-nav-item--mobile",
  footer: "fi-nav-item--footer",
};

export function getFiSidebarClassName(options: {
  mode?: FiSidebarMode;
  className?: string;
}): string {
  const { mode = "expanded", className = "" } = options;

  return [
    "fi-sidebar",
    mode === "collapsed" ? "fi-sidebar--collapsed" : "",
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiTopNavigationClassName(className = ""): string {
  return ["fi-top-nav", motionUtilityClasses.reducedSafe, className].filter(Boolean).join(" ");
}

export function getFiMobileNavigationClassName(className = ""): string {
  return ["fi-mobile-nav", motionUtilityClasses.reducedSafe, className].filter(Boolean).join(" ");
}

export function getFiNavItemClassName(options: {
  variant?: FiNavItemVariant;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}): string {
  const {
    variant = "sidebar",
    active = false,
    disabled = false,
    className = "",
  } = options;

  return [
    "fi-nav-item",
    fiNavItemVariantClasses[variant],
    active ? "fi-nav-item--active" : "",
    disabled ? "fi-nav-item--disabled" : "",
    motionUtilityClasses.hover,
    motionUtilityClasses.focus,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiBreadcrumbClassName(className = ""): string {
  return ["fi-breadcrumb", typographyUtilityClasses.caption, className]
    .filter(Boolean)
    .join(" ");
}

export function getFiMenuPanelClassName(className = ""): string {
  return [
    "fi-menu-panel",
    radiusUtilityClasses.md,
    motionUtilityClasses.navEnter,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiCommandPaletteClassName(className = ""): string {
  return [
    "fi-command-palette",
    radiusUtilityClasses.lg,
    motionUtilityClasses.dialogEnter,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiFooterNavigationClassName(className = ""): string {
  return ["fi-footer-nav", typographyUtilityClasses.caption, className]
    .filter(Boolean)
    .join(" ");
}

export function getFiBackNavigationClassName(className = ""): string {
  return [
    "fi-back-nav",
    typographyUtilityClasses.bodySm,
    motionUtilityClasses.hover,
    motionUtilityClasses.focus,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiSearchBarClassName(className = ""): string {
  return ["fi-search-bar", className].filter(Boolean).join(" ");
}
