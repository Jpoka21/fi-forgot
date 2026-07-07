import { Link } from "wouter";
import { Heart, PenLine, Plus, Users } from "lucide-react";

import { trackDashboardEvent } from "@/app/dashboard/dashboardAnalytics";
import type { FiDashboardQuickAction } from "@/app/dashboard/dashboardDomain";
import { getFiDashboardQuickActionClassName, getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";

const quickActionIcons = {
  "add-person": Plus,
  "log-memory": Heart,
  "write-card": PenLine,
  "your-people": Users,
} as const;

export interface FiDashboardQuickActionsProps {
  actions: FiDashboardQuickAction[];
}

export function FiDashboardQuickActions({ actions }: FiDashboardQuickActionsProps) {
  return (
    <section className={getFiDashboardSectionClassName()} aria-labelledby="fi-dashboard-quick-actions">
      <div className="fi-dashboard__section-header">
        <div>
          <h2 id="fi-dashboard-quick-actions" className="fi-dashboard__section-title">
            Quick actions
          </h2>
          <p className="fi-dashboard__section-subtitle">The easiest next step.</p>
        </div>
      </div>
      <div className="fi-dashboard__quick-actions">
        {actions.map((action) => {
          const Icon = quickActionIcons[action.id as keyof typeof quickActionIcons] ?? Plus;
          return (
            <Link
              key={action.id}
              href={action.href}
              className={getFiDashboardQuickActionClassName()}
              data-testid={action.testId}
              onClick={() =>
                trackDashboardEvent("dashboard_quick_action_clicked", {
                  actionId: action.id,
                  href: action.href,
                })
              }
            >
              <Icon size={20} aria-hidden />
              <span className="fi-dashboard__quick-action-label">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
