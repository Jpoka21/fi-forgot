/**
 * Feature flag for Brain-first profile questions (instant rollback).
 */
export function isBrainProfileQuestionsEnabled(): boolean {
  return import.meta.env.VITE_BRAIN_PROFILE_QUESTIONS === "true";
}
