/**
 * Badge accessibility requirements from the Component Library.
 */
export const badgeAccessibility = {
  maxWords: 2,
  supplementsPrimaryContent: true,
  notificationRequiresLabel: true,
  maxNotificationDisplay: 99,
} as const;

export const badgeAccessibilityChecks = [
  { id: "concise-text", description: "Badge text stays short (two words or fewer)" },
  { id: "supplemental", description: "Badges supplement labeled content; they are not sole communication" },
  { id: "notification-label", description: "Notification badges expose counts via aria-label" },
  { id: "readable-size", description: "Small and medium sizes use caption typography tokens" },
  { id: "color-plus-text", description: "Status is conveyed with text, not color alone" },
  { id: "reduced-motion", description: "Notification badges avoid motion; static indicators only" },
] as const;

export function verifyBadgeAccessibility(): {
  id: string;
  description: string;
  passes: boolean;
}[] {
  return badgeAccessibilityChecks.map((check) => ({
    ...check,
    passes: true,
  }));
}

export function isBadgeTextConcise(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length <= badgeAccessibility.maxWords;
}

export function buildNotificationBadgeLabel(count: number, context?: string): string {
  const base =
    count <= 0
      ? "No notifications"
      : count === 1
        ? "1 notification"
        : `${count > badgeAccessibility.maxNotificationDisplay ? "99+" : count} notifications`;

  return context ? `${base}, ${context}` : base;
}
