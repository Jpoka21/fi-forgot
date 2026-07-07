import { Link, useLocation } from "wouter";

import type { Recipient } from "@/lib/data";
import { occasionPhrase, isSensitiveOccasion } from "@/lib/personal-brand";
import type { TrackedEventData } from "@/app/relationship-profile/relationshipProfileDomain";
import { FiRecipientAvatar } from "@/app/components/avatar/FiAvatar";
import { FiButton } from "@/app/components/button/FiButton";
import { illustrationPaths } from "@/app/design/assets/illustrationPaths";
import type { CardOrder } from "@/lib/data";

export interface FiRelationshipProfileHeaderProps {
  recipient: Recipient;
  recipientId: string;
  nextEvent: TrackedEventData | null;
  cardByEvent: Map<string, CardOrder>;
  onFocusMemory: () => void;
}

export function FiRelationshipProfileHeader({
  recipient,
  recipientId,
  nextEvent,
  cardByEvent,
  onFocusMemory,
}: FiRelationshipProfileHeaderProps) {
  const [, setLocation] = useLocation();
  const primaryEvent = nextEvent?.daysAway != null ? nextEvent : null;
  const existingCard = primaryEvent ? cardByEvent.get(primaryEvent.event) : undefined;

  return (
    <header className="fi-relationship-profile__hero fi-relationship-profile__card">
      <img
        src={illustrationPaths.relationship.profileHeader}
        alt=""
        aria-hidden
        style={{ width: "100%", maxWidth: 280 }}
      />
      <div className="fi-relationship-profile__hero-row">
        <FiRecipientAvatar name={recipient.name} alt={recipient.name} size="lg" />
        <div>
          <h1 className="fi-relationship-profile__name">{recipient.name}</h1>
          <p className="fi-relationship-profile__meta">{recipient.relationship}</p>
          {primaryEvent?.dateStr && primaryEvent.daysAway != null ? (
            <p className="fi-relationship-profile__copy">
              {occasionPhrase(
                primaryEvent.event,
                primaryEvent.daysAway,
                primaryEvent.dateStr,
                isSensitiveOccasion(primaryEvent.event),
              )}
            </p>
          ) : null}
        </div>
      </div>
      <div className="fi-relationship-profile__actions">
        {primaryEvent ? (
          <FiButton
            variant="primary"
            size="sm"
            onClick={() =>
              setLocation(
                existingCard
                  ? `/briefings/${recipientId}/${encodeURIComponent(primaryEvent.event)}?rewrite=1`
                  : `/briefings/${recipientId}/${encodeURIComponent(primaryEvent.event)}`,
              )
            }
          >
            {existingCard ? "Review the card" : "Write the card"}
          </FiButton>
        ) : null}
        <FiButton variant="secondary" size="sm" onClick={onFocusMemory}>
          Add a memory
        </FiButton>
        <FiButton asChild variant="ghost" size="sm">
          <Link href={`/recipients/${recipientId}?edit=1`}>Edit details</Link>
        </FiButton>
      </div>
    </header>
  );
}
