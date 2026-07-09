import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { trackRelationshipProfileEvent } from "@/app/relationship-profile/relationshipProfileAnalytics";
import { useProfileQuestion } from "@/app/relationship-profile/hooks/useProfileQuestion";
import { isBrainProfileQuestionsEnabled } from "@/app/relationship-profile/relationshipProfileBrainConfig";
import type { ProfileQuestionViewModel } from "@/app/relationship-profile/profileQuestionViewModel";
import {
  buildProfileFields,
  sortCardsForProfile,
  type FreshUpdate,
  type HealthScore,
  type NextQuestion,
} from "@/app/relationship-profile/relationshipProfileDomain";
import { buildTrackedEventData } from "@/app/relationship-profile/relationshipProfileEngine";
import {
  getApiHeaders,
  getCards,
  getRecipient,
  getServerUserId,
  saveRecipient,
  type CardOrder,
  type CustomDate,
  type Recipient,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { HOLIDAY_EVENTS } from "@/app/relationship-profile/relationshipProfileEngine";

export function useRelationshipProfilePage(recipientId: string) {
  const { authReady } = useAuth();
  const brainProfileQuestionsEnabled = isBrainProfileQuestionsEnabled();

  const brainProfileQuestion = useProfileQuestion(
    recipientId,
    brainProfileQuestionsEnabled,
    authReady,
  );

  const [recipient, setRecipient] = useState<Recipient | undefined>();
  const [cards, setCards] = useState<CardOrder[]>([]);
  const [freshUpdates, setFreshUpdates] = useState<FreshUpdate[]>([]);
  const [freshLoading, setFreshLoading] = useState(true);
  const [nextQuestion, setNextQuestion] = useState<NextQuestion | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileScore, setProfileScore] = useState(0);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [showAllMemories, setShowAllMemories] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEventChip, setSelectedEventChip] = useState<string | null>(null);
  const [newEventDate, setNewEventDate] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);

  const [memoryText, setMemoryText] = useState("");
  const [savingMemory, setSavingMemory] = useState(false);
  const [memorySaved, setMemorySaved] = useState(false);

  const [answerText, setAnswerText] = useState("");
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [answerSaved, setAnswerSaved] = useState(false);
  const [questionSkipped, setQuestionSkipped] = useState(false);
  const fetchGenerationRef = useRef(0);

  const loadLocalData = useCallback(() => {
    if (!recipientId) return;
    const loadedRecipient = getRecipient(recipientId);
    setRecipient(loadedRecipient);
    const serverUserId = getServerUserId();
    const all = getCards().filter(
      (card) =>
        String(card.recipientId) === String(recipientId)
        && (serverUserId ? card.userId === serverUserId : true),
    );
    setCards(sortCardsForProfile(all));
    trackRelationshipProfileEvent("relationship_profile_viewed", { recipientId });
  }, [recipientId]);

  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

  useEffect(() => {
    fetchGenerationRef.current += 1;
  }, [recipientId]);

  const loadFreshUpdates = useCallback(() => {
    const generation = fetchGenerationRef.current;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"] || !recipientId) {
      setFreshLoading(false);
      return;
    }
    setFreshLoading(true);
    fetch(`/api/v2/recipients/${recipientId}/fresh-updates`, { headers })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: { freshUpdates: FreshUpdate[] }) => {
        if (generation !== fetchGenerationRef.current) return;
        setFreshUpdates(data.freshUpdates ?? []);
      })
      .catch(() => {
        if (generation !== fetchGenerationRef.current) return;
        setFreshUpdates([]);
      })
      .finally(() => {
        if (generation !== fetchGenerationRef.current) return;
        setFreshLoading(false);
      });
  }, [recipientId]);

  useEffect(() => {
    loadFreshUpdates();
  }, [loadFreshUpdates]);

  const loadNextQuestion = useCallback(() => {
    const generation = fetchGenerationRef.current;
    const headers = getApiHeaders() as Record<string, string>;
    if (!recipientId) return;
    if (!headers["x-user-id"]) return;

    fetch(`/api/v2/recipients/${recipientId}/next-question`, { headers })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: { nextQuestion: NextQuestion | null; profileComplete: boolean; profileScore?: number }) => {
        if (generation !== fetchGenerationRef.current) return;
        setNextQuestion(data.nextQuestion ?? null);
        setProfileComplete(data.profileComplete ?? false);
        setProfileScore(data.profileScore ?? 0);
      })
      .catch(() => undefined);
  }, [recipientId]);

  useEffect(() => {
    if (!brainProfileQuestionsEnabled) {
      loadNextQuestion();
    }
  }, [brainProfileQuestionsEnabled, loadNextQuestion, authReady]);

  useEffect(() => {
    const generation = fetchGenerationRef.current;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"] || !recipient?.name) return;

    fetch("/api/v2/recipient-health", { headers })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: { scores: HealthScore[] }) => {
        if (generation !== fetchGenerationRef.current) return;
        const match = data.scores.find(
          (score) => score.name.trim().toLowerCase() === recipient.name.trim().toLowerCase(),
        );
        setHealthScore(match ?? null);
      })
      .catch(() => undefined);
  }, [recipient?.name]);

  const handleAddHolidayEvent = useCallback(
    (label: string, flag: keyof Recipient) => {
      if (!recipient) return;
      const selected = recipient.selectedEvents ?? [];
      const updated: Recipient = {
        ...recipient,
        [flag]: true,
        selectedEvents: selected.includes(label) ? selected : [...selected, label],
      };
      saveRecipient(updated);
      setRecipient(updated);
      setShowAddEvent(false);
      setSelectedEventChip(null);
      trackRelationshipProfileEvent("relationship_profile_occasion_added", {
        recipientId,
        actionId: label,
      });
    },
    [recipient, recipientId],
  );

  const handleRemoveEvent = useCallback(
    (label: string) => {
      if (!recipient) return;
      const holidayEntry = HOLIDAY_EVENTS.find((item) => item.label === label);
      const updated: Recipient = {
        ...recipient,
        ...(holidayEntry ? { [holidayEntry.flag]: false } : {}),
        selectedEvents: (recipient.selectedEvents ?? []).filter((event) => event !== label),
      };
      saveRecipient(updated);
      setRecipient(updated);
    },
    [recipient],
  );

  const handleAddDateEvent = useCallback(() => {
    if (!recipient || !selectedEventChip || !newEventDate) return;
    setSavingEvent(true);
    const event = selectedEventChip;
    const selected = recipient.selectedEvents ?? [];
    let updated: Recipient = { ...recipient };

    if (event === "Birthday") {
      updated = {
        ...updated,
        birthday: newEventDate,
        selectedEvents: selected.includes("Birthday") ? selected : [...selected, "Birthday"],
      };
    } else if (event === "Anniversary") {
      updated = {
        ...updated,
        anniversaryDate: newEventDate,
        marriageDate: newEventDate,
        selectedEvents: selected.includes("Anniversary") ? selected : [...selected, "Anniversary"],
      };
    } else {
      const customDate: CustomDate = {
        id: `${event.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        label: event,
        date: newEventDate,
      };
      updated = {
        ...updated,
        customDates: [...(recipient.customDates ?? []), customDate],
        selectedEvents: selected.includes(event) ? selected : [...selected, event],
      };
    }

    saveRecipient(updated);
    setRecipient(updated);
    setNewEventDate("");
    setSelectedEventChip(null);
    setShowAddEvent(false);
    setSavingEvent(false);
    trackRelationshipProfileEvent("relationship_profile_occasion_added", {
      recipientId,
      actionId: event,
    });
  }, [newEventDate, recipient, recipientId, selectedEventChip]);

  const handleSaveMemory = useCallback(async () => {
    if (!memoryText.trim() || !recipientId) return;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;

    setSavingMemory(true);
    const firstName = recipient?.name.split(" ")[0] ?? "them";

    try {
      const response = await fetch(`/api/v2/recipients/${recipientId}/answer-question`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldKey: "freeform_memory",
          questionText: `What would you like us to remember about ${firstName}?`,
          answerText: memoryText.trim(),
          triggerType: "fresh_update",
        }),
      });
      if (response.ok) {
        setMemoryText("");
        setMemorySaved(true);
        setTimeout(() => setMemorySaved(false), 3000);
        loadFreshUpdates();
        window.dispatchEvent(new Event("recipient-answer-saved"));
        trackRelationshipProfileEvent("relationship_profile_memory_saved", { recipientId });
      }
    } catch {
      /* non-fatal */
    } finally {
      setSavingMemory(false);
    }
  }, [loadFreshUpdates, memoryText, recipient?.name, recipientId]);

  const handleSaveAnswer = useCallback(async (questionPayload?: {
    fieldKey: string;
    question: string;
    mode: NextQuestion["mode"];
    followUp?: NextQuestion["followUp"];
  } | ProfileQuestionViewModel) => {
    const viewModel =
      brainProfileQuestionsEnabled && brainProfileQuestion.profileQuestion
        ? (questionPayload as ProfileQuestionViewModel | undefined) ?? brainProfileQuestion.profileQuestion
        : null;

    const legacyQuestion =
      !brainProfileQuestionsEnabled
        ? (questionPayload as { fieldKey: string; question: string; mode: NextQuestion["mode"]; followUp?: NextQuestion["followUp"] } | undefined) ?? nextQuestion
        : null;

    if (!answerText.trim() || !recipientId) return;
    if (!viewModel && !legacyQuestion) return;

    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;

    setSavingAnswer(true);
    try {
      const body: Record<string, string> = viewModel
        ? {
            fieldKey: viewModel.saveFieldKey,
            questionText: viewModel.question,
            answerText: answerText.trim(),
            triggerType: viewModel.saveTriggerType,
          }
        : {
            fieldKey: legacyQuestion!.fieldKey,
            questionText: legacyQuestion!.question,
            answerText: answerText.trim(),
            triggerType:
              legacyQuestion!.mode === "follow_up" ? "follow_up" : legacyQuestion!.mode,
          };

      if (viewModel?.followUpId) {
        body.followUpId = viewModel.followUpId;
      } else if (legacyQuestion?.mode === "follow_up" && legacyQuestion.followUp?.id) {
        body.followUpId = legacyQuestion.followUp.id;
      }

      const response = await fetch(`/api/v2/recipients/${recipientId}/answer-question`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        const refreshFreshUpdates =
          viewModel
            ? viewModel.saveTriggerType === "fresh_update" || viewModel.saveTriggerType === "follow_up"
            : legacyQuestion?.mode === "fresh_update";

        setAnswerSaved(true);
        setTimeout(() => {
          setAnswerText("");
          setAnswerSaved(false);
          setQuestionSkipped(false);
          if (brainProfileQuestionsEnabled) {
            setNextQuestion(null);
            void brainProfileQuestion.refresh();
          } else {
            setNextQuestion(null);
            loadNextQuestion();
          }
          if (refreshFreshUpdates) loadFreshUpdates();
          window.dispatchEvent(new Event("recipient-answer-saved"));
          trackRelationshipProfileEvent("relationship_profile_answer_saved", { recipientId });
        }, 1400);
      }
    } catch {
      /* non-fatal */
    } finally {
      setSavingAnswer(false);
    }
  }, [
    answerText,
    brainProfileQuestion,
    brainProfileQuestionsEnabled,
    loadFreshUpdates,
    loadNextQuestion,
    nextQuestion,
    recipientId,
  ]);

  const firstName = recipient?.name.split(" ")[0] ?? "them";
  const allTrackedEventData = useMemo(
    () => (recipient ? buildTrackedEventData(recipient) : []),
    [recipient],
  );
  const upcomingEvents = allTrackedEventData.filter(
    (event): event is { event: string; dateStr: string; daysAway: number } =>
      event.daysAway !== null && event.daysAway <= 60,
  );
  const futureEvents = allTrackedEventData.filter(
    (event): event is { event: string; dateStr: string; daysAway: number } =>
      event.daysAway !== null && event.daysAway > 60,
  );
  const eventsNeedingDate = allTrackedEventData.filter((event) => event.daysAway === null);
  const nextEvent = upcomingEvents[0] ?? futureEvents[0] ?? null;
  const cardByEvent = useMemo(
    () =>
      new Map(
        cards
          .filter((card) => card.status === "Ready for approval" || card.status === "Approved")
          .map((card) => [card.holiday, card]),
      ),
    [cards],
  );
  const profileFields = recipient ? buildProfileFields(recipient) : [];
  const displayedMemories = showAllMemories ? freshUpdates : freshUpdates.slice(0, 4);

  const activeProfileQuestion = brainProfileQuestionsEnabled
    ? brainProfileQuestion.profileQuestion
    : null;

  const legacyProfileComplete = brainProfileQuestionsEnabled
    ? brainProfileQuestion.profileComplete
    : profileComplete;

  const legacyProfileScore = brainProfileQuestionsEnabled
    ? brainProfileQuestion.profileScore
    : profileScore;

  const questionModeLabel =
    nextQuestion?.mode === "follow_up"
      ? "Following up"
      : legacyProfileComplete
        ? "A quick check-in"
        : "Help future cards sound more like you";

  return {
    brainProfileQuestionsEnabled,
    activeProfileQuestion,
    profileQuestionStatus: brainProfileQuestion.status,
    profileQuestionError: brainProfileQuestion.errorMessage,
    recipient,
    cards,
    freshUpdates,
    freshLoading,
    nextQuestion,
    profileComplete: legacyProfileComplete,
    profileScore: legacyProfileScore,
    healthScore,
    showAllMemories,
    showTimeline,
    showAddEvent,
    selectedEventChip,
    newEventDate,
    savingEvent,
    memoryText,
    savingMemory,
    memorySaved,
    answerText,
    savingAnswer,
    answerSaved,
    questionSkipped,
    firstName,
    upcomingEvents,
    futureEvents,
    eventsNeedingDate,
    nextEvent,
    cardByEvent,
    profileFields,
    displayedMemories,
    questionModeLabel,
    setShowAllMemories,
    setShowTimeline,
    setShowAddEvent,
    setSelectedEventChip,
    setNewEventDate,
    setMemoryText,
    setAnswerText,
    setQuestionSkipped,
    handleAddHolidayEvent,
    handleRemoveEvent,
    handleAddDateEvent,
    handleSaveMemory,
    handleSaveAnswer,
    refresh: loadLocalData,
  };
}

export type RelationshipProfilePageController = ReturnType<typeof useRelationshipProfilePage>;
