export {
  calmOccasionLine,
  cardOutcomeLabel,
  dashboardDefaults,
  greetingForHour,
} from "@/app/dashboard/dashboardDomain";
export type {
  FiDashboardActivityItem,
  FiDashboardAttentionItem,
  FiDashboardHighlight,
  FiDashboardQuickAction,
  FiDashboardSnapshot,
  FiDashboardSpotlight,
  FiDashboardUpcomingCta,
  FiDashboardUpcomingEvent,
  FiDashboardUpcomingOutcome,
  FiDashboardWelcome,
} from "@/app/dashboard/dashboardDomain";

export {
  buildDashboardSnapshot,
  buildUpcomingCardById,
  buildUpcomingCardKeys,
  collectPendingReviewCount,
  isSensitiveDashboardOccasion,
  resolveUpcomingCta,
  resolveUpcomingOutcome,
} from "@/app/dashboard/dashboardEngine";

export {
  subscribeToDashboardAnalytics,
  trackDashboardEvent,
} from "@/app/dashboard/dashboardAnalytics";
export type {
  FiDashboardAnalyticsEvent,
  FiDashboardAnalyticsPayload,
} from "@/app/dashboard/dashboardAnalytics";

export { useDashboard } from "@/app/dashboard/hooks/useDashboard";
export type { DashboardController } from "@/app/dashboard/hooks/useDashboard";
