import { useRef, type ChangeEvent, type KeyboardEvent } from "react";

import { cardEditingDefaults } from "@/app/card-editing/cardEditingDomain";
import type { TextSelectionState } from "@/app/card-editing/hooks/useCardEditing";
import type { SelectionEditActionId } from "@/app/card-editing/cardEditingDomain";
import { SelectedTextToolbar } from "@/app/components/card-editing/SelectedTextToolbar";

export interface CardMessageEditorProps {
  message: string;
  onChange: (value: string) => void;
  onBeforeChange?: () => void;
  onSelectionChange: (textarea: HTMLTextAreaElement | null) => void;
  onSelectionClear: () => void;
  selection: TextSelectionState | null;
  disabled?: boolean;
  busy?: boolean;
  onSelectionEdit: (actionId: SelectionEditActionId) => void;
  onUndo: () => void;
  canUndo: boolean;
  activeEditLabel: string | null;
}

export function CardMessageEditor({
  message,
  onChange,
  onBeforeChange,
  onSelectionChange,
  onSelectionClear,
  selection,
  disabled = false,
  busy = false,
  onSelectionEdit,
  onUndo,
  canUndo,
  activeEditLabel,
}: CardMessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onBeforeChange?.();
    onChange(event.target.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "z" && !event.shiftKey) {
      event.preventDefault();
      if (canUndo) onUndo();
    }
    if (event.key === "Escape") {
      onSelectionClear();
    }
  }

  return (
    <div className="fi-card-editing__editor-wrap">
      <label htmlFor="fi-card-message-editor" className="fi-card-editing__editor-label">
        {cardEditingDefaults.messageLabel}
      </label>
      <textarea
        id="fi-card-message-editor"
        ref={textareaRef}
        className="fi-card-editing__textarea"
        value={message}
        onChange={handleChange}
        onSelect={() => onSelectionChange(textareaRef.current)}
        onKeyUp={() => onSelectionChange(textareaRef.current)}
        onMouseUp={() => onSelectionChange(textareaRef.current)}
        onBlur={() => {
          window.setTimeout(onSelectionClear, 150);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled || busy}
        aria-label={cardEditingDefaults.messageAriaLabel}
        aria-busy={busy || undefined}
        rows={10}
      />
      {busy && activeEditLabel ? (
        <p className="fi-card-editing__editor-status" role="status">
          Concierge is refining: {activeEditLabel}…
        </p>
      ) : null}

      {selection ? (
        <SelectedTextToolbar
          selection={selection}
          busy={busy}
          onAction={onSelectionEdit}
          onUndo={onUndo}
          canUndo={canUndo}
        />
      ) : null}
    </div>
  );
}
