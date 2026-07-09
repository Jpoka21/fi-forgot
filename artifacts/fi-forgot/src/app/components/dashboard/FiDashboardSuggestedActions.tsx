import { Link } from "wouter";

import { FiPriorityBadge } from "@/app/components/badge/FiBadge";
import type { FiPriorityLevel } from "@/app/components/badge/badgeDomain";
import { FiButton } from "@/app/components/button/FiButton";
import { FiAiRecommendationCard } from "@/app/components/card/FiCard";
import { FiConciergeSuggestionCard } from "@/app/components/concierge-suggestions/FiConciergeSuggestionCard";
import { getFiConciergeSuggestionCardClassName } from "@/app/components/concierge-suggestions/conciergeSuggestionsVariants";
import { FiDashboardCard } from "@/app/components/card/FiCard";
import { getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";
import { isBrainDashboardEnabled } from "@/app/dashboard-brain/dashboardBrainConfig";
import {
  limitDashboardSuggestedActions,
  resolveDashboardSuggestedActions,
} from "@/app/dashboard-brain/resolveDashboardSuggestedActions";
import type { FiDashboardSuggestedAction } from "@/app/dashboard/dashboardDomain";
import { useAuth } from "@/lib/auth-context";

export interface FiDashboardSuggestedActionsProps {
  suggestedActions?: FiDashboardSuggestedAction[];
}

function priorityToBadgeLevel(priority: string): FiPriorityLevel {
  if (priority === "high" || priority === "medium" || priority === "low") {
    return priority;
  }
  return "medium";
}

function FiDashboardBrainSuggestedActionCard({
  action,
  index = 0,
}: {
  action: FiDashboardSuggestedAction;
  index?: number;
}) {
  return (
    <FiAiRecommendationCard className={getFiConciergeSuggestionCardClassName({ index })}>
      <div className="fi-concierge-suggestion-card__body">
        <div className="fi-concierge-suggestion-card__meta">
          <FiPriorityBadge level={priorityToBadgeLevel(action.priority)} />
        </div>
        <h3 className="fi-concierge-suggestion-card__title">{action.title}</h3>
        <p className="fi-concierge-suggestion-card__description">{action.detail}</p>
        <div className="fi-concierge-suggestion-card__footer">
          <p className="fi-concierge-suggestion-card__context">For {action.recipientName}</p>
          <FiButton asChild variant="secondary" size="sm">
            <Link href={action.href}>{action.actionLabel}</Link>
          </FiButton>
        </div>
      </div>
    </FiAiRecommendationCard>
  );
}

export function FiDashboardSuggestedActions({
  suggestedActions,
}: FiDashboardSuggestedActionsProps) {
  const { user } = useAuth();
  const brainEnabled = isBrainDashboardEnabled();
  const renderModel = resolveDashboardSuggestedActions({
    brainEnabled,
    snapshotSuggestedActions: suggestedActions,
    userEmail: user?.email,
  });

  const brainActions = limitDashboardSuggestedActions(renderModel.brainActions);
  const legacyActions = renderModel.legacyActions;
  const hasActions = brainEnabled ? brainActions.length > 0 : legacyActions.length > 0;

  return (
    <section
      className={getFiDashboardSectionClassName()}
      aria-labelledby="fi-dashboard-suggestions"
    >
      <div className="fi-dashboard__section-header">
        <div>
          <h2 id="fi-dashboard-suggestions" className="fi-dashboard__section-title">
            Suggested actions
          </h2>
          <p className="fi-dashboard__section-subtitle">Thoughtful next steps from your concierge.</p>
        </div>
      </div>

      {hasActions ? (
        <ul className="fi-dashboard__list">
          {brainEnabled
            ? brainActions.map((action, index) => (
                <li key={action.id}>
                  <FiDashboardBrainSuggestedActionCard action={action} index={index} />
                </li>
              ))
            : legacyActions.map((suggestion, index) => (
                <li key={suggestion.id}>
                  <FiConciergeSuggestionCard suggestion={suggestion} index={index} />
                </li>
              ))}
        </ul>
      ) : (
        <FiDashboardCard className="fi-dashboard__summary-card">
          <p className="fi-dashboard__section-copy">
            You're all caught up. We'll surface recommendations when something meaningful appears.
          </p>
        </FiDashboardCard>
      )}
    </section>
  );
}
