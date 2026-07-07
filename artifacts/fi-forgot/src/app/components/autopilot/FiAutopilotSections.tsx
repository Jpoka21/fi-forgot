import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { FiConciergeSuggestionCard } from "@/app/components/concierge-suggestions/FiConciergeSuggestionCard";
import { autopilotDefaults } from "@/app/autopilot/autopilotDomain";
import type { FiConciergeSuggestion } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";
import type { FiAutopilotActivityItem, FiAutopilotInsight } from "@/app/autopilot/autopilotDomain";
import { getFiAutopilotSectionClassName } from "@/app/components/autopilot/autopilotVariants";
import type { FiAutopilotRuntimeState } from "@/app/autopilot/autopilotDomain";

export interface FiAutopilotRecommendationsProps {
  recommendations: FiConciergeSuggestion[];
}

export function FiAutopilotRecommendations({ recommendations }: FiAutopilotRecommendationsProps) {
  return (
    <section className={getFiAutopilotSectionClassName()} aria-labelledby="fi-autopilot-recommendations">
      <h2 id="fi-autopilot-recommendations" className="fi-autopilot__section-title">
        Concierge recommendations
      </h2>
      {recommendations.length > 0 ? (
        <ul className="fi-autopilot__list">
          {recommendations.map((suggestion, index) => (
            <li key={suggestion.id}>
              <FiConciergeSuggestionCard suggestion={suggestion} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="fi-autopilot__section-copy">You're all caught up for now.</p>
      )}
    </section>
  );
}

export interface FiAutopilotRecentActivityProps {
  items: FiAutopilotActivityItem[];
}

export function FiAutopilotRecentActivity({ items }: FiAutopilotRecentActivityProps) {
  return (
    <section className={getFiAutopilotSectionClassName()} aria-labelledby="fi-autopilot-activity">
      <h2 id="fi-autopilot-activity" className="fi-autopilot__section-title">
        Recent Autopilot activity
      </h2>
      {items.length > 0 ? (
        <ul className="fi-autopilot__list">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="fi-autopilot__card">
                <strong>{item.title}</strong>
                <p className="fi-autopilot__section-copy">{item.detail}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="fi-autopilot__section-copy">Activity will appear here as cards move forward.</p>
      )}
    </section>
  );
}

export interface FiAutopilotInsightsProps {
  insights: FiAutopilotInsight[];
}

export function FiAutopilotInsights({ insights }: FiAutopilotInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <section className={getFiAutopilotSectionClassName()} aria-labelledby="fi-autopilot-insights">
      <h2 id="fi-autopilot-insights" className="fi-autopilot__section-title">
        Automation insights
      </h2>
      <ul className="fi-autopilot__list">
        {insights.map((insight) => (
          <li key={insight.id} className="fi-autopilot__card">
            <strong>{insight.title}</strong>
            <p className="fi-autopilot__section-copy">{insight.detail}</p>
            {insight.href ? (
              <FiButton asChild variant="ghost" size="sm">
                <Link href={insight.href}>View</Link>
              </FiButton>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface FiAutopilotManagementProps {
  runtimeState: FiAutopilotRuntimeState;
  onEnable: () => void;
  onDisable: () => void;
  onPause: () => void;
  onResume: () => void;
}

export function FiAutopilotManagement({
  runtimeState,
  onEnable,
  onDisable,
  onPause,
  onResume,
}: FiAutopilotManagementProps) {
  return (
    <section className={getFiAutopilotSectionClassName()} aria-labelledby="fi-autopilot-management">
      <h2 id="fi-autopilot-management" className="fi-autopilot__section-title">
        Automation management
      </h2>
      <div className="fi-autopilot__actions">
        {runtimeState !== "active" ? (
          <FiButton variant="primary" size="sm" onClick={onEnable}>
            {autopilotDefaults.enableLabel}
          </FiButton>
        ) : (
          <FiButton variant="secondary" size="sm" onClick={onDisable}>
            {autopilotDefaults.disableLabel}
          </FiButton>
        )}
        {runtimeState === "paused" ? (
          <FiButton variant="primary" size="sm" onClick={onResume}>
            {autopilotDefaults.resumeLabel}
          </FiButton>
        ) : (
          <FiButton variant="secondary" size="sm" onClick={onPause}>
            {autopilotDefaults.pauseLabel}
          </FiButton>
        )}
        <FiButton asChild variant="ghost" size="sm">
          <Link href={autopilotDefaults.settingsHref}>{autopilotDefaults.preferencesLabel}</Link>
        </FiButton>
      </div>
      <div className="fi-autopilot__actions">
        <FiButton asChild variant="ghost" size="sm">
          <Link href={autopilotDefaults.settingsHref}>{autopilotDefaults.reminderPreferencesLabel}</Link>
        </FiButton>
        <FiButton asChild variant="ghost" size="sm">
          <Link href={autopilotDefaults.settingsHref}>{autopilotDefaults.deliveryPreferencesLabel}</Link>
        </FiButton>
        <FiButton asChild variant="ghost" size="sm">
          <Link href={autopilotDefaults.reviewHref}>{autopilotDefaults.reviewLabel}</Link>
        </FiButton>
      </div>
    </section>
  );
}

export function FiAutopilotHelpSection() {
  return (
    <section className={getFiAutopilotSectionClassName()} aria-labelledby="fi-autopilot-help">
      <h2 id="fi-autopilot-help" className="fi-autopilot__section-title">
        {autopilotDefaults.helpTitle}
      </h2>
      <p className="fi-autopilot__section-copy">{autopilotDefaults.helpDescription}</p>
    </section>
  );
}
