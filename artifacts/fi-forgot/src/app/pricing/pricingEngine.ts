import type { StripePlanRow } from "@/app/billing/billingDomain";
import { COPY_REGISTRY } from "@/app/admin/adminDomain";
import { readCopyOverrides, resolveCopyValue } from "@/app/admin/adminEngine";
import type { Plan } from "@/lib/plan";
import {
  LAUNCH_PRICING,
  LEGACY_SUBSCRIPTION_PRICING,
  PRICING_COPY_REGISTRY_DEFAULTS,
  PRICING_MESSAGING,
  PROMOTIONAL_PRICING,
  type LegacyPlanKey,
} from "@/app/pricing/pricingConfig";

export interface LaunchPricingCard {
  id: string;
  name: string;
  tagline: string;
  priceAmount: string;
  pricePeriod: string;
  annualPrice?: string;
  description: string;
  highlight: boolean;
  badge?: string;
  perks: readonly string[];
  handwrittenCardLine: string;
  /** @deprecated use priceAmount + pricePeriod */
  price: string;
  /** @deprecated use pricePeriod */
  period: string;
  /** @deprecated use annualPrice */
  secondaryPrice?: string;
  /** @deprecated use handwrittenCardLine */
  cardPriceLabel: string;
}

export function formatCents(cents: number, options?: { trimZeros?: boolean }): string {
  const dollars = cents / 100;
  if (options?.trimZeros && cents % 100 === 0) {
    return `$${dollars.toFixed(0)}`;
  }
  return `$${dollars.toFixed(2)}`;
}

export function formatMonthlyPrice(cents: number): string {
  return `${formatCents(cents)}/mo`;
}

export function formatAnnualPrice(cents: number): string {
  return `${formatCents(cents)}/yr`;
}

function resolveMemberMonthlyCents(): number {
  return PROMOTIONAL_PRICING.active && PROMOTIONAL_PRICING.memberMonthlyCents != null
    ? PROMOTIONAL_PRICING.memberMonthlyCents
    : LAUNCH_PRICING.conciergeMember.monthlyCents!;
}

function resolveMemberAnnualCents(): number {
  return PROMOTIONAL_PRICING.active && PROMOTIONAL_PRICING.memberAnnualCents != null
    ? PROMOTIONAL_PRICING.memberAnnualCents
    : LAUNCH_PRICING.conciergeMember.annualCents!;
}

function resolveFreeCardCents(): number {
  return PROMOTIONAL_PRICING.active && PROMOTIONAL_PRICING.freeCardCents != null
    ? PROMOTIONAL_PRICING.freeCardCents
    : LAUNCH_PRICING.free.handwrittenCardCents;
}

function resolveMemberCardCents(): number {
  return PROMOTIONAL_PRICING.active && PROMOTIONAL_PRICING.memberCardCents != null
    ? PROMOTIONAL_PRICING.memberCardCents
    : LAUNCH_PRICING.conciergeMember.handwrittenCardCents;
}

export function getFreeHandwrittenCardPrice(): string {
  return formatCents(resolveFreeCardCents());
}

export function getMemberHandwrittenCardPrice(): string {
  return formatCents(resolveMemberCardCents());
}

export function getMemberHandwrittenCardPriceLabel(): string {
  return PRICING_MESSAGING.launchMemberCardPrice(getMemberHandwrittenCardPrice());
}

export function getMemberMonthlyPrice(): string {
  return formatMonthlyPrice(resolveMemberMonthlyCents());
}

export function getMemberAnnualPrice(): string {
  return formatAnnualPrice(resolveMemberAnnualCents());
}

export function getMemberCardSavingsAmount(): string {
  const savingsCents = resolveFreeCardCents() - resolveMemberCardCents();
  return savingsCents > 0 ? formatCents(savingsCents) : formatCents(0);
}

export function getMemberCardSavingsLabel(): string {
  const savingsCents = resolveFreeCardCents() - resolveMemberCardCents();
  if (savingsCents <= 0) return "";
  return PRICING_MESSAGING.memberSavingsPerCard(formatCents(savingsCents));
}

