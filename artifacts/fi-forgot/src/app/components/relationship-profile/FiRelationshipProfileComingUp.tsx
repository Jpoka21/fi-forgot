import { useLocation } from "wouter";

import type { CardOrder } from "@/lib/data";
import { formatBigDate, occasionPhrase, isSensitiveOccasion, urgencyAccent } from "@/lib/personal-brand";
import { daysLabel, fmtShortDate } from "@/app/relationship-profile/relationshipProfileDomain";
import type { TrackedEventData } from "@/app/relationship-profile/relationshipProfileDomain";
import { FiButton } from "@/app/components/button/FiButton";
import { getFiRelationshipProfileSectionClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

export interface FiRelationshipProfileComingUpProps {
  recipientId: string;
  firstName: string;
  upcomingEvents: Array<{ event: string; dateStr: string; daysAway: number }>;
  futureEvents: Array<{ event: string; dateStr: string; daysAway: number }>;
  eventsNeedingDate: TrackedEventData[];
  cardByEvent: Map<string, CardOrder>;
  onRequestDate: (event: string) => void;
}

export function FiRelationshipProfileComingUp({
  recipientId,
  firstName,
  upcomingEvents,
  futureEvents,
  eventsNeedingDate,
  cardByEvent,
  onRequestDate,
}: FiRelationshipProfileComingUpProps) {
  const [, setLocation] = useLocation();

  return (
    <section className={getFiRelationshipProfileSectionClassName()} aria-labelledby="fi-profile-coming-up">
      <div>
        <h2 id="fi-profile-coming-up" className="fi-relationship-profile__section-title">
          Coming up next
        </h2>
        <p className="fi-relationship-profile__section-subtitle">
          For {firstName} — we'll remind you before it matters.
        </p>
      </div>

      {upcomingEvents.map((event, index) => {
        const existingCard = cardByEvent.get(event.event);
        const accent = urgencyAccent(event.daysAway);
        const big = formatBigDate(event.dateStr);
        return (
          <div key={event.event} className="fi-relationship-profile__card">
            <div className="fi-relationship-profile__hero-row">
              {index === 0 ? (
                <div style={{ minWidth: 68, textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 600, color: accent }}>{big.day}</div>
                  <div className="fi-relationship-profile__meta">{big.month}</div>
                </div>
              ) : null}
              <div>
                <h3 className="fi-relationship-profile__section-title">{event.event}</h3>
                <p className="fi-relationship-profile__copy">
                  {index === 0
                    ? occasionPhrase(event.event, event.daysAway, event.dateStr, isSensitiveOccasion(event.event))
                    : `${fmtShortDate(event.dateStr)} · ${daysLabel(event.daysAway)}`}
                </p>
              </div>
            </div>
            <FiButton
              variant={existingCard ? "secondary" : "primary"}
              size="sm"
              onClick={() =>
                setLocation(
                  existingCard
                    ? `/briefings/${recipientId}/${encodeURIComponent(event.event)}?rewrite=1`
                    : `/briefings/${recipientId}/${encodeURIComponent(event.event)}`,
                )
              }
            >
              {existingCard ? "Review the card" : "Write the card"}
            </FiButton>
          </div>
        );
      })}

      {futureEvents.length > 0 ? (
        <ul className="fi-relationship-profile__list">
          {futureEvents.map((event) => (
            <li key={event.event} className="fi-relationship-profile__card">
              <span>{event.event}</span>
              <span className="fi-relationship-profile__meta">{fmtShortDate(event.dateStr)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {eventsNeedingDate.length > 0 ? (
        <ul className="fi-relationship-profile__list">
          {eventsNeedingDate.map((event) => (
            <li key={event.event} className="fi-relationship-profile__card">
              <span>{event.event}</span>
              <FiButton variant="ghost" size="sm" onClick={() => onRequestDate(event.event)}>
                Set date
              </FiButton>
            </li>
          ))}
        </ul>
      ) : null}

      {upcomingEvents.length === 0 && futureEvents.length === 0 && eventsNeedingDate.length === 0 ? (
        <div className="fi-relationship-profile__card">
          <p className="fi-relationship-profile__copy">
            Add an occasion above and we'll quietly watch the calendar for you.
          </p>
        </div>
      ) : null}
    </section>
  );
}
