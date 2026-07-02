export type Plan = "basic" | "standard" | "premium";

export interface PlanConfig {
  label: string;
  tagline: string;
  price: string;
  maxRecipients: number;
  maxCardsPerYear: number;
  perks: string[];
}

export const PLANS: Record<Plan, PlanConfig> = {
  basic: {
    label: "Essential",
    tagline: "Start with one person who matters most.",
    price: "$6/mo",
    maxRecipients: 1,
    maxCardsPerYear: 6,
    perks: ["6 cards per year", "1 person", "Birthday + anniversary", "Personally written messages", "We print and mail for you"],
  },
  standard: {
    label: "Family",
    tagline: "For the people you never want to disappoint.",
    price: "$15/mo",
    maxRecipients: 5,
    maxCardsPerYear: 18,
    perks: ["18 cards per year", "Up to 5 people", "All major occasions", "Full autopilot available", "Warm, personal messages"],
  },
  premium: {
    label: "Everyone",
    tagline: "For a full circle of people who matter.",
    price: "$29/mo",
    maxRecipients: Infinity,
    maxCardsPerYear: 40,
    perks: ["40 cards per year", "Unlimited people", "Premium card styles", "Gift add-ons", "Priority support"],
  },
};

export function getRecipientLimit(plan: Plan): number {
  return PLANS[plan].maxRecipients;
}

export function canActivateRecipient(plan: Plan, activeCount: number): boolean {
  if (import.meta.env.DEV) return true;
  return activeCount < getRecipientLimit(plan);
}
