import { ROUTE_PATHS } from "@/app/routes/routePaths";
import { PRESERVED_AI_API_INTEGRATIONS } from "@/app/ai-automation/aiAutomationDomain";
import { CONCIERGE_API_INTEGRATION_POINTS } from "@/app/ai-concierge/aiConciergeDomain";
import { NOTIFICATIONS_API_INTEGRATION_POINTS } from "@/app/notification/notificationsPageDomain";
import { SEARCH_API_INTEGRATION_POINTS } from "@/app/search/searchPageDomain";
import { SETTINGS_API_INTEGRATION_POINTS } from "@/app/settings/settingsVerificationDomain";

export const verificationBreakpoints = ["desktop", "tablet", "mobile"] as const;

export type VerificationBreakpoint = (typeof verificationBreakpoints)[number];

export const verificationCategories = [
  "responsive",
  "accessibility",
  "motion",
  "design",
  "api",
  "performance",
  "security",
] as const;

export type VerificationCategory = (typeof verificationCategories)[number];

export interface ResponsiveSurface {
  id: string;
  label: string;
  route: string;
  fiSurface?: string;
}

export interface VerificationCheckResult {
  id: string;
  category: VerificationCategory;
  description: string;
  passes: boolean;
  group?: string;
  href?: string;
  note?: string;
}

export const systemVerificationDefaults = {
  title: "System verification",
  subtitle:
    "Phase 9 audit dashboard — responsive surfaces, accessibility, motion, design consistency, API preservation, performance, and security.",
  summaryTitle: "Verification summary",
  responsiveTitle: "Responsive design audit",
  accessibilityTitle: "Accessibility audit",
  motionTitle: "Motion audit",
  designTitle: "Design consistency audit",
  apiTitle: "API integration preservation",
  performanceTitle: "Performance verification",
  securityTitle: "Security verification",
  manualQaNote:
    "Automated checks confirm Fi wiring and preserved contracts. Complete manual QA on each linked route before launch.",
  skipLinkLabel: "Skip to main content",
} as const;

export const responsiveSurfaces: ResponsiveSurface[] = [
  { id: "dashboard", label: "Dashboard", route: ROUTE_PATHS.dashboard, fiSurface: "FiDashboardPage" },
  {
    id: "relationship-profile",
    label: "Relationship profile",
    route: ROUTE_PATHS.relationship,
    fiSurface: "FiRelationshipPage",
  },
  {
    id: "card-creation",
    label: "Card creation",
    route: ROUTE_PATHS.cardsGenerate,
    fiSurface: "FiCardCreation flows",
  },
  { id: "recipients", label: "Recipients", route: ROUTE_PATHS.people, fiSurface: "FiPeoplePage" },
  { id: "calendar", label: "Calendar / moments", route: ROUTE_PATHS.moments, fiSurface: "FiMomentsPage" },
  { id: "autopilot", label: "Autopilot", route: ROUTE_PATHS.autopilot, fiSurface: "FiAutopilotPage" },
  {
    id: "settings",
    label: "Settings",
    route: ROUTE_PATHS.settingsAccount,
    fiSurface: "FiSettingsShell",
  },
  { id: "authentication", label: "Authentication", route: ROUTE_PATHS.login, fiSurface: "FiAuth pages" },
  { id: "onboarding", label: "Onboarding", route: ROUTE_PATHS.onboarding, fiSurface: "FiOnboarding" },
  { id: "billing", label: "Billing", route: ROUTE_PATHS.settingsBilling, fiSurface: "FiBillingPage" },
  {
    id: "notifications",
    label: "Notifications",
    route: ROUTE_PATHS.notifications,
    fiSurface: "FiNotificationsPage",
  },
  { id: "search", label: "Search", route: ROUTE_PATHS.search, fiSurface: "FiSearchPage" },
  { id: "concierge", label: "AI Concierge", route: ROUTE_PATHS.concierge, fiSurface: "FiAiConciergePage" },
  { id: "admin", label: "Admin", route: ROUTE_PATHS.admin, fiSurface: "FiAdminPage" },
];

export const SYSTEM_API_INTEGRATION_POINTS = [
  ...SETTINGS_API_INTEGRATION_POINTS,
  ...NOTIFICATIONS_API_INTEGRATION_POINTS,
  ...SEARCH_API_INTEGRATION_POINTS,
  ...CONCIERGE_API_INTEGRATION_POINTS,
  ...PRESERVED_AI_API_INTEGRATIONS,
  "auth-context: login, signup, logout, session, upgradePlan",
  "ProtectedRoute / PublicRoute / OnboardingRoute guards",
  "lib/data: recipients, cards, briefings, personal settings",
  "lib/admin-data: queue, customers, analytics (admin tabs)",
  "Stripe: GET /api/stripe/plans, POST /api/stripe/checkout",
  "Handwrytten: GET /api/handwrytten-fonts",
  "lib/automation.ts — runAutopilot() (unchanged)",
] as const;

export const securityVerificationChecks = [
  { id: "auth-protection", description: "Protected routes require authenticated session" },
  { id: "admin-guard", description: "Admin console remains behind protected routing" },
  { id: "secure-logout", description: "Logout clears client session state via auth-context" },
  { id: "api-via-services", description: "API calls route through app/api services" },
  { id: "no-secret-display", description: "Sensitive tokens are not rendered in Fi UI" },
  { id: "csrf-delegation", description: "CSRF handled by existing server contracts" },
  { id: "xss-escaping", description: "User content rendered through React escaping" },
] as const;

export const performanceVerificationSurfaces = [
  { id: "shell", label: "Application shell", route: ROUTE_PATHS.dashboard },
  { id: "navigation", label: "Navigation", route: ROUTE_PATHS.dashboard },
  { id: "auth", label: "Authentication", route: ROUTE_PATHS.login },
  { id: "onboarding", label: "Onboarding", route: ROUTE_PATHS.onboarding },
  { id: "search-render", label: "Search rendering", route: ROUTE_PATHS.search },
  { id: "concierge-render", label: "AI Concierge rendering", route: ROUTE_PATHS.concierge },
  { id: "notifications-render", label: "Notification rendering", route: ROUTE_PATHS.notifications },
  { id: "billing-render", label: "Billing rendering", route: ROUTE_PATHS.settingsBilling },
] as const;
