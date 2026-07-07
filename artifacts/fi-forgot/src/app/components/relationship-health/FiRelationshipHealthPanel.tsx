import { cn } from "@/lib/utils";
import { FiButton } from "@/app/components/button/FiButton";
import { FiRelationshipHealthEmptyState } from "@/app/components/relationship-health/FiRelationshipHealthEmptyState";
import { FiRelationshipHealthErrorState } from "@/app/components/relationship-health/FiRelationshipHealthErrorState";
import { FiRelationshipHealthExplanation } from "@/app/components/relationship-health/FiRelationshipHealthExplanation";
import { FiRelationshipHealthSkeleton } from "@/app/components/relationship-health/FiRelationshipHealthSkeleton";
import { FiRelationshipHealthSuggestions } from "@/app/components/relationship-health/FiRelationshipHealthSuggestions";
import { FiRelationshipHealthSummary } from "@/app/components/relationship-health/FiRelationshipHealthSummary";
import { FiRelationshipHealthTrend } from "@/app/components/relationship-health/FiRelationshipHealthTrend";
import { buildRelationshipHealthRegionLabel } from "@/app/components/relationship-health/accessibility";
import { getFiRelationshipHealthContainerClassName } from "@/app/components/relationship-health/relationshipHealthVariants";
import {
  useRecipientRelationshipHealth,
  useRelationshipHealth,
} from "@/app/relationship-health/hooks/useRelationshipHealth";
import { relationshipHealthDefaults } from "@/app/relationship-health/relationshipHealthDomain";

export interface FiRelationshipHealthPanelProps {
  recipientId?: string;
  className?: string;
  onAddPerson?: () => void;
}

export function FiRelationshipHealthPanel({
  recipientId,
  className,
  onAddPerson,
}: FiRelationshipHealthPanelProps) {
  const accountHealth = useRelationshipHealth({ enabled: !recipientId });
  const recipientHealth = useRecipientRelationshipHealth({
    recipientId: recipientId ?? "",
    enabled: Boolean(recipientId),
  });

  const health = recipientId ? recipientHealth : accountHealth;
  const score = recipientId
    ? recipientHealth.recipientHealth?.score ?? 0
    : accountHealth.overall?.score ?? 0;

  const statusMessage = health.isLoading
    ? "Loading relationship health"
    : health.isRefreshing
      ? "Refreshing relationship health"
      : health.showEmpty
        ? "No relationship health data"
        : `Relationship health score ${score}`;

  const suggestions = recipientId && recipientHealth.recipientHealth
    ? [
        {
          id: `recipient-${recipientHealth.recipientHealth.id}`,
          title:
            recipientHealth.recipientHealth.topGap === "Profile looks great!"
              ? `Keep ${recipientHealth.recipientHealth.name} fresh`
              : recipientHealth.recipientHealth.topGap,
          description:
            recipientHealth.recipientHealth.topGap === "Profile looks great!"
              ? "Add a new memory or update when something meaningful happens."
              : `Improve ${recipientHealth.recipientHealth.name}'s profile.`,
          href: recipientHealth.recipientHealth.topGapHref,
          pointsGain: recipientHealth.recipientHealth.pointsAvailable,
        },
      ]
    : health.suggestions;

  return (
    <section
      className={cn(getFiRelationshipHealthContainerClassName(className))}
      aria-label={buildRelationshipHealthRegionLabel(score)}
    >
      <header className="fi-relationship-health__header">
        <h2 className="fi-relationship-health__title">
          {recipientId ? "Relationship confidence" : relationshipHealthDefaults.title}
        </h2>
        <p className="fi-relationship-health__description">{relationshipHealthDefaults.description}</p>
      </header>

      <div className="fi-relationship-health__toolbar">
        <FiButton
          variant="ghost"
          size="sm"
          loading={health.isRefreshing}
          onClick={() => void health.refresh({ silent: true })}
        >
          {relationshipHealthDefaults.refreshLabel}
        </FiButton>
      </div>

      <p className="fi-relationship-health__status" aria-live="polite">
        {statusMessage}
      </p>

      {health.error ? (
        <FiRelationshipHealthErrorState
          message={health.error}
          onRetry={() => void health.refresh()}
        />
      ) : null}

      {health.isLoading ? <FiRelationshipHealthSkeleton /> : null}

      {health.showEmpty && !health.error && !health.isLoading ? (
        <FiRelationshipHealthEmptyState onAddPerson={onAddPerson} />
      ) : null}

      {!health.isLoading && !health.error && !health.showEmpty ? (
        <>
          <FiRelationshipHealthSummary
            overall={recipientId ? null : accountHealth.overall}
            recipient={recipientId ? recipientHealth.recipientHealth : null}
          />
          <FiRelationshipHealthExplanation
            overall={recipientId ? null : accountHealth.overall}
            recipient={recipientId ? recipientHealth.recipientHealth : null}
          />
          <FiRelationshipHealthTrend
            history={health.trend}
            direction={health.trendDirection}
            recipientScoped={Boolean(recipientId)}
          />
          <FiRelationshipHealthSuggestions suggestions={suggestions} />
        </>
      ) : null}
    </section>
  );
}
