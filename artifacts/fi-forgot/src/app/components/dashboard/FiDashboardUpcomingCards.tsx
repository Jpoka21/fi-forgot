import { Link } from "wouter";

import type { CardOrder } from "@/lib/data";
import {
  calmOccasionLine,
  dashboardDefaults,
  type FiDashboardUpcomingEvent,
} from "@/app/dashboard/dashboardDomain";
import {
  isSensitiveDashboardOccasion,
  resolveUpcomingCta,
  resolveUpcomingOutcome,
} from "@/app/dashboard/dashboardEngine";
import { trackDashboardEvent } from "@/app/dashboard/dashboardAnalytics";
import { FiRecipientAvatar } from "@/app/components/avatar/FiAvatar";
import { FiButton } from "@/app/components/button/FiButton";
import { FiDashboardCard } from "@/app/components/card/FiCard";
import { getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";

export interface FiDashboardUpcomingCardsProps {
  moments: FiDashboardUpcomingEvent[];
  totalUpcoming: number;
  cards: CardOrder[];
  upcomingWithCardKeys: Set<string>;
  upcomingCardById: Map<string, string>;
}

export function FiDashboardUpcomingCards({
  moments,
  totalUpcoming,
  cards,
  upcomingWithCardKeys,
  upcomingCardById,
}: FiDashboardUpcomingCardsProps) {
  return (
    <section className={getFiDashboardSectionClassName()} aria-labelledby="fi-dashboard-upcoming">
      <div className="fi-dashboard__section-header">
        <div>
          <h2 id="fi-dashboard-upcoming" className="fi-dashboard__section-title">
            Coming up
          </h2>
          <p className="fi-dashboard__section-subtitle">Who needs you next.</p>
        </div>
        {totalUpcoming > 3 ? (
          <Link href={dashboardDefaults.viewAllMomentsHref} className="fi-dashboard__footer-link">
            {dashboardDefaults.viewAllMomentsLabel}
          </Link>
        ) : null}
      </div>

      {moments.length > 0 ? (
        <ul className="fi-dashboard__list">
          {moments.map((event) => {
            const cta = resolveUpcomingCta(event, cards, upcomingWithCardKeys, upcomingCardById);
            const outcome = resolveUpcomingOutcome(event, cards, upcomingCardById);
            const daysLabel =
              event.daysAway === 0
                ? "Today"
                : event.daysAway === 1
                  ? "Tomorrow"
                  : `${event.daysAway} days`;

            return (
              <li key={`${event.recipient.id}-${event.event}`}>
                <FiDashboardCard className="fi-dashboard__upcoming-card">
                  <div className="fi-dashboard__upcoming-header">
                    <FiRecipientAvatar
                      name={event.recipient.name}
                      alt={event.recipient.name}
                      size="md"
                    />
                    <div>
                      <h3 className="fi-dashboard__upcoming-name">{event.recipient.name}</h3>
                      <p className="fi-dashboard__meta">{event.event}</p>
                      <p className="fi-dashboard__section-copy">
                        {calmOccasionLine(
                          event.event,
                          event.daysAway,
                          event.dateStr,
                          isSensitiveDashboardOccasion(event.event),
                        )}
                      </p>
                      <div className="fi-dashboard__badge-row">
                        <span className="fi-dashboard__meta">{outcome.line}</span>
                        <span className="fi-dashboard__meta">{daysLabel}</span>
                      </div>
                      <div className="fi-dashboard__actions-row">
                        <Link
                          href={cta.href}
                          onClick={() =>
                            trackDashboardEvent("dashboard_upcoming_opened", {
                              recipientId: event.recipient.id,
                              href: cta.href,
                            })
                          }
                        >
                          {cta.label}
                        </Link>
                        {outcome.viewCardId ? (
                          <FiButton asChild variant="link" size="sm">
                            <Link href={`/cards/review?id=${outcome.viewCardId}`}>View card</Link>
                          </FiButton>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </FiDashboardCard>
              </li>
            );
          })}
        </ul>
      ) : (
        <FiDashboardCard className="fi-dashboard__summary-card">
          <p className="fi-dashboard__section-copy">
            Nothing on the calendar right now. We'll let you know when something needs you.
          </p>
        </FiDashboardCard>
      )}
    </section>
  );
}
