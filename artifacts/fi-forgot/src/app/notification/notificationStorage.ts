import type { FiNotification } from "@/app/notification/notificationDomain";

const READ_STATE_KEY = "fi-forgot-notification-read-state";
const DISMISSED_KEY = "fi-forgot-notification-dismissed";

type ReadStateMap = Record<string, FiNotification["readState"]>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getNotificationReadStateMap(): ReadStateMap {
  return readJson<ReadStateMap>(READ_STATE_KEY, {});
}

export function getDismissedNotificationIds(): string[] {
  return readJson<string[]>(DISMISSED_KEY, []);
}

export function setNotificationReadState(id: string, readState: FiNotification["readState"]): void {
  const next = { ...getNotificationReadStateMap(), [id]: readState };
  writeJson(READ_STATE_KEY, next);
}

export function dismissNotificationId(id: string): void {
  const next = Array.from(new Set([...getDismissedNotificationIds(), id]));
  writeJson(DISMISSED_KEY, next);
}

export function clearDismissedNotifications(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DISMISSED_KEY);
}

export function restoreNotificationId(id: string): void {
  const next = getDismissedNotificationIds().filter((item) => item !== id);
  writeJson(DISMISSED_KEY, next);
}
