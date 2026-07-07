import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

import { FiRecipientAvatar } from "@/app/components/avatar/FiAvatar";
import { FiButton } from "@/app/components/button/FiButton";
import { getNextOccasion } from "@/lib/personal-brand";
import type { Recipient } from "@/lib/data";
import type { RecipientHealth } from "@/lib/relationship-health";
import {
  getFiRecipientsCardClassName,
} from "@/app/components/recipients/recipientsVariants";
import { occasionLine, warmHint } from "@/app/recipients/recipientsListDomain";

export interface FiRecipientsPersonCardProps {
  recipient: Recipient;
  health?: RecipientHealth;
}

export function FiRecipientsPersonCard({ recipient, health }: FiRecipientsPersonCardProps) {
  const next = getNextOccasion(recipient);
  const urgent = Boolean(next && next.daysAway <= 7);
  const hint = warmHint(health, recipient);

  return (
    <div className={getFiRecipientsCardClassName(false, urgent)}>
      <Link href={`/relationship/${recipient.id}`} className="fi-recipients__card-row" style={{ textDecoration: "none", color: "inherit" }}>
        <FiRecipientAvatar name={recipient.name} alt={recipient.name} size="lg" />
        <div className="fi-recipients__card-body">
          <h3 className="fi-recipients__card-name">{recipient.name}</h3>
          <p className="fi-recipients__card-meta">{recipient.relationship}</p>
          {next ? (
            <span className={`fi-recipients__occasion-pill${urgent ? " fi-recipients__occasion-pill--urgent" : ""}`}>
              {occasionLine(next.event, next.daysAway)}
            </span>
          ) : (recipient.selectedEvents?.length ?? 0) > 0 ? (
            <span className="fi-recipients__occasion-pill">
              {recipient.selectedEvents!.length} occasion{recipient.selectedEvents!.length === 1 ? "" : "s"} on file
            </span>
          ) : (
            <span className="fi-recipients__occasion-pill">No occasions yet — easy to add</span>
          )}
          {hint ? <p className="fi-recipients__hint">{hint}</p> : null}
        </div>
        <ArrowRight size={18} aria-hidden="true" style={{ opacity: 0.5, flexShrink: 0 }} />
      </Link>

      <div className="fi-recipients__quick-actions">
        <FiButton asChild variant="secondary" size="sm">
          <Link href={`/recipients/${recipient.id}?edit=1`}>Edit profile</Link>
        </FiButton>
        <FiButton asChild variant="ghost" size="sm">
          <Link href="/cards/generate">Write a card</Link>
        </FiButton>
      </div>
    </div>
  );
}
