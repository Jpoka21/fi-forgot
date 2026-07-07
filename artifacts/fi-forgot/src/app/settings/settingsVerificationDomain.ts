import { ROUTE_PATHS } from "@/app/routes/routePaths";

export const settingsVerificationDefaults = {
  loadingLabel: "Loading settings",
  errorTitle: "Settings couldn't load",
  errorDescription: "Something interrupted loading your settings. Your saved preferences are still safe.",
  retryLabel: "Try again",
  emptyTitle: "Nothing here yet",
  emptyDescription: "When you add details, they'll appear here — calmly and clearly.",
  offlineNotice: "You're offline. You can still review settings, but some updates may wait until you're back online.",
  apiNotice: "Handwriting previews load from your existing Handwrytten connection when online.",
} as const;

export interface SettingsNavItem {
  id: string;
  label: string;
  href: string;
  description: string;
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    id: "account",
    label: "Account",
    href: ROUTE_PATHS.settingsAccount,
    description: "Profile, security, and appearance",
  },
  {
    id: "relationship",
    label: "Relationship",
    href: ROUTE_PATHS.settingsRelationship,
    description: "Concierge, cards, and privacy",
  },
  {
    id: "billing",
    label: "Billing",
    href: ROUTE_PATHS.settingsBilling,
    description: "Plan, payment method, and invoices",
  },
  {
    id: "reminders",
    label: "Reminders",
    href: ROUTE_PATHS.settingsReminders,
    description: "Reminder timing and legacy preferences",
  },
  {
    id: "autopilot",
    label: "Autopilot",
    href: ROUTE_PATHS.autopilot,
    description: "Automation and card approval",
  },
];

/**
 * Settings verification — preserved integration surfaces (read-only documentation).
 * Do not alter these contracts during verification polish.
 */
export const SETTINGS_API_INTEGRATION_POINTS = [
  "auth-context: login, logout, updateMailingAddress, workspaces",
  "lib/data: getPersonalSettings, savePersonalSettings",
  "GET /api/handwrytten-fonts (relationship handwriting previews)",
  "GET /api/stripe/plans, POST /api/stripe/checkout (billing checkout)",
  "POST /api/admin/generate-message, POST /api/admin/suggest-card (AI admin)",
  "lib/automation.ts — runAutopilot() (automation admin)",
  "localStorage: fi_forgot_account_prefs, fi_forgot_relationship_prefs, fi_forgot_user",
] as const;
