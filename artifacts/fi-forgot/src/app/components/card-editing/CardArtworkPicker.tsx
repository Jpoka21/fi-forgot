import { Loader2, RefreshCw } from "lucide-react";

import { cardEditingDefaults, type CardDesignPreview } from "@/app/card-editing/cardEditingDomain";
import { FiButton } from "@/app/components/button/FiButton";

export interface CardArtworkPickerProps {
  design?: CardDesignPreview | null;
  loading?: boolean;
  onChangeArtwork: () => void;
  onZoom?: () => void;
}

export function CardArtworkPicker({
  design,
  loading = false,
  onChangeArtwork,
  onZoom,
}: CardArtworkPickerProps) {
  if (!design && !loading) return null;

  return (
    <div className="fi-card-editing__artwork-picker">
      {design?.name ? (
        <p className="fi-card-editing__artwork-name">{design.name}</p>
      ) : null}
      <div className="fi-card-editing__artwork-picker-actions">
        <FiButton
          variant="secondary"
          size="sm"
          onClick={onChangeArtwork}
          disabled={loading}
          loading={loading}
          leftIcon={loading ? undefined : <RefreshCw size={14} />}
          aria-label={cardEditingDefaults.artworkChangeLabel}
        >
          {loading ? cardEditingDefaults.artworkLoadingLabel : cardEditingDefaults.artworkChangeLabel}
        </FiButton>
        {design?.imageUrl && onZoom ? (
          <FiButton variant="ghost" size="sm" onClick={onZoom} aria-label="View artwork full size">
            View full size
          </FiButton>
        ) : null}
      </div>
    </div>
  );
}
