import { FiBrowniePointsProgress } from "@/app/components/progress/FiLinearProgress";
import { browniePointsUiCopy } from "@/app/components/brownie-points/browniePointsDomain";
import {
  browniePointsDefaults,
  formatBrownieBalance,
  type FiBrownieMilestone,
} from "@/app/brownie-points/browniePointsDomain";

export interface FiBrowniePointsMilestoneProps {
  lifetime: number;
  nextMilestone: FiBrownieMilestone | null;
  progress: number;
}

export function FiBrowniePointsMilestone({
  lifetime,
  nextMilestone,
  progress,
}: FiBrowniePointsMilestoneProps) {
  if (!nextMilestone) {
    return (
      <section className="fi-brownie-points__milestone" aria-labelledby="fi-brownie-points-milestone">
        <h3 id="fi-brownie-points-milestone" className="fi-brownie-points__section-title">
          {browniePointsDefaults.milestoneTitle}
        </h3>
        <p className="fi-brownie-points__milestone-copy">{browniePointsUiCopy.allMilestonesComplete}</p>
      </section>
    );
  }

  return (
    <section className="fi-brownie-points__milestone" aria-labelledby="fi-brownie-points-milestone">
      <h3 id="fi-brownie-points-milestone" className="fi-brownie-points__section-title">
        {browniePointsDefaults.milestoneTitle}
      </h3>
      <div className="fi-brownie-points__milestone-meta">
        <span>Next: {nextMilestone.label}</span>
        <span>
          {formatBrownieBalance(lifetime)} / {formatBrownieBalance(nextMilestone.threshold)}
        </span>
      </div>
      <FiBrowniePointsProgress
        current={lifetime}
        target={nextMilestone.threshold}
        milestoneLabel={nextMilestone.label}
        showValue
      />
      <p className="fi-brownie-points__milestone-copy">{nextMilestone.description}</p>
      <p className="fi-brownie-points__milestone-copy" aria-live="polite">
        {progress}% toward {nextMilestone.label}
      </p>
    </section>
  );
}
