import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

import {
  buildEditCardPayload,
  buildGenerateCardPayload,
} from "@/app/card-creation/cardCreationEngine";
import {
  buildReviewSummary,
  cardCreationDefaults,
  enhancementInstructions,
  type FiCardCreationStepId,
  type FiEnhancementActionId,
  type GeneratedCardDraft,
} from "@/app/card-creation/cardCreationDomain";
import { trackCardCreationEvent } from "@/app/card-creation/cardCreationAnalytics";
import {
  getCards,
  getPersonalSettings,
  getRecipients,
  HOLIDAYS,
  type CardOrder,
  type Recipient,
  type Tone,
  updateCard,
} from "@/lib/data";

const STEP_ORDER: FiCardCreationStepId[] = [
  "recipient",
  "occasion",
  "generate",
  "drafts",
  "review",
  "confirm",
];

function stepIndex(step: FiCardCreationStepId): number {
  return STEP_ORDER.indexOf(step);
}

export interface UseCardCreationResult {
  step: FiCardCreationStepId;
  stepNumber: number;
  recipients: Recipient[];
  selectedRecipientId: string;
  selectedRecipient: Recipient | undefined;
  selectedOccasion: string;
  occasions: readonly string[];
  cards: GeneratedCardDraft[];
  editedTexts: Record<string, string>;
  generating: boolean;
  generateError: string;
  enhancingTone: Tone | null;
  selectedTone: Tone | null;
  approvedTone: Tone | null;
  personalSettings: ReturnType<typeof getPersonalSettings>;
  handwritingLabel: string;
  isLoading: boolean;
  isEmpty: boolean;
  reviewSummary: ReturnType<typeof buildReviewSummary> | null;
  selectedDraftText: string;
  setSelectedRecipientId: (id: string) => void;
  setSelectedOccasion: (occasion: string) => void;
  setEditedText: (tone: Tone, text: string) => void;
  goToStep: (step: FiCardCreationStepId) => void;
  goNext: () => void;
  goBack: () => void;
  generate: () => Promise<void>;
  applyEnhancement: (tone: Tone, actionId: FiEnhancementActionId) => Promise<void>;
  selectTone: (tone: Tone) => void;
  saveDraft: () => void;
  approve: () => void;
  cancel: () => void;
  retryGeneration: () => void;
  startOver: () => void;
}

