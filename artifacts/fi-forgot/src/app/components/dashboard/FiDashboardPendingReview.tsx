import { Link } from "wouter";

import { dashboardDefaults } from "@/app/dashboard/dashboardDomain";
import { FiButton } from "@/app/components/button/FiButton";
import { FiDashboardCard } from "@/app/components/card/FiCard";
import { getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";

export interface FiDashboardPendingReviewProps {
  pendingReviewCount: number;
}

export function FiDashboardPendingReview({ pendingReviewCount }: FiDashboardPendingReviewProps) {
  return (
    <section className={getFiDashboardSectionClassName()} aria-labelledby="fi-dashboard-pending">
      <div className="fi-dashboard__section-header">
        <h2 id="fi-dashboard-pending" className="fi-dashboard__section-title">
          Cards waiting for you
        </h2>
      </div>

      {pendingReviewCount > 0 ? (
        <div className="fi-dashboard__pending-banner">
          <p className="fi-dashboard__section-copy">
            {pendingReviewCount === 1
              ? "One card is ready for your review."
              : `${pendingReviewCount} cards are ready for your review.`}
          </p>
          <FiButton asChild variant="primary" size="sm">
            <Link href={dashboardDefaults.reviewCardsHref}>{dashboardDefaults.reviewCardsLabel}</Link>
          </FiButton>
        </div>
      ) : (
        <FiDashboardCard className="fi-dashboard__summary-card">
          <p className="fi-dashboard__section-copy">
            You're all caught up. We'll reach out when a card needs you.
          </p>
        </FiDashboardCard>
      )}
    </section>
  );
}
