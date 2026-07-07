import { useCallback, useEffect, useMemo, useState } from "react";

import { trackAiAutomationEvent } from "@/app/ai-automation/aiAutomationAnalytics";
import {
  AI_PROMPT_SURFACES,
  aiAutomationDefaults,
} from "@/app/ai-automation/aiAutomationDomain";
import {
  buildAiActivity,
  buildAiHealthSnapshot,
  buildAiUsageStats,
  buildAutomationMonitoring,
  readPromptNotes,
  writePromptNotes,
} from "@/app/ai-automation/aiAutomationEngine";
import type { AdminTab } from "@/app/admin/adminDomain";

export function useAiAdmin({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const [selectedPromptId, setSelectedPromptId] = useState(AI_PROMPT_SURFACES[0]?.id ?? "");
  const [promptNotes, setPromptNotes] = useState(() => readPromptNotes());
  const [notesDraft, setNotesDraft] = useState("");

  const activity = useMemo(() => buildAiActivity(), []);
  const usage = useMemo(() => buildAiUsageStats(), []);
  const health = useMemo(() => buildAiHealthSnapshot(), []);
  const monitoring = useMemo(() => buildAutomationMonitoring(), []);

  const selectedPrompt = useMemo(
    () => AI_PROMPT_SURFACES.find((surface) => surface.id === selectedPromptId) ?? AI_PROMPT_SURFACES[0],
    [selectedPromptId],
  );

  useEffect(() => {
    trackAiAutomationEvent("ai_admin_opened");
  }, []);

  useEffect(() => {
    if (selectedPrompt) {
      setNotesDraft(promptNotes[selectedPrompt.id] ?? "");
    }
  }, [promptNotes, selectedPrompt]);

  const saveNotes = useCallback(() => {
    if (!selectedPrompt) return;
    const next = { ...promptNotes, [selectedPrompt.id]: notesDraft };
    setPromptNotes(next);
    writePromptNotes(next);
    trackAiAutomationEvent("ai_prompt_notes_saved", { surface: selectedPrompt.id });
  }, [notesDraft, promptNotes, selectedPrompt]);

  return {
    defaults: aiAutomationDefaults,
    selectedPromptId,
    setSelectedPromptId,
    selectedPrompt,
    promptSurfaces: AI_PROMPT_SURFACES,
    notesDraft,
    setNotesDraft,
    saveNotes,
    activity,
    usage,
    health,
    monitoring,
    onNavigate,
  };
}

export type AiAdminController = ReturnType<typeof useAiAdmin>;
