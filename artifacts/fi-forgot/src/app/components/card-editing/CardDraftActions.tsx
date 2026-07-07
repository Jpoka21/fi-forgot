import { GitCompare, Save, ThumbsUp, Undo2 } from "lucide-react";

import { cardEditingDefaults } from "@/app/card-editing/cardEditingDomain";
import { FiButton } from "@/app/components/button/FiButton";

export interface CardDraftActionsProps {
  canUndo: boolean;
  comparing: boolean;
  busy?: boolean;
  approving?: boolean;
  showApprove?: boolean;
  showReject?: boolean;
  onUndo: () => void;
  onCompare: () => void;
  onSaveDraft?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export function CardDraftActions({
  canUndo,
  comparing,
  busy = false,
  approving = false,
  showApprove = true,
  showReject = true,
  onUndo,
  onCompare,
  onSaveDraft,
  onApprove,
  onReject,
}: CardDraftActionsProps) {
  return (
    <div className="fi-card-editing__draft-actions" role="group" aria-label="Draft actions">
      <div className="fi-card-editing__draft-actions-row">
        <FiButton
          variant="secondary"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo || busy || comparing}
          leftIcon={<Undo2 size={14} />}
          aria-label={cardEditingDefaults.undoLabel}
        >
          {cardEditingDefaults.undoLabel}
        </FiButton>

        <FiButton
          variant="secondary"
          size="sm"
          onClick={onCompare}
          disabled={busy}
          leftIcon={<GitCompare size={14} />}
          aria-pressed={comparing}
          aria-label={comparing ? cardEditingDefaults.compareClose : cardEditingDefaults.compareLabel}
        >
          {comparing ? cardEditingDefaults.compareClose : cardEditingDefaults.compareLabel}
        </FiButton>

        {onSaveDraft ? (
          <FiButton
            variant="secondary"
            size="sm"
            onClick={onSaveDraft}
            disabled={busy || comparing}
            leftIcon={<Save size={14} />}
            aria-label={cardEditingDefaults.saveDraftLabel}
          >
            {cardEditingDefaults.saveDraftLabel}
          </FiButton>
        ) : null}
      </div>

      {(showApprove || showReject) && (
        <div className="fi-card-editing__draft-actions-primary">
          {showReject && onReject ? (
            <FiButton variant="secondary" onClick={onReject} disabled={busy || approving}>
              {cardEditingDefaults.rejectLabel}
            </FiButton>
          ) : null}
          {showApprove && onApprove ? (
            <FiButton
              variant="primary"
              onClick={onApprove}
              disabled={busy || approving}
              loading={approving}
              leftIcon={<ThumbsUp size={16} />}
              aria-label={cardEditingDefaults.approveLabel}
            >
              {cardEditingDefaults.approveLabel}
            </FiButton>
          ) : null}
        </div>
      )}
    </div>
  );
}
