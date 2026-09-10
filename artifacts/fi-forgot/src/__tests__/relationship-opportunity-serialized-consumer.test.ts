import { mapConciergeWorkspaceViewModel } from "../app/concierge-brain/mapConciergeViewModel.js";
import type { ConciergeWorkspaceResponse } from "../app/concierge-brain/conciergeWorkspaceTypes.js";
import {
  relationshipOpportunitiesToConversationRecommendations,
  resolveBrainAttentionResponse,
} from "../app/ai-concierge/aiConciergeDomain.js";

const serialized = process.env.RELATIONSHIP_OPPORTUNITY_SERIALIZED_PAYLOAD;
if (!serialized) throw new Error("serialized Concierge payload was not supplied by server integration");
const mapped = mapConciergeWorkspaceViewModel(JSON.parse(serialized) as ConciergeWorkspaceResponse);
const actionable = mapped.opportunities.find((item) => item.id === "actionable:inactivity");
const restrained = mapped.opportunities.find((item) => item.id === "quiet:wait");
if (!actionable?.recommendation || actionable.confidence.status !== "known") throw new Error("frontend mapper lost actionable Opportunity");
if (!restrained?.restraint.restrained || restrained.recommendation !== null || restrained.relationshipId !== null) throw new Error("frontend mapper lost restraint or missing identity");
const conversationInput = relationshipOpportunitiesToConversationRecommendations(mapped.opportunities);
const response = resolveBrainAttentionResponse(conversationInput);
if (response.actions.length !== 1 || response.actions[0]?.id !== "action-actionable:inactivity") throw new Error("frontend conversation exposed restrained action");
console.log("serialized Opportunity frontend mapper/conversation consumer passed");
