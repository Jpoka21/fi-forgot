export type FiRelationshipHealthLevel =
  | "Excellent"
  | "Healthy"
  | "NeedsAttention"
  | "Priority";

export type FiCalendarBadgeStatus =
  | "upcoming"
  | "sent"
  | "draft"
  | "missed"
  | "autopilot";

export type FiPriorityLevel = "high" | "medium" | "low";

export type FiSubscriptionStatus = "active" | "trial" | "paused" | "canceled";

export const fiRelationshipHealthLevels = [
  "Excellent",
  "Healthy",
  "NeedsAttention",
  "Priority",
] as const;

export const fiCalendarBadgeStatuses = [
  "upcoming",
  "sent",
  "draft",
  "missed",
  "autopilot",
] as const;

export const fiPriorityLevels = ["high", "medium", "low"] as const;

export const fiSubscriptionStatuses = [
  "active",
  "trial",
  "paused",
  "canceled",
] as const;

export const relationshipHealthLabels: Record<FiRelationshipHealthLevel, string> = {
  Excellent: "Excellent",
  Healthy: "Healthy",
  NeedsAttention: "Needs Attention",
  Priority: "Priority",
};

export const calendarBadgeLabels: Record<FiCalendarBadgeStatus, string> = {
  upcoming: "Upcoming",
  sent: "Sent",
  draft: "Draft",
  missed: "Missed",
  autopilot: "Autopilot",
};

export const priorityBadgeLabels: Record<FiPriorityLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const subscriptionBadgeLabels: Record<FiSubscriptionStatus, string> = {
  active: "Active",
  trial: "Trial",
  paused: "Paused",
  canceled: "Canceled",
};

export function resolveRelationshipHealthLevel(score: number): FiRelationshipHealthLevel {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Healthy";
  if (score >= 45) return "NeedsAttention";
  return "Priority";
}

export function formatNotificationCount(count: number): string {
  if (count <= 0) return "0";
  if (count > 99) return "99+";
  return String(count);
}

export function formatBrowniePoints(points: number): string {
  if (points <= 0) return "0";
  if (points > 999) return "999+";
  return String(points);
}
