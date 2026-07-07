import { illustrationPaths } from "@/app/design/assets/illustrationPaths";
import {
  cardEditingDefaults,
  type CardDesignPreview,
} from "@/app/card-editing/cardEditingDomain";

export interface CardLivePreviewProps {
  recipientName: string;
  occasion: string;
  relationship?: string;
  deliveryLabel?: string;
  statusLabel?: string;
  message: string;
  design?: CardDesignPreview | null;
  designLoading?: boolean;
  comparing?: boolean;
  originalMessage?: string;
}

export function CardLivePreview({
  recipientName,
  occasion,
  relationship,
  deliveryLabel,
  statusLabel,
  message,
  design,
  designLoading = false,
  comparing = false,
  originalMessage,
}: CardLivePreviewProps) {
  const displayMessage = comparing && originalMessage ? originalMessage : message;

  return (
    <section
      className="fi-card-editing__preview"
      aria-label={cardEditingDefaults.previewLabel}
    >
      <div className="fi-card-editing__preview-meta">
        <div>
          <p className="fi-card-editing__preview-to">For {recipientName}</p>
          <p className="fi-card-editing__preview-occasion">
            {relationship ? `${relationship} · ` : ""}
            {occasion}
          </p>
          {deliveryLabel ? (
            <p className="fi-card-editing__preview-delivery">{deliveryLabel}</p>
          ) : null}
        </div>
        {statusLabel ? (
          <span className="fi-card-editing__preview-status">{statusLabel}</span>
        ) : null}
      </div>

      <div className="fi-card-editing__stationery">
        <div className="fi-card-editing__artwork-frame">
          {designLoading ? (
            <div className="fi-card-editing__artwork-loading" role="status">
              <img
                src={illustrationPaths.loading.preparing}
                alt=""
                aria-hidden
                className="fi-card-editing__artwork-loading-art"
              />
              <span>{cardEditingDefaults.artworkLoadingLabel}</span>
            </div>
          ) : design?.imageUrl ? (
            <img
              src={design.imageUrl}
              alt={design.name}
              className="fi-card-editing__artwork-image"
            />
          ) : (
            <div
              className="fi-card-editing__artwork-placeholder"
              role="img"
              aria-label={cardEditingDefaults.artworkPlaceholder}
            >
              <span className="fi-card-editing__artwork-placeholder-label">Card artwork</span>
            </div>
          )}
        </div>

        <div className="fi-card-editing__message-panel" aria-live="polite">
          {comparing ? (
            <p className="fi-card-editing__compare-badge">Original AI draft</p>
          ) : null}
          <p className="fi-card-editing__handwritten-message">
            {displayMessage || "Your message will appear here as you write."}
          </p>
        </div>
      </div>
    </section>
  );
}
