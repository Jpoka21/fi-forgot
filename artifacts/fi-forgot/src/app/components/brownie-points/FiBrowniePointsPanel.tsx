import { cn } from "@/lib/utils";
import { FiButton } from "@/app/components/button/FiButton";
import { buildBrowniePointsRegionLabel } from "@/app/components/brownie-points/accessibility";
import { FiBrowniePointsDisplay } from "@/app/components/brownie-points/FiBrowniePointsDisplay";
import { FiBrowniePointsErrorState } from "@/app/components/brownie-points/FiBrowniePointsErrorState";
import { FiBrowniePointsHistory } from "@/app/components/brownie-points/FiBrowniePointsHistory";
import { FiBrowniePointsMilestone } from "@/app/components/brownie-points/FiBrowniePointsMilestone";
import { FiBrowniePointsSkeleton } from "@/app/components/brownie-points/FiBrowniePointsSkeleton";
import { getFiBrowniePointsContainerClassName } from "@/app/components/brownie-points/browniePointsVariants";
import { useBrowniePointsAccount } from "@/app/brownie-points/hooks/useBrowniePointsAccount";
import { browniePointsDefaults } from "@/app/brownie-points/browniePointsDomain";

export interface FiBrowniePointsPanelProps {
  className?: string;
}

export function FiBrowniePointsPanel({ className }: FiBrowniePointsPanelProps) {
  const account = useBrowniePointsAccount();

  const statusMessage = account.isLoading
    ? "Loading Brownie Points"
    : account.isRefreshing
      ? "Refreshing Brownie Points"
      : `Brownie Points balance ${account.balance}`;

  return (
    <section
      className={cn(getFiBrowniePointsContainerClassName(className))}
      aria-label={buildBrowniePointsRegionLabel(account.balance)}
    >
      <header className="fi-brownie-points__header">
        <h2 className="fi-brownie-points__title">{browniePointsDefaults.title}</h2>
        <p className="fi-brownie-points__description">{browniePointsDefaults.description}</p>
      </header>

      <div className="fi-brownie-points__toolbar">
        <FiButton
          variant="ghost"
          size="sm"
          loading={account.isRefreshing}
          onClick={() => void account.refresh({ silent: true })}
        >
          {browniePointsDefaults.refreshLabel}
        </FiButton>
      </div>

      <p className="fi-brownie-points__status" aria-live="polite">
        {statusMessage}
      </p>

      {account.error ? (
        <FiBrowniePointsErrorState
          message={account.error}
          onRetry={() => void account.refresh()}
        />
      ) : null}

      {account.isLoading ? <FiBrowniePointsSkeleton /> : null}

      {!account.isLoading && !account.error ? (
        <>
          <FiBrowniePointsDisplay balance={account.balance} lifetime={account.lifetime} />
          <FiBrowniePointsMilestone
            lifetime={account.lifetime}
            nextMilestone={account.nextMilestone}
            progress={account.milestoneProgress}
          />
          <FiBrowniePointsHistory
            transactions={account.recent}
            showEmpty={account.showHistoryEmpty}
          />
        </>
      ) : null}
    </section>
  );
}
