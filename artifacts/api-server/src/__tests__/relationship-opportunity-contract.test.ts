import { buildRelationshipOpportunity } from "../brain/product/buildRelationshipOpportunity.js";
import type { BrainExecutionResult } from "../brain/orchestrator.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";

const decision = (outcome: "recommend_action" | "show_dashboard_insight" | "wait"): ProductBrainDecision => ({
  version: 1, recipientId: "recipient-9", decision: { outcome }, sourceRuleId: "fresh_update",
  actionPlan: { type: outcome, category: "follow_up", priority: "high", primaryReason: "test" },
  selectedFollowUpQuestion: null, display: { title: "Reconnect", explanation: "A recent signal is available." },
});
const execution = (confidence: number, relationshipId = "relationship-3"): BrainExecutionResult => ({
  loadResult: { brainContextVersion: 1, relationshipId, userId: "user-1", loadedAt: "2099-01-01T00:00:00.000Z", relationshipContext: {} as never },
  extraction: { contributorGroups: [], availableSignals: [
    { source: "event_timing", label: "birthday", value: "03-10" },
    { source: "memory_freshness", label: "days_since_update", value: 20 },
  ] },
  decideResult: { decision: { outcome: "recommend_action" }, confidence, reasons: [], debugNotes: [] },
  normalized: {} as never, decisionContext: {} as never, actionPlan: {} as never,
  ruleEvaluation: {} as never, selectedFollowUpQuestion: null,
});

const productionShaped = buildRelationshipOpportunity(decision("recommend_action"), execution(73, "recipient-9"), { recipientId: "recipient-9", recipientName: "Rae" });
if (productionShaped.relationshipId !== null || productionShaped.relationshipIdentityProvenance !== null) throw new Error("recipient alias used as relationship identity");

const actionable = buildRelationshipOpportunity(decision("recommend_action"), execution(73), { recipientId: "recipient-9", recipientName: "Rae" }, { relationshipId: "relationship-3", provenance: { sourceType: "relationship_store", sourceId: "row-3" } });
if (actionable.confidence.status !== "known" || actionable.confidence.value !== 73) throw new Error("genuine confidence not preserved");
if (actionable.relationshipId !== "relationship-3" || actionable.relationshipIdentityProvenance?.sourceId !== "row-3") throw new Error("genuine relationship identity not preserved");
if (actionable.timing.observedAt !== null) throw new Error("load time reused as observation time");
if (actionable.provenance.evidence[0]?.classification !== "direct_fact") throw new Error("direct fact lost");
if (actionable.provenance.evidence[1]?.classification === "direct_fact") throw new Error("derived signal inflated to fact");
if (!actionable.recommendation) throw new Error("actionable recommendation missing");

const insight = buildRelationshipOpportunity(decision("show_dashboard_insight"), execution(42), { recipientId: "recipient-9", recipientName: "Rae" });
if (!insight.recommendation || insight.restraint.restrained) throw new Error("existing insight action behavior changed");

const restrained = buildRelationshipOpportunity(decision("wait"), execution(Number.NaN, "recipient-9"), { recipientId: "recipient-9", recipientName: "Rae" });
if (restrained.confidence.status !== "unknown" || restrained.relationshipId !== null) throw new Error("unknown values invented");
if (restrained.recommendation !== null || !restrained.restraint.restrained) throw new Error("restraint lost");
console.log("relationship opportunity contract passed");