export function getLaunchPricingCards(): LaunchPricingCard[] {
  const freeCard = getFreeHandwrittenCardPrice();
  const memberCard = getMemberHandwrittenCardPrice();
  const memberMonthlyAmount = formatCents(resolveMemberMonthlyCents());
  const memberAnnual = getMemberAnnualPrice();

  const freeHandwritten = `Handwritten cards: ${freeCard} each`;
  const memberHandwritten = `Handwritten cards: ${memberCard} each`;

  return [
    {
      id: LAUNCH_PRICING.free.id,
      name: LAUNCH_PRICING.free.label,
      tagline: LAUNCH_PRICING.free.tagline,
      priceAmount: "$0",
      pricePeriod: "",
      description: LAUNCH_PRICING.free.tagline,
      highlight: false,
      perks: LAUNCH_PRICING.free.perks,
      handwrittenCardLine: freeHandwritten,
      price: "$0",
      period: "",
      cardPriceLabel: PRICING_MESSAGING.freeCardPrice(freeCard),
    },
    {
      id: LAUNCH_PRICING.conciergeMember.id,
      name: LAUNCH_PRICING.conciergeMember.label,
      tagline: LAUNCH_PRICING.conciergeMember.tagline,
      priceAmount: memberMonthlyAmount,
      pricePeriod: "/month",
      annualPrice: memberAnnual,
      description: LAUNCH_PRICING.conciergeMember.tagline,
      highlight: Boolean(LAUNCH_PRICING.conciergeMember.highlight),
      badge: LAUNCH_PRICING.conciergeMember.badge,
      perks: LAUNCH_PRICING.conciergeMember.perks,
      handwrittenCardLine: memberHandwritten,
      price: memberMonthlyAmount,
      period: "/month",
      secondaryPrice: memberAnnual,
      cardPriceLabel: PRICING_MESSAGING.currentMemberCardPrice(memberCard),
    },
  ];
}

export function getCheckoutCardPrice(isMember: boolean): string {
  return isMember ? getMemberHandwrittenCardPrice() : getFreeHandwrittenCardPrice();
}

export function getMemberSavingsAtCheckoutHeadline(): string {
  return PRICING_MESSAGING.memberSavingsAtCheckout(getMemberCardSavingsAmount());
}

export function getMemberSavingsAtCheckoutBody(): string {
  return PRICING_MESSAGING.cardSavingsBody;
}

export function resolveLegacyPlanMonthlyCents(planKey: LegacyPlanKey): number {
  return LEGACY_SUBSCRIPTION_PRICING[planKey].monthlyCents;
}

export function resolvePlanDisplayPrice(
  planKey: Plan,
  stripePlans?: StripePlanRow[],
): string {
  if (planKey === "free") return "Free";
  if (planKey === "concierge_member") {
    const stripe = stripePlans?.find((row) => row.planKey === planKey);
    if (stripe?.unitAmount) return formatMonthlyPrice(stripe.unitAmount);
    return getMemberMonthlyPrice();
  }
  const stripe = stripePlans?.find((row) => row.planKey === planKey);
  if (stripe?.unitAmount) {
    return formatMonthlyPrice(stripe.unitAmount);
  }
  return formatMonthlyPrice(resolveLegacyPlanMonthlyCents(planKey as LegacyPlanKey));
}

export function getHandwrittenCardPriceLabel(isMember: boolean): string {
  if (isMember) {
    return PRICING_MESSAGING.currentMemberCardPrice(getMemberHandwrittenCardPrice());
  }
  return PRICING_MESSAGING.freeCardPrice(getFreeHandwrittenCardPrice());
}

export type PricingCopyKey = keyof typeof PRICING_COPY_REGISTRY_DEFAULTS;

export function getMemberCardSavingsHeadline(): string {
  return PRICING_MESSAGING.cardSavingsHeadline(
    getMemberHandwrittenCardPrice(),
    getFreeHandwrittenCardPrice(),
  );
}

/** Prefer dynamic savings amount; falls back to admin copy when keyed */
export function getCardSavingsCheckoutHeadline(): string {
  return getMemberSavingsAtCheckoutHeadline();
}

export function getCardSavingsCheckoutBody(): string {
  return getPricingCopy("pricing.cardSavingsBody");
}

export function getPricingCopy(key: PricingCopyKey): string {
  const entry = COPY_REGISTRY.find((item) => item.id === key);
  if (!entry) return PRICING_COPY_REGISTRY_DEFAULTS[key];
  return resolveCopyValue(entry, readCopyOverrides());
}
