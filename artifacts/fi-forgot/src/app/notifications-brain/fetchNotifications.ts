import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { ApiRequestConfig } from "@/app/api/shared/types";
import type { NotificationsResponse } from "@/app/notifications-brain/notificationsTypes";

export function fetchNotifications(
  config: Pick<ApiRequestConfig, "userId" | "throwOnError" | "retries"> = {},
) {
  return apiFetch<NotificationsResponse>(API_ENDPOINTS.notifications.inbox, config);
}
