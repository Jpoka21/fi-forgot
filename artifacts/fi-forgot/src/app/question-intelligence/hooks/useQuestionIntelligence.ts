import { useMemo, useState } from "react";

import type { CardOrder, Recipient } from "@/lib/data";
import type {
  FreshUpdate,
  HealthScore,
  NextQuestion,
  TrackedEventData,
} from "@/app/relationship-profile/relationshipProfileDomain";
import { orchestrateConcierge } from "@/app/concierge/conciergeOrchestrator";
import type { ConciergeOrchestrationResult } from "@/app/concierge/conciergeDomain";
import type { ConciergeQuestion } from "@/app/question-intelligence/questionIntelligenceDomain";
import {
  pickAlternateFreshQuestion,
  selectBestConciergeQuestion,
} from "@/app/question-intelligence/questionIntelligenceEngine";

export interface UseQuestionIntelligenceOptions {
  serverQuestion: NextQuestion | null;
  recipient: Recipient;
  freshUpdates: FreshUpdate[];
  healthScore: HealthScore | null;
  upcomingEvents: TrackedEventData[];
  profileComplete: boolean;
  profileScore?: number;
  cards: CardOrder[];
}

export interface UseQuestionIntelligenceResult {
  conciergeQuestion: ConciergeQuestion | null;
  activeQuestion: ConciergeQuestion | null;
  orchestration: ConciergeOrchestrationResult | null;
  askSomethingElse: () => void;
  resetAlternate: () => void;
}

export function useQuestionIntelligence(
  options: UseQuestionIntelligenceOptions,
): UseQuestionIntelligenceResult {
  const [alternateIndex, setAlternateIndex] = useState(0);
  const [usingAlternate, setUsingAlternate] = useState(false);

  const orchestration = useMemo(
    () =>
      orchestrateConcierge({
        recipient: options.recipient,
        freshUpdates: options.freshUpdates,
        healthScore: options.healthScore,
        upcomingEvents: options.upcomingEvents,
        profileComplete: options.profileComplete,
        profileScore: options.profileScore,
        cards: options.cards,
      }),
    [
      options.cards,
      options.freshUpdates,
      options.healthScore,
      options.profileComplete,
      options.profileScore,
      options.recipient,
      options.upcomingEvents,
    ],
  );

  const conciergeQuestion = useMemo(
    () =>
      selectBestConciergeQuestion({
        serverQuestion: options.serverQuestion,
        recipient: options.recipient,
        freshUpdates: options.freshUpdates,
        healthScore: options.healthScore,
        upcomingEvents: options.upcomingEvents,
        profileComplete: options.profileComplete,
        profileScore: options.profileScore,
        cards: options.cards,
      }),
    [
      options.cards,
      options.freshUpdates,
      options.healthScore,
      options.profileComplete,
      options.profileScore,
      options.recipient,
      options.serverQuestion,
      options.upcomingEvents,
    ],
  );

  const alternateQuestion = useMemo(() => {
    if (!usingAlternate) return null;
    return pickAlternateFreshQuestion({
      serverQuestion: options.serverQuestion,
      recipient: options.recipient,
      freshUpdates: options.freshUpdates,
      healthScore: options.healthScore,
      upcomingEvents: options.upcomingEvents,
      profileComplete: options.profileComplete,
      profileScore: options.profileScore,
      cards: options.cards,
      alternateIndex,
      forceAsk: true,
    });
  }, [
    alternateIndex,
    options.cards,
    options.freshUpdates,
    options.healthScore,
    options.profileComplete,
    options.profileScore,
    options.recipient,
    options.serverQuestion,
    options.upcomingEvents,
    usingAlternate,
  ]);

  const activeQuestion = alternateQuestion ?? conciergeQuestion;

  return {
    conciergeQuestion,
    activeQuestion,
    orchestration,
    askSomethingElse: () => {
      setUsingAlternate(true);
      setAlternateIndex((value) => value + 1);
    },
    resetAlternate: () => {
      setUsingAlternate(false);
      setAlternateIndex(0);
    },
  };
}
