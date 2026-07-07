import { Link } from "wouter";

import type { FiDashboardSpotlight } from "@/app/dashboard/dashboardDomain";
import { trackDashboardEvent } from "@/app/dashboard/dashboardAnalytics";
import { FiRecipientAvatar } from "@/app/components/avatar/FiAvatar";
import { FiButton } from "@/app/components/button/FiButton";
import { FiDashboardCard } from "@/app/components/card/FiCard";
import { getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";

export interface FiDashboardRelationshipSpotlightProps {
  spotlight: FiDashboardSpotlight | null;
}

export function FiDashboardRelationshipSpotlight({
  spotlight,
}: FiDashboardRelationshipSpotlightProps) {
  return (
    <section className={getFiDashboardSectionClassName()} aria-labelledby="fi-dashboard-spotlight">
      <div className="fi-dashboard__section-header">
        <div>
          <h2 id="fi-dashboard-spotlight" className="fi-dashboard__section-title">
            Relationship spotlight
          </h2>
          <p className="fi-dashboard__section-subtitle">Who deserves a little attention.</p>
        </div>
      </div>

      {spotlight ? (
        <FiDashboardCard className="fi-dashboard__spotlight">
          <div className="fi-dashboard__upcoming-header">
            <FiRecipientAvatar
              name={spotlight.recipient.name}
              alt={spotlight.recipient.name}
              size="md"
            />
            <div>
              <h3 className="fi-dashboard__upcoming-name">{spotlight.recipient.name}</h3>
              <p className="fi-dashboard__section-copy">{spotlight.summary}</p>
              {spotlight.healthInsight ? (
                <p className="fi-dashboard__meta">{spotlight.healthInsight}</p>
              ) : null}
              <div className="fi-dashboard__actions-row">
                <FiButton
                  asChild
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    trackDashboardEvent("dashboard_spotlight_viewed", {
                      recipientId: spotlight.recipient.id,
                      href: spotlight.suggestedActionHref,
                    })
                  }
                >
                  <Link href={spotlight.suggestedActionHref}>
                    {spotlight.suggestedActionLabel}
                  </Link>
                </FiButton>
                <FiButton asChild variant="link" size="sm">
                  <Link href={`/relationship/${spotlight.recipient.id}`}>Log a memory</Link>
                </FiButton>
              </div>
            </div>
          </div>
        </FiDashboardCard>
      ) : (
        <FiDashboardCard className="fi-dashboard__summary-card">
          <p className="fi-dashboard__section-copy">No spotlight available yet.</p>
          <FiButton asChild variant="secondary" size="sm">
            <Link href="/recipients/new">Add more relationships</Link>
          </FiButton>
        </FiDashboardCard>
      )}
    </section>
  );
}
