import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { FiConciergeLearnSomeonePanel } from "@/app/components/concierge-questions";
import { FiAiSuggestionList } from "@/app/components/ai/FiAiSuggestionList";
import { trackConciergeEvent } from "@/app/ai-concierge/aiConciergeAnalytics";
import type { AiConciergeWorkspaceController } from "@/app/ai-concierge/hooks/useAiConciergeWorkspace";

export function FiConciergeWorkspacePanel({
  workspace,
  onPromptSelect,
}: {
  workspace: AiConciergeWorkspaceController;
  onPromptSelect: (prompt: string) => void;
}) {
  return (
    <div className="fi-ai-concierge-page__layout fi-ai-concierge-page__layout--workspace">
      <FiConciergeLearnSomeonePanel insights={workspace.insights} />

      <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-prompts-title">
        <h2 id="concierge-prompts-title" className="fi-ai-concierge-page__section-title">
          Suggested conversations
        </h2>
        <p className="fi-ai-concierge-page__section-copy">{workspace.defaults.workspaceDescription}</p>

        <div className="fi-ai-concierge-page__prompt-grid">
          {workspace.suggestedConversations.map((item) => (
            <button
              key={item.id}
              type="button"
              className="fi-ai-concierge-page__prompt"
              onClick={() => {
                trackConciergeEvent("concierge_prompt_selected", { promptId: item.id });
                onPromptSelect(item.prompt);
              }}
            >
              <p className="fi-ai-concierge-page__prompt-label">{item.label}</p>
              <p className="fi-ai-concierge-page__prompt-copy">{item.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-recommendations-title">
        <h2 id="concierge-recommendations-title" className="fi-ai-concierge-page__section-title">
          {workspace.defaults.recommendationsTitle}
        </h2>
        {workspace.recommendations.length > 0 ? (
          <FiAiSuggestionList suggestions={workspace.recommendations} />
        ) : (
          <p className="fi-ai-concierge-page__section-copy">{workspace.aiDefaults.emptyDescription}</p>
        )}
      </section>

      <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-insights-title">
        <h2 id="concierge-insights-title" className="fi-ai-concierge-page__section-title">
          {workspace.defaults.insightsTitle}
        </h2>
        <p className="fi-ai-concierge-page__section-copy">{workspace.defaults.insightsDescription}</p>
        <ul className="fi-ai-concierge-page__insight-list">
          {workspace.insights.map((insight) => (
            <li key={insight.id} className="fi-ai-concierge-page__insight-item">
              <strong>{insight.title}</strong>
              <span>{insight.description}</span>
              {insight.href ? (
                <Link href={insight.href}>
                  <FiButton variant="ghost" size="sm">
                    View profile
                  </FiButton>
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-memory-title">
        <h2 id="concierge-memory-title" className="fi-ai-concierge-page__section-title">
          {workspace.defaults.memoryTitle}
        </h2>
        <p className="fi-ai-concierge-page__section-copy">{workspace.defaults.memoryDescription}</p>
        {workspace.memories.length > 0 ? (
          <ul className="fi-ai-concierge-page__memory-list">
            {workspace.memories.map((memory) => (
              <li key={memory.id} className="fi-ai-concierge-page__memory-item">
                <strong>
                  {memory.recipientName} · {memory.label}
                </strong>
                <span>{memory.excerpt}</span>
                <Link href={memory.href}>
                  <FiButton
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      trackConciergeEvent("concierge_memory_opened", { memoryId: memory.id })
                    }
                  >
                    Open memory
                  </FiButton>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fi-ai-concierge-page__section-copy">
            Add a few memories in relationship profiles to help future cards feel personal.
          </p>
        )}
      </section>
    </div>
  );
}
