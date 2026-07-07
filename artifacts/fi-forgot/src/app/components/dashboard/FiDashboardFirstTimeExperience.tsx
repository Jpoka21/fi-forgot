import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Plus } from "lucide-react";

import { cardOutcomeLabel } from "@/app/dashboard/dashboardDomain";
import type { CardOrder, Recipient } from "@/lib/data";
import { FiRecipientAvatar } from "@/app/components/avatar/FiAvatar";
import { FiButton } from "@/app/components/button/FiButton";
import { FiDashboardCard } from "@/app/components/card/FiCard";

export interface FiDashboardFirstTimeExperienceProps {
  recipient: Recipient;
  card?: CardOrder;
  onViewCard: (cardId: string) => void;
  onDismiss: () => void;
}

export function FiDashboardFirstTimeExperience({
  recipient,
  card,
  onViewCard,
  onDismiss,
}: FiDashboardFirstTimeExperienceProps) {
  const cardHasAddress = !!card?.overrideAddress?.line1?.trim();
  const recipientHasAddress = !!recipient.mailingAddress?.line1?.trim();
  const needsAddressNudge = !cardHasAddress && !recipientHasAddress;

  return (
    <div>
      <header className="fi-dashboard__hero">
        <h1 className="fi-dashboard__headline">You're all set for {recipient.name}</h1>
        <p className="fi-dashboard__subheadline">We'll take it from here.</p>
      </header>

      <FiDashboardCard className="fi-dashboard__summary-card">
        <div className="fi-dashboard__upcoming-header">
          <CheckCircle2 size={20} aria-hidden />
          <div>
            <h2 className="fi-dashboard__upcoming-name">First card prepared</h2>
            <p className="fi-dashboard__section-copy">
              {card
                ? `${card.holiday} for ${recipient.name} — ${cardOutcomeLabel(card.status).toLowerCase()}.`
                : "Your card is being prepared."}
            </p>
          </div>
        </div>
      </FiDashboardCard>

      <FiDashboardCard className="fi-dashboard__summary-card">
        <div className="fi-dashboard__upcoming-header">
          <FiRecipientAvatar name={recipient.name} alt={recipient.name} size="lg" />
          <div>
            <h2 className="fi-dashboard__upcoming-name">{recipient.name}</h2>
            <p className="fi-dashboard__meta">{recipient.relationship}</p>
            {card ? <p className="fi-dashboard__meta">{cardOutcomeLabel(card.status)}</p> : null}
          </div>
        </div>

        {card?.approvedMessage ? (
          <div className="fi-dashboard__section-copy" style={{ marginTop: "1rem" }}>
            <p className="fi-dashboard__meta">{card.holiday}</p>
            <p>{card.approvedMessage}</p>
            <FiButton variant="link" size="sm" onClick={() => onViewCard(card.id)}>
              View full card <ArrowRight size={14} aria-hidden />
            </FiButton>
          </div>
        ) : null}
      </FiDashboardCard>

      {needsAddressNudge ? (
        <FiDashboardCard className="fi-dashboard__summary-card">
          <h2 className="fi-dashboard__upcoming-name">Mailing address needed for {recipient.name}</h2>
          <p className="fi-dashboard__section-copy">We can't mail a card without it.</p>
          <FiButton asChild variant="link" size="sm">
            <Link href={`/relationship/${recipient.id}`}>Add address</Link>
          </FiButton>
        </FiDashboardCard>
      ) : null}

      <Link href="/recipients/new">
        <FiDashboardCard className="fi-dashboard__summary-card" interactive>
          <div className="fi-dashboard__upcoming-header">
            <Plus size={18} aria-hidden />
            <span className="fi-dashboard__quick-action-label">Add another person</span>
          </div>
        </FiDashboardCard>
      </Link>

      <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
        <FiButton variant="ghost" size="sm" onClick={onDismiss}>
          Show me the full home page
        </FiButton>
      </div>
    </div>
  );
}
