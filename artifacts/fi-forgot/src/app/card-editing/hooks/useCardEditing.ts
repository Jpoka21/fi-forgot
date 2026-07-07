import { useCallback, useRef, useState } from "react";

import {
  buildMemoryWeaveInstruction,
  buildSelectionEditInstruction,
  type ConciergeEditActionId,
  type SelectionEditActionId,
  conciergeEditActions,
  selectionEditActions,
} from "@/app/card-editing/cardEditingDomain";

const MAX_UNDO = 30;

export interface UseCardEditingOptions {
  recipientName: string;
  holiday: string;
  relationship?: string;
  tone?: string;
  message: string;
  originalMessage: string;
  onMessageChange: (message: string) => void;
}

export interface TextSelectionState {
  start: number;
  end: number;
  text: string;
  top: number;
  left: number;
}

export interface UseCardEditingResult {
  message: string;
  originalMessage: string;
  canUndo: boolean;
  comparing: boolean;
  activeEditLabel: string | null;
  selection: TextSelectionState | null;
  setComparing: (value: boolean) => void;
  setMessage: (value: string) => void;
  pushUndo: () => void;
  undo: () => void;
  updateSelection: (textarea: HTMLTextAreaElement | null) => void;
  clearSelection: () => void;
  applyConciergeEdit: (actionId: ConciergeEditActionId) => Promise<void>;
  applySelectionEdit: (actionId: SelectionEditActionId) => Promise<void>;
  applyCustomEdit: (instruction: string, label: string) => Promise<void>;
  applyMemoryWeave: (memoryText: string) => Promise<void>;
  regenerateFull: () => Promise<void>;
}

export function useCardEditing(options: UseCardEditingOptions): UseCardEditingResult {
  const {
    recipientName,
    holiday,
    relationship = "friend",
    tone,
    message,
    originalMessage,
    onMessageChange,
  } = options;

  const undoStack = useRef<string[]>([]);
  const [undoCount, setUndoCount] = useState(0);
  const [comparing, setComparing] = useState(false);
  const [activeEditLabel, setActiveEditLabel] = useState<string | null>(null);
  const [selection, setSelection] = useState<TextSelectionState | null>(null);

  const pushUndo = useCallback(() => {
    undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), message];
    setUndoCount(undoStack.current.length);
  }, [message]);

  const undo = useCallback(() => {
    const previous = undoStack.current.pop();
    setUndoCount(undoStack.current.length);
    if (previous != null) {
      onMessageChange(previous);
    }
  }, [onMessageChange]);

  const callEditApi = useCallback(
    async (instruction: string, label: string) => {
      setActiveEditLabel(label);
      pushUndo();
      try {
        const res = await fetch("/api/edit-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientName,
            holiday,
            relationship,
            tone,
            currentCardText: message,
            instruction,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { card?: string };
          if (data.card) {
            onMessageChange(data.card);
            return;
          }
        }
        undoStack.current.pop();
        setUndoCount(undoStack.current.length);
      } catch {
        undoStack.current.pop();
        setUndoCount(undoStack.current.length);
      } finally {
        setActiveEditLabel(null);
        setSelection(null);
      }
    },
    [holiday, message, onMessageChange, pushUndo, recipientName, relationship, tone],
  );

  const applyCustomEdit = useCallback(
    (instruction: string, label: string) => callEditApi(instruction, label),
    [callEditApi],
  );

  const applyConciergeEdit = useCallback(
    async (actionId: ConciergeEditActionId) => {
      const action = conciergeEditActions.find((item) => item.id === actionId);
      if (!action) return;
      await callEditApi(action.instruction, action.label);
    },
    [callEditApi],
  );

  const applySelectionEdit = useCallback(
    async (actionId: SelectionEditActionId) => {
      if (!selection?.text.trim()) return;
      const action = selectionEditActions.find((item) => item.id === actionId);
      if (!action) return;
      const instruction = buildSelectionEditInstruction(selection.text, action.instruction);
      await callEditApi(instruction, `${action.label} selection`);
    },
    [callEditApi, selection],
  );

  const applyMemoryWeave = useCallback(
    async (memoryText: string) => {
      const instruction = buildMemoryWeaveInstruction(recipientName, memoryText);
      await callEditApi(instruction, "Add memory");
    },
    [callEditApi, recipientName],
  );

  const regenerateFull = useCallback(async () => {
    await callEditApi(
      "Completely rewrite this card in a fresh way while keeping the same recipient, occasion, and general tone.",
      "Regenerate",
    );
  }, [callEditApi]);

  const updateSelection = useCallback((textarea: HTMLTextAreaElement | null) => {
    if (!textarea) {
      setSelection(null);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) {
      setSelection(null);
      return;
    }
    const selectedText = message.slice(start, end);
    if (!selectedText.trim()) {
      setSelection(null);
      return;
    }

    const rect = textarea.getBoundingClientRect();
    const style = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    const lines = (message.substring(0, end).match(/\n/g) ?? []).length;
    const top = rect.top + window.scrollY + Math.min(lines * lineHeight, textarea.clientHeight - 40);
    const left = rect.left + window.scrollX + 16;

    setSelection({ start, end, text: selectedText, top, left });
  }, [message]);

  const clearSelection = useCallback(() => setSelection(null), []);

  return {
    message,
    originalMessage,
    canUndo: undoCount > 0,
    comparing,
    activeEditLabel,
    selection,
    setComparing,
    setMessage: onMessageChange,
    pushUndo,
    undo,
    updateSelection,
    clearSelection,
    applyConciergeEdit,
    applySelectionEdit,
    applyCustomEdit,
    applyMemoryWeave,
    regenerateFull,
  };
}
