import type { CardOrder, Recipient } from "@/lib/data";

export const relationshipProfileDefaults = {
  title: "Relationship profile",
  refreshLabel: "Refresh",
  errorLabel: "We could not load this relationship profile right now.",
  backLabel: "Your people",
  backHref: "/people",
  homeLabel: "Home",
  homeHref: "/dashboard",
} as const;

export interface FreshUpdate {
  id: string;
  questionKey: string;
  questionText: string;
  answerText: string;
  daysAgo: number;
  ageCategory: "recent" | "mid" | "older";
  createdAt: string;
}

export interface NextQuestion {
  fieldKey: string;
  fieldLabel: string;
  category: string;
  priority: string;
  question: string;
  reason: string;
  mode: "profile_gap" | "fresh_update" | "follow_up";
  followUp?: { id: string; originalAnswer: string; category: string };
}

export interface HealthScore {
  recipientId: string;
  name: string;
  score: number;
  status: "Excellent" | "Healthy" | "NeedsAttention" | "Priority";
  nextEventLabel: string | null;
  nextEventDaysAway: number | null;
  lastUpdateDaysAgo: number | null;
  pendingFollowUps: number;
}

export interface TrackedEventData {
  event: string;
  dateStr: string | null;
  daysAway: number | null;
}

export interface ProfileField {
  key: string;
  value: string;
}

export const INTEREST_LABELS: Record<string, string> = {
  family: "Family & kids",
  travel: "Travel & adventure",
  food: "Food & cooking",
  reading: "Reading",
  fitness: "Fitness",
  music: "Music & arts",
  animals: "Animals & pets",
  nature: "Nature & outdoors",
  movies: "Movies & TV",
  fashion: "Fashion & style",
};

export const DATE_SENSITIVE_EVENTS = [
  { label: "Birthday", emoji: "🎂" },
  { label: "Anniversary", emoji: "💑" },
  { label: "Work Anniversary", emoji: "💼" },
  { label: "Graduation", emoji: "🎓" },
  { label: "Just Because", emoji: "💌" },
] as const;

export const HOLIDAY_EVENTS = [
  { label: "Valentine's Day", emoji: "💝", flag: "needsValentinesDay" as const },
  { label: "Mother's Day", emoji: "👩", flag: "needsMothersDay" as const },
  { label: "Father's Day", emoji: "👔", flag: "needsFathersDay" as const },
  { label: "Thanksgiving", emoji: "🦃", flag: "needsThanksgiving" as const },
  { label: "Christmas", emoji: "🎄", flag: "needsChristmasHanukkah" as const },
  { label: "New Year's", emoji: "🥂", flag: "needsNewYears" as const },
  { label: "Easter", emoji: "🐣", flag: "needsEaster" as const },
] as const;

export function formatDaysAgo(n: number): string {
  if (n === 0) return "Today";
  if (n === 1) return "Yesterday";
  if (n < 30) return `${n}d ago`;
  if (n < 60) return "~1 month ago";
  return `${Math.round(n / 30)} months ago`;
}

export function fmtShortDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function daysLabel(n: number): string {
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  return `${n} days`;
}

export function buildProfileFields(recipient: Recipient): ProfileField[] {
  return [
    { key: "Tone", value: recipient.tonePreference },
    {
      key: "Interests",
      value:
        Array.isArray(recipient.interests) && recipient.interests.length > 0
          ? recipient.interests.map((item) => INTEREST_LABELS[item] ?? item).join(", ")
          : "",
    },
    { key: "Favorite memories", value: recipient.favoriteMemories ?? "" },
    { key: "Inside jokes", value: recipient.insideJokes ?? "" },
    {
      key: "Always include",
      value:
        (recipient as Recipient & { alwaysInclude?: string; thingsToAlwaysInclude?: string })
          .alwaysInclude
        ?? (recipient as Recipient & { thingsToAlwaysInclude?: string }).thingsToAlwaysInclude
        ?? "",
    },
    { key: "Delivery", value: recipient.deliveryPreference ?? "" },
  ].filter((field) => field.value.trim().length > 0);
}

export function sortCardsForProfile(cards: CardOrder[]): CardOrder[] {
  const order: Record<string, number> = { "Ready for approval": 0, Approved: 1 };
  return [...cards].sort((a, b) => (order[a.status] ?? 2) - (order[b.status] ?? 2));
}

export function cardStatusLabel(status: CardOrder["status"]): string {
  if (status === "Approved") return "Sent";
  if (status === "Ready for approval") return "Ready for you";
  return status;
}

export function cardPreviewMessage(card: CardOrder): string {
  return card.approvedMessage ?? "";
}
