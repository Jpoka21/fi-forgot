import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  sortCardsForProfile,
  type FreshUpdate,
  type HealthScore,
  type NextQuestion,
  type TrackedEventData,
} from "@/app/relationship-profile/relationshipProfileDomain";
import { buildTrackedEventData } from "@/app/relationship-profile/relationshipProfileEngine";
import {
  getApiHeaders,
  getCards,
  getRecipient,
  getServerUserId,
  type CardOrder,
  type Recipient,
} from "@/lib/data";

export function useRecipientConciergeQuestion(recipientId: string | null) {
  const [recipient, setRecipient] = useState<Recipient | undefined>();
  const [cards, setCards] = useState<CardOrder[]>([]);
  const [freshUpdates, setFreshUpdates] = useState<FreshUpdate[]>([]);
  const [nextQuestion, setNextQuestion] = useState<NextQuestion | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileScore, setProfileScore] = useState(0);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [answerSaved, setAnswerSaved] = useState(false);
  const [questionSkipped, setQuestionSkipped] = useState(false);
  const fetchGenerationRef = useRef(0);

  const loadAll = useCallback(() => {
    if (!recipientId) return;
    const generation = ++fetchGenerationRef.current;
    const headers = getApiHeaders() as Record<string, string>;
    const loadedRecipient = getRecipient(recipientId);
    setRecipient(loadedRecipient);

    const serverUserId = getServerUserId();
    const allCards = getCards().filter(
      (card) =>
        String(card.recipientId) === String(recipientId)
        && (serverUserId ? card.userId === serverUserId : true),
    );
    setCards(sortCardsForProfile(allCards));

    if (!headers["x-user-id"]) return;

    fetch(`/api/v2/recipients/${recipientId}/fresh-updates`, { headers })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: { freshUpdates: FreshUpdate[] }) => {
        if (generation !== fetchGenerationRef.current) return;
        setFreshUpdates(data.freshUpdates ?? []);
      })
      .catch(() => {
        if (generation !== fetchGenerationRef.current) return;
        setFreshUpdates([]);
      });

    fetch(`/api/v2/recipients/${recipientId}/next-question`, { headers })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: { nextQuestion: NextQuestion | null; profileComplete: boolean; profileScore?: number }) => {
        if (generation !== fetchGenerationRef.current) return;
        setNextQuestion(data.nextQuestion ?? null);
        setProfileComplete(data.profileComplete ?? false);
        setProfileScore(data.profileScore ?? 0);
      })
      .catch(() => undefined);

    if (loadedRecipient?.name) {
      fetch("/api/v2/recipient-health", { headers })
        .then((response) => (response.ok ? response.json() : Promise.reject(response)))
        .then((data: { scores: HealthScore[] }) => {
          if (generation !== fetchGenerationRef.current) return;
          const match = data.scores.find(
            (score) => score.name.trim().toLowerCase() === loadedRecipient.name.trim().toLowerCase(),
          );
          setHealthScore(match ?? null);
        })
        .catch(() => undefined);
    }
  }, [recipientId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const upcomingEvents = useMemo((): TrackedEventData[] => {
    if (!recipient) return [];
    return buildTrackedEventData(recipient).filter(
      (event: TrackedEventData): event is TrackedEventData & { daysAway: number } =>
        event.daysAway !== null,
    );
  }, [recipient]);

  const handleSaveAnswer = useCallback(async (questionPayload: {
    fieldKey: string;
    question: string;
    mode: NextQuestion["mode"];
    followUp?: NextQuestion["followUp"];
  }) => {
    if (!answerText.trim() || !recipientId) return;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;

    setSavingAnswer(true);
    try {
      const body: Record<string, string> = {
        fieldKey: questionPayload.fieldKey,
        questionText: questionPayload.question,
        answerText: answerText.trim(),
        triggerType: questionPayload.mode === "follow_up" ? "follow_up" : questionPayload.mode,
      };
      if (questionPayload.mode === "follow_up" && questionPayload.followUp?.id) {
        body.followUpId = questionPayload.followUp.id;
      }

      const response = await fetch(`/api/v2/recipients/${recipientId}/answer-question`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setAnswerSaved(true);
        window.setTimeout(() => {
          setAnswerText("");
          setAnswerSaved(false);
          setQuestionSkipped(false);
          loadAll();
          window.dispatchEvent(new Event("recipient-answer-saved"));
        }, 1400);
      }
    } finally {
      setSavingAnswer(false);
    }
  }, [answerText, loadAll, recipientId]);

  return {
    recipient,
    cards,
    freshUpdates,
    nextQuestion,
    profileComplete,
    profileScore,
    healthScore,
    upcomingEvents,
    answerText,
    savingAnswer,
    answerSaved,
    questionSkipped,
    setAnswerText,
    setQuestionSkipped,
    handleSaveAnswer,
    reload: loadAll,
  };
}
