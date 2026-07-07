import { getFiRecipientSectionClassName } from "@/app/components/recipient/recipientVariants";
import { computeRelationshipConfidence } from "@/app/concierge/relationshipConfidenceEngine";
import { recipientDefaults, type FiRecipientProfileSnapshot } from "@/app/recipient/recipientDomain";
import { TIER_LABELS } from "@/lib/relationship-health";

export interface FiRecipientRelationshipOverviewProps {
  profile: FiRecipientProfileSnapshot;
}

export function FiRecipientRelationshipOverview({ profile }: FiRecipientRelationshipOverviewProps) {
  const { recipient, health } = profile;

  const confidence = computeRelationshipConfidence({
    profileScore: health.score,
    healthScore: health.score,
    freshUpdateCount: profile.memoryPreview.length,
    newestUpdateDaysAgo: null,
    cardsApprovedCount: profile.activity.approvedCards,
    profileComplete: health.score >= 70,
  });

  return (
    <section className={getFiRecipientSectionClassName()} aria-labelledby="fi-recipient-overview">
      <h3 id="fi-recipient-overview" className="fi-recipient__section-title">
        {recipientDefaults.overviewTitle}
      </h3>
      <p className="fi-recipient__copy">
        {health.topGap === "Profile looks great!"
          ? `${recipient.name}'s profile is in strong shape for thoughtful cards.`
          : health.topGap}
      </p>
      <ul className="fi-recipient__meta">
        <li>Relationship confidence: {confidence.label}</li>
        <li>Relationship tier: {TIER_LABELS[health.tier]}</li>
        <li>Tone preference: {recipient.tonePreference || "Not set"}</li>
        <li>Delivery preference: {recipient.deliveryPreference || "Not set"}</li>
        <li>Occasions tracked: {recipient.selectedEvents?.length ?? 0}</li>
      </ul>
    </section>
  );
}
