/**
 * Feature flag for Brain-fed dashboard relationship opportunities (instant rollback).
 */
export function isBrainDashboardEnabled(): boolean {
  return import.meta.env.VITE_BRAIN_DASHBOARD === "true";
}
