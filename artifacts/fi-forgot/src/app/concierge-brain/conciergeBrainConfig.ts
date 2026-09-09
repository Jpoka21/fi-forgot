/**
 * Feature flag for Brain-fed Concierge workspace (instant rollback).
 */
export function isBrainConciergeEnabled(): boolean {
  return import.meta.env.VITE_BRAIN_CONCIERGE === "true";
}

/**
 * Feature flag for the first Brain-fed Concierge conversation slice.
 * The conversation path can never be enabled outside the Brain workspace boundary.
 */
export function isBrainConciergeConversationEnabled(): boolean {
  return isBrainConciergeEnabled()
    && import.meta.env.VITE_BRAIN_CONCIERGE_CONVERSATION === "true";
}
