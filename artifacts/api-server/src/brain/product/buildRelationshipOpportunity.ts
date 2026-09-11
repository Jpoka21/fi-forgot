import type { BrainExecutionResult } from "../orchestrator";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import { resolveProductBrainActionHref } from "./buildBrainEventActionHref";
import { resolveDashboardBrainActionLabel } from "./dashboardBrainActionLabels";
import {
  RELATIONSHIP_OPPORTUNITY_VERSION,
  type OpportunityEvidenceClassification,
  type RelationshipOpportunity,
} from "./relationshipOpportunityTypes";
import {
  evaluateOpportunityTemporal,
  type OpportunityTemporalFamily,
  type OpportunityTimingChange,
} from "../temporal";

function temporalInput(
  decision: ProductBrainDecision,
  execution: BrainExecutionResult,
  hasPriorTemporalHistory: boolean,
) {
  const signal = execution.extraction.availableSignals.find(
    (item) => item.source === "event_timing" && item.label === decision.sourceRuleId,
  );
  const family: OpportunityTemporalFamily = (signal || hasPriorTemporalHistory) && ["birthday", "anniversary"].includes(decision.sourceRuleId)
      ? "annual_recurring"
      : "unsupported";
  return { family, signal };
}

function classifyEvidence(source: string): OpportunityEvidenceClassification {
  // These contributor families are direct passthroughs documented by playbook 112.
  if (["profile_completeness", "event_timing", "card_history", "delivery"].includes(source)) {
    return "direct_fact";
  }
  // Derived and otherwise unclassified signals remain observations, never inflated to facts.
  return "observation";
}

export function buildRelationshipOpportunity(
  decision: ProductBrainDecision,
  execution: BrainExecutionResult,
  recipient: { recipientId: string; recipientName: string },
  identity?: {
    relationshipId: string;
    provenance: { sourceType: string; sourceId: string | null };
  },
  presentation?: {
    recommendationEligible?: boolean;
    insightEligible?: boolean;
  },
  temporalEvaluation?: {
    evaluatedAt: string;
    previousHistory?: OpportunityTimingChange[];
  },
): RelationshipOpportunity {
  const actionable = !["wait", "do_nothing"].includes(decision.decision.outcome);
  const restrained = !actionable;
  const confidence = Number.isFinite(execution.decideResult.confidence)
    ? { status: "known" as const, value: execution.decideResult.confidence }
    : { status: "unknown" as const, value: null };
  const previousHistory = temporalEvaluation?.previousHistory ?? [];
  const temporalSource = temporalInput(decision, execution, previousHistory.length > 0);
  const temporal = evaluateOpportunityTemporal({
    family: temporalSource.family,
    dateValue: temporalSource.signal?.value ?? null,
    dateLabel: temporalSource.signal?.label ?? null,
    evaluatedAt: temporalEvaluation?.evaluatedAt ?? execution.loadResult.loadedAt,
    evidence: {
      source: temporalSource.signal?.source ?? "brain_execution",
      sourceId: temporalSource.signal
        ? execution.loadResult.relationshipContext.identity?.id ?? null
        : null,
      // Extraction supplies no source-record revision; a DTO schema version is not evidence.
      sourceVersion: null,
      evidenceId: null,
    },
    previousHistory,
    evidenceStatus: execution.loadResult.relationshipContext.identity?.archived
      ? "archived"
      : execution.loadResult.relationshipContext.identity?.active === false
        ? "invalidated"
      : previousHistory.length > 0 && temporalSource.signal?.value == null
          ? "withdrawn"
          : undefined,
  });
  // Unsupported non-calendar rules retain their established eligibility. A supported
  // calendar family with unknown evidence cannot acquire urgency from the clock.
  const timingEligible = temporalSource.family === "unsupported" || temporal.recommendationEligible;
  const temporallyRestrained = actionable && !timingEligible;

  return {
    version: RELATIONSHIP_OPPORTUNITY_VERSION,
    id: `${recipient.recipientId}:${decision.sourceRuleId}`,
    // loadResult.relationshipId is currently a recipient alias, not genuine relationship identity.
    relationshipId: identity?.relationshipId ?? null,
    relationshipIdentityProvenance: identity?.provenance ?? null,
    recipient: { id: recipient.recipientId, name: recipient.recipientName },
    title: decision.display.title,
    explanation: decision.display.explanation,
    confidence,
    provenance: {
      sourceType: "brain_execution",
      sourceId: decision.sourceRuleId || null,
      evidence: execution.extraction.availableSignals.map((signal) => ({
        evidenceId: null,
        source: signal.source,
        label: signal.label,
        classification: classifyEvidence(signal.source),
        observedAt: null,
        sourceVersion: null,
      })),
    },
    timing: { observedAt: null, temporal },
    presentation: {
      recommendationEligible: actionable && timingEligible && (presentation?.recommendationEligible ?? true),
      insightEligible: actionable && timingEligible && (presentation?.insightEligible ?? true),
    },
    restraint: {
      restrained: restrained || temporallyRestrained,
      reason: restrained ? "brain_recommends_no_action" : temporallyRestrained ? temporal.restraintReason : null,
    },
    recommendation: restrained || temporallyRestrained
      ? null
      : {
          label: resolveDashboardBrainActionLabel(decision.sourceRuleId, {
            routingExperience: decision.actionPlan.routing?.experience,
          }),
          href: resolveProductBrainActionHref(decision, recipient.recipientId),
          priority: decision.actionPlan.priority,
        },
    feedback: { history: [], active: [], available: true },
  };
}
