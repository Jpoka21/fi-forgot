import { ROUTE_PATHS } from "@/app/routes/routePaths";
import { SYSTEM_API_INTEGRATION_POINTS } from "@/app/verification/systemVerificationDomain";

export const launchReadinessCategories = [
  "finalUi",
  "production",
  "crossBrowser",
  "uxReview",
] as const;

export type LaunchReadinessCategory = (typeof launchReadinessCategories)[number];

export interface LaunchReadinessCheck {
  id: string;
  category: LaunchReadinessCategory;
  description: string;
  passes: boolean;
  manual?: boolean;
  note?: string;
  href?: string;
}

export const launchReadinessDefaults = {
  title: "Launch readiness",
  subtitle:
    "Phase 10 final audit — production confidence, cross-browser signoff, and Relationship Concierge experience review.",
  summaryTitle: "Readiness summary",
  finalUiTitle: "Final UI audit",
  productionTitle: "Production readiness",
  crossBrowserTitle: "Cross-browser testing",
  uxReviewTitle: "Final user experience review",
  manualSignoffNote:
    "Items marked Manual require human signoff in staging before production release.",
  systemVerificationLabel: "Open system verification",
  launchReadinessLabel: "Open launch readiness",
  buildCommand: "npm run build",
  typecheckCommand: "npm run typecheck",
  lintCommand: "npm run lint",
} as const;

export const criticalLaunchRoutes = [
  { id: "dashboard", label: "Dashboard", path: ROUTE_PATHS.dashboard },
  { id: "people", label: "Recipients / People", path: ROUTE_PATHS.people },
  { id: "cards", label: "Card creation", path: ROUTE_PATHS.cardsGenerate },
  { id: "autopilot", label: "Autopilot", path: ROUTE_PATHS.autopilot },
  { id: "settings", label: "Account settings", path: ROUTE_PATHS.settingsAccount },
  { id: "billing", label: "Billing", path: ROUTE_PATHS.settingsBilling },
  { id: "notifications", label: "Notifications", path: ROUTE_PATHS.notifications },
  { id: "search", label: "Search", path: ROUTE_PATHS.search },
  { id: "concierge", label: "AI Concierge", path: ROUTE_PATHS.concierge },
  { id: "admin", label: "Admin", path: ROUTE_PATHS.admin },
  { id: "auth", label: "Authentication", path: ROUTE_PATHS.login },
  { id: "onboarding", label: "Onboarding", path: ROUTE_PATHS.onboarding },
] as const;

export const crossBrowserTargets = [
  "Chrome",
  "Edge",
  "Safari",
  "Firefox",
  "Mobile Safari",
  "Chrome Android",
] as const;

export const uxReviewCriteria = [
  "Product feels like a Relationship Concierge",
  "Product does not feel like a greeting card application",
  "Product does not feel like a reminder application",
  "Product does not feel like an AI tool",
  "Navigation feels effortless",
  "Every workflow feels calm",
  "Every interaction builds trust",
  "Every screen feels premium",
  "Every recommendation feels thoughtful",
  "AI remains invisible",
  "Relationships remain the center of the experience",
  "Cards feel like a natural outcome of caring",
] as const;

/**
 * Preserved contracts — launch polish must not alter these surfaces.
 */
export const LAUNCH_PRESERVED_INTEGRATIONS = SYSTEM_API_INTEGRATION_POINTS;
