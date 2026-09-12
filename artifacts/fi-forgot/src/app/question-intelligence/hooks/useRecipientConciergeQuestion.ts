import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  sortCardsForProfile,
  type FreshUpdate,
  type HealthScore,
  type NextQuestion,
  type TrackedEventData,
} from "@/app/relationship-profile/relationshipProfileDomain";
import { buildTrackedEventData } from "@/app/relationship-profile/relationshipProfileEngine";
import { isCurrentQuestionInputRequest } from "@/app/question-intelligence/questionInputState";
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
  const selectedRecipientRef = useRef<string | null>(recipientId);
  const [loadedRecipientId, setLoadedRecipientId] = useState<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const renderGeneration = fetchGenerationRef.current;

  selectedRecipientRef.current = recipientId;

  const resetState = useCallback(() => {
    setRecipient(undefined);
    setCards([]);
    setFreshUpdates([]);
    setNextQuestion(null);
    setProfileComplete(false);
    setProfileScore(0);
    setHealthScore(null);
    setAnswerText("");
    setSavingAnswer(false);
    setAnswerSaved(false);
    setQuestionSkipped(false);
    setLoadedRecipientId(null);
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
  }, []);

  const loadAll = useCallback(() => {
    const generation = ++fetchGenerationRef.current;
    resetState();
    if (!recipientId) return;
    const request = { recipientId, generation };
    const headers = getApiHeaders() as Record<string, string>;
    const loadedRecipient = getRecipient(recipientId);
    if (!loadedRecipient || String(loadedRecipient.id) !== String(recipientId)) return;
    setRecipient(loadedRecipient);
    setLoadedRecipientId(recipientId);

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
        if (!isCurrentQuestionInputRequest(request, selectedRecipientRef.current, fetchGenerationRef.current)) return;
        setFreshUpdates(data.freshUpdates ?? []);
      })
      .catch(() => {
        if (!isCurrentQuestionInputRequest(request, selectedRecipientRef.current, fetchGenerationRef.current)) return;
        setFreshUpdates([]);
      });

    fetch(`/api/v2/recipients/${recipientId}/next-question`, { headers })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: { nextQuestion: NextQuestion | null; profileComplete: boolean; profileScore?: number }) => {
        if (!isCurrentQuestionInputRequest(request, selectedRecipientRef.current, fetchGenerationRef.current)) return;
        setNextQuestion(data.nextQuestion ?? null);
        setProfileComplete(data.profileComplete ?? false);
        setProfileScore(data.profileScore ?? 0);
      })
      .catch(() => undefined);

    if (loadedRecipient?.name) {
      fetch("/api/v2/recipient-health", { headers })
        .then((response) => (response.ok ? response.json() : Promise.reject(response)))
        .then((data: { scores: HealthScore[] }) => {
        if (!isCurrentQuestionInputRequest(request, selectedRecipientRef.current, fetchGenerationRef.current)) return;
          const match = data.scores.find((score) => String(score.recipientId) === String(recipientId));
          setHealthScore(match ?? null);
        })
        .catch(() => {
          if (isCurrentQuestionInputRequest(request, selectedRecipientRef.current, fetchGenerationRef.current)) setHealthScore(null);
        });
    }
  }, [recipientId, resetState]);

  useEffect(() => {
    loadAll();
    return () => {
      ++fetchGenerationRef.current;
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    };
  }, [loadAll]);

  const upcomingEvents = useMemo((): TrackedEventData[] => {
    if (!recipient) return [];
    return buildTrackedEventData(recipient).filter(
      (event: TrackedEventData): event is TrackedEventData & { daysAway: number } =>
        event.daysAway !== null,
    );
  }, [recipient]);

  const current = loadedRecipientId !== null && loadedRecipientId === recipientId;
  const renderRequest = recipientId ? { recipientId, generation: renderGeneration } : null;

  const handleSaveAnswer = useCallback(async (questionPayload: {
    fieldKey: string;
    question: string;
    mode: NextQuestion["mode"];
    followUp?: NextQuestion["followUp"];
  }) => {
    if (!answerText.trim() || !recipientId || loadedRecipientId !== recipientId || !nextQuestion || !renderRequest) return;
    if (!isCurrentQuestionInputRequest(renderRequest, selectedRecipientRef.current, fetchGenerationRef.current)) return;
    const saveRecipientId = recipientId;
    const saveRequest = renderRequest;
    const capturedAnswer = answerText.trim();
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;

    setSavingAnswer(true);
    try {
      const body: Record<string, string> = {
        fieldKey: questionPayload.fieldKey,
        questionText: questionPayload.question,
        answerText: capturedAnswer,
        triggerType: questionPayload.mode === "follow_up" ? "follow_up" : questionPayload.mode,
      };
      if (questionPayload.mode === "follow_up" && questionPayload.followUp?.id) {
        body.followUpId = questionPayload.followUp.id;
      }

      const response = await fetch(`/api/v2/recipients/${saveRecipientId}/answer-question`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok && isCurrentQuestionInputRequest(saveRequest, selectedRecipientRef.current, fetchGenerationRef.current)) {
        setAnswerSaved(true);
        saveTimerRef.current = window.setTimeout(() => {
          if (!isCurrentQuestionInputRequest(saveRequest, selectedRecipientRef.current, fetchGenerationRef.current)) return;
          setAnswerText("");
          setAnswerSaved(false);
          setQuestionSkipped(false);
          loadAll();
          window.dispatchEvent(new Event("recipient-answer-saved"));
          saveTimerRef.current = null;
        }, 1400);
      }
    } finally {
      if (isCurrentQuestionInputRequest(saveRequest, selectedRecipientRef.current, fetchGenerationRef.current)) setSavingAnswer(false);
    }
  }, [answerText, loadAll, loadedRecipientId, nextQuestion, recipientId, renderGeneration]);

  const setBoundAnswerText = useCallback((value: string) => {
    if (renderRequest && isCurrentQuestionInputRequest(renderRequest, selectedRecipientRef.current, fetchGenerationRef.current)) setAnswerText(value);
  }, [recipientId, renderGeneration]);
  const setBoundQuestionSkipped = useCallback((value: boolean) => {
    if (renderRequest && isCurrentQuestionInputRequest(renderRequest, selectedRecipientRef.current, fetchGenerationRef.current)) setQuestionSkipped(value);
  }, [recipientId, renderGeneration]);
  const reload = useCallback(() => {
    if (renderRequest && isCurrentQuestionInputRequest(renderRequest, selectedRecipientRef.current, fetchGenerationRef.current)) loadAll();
  }, [loadAll, recipientId, renderGeneration]);

  return {
    recipient: current ? recipient : undefined,
    cards: current ? cards : [],
    freshUpdates: current ? freshUpdates : [],
    nextQuestion: current ? nextQuestion : null,
    profileComplete: current ? profileComplete : false,
    profileScore: current ? profileScore : 0,
    healthScore: current ? healthScore : null,
    upcomingEvents: current ? upcomingEvents : [],
    answerText: current ? answerText : "",
    savingAnswer: current ? savingAnswer : false,
    answerSaved: current ? answerSaved : false,
    questionSkipped: current ? questionSkipped : false,
    setAnswerText: setBoundAnswerText,
    setQuestionSkipped: setBoundQuestionSkipped,
    handleSaveAnswer,
    reload,
  };
}
