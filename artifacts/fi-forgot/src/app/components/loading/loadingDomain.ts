export const fiLoadingSkeletonVariants = [
  "page",
  "card",
  "list",
  "calendar",
  "timeline",
  "search",
  "recipient",
  "billing",
  "aiGeneration",
  "dashboard",
] as const;

export type FiLoadingSkeletonVariant = (typeof fiLoadingSkeletonVariants)[number];

export interface FiLoadingSkeletonCopy {
  label: string;
}

export const loadingSkeletonDefaults: Record<FiLoadingSkeletonVariant, FiLoadingSkeletonCopy> = {
  page: {
    label: "Loading page",
  },
  card: {
    label: "Loading card",
  },
  list: {
    label: "Loading list",
  },
  calendar: {
    label: "Loading calendar",
  },
  timeline: {
    label: "Loading your shared moments",
  },
  search: {
    label: "Searching",
  },
  recipient: {
    label: "Gathering what matters about this relationship",
  },
  billing: {
    label: "Loading billing details",
  },
  aiGeneration: {
    label: "Preparing a thoughtful first draft",
  },
  dashboard: {
    label: "Preparing your relationship briefing",
  },
};

export const aiGenerationLoadingMessages = [
  "Preparing a thoughtful first draft.",
  "Looking at what you have shared.",
  "Shaping this into something that feels personal.",
] as const;
