export type Plan = "basic" | "standard" | "premium";

export interface PlanConfig {
  label: string;
  tagline: string;
  price: string;
  maxRecipients: number;
  maxCardsPerYear: number;
  perks: string[];
  /** Occasions allowed on this plan. null = all occasions allowed. */
  allowedOccasions: string[] | null;
}

export const PLANS: Record<Plan, PlanConfig> = {
  basic: {
    label: "Bare Minimum",
    tagline: "For the guy trying not to screw this up.",
    price: "$6/mo",
    maxRecipients: 1,
    maxCardsPerYear: 6,
    perks: ["6 cards per year", "1 recipient", "Birthday + anniversary coverage", "Personally written messages", "We print and mail them for you"],
    allowedOccasions: ["Birthday", "Anniversary"],
  },
  standard: {
    label: "Domestic Peacekeeper",
    tagline: "For wives, moms, kids, and damage control.",
    price: "$15/mo",
    maxRecipients: 5,
    maxCardsPerYear: 18,
    perks: ["18 cards per year", "Up to 5 recipients", "All major occasions covered", "Full autopilot mode", "Personalized, heartfelt messages"],
    allowedOccasions: null,
  },
  premium: {
    label: "Legend Status",
    tagline: "For the man determined to never sleep on the couch again.",
    price: "$29/mo",
    maxRecipients: Infinity,
    maxCardsPerYear: 40,
    perks: ["40 cards per year", "Unlimited recipients", "Premium card styles", "Gift add-ons", "Emergency save mode", "Concierge reminders"],
    allowedOccasions: null,
  },
};

export function getRecipientLimit(plan: Plan): number {
  return PLANS[plan].maxRecipients;
}

export function canActivateRecipient(plan: Plan, activeCount: number): boolean {
  return activeCount < getRecipientLimit(plan);
}

export function limitLabel(plan: Plan): string {
  const limit = PLANS[plan].maxRecipients;
  return limit === Infinity ? "unlimited" : String(limit);
}
