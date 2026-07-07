import type { Recipient } from "@/lib/data";
import type { RecipientHealth } from "@/lib/relationship-health";
import { recipientHasThinMemory } from "@/lib/personal-brand";

export const recipientsListDefaults = {
  title: "Your People",
  description: "The people who matter most.",
  searchPlaceholder: "Search by name or relationship…",
  addLabel: "Add someone",
  emptyTitle: "Add your first person",
  emptyDescription:
    "Start with someone you never want to forget. We'll quietly help you stay connected.",
  noResultsLabel: "No one matches your search. Try another name or relationship.",
  comingUpTitle: "Coming up soon",
  comingUpSubtitle: "A few moments on the horizon.",
  archivedTitle: "Archived",
  restoreLabel: "Restore",
  restoringLabel: "Restoring…",
  loadMoreLabel: "Load more",
  errorLabel: "We could not load your people right now.",
  retryLabel: "Try again",
} as const;

export const recipientsPageSize = 12;

export const recipientSortOptions = [
  { id: "name", label: "Name" },
  { id: "upcoming", label: "Upcoming event" },
  { id: "health", label: "Relationship health" },
] as const;

export type FiRecipientSortId = (typeof recipientSortOptions)[number]["id"];

export const recipientFilterOptions = [
  { id: "all", label: "Everyone" },
  { id: "family", label: "Family" },
  { id: "friends", label: "Friends" },
  { id: "other", label: "Others" },
  { id: "needs-attention", label: "Needs attention" },
] as const;

export type FiRecipientFilterId = (typeof recipientFilterOptions)[number]["id"];

export const familyRelationships = new Set([
  "Wife", "Husband", "Girlfriend", "Boyfriend", "Mom", "Dad", "Mother", "Father",
  "Sister", "Brother", "Son", "Daughter", "Grandma", "Grandpa", "Grandmother", "Grandfather",
  "Aunt", "Uncle", "Niece", "Nephew",
]);

export interface RecipientListGroups {
  family: Recipient[];
  friends: Recipient[];
  other: Recipient[];
}

export interface RecipientComingUpItem {
  recipient: Recipient;
  event: string;
  daysAway: number;
}

export function occasionLine(event: string, daysAway: number): string {
  if (daysAway === 0) return `${event} is today`;
  if (daysAway === 1) return `${event} is tomorrow`;
  if (daysAway <= 14) return `${event} in ${daysAway} days`;
  return `Next: ${event}`;
}

export function warmHint(health: RecipientHealth | undefined, recipient: Recipient): string | null {
  if (recipientHasThinMemory(recipient)) {
    return "Help us make future cards better";
  }
  if (!health || health.topGap === "Profile looks great!") return null;
  const gap = health.topGap.toLowerCase();
  if (gap.includes("memory") || gap.includes("memories")) {
    return "A memory or two helps us sound like you";
  }
  if (gap.includes("occasion") || gap.includes("event") || gap.includes("birthday")) {
    return "Add their important dates when you have a moment";
  }
  if (gap.includes("address") || gap.includes("mailing")) {
    return "We'll need an address before we can send";
  }
  return "Help us make future cards better";
}

export function resolveRecipientGroup(recipient: Recipient): keyof RecipientListGroups {
  if (familyRelationships.has(recipient.relationship)) return "family";
  if (recipient.relationship === "Friend" || (recipient.relationship as string) === "Best Friend") {
    return "friends";
  }
  return "other";
}
