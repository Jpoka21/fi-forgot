import { FiButton } from "@/app/components/button/FiButton";
import { brainPlaygroundDefaults } from "@/app/brain-playground/brainPlaygroundDomain";
import type { ProductBrainFetchStatus } from "@/app/brain-playground/hooks/useProductBrainDecision";
import type { Recipient } from "@/lib/data";
import { FiBrainPlaygroundRecipientSelect } from "./FiBrainPlaygroundRecipientSelect";

export interface FiBrainPlaygroundToolbarProps {
  recipients: Recipient[];
  selectedRecipientId: string;
  onSelectRecipient: (recipientId: string) => void;
  onRefresh: () => void;
  status: ProductBrainFetchStatus;
  fetchedAt: string | null;
}

export function FiBrainPlaygroundToolbar({
  recipients,
  selectedRecipientId,
  onSelectRecipient,
  onRefresh,
  status,
  fetchedAt,
}: FiBrainPlaygroundToolbarProps) {
  return (
    <div className="fi-brain-playground__toolbar">
      <FiBrainPlaygroundRecipientSelect
        recipients={recipients}
        selectedRecipientId={selectedRecipientId}
        onSelectRecipient={onSelectRecipient}
      />
      <FiButton
        variant="secondary"
        size="sm"
        onClick={onRefresh}
        disabled={!selectedRecipientId || status === "loading"}
      >
        {brainPlaygroundDefaults.refreshLabel}
      </FiButton>
      {fetchedAt ? (
        <p className="fi-brain-playground__fetched-at" aria-live="polite">
          Last fetched: <time dateTime={fetchedAt}>{fetchedAt}</time>
        </p>
      ) : null}
    </div>
  );
}
