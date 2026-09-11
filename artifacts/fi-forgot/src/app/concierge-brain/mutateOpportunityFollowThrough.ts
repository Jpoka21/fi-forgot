import { apiFetch } from "@/app/api/shared/request";
import type { OpportunityActionState, OpportunityFollowThroughEvent, RelationshipOutcomeState } from "./conciergeWorkspaceTypes";
export interface OpportunityFollowThroughRequest {recipientId:string;opportunityId?:string;occurrenceCycleId?:string|null;dimension?:"action"|"outcome";value?:OpportunityActionState|RelationshipOutcomeState;expectedVersion:number;idempotencyKey:string;withdraw?:boolean;followThroughEventId?:string}
export function mutateOpportunityFollowThrough(request:OpportunityFollowThroughRequest){return apiFetch<{followThrough:OpportunityFollowThroughEvent}>("/api/v2/concierge/opportunity-follow-through",{method:"POST",json:request,throwOnError:true});}
