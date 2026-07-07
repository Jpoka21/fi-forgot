import { ROUTE_PATHS } from "@/app/routes/routePaths";

export type RouteAccess =
  | "public"
  | "protected"
  | "onboarding"
  | "redirect"
  | "error"
  | "not-found";

export interface RouteDefinition {
  path: string;
  access: RouteAccess;
  description: string;
}

/**
 * Canonical route registry for the application shell.
 * Rendering remains in `AppRoutes.tsx` to preserve wouter-specific guards and redirects.
 */
export const ROUTE_DEFINITIONS: RouteDefinition[] = [
  { path: ROUTE_PATHS.home, access: "public", description: "Marketing landing" },
  { path: ROUTE_PATHS.login, access: "public", description: "Personal sign in" },
  { path: ROUTE_PATHS.signup, access: "public", description: "Personal sign up" },
  { path: ROUTE_PATHS.onboarding, access: "onboarding", description: "First conversation onboarding" },
  { path: ROUTE_PATHS.dashboard, access: "protected", description: "Relationship dashboard" },
  { path: ROUTE_PATHS.recipients, access: "redirect", description: "Legacy recipients index" },
  { path: ROUTE_PATHS.recipientProfile, access: "protected", description: "Recipient profile or redirect" },
  { path: ROUTE_PATHS.relationship, access: "protected", description: "Relationship profile" },
  { path: ROUTE_PATHS.briefing, access: "protected", description: "Event briefing" },
  { path: ROUTE_PATHS.briefingDetail, access: "protected", description: "Event briefing detail" },
  { path: ROUTE_PATHS.cardsGenerate, access: "protected", description: "Card generator" },
  { path: ROUTE_PATHS.cardsReview, access: "protected", description: "Cards review queue" },
  { path: ROUTE_PATHS.browniePoints, access: "redirect", description: "Legacy brownie points redirect" },
  { path: ROUTE_PATHS.people, access: "protected", description: "Your people" },
  { path: ROUTE_PATHS.moments, access: "protected", description: "Upcoming moments" },
  { path: ROUTE_PATHS.autopilot, access: "protected", description: "Autopilot dashboard" },
  { path: ROUTE_PATHS.quickCard, access: "protected", description: "Quick card flow" },
  { path: ROUTE_PATHS.settingsReminders, access: "protected", description: "Reminder settings" },
  { path: ROUTE_PATHS.settingsAccount, access: "protected", description: "Account settings" },
  { path: ROUTE_PATHS.settingsRelationship, access: "protected", description: "Relationship preferences" },
  { path: ROUTE_PATHS.settingsBilling, access: "protected", description: "Billing and subscriptions" },
  { path: ROUTE_PATHS.notifications, access: "protected", description: "Notifications and communication history" },
  { path: ROUTE_PATHS.search, access: "protected", description: "Global search and discovery" },
  { path: ROUTE_PATHS.concierge, access: "protected", description: "AI Relationship Concierge workspace" },
  { path: ROUTE_PATHS.systemVerification, access: "protected", description: "Phase 9 system verification dashboard" },
  { path: ROUTE_PATHS.launchReadiness, access: "protected", description: "Phase 10 launch readiness dashboard" },
  { path: ROUTE_PATHS.admin, access: "protected", description: "Admin console" },
  { path: ROUTE_PATHS.try, access: "public", description: "Try it free card flow" },
  { path: ROUTE_PATHS.tryLegacy, access: "redirect", description: "Legacy try path redirect" },
  { path: ROUTE_PATHS.subscribe, access: "public", description: "Subscription checkout" },
  { path: ROUTE_PATHS.checkoutSuccess, access: "public", description: "Stripe checkout success" },
  { path: ROUTE_PATHS.demo, access: "public", description: "Demo preview" },
  { path: ROUTE_PATHS.business, access: "public", description: "Business marketing" },
  { path: ROUTE_PATHS.businessDemo, access: "public", description: "Business demo" },
  { path: ROUTE_PATHS.businessSampleCards, access: "public", description: "Business sample cards" },
  { path: ROUTE_PATHS.businessSignup, access: "public", description: "Business signup" },
  { path: ROUTE_PATHS.businessLogin, access: "public", description: "Business login" },
  { path: ROUTE_PATHS.businessCreateWorkspace, access: "public", description: "Create business workspace" },
  { path: ROUTE_PATHS.businessDashboard, access: "public", description: "Business dashboard" },
  { path: ROUTE_PATHS.businessApprove, access: "public", description: "Business approval deep link" },
  { path: ROUTE_PATHS.cardPreview, access: "public", description: "Card preview deep link" },
  { path: ROUTE_PATHS.error, access: "error", description: "Recoverable route error" },
  { path: "*", access: "not-found", description: "Unknown path catch-all" },
];

export const PUBLIC_ROUTE_PATHS = ROUTE_DEFINITIONS.filter((route) => route.access === "public").map(
  (route) => route.path,
);

export const PROTECTED_ROUTE_PATHS = ROUTE_DEFINITIONS.filter(
  (route) => route.access === "protected",
).map((route) => route.path);
