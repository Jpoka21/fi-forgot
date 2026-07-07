import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { loadAiRecommendations } from "@/app/ai/aiEngine";
import { aiDefaults } from "@/app/ai/aiDomain";
import {
  buildMemorySnippets,
  buildRelationshipInsights,
  getSuggestedConversations,
} from "@/app/ai-concierge/aiConciergeEngine";
import { trackConciergeEvent } from "@/app/ai-concierge/aiConciergeAnalytics";
import {
  aiConciergeDefaults,
  conciergePageSections,
  type ConciergePageSection,
} from "@/app/ai-concierge/aiConciergeDomain";
import { useAuth } from "@/lib/auth-context";

export function useAiConciergeWorkspace() {
  const { user } = useAuth();
  const [section, setSection] = useState<ConciergePageSection>("workspace");
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<number | null>(null);

  const recommendations = useMemo(() => {
    try {
      return loadAiRecommendations(user?.email);
    } catch {
      return [];
    }
  }, [user?.email]);

  const insights = useMemo(() => buildRelationshipInsights(), []);
  const memories = useMemo(() => buildMemorySnippets(), []);
  const suggestedConversations = useMemo(() => getSuggestedConversations(), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
      trackConciergeEvent("concierge_page_viewed", { section });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [section]);

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
    refreshTimerRef.current = window.setTimeout(() => setIsLoading(false), 120);
  }, []);

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
    aiDefaults,
    refresh,
  };
}

export type AiConciergeWorkspaceController = ReturnType<typeof useAiConciergeWorkspace>;
