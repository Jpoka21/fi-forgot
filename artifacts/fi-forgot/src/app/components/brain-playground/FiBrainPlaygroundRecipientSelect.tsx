import { brainPlaygroundDefaults } from "@/app/brain-playground/brainPlaygroundDomain";
import type { Recipient } from "@/lib/data";

export interface FiBrainPlaygroundRecipientSelectProps {
  recipients: Recipient[];
  selectedRecipientId: string;
  onSelectRecipient: (recipientId: string) => void;
}

export function FiBrainPlaygroundRecipientSelect({
  recipients,
  selectedRecipientId,
  onSelectRecipient,
}: FiBrainPlaygroundRecipientSelectProps) {
  const selectId = "brain-playground-recipient-select";

  return (
    <label className="fi-brain-playground__select-label" htmlFor={selectId}>
      <span className="fi-brain-playground__select-text">
        {brainPlaygroundDefaults.recipientSelectLabel}
      </span>
      <select
        id={selectId}
        className="fi-brain-playground__select"
        value={selectedRecipientId}
        onChange={(event) => onSelectRecipient(event.target.value)}
        aria-label={brainPlaygroundDefaults.recipientSelectLabel}
      >
        <option value="">{brainPlaygroundDefaults.recipientSelectPlaceholder}</option>
        {recipients.map((recipient) => (
          <option key={recipient.id} value={recipient.id}>
            {recipient.name} — {recipient.id}
          </option>
        ))}
      </select>
    </label>
  );
}
