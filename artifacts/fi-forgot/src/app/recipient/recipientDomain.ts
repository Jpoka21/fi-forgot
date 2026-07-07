import type { FiCalendarBadgeStatus } from "@/app/components/badge/badgeDomain";
import type { CardOrder, Recipient } from "@/lib/data";
import type { RecipientHealth } from "@/lib/relationship-health";

export const recipientDefaults = {
  title: "Recipient profile",
  description: "Relationship context, memories, and upcoming moments in one place.",
  refreshLabel: "Refresh",
  errorLabel: "We could not load this recipient right now.",
  notFoundLabel: "This recipient could not be found.",
  memoryPreviewTitle: "Memory preview",
  milestonesTitle: "Upcoming milestones",
  activityTitle: "Activity summary",
  cardHistoryTitle: "Card history",
  quickActionsTitle: "Quick actions",
  overviewTitle: "Relationship overview",
  statusTitle: "Status",
} as const;

export interface FiRecipientQuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
}

export interface FiRecipientMilestone {
  id: string;
  event: string;
  dateStr: string;
  daysAway: number;
}

export interface FiRecipientMemoryPreviewItem {
  id: string;
  label: string;
  excerpt: string;
}

export interface FiRecipientActivitySummary {
  approvedCards: number;
  pendingCards: number;
  briefingsCount: number;
  lastProfileUpdateLabel: string;
  thinMemory: boolean;
}

export interface FiRecipientCardHistoryItem {
  id: string;
  holiday: string;
  dueDate: string;
  status: CardOrder["status"];
  badgeStatus: FiCalendarBadgeStatus;
}

export interface FiRecipientStatusIndicator {
  id: string;
  label: string;
  tone: "positive" | "neutral" | "attention";
  detail?: string;
}

export interface FiRecipientProfileSnapshot {
  recipient: Recipient;
  health: RecipientHealth;
  nextOccasion: { event: string; daysAway: number; dateStr: string } | null;
  milestones: FiRecipientMilestone[];
  memoryPreview: FiRecipientMemoryPreviewItem[];
  activity: FiRecipientActivitySummary;
  cardHistory: FiRecipientCardHistoryItem[];
  statuses: FiRecipientStatusIndicator[];
  quickActions: FiRecipientQuickAction[];
}

export function excerptText(value: string, maxLength = 140): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

export function mapCardStatusToBadge(status: CardOrder["status"]): FiCalendarBadgeStatus {
  if (status === "Approved") return "sent";
  if (status === "Ready for approval") return "draft";
  if (status === "Needs profile") return "missed";
  return "upcoming";
}

export function formatProfileUpdatedAt(value?: string): string {
  if (!value) return "Profile update timing unavailable";
  const updated = new Date(value);
  if (Number.isNaN(updated.getTime())) return "Profile update timing unavailable";
  return `Profile updated ${updated.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}
