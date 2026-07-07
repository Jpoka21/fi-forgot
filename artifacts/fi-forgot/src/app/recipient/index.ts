export {
  excerptText,
  formatProfileUpdatedAt,
  mapCardStatusToBadge,
  recipientDefaults,
} from "@/app/recipient/recipientDomain";
export type {
  FiRecipientActivitySummary,
  FiRecipientCardHistoryItem,
  FiRecipientMemoryPreviewItem,
  FiRecipientMilestone,
  FiRecipientProfileSnapshot,
  FiRecipientQuickAction,
  FiRecipientStatusIndicator,
} from "@/app/recipient/recipientDomain";

export { loadRecipientProfile } from "@/app/recipient/recipientEngine";

export {
  subscribeToRecipientAnalytics,
  trackRecipientEvent,
} from "@/app/recipient/recipientAnalytics";
export type {
  FiRecipientAnalyticsEvent,
  FiRecipientAnalyticsPayload,
} from "@/app/recipient/recipientAnalytics";

export { useRecipientProfile } from "@/app/recipient/hooks/useRecipientProfile";
export type {
  RecipientProfileController,
  UseRecipientProfileOptions,
} from "@/app/recipient/hooks/useRecipientProfile";
