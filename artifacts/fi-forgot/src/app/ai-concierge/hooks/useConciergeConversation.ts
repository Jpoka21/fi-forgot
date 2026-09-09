import { useCallback, useEffect, useRef, useState } from "react";

import {
  resolveConciergeResponse,
  streamConciergeText,
} from "@/app/ai-concierge/aiConciergeEngine";
import { trackConciergeEvent } from "@/app/ai-concierge/aiConciergeAnalytics";
import type {
  ConciergeConversationRecommendation,
  ConciergeMessage,
} from "@/app/ai-concierge/aiConciergeDomain";
import {
  aiConciergeDefaults,
  isConciergeAttentionIntent,
  resolveBrainAttentionResponse,
} from "@/app/ai-concierge/aiConciergeDomain";
import { isBrainConciergeConversationEnabled } from "@/app/concierge-brain/conciergeBrainConfig";
import {
  clearConversationHistory,
  loadConversationHistory,
  saveConversationHistory,
} from "@/app/ai-concierge/conversationStorage";
import { useAuth } from "@/lib/auth-context";

function createMessage(role: ConciergeMessage["role"], content: string, partial?: Partial<ConciergeMessage>): ConciergeMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export interface ConciergeConversationWorkspace {
  recommendations: ConciergeConversationRecommendation[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useConciergeConversation(workspace?: ConciergeConversationWorkspace) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ConciergeMessage[]>(() => loadConversationHistory());
  const [draft, setDraft] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const abortRef = useRef(false);

  useEffect(() => {
    saveConversationHistory(messages.filter((message) => !message.streaming));
  }, [messages]);

  const clearConversation = useCallback(() => {
    abortRef.current = true;
    clearConversationHistory();
    setMessages([]);
    setFollowUps([]);
    setError(null);
    trackConciergeEvent("concierge_conversation_cleared");
  }, []);

  const sendMessage = useCallback(
    async (rawContent: string) => {
      const content = rawContent.trim();
      if (!content || isResponding) return;

      abortRef.current = false;
      setError(null);
      setFollowUps([]);

      const userMessage = createMessage("user", content);
      setMessages((current) => [...current, userMessage]);
      setDraft("");
      setIsResponding(true);
      trackConciergeEvent("concierge_message_sent", { messageId: userMessage.id });

      try {
        const useBrainAttention = isBrainConciergeConversationEnabled()
          && isConciergeAttentionIntent(content);

        if (useBrainAttention && (workspace?.isLoading || workspace?.error)) {
          throw new Error("Concierge workspace recommendations are unavailable");
        }

        const response = useBrainAttention
          ? resolveBrainAttentionResponse(workspace?.recommendations ?? [])
          : resolveConciergeResponse(content, user?.email);
        const assistantId = `msg-assistant-${Date.now()}`;
        const placeholder = createMessage("assistant", "", {
          id: assistantId,
          streaming: true,
          actions: response.actions,
        });

        setMessages((current) => [...current, placeholder]);
        setIsStreaming(true);

        await streamConciergeText(response.content, (partial) => {
          if (abortRef.current) return;
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, content: partial } : message,
            ),
          );
        });

        if (abortRef.current) return;

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: response.content, streaming: false, actions: response.actions }
              : message,
          ),
        );
        setFollowUps(response.followUps);
        trackConciergeEvent("concierge_message_streamed", { messageId: assistantId });
      } catch (sendError) {
        setError(aiConciergeDefaults.errorDescription);
        trackConciergeEvent("concierge_conversation_error");
        if (import.meta.env.DEV) {
          console.error(sendError);
        }
      } finally {
        setIsResponding(false);
        setIsStreaming(false);
      }
    },
    [isResponding, user?.email, workspace],
  );

  const retryLast = useCallback(() => {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser) return;
    setError(null);
    if (isBrainConciergeConversationEnabled() && isConciergeAttentionIntent(lastUser.content)) {
      workspace?.refresh();
    }
    void sendMessage(lastUser.content);
  }, [messages, sendMessage, workspace]);

  return {
    messages,
    draft,
    setDraft,
    isResponding,
    isStreaming,
    error,
    followUps,
    sendMessage,
    clearConversation,
    retryLast,
    showEmpty: messages.length === 0 && !isResponding,
  };
}

export type ConciergeConversationController = ReturnType<typeof useConciergeConversation>;
