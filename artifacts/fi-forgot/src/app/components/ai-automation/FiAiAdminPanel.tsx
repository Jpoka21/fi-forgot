import type { AiAdminController } from "@/app/ai-automation/hooks/useAiAdmin";
import { FiButton } from "@/app/components/button/FiButton";
import { FiAnalyticsCard, FiCardContent, FiCardHeader, FiCardTitle } from "@/app/components/card/FiCard";
import { FiTextarea } from "@/app/components/input/FiTextarea";
import { FiAdminEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";

export function FiAiAdminPanel({ ai }: { ai: AiAdminController }) {
  const { defaults, selectedPrompt, promptSurfaces, activity, usage, health, monitoring } = ai;

  return (
    <section className="fi-ai-automation" aria-labelledby="ai-admin-title">
      <header className="fi-ai-automation__header">
        <h2 id="ai-admin-title" className="fi-ai-automation__title">
          {defaults.aiTitle}
        </h2>
        <p className="fi-ai-automation__subtitle">{defaults.aiSubtitle}</p>
        <p className="fi-ai-automation__banner">{defaults.preservationBanner}</p>
      </header>

      <div className="fi-ai-automation__metrics" aria-label={defaults.healthTitle}>
        <div className="fi-ai-automation__metric">
          <p className="fi-ai-automation__metric-label">{defaults.healthTitle}</p>
          <p
            className={`fi-ai-automation__metric-value fi-ai-automation__health--${health.status}`}
            role="status"
          >
            {health.status === "healthy" ? defaults.healthyLabel : defaults.attentionLabel}
          </p>
        </div>
        <div className="fi-ai-automation__metric">
          <p className="fi-ai-automation__metric-label">Drafts</p>
          <p className="fi-ai-automation__metric-value">{usage.totalDrafts}</p>
        </div>
        <div className="fi-ai-automation__metric">
          <p className="fi-ai-automation__metric-label">Approval rate</p>
          <p className="fi-ai-automation__metric-value">{usage.approvalRate}%</p>
        </div>
        <div className="fi-ai-automation__metric">
          <p className="fi-ai-automation__metric-label">Queue attention</p>
          <p className="fi-ai-automation__metric-value">{monitoring.length}</p>
        </div>
      </div>

      <div className="fi-ai-automation__layout fi-ai-automation__layout--split">
        <FiAnalyticsCard>
          <FiCardHeader>
            <FiCardTitle>{defaults.promptManagementTitle}</FiCardTitle>
          </FiCardHeader>
          <FiCardContent>
            <ul className="fi-ai-automation__list">
              {promptSurfaces.map((surface) => (
                <li key={surface.id}>
                  <button
                    type="button"
                    className={`fi-ai-automation__surface-btn${
                      surface.id === ai.selectedPromptId ? " fi-ai-automation__surface-btn--active" : ""
                    }`}
                    onClick={() => ai.setSelectedPromptId(surface.id)}
                  >
                    <strong>{surface.label}</strong>
                    <div className="fi-ai-automation__metric-label">{surface.endpoint}</div>
                  </button>
                </li>
              ))}
            </ul>
          </FiCardContent>
        </FiAnalyticsCard>

        {selectedPrompt ? (
          <FiAnalyticsCard>
            <FiCardHeader>
              <FiCardTitle>{selectedPrompt.label}</FiCardTitle>
            </FiCardHeader>
            <FiCardContent>
              <p className="fi-ai-automation__subtitle">{selectedPrompt.description}</p>
              <p className="fi-ai-automation__metric-label">{selectedPrompt.preservationNote}</p>
              <div className="fi-ai-automation__fields" aria-label="Context fields">
                {selectedPrompt.contextFields.map((field) => (
                  <span key={field} className="fi-ai-automation__field-chip">
                    {field}
                  </span>
                ))}
              </div>
              <label className="fi-ai-automation__metric-label" htmlFor="ai-prompt-notes">
                {defaults.notesLabel}
              </label>
              <FiTextarea
                id="ai-prompt-notes"
                rows={4}
                value={ai.notesDraft}
                onChange={(event) => ai.setNotesDraft(event.target.value)}
              />
              <FiButton variant="secondary" size="sm" onClick={ai.saveNotes}>
                {defaults.saveNotesLabel}
              </FiButton>
            </FiCardContent>
          </FiAnalyticsCard>
        ) : null}
      </div>

      <FiAnalyticsCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.activityTitle}</FiCardTitle>
        </FiCardHeader>
        <FiCardContent>
          {activity.length === 0 ? (
            <FiAdminEmptyState title={defaults.noActivityLabel} description="" />
          ) : (
            <ul className="fi-ai-automation__list">
              {activity.map((item) => (
                <li key={item.id} className="fi-ai-automation__list-item">
                  <strong>
                    {item.recipientName} — {item.eventType}
                  </strong>
                  <div className="fi-ai-automation__metric-label">
                    {item.customerName} · {item.status} · {new Date(item.updatedAt).toLocaleString()}
                  </div>
                  {item.preview ? <p className="fi-ai-automation__subtitle">{item.preview}</p> : null}
                </li>
              ))}
            </ul>
          )}
          <div className="fi-ai-automation__actions">
            <FiButton variant="secondary" size="sm" onClick={() => ai.onNavigate("messages")}>
              {defaults.viewMessagesLabel}
            </FiButton>
          </div>
        </FiCardContent>
      </FiAnalyticsCard>

      <FiAnalyticsCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.usageTitle}</FiCardTitle>
        </FiCardHeader>
        <FiCardContent>
          <div className="fi-ai-automation__metrics">
            <div className="fi-ai-automation__metric">
              <p className="fi-ai-automation__metric-label">Pending</p>
              <p className="fi-ai-automation__metric-value">{usage.pending}</p>
            </div>
            <div className="fi-ai-automation__metric">
              <p className="fi-ai-automation__metric-label">Approved</p>
              <p className="fi-ai-automation__metric-value">{usage.approved}</p>
            </div>
            <div className="fi-ai-automation__metric">
              <p className="fi-ai-automation__metric-label">Rejected</p>
              <p className="fi-ai-automation__metric-value">{usage.rejected}</p>
            </div>
          </div>
          <ul className="fi-ai-automation__list">
            {Object.entries(usage.byEvent).map(([event, count]) => (
              <li key={event} className="fi-ai-automation__list-item">
                {event}: {count}
              </li>
            ))}
          </ul>
        </FiCardContent>
      </FiAnalyticsCard>

      <FiAnalyticsCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.monitoringTitle}</FiCardTitle>
        </FiCardHeader>
        <FiCardContent>
          <ul className="fi-ai-automation__list">
            {monitoring.map((item) => (
              <li key={item.id} className="fi-ai-automation__list-item">
                <strong>
                  {item.recipientName} — {item.eventType}
                </strong>
                <div className="fi-ai-automation__metric-label">{item.fulfillmentStatus}</div>
              </li>
            ))}
          </ul>
          <FiButton variant="secondary" size="sm" onClick={() => ai.onNavigate("queue")}>
            {defaults.viewQueueLabel}
          </FiButton>
        </FiCardContent>
      </FiAnalyticsCard>
    </section>
  );
}
