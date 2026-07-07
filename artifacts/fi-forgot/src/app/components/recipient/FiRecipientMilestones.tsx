import { getCalendarEventEmoji } from "@/app/calendar/calendarDomain";
import { getFiRecipientSectionClassName } from "@/app/components/recipient/recipientVariants";
import { recipientDefaults, type FiRecipientMilestone } from "@/app/recipient/recipientDomain";

export interface FiRecipientMilestonesProps {
  milestones: FiRecipientMilestone[];
}

export function FiRecipientMilestones({ milestones }: FiRecipientMilestonesProps) {
  return (
    <section className={getFiRecipientSectionClassName()} aria-labelledby="fi-recipient-milestones">
      <h3 id="fi-recipient-milestones" className="fi-recipient__section-title">
        {recipientDefaults.milestonesTitle}
      </h3>

      {milestones.length === 0 ? (
        <p className="fi-recipient__copy">Add occasions to start tracking meaningful moments.</p>
      ) : (
        <ul className="fi-recipient__milestones">
          {milestones.map((milestone) => (
            <li key={milestone.id} className="fi-recipient__milestone-item">
              <div>
                <p className="fi-recipient__status-label">
                  {getCalendarEventEmoji(milestone.event)} {milestone.event}
                </p>
                <p className="fi-recipient__meta">{milestone.dateStr}</p>
              </div>
              <span className="fi-recipient__meta">
                {milestone.daysAway === 0
                  ? "Today"
                  : milestone.daysAway === 1
                    ? "Tomorrow"
                    : `In ${milestone.daysAway} days`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
