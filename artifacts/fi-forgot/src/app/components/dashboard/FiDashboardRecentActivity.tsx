import { Link, useLocation } from "wouter";
import { Sparkles } from "lucide-react";

import type { FiDashboardActivityItem } from "@/app/dashboard/dashboardDomain";
import { trackDashboardEvent } from "@/app/dashboard/dashboardAnalytics";
import { FiDashboardCard } from "@/app/components/card/FiCard";
import { getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";

export interface FiDashboardRecentActivityProps {
  items: FiDashboardActivityItem[];
}

export function FiDashboardRecentActivity({ items }: FiDashboardRecentActivityProps) {
  const [, setLocation] = useLocation();

  return (
    <section
      className={getFiDashboardSectionClassName()}
      aria-labelledby="fi-dashboard-activity"
    >
      <div className="fi-dashboard__section-header">
        <div>
          <h2 id="fi-dashboard-activity" className="fi-dashboard__section-title">
            Recent activity
          </h2>
          <p className="fi-dashboard__section-subtitle">What we've already taken care of.</p>
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="fi-dashboard__list">
          {items.map((item) => (
            <li key={item.id}>
              <FiDashboardCard
                interactive
                className="fi-dashboard__activity-item"
                onClick={() => {
                  trackDashboardEvent("dashboard_activity_opened", { href: item.href });
                  setLocation(item.href);
                }}
              >
                <div className="fi-dashboard__upcoming-header">
                  <Sparkles size={18} aria-hidden />
                  <div>
                    <h3 className="fi-dashboard__upcoming-name">{item.title}</h3>
                    <p className="fi-dashboard__meta">{item.detail}</p>
                  </div>
                </div>
              </FiDashboardCard>
            </li>
          ))}
        </ul>
      ) : (
        <FiDashboardCard className="fi-dashboard__summary-card">
          <p className="fi-dashboard__section-copy">No recent activity yet.</p>
          <Link href="/recipients/new" className="fi-dashboard__footer-link">
            Start by adding someone important
          </Link>
        </FiDashboardCard>
      )}
    </section>
  );
}
