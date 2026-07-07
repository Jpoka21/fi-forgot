import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { FiAiRetryExperience } from "@/app/components/ai/FiAiRetryExperience";
import { buildConciergeConversationLabel } from "@/app/components/ai-concierge/accessibility";
import { trackConciergeEvent } from "@/app/ai-concierge/aiConciergeAnalytics";
import type { ConciergeConversationController } from "@/app/ai-concierge/hooks/useConciergeConversation";
import type { AiConciergeWorkspaceController } from "@/app/ai-concierge/hooks/useAiConciergeWorkspace";

export function FiConciergeConversationPanel({
  workspace,
  conversation,
}: {
  workspace: AiConciergeWorkspaceController;
  conversation: ConciergeConversationController;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.messages, conversation.isStreaming]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void conversation.sendMessage(conversation.draft);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void conversation.sendMessage(conversation.draft);
    }
  };

  return (
    <section
      className="fi-ai-concierge-page__panel fi-ai-concierge-page__conversation"
      aria-label={buildConciergeConversationLabel(
        conversation.messages.length,
        conversation.isStreaming,
      )}
    >
      <header className="fi-ai-concierge-page__toolbar">
        <div>
          <h2 className="fi-ai-concierge-page__section-title">{workspace.defaults.conversationTitle}</h2>
          <p className="fi-ai-concierge-page__section-copy">{workspace.defaults.conversationDescription}</p>
        </div>
        <FiButton
          variant="ghost"
          size="sm"
          disabled={conversation.messages.length === 0}
          onClick={conversation.clearConversation}
        >
          {workspace.defaults.clearConversationLabel}
        </FiButton>
      </header>

      <p className="fi-ai-concierge-page__status" aria-live="polite">
        {conversation.isResponding
          ? conversation.isStreaming
            ? workspace.defaults.streamingLabel
            : workspace.defaults.loadingLabel
          : conversation.showEmpty
            ? workspace.defaults.emptyConversationTitle
            : `${conversation.messages.length} messages`}
      </p>

      <div className="fi-ai-concierge-page__messages" role="log" aria-live="polite" aria-relevant="additions text">
        {conversation.showEmpty ? (
          <div>
            <h3 className="fi-ai-concierge-page__section-title">{workspace.defaults.emptyConversationTitle}</h3>
            <p className="fi-ai-concierge-page__section-copy">
              {workspace.defaults.emptyConversationDescription}
            </p>
          </div>
        ) : null}

        {conversation.messages.map((message) => (
          <article
            key={message.id}
            className={`fi-ai-concierge-page__message fi-ai-concierge-page__message--${message.role}`}
          >
            <span className="fi-ai-concierge-page__message-meta">
              {message.role === "user" ? "You" : "Concierge"}
              {message.streaming ? " · responding" : ""}
            </span>
            <div>{message.content || (message.streaming ? "…" : "")}</div>
            {message.actions?.length ? (
              <div className="fi-ai-concierge-page__message-actions">
                {message.actions.map((action) => (
                  <Link key={action.id} href={action.href}>
                    <FiButton
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        trackConciergeEvent("concierge_action_selected", { actionId: action.id })
                      }
                    >
                      {action.label}
                    </FiButton>
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        ))}
        <div ref={endRef} />
      </div>

      {conversation.error ? (
        <FiAiRetryExperience
          title={workspace.defaults.errorTitle}
          description={conversation.error}
          retryLabel={workspace.defaults.retryLabel}
          onRetry={conversation.retryLast}
        />
      ) : null}

      {conversation.followUps.length > 0 ? (
        <div>
          <h3 className="fi-ai-concierge-page__section-title">{workspace.defaults.followUpTitle}</h3>
          <div className="fi-ai-concierge-page__follow-ups">
            {conversation.followUps.map((followUp) => (
              <button
                key={followUp}
                type="button"
                className="fi-ai-concierge-page__follow-up"
                onClick={() => void conversation.sendMessage(followUp)}
              >
                {followUp}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <form className="fi-ai-concierge-page__composer" onSubmit={handleSubmit}>
        <div className="fi-ai-concierge-page__composer-row">
          <textarea
            id="concierge-message-input"
            className="fi-ai-concierge-page__input"
            rows={2}
            value={conversation.draft}
            placeholder={workspace.defaults.inputPlaceholder}
            aria-label={workspace.defaults.inputLabel}
            disabled={conversation.isResponding}
            onChange={(event) => conversation.setDraft(event.target.value)}
            onKeyDown={handleComposerKeyDown}
          />
          <FiButton
            type="submit"
            variant="primary"
            loading={conversation.isResponding}
            disabled={!conversation.draft.trim()}
          >
            {workspace.defaults.sendLabel}
          </FiButton>
        </div>
      </form>
    </section>
  );
}
