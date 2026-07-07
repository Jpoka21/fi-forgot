import type { AutomationAdminController } from "@/app/ai-automation/hooks/useAutomationAdmin";
import { FiButton } from "@/app/components/button/FiButton";
import { FiAnalyticsCard, FiCardContent, FiCardHeader, FiCardTitle } from "@/app/components/card/FiCard";
import { FiAdminEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";

export function FiAutomationAdminPanel({ automation }: { automation: AutomationAdminController }) {
  const { defaults, overview, statusRows, history, runLog, isRetrying, retryError } = automation;

  return (
    <section className="fi-ai-automation" aria-labelledby="automation-admin-title">
      <header className="fi-ai-automation__header">
        <h2 id="automation-admin-title" className="fi-ai-automation__title">
          {defaults.automationTitle}
        </h2>
        <p className="fi-ai-automation__subtitle">{defaults.automationSubtitle}</p>
      </header>

      <div className="fi-ai-automation__actions">
        <FiButton variant="primary" loading={isRetrying} onClick={() => void automation.retryAutopilot()}>
          {isRetrying ? defaults.retryRunningLabel : defaults.retryLabel}
        </FiButton>
        <FiButton variant="secondary" onClick={() => automation.onNavigate("queue")}>
          {defaults.viewQueueLabel}
        </FiButton>
      </div>

      {retryError ? (
        <p className="fi-ai-automation__banner fi-ai-automation__health--attention" role="alert">
          {retryError}
        </p>
      ) : null}

      <FiAnalyticsCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.overviewTitle}</FiCardTitle>
        </FiCardHeader>
        <FiCardContent>
          <div className="fi-ai-automation__metrics">
            <div className="fi-ai-automation__metric">
              <p className="fi-ai-automation__metric-label">Open queue</p>
              <p className="fi-ai-automation__metric-value">{overview.queueOpen}</p>
            </div>
            <div className="fi-ai-automation__metric">
              <p className="fi-ai-automation__metric-label">Awaiting customer</p>
              <p className="fi-ai-automation__metric-value">{overview.awaitingCustomer}</p>
            </div>
            <div className="fi-ai-automation__metric">
              <p className="fi-ai-automation__metric-label">Mailed</p>
              <p className="fi-ai-automation__metric-value">{overview.mailed}</p>
            </div>
            <div className="fi-ai-automation__metric">
              <p className="fi-ai-automation__metric-label">Autopilot items</p>
              <p className="fi-ai-automation__metric-value">{overview.autopilotQueued}</p>
            </div>
          </div>
          {overview.lastRun ? (
            <p className="fi-ai-automation__subtitle">
              Last run {new Date(overview.lastRun.at).toLocaleString()}: processed{" "}
              {overview.lastRun.processed}, skipped {overview.lastRun.skipped}
            </p>
          ) : null}
        </FiCardContent>
      </FiAnalyticsCard>

      <FiAnalyticsCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.statusTitle}</FiCardTitle>
        </FiCardHeader>
        <FiCardContent>
          <ul className="fi-ai-automation__list">
            {statusRows.map((row) => (
              <li key={row.label} className="fi-ai-automation__list-item">
                <strong>{row.label}</strong>
                <div className="fi-ai-automation__metric-label">{row.count} items</div>
              </li>
            ))}
          </ul>
        </FiCardContent>
      </FiAnalyticsCard>

      <FiAnalyticsCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.historyTitle}</FiCardTitle>
        </FiCardHeader>
        <FiCardContent>
          <ul className="fi-ai-automation__list">
            {history.map((entry) => (
              <li key={entry.id} className="fi-ai-automation__list-item">
                <strong>{entry.description}</strong>
                <div className="fi-ai-automation__metric-label">
                  {new Date(entry.timestamp).toLocaleString()} · {entry.adminUser}
                </div>
              </li>
            ))}
          </ul>
        </FiCardContent>
      </FiAnalyticsCard>

      <FiAnalyticsCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.logsTitle}</FiCardTitle>
        </FiCardHeader>
        <FiCardContent>
          {runLog.length === 0 ? (
            <FiAdminEmptyState title={defaults.noLogsLabel} description="" />
          ) : (
            <ul className="fi-ai-automation__list">
              {runLog.map((entry) => (
                <li key={entry.id} className="fi-ai-automation__list-item">
                  <strong>
                    {new Date(entry.at).toLocaleString()} — {entry.trigger}
                  </strong>
                  <div className="fi-ai-automation__metric-label">
                    processed {entry.processed}, skipped {entry.skipped}
                    {entry.errors.length > 0 ? ` · ${entry.errors.length} errors` : ""}
                  </div>
                  {entry.errors.map((error) => (
                    <p key={error} className="fi-ai-automation__subtitle">
                      {error}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </FiCardContent>
      </FiAnalyticsCard>
    </section>
  );
}
