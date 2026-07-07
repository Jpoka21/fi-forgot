import { Link } from "wouter";
import { ChevronDown, ChevronUp } from "lucide-react";

import { FiButton } from "@/app/components/button/FiButton";
import { illustrationPaths } from "@/app/design/assets/illustrationPaths";
import { FiRecipientAvatar } from "@/app/components/avatar/FiAvatar";
import { recipientsListDefaults } from "@/app/recipients/recipientsListDomain";
import type { Recipient } from "@/lib/data";

export function FiRecipientsEmptyState() {
  return (
    <div className="fi-recipients__empty">
      <img
        className="fi-recipients__empty-image"
        src={illustrationPaths.people.emptyState}
        alt="A warm illustration of a memory box and keepsakes inviting you to add your first person"
      />
      <h2 className="fi-recipients__title">{recipientsListDefaults.emptyTitle}</h2>
      <p className="fi-recipients__subtitle">{recipientsListDefaults.emptyDescription}</p>
      <FiButton asChild variant="primary">
        <Link href="/recipients/new">{recipientsListDefaults.emptyTitle}</Link>
      </FiButton>
    </div>
  );
}

export interface FiRecipientsNoResultsProps {
  query: string;
}

export function FiRecipientsNoResults({ query }: FiRecipientsNoResultsProps) {
  return (
    <div className="fi-recipients__no-results" role="status">
      <p className="fi-recipients__subtitle">
        No one matches &ldquo;{query}&rdquo;. Try another name or relationship.
      </p>
    </div>
  );
}

export interface FiRecipientsArchivedSectionProps {
  archived: Recipient[];
  showArchived: boolean;
  restoringId: string | null;
  onToggle: () => void;
  onRestore: (recipientId: string) => void;
}

export function FiRecipientsArchivedSection({
  archived,
  showArchived,
  restoringId,
  onToggle,
  onRestore,
}: FiRecipientsArchivedSectionProps) {
  if (archived.length === 0) return null;

  return (
    <section className="fi-recipients__archived-section">
      <button type="button" className="fi-recipients__archived-toggle" onClick={onToggle}>
        <span>
          {recipientsListDefaults.archivedTitle} ({archived.length})
        </span>
        {showArchived ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>

      {showArchived ? (
        <div className="fi-recipients__grid" style={{ marginTop: "var(--fi-space-4)" }}>
          {archived.map((recipient) => (
            <div key={recipient.id} className="fi-recipients__card">
              <div className="fi-recipients__card-row">
                <FiRecipientAvatar name={recipient.name} alt={recipient.name} size="md" />
                <div className="fi-recipients__card-body">
                  <h3 className="fi-recipients__card-name">{recipient.name}</h3>
                  <p className="fi-recipients__card-meta">{recipient.relationship}</p>
                </div>
                <FiButton
                  variant="secondary"
                  size="sm"
                  loading={restoringId === recipient.id}
                  onClick={() => onRestore(recipient.id)}
                >
                  {restoringId === recipient.id
                    ? recipientsListDefaults.restoringLabel
                    : recipientsListDefaults.restoreLabel}
                </FiButton>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
