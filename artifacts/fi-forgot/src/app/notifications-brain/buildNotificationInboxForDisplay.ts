import type { ApiResult } from "@/app/api/shared/types";
import type { FiNotification } from "@/app/notification/notificationDomain";
import {
  loadArchivedNotifications,
  loadNotificationInbox,
} from "@/app/notification/notificationEngine";
import { adaptNotificationViewModelToFiNotification } from "@/app/notifications-brain/adaptNotificationViewModelToFiNotification";
import { applyLocalNotificationOverrides } from "@/app/notifications-brain/applyLocalNotificationOverrides";
import { fetchNotifications } from "@/app/notifications-brain/fetchNotifications";
import {
  mapNotificationViewModel,
  mapNotificationsViewModels,
} from "@/app/notifications-brain/mapNotificationViewModel";
import { isBrainNotificationsEnabled } from "@/app/notifications-brain/notificationsBrainConfig";
import type { NotificationsResponse } from "@/app/notifications-brain/notificationsTypes";

export type FetchNotifications = () => Promise<ApiResult<NotificationsResponse>>;

export interface BuildNotificationInboxForDisplayOptions {
  archive?: boolean;
}

export interface BuildNotificationInboxForDisplayDeps {
  brainEnabled?: boolean;
  fetchNotifications?: FetchNotifications;
  loadLegacyInbox?: () => FiNotification[];
  loadLegacyArchive?: () => FiNotification[];
}

export async function buildNotificationInboxForDisplay(
  options: BuildNotificationInboxForDisplayOptions = {},
  deps: BuildNotificationInboxForDisplayDeps = {},
): Promise<FiNotification[]> {
  const archive = options.archive ?? false;
  const brainEnabled = deps.brainEnabled ?? isBrainNotificationsEnabled();

  if (!brainEnabled) {
    const loader = archive
      ? (deps.loadLegacyArchive ?? loadArchivedNotifications)
      : (deps.loadLegacyInbox ?? loadNotificationInbox);
    return loader();
  }

  const fetchBrainNotifications = deps.fetchNotifications ?? fetchNotifications;

  try {
    const result = await fetchBrainNotifications();
    if (!result.ok || !result.data) {
      if (import.meta.env?.DEV) {
        console.error("Failed to load Brain notifications", result.error);
      }
      return [];
    }

    const viewModels = mapNotificationsViewModels(result.data.notifications);
    const notifications = viewModels.map(adaptNotificationViewModelToFiNotification);
    return applyLocalNotificationOverrides(notifications, { archive });
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.error(error);
    }
    return [];
  }
}

export { mapNotificationViewModel };
