import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import {
  autopilotDefaults,
  autopilotStatusDescription,
  autopilotStatusLabel,
  type FiAutopilotRuntimeState,
} from "@/app/autopilot/autopilotDomain";
import { getFiAutopilotHeroClassName } from "@/app/components/autopilot/autopilotVariants";

export interface FiAutopilotStatusHeroProps {
  runtimeState: FiAutopilotRuntimeState;
  pendingReviewCount: number;
  isOnline: boolean;
}

export function FiAutopilotStatusHero({
  runtimeState,
  pendingReviewCount,
  isOnline,
}: FiAutopilotStatusHeroProps) {
  return (
    <section className={getFiAutopilotHeroClassName(runtimeState)} aria-labelledby="fi-autopilot-status">
      <p className="fi-autopilot__hero-label">Status</p>
      <h2 id="fi-autopilot-status" className="fi-autopilot__hero-title">
        {autopilotStatusLabel(runtimeState)}
      </h2>
      <p className="fi-autopilot__section-copy">{autopilotStatusDescription(runtimeState)}</p>
      {!isOnline ? (
        <p className="fi-autopilot__section-copy" role="alert">
          {autopilotDefaults.offlineLabel}
        </p>
      ) : null}
      {pendingReviewCount > 0 ? (
        <div className="fi-autopilot__actions">
          <FiButton asChild variant="primary" size="sm">
            <Link href={autopilotDefaults.reviewHref}>
              {autopilotDefaults.reviewLabel} ({pendingReviewCount})
            </Link>
          </FiButton>
        </div>
      ) : null}
    </section>
  );
}