export function useCardCreation(): UseCardCreationResult {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<FiCardCreationStepId>("recipient");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [cards, setCards] = useState<GeneratedCardDraft[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [enhancingTone, setEnhancingTone] = useState<Tone | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [approvedTone, setApprovedTone] = useState<Tone | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [handwritingLabel, setHandwritingLabel] = useState("");
  const personalSettings = getPersonalSettings();

  useEffect(() => {
    setRecipients(getRecipients());
    trackCardCreationEvent("card_creation_opened");
  }, []);

  useEffect(() => {
    const fontId = personalSettings.cardFont;
    if (!fontId) {
      setHandwritingLabel("");
      return;
    }

    let cancelled = false;
    fetch("/api/handwrytten-fonts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { fonts?: Array<{ id: string; label?: string; name?: string }> } | null) => {
        if (cancelled || !data?.fonts) return;
        const match = data.fonts.find((font) => font.id === fontId);
        setHandwritingLabel(match?.label ?? match?.name ?? fontId);
      })
      .catch(() => {
        if (!cancelled) setHandwritingLabel(fontId);
      });

    return () => {
      cancelled = true;
    };
  }, [personalSettings.cardFont]);

  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);

  const reviewSummary = useMemo(() => {
    if (!selectedRecipient || !selectedOccasion) return null;
    return buildReviewSummary(selectedRecipient, selectedOccasion, handwritingLabel);
  }, [handwritingLabel, selectedOccasion, selectedRecipient]);

  const selectedDraftText = selectedTone
    ? editedTexts[selectedTone] ?? cards.find((c) => c.tone === selectedTone)?.text ?? ""
    : "";

  const goToStep = useCallback((nextStep: FiCardCreationStepId) => {
    setStep(nextStep);
  }, []);

  const goNext = useCallback(() => {
    const current = stepIndex(step);
    const next = STEP_ORDER[Math.min(current + 1, STEP_ORDER.length - 1)];
    if (next) setStep(next);
  }, [step]);

  const goBack = useCallback(() => {
    const current = stepIndex(step);
    if (current <= 0) return;
    const previous = STEP_ORDER[current - 1];
    if (previous === "generate") {
      setStep("occasion");
      return;
    }
    if (previous) setStep(previous);
  }, [step]);

  const generate = useCallback(async () => {
    if (!selectedRecipient || !selectedOccasion) return;

    setGenerating(true);
    setGenerateError("");
    setApprovedTone(null);
    setSelectedTone(null);
    setStep("generate");
    trackCardCreationEvent("card_creation_generation_started", {
      recipientId: selectedRecipientId,
      occasion: selectedOccasion,
    });

    const body = buildGenerateCardPayload(selectedRecipient, selectedOccasion);

    try {
      const res = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const generated: GeneratedCardDraft[] = data.cards ?? [];
      setCards(generated);
      const map: Record<string, string> = {};
      generated.forEach((c) => {
        map[c.tone] = c.text;
      });
      setEditedTexts(map);
      setStep("drafts");
      trackCardCreationEvent("card_creation_generation_completed", {
        recipientId: selectedRecipientId,
        occasion: selectedOccasion,
      });
    } catch {
      setGenerateError(cardCreationDefaults.errorLabel);
      setStep("occasion");
      trackCardCreationEvent("card_creation_generation_failed", {
        recipientId: selectedRecipientId,
        occasion: selectedOccasion,
      });
    } finally {
      setGenerating(false);
    }
  }, [selectedOccasion, selectedRecipient, selectedRecipientId]);

  const applyEnhancement = useCallback(async (tone: Tone, actionId: FiEnhancementActionId) => {
    if (!selectedRecipient) return;

    const current = editedTexts[tone] ?? "";
    const instruction = enhancementInstructions[actionId] ?? "Improve this card.";
    const body = buildEditCardPayload(
      selectedRecipient,
      selectedOccasion,
      tone,
      current,
      instruction,
    );

    setEnhancingTone(tone);
    trackCardCreationEvent("card_creation_enhancement_applied", {
      recipientId: selectedRecipientId,
      tone,
      actionId,
    });

    try {
      const res = await fetch("/api/edit-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setEditedTexts((prev) => ({ ...prev, [tone]: data.text }));
        setEnhancingTone(null);
        return;
      }
    } catch {
      // fall through to local fallback
    }

    const suffix: Record<string, string> = {
      warmer: "\n\nP.S. I mean every single word of this.",
      funnier: "\n\nP.S. Dave told me to tell you hi. Dave is still in the doghouse. You're the reason I'm not.",
      shorter: current.split("\n\n").slice(0, 2).join("\n\n"),
      emotional: "\n\n[Note from the editor: He was crying when he approved this.]",
      rewrite: `Dear ${selectedRecipient.name},\n\nThis is a fresh take. Completely different. Probably better.\n\nWith revised feelings,\nMike`,
    };
    setEditedTexts((prev) => ({
      ...prev,
      [tone]: actionId === "shorter" ? suffix.shorter : current + (suffix[actionId] ?? ""),
    }));
    setEnhancingTone(null);
  }, [editedTexts, selectedOccasion, selectedRecipient, selectedRecipientId]);

  const selectTone = useCallback((tone: Tone) => {
    setSelectedTone(tone);
    trackCardCreationEvent("card_creation_tone_selected", {
      recipientId: selectedRecipientId,
      tone,
    });
  }, [selectedRecipientId]);

  const saveDraft = useCallback(() => {
    if (!selectedRecipient || !selectedTone) return;
    const card = getCards().find((c) => c.recipientId === selectedRecipientId);
    if (card) {
      const updated: CardOrder = {
        ...card,
        status: "Card being drafted",
        approvedMessage: editedTexts[selectedTone] ?? "",
      };
      updateCard(updated);
    }
    trackCardCreationEvent("card_creation_draft_saved", {
      recipientId: selectedRecipientId,
      tone: selectedTone,
    });
  }, [editedTexts, selectedRecipient, selectedRecipientId, selectedTone]);

  const approve = useCallback(() => {
    if (!selectedTone) return;
    setApprovedTone(selectedTone);
    const card = getCards().find((c) => c.recipientId === selectedRecipientId);
    if (card) {
      const updated: CardOrder = {
        ...card,
        status: "Approved",
        approvedMessage: editedTexts[selectedTone],
      };
      updateCard(updated);
    }
    setStep("confirm");
    trackCardCreationEvent("card_creation_approved", {
      recipientId: selectedRecipientId,
      tone: selectedTone,
    });
  }, [editedTexts, selectedRecipientId, selectedTone]);

  const startOver = useCallback(() => {
    setStep("recipient");
    setCards([]);
    setApprovedTone(null);
    setSelectedTone(null);
    setEditedTexts({});
    setGenerateError("");
    setSelectedOccasion("");
  }, []);

  const cancel = useCallback(() => {
    trackCardCreationEvent("card_creation_cancelled", { recipientId: selectedRecipientId });
    navigate("/dashboard");
  }, [navigate, selectedRecipientId]);

  const retryGeneration = useCallback(() => {
    setGenerateError("");
    void generate();
  }, [generate]);

  const setEditedText = useCallback((tone: Tone, text: string) => {
    setEditedTexts((prev) => ({ ...prev, [tone]: text }));
  }, []);

  const handleRecipientSelect = useCallback((id: string) => {
    setSelectedRecipientId(id);
    trackCardCreationEvent("card_creation_recipient_selected", { recipientId: id });
  }, []);

  const handleOccasionSelect = useCallback((occasion: string) => {
    setSelectedOccasion(occasion);
    trackCardCreationEvent("card_creation_occasion_selected", {
      recipientId: selectedRecipientId,
      occasion,
    });
  }, [selectedRecipientId]);

  return {
    step,
    stepNumber: stepIndex(step) + 1,
    recipients,
    selectedRecipientId,
    selectedRecipient,
    selectedOccasion,
    occasions: HOLIDAYS,
    cards,
    editedTexts,
    generating,
    generateError,
    enhancingTone,
    selectedTone,
    approvedTone,
    personalSettings,
    handwritingLabel,
    isLoading: generating,
    isEmpty: recipients.length === 0,
    reviewSummary,
    selectedDraftText,
    setSelectedRecipientId: handleRecipientSelect,
    setSelectedOccasion: handleOccasionSelect,
    setEditedText,
    goToStep,
    goNext,
    goBack,
    generate,
    applyEnhancement,
    selectTone,
    saveDraft,
    approve,
    cancel,
    retryGeneration,
    startOver,
  };
}
