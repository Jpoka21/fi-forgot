import type { Recipient } from "@/lib/data";
import { useCardEditing } from "@/app/card-editing/hooks/useCardEditing";
import {
  extractRecipientMemories,
  type CardDesignPreview,
} from "@/app/card-editing/cardEditingDomain";
import { CardArtworkPicker } from "@/app/components/card-editing/CardArtworkPicker";
import { CardDraftActions } from "@/app/components/card-editing/CardDraftActions";
import { CardEditingToolbar } from "@/app/components/card-editing/CardEditingToolbar";
import { CardLivePreview } from "@/app/components/card-editing/CardLivePreview";
import { CardMessageEditor } from "@/app/components/card-editing/CardMessageEditor";
import { MemoryInsertionPanel } from "@/app/components/card-editing/MemoryInsertionPanel";

export interface FiCardEditingWorkspaceProps {
  recipientName: string;
  occasion: string;
  relationship?: string;
  tone?: string;
  deliveryLabel?: string;
  statusLabel?: string;
  message: string;
  originalMessage: string;
  onMessageChange: (message: string) => void;
  recipient?: Recipient | null;
  design?: CardDesignPreview | null;
  designLoading?: boolean;
  onChangeArtwork?: () => void;
  onZoomArtwork?: () => void;
  onSaveDraft?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  approving?: boolean;
  showApproveActions?: boolean;
  editorId?: string;
}

export function FiCardEditingWorkspace({
  recipientName,
  occasion,
  relationship,
  tone,
  deliveryLabel,
  statusLabel,
  message,
  originalMessage,
  onMessageChange,
  recipient,
  design,
  designLoading = false,
  onChangeArtwork,
  onZoomArtwork,
  onSaveDraft,
  onApprove,
  onReject,
  approving = false,
  showApproveActions = true,
}: FiCardEditingWorkspaceProps) {
  const editing = useCardEditing({
    recipientName,
    holiday: occasion,
    relationship,
    tone,
    message,
    originalMessage,
    onMessageChange,
  });

  const memories = extractRecipientMemories(recipient);
  const busy = Boolean(editing.activeEditLabel);

  return (
    <div className="fi-card-editing">
      <div className="fi-card-editing__layout">
        <div className="fi-card-editing__preview-column">
          <CardLivePreview
            recipientName={recipientName}
            occasion={occasion}
            relationship={relationship}
            deliveryLabel={deliveryLabel}
            statusLabel={statusLabel}
            message={message}
            design={design}
            designLoading={designLoading}
            comparing={editing.comparing}
            originalMessage={originalMessage}
          />
          {onChangeArtwork ? (
            <CardArtworkPicker
              design={design}
              loading={designLoading}
              onChangeArtwork={onChangeArtwork}
              onZoom={onZoomArtwork}
            />
          ) : null}
        </div>

        <div className="fi-card-editing__editor-column">
          <CardMessageEditor
            message={message}
            onChange={editing.setMessage}
            onBeforeChange={editing.pushUndo}
            onSelectionChange={editing.updateSelection}
            onSelectionClear={editing.clearSelection}
            selection={editing.selection}
            disabled={editing.comparing}
            busy={busy}
            onSelectionEdit={editing.applySelectionEdit}
            onUndo={editing.undo}
            canUndo={editing.canUndo}
            activeEditLabel={editing.activeEditLabel}
          />

          {!editing.comparing ? (
            <>
              <CardEditingToolbar
                busy={busy}
                activeEditLabel={editing.activeEditLabel}
                onAction={editing.applyConciergeEdit}
                onRegenerate={editing.regenerateFull}
              />
              <MemoryInsertionPanel
                memories={memories}
                busy={busy}
                onInsert={editing.applyMemoryWeave}
              />
            </>
          ) : null}

          <CardDraftActions
            canUndo={editing.canUndo}
            comparing={editing.comparing}
            busy={busy}
            approving={approving}
            showApprove={showApproveActions}
            showReject={showApproveActions}
            onUndo={editing.undo}
            onCompare={() => editing.setComparing(!editing.comparing)}
            onSaveDraft={onSaveDraft}
            onApprove={onApprove}
            onReject={onReject}
          />
        </div>
      </div>
    </div>
  );
}
