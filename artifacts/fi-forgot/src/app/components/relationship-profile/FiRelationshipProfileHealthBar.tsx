import type { HealthScore } from "@/app/relationship-profile/relationshipProfileDomain";
import { getFiRelationshipProfileCardClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

const STATUS_COLORS: Record<HealthScore["status"], string> = {
  Excellent: "#166534",
  Healthy: "var(--fi-color-success)",
  NeedsAttention: "var(--fi-color-warning)",
  Priority: "var(--fi-color-accent)",
};

export interface FiRelationshipProfileHealthBarProps {
  healthScore: HealthScore;
}

export function FiRelationshipProfileHealthBar({ healthScore }: FiRelationshipProfileHealthBarProps) {
  const statusColor = STATUS_COLORS[healthScore.status] ?? "var(--fi-color-text-secondary)";

  return (
    <div className={getFiRelationshipProfileCardClassName()} role="status">
      <p className="fi-relationship-profile__copy">
        {healthScore.score >= 70
          ? "We're in good shape for upcoming cards."
          : "A little more detail would help future cards shine."}
      </p>
      <div className="fi-relationship-profile__health-bar" aria-hidden>
        <div
          className="fi-relationship-profile__health-bar-fill"
          style={{ width: `${healthScore.score}%`, background: statusColor }}
        />
      </div>
      {healthScore.pendingFollowUps > 0 ? (
        <p className="fi-relationship-profile__meta">
          {healthScore.pendingFollowUps} quick follow-up
          {healthScore.pendingFollowUps > 1 ? "s" : ""} would help — answer above when you have a moment.
        </p>
      ) : null}
      {healthScore.lastUpdateDaysAgo !== null && healthScore.lastUpdateDaysAgo > 90 ? (
        <p className="fi-relationship-profile__meta">
          It's been a while since you added a memory. Drop one above before the next card.
        </p>
      ) : null}
    </div>
  );
}
