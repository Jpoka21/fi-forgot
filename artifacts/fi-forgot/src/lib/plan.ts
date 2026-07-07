import {
  formatMonthlyPrice,
  LAUNCH_PRICING,
  LEGACY_SUBSCRIPTION_PRICING,
  type LegacyPlanKey,
} from "@/app/pricing";

export type FreemiumPlan = "free" | "concierge_member";
export type LegacyPlan = LegacyPlanKey;
export type Plan = FreemiumPlan | LegacyPlan;

export interface PlanConfig {
  label: string;
  tagline: string;
  price: string;
  maxRecipients: number;
  maxCardsPerYear: number;
  perks: string[];
  category: "freemium" | "legacy";
}

function buildLegacyPlanConfig(key: LegacyPlanKey): PlanConfig {
  const legacy = LEGACY_SUBSCRIPTION_PRICING[key];
  return {
    label: legacy.label,
    tagline: legacy.tagline,
    price: formatMonthlyPrice(legacy.monthlyCents),
    maxRecipients: legacy.maxRecipients,
    maxCardsPerYear: legacy.maxCardsPerYear,
    perks: [...legacy.perks],
    category: "legacy",
  };
}

function buildFreemiumPlanConfig(): Record<FreemiumPlan, PlanConfig> {
  const free = LAUNCH_PRICING.free;
  const member = LAUNCH_PRICING.conciergeMember;
  return {
    free: {
      label: free.label,
      tagline: free.tagline,
      price: "Free",
      maxRecipients: free.relationshipLimit,
      maxCardsPerYear: Number.POSITIVE_INFINITY,
      perks: [...free.perks],
      category: "freemium",
    },
    concierge_member: {
      label: member.label,
      tagline: member.tagline,
      price: formatMonthlyPrice(member.monthlyCents!),
      maxRecipients: Number.POSITIVE_INFINITY,
      maxCardsPerYear: Number.POSITIVE_INFINITY,
      perks: [...member.perks],
      category: "freemium",
    },
  };
}

const FREEMIUM_PLANS = buildFreemiumPlanConfig();

/** All plan display configs — freemium launch tiers + legacy Stripe tiers */
export const PLANS: Record<Plan, PlanConfig> = {
  ...FREEMIUM_PLANS,
  basic: buildLegacyPlanConfig("basic"),
  standard: buildLegacyPlanConfig("standard"),
  premium: buildLegacyPlanConfig("premium"),
};

export const LEGACY_PLAN_ORDER: LegacyPlan[] = ["basic", "standard", "premium"];

export function resolveUserPlan(plan?: Plan): Plan {
  return plan ?? "free";
}

export function isLegacyPlan(plan: Plan): plan is LegacyPlan {
  return plan === "basic" || plan === "standard" || plan === "premium";
}

export function isFreemiumPlan(plan: Plan): plan is FreemiumPlan {
  return plan === "free" || plan === "concierge_member";
}

/** Active paid concierge access — includes grandfathered legacy subscribers */
export function hasConciergeMembership(plan: Plan): boolean {
  return plan === "concierge_member" || isLegacyPlan(plan);
}

export function getRecipientLimit(plan: Plan): number {
  if (plan === "free") return LAUNCH_PRICING.free.relationshipLimit;
  if (plan === "concierge_member") return Number.POSITIVE_INFINITY;
  return LEGACY_SUBSCRIPTION_PRICING[plan].maxRecipients;
}

export function getCardLimit(plan: Plan): number {
  if (isFreemiumPlan(plan)) return Number.POSITIVE_INFINITY;
  return LEGACY_SUBSCRIPTION_PRICING[plan].maxCardsPerYear;
}

export function canActivateRecipient(plan: Plan, activeCount: number): boolean {
  if (import.meta.env.DEV) return true;
  const limit = getRecipientLimit(plan);
  if (!Number.isFinite(limit)) return true;
  return activeCount < limit;
}

export function shouldShowRelationshipUpgrade(plan: Plan, activeCount: number): boolean {
  return plan === "free" && activeCount >= LAUNCH_PRICING.free.relationshipLimit;
}

export function shouldShowMemberCardSavings(plan: Plan, mailedCardCount: number): boolean {
  return plan === "free" && mailedCardCount >= 1;
}
