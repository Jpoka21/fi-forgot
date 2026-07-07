import type { OnboardingData } from "@/lib/auth-context";
import type { PreviewDays } from "@/lib/data";

import { illustrationPaths } from "@/app/design/assets/illustrationPaths";

export const ONBOARDING_SESSION_KEY = "fi_forgot_onboarding_session";

export type WelcomePhase = "welcome" | "product" | "concierge" | "dave" | "profile";

export type GuidedPhase =
  | "who"
  | "like"
  | "memory"
  | "calendar"
  | "aiIntro"
  | "generating"
  | "draft"
  | "autopilot"
  | "address"
  | "done";

export type OnboardingPhase = WelcomePhase | GuidedPhase | "welcomeComplete";

export interface OnboardingAddressDraft {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
}

export interface OnboardingSessionState {
  welcomePhase: WelcomePhase;
  welcomeComplete: boolean;
  guidedPhase: GuidedPhase;
  data: OnboardingData;
  firstOccasion: string;
  firstOccasionDate: string;
  memoryText: string;
  generatedCard: string;
  revisionCount: number;
  revisionInput: string;
  showRevisionInput: boolean;
  address: OnboardingAddressDraft;
  genError: string | null;
  onboardingKeptInMind: string[];
}

export const WELCOME_PHASE_ORDER: WelcomePhase[] = [
  "welcome",
  "product",
  "concierge",
  "dave",
  "profile",
];

export const GUIDED_PROGRESS_LABELS = [
  "Your first person",
  "What they're like",
  "A personal detail",
  "First card preview",
  "You're all set",
] as const;

export const onboardingDefaults = {
  welcomeTitle: "Welcome to your Relationship Concierge",
  welcomeSubtitle:
    "I'll quietly help you remember the people who matter, write thoughtful cards, and keep relationships strong — without adding work to your day.",
  productTitle: "How F.I. Forgot works",
  productSubtitle:
    "We remember important dates, prepare drafts in your voice, and mail cards on your schedule. You stay in control of what goes out.",
  conciergeTitle: "Your Relationship Concierge",
  conciergeSubtitle:
    "Not a dashboard. Not a to-do list. A calm partner that learns what matters to you and handles the remembering.",
  daveTitle: "Meet Doghouse Dave",
  daveSubtitle:
    "Dave is the friendly face of your concierge — thoughtful, never pushy. He'll guide you through setup and stay out of the way afterward.",
  profileTitle: "You're all set to begin",
  profileSubtitle: "Your account is ready. Next we'll add one person who matters.",
  continueLabel: "Continue",
  backLabel: "Back",
  learnHowLabel: "Learn how it works",
  getStartedLabel: "Let's get started",
  resumeLabel: "Pick up where you left off",
  daveWelcomeImage: illustrationPaths.onboarding.daveWelcome,
  daveLearningImage: illustrationPaths.loading.learning,
} as const;

export function createDefaultOnboardingData(): OnboardingData {
  return {
    recipientName: "",
    relationship: "",
    personality: [],
    interests: [],
    tone: "",
    petName: "",
    yearsTogther: "",
    thingsToAvoid: "",
    selectedEvents: [],
    eventDates: {},
    previewDays: 14 as PreviewDays,
    emotionalLevel: 3,
    favoriteMemories: "",
    insideJokes: "",
    deliveryPreference: undefined,
    mailingAddress: { line1: "", line2: "", city: "", state: "", zip: "" },
  };
}

export function createDefaultSessionState(): OnboardingSessionState {
  return {
    welcomePhase: "welcome",
    welcomeComplete: false,
    guidedPhase: "who",
    data: createDefaultOnboardingData(),
    firstOccasion: "",
    firstOccasionDate: "",
    memoryText: "",
    generatedCard: "",
    revisionCount: 0,
    revisionInput: "",
    showRevisionInput: false,
    address: { line1: "", line2: "", city: "", state: "", zip: "" },
    genError: null,
    onboardingKeptInMind: [],
  };
}

export function guidedPhaseToProgressIdx(phase: GuidedPhase): number {
  const map: Record<GuidedPhase, number> = {
    who: 0,
    like: 1,
    memory: 2,
    calendar: 2,
    aiIntro: 2,
    generating: 3,
    draft: 3,
    autopilot: 3,
    address: 4,
    done: 4,
  };
  return map[phase] ?? 0;
}

export function isGuidedSetupPhase(phase: GuidedPhase): boolean {
  return phase === "who" || phase === "like" || phase === "memory";
}
