import type { BrainExecutionResult } from "../orchestrator";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import { resolveProductBrainActionHref } from "./buildBrainEventActionHref";
import { resolveDashboardBrainActionLabel } from "./dashboardBrainActionLabels";
import {
  RELATIONSHIP_OPPORTUNITY_VERSION,
  type OpportunityEvidenceClassification,
  type RelationshipOpportunity,
} from "./relationshipOpportunityTypes";

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
): RelationshipOpportunity {
  const recommendationEligible = !["wait", "do_nothing"].includes(decision.decision.outcome);
  const restrained = !recommendationEligible;
  const confidence = Number.isFinite(execution.decideResult.confidence)
    ? { status: "known" as const, value: execution.decideResult.confidence }
    : { status: "unknown" as const, value: null };

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
      })),
    },
    timing: { observedAt: null },
    presentation: {
      recommendationEligible,
      insightEligible: recommendationEligible,
    },
    restraint: {
      restrained,
      reason: restrained ? "brain_recommends_no_action" : null,
    },
    recommendation: restrained
      ? null
      : {
          label: resolveDashboardBrainActionLabel(decision.sourceRuleId, {
            routingExperience: decision.actionPlan.routing?.experience,
          }),
          href: resolveProductBrainActionHref(decision, recipient.recipientId),
          priority: decision.actionPlan.priority,
        },
  };
}
