/**
 * Central pricing configuration for F.I. Forgot.
 *
 * All currency display and launch pricing labels should read from this module.
 * Do not hardcode dollar amounts in UI components.
 *
 * LEGACY NOTE: Production Stripe may still expose basic/standard/premium products
 * at $6/$15/$29 until those products are manually updated in Stripe Dashboard.
 * TODO(stripe-migration): Create Concierge Membership products ($9.99/mo, $99/yr)
 * with metadata.planKey = "concierge_member" and archive legacy tier products
 * only after existing subscribers are migrated or grandfathered.
 */

export const PRICING_CURRENCY = "USD" as const;

/** Launch pricing phase identifier — swap labels via `launchPhase` when running promos */
export const PRICING_LAUNCH_PHASE = "launch" as const;

export interface LaunchTierConfig {
  id: string;
  label: string;
  tagline: string;
  relationshipLimit: number | null;
  handwrittenCardCents: number;
  monthlyCents?: number;
  annualCents?: number;
  perks: readonly string[];
  highlight?: boolean;
  badge?: string;
}

/** Launch pricing: Free + Concierge Membership */
export const LAUNCH_PRICING = {
  phase: PRICING_LAUNCH_PHASE,
  free: {
    id: "free",
    label: "Free",
    tagline: "Perfect for one important relationship.",
    relationshipLimit: 1,
    handwrittenCardCents: 999,
    perks: [
      "One relationship",
      "Unlimited AI Concierge",
      "Unlimited memories",
      "Relationship timeline",
      "Relationship Health",
      "Unlimited card drafts",
    ],
  },
  conciergeMember: {
    id: "concierge_member",
    label: "Concierge Membership",
    tagline: "Perfect for everyone who matters.",
    relationshipLimit: null,
    handwrittenCardCents: 599,
    monthlyCents: 999,
    annualCents: 9900,
    highlight: true,
    badge: "Relationship Membership",
    perks: [
      "Unlimited relationships",
      "Unlimited AI Concierge",
      "Unlimited memories",
      "Unlimited timelines",
      "Relationship insights",
      "Smart follow ups",
      "Unlimited card drafts",
    ],
  },
} as const;

export const LAUNCH_TIERS = {
  free: LAUNCH_PRICING.free,
  conciergeMember: LAUNCH_PRICING.conciergeMember,
} as const satisfies Record<string, LaunchTierConfig>;

/**
 * Legacy subscription tiers — still used by Stripe checkout (`metadata.planKey`)
 * and existing subscriber entitlements until migration is complete.
 */
export const LEGACY_SUBSCRIPTION_PRICING = {
  basic: {
    planKey: "basic" as const,
    label: "Essential",
    tagline: "Start with one person who matters most.",
    monthlyCents: 600,
    maxRecipients: 1,
    maxCardsPerYear: 6,
    perks: [
      "6 cards per year",
      "1 person",
      "Birthday + anniversary",
      "Personally written messages",
      "We print and mail for you",
    ],
  },
  standard: {
    planKey: "standard" as const,
    label: "Family",
    tagline: "For the people you never want to disappoint.",
    monthlyCents: 1500,
    maxRecipients: 5,
    maxCardsPerYear: 18,
    perks: [
      "18 cards per year",
      "Up to 5 people",
      "All major occasions",
      "Full autopilot available",
      "Warm, personal messages",
    ],
  },
  premium: {
    planKey: "premium" as const,
    label: "Everyone",
    tagline: "For a full circle of people who matter.",
    monthlyCents: 2900,
    maxRecipients: Number.POSITIVE_INFINITY,
    maxCardsPerYear: 40,
    perks: [
      "40 cards per year",
      "Unlimited people",
      "Premium card styles",
      "Gift add-ons",
      "Priority support",
    ],
  },
} as const;

export type LegacyPlanKey = keyof typeof LEGACY_SUBSCRIPTION_PRICING;

/** Margin-safe messaging — never promise permanent pricing */
export const PRICING_MESSAGING = {
  launchPhaseLabel: "Launch pricing",
  memberCardPrice: (formatted: string) => `Member price: ${formatted}`,
  currentMemberCardPrice: (formatted: string) => `Current member price: ${formatted}`,
  launchMemberCardPrice: (formatted: string) => `Launch member price: ${formatted}`,
  freeCardPrice: (formatted: string) => `Handwritten cards: ${formatted} each`,
  memberSavingsPerCard: (formatted: string) => `Members save ${formatted} on every handwritten card`,
  upgradeToMemberTitle: "Upgrade to Concierge Membership",
  upgradeToMemberBody:
    "Unlimited relationships and a lower handwritten card price while membership is active.",
  compareMemberValue: (monthlyFormatted: string, cardSavingsFormatted: string) =>
    `Membership is ${monthlyFormatted}/month — and you save ${cardSavingsFormatted} on every card.`,
  annualValueNote: (annualFormatted: string, monthlyEquivalent: string) =>
    `${annualFormatted}/year (${monthlyEquivalent}/month equivalent)`,
  pricingDisclaimer:
    "Prices shown reflect our current launch offering and may change. Existing subscribers keep their active plan terms until changed in billing.",
  relationshipUpgradeTitle: "You're building something special.",
  relationshipUpgradeBody:
    "Your Relationship Concierge can remember every important person in your life.",
  relationshipUpgradeCta: "Upgrade to Concierge Membership to add unlimited people.",
  cardSavingsHeadline: (memberFormatted: string, freeFormatted: string) =>
    `Members currently send handwritten cards for ${memberFormatted} instead of ${freeFormatted}.`,
  memberSavingsAtCheckout: (amountFormatted: string) =>
    `Members currently save ${amountFormatted} on every handwritten card.`,
  cardSavingsBody: "Upgrade before checkout to receive today's member pricing.",
  continueAtFreeCardPrice: (formatted: string) => `Continue at ${formatted}`,
  membershipBrandLabel: "Relationship Membership",
  conciergeBrandLabel: "Relationship Concierge",
} as const;

/** Optional promotional overrides — set `active: true` and adjust cents for a promo window */
export const PROMOTIONAL_PRICING = {
  active: false,
  label: "",
  memberMonthlyCents: null as number | null,
  memberAnnualCents: null as number | null,
  memberCardCents: null as number | null,
  freeCardCents: null as number | null,
} as const;

/** Admin-editable copy keys (defaults mirror PRICING_MESSAGING; override via admin Copy registry) */
export const PRICING_COPY_REGISTRY_DEFAULTS = {
  "pricing.launchPhaseLabel": PRICING_MESSAGING.launchPhaseLabel,
  "pricing.upgradeToMemberTitle": PRICING_MESSAGING.upgradeToMemberTitle,
  "pricing.upgradeToMemberBody": PRICING_MESSAGING.upgradeToMemberBody,
  "pricing.pricingDisclaimer": PRICING_MESSAGING.pricingDisclaimer,
  "pricing.landingEyebrow": "Hire your Relationship Concierge",
  "pricing.landingTitle": "Two simple ways to stay connected",
  "pricing.landingSubtitle": "Start free with one person who matters. Upgrade when your circle grows.",
  "pricing.relationshipUpgradeTitle": PRICING_MESSAGING.relationshipUpgradeTitle,
  "pricing.relationshipUpgradeBody": PRICING_MESSAGING.relationshipUpgradeBody,
  "pricing.relationshipUpgradeCta": PRICING_MESSAGING.relationshipUpgradeCta,
  "pricing.cardSavingsHeadline": "Members currently save $4.00 on every handwritten card.",
  "pricing.cardSavingsBody": PRICING_MESSAGING.cardSavingsBody,
} as const;
