import {
  ONBOARDING_SESSION_KEY,
  WELCOME_PHASE_ORDER,
  createDefaultSessionState,
  type OnboardingSessionState,
  type WelcomePhase,
} from "@/app/onboarding/onboardingDomain";

export function readOnboardingSession(): OnboardingSessionState | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_SESSION_KEY);
    if (!raw) return null;
    return { ...createDefaultSessionState(), ...(JSON.parse(raw) as Partial<OnboardingSessionState>) };
  } catch {
    return null;
  }
}

export function writeOnboardingSession(session: OnboardingSessionState): void {
  localStorage.setItem(ONBOARDING_SESSION_KEY, JSON.stringify(session));
}

export function clearOnboardingSession(): void {
  localStorage.removeItem(ONBOARDING_SESSION_KEY);
}

export function getNextWelcomePhase(current: WelcomePhase): WelcomePhase | null {
  const index = WELCOME_PHASE_ORDER.indexOf(current);
  if (index < 0 || index >= WELCOME_PHASE_ORDER.length - 1) return null;
  return WELCOME_PHASE_ORDER[index + 1] ?? null;
}

export function getPreviousWelcomePhase(current: WelcomePhase): WelcomePhase | null {
  const index = WELCOME_PHASE_ORDER.indexOf(current);
  if (index <= 0) return null;
  return WELCOME_PHASE_ORDER[index - 1] ?? null;
}

export function hasResumableOnboardingSession(): boolean {
  const session = readOnboardingSession();
  if (!session) return false;
  return !session.welcomeComplete || session.guidedPhase !== "who" || session.data.recipientName.trim().length > 0;
}
