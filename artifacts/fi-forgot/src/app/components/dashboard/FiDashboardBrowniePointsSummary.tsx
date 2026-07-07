import { FiBrowniePointsDisplay } from "@/app/components/brownie-points/FiBrowniePointsDisplay";
import { FiBrowniePointsSkeleton } from "@/app/components/brownie-points/FiBrowniePointsSkeleton";
import { useBrowniePointsAccount } from "@/app/brownie-points/hooks/useBrowniePointsAccount";
import { FiDashboardCard } from "@/app/components/card/FiCard";
import { getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";

export function FiDashboardBrowniePointsSummary() {
  const account = useBrowniePointsAccount();

  return (
    <section
      className={getFiDashboardSectionClassName()}
      aria-labelledby="fi-dashboard-brownie"
    >
      <div className="fi-dashboard__section-header">
        <div>
          <h2 id="fi-dashboard-brownie" className="fi-dashboard__section-title">
            Brownie Points
          </h2>
          <p className="fi-dashboard__section-subtitle">Thoughtful moments recognized.</p>
        </div>
      </div>

      {account.isLoading ? (
        <FiBrowniePointsSkeleton />
      ) : (
        <FiDashboardCard className="fi-dashboard__summary-card">
          <FiBrowniePointsDisplay balance={account.balance} lifetime={account.lifetime} />
        </FiDashboardCard>
      )}
    </section>
  );
}
