import { useEffect, useState } from "react";

import { adminDefaults } from "@/app/admin/adminDomain";
import { buildAdminSystemAnalytics } from "@/app/admin/adminEngine";
import { FiAnalyticsCard, FiCardContent, FiCardHeader, FiCardTitle } from "@/app/components/card/FiCard";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import type { AdminTab } from "@/app/admin/adminDomain";

export function FiAdminDashboardPanel({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const [analytics, setAnalytics] = useState(() => buildAdminSystemAnalytics());

  useEffect(() => {
    setAnalytics(buildAdminSystemAnalytics());
  }, []);

  return (
    <div className="fi-admin__dashboard">
      <AdminDashboard onNavigate={(tab) => onNavigate(tab as AdminTab)} />

      <section className="fi-admin__metrics" aria-label="Extended system analytics">
        <FiAnalyticsCard className="fi-admin__metric">
          <FiCardHeader>
            <FiCardTitle>AI drafts</FiCardTitle>
          </FiCardHeader>
          <FiCardContent>
            <p className="fi-admin__metric-value">{analytics.aiDraftsTotal}</p>
            <p className="fi-admin__metric-label">{analytics.aiDraftsPending} pending approval</p>
          </FiCardContent>
        </FiAnalyticsCard>
        <FiAnalyticsCard className="fi-admin__metric">
          <FiCardHeader>
            <FiCardTitle>Billing</FiCardTitle>
          </FiCardHeader>
          <FiCardContent>
            <p className="fi-admin__metric-value">{analytics.billingActive}</p>
            <p className="fi-admin__metric-label">
              {analytics.billingTrial} trial · {analytics.billingCancelled} cancelled
            </p>
          </FiCardContent>
        </FiAnalyticsCard>
        <FiAnalyticsCard className="fi-admin__metric">
          <FiCardHeader>
            <FiCardTitle>Notifications</FiCardTitle>
          </FiCardHeader>
          <FiCardContent>
            <p className="fi-admin__metric-value">{analytics.notificationQueueOpen}</p>
            <p className="fi-admin__metric-label">{analytics.notificationMailed} mailed</p>
          </FiCardContent>
        </FiAnalyticsCard>
        <FiAnalyticsCard className="fi-admin__metric">
          <FiCardHeader>
            <FiCardTitle>System health</FiCardTitle>
          </FiCardHeader>
          <FiCardContent>
            <p className="fi-admin__metric-value">{analytics.auditEntries24h}</p>
            <p className="fi-admin__metric-label">
              {analytics.systemHealth === "healthy"
                ? adminDefaults.systemHealthHealthy
                : adminDefaults.systemHealthAttention}
            </p>
          </FiCardContent>
        </FiAnalyticsCard>
      </section>
    </div>
  );
}
