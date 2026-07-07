import { BILLING_ATTENTION_KEY, type BillingUsageSummary, type StripePlanRow } from "@/app/billing/billingDomain";
import type { CardOrder, Recipient } from "@/lib/data";
import {
  getCardLimit,
  getRecipientLimit,
  isLegacyPlan,
  resolveUserPlan,
  type Plan,
} from "@/lib/plan";

const MAILED_STATUSES = new Set<CardOrder["status"]>([
  "Approved",
  "Mailed to me",
  "Mailed to her",
  "Delivered",
  "Given",
]);

export function parseStripePlansPayload(payload: unknown): StripePlanRow[] {
  const root = payload as { data?: unknown[] } | null;
  const rows = Array.isArray(root?.data) ? root.data : [];

  return rows
    .filter((row) => Boolean((row as { metadata?: { planKey?: string } }).metadata?.planKey))
    .map((row) => {
      const typed = row as {
        metadata: { planKey: string };
        price_id: string;
        unit_amount: number;
      };
      return {
        planKey: typed.metadata.planKey as Plan,
        priceId: typed.price_id,
        unitAmount: typed.unit_amount,
      };
    });
}

export function planTierIndex(plan: Plan): number {
  if (plan === "free") return 0;
  if (plan === "basic") return 1;
  if (plan === "standard") return 2;
  if (plan === "premium") return 3;
  if (plan === "concierge_member") return 4;
  return 0;
}

export function comparePlans(current: Plan | null, next: Plan): "upgrade" | "downgrade" | "same" {
  const resolved = current ? resolveUserPlan(current) : "free";
  const delta = planTierIndex(next) - planTierIndex(resolved);
  if (delta > 0) return "upgrade";
  if (delta < 0) return "downgrade";
  return "same";
}

export function buildUsageSummary(
  plan: Plan | null,
  recipients: Recipient[],
  cards: CardOrder[],
): BillingUsageSummary {
  const activeRecipients = recipients.filter((recipient) => recipient.active !== false).length;
  const year = new Date().getFullYear();
  const cardsUsedThisYear = cards.filter((card) => {
    if (!MAILED_STATUSES.has(card.status)) return false;
    const dueYear = new Date(card.dueDate).getFullYear();
    return dueYear === year || Number.isNaN(dueYear);
  }).length;

  const resolved = plan ? resolveUserPlan(plan) : "free";
  const recipientLimit = getRecipientLimit(resolved);
  const cardLimit = getCardLimit(resolved);

  return {
    activeRecipients,
    recipientLimit: Number.isFinite(recipientLimit) ? recipientLimit : null,
    cardsUsedThisYear,
    cardLimit: Number.isFinite(cardLimit) ? cardLimit : 0,
  };
}

export function formatRenewalEstimate(date = new Date()): string {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function readBillingAttention(): boolean {
  try {
    return localStorage.getItem(BILLING_ATTENTION_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeBillingAttention(active: boolean): void {
  if (active) {
    localStorage.setItem(BILLING_ATTENTION_KEY, "1");
  } else {
    localStorage.removeItem(BILLING_ATTENTION_KEY);
  }
}

export function isStripePlanReady(
  planKey: Plan,
  stripePlans: StripePlanRow[],
  devBypass: boolean,
): boolean {
  if (devBypass) return true;
  if (planKey === "free") return true;
  return stripePlans.some((plan) => plan.planKey === planKey);
}

export function isLegacyBillingPlan(plan: Plan | null): plan is Plan {
  return plan !== null && isLegacyPlan(plan);
}
