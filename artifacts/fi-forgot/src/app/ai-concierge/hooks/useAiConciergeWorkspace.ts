import { reserveFeedbackRequest, settleFeedbackRequest } from '@/app/concierge-brain/feedbackRequestRetry';
import type { OpportunityFeedbackRequest } from '@/app/concierge-brain/mutateOpportunityFeedback';
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
import type { RelationshipOpportunityViewModel } from "@/app/concierge-brain/conciergeViewModel";
import { useAuth } from "@/lib/auth-context";
import { mutateOpportunityFeedback } from "@/app/concierge-brain/mutateOpportunityFeedback";
import type { OpportunityFeedbackEvent, OpportunityFeedbackType } from "@/app/concierge-brain/conciergeWorkspaceTypes";
import { fetchOpportunityFeedback } from "@/app/concierge-brain/fetchOpportunityFeedback";

export function useAiConciergeWorkspace() {
  const { user } = useAuth();
  const [section, setSection] = useState<ConciergePageSection>("workspace");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<FiAiRecommendation[]>([]);
  const [opportunities, setOpportunities] = useState<RelationshipOpportunityViewModel[]>([]);
  const [insights, setInsights] = useState<ConciergeRelationshipInsight[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<OpportunityFeedbackEvent[]>([]);
  const [feedbackPending, setFeedbackPending] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const retryKeysRef = useRef(new Map<string, OpportunityFeedbackRequest>());

  useEffect(() => { retryKeysRef.current.clear(); }, [user?.email]);

  const memories = useMemo(() => buildMemorySnippets(), []);
  const suggestedConversations = useMemo(() => getSuggestedConversations(), []);

  const loadWorkspace = useCallback(async () => {
    try {
      const [workspace, feedback] = await Promise.all([buildConciergeWorkspaceForDisplay({ userEmail: user?.email }), fetchOpportunityFeedback()]);
      if (!feedback.ok || !feedback.data) throw feedback.error ?? new Error("Feedback history unavailable");
      setRecommendations(workspace.recommendations);
      setOpportunities(workspace.opportunities);
      setInsights(workspace.insights);
      setFeedbackHistory(feedback.data.history);
      setError(null);
    } catch (loadError) {
      setRecommendations([]);
      setOpportunities([]);
      setInsights([]);
      setFeedbackHistory([]);
      setError(aiDefaults.errorLabel);
      if (import.meta.env.DEV) {
        console.error(loadError);
      }
    }
  }, [user?.email]);

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

  const submitFeedback = useCallback(async (input: { opportunity?: RelationshipOpportunityViewModel; type?: OpportunityFeedbackType; scope?: "occurrence" | "recipient_family"; notBefore?: string | null; withdrawEvent?: OpportunityFeedbackEvent }) => {
    if (!input.opportunity && !input.withdrawEvent) return;
    const scope = input.scope ?? input.withdrawEvent?.scope ?? "occurrence";
    const recipientId = input.withdrawEvent?.recipientId ?? input.opportunity!.recipient.id;
    const relevant = feedbackHistory.filter(event => event.recipientId === recipientId && event.scope === scope && (input.withdrawEvent ? event.lineageId === input.withdrawEvent.lineageId : scope === "recipient_family"
      ? event.family === (input.opportunity!.provenance.sourceId ?? input.opportunity!.id)
      : event.opportunityId === input.opportunity!.id && event.occurrenceCycleId === (input.opportunity!.timing.temporal?.occurrenceCycleId ?? null)));
    const expectedVersion = Math.max(0, ...relevant.map(event => event.version));
    const key = input.withdrawEvent?.id ?? input.opportunity!.id + ":" + input.type;
    const request = reserveFeedbackRequest(retryKeysRef.current, input.withdrawEvent
      ? { recipientId, feedbackEventId: input.withdrawEvent.id, expectedVersion, withdraw:true }
      : { recipientId, opportunityId:input.opportunity!.id, occurrenceCycleId:input.opportunity!.timing.temporal?.occurrenceCycleId ?? null, type:input.type!, scope, notBefore:input.notBefore, expectedVersion });
    setFeedbackPending(key);
    setFeedbackStatus(input.withdrawEvent ? "Withdrawing feedback…" : "Saving preference…");
    try {
      await mutateOpportunityFeedback(request);
      settleFeedbackRequest(retryKeysRef.current, request);
      setFeedbackStatus(input.withdrawEvent ? "Feedback withdrawn." : "Preference saved.");
      await loadWorkspace();
    } catch (mutationError) {
      setFeedbackStatus("Save status is uncertain. Reloading history; retry will use the same request key.");
      await loadWorkspace().catch(() => undefined);
      if (import.meta.env.DEV) console.error(mutationError);
    } finally { setFeedbackPending(null); }
  }, [feedbackHistory, loadWorkspace]);

  return {
    defaults: aiConciergeDefaults,
    sections: conciergePageSections,
    section,
    setSection: handleSectionChange,
    recommendations,
    opportunities,
    insights,
    feedbackHistory,
    feedbackPending,
    feedbackStatus,
    submitFeedback,
    memories,
    suggestedConversations,
    isLoading,
    error,
    aiDefaults,
    refresh,
  };
}

export type AiConciergeWorkspaceController = ReturnType<typeof useAiConciergeWorkspace>;
