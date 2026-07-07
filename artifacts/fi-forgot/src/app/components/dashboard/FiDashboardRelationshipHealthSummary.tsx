import { FiRelationshipHealthSummary } from "@/app/components/relationship-health/FiRelationshipHealthSummary";
import { useRelationshipHealth } from "@/app/relationship-health/hooks/useRelationshipHealth";
import { getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";
import { FiDashboardCard } from "@/app/components/card/FiCard";
import { FiRelationshipHealthSkeleton } from "@/app/components/relationship-health/FiRelationshipHealthSkeleton";

export function FiDashboardRelationshipHealthSummary() {
  const health = useRelationshipHealth();

  return (
    <section
      className={getFiDashboardSectionClassName()}
      aria-labelledby="fi-dashboard-health"
    >
      <div className="fi-dashboard__section-header">
        <div>
          <h2 id="fi-dashboard-health" className="fi-dashboard__section-title">
            Relationship Health
          </h2>
          <p className="fi-dashboard__section-subtitle">How prepared your profiles are.</p>
        </div>
      </div>

      {health.isLoading ? (
        <FiRelationshipHealthSkeleton />
      ) : (
        <FiDashboardCard className="fi-dashboard__summary-card">
          <FiRelationshipHealthSummary overall={health.overall} />
        </FiDashboardCard>
      )}
    </section>
  );
}
