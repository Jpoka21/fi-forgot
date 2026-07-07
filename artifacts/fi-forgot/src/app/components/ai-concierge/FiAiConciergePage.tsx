import { useEffect } from "react";

import { FiConciergeConversationPanel } from "@/app/components/ai-concierge/FiConciergeConversationPanel";
import { FiConciergeWorkspacePanel } from "@/app/components/ai-concierge/FiConciergeWorkspacePanel";
import { useAiConciergeWorkspace } from "@/app/ai-concierge/hooks/useAiConciergeWorkspace";
import { useConciergeConversation } from "@/app/ai-concierge/hooks/useConciergeConversation";

const sectionLabels = {
  workspace: "Workspace",
  conversation: "Conversation",
} as const;

export function FiAiConciergePage() {
  const workspace = useAiConciergeWorkspace();
  const conversation = useConciergeConversation();

  useEffect(() => {
    document.getElementById("concierge-main")?.focus();
  }, [workspace.section]);

  const handlePromptSelect = (prompt: string) => {
    workspace.setSection("conversation");
    void conversation.sendMessage(prompt);
  };

  return (
    <div id="concierge-main" className="fi-ai-concierge-page" tabIndex={-1}>
      <header className="fi-ai-concierge-page__header">
        <h1 className="fi-ai-concierge-page__title">{workspace.defaults.title}</h1>
        <p className="fi-ai-concierge-page__subtitle">{workspace.defaults.subtitle}</p>
      </header>

      <div className="fi-ai-concierge-page__tabs" role="tablist" aria-label="Concierge sections">
        {workspace.sections.map((section) => (
          <button
            key={section}
            type="button"
            role="tab"
            className="fi-ai-concierge-page__tab"
            aria-selected={workspace.section === section}
            aria-controls={`concierge-section-${section}`}
            id={`concierge-tab-${section}`}
            onClick={() => workspace.setSection(section)}
          >
            {sectionLabels[section]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`concierge-section-${workspace.section}`}
        aria-labelledby={`concierge-tab-${workspace.section}`}
      >
        {workspace.section === "workspace" ? (
          <FiConciergeWorkspacePanel workspace={workspace} onPromptSelect={handlePromptSelect} />
        ) : (
          <FiConciergeConversationPanel workspace={workspace} conversation={conversation} />
        )}
      </div>
    </div>
  );
}
