import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";

import { FiButton } from "@/app/components/button/FiButton";
import { cardCreationDefaults } from "@/app/card-creation/cardCreationDomain";
import { getFiCardCreationPanelClassName } from "@/app/components/card-creation/cardCreationVariants";
import type { Recipient } from "@/lib/data";

export interface FiCardCreationEmptyStateProps {
  onCancel: () => void;
}

export function FiCardCreationEmptyState({ onCancel }: FiCardCreationEmptyStateProps) {
  return (
    <div className={getFiCardCreationPanelClassName()}>
      <div className="fi-card-creation__empty" role="status">
        <h2 className="fi-card-creation__panel-title">{cardCreationDefaults.emptyRecipientsLabel}</h2>
        <p className="fi-card-creation__panel-copy">
          Add someone to your circle first, then come back to create a thoughtful card.
        </p>
        <div className="fi-card-creation__actions" style={{ justifyContent: "center" }}>
          <FiButton asChild variant="primary">
            <Link href="/recipients/new">Add recipient</Link>
          </FiButton>
          <FiButton variant="ghost" onClick={onCancel}>
            {cardCreationDefaults.cancelLabel}
          </FiButton>
        </div>
      </div>
    </div>
  );
}

export interface FiCardCreationRecipientStepProps {
  recipients: Recipient[];
  selectedRecipientId: string;
  onSelectRecipient: (id: string) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function FiCardCreationRecipientStep({
  recipients,
  selectedRecipientId,
  onSelectRecipient,
  onNext,
  onCancel,
}: FiCardCreationRecipientStepProps) {
  return (
    <section className={getFiCardCreationPanelClassName()} aria-labelledby="card-creation-recipient-title">
      <div>
        <h2 id="card-creation-recipient-title" className="fi-card-creation__panel-title">
          {cardCreationDefaults.recipientStepTitle}
        </h2>
        <p className="fi-card-creation__panel-copy">{cardCreationDefaults.recipientStepDescription}</p>
      </div>

      <div className="fi-card-creation__recipient-list" role="listbox" aria-label="Recipients">
        {recipients.map((recipient) => {
          const selected = selectedRecipientId === recipient.id;
          return (
            <button
              key={recipient.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={`fi-card-creation__recipient-option${selected ? " fi-card-creation__recipient-option--selected" : ""}`}
              onClick={() => onSelectRecipient(recipient.id)}
              data-testid={`button-select-recipient-${recipient.id}`}
            >
              <span className="fi-card-creation__avatar" aria-hidden="true">
                {recipient.name.charAt(0)}
              </span>
              <span className="flex-1">
                <div className="fi-card-creation__recipient-name">{recipient.name}</div>
                <div className="fi-card-creation__recipient-meta">{recipient.relationship}</div>
              </span>
              {selected ? <CheckCircle2 size={20} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div className="fi-card-creation__actions">
        <FiButton
          variant="primary"
          onClick={onNext}
          disabled={!selectedRecipientId}
          data-testid="button-step1-next"
        >
          Next
        </FiButton>
        <FiButton variant="ghost" onClick={onCancel}>
          {cardCreationDefaults.cancelLabel}
        </FiButton>
      </div>
    </section>
  );
}
