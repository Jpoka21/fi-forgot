import { currentProjection, followThroughLineageId, mutateOpportunityFollowThroughService, OPPORTUNITY_ACTION_STATES, RELATIONSHIP_OUTCOME_STATES, OpportunityFollowThroughConflictError, type OpportunityFollowThroughEvent } from "../brain/follow-through/index.js";

if(!OPPORTUNITY_ACTION_STATES.includes("user_reported_completed")||!OPPORTUNITY_ACTION_STATES.includes("no_longer_relevant")||RELATIONSHIP_OUTCOME_STATES.length!==5)throw Error("truthful state vocabulary missing");
const target={ownerId:"owner",recipientId:"recipient",opportunityId:"recipient:birthday",occurrenceCycleId:"annual:01-20:2026",relationshipId:null,family:"birthday",sourceType:"brain_execution" as const,sourceId:"birthday"};
if(followThroughLineageId(target,"action")===followThroughLineageId(target,"outcome"))throw Error("action and outcome histories merged");
if(followThroughLineageId(target,"action")===followThroughLineageId({...target,occurrenceCycleId:"annual:01-20:2027"},"action"))throw Error("occurrence cycles merged");
const history:OpportunityFollowThroughEvent[]=[];
const repository={list:async()=>history,findReceipt:async()=>null,append:async({event,expectedVersion}:{event:OpportunityFollowThroughEvent;expectedVersion:number})=>{const latest=history.filter(e=>e.lineageId===event.lineageId).at(-1);if((latest?.version??0)!==expectedVersion)throw new OpportunityFollowThroughConflictError("stale");history.push(event);return event;}};
const opportunity:any={id:target.opportunityId,recipient:{id:target.recipientId},relationshipId:null,provenance:{sourceId:"birthday"},timing:{temporal:{occurrenceCycleId:target.occurrenceCycleId}}};
const deps={repository,ownsRecipient:async()=>true,resolveOpportunity:async()=>opportunity,now:()=>"2026-01-01T00:00:00.000Z"};
const completed=await mutateOpportunityFollowThroughService("owner",{recipientId:"recipient",opportunityId:target.opportunityId,occurrenceCycleId:target.occurrenceCycleId,dimension:"action",value:"user_reported_completed",expectedVersion:0,idempotencyKey:"complete-1"},deps);
if(completed.status!==201||currentProjection(history)[0]?.verification!=="user_reported")throw Error("completion report inflated or not persisted");
const outcome=await mutateOpportunityFollowThroughService("owner",{recipientId:"recipient",opportunityId:target.opportunityId,occurrenceCycleId:target.occurrenceCycleId,dimension:"outcome",value:"appreciated",expectedVersion:0,idempotencyKey:"outcome-01"},deps);
if(outcome.status!==201||currentProjection(history).length!==2)throw Error("independent outcome missing");
deps.resolveOpportunity=async()=>null;
const corrected=await mutateOpportunityFollowThroughService("owner",{recipientId:"recipient",followThroughEventId:selectedLater(),dimension:"action",value:"not_completed",expectedVersion:1,idempotencyKey:"correct-01"},deps);
if(corrected.status!==201||currentProjection(history).find(e=>e.dimension==="action")?.value!=="not_completed")throw Error("stored lineage could not correct vanished source");
const historicalOutcome=await mutateOpportunityFollowThroughService("owner",{recipientId:"recipient",followThroughEventId:selectedLater(),dimension:"outcome",value:"went_well",expectedVersion:1,idempotencyKey:"outcome-02"},deps);
if(historicalOutcome.status!==201||currentProjection(history).find(e=>e.dimension==="outcome")?.value!=="went_well")throw Error("stored action lineage could not independently correct outcome");
const hostile=await mutateOpportunityFollowThroughService("owner",{recipientId:"recipient",opportunityId:target.opportunityId,occurrenceCycleId:target.occurrenceCycleId,dimension:"action",value:"externally_verified",verification:"external",expectedVersion:1,idempotencyKey:"hostile-1"},deps);
if(hostile.status!==400)throw Error("fabricated verification accepted");
const selected=history.find(e=>e.dimension==="action"&&e.active&&e.version===2)!;const withdrawn=await mutateOpportunityFollowThroughService("owner",{recipientId:"recipient",followThroughEventId:selected.id,expectedVersion:2,idempotencyKey:"withdraw-1",withdraw:true},deps);
if(withdrawn.status!==201||currentProjection(history).some(e=>e.dimension==="action")||!currentProjection(history).some(e=>e.dimension==="outcome"))throw Error("withdrawal changed the other dimension");
console.log("opportunity follow-through semantics unit tests passed");

function selectedLater(){return history.find(e=>e.dimension==="action")!.id;}
