import { FiBrowniePointsBadge } from "@/app/components/badge/FiBadge";
import {
  browniePointsDefaults,
  formatBrownieBalance,
} from "@/app/brownie-points/browniePointsDomain";

export interface FiBrowniePointsDisplayProps {
  balance: number;
  lifetime: number;
}

export function FiBrowniePointsDisplay({ balance, lifetime }: FiBrowniePointsDisplayProps) {
  return (
    <div className="fi-brownie-points__hero">
      <span className="fi-brownie-points__hero-accent" aria-hidden>
        🍪
      </span>
      <p className="fi-brownie-points__balance-label">{browniePointsDefaults.balanceLabel}</p>
      <p className="fi-brownie-points__balance-value" aria-live="polite">
        {formatBrownieBalance(balance)}
      </p>
      <p className="fi-brownie-points__lifetime">
        {formatBrownieBalance(lifetime)} {browniePointsDefaults.lifetimeLabel}
      </p>
      <div className="fi-brownie-points__badge-row">
        <FiBrowniePointsBadge points={balance} aria-label={`${balance} Brownie Points`} />
      </div>
    </div>
  );
}
