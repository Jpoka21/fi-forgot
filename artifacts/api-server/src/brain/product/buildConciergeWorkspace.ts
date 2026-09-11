/**
 * Builds ranked Concierge workspace payload for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import type { BrainExecutionResult } from "../orchestrator";
import { projectConciergeInsight } from "./buildConciergeInsight";
import { projectConciergeRecommendation } from "./buildConciergeRecommendation";
import {
  CONCIERGE_INSIGHTS_MAX,
  CONCIERGE_PRESENTED_RECOMMENDATIONS_MAX,
  CONCIERGE_RECOMMENDATIONS_MAX,
  CONCIERGE_WORKSPACE_VERSION,
  type ConciergeWorkspaceResponse,
} from "./conciergeTypes";
import { orchestrateProductBrainFatigue } from "./orchestrateProductBrainFatigue";
import type { FatigueOpportunity } from "../fatigue/fatigueTypes";
import { buildRelationshipOpportunity } from "./buildRelationshipOpportunity";
import {
  createPgOpportunityTemporalHistoryRepository,
  evaluateOpportunityTemporal,
  type OpportunityTemporalHistoryRepository,
} from "../temporal";
import { logger } from "../../lib/logger";
import { activeFeedback, type OpportunityFeedbackEvent, type OpportunityFeedbackRepository } from "../feedback";

export interface ConciergeRecipientInput {
  recipientId: string;
  recipientName: string;
}

export type RunBrainForRecipient = (
  recipientId: string,
  userId: string,
) => Promise<BrainExecutionResult>;

export interface BuildConciergeWorkspaceOptions {
  userId: string;
  recipients: ConciergeRecipientInput[];
  runBrain: RunBrainForRecipient;
  generatedAt?: string;
  temporalHistoryRepository?: OpportunityTemporalHistoryRepository;
  feedbackRepository?: OpportunityFeedbackRepository;
}

function applyFeedback(opportunity: ReturnType<typeof buildRelationshipOpportunity>, history: OpportunityFeedbackEvent[], available: boolean, generatedAt: string) {
  const applies = (event: OpportunityFeedbackEvent) => event.recipientId === opportunity.recipient.id && (event.scope === "recipient_family"
    ? event.family === opportunity.provenance.sourceId
    : event.opportunityId === opportunity.id && event.occurrenceCycleId === (opportunity.timing.temporal?.occurrenceCycleId ?? null));
  opportunity.feedback = { history, active: available ? activeFeedback(history).filter(applies) : [], available };
  const restraining = opportunity.feedback.active.find(event => {
    if (event.type === "not_now" || event.type === "too_early") return !event.notBefore || event.notBefore > generatedAt.slice(0, 10);
    return ["not_helpful", "too_late", "already_handled", "do_not_remind", "less_often"].includes(event.type);
  });
  if (!available || restraining) {
    opportunity.presentation = { recommendationEligible: false, insightEligible: false };
    opportunity.restraint = { restrained: true, reason: available ? `explicit_feedback_${restraining!.type}` : "feedback_history_unavailable" };
    opportunity.recommendation = null;
  }
}

function dedupeDeliveredConciergeOpportunities(
  recommendationItems: FatigueOpportunity[],
  insightItems: FatigueOpportunity[],
): FatigueOpportunity[] {
  const seen = new Set<string>();
  const delivered: FatigueOpportunity[] = [];

  for (const item of [...recommendationItems, ...insightItems]) {
    const key = item.opportunity.opportunityKey;
    if (seen.has(key)) continue;
    seen.add(key);
    delivered.push(item);
  }

  return delivered;
}

export async function buildConciergeWorkspace(options: BuildConciergeWorkspaceOptions): Promise<ConciergeWorkspaceResponse> {
  const { userId, recipients, runBrain, generatedAt = new Date().toISOString(), temporalHistoryRepository = createPgOpportunityTemporalHistoryRepository() } = options;
  // Persistence is explicit at the production boundary. Pure builder fixtures remain
  // database-neutral; the owned route always supplies PostgreSQL and therefore fails closed.
  const feedbackRepository = options.feedbackRepository ?? { list: async () => [], append: async () => { throw new Error("Feedback repository not configured"); } } as OpportunityFeedbackRepository;
  const executions = new Map<string, BrainExecutionResult>();
  const decisions = await collectProductBrainDecisions({ userId, recipients, runBrain: async (id, owner) => { const result = await runBrain(id, owner); executions.set(id, result); return result; } });
  let retainedRecords: Awaited<ReturnType<OpportunityTemporalHistoryRepository['listRetained']>> = [];
  let listingFailed = false;
  try { retainedRecords = await temporalHistoryRepository.listRetained({ userId, recipientIds: recipients.map(r => r.recipientId) }); }
  catch (error) { listingFailed = true; logger.warn({ err: error, userId }, 'Opportunity history listing unavailable'); }
  const histories = new Map(retainedRecords.map(r => [r.opportunity.id, r.history]));
  const failedLoads = new Set<string>();
  await Promise.all(decisions.map(async decision => {
    const id = decision.recipientId + ':' + decision.sourceRuleId;
    if (histories.has(id)) return;
    try { histories.set(id, await temporalHistoryRepository.loadHistory({ userId, opportunityId: id })); }
    catch (error) { failedLoads.add(id); logger.warn({ err: error, userId, opportunityId: id }, 'Opportunity history unavailable'); }
  }));
  const evaluated = new Map<string, ReturnType<typeof buildRelationshipOpportunity>>();
  for (const decision of decisions) {
    const execution = executions.get(decision.recipientId)!;
    const recipient = recipients.find(r => r.recipientId === decision.recipientId)!;
    const id = decision.recipientId + ':' + decision.sourceRuleId;
    evaluated.set(id, buildRelationshipOpportunity(decision, execution, recipient, undefined, undefined, { evaluatedAt: generatedAt, previousHistory: histories.get(id) ?? [] }));
  }
  for (const retained of retainedRecords) {
    if (evaluated.has(retained.opportunity.id)) continue;
    const prior = retained.history.at(-1);
    const execution = executions.get(retained.opportunity.recipient.id);
    if (!execution) continue; // The caller's authorized recipient set bounds retained access.
    const identity = execution.loadResult.relationshipContext.identity;
    const continuing = execution.extraction.availableSignals.some(signal => signal.source === prior?.evidence.source && signal.label === prior?.evidence.dateLabel && signal.value === prior?.evidence.dateValue);
    const temporal = evaluateOpportunityTemporal({ family: prior?.effectiveDate ? 'one_time' : 'unsupported', dateValue: prior?.evidence.dateValue ?? null, dateLabel: prior?.evidence.dateLabel ?? null, evaluatedAt: generatedAt, evidence: prior?.evidence ?? retained.opportunity.timing.temporal!.evidence, previousHistory: retained.history, evidenceStatus: identity?.archived ? 'archived' : identity?.active === false ? 'invalidated' : continuing ? undefined : 'withdrawn', fixedOccurrenceCycleId: prior?.occurrenceCycleId ?? undefined, fixedOccurrenceDate: prior?.effectiveDate ?? undefined });
    evaluated.set(retained.opportunity.id, { ...retained.opportunity, timing: { observedAt: retained.opportunity.timing.observedAt, temporal }, presentation: { recommendationEligible: false, insightEligible: false }, restraint: { restrained: true, reason: temporal.restraintReason ?? 'not_current_brain_decision' }, recommendation: null, feedback: retained.opportunity.feedback ?? { history: [], active: [], available: true } });
  }
  const suppressForPersistence = (opportunity: ReturnType<typeof buildRelationshipOpportunity>, status: 'unavailable' | 'failed') => {
    const temporal = opportunity.timing.temporal;
    if (!temporal) return;
    temporal.persistence = status;
    if (temporal.family !== 'unsupported') {
      opportunity.presentation = { recommendationEligible: false, insightEligible: false };
      opportunity.restraint = { restrained: true, reason: 'temporal_history_' + status };
      opportunity.recommendation = null;
    }
  };
  // Persist all retained Brain Opportunities before any presentation/exposure accounting.
  // Unknown continuity never becomes an empty successful baseline.
  await Promise.all([...evaluated].map(async ([id, opportunity]) => {
    const temporal = opportunity.timing.temporal;
    if (!temporal) return;
    if (listingFailed || failedLoads.has(id)) { suppressForPersistence(opportunity, 'unavailable'); return; }
    const latest = temporal.history.at(-1), prior = histories.get(id)?.at(-1);
    if (!latest || latest.changeId === prior?.changeId) return;
    try { await temporalHistoryRepository.appendChange({ userId, opportunityId: id, change: latest, evidence: temporal.evidence, opportunity }); }
    catch (error) { suppressForPersistence(opportunity, 'failed'); logger.warn({ err: error, userId, opportunityId: id }, 'Opportunity history append failed'); }
  }));
  let feedbackHistory: OpportunityFeedbackEvent[] = [], feedbackAvailable = true;
  try { feedbackHistory = await feedbackRepository.list({ ownerId: userId, recipientIds: recipients.map(r => r.recipientId) }); }
  catch (error) { feedbackAvailable = false; logger.warn({ err: error, userId }, "Opportunity feedback listing unavailable"); }
  for (const opportunity of evaluated.values()) applyFeedback(opportunity, feedbackHistory.filter(event => event.ownerId === userId && event.recipientId === opportunity.recipient.id), feedbackAvailable, generatedAt);
  return orchestrateProductBrainFatigue({ userId, generatedAt, decisions, recipients, buildFromVisible: (visible, buildGeneratedAt) => {
    const recommendationsInput = visible.slice(0, CONCIERGE_RECOMMENDATIONS_MAX);
    const insightsInput = visible.slice(0, CONCIERGE_INSIGHTS_MAX);
    const primaryInput = visible.slice(0, Math.max(CONCIERGE_RECOMMENDATIONS_MAX, CONCIERGE_INSIGHTS_MAX));
    const eligibility = new Map([...evaluated].map(([id, opportunity]) => [id, { ...opportunity.presentation }]));
    for (const opportunity of evaluated.values()) opportunity.presentation = { recommendationEligible: false, insightEligible: false };
    const primary = primaryInput.map((item, index) => {
      const id = item.opportunity.opportunityKey;
      const sourceDecision = item.opportunity.decision;
      const recipientId = item.opportunity.recipientId;
      const recipientName = item.opportunity.recipientName;
      const opportunity = evaluated.get(id);
      if (!opportunity || !sourceDecision || opportunity.recipient.id !== recipientId || opportunity.recipient.name !== recipientName) {
        throw new Error("Fatigue Opportunity did not match its evaluated Relationship Opportunity");
      }
      const eligible = eligibility.get(id)!;
      opportunity.presentation = { recommendationEligible: eligible.recommendationEligible && index < CONCIERGE_PRESENTED_RECOMMENDATIONS_MAX, insightEligible: eligible.insightEligible && index < CONCIERGE_INSIGHTS_MAX };
      return opportunity;
    });
    const recommendations = primary.slice(0, CONCIERGE_RECOMMENDATIONS_MAX).filter(o => o.recommendation !== null).map(projectConciergeRecommendation);
    const insights = insightsInput.flatMap(item => { const o = evaluated.get(item.opportunity.opportunityKey)!; return o.presentation.insightEligible ? [projectConciergeInsight(o)] : []; });
    return { product: { version: CONCIERGE_WORKSPACE_VERSION, generatedAt: buildGeneratedAt, opportunities: [...evaluated.values()], recommendations, insights }, deliveredFatigueOpportunities: dedupeDeliveredConciergeOpportunities(recommendationsInput, insightsInput).filter(item => evaluated.get(item.opportunity.opportunityKey)?.recommendation !== null) };
  } });
}
