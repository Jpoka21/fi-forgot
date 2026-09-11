import { mapConciergeWorkspaceViewModel } from "../app/concierge-brain/mapConciergeViewModel.js";
import type { ConciergeWorkspaceResponse } from "../app/concierge-brain/conciergeWorkspaceTypes.js";
import {
  relationshipOpportunitiesToConversationRecommendations,
  relationshipOpportunitiesForRecommendationPresentation,
  resolveBrainAttentionResponse,
} from "../app/ai-concierge/aiConciergeDomain.js";

const serialized = process.env.RELATIONSHIP_OPPORTUNITY_SERIALIZED_PAYLOAD;
if (!serialized) throw new Error("serialized Concierge payload was not supplied by server integration");
const mapped = mapConciergeWorkspaceViewModel(JSON.parse(serialized) as ConciergeWorkspaceResponse);
const actionable = mapped.opportunities.find((item) => item.presentation.recommendationEligible && item.recommendation !== null);
const restrained = mapped.opportunities.find((item) => item.restraint.restrained && item.recommendation === null);
if (!actionable?.recommendation || actionable.confidence.status !== "known") throw new Error("frontend mapper lost actionable Opportunity");
if (!restrained?.restraint.restrained || restrained.recommendation !== null) throw new Error("frontend mapper lost restraint");
const temporal = mapped.opportunities.find((item) => item.timing.temporal?.state !== "unknown")?.timing.temporal;
if (temporal && (temporal.history.length === 0 || temporal.preparationWindow?.source !== "policy")) throw new Error("frontend mapper lost temporal history or policy labeling");
const conversationInput = relationshipOpportunitiesToConversationRecommendations(mapped.opportunities);
const response = resolveBrainAttentionResponse(conversationInput);
const presented = relationshipOpportunitiesForRecommendationPresentation(mapped.opportunities);
const expectedCount = Math.min(3, mapped.opportunities.filter((item) => item.presentation.recommendationEligible && item.recommendation !== null && (item.timing.temporal?.recommendationEligible ?? true)).length);
if (response.actions.length !== expectedCount || presented.length !== expectedCount) throw new Error("frontend consumers did not honor eligibility and the three-action presentation policy");
if (restrained && response.actions.some((action) => action.id === `action-${restrained.id}`)) throw new Error("frontend conversation exposed restrained action");
console.log("serialized Opportunity frontend mapper/conversation consumer passed");
