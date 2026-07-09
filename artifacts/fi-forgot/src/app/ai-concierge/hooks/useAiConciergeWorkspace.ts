import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { aiDefaults } from "@/app/ai/aiDomain";
import type { FiAiRecommendation } from "@/app/ai/aiDomain";
import {
  buildMemorySnippets,
  getSuggestedConversations,
} from "@/app/ai-concierge/aiConciergeEngine";
import { trackConciergeEvent } from "@/app/ai-concierge/aiConciergeAnalytics";
import {
  aiConciergeDefaults,
  conciergePageSections,
  type ConciergePageSection,
  type ConciergeRelationshipInsight,
} from "@/app/ai-concierge/aiConciergeDomain";
import { buildConciergeWorkspaceForDisplay } from "@/app/concierge-brain/buildConciergeWorkspaceForDisplay";

export function useAiConciergeWorkspace() {
  const [section, setSection] = useState<ConciergePageSection>("workspace");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<FiAiRecommendation[]>([]);
  const [insights, setInsights] = useState<ConciergeRelationshipInsight[]>([]);
  const refreshTimerRef = useRef<number | null>(null);

  const memories = useMemo(() => buildMemorySnippets(), []);
  const suggestedConversations = useMemo(() => getSuggestedConversations(), []);

  const loadWorkspace = useCallback(async () => {
    try {
      const workspace = await buildConciergeWorkspaceForDisplay();
      setRecommendations(workspace.recommendations);
      setInsights(workspace.insights);
      setError(null);
    } catch (loadError) {
      setRecommendations([]);
      setInsights([]);
      setError(aiDefaults.errorLabel);
      if (import.meta.env.DEV) {
        console.error(loadError);
      }
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => {
      void loadWorkspace().finally(() => {
        setIsLoading(false);
        trackConciergeEvent("concierge_page_viewed", { section });
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [loadWorkspace, section]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const handleSectionChange = useCallback((next: ConciergePageSection) => {
    setSection(next);
    trackConciergeEvent("concierge_section_changed", { section: next });
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = window.setTimeout(() => {
      void loadWorkspace().finally(() => setIsLoading(false));
    }, 120);
  }, [loadWorkspace]);

  return {
    defaults: aiConciergeDefaults,
    sections: conciergePageSections,
    section,
    setSection: handleSectionChange,
    recommendations,
    insights,
    memories,
    suggestedConversations,
    isLoading,
    error,
    aiDefaults,
    refresh,
  };
}

export type AiConciergeWorkspaceController = ReturnType<typeof useAiConciergeWorkspace>;
