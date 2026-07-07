import { ROUTE_PATHS } from "@/app/routes/routePaths";
import { LEGACY_PLAN_ORDER, PLANS, type LegacyPlan, type Plan } from "@/lib/plan";

export const BILLING_ATTENTION_KEY = "fi_forgot_billing_attention";

/** Legacy tiers shown in billing settings for grandfathered subscribers */
export const PLAN_ORDER: Plan[] = LEGACY_PLAN_ORDER;

export type PlanChangeIntent = "upgrade" | "downgrade" | "cancel";

export interface StripePlanRow {
  planKey: Plan;
  priceId: string;
  unitAmount: number;
}

export interface BillingUsageSummary {
  activeRecipients: number;
  recipientLimit: number | null;
  cardsUsedThisYear: number;
  cardLimit: number;
}

export interface BillingSnapshot {
  plan: Plan | null;
  hasPlan: boolean;
  usage: BillingUsageSummary;
  renewalLabel: string;
  stripePlansLoaded: boolean;
  stripeReady: boolean;
}

export const billingDefaults = {
  title: "Billing",
  description: "Manage your plan, payment method, and billing history.",
  subscribeTitle: "Upgrade your Relationship Membership",
  subscribeSubtitle:
    "Your Relationship Concierge remembers the people who matter — unlimited relationships, unlimited memories, and member pricing on handwritten cards. Cancel anytime.",
  checkoutSuccessTitle: "You're all set",
  checkoutSuccessSubtitle:
    "Your Relationship Membership is active. Your concierge is ready to help you stay connected.",
  checkoutSuccessRedirect: "Taking you to your dashboard…",
  goToDashboardLabel: "Go to dashboard",
  exploreFirstLabel: "Continue with Free",
  changePlanNote: "Your Relationship Concierge grows with you — change or cancel anytime from Billing.",
  currentPlanTitle: "Current support level",
  noPlanTitle: "No active plan yet",
  noPlanDescription:
    "You're on the Free plan — one relationship with full concierge support. Upgrade when you're ready for unlimited people.",
  viewPlansLabel: "View plans",
  usageTitle: "Usage this year",
  renewalTitle: "Renewal",
  renewalEstimateNote: "Estimated renewal date based on your billing cycle.",
  paymentMethodTitle: "Payment method",
  paymentMethodEmpty: "No payment method on file yet.",
  paymentMethodEmptyHint: "You will add a payment method when you choose or update a plan.",
  updatePaymentLabel: "Update payment method",
  billingHistoryTitle: "Billing history",
  invoiceHistoryTitle: "Invoices",
  historyEmpty: "Invoices and receipts will appear here once billing is connected.",
  planChangeTitle: "Change your level of support",
  upgradeLabel: "Add more coverage",
  downgradeLabel: "Adjust coverage",
  cancelTitle: "Pause or cancel",
  cancelDescription:
    "If you cancel, your concierge support continues until the end of your current billing period. Your people, cards, and memories remain saved.",
  cancelCtaLabel: "Review cancellation options",
  retryPaymentLabel: "Retry payment",
  paymentAttentionTitle: "Your subscription needs attention",
  paymentAttentionDescription:
    "We could not complete the latest payment. Update your payment method to keep your concierge support active.",
  dismissNoticeLabel: "Dismiss for now",
  stripeVerifyTitle: "Stripe connection",
  stripeVerifyReady: "Plan checkout is connected and ready.",
  stripeVerifyLoading: "Verifying plan availability…",
  stripeVerifyError: "We could not reach billing services right now.",
  stripeVerifyEmpty: "Plans are not available yet. Please try again shortly.",
  choosePlanLabel: (label: string) => `Choose ${label}`,
  checkingOutLabel: "Taking you to checkout…",
  comingSoonLabel: "Coming soon",
  upgradeDialogTitle: "Add more room for the people who matter",
  downgradeDialogTitle: "Adjust your level of support",
  cancelDialogTitle: "Cancel concierge support?",
  cancelDialogDescription:
    "Your access continues through the end of your billing period. You can return anytime — your relationships and drafts stay safe.",
  confirmChangeLabel: "Continue to checkout",
  confirmCancelLabel: "I understand",
  devBypassHint: "Development build — checkout is simulated locally.",
} as const;

export const BILLING_ROUTES = {
  settings: ROUTE_PATHS.settingsBilling,
  subscribe: ROUTE_PATHS.subscribe,
  checkoutSuccess: ROUTE_PATHS.checkoutSuccess,
} as const;
