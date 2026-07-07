import type { LucideIcon } from "lucide-react";
import {
  BookText,
  Bot,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Image,
  LayoutDashboard,
  Library,
  Mail,
  MessageSquare,
  Printer,
  ScrollText,
  Send,
  Tags,
  UserCheck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import { illustrationPaths } from "@/app/design/assets/illustrationPaths";
import { PRICING_COPY_REGISTRY_DEFAULTS } from "@/app/pricing/pricingConfig";

export const ADMIN_EMAILS = ["james.massaro21@gmail.com", "james@fiforgot.com"] as const;
export const ADMIN_NAME_FRAGMENTS = ["massaro", "admin"] as const;

export type AdminTab =
  | "dashboard"
  | "tools"
  | "illustrations"
  | "copy"
  | "ai"
  | "automation"
  | "customers"
  | "recipients"
  | "events"
  | "templates"
  | "messages"
  | "queue"
  | "briefings"
  | "audit"
  | "card-library"
  | "card-metadata"
  | "print-audit"
  | "leads";

export interface AdminTabConfig {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
  description: string;
  group: "overview" | "operations" | "content" | "fulfillment";
}

export const ADMIN_TABS: AdminTabConfig[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview and alerts", group: "overview" },
  { id: "tools", label: "Tools", icon: Wrench, description: "Search and cross-system views", group: "overview" },
  { id: "illustrations", label: "Illustrations", icon: Image, description: "Illustration asset library", group: "content" },
  { id: "copy", label: "Copy", icon: BookText, description: "Product copy and publishing", group: "content" },
  { id: "ai", label: "AI", icon: Bot, description: "AI activity, usage, and prompt surfaces", group: "overview" },
  { id: "automation", label: "Automation", icon: Zap, description: "Autopilot runs, logs, and queue status", group: "overview" },
  { id: "customers", label: "Customers", icon: Users, description: "Manage subscriber accounts", group: "operations" },
  { id: "recipients", label: "Recipients", icon: UserCheck, description: "Mailing addresses and profiles", group: "operations" },
  { id: "events", label: "Events", icon: CalendarDays, description: "Schedules and send dates", group: "operations" },
  { id: "templates", label: "Templates", icon: CreditCard, description: "Handwrytten card catalog", group: "fulfillment" },
  { id: "messages", label: "Messages", icon: MessageSquare, description: "AI drafts and approvals", group: "fulfillment" },
  { id: "queue", label: "Queue", icon: Send, description: "Fulfillment and Handwrytten orders", group: "fulfillment" },
  { id: "briefings", label: "Briefings", icon: ClipboardList, description: "Pre-event customer answers", group: "operations" },
  { id: "audit", label: "Audit Log", icon: ScrollText, description: "All admin actions tracked", group: "operations" },
  { id: "card-library", label: "Card Library", icon: Library, description: "AI card library designs", group: "content" },
  { id: "card-metadata", label: "Card Metadata V2", icon: Tags, description: "V2 metadata audit and backfill", group: "content" },
  { id: "print-audit", label: "Print Readiness", icon: Printer, description: "300 DPI print verification", group: "fulfillment" },
  { id: "leads", label: "Leads", icon: Mail, description: "Demo flow emails captured", group: "operations" },
];

export interface IllustrationAsset {
  id: string;
  path: string;
  category: string;
  title: string;
  alt: string;
}

export const ILLUSTRATION_ASSETS: IllustrationAsset[] = [
  { id: "homepage-hero", path: illustrationPaths.homepage.heroDave, category: "homepage", title: "Dave hero", alt: "Dave in doghouse with calendar and card" },
  { id: "homepage-note", path: illustrationPaths.homepage.handwrittenNote, category: "homepage", title: "Handwritten note", alt: "Handwritten note illustration" },
  { id: "homepage-envelope", path: illustrationPaths.homepage.stampedEnvelope, category: "homepage", title: "Stamped envelope", alt: "Stamped envelope illustration" },
  { id: "auth-hero", path: illustrationPaths.auth.relationshipHero, category: "auth", title: "Auth relationship hero", alt: "Letters, journal, and photograph still life" },
  { id: "onboarding-dave", path: illustrationPaths.onboarding.daveWelcome, category: "onboarding", title: "Dave welcome", alt: "Dave welcome illustration" },
  { id: "loading-learning", path: illustrationPaths.loading.learning, category: "loading", title: "Learning", alt: "Learning moment loading illustration" },
  { id: "loading-writing", path: illustrationPaths.loading.writing, category: "loading", title: "Writing", alt: "Writing card loading illustration" },
  { id: "loading-preparing", path: illustrationPaths.loading.preparing, category: "loading", title: "Preparing", alt: "Preparing card loading illustration" },
  { id: "loading-mailbox", path: illustrationPaths.loading.mailbox, category: "loading", title: "Mailbox", alt: "Mailbox loading illustration" },
  { id: "loading-success", path: illustrationPaths.loading.success, category: "loading", title: "Success", alt: "Success loading illustration" },
  { id: "dashboard-empty", path: illustrationPaths.dashboard.emptyState, category: "dashboard", title: "Dashboard empty", alt: "Dashboard empty state illustration" },
  { id: "people-empty", path: illustrationPaths.people.emptyState, category: "people", title: "People empty", alt: "Memory box empty state" },
  { id: "recipient-header", path: illustrationPaths.recipient.profileHeader, category: "recipient", title: "Recipient profile header", alt: "Recipient profile header illustration" },
  { id: "relationship-header", path: illustrationPaths.relationship.profileHeader, category: "relationship", title: "Relationship header", alt: "Relationship profile header illustration" },
];

export interface CopyEntry {
  id: string;
  group: string;
  label: string;
  defaultValue: string;
  surface: string;
}

export const COPY_REGISTRY: CopyEntry[] = [
  { id: "auth.pitchTitle", group: "Authentication", label: "Auth pitch title", defaultValue: "Everything important is about to be taken care of.", surface: "/login" },
  { id: "auth.signupTitle", group: "Authentication", label: "Signup title", defaultValue: "Start with one person", surface: "/signup" },
  { id: "onboarding.welcomeTitle", group: "Onboarding", label: "Welcome title", defaultValue: "Welcome to your Relationship Concierge", surface: "/onboarding" },
  { id: "billing.subscribeTitle", group: "Billing", label: "Subscribe title", defaultValue: "Choose how much we help", surface: "/subscribe" },
  { id: "billing.settingsDescription", group: "Billing", label: "Billing settings description", defaultValue: "Manage your plan, payment method, and billing history.", surface: "/settings/billing" },
  { id: "dashboard.emptyTitle", group: "Dashboard", label: "Dashboard empty title", defaultValue: "Welcome. Let's build relationships you'll never forget.", surface: "/dashboard" },
  { id: "people.emptyTitle", group: "People", label: "People empty title", defaultValue: "Your people will live here.", surface: "/people" },
  {
    id: "pricing.launchPhaseLabel",
    group: "Pricing",
    label: "Launch phase label",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.launchPhaseLabel"],
    surface: "/#pricing",
  },
  {
    id: "pricing.upgradeToMemberTitle",
    group: "Pricing",
    label: "Upgrade to member title",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.upgradeToMemberTitle"],
    surface: "/subscribe",
  },
  {
    id: "pricing.upgradeToMemberBody",
    group: "Pricing",
    label: "Upgrade to member body",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.upgradeToMemberBody"],
    surface: "/subscribe",
  },
  {
    id: "pricing.pricingDisclaimer",
    group: "Pricing",
    label: "Pricing disclaimer",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.pricingDisclaimer"],
    surface: "/#pricing",
  },
  {
    id: "pricing.landingEyebrow",
    group: "Pricing",
    label: "Landing pricing eyebrow",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.landingEyebrow"],
    surface: "/#pricing",
  },
  {
    id: "pricing.landingTitle",
    group: "Pricing",
    label: "Landing pricing title",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.landingTitle"],
    surface: "/#pricing",
  },
  {
    id: "pricing.landingSubtitle",
    group: "Pricing",
    label: "Landing pricing subtitle",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.landingSubtitle"],
    surface: "/#pricing",
  },
  {
    id: "pricing.relationshipUpgradeTitle",
    group: "Pricing",
    label: "Relationship upgrade title",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.relationshipUpgradeTitle"],
    surface: "/recipients/new",
  },
  {
    id: "pricing.relationshipUpgradeBody",
    group: "Pricing",
    label: "Relationship upgrade body",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.relationshipUpgradeBody"],
    surface: "/recipients/new",
  },
  {
    id: "pricing.relationshipUpgradeCta",
    group: "Pricing",
    label: "Relationship upgrade CTA",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.relationshipUpgradeCta"],
    surface: "/recipients/new",
  },
  {
    id: "pricing.cardSavingsHeadline",
    group: "Pricing",
    label: "Card savings headline",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.cardSavingsHeadline"],
    surface: "/cards-review",
  },
  {
    id: "pricing.cardSavingsBody",
    group: "Pricing",
    label: "Card savings body",
    defaultValue: PRICING_COPY_REGISTRY_DEFAULTS["pricing.cardSavingsBody"],
    surface: "/cards-review",
  },
];

export const COPY_OVERRIDES_KEY = "fi_forgot_admin_copy_overrides";
export const COPY_HISTORY_KEY = "fi_forgot_admin_copy_history";
export const ILLUSTRATION_ACTIVE_KEY = "fi_forgot_illustration_active";

export const adminDefaults = {
  title: "Admin — F.I. Forgot",
  internalBadge: "INTERNAL",
  subtitle: "Handwrytten fulfillment system",
  accessDeniedTitle: "Admin Access Only",
  accessDeniedDescription: "This area is restricted to admin accounts.",
  toolsTitle: "Administrative tools",
  toolsSubtitle: "Search customers and jump to relationships, cards, subscriptions, and activity.",
  illustrationsTitle: "Illustration library",
  illustrationsSubtitle: "Browse, preview, and manage illustration assets used across the product.",
  copyTitle: "Copy management",
  copySubtitle: "Review product copy, preview changes, and track local publishing drafts.",
  searchPlaceholder: "Search customers, recipients, or queue items…",
  systemHealthHealthy: "All core systems operational",
  systemHealthAttention: "Some areas need attention",
  uploadDeferredNotice: "Asset upload and replacement are handled through the static asset pipeline. Use preview and activation flags until a CMS endpoint is available.",
  publishDraftLabel: "Save draft",
  publishLabel: "Publish locally",
  previewLabel: "Preview",
  versionHistoryLabel: "Version history",
  noResultsLabel: "No matches found",
  loadingLabel: "Loading admin console",
} as const;
