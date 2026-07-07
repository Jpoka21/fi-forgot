import type { ReactNode } from "react";

export const fiNavItemVariants = ["sidebar", "top", "mobile", "footer"] as const;

export type FiNavItemVariant = (typeof fiNavItemVariants)[number];

export const fiSidebarModes = ["expanded", "collapsed"] as const;

export type FiSidebarMode = (typeof fiSidebarModes)[number];

export const backNavigationDefaults = {
  label: "Back",
} as const;

export const commandPaletteDefaults = {
  placeholder: "Search people, cards, memories…",
  emptyLabel: "No results found",
  shortcutHint: "Ctrl K",
} as const;

export const searchBarDefaults = {
  placeholder: "Search",
  ariaLabel: "Search",
} as const;

export interface FiNavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  active?: boolean;
  disabled?: boolean;
}

export interface FiCommandPaletteItemData {
  id: string;
  label: string;
  description?: string;
  group?: string;
  keywords?: string[];
}

export interface FiUserMenuItemData {
  id: string;
  label: string;
  href?: string;
  destructive?: boolean;
  onSelect?: () => void;
}

export interface FiNotificationMenuItemData {
  id: string;
  title: string;
  description?: string;
  href?: string;
  unread?: boolean;
  onSelect?: () => void;
}
