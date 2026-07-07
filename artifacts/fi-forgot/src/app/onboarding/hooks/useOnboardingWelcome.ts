import { useCallback, useEffect, useState } from "react";

import { trackOnboardingEvent } from "@/app/onboarding/onboardingAnalytics";
import {
  getNextWelcomePhase,
  getPreviousWelcomePhase,
  hasResumableOnboardingSession,
  readOnboardingSession,
  writeOnboardingSession,
} from "@/app/onboarding/onboardingEngine";
import {
  createDefaultSessionState,
  onboardingDefaults,
  type WelcomePhase,
} from "@/app/onboarding/onboardingDomain";

export function useOnboardingWelcome(onComplete: () => void) {
  const [phase, setPhase] = useState<WelcomePhase>(() => readOnboardingSession()?.welcomePhase ?? "welcome");
  const [showResumePrompt, setShowResumePrompt] = useState(() => hasResumableOnboardingSession());

  useEffect(() => {
    trackOnboardingEvent("onboarding_opened");
  }, []);

  useEffect(() => {
    const session = readOnboardingSession() ?? createDefaultSessionState();
    writeOnboardingSession({ ...session, welcomePhase: phase });
    trackOnboardingEvent("onboarding_welcome_step", { phase });
  }, [phase]);

  const goNext = useCallback(() => {
    const next = getNextWelcomePhase(phase);
    if (next) {
      setPhase(next);
      return;
    }
    const session = readOnboardingSession() ?? createDefaultSessionState();
    writeOnboardingSession({ ...session, welcomeComplete: true, welcomePhase: phase });
    onComplete();
  }, [onComplete, phase]);

  const goBack = useCallback(() => {
    const previous = getPreviousWelcomePhase(phase);
    if (previous) setPhase(previous);
  }, [phase]);

  const resumeSession = useCallback(() => {
    const session = readOnboardingSession();
    if (session?.welcomeComplete) {
      onComplete();
    } else if (session?.welcomePhase) {
      setPhase(session.welcomePhase);
    }
    setShowResumePrompt(false);
    trackOnboardingEvent("onboarding_resumed");
  }, [onComplete]);

  const startFresh = useCallback(() => {
    setShowResumePrompt(false);
    setPhase("welcome");
  }, []);

  return {
    phase,
    showResumePrompt,
    canGoBack: getPreviousWelcomePhase(phase) !== null,
    defaults: onboardingDefaults,
    goNext,
    goBack,
    resumeSession,
    startFresh,
  };
}
