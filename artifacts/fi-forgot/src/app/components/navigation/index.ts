export { FiNavItem } from "@/app/components/navigation/FiNavItem";
export type { FiNavItemProps } from "@/app/components/navigation/FiNavItem";

export {
  FiSidebar,
  FiSidebarBrand,
  FiSidebarContent,
  FiSidebarFooter,
  FiSidebarHeader,
  FiSidebarNav,
} from "@/app/components/navigation/FiSidebar";
export type {
  FiSidebarBrandProps,
  FiSidebarNavProps,
  FiSidebarProps,
} from "@/app/components/navigation/FiSidebar";

export {
  FiTopNavActions,
  FiTopNavBrand,
  FiTopNavList,
  FiTopNavSection,
  FiTopNavigation,
} from "@/app/components/navigation/FiTopNavigation";
export type {
  FiTopNavBrandProps,
  FiTopNavListProps,
  FiTopNavigationProps,
} from "@/app/components/navigation/FiTopNavigation";

export { FiMobileNavigation } from "@/app/components/navigation/FiMobileNavigation";
export type { FiMobileNavigationProps } from "@/app/components/navigation/FiMobileNavigation";

export {
  FiBreadcrumb,
  FiBreadcrumbEllipsis,
  FiBreadcrumbItem,
  FiBreadcrumbLink,
  FiBreadcrumbList,
  FiBreadcrumbPage,
  FiBreadcrumbSeparator,
} from "@/app/components/navigation/FiBreadcrumb";
export type {
  FiBreadcrumbProps,
  FiBreadcrumbSeparatorProps,
} from "@/app/components/navigation/FiBreadcrumb";

export { FiUserMenu, FiUserMenuTrigger } from "@/app/components/navigation/FiUserMenu";
export type { FiUserMenuProps, FiUserMenuTriggerProps } from "@/app/components/navigation/FiUserMenu";

export { FiNotificationMenu } from "@/app/components/navigation/FiNotificationMenu";
export type { FiNotificationMenuProps } from "@/app/components/navigation/FiNotificationMenu";

export { FiSearchBar } from "@/app/components/navigation/FiSearchBar";
export type { FiSearchBarProps } from "@/app/components/navigation/FiSearchBar";

export {
  FiCommandPalette,
  FiCommandPaletteItem,
} from "@/app/components/navigation/FiCommandPalette";
export type {
  FiCommandPaletteItemProps,
  FiCommandPaletteProps,
} from "@/app/components/navigation/FiCommandPalette";

export { FiBackNavigation } from "@/app/components/navigation/FiBackNavigation";
export type { FiBackNavigationProps } from "@/app/components/navigation/FiBackNavigation";

export { FiFooterNavigation } from "@/app/components/navigation/FiFooterNavigation";
export type { FiFooterNavigationProps } from "@/app/components/navigation/FiFooterNavigation";

export {
  backNavigationDefaults,
  commandPaletteDefaults,
  fiNavItemVariants,
  fiSidebarModes,
  searchBarDefaults,
} from "@/app/components/navigation/navigationDomain";
export type {
  FiCommandPaletteItemData,
  FiNavItemVariant,
  FiNavigationItem,
  FiNotificationMenuItemData,
  FiSidebarMode,
  FiUserMenuItemData,
} from "@/app/components/navigation/navigationDomain";

export {
  fiNavItemVariantClasses,
  getFiBackNavigationClassName,
  getFiBreadcrumbClassName,
  getFiCommandPaletteClassName,
  getFiFooterNavigationClassName,
  getFiMenuPanelClassName,
  getFiMobileNavigationClassName,
  getFiNavItemClassName,
  getFiSearchBarClassName,
  getFiSidebarClassName,
  getFiTopNavigationClassName,
} from "@/app/components/navigation/navigationVariants";

export {
  buildBackNavigationLabel,
  buildNavigationMenuLabel,
  navigationAccessibility,
  navigationAccessibilityChecks,
  verifyNavigationAccessibility,
} from "@/app/components/navigation/accessibility";
