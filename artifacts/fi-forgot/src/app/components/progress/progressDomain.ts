import {
  resolveRelationshipHealthLevel,
  type FiRelationshipHealthLevel,
} from "@/app/components/badge/badgeDomain";

export const aiGenerationSteps = [
  { id: "memories", label: "Reviewing memories" },
  { id: "recipient", label: "Understanding recipient" },
  { id: "planning", label: "Planning message" },
  { id: "writing", label: "Writing draft" },
  { id: "refining", label: "Refining wording" },
  { id: "review", label: "Final review" },
] as const;

export type FiAiGenerationStepId = (typeof aiGenerationSteps)[number]["id"];

export const fiProgressTones = [
  "primary",
  "success",
  "neutral",
  "brownie",
  "health",
  "ai",
  "upload",
] as const;

export type FiProgressTone = (typeof fiProgressTones)[number];

export const fiProgressSizes = ["sm", "md", "lg"] as const;

export type FiProgressSize = (typeof fiProgressSizes)[number];

export const fiStepProgressVariants = ["segments", "dots"] as const;

export type FiStepProgressVariant = (typeof fiStepProgressVariants)[number];

export const fiCompletionVariants = ["linear", "circular"] as const;

export type FiCompletionVariant = (typeof fiCompletionVariants)[number];

export const relationshipHealthRingLabels: Record<FiRelationshipHealthLevel, string> = {
  Excellent: "Excellent",
  Healthy: "Healthy",
  NeedsAttention: "Growing",
  Priority: "Getting started",
};

export function clampProgressValue(value: number, max = 100): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(Math.max(value, 0), max);
}

export function formatProgressPercent(value: number, max = 100): string {
  const clamped = clampProgressValue(value, max);
  return `${Math.round((clamped / max) * 100)}%`;
}

export function resolveHealthRingLevel(score: number): FiRelationshipHealthLevel {
  return resolveRelationshipHealthLevel(score);
}

export function resolveAiGenerationStepIndex(stepId?: FiAiGenerationStepId, stepIndex?: number): number {
  if (stepIndex != null) {
    return Math.min(Math.max(stepIndex, 0), aiGenerationSteps.length - 1);
  }

  if (stepId) {
    const index = aiGenerationSteps.findIndex((step) => step.id === stepId);
    return index >= 0 ? index : 0;
  }

  return 0;
}

export function getAiGenerationProgressValue(stepIndex: number): number {
  const maxIndex = Math.max(aiGenerationSteps.length - 1, 1);
  return Math.round((clampProgressValue(stepIndex, maxIndex) / maxIndex) * 100);
}
