import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

import { FiRecipientAvatar } from "@/app/components/avatar/FiAvatar";
import {
  getFiRecipientsSectionClassName,
} from "@/app/components/recipients/recipientsVariants";
import {
  occasionLine,
  recipientsListDefaults,
  type RecipientComingUpItem,
} from "@/app/recipients/recipientsListDomain";
import { FiRecipientsPersonCard } from "@/app/components/recipients/FiRecipientsPersonCard";
import type { Recipient } from "@/lib/data";
import type { RecipientHealth } from "@/lib/relationship-health";

export interface FiRecipientsGroupSectionProps {
  title: string;
  recipients: Recipient[];
  healthById: Map<string, RecipientHealth>;
}

export function FiRecipientsGroupSection({
  title,
  recipients,
  healthById,
}: FiRecipientsGroupSectionProps) {
  if (recipients.length === 0) return null;

  return (
    <section className={getFiRecipientsSectionClassName()}>
      <h2 className="fi-recipients__section-title">{title}</h2>
      <div className="fi-recipients__grid">
        {recipients.map((recipient) => (
          <FiRecipientsPersonCard
            key={recipient.id}
            recipient={recipient}
            health={healthById.get(recipient.id) ?? healthById.get(recipient.name)}
          />
        ))}
      </div>
    </section>
  );
}

export interface FiRecipientsComingUpProps {
  items: RecipientComingUpItem[];
}

export function FiRecipientsComingUp({ items }: FiRecipientsComingUpProps) {
  if (items.length === 0) return null;

  return (
    <section className={getFiRecipientsSectionClassName()} aria-labelledby="fi-recipients-coming-up">
      <div>
        <h2 id="fi-recipients-coming-up" className="fi-recipients__section-title">
          {recipientsListDefaults.comingUpTitle}
        </h2>
        <p className="fi-recipients__section-subtitle">{recipientsListDefaults.comingUpSubtitle}</p>
      </div>
      <div className="fi-recipients__section">
        {items.map(({ recipient, event, daysAway }) => (
          <Link
            key={`${recipient.id}-${event}`}
            href={`/relationship/${recipient.id}`}
            className="fi-recipients__coming-row"
          >
            <FiRecipientAvatar name={recipient.name} alt={recipient.name} size="md" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "var(--fi-text-body-sm)" }}>{recipient.name}</div>
              <div style={{
                fontSize: "var(--fi-text-body-sm)",
                color: daysAway <= 7 ? "var(--fi-color-brand-accent)" : "var(--fi-color-text-secondary)",
              }}
              >
                {occasionLine(event, daysAway)}
              </div>
            </div>
            <ArrowRight size={16} aria-hidden="true" style={{ opacity: 0.4 }} />
          </Link>
        ))}
      </div>
    </section>
  );
}
