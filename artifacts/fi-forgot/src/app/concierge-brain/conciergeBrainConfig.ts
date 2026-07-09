/**
 * Feature flag for Brain-fed Concierge workspace (instant rollback).
 */
export function isBrainConciergeEnabled(): boolean {
  return import.meta.env.VITE_BRAIN_CONCIERGE === "true";
}
