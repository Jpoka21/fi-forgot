import { apiFetch } from "@/app/api/shared/request";
import type { OpportunityFollowThroughEvent } from "./conciergeWorkspaceTypes";
export function fetchOpportunityFollowThrough(){return apiFetch<{history:OpportunityFollowThroughEvent[];current:OpportunityFollowThroughEvent[]}>("/api/v2/concierge/opportunity-follow-through",{throwOnError:true});}
