import type { FiDashboardWelcome } from "@/app/dashboard/dashboardDomain";
import { illustrationPaths } from "@/app/design/assets/illustrationPaths";
import { getFiDashboardHeroClassName } from "@/app/components/dashboard/dashboardVariants";

export interface FiDashboardHeroProps {
  welcome: FiDashboardWelcome;
}

export function FiDashboardHero({ welcome }: FiDashboardHeroProps) {
  return (
    <header className={getFiDashboardHeroClassName()}>
      <div className="fi-dashboard__hero-grid">
        <div>
          <p className="fi-dashboard__date">{welcome.dateLabel}</p>
          <h1 className="fi-dashboard__headline">{welcome.headline}</h1>
          <p className="fi-dashboard__subheadline">{welcome.subheadline}</p>
        </div>
        <img
          src={illustrationPaths.dashboard.emptyState}
          alt=""
          aria-hidden
          className="fi-dashboard__hero-illustration"
          style={{ width: "100%", maxWidth: 280, justifySelf: "end" }}
        />
      </div>
      {welcome.conciergeSummary ? (
        <p className="fi-dashboard__concierge-summary" role="note">
          <strong>Concierge insight:</strong> {welcome.conciergeSummary}
        </p>
      ) : null}
    </header>
  );
}
