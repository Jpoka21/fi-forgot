import { Loader2, Undo2 } from "lucide-react";

import {
  cardEditingDefaults,
  selectionEditActions,
  type SelectionEditActionId,
} from "@/app/card-editing/cardEditingDomain";
import type { TextSelectionState } from "@/app/card-editing/hooks/useCardEditing";

export interface SelectedTextToolbarProps {
  selection: TextSelectionState;
  busy: boolean;
  canUndo: boolean;
  onAction: (actionId: SelectionEditActionId) => void;
  onUndo: () => void;
}

export function SelectedTextToolbar({
  selection,
  busy,
  canUndo,
  onAction,
  onUndo,
}: SelectedTextToolbarProps) {
  return (
    <div
      className="fi-card-editing__selection-toolbar"
      role="toolbar"
      aria-label={cardEditingDefaults.selectionToolbarLabel}
      style={{ top: selection.top, left: selection.left }}
    >
      {selectionEditActions.map((action) => (
        <button
          key={action.id}
          type="button"
          className="fi-card-editing__selection-chip"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onAction(action.id)}
          disabled={busy}
          aria-label={`${action.label} selected text`}
        >
          {action.label}
        </button>
      ))}
      <button
        type="button"
        className="fi-card-editing__selection-chip fi-card-editing__selection-chip--undo"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onUndo}
        disabled={busy || !canUndo}
        aria-label="Undo last change"
      >
        {busy ? <Loader2 size={12} className="fi-card-editing__spin" aria-hidden /> : <Undo2 size={12} aria-hidden />}
        Undo
      </button>
    </div>
  );
}
