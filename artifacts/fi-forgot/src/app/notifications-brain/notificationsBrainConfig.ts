/**
 * Feature flag for Brain-fed relationship notifications (instant rollback).
 */
export function isBrainNotificationsEnabled(): boolean {
  return import.meta.env.VITE_BRAIN_NOTIFICATIONS === "true";
}
