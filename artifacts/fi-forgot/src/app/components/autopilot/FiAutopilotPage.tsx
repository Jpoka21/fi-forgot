import { FiButton } from "@/app/components/button/FiButton";
import { useAutopilot } from "@/app/autopilot/hooks/useAutopilot";
import { autopilotDefaults } from "@/app/autopilot/autopilotDomain";
import { getFiAutopilotClassName } from "@/app/components/autopilot/autopilotVariants";
import { FiAutopilotCoverageSummaryPanel } from "@/app/components/autopilot/FiAutopilotCoverageSummary";
import {
  FiAutopilotHelpSection,
  FiAutopilotInsights,
  FiAutopilotManagement,
  FiAutopilotRecentActivity,
  FiAutopilotRecommendations,
} from "@/app/components/autopilot/FiAutopilotSections";
import { FiAutopilotStatusHero } from "@/app/components/autopilot/FiAutopilotStatusHero";
import { FiAutopilotUpcomingAutomated } from "@/app/components/autopilot/FiAutopilotUpcomingAutomated";
import {
  FiAutopilotEmptyState,
  FiAutopilotErrorState,
  FiAutopilotLoadingState,
  FiAutopilotOfflineState,
} from "@/app/components/autopilot/FiAutopilotStates";

export function FiAutopilotPage() {
  const autopilot = useAutopilot();

  if (!autopilot.isOnline && !autopilot.snapshot) {
    return (
      <div className={getFiAutopilotClassName()}>
        <header className="fi-autopilot__header">
          <h1 className="fi-autopilot__title">{autopilotDefaults.title}</h1>
        </header>
        <FiAutopilotOfflineState />
      </div>
    );
  }

  if (autopilot.error && !autopilot.snapshot) {
    return (
      <div className={getFiAutopilotClassName()}>
        <header className="fi-autopilot__header">
          <h1 className="fi-autopilot__title">{autopilotDefaults.title}</h1>
        </header>
        <FiAutopilotErrorState message={autopilot.error} onRetry={() => void autopilot.refresh()} />
      </div>
    );
  }

  if (autopilot.isLoading && !autopilot.snapshot) {
    return (
      <div className={getFiAutopilotClassName()}>
        <header className="fi-autopilot__header">
          <h1 className="fi-autopilot__title">{autopilotDefaults.title}</h1>
        </header>
        <FiAutopilotLoadingState />
      </div>
    );
  }

  if (autopilot.showEmpty) {
    return (
      <div className={getFiAutopilotClassName()}>
        <header className="fi-autopilot__header">
          <div>
            <h1 className="fi-autopilot__title">{autopilotDefaults.title}</h1>
            <p className="fi-autopilot__subtitle">{autopilotDefaults.description}</p>
          </div>
        </header>
        <FiAutopilotEmptyState />
      </div>
    );
  }

  if (!autopilot.snapshot) return null;

  const { snapshot } = autopilot;

  return (
    <div className={getFiAutopilotClassName()}>
      <header className="fi-autopilot__header">
        <div>
          <h1 className="fi-autopilot__title">{autopilotDefaults.title}</h1>
          <p className="fi-autopilot__subtitle">{autopilotDefaults.description}</p>
        </div>
        <FiButton
          variant="ghost"
          size="sm"
          loading={autopilot.isRefreshing}
          onClick={() => void autopilot.refresh({ silent: true })}
        >
          {autopilotDefaults.refreshLabel}
        </FiButton>
      </header>

      <FiAutopilotStatusHero
        runtimeState={snapshot.runtimeState}
        pendingReviewCount={snapshot.pendingReviewCount}
        isOnline={autopilot.isOnline}
      />

      <div className="fi-autopilot__layout">
        <div>
          <FiAutopilotCoverageSummaryPanel coverage={snapshot.coverage} />
          <FiAutopilotUpcomingAutomated events={snapshot.upcomingAutomated} />
          <FiAutopilotRecentActivity items={snapshot.recentActivity} />
        </div>
        <div>
          <FiAutopilotManagement
            runtimeState={snapshot.runtimeState}
            onEnable={autopilot.enableAutopilot}
            onDisable={autopilot.disableAutopilot}
            onPause={autopilot.pauseAutopilot}
            onResume={autopilot.resumeAutopilot}
          />
          <FiAutopilotRecommendations recommendations={snapshot.recommendations} />
          <FiAutopilotInsights insights={snapshot.insights} />
          <FiAutopilotHelpSection />
        </div>
      </div>
    </div>
  );
}
