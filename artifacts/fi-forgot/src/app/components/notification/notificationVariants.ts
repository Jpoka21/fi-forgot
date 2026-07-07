import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiNotificationDrawerClassName(options: {
  mobile?: boolean;
  className?: string;
}): string {
  const { mobile = false, className = "" } = options;

  return [
    "fi-notification-drawer",
    mobile ? "fi-notification-drawer--mobile" : "fi-notification-drawer--desktop",
    spacingUtilityClasses.pDrawer,
    motionUtilityClasses.drawerEnter,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiNotificationItemClassName(options: {
  unread?: boolean;
  className?: string;
}): string {
  const { unread = false, className = "" } = options;

  return [
    "fi-notification-item",
    unread ? "fi-notification-item--unread" : "fi-notification-item--read",
    motionUtilityClasses.notificationEnter,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiNotificationFilterChipClassName(options: {
  active?: boolean;
  className?: string;
}): string {
  const { active = false, className = "" } = options;

  return [
    "fi-notification-filter-chip",
    active ? "fi-notification-filter-chip--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
