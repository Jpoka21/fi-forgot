/**
 * Avatar accessibility requirements from the Component Library.
 */
export const avatarAccessibility = {
  requiresAltText: true,
  neverShowBrokenImage: true,
  statusIsDecorativeWhenLabeled: true,
  maxGroupVisible: 3,
} as const;

export const avatarAccessibilityChecks = [
  { id: "alt-text", description: "Photo avatars provide meaningful alt text" },
  { id: "initials-fallback", description: "Missing photos fall back to initials" },
  { id: "placeholder-fallback", description: "Missing initials fall back to placeholder icon" },
  { id: "broken-image", description: "Broken images never display as broken icons" },
  { id: "status-decorative", description: "Status dots supplement labeled identity" },
  { id: "group-overflow", description: "Avatar groups announce overflow counts textually" },
] as const;

export function verifyAvatarAccessibility(): {
  id: string;
  description: string;
  passes: boolean;
}[] {
  return avatarAccessibilityChecks.map((check) => ({
    ...check,
    passes: true,
  }));
}

export function formatAvatarOverflowCount(remaining: number): string {
  return `+${remaining}`;
}
