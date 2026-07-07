import { FiRecipientAvatar } from "@/app/components/avatar/FiAvatar";
import { FiRelationshipHealthBadge } from "@/app/components/badge/FiBadge";
import { resolveRelationshipHealthLevel } from "@/app/components/badge/badgeDomain";
import type { FiRecipientProfileSnapshot } from "@/app/recipient/recipientDomain";

export interface FiRecipientSummaryProps {
  profile: FiRecipientProfileSnapshot;
}

export function FiRecipientSummary({ profile }: FiRecipientSummaryProps) {
  const { recipient, health, nextOccasion } = profile;

  return (
    <div className="fi-recipient__hero">
      <FiRecipientAvatar name={recipient.name} alt={recipient.name} size="lg" />
      <div>
        <h3 className="fi-recipient__summary-name">{recipient.name}</h3>
        <p className="fi-recipient__meta">{recipient.relationship}</p>
        <FiRelationshipHealthBadge level={resolveRelationshipHealthLevel(health.score)} />
        {nextOccasion ? (
          <p className="fi-recipient__copy">
            Next: {nextOccasion.event} in {nextOccasion.daysAway} days
          </p>
        ) : null}
      </div>
    </div>
  );
}
