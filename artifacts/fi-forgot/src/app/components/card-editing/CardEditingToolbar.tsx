import { Loader2, RefreshCw, Sparkles } from "lucide-react";

import {
  cardEditingDefaults,
  conciergeEditActions,
  type ConciergeEditActionId,
} from "@/app/card-editing/cardEditingDomain";
import { FiButton } from "@/app/components/button/FiButton";

export interface CardEditingToolbarProps {
  busy: boolean;
  activeEditLabel: string | null;
  onAction: (actionId: ConciergeEditActionId) => void;
  onRegenerate: () => void;
}

export function CardEditingToolbar({
  busy,
  activeEditLabel,
  onAction,
  onRegenerate,
}: CardEditingToolbarProps) {
  return (
    <div className="fi-card-editing__toolbar" role="group" aria-labelledby="fi-card-editing-toolbar-title">
      <div className="fi-card-editing__toolbar-header">
        <h3 id="fi-card-editing-toolbar-title" className="fi-card-editing__toolbar-title">
          {cardEditingDefaults.conciergeTitle}
        </h3>
        <p className="fi-card-editing__toolbar-subtitle">{cardEditingDefaults.conciergeSubtitle}</p>
      </div>

      <div className="fi-card-editing__toolbar-actions">
        {conciergeEditActions.map((action) => {
          const isLoading = busy && activeEditLabel === action.label;
          return (
            <button
              key={action.id}
              type="button"
              className="fi-card-editing__toolbar-chip"
              onClick={() => onAction(action.id)}
              disabled={busy}
              aria-label={`${action.label} for entire message`}
              aria-busy={isLoading || undefined}
            >
              {isLoading ? (
                <Loader2 size={14} className="fi-card-editing__spin" aria-hidden />
              ) : (
                <Sparkles size={14} aria-hidden />
              )}
              {action.label}
            </button>
          );
        })}
      </div>

      <FiButton
        variant="secondary"
        size="sm"
        onClick={onRegenerate}
        disabled={busy}
        loading={busy && activeEditLabel === "Regenerate"}
        leftIcon={<RefreshCw size={14} />}
        aria-label="Regenerate entire message"
      >
        Regenerate message
      </FiButton>
    </div>
  );
}
