import { getFiRecipientSectionClassName } from "@/app/components/recipient/recipientVariants";
import { recipientDefaults, type FiRecipientActivitySummary } from "@/app/recipient/recipientDomain";

export interface FiRecipientActivitySummaryProps {
  activity: FiRecipientActivitySummary;
}

export function FiRecipientActivitySummaryPanel({ activity }: FiRecipientActivitySummaryProps) {
  return (
    <section className={getFiRecipientSectionClassName()} aria-labelledby="fi-recipient-activity">
      <h3 id="fi-recipient-activity" className="fi-recipient__section-title">
        {recipientDefaults.activityTitle}
      </h3>

      <div className="fi-recipient__activity-grid">
        <div className="fi-recipient__activity-stat">
          <p className="fi-recipient__activity-value">{activity.approvedCards}</p>
          <p className="fi-recipient__copy">Cards sent</p>
        </div>
        <div className="fi-recipient__activity-stat">
          <p className="fi-recipient__activity-value">{activity.pendingCards}</p>
          <p className="fi-recipient__copy">Awaiting review</p>
        </div>
        <div className="fi-recipient__activity-stat">
          <p className="fi-recipient__activity-value">{activity.briefingsCount}</p>
          <p className="fi-recipient__copy">Briefings saved</p>
        </div>
        <div className="fi-recipient__activity-stat">
          <p className="fi-recipient__activity-value">{activity.thinMemory ? "Light" : "Rich"}</p>
          <p className="fi-recipient__copy">Memory depth</p>
        </div>
      </div>

      <p className="fi-recipient__copy">{activity.lastProfileUpdateLabel}</p>
    </section>
  );
}
