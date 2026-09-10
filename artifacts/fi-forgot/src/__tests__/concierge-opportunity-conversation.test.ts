import { relationshipOpportunitiesToConversationRecommendations, resolveBrainAttentionResponse } from "../app/ai-concierge/aiConciergeDomain.js";
import type { RelationshipOpportunity } from "../app/concierge-brain/conciergeWorkspaceTypes.js";
import { readFileSync } from "node:fs";

const base: RelationshipOpportunity = { version: 1, id: "restrained", relationshipId: null, relationshipIdentityProvenance: null, recipient: { id: "r", name: "Pat" }, title: "Quiet context", explanation: "No action is recommended.", confidence: { status: "unknown", value: null }, provenance: { sourceType: "brain_execution", sourceId: null, evidence: [] }, timing: { observedAt: null }, presentation: { recommendationEligible: false, insightEligible: false }, restraint: { restrained: true, reason: "brain_recommends_no_action" }, recommendation: null };
const actionable: RelationshipOpportunity = { ...base, id: "actionable", title: "Actionable context", presentation: { recommendationEligible: true, insightEligible: true }, restraint: { restrained: false, reason: null }, recommendation: { label: "Open profile", href: "/relationship/r", priority: "medium" } };
const recommendations = relationshipOpportunitiesToConversationRecommendations([base, actionable]);
const response = resolveBrainAttentionResponse(recommendations);
if (recommendations.length !== 1 || response.actions.length !== 1 || response.actions[0]?.id !== "action-actionable") throw new Error("restrained opportunity produced action");
if (response.content.includes(base.title)) throw new Error("restrained opportunity presented as recommendation");
const componentSource = readFileSync("artifacts/fi-forgot/src/app/components/ai-concierge/FiConciergeWorkspacePanel.tsx", "utf8");
if (!componentSource.includes("opportunity.recommendation ?") || !componentSource.includes(": null")) throw new Error("component action is not guarded by recommendation presence");
console.log("concierge opportunity conversation passed");
