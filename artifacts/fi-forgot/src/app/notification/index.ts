export {
  fiNotificationCategories,
  fiNotificationFilterOptions,
  fiNotificationReadStates,
  fiNotificationTimeGroups,
  notificationCategoryLabels,
  notificationDefaults,
  notificationFilterCategoryMap,
  seedNotifications,
} from "@/app/notification/notificationDomain";
export type {
  FiNotification,
  FiNotificationAction,
  FiNotificationCategory,
  FiNotificationFilterOption,
  FiNotificationReadState,
  FiNotificationTimeGroup,
} from "@/app/notification/notificationDomain";

export {
  countUnreadNotifications,
  dismissNotification,
  filterNotifications,
  groupNotifications,
  loadArchivedNotifications,
  loadNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  restoreNotification,
  resolveNotificationTimeGroup,
  searchNotifications,
} from "@/app/notification/notificationEngine";

export {
  dismissNotificationId,
  getDismissedNotificationIds,
  getNotificationReadStateMap,
  restoreNotificationId,
  setNotificationReadState,
} from "@/app/notification/notificationStorage";

export {
  buildCommunicationHistory,
  buildCardHistory,
  buildDeliveryHistory,
  buildEmailHistory,
  buildReminderHistory,
} from "@/app/notification/communicationHistoryEngine";

export {
  communicationHistoryEmptyCopy,
  communicationHistoryTabLabels,
  communicationHistoryTabs,
  notificationsPageDefaults,
  notificationsPageSections,
  NOTIFICATIONS_API_INTEGRATION_POINTS,
} from "@/app/notification/notificationsPageDomain";
export type {
  CommunicationHistoryEntry,
  CommunicationHistoryTab,
  NotificationsPageSection,
} from "@/app/notification/notificationsPageDomain";

export { useNotificationsPage } from "@/app/notification/hooks/useNotificationsPage";
export type { NotificationsPageController } from "@/app/notification/hooks/useNotificationsPage";

export { useCommunicationHistory } from "@/app/notification/hooks/useCommunicationHistory";
export type { CommunicationHistoryController } from "@/app/notification/hooks/useCommunicationHistory";

export {
  subscribeToNotificationAnalytics,
  trackNotificationEvent,
} from "@/app/notification/notificationAnalytics";
export type {
  FiNotificationAnalyticsEvent,
  FiNotificationAnalyticsPayload,
} from "@/app/notification/notificationAnalytics";

export {
  NotificationCenterProvider,
  useNotificationCenterContext,
} from "@/app/notification/NotificationCenterProvider";
export { NotificationCenterHost } from "@/app/notification/NotificationCenterHost";

export { useNotificationCenter } from "@/app/notification/hooks/useNotificationCenter";
export type {
  GroupedNotifications,
  NotificationCenterController,
  UseNotificationCenterOptions,
} from "@/app/notification/hooks/useNotificationCenter";
