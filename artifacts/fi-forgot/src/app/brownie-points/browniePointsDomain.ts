export const browniePointsDefaults = {
  title: "Brownie Points",
  description: "Thoughtful actions that strengthen the relationships you care about.",
  balanceLabel: "Your Brownie Points",
  lifetimeLabel: "lifetime earned",
  historyTitle: "Recent activity",
  milestoneTitle: "Next milestone",
  refreshLabel: "Refresh",
  errorLabel: "We could not load Brownie Points right now.",
  historyEmptyTitle: "No activity yet.",
  historyEmptyDescription: "Start by adding a recipient or generating a card.",
} as const;

export interface FiBrowniePointTransaction {
  id: string;
  actionType: string;
  points: number;
  description: string;
  createdAt: string;
}

export interface FiBrowniePointsAccountResponse {
  balance: number;
  lifetime: number;
  recent?: FiBrowniePointTransaction[];
}

export interface FiBrownieMilestone {
  threshold: number;
  label: string;
  description: string;
}

/** Presentation-only milestones — thresholds match server `MILESTONES` in brownie-points service. */
export const brownieMilestones: FiBrownieMilestone[] = [
  { threshold: 100, label: "First 100", description: "Investing in the people who matter." },
  { threshold: 500, label: "500 Club", description: "Building something real here." },
  { threshold: 1000, label: "1K Milestone", description: "That's a lot of thoughtful moments." },
  { threshold: 2500, label: "2,500 Strong", description: "The people in your life are lucky." },
  { threshold: 5000, label: "5K Milestone", description: "A remarkable level of care." },
  { threshold: 10000, label: "10K Legend", description: "You've set the standard." },
];

export const brownieActionEmojis: Record<string, string> = {
  recipient_created: "👤",
  birthday_added: "🎂",
  anniversary_added: "💕",
  fresh_update: "✏️",
  fresh_update_first: "⭐",
  card_generate: "✍️",
  card_send: "📬",
  card_send_early: "⚡",
  profile_complete: "🏅",
  follow_up_answered: "💬",
};

export function normalizeBrownieTransaction(value: unknown): FiBrowniePointTransaction | null {
  if (!value || typeof value !== "object") return null;
  const tx = value as Partial<FiBrowniePointTransaction>;
  if (typeof tx.id !== "string" || typeof tx.description !== "string") return null;
  if (typeof tx.points !== "number" || typeof tx.actionType !== "string") return null;

  const createdAt = typeof tx.createdAt === "string" ? tx.createdAt : null;

  if (!createdAt) return null;

  return {
    id: tx.id,
    actionType: tx.actionType,
    points: tx.points,
    description: tx.description,
    createdAt,
  };
}

export function resolveNextMilestone(lifetime: number): FiBrownieMilestone | null {
  return brownieMilestones.find((milestone) => milestone.threshold > lifetime) ?? null;
}

export function resolveMilestoneProgress(lifetime: number, next: FiBrownieMilestone | null): number {
  if (!next) return 100;
  return Math.min(100, Math.round((lifetime / next.threshold) * 100));
}

export function formatBrownieTransactionDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatBrownieBalance(value: number): string {
  return value.toLocaleString();
}
