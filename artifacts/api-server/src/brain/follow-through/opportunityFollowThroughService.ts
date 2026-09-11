import { createHash } from "node:crypto";
import type { RelationshipOpportunity } from "../product/relationshipOpportunityTypes";
import { followThroughLineageId, OpportunityFollowThroughConflictError, type OpportunityFollowThroughRepository } from "./opportunityFollowThroughRepository";
import { OPPORTUNITY_ACTION_STATES, RELATIONSHIP_OUTCOME_STATES, type FollowThroughDimension, type OpportunityFollowThroughEvent, type OpportunityFollowThroughTarget } from "./opportunityFollowThroughTypes";

export interface OpportunityFollowThroughServiceDeps { repository: OpportunityFollowThroughRepository; ownsRecipient(ownerId:string,recipientId:string):Promise<boolean>; resolveOpportunity(ownerId:string,recipientId:string,opportunityId:string):Promise<RelationshipOpportunity|null>; now?:()=>string; }
export interface FollowThroughServiceResult {status:number;body:Record<string,unknown>}
const hash=(v:unknown)=>createHash("sha256").update(JSON.stringify(v)).digest("hex");

export async function listOpportunityFollowThroughService(ownerId:string,recipientId:string|null,deps:{repository:OpportunityFollowThroughRepository;listOwnedRecipientIds(ownerId:string,recipientId:string|null):Promise<string[]>}):Promise<FollowThroughServiceResult>{
  try { const ids=await deps.listOwnedRecipientIds(ownerId,recipientId); if(recipientId&&!ids.includes(recipientId)) return {status:404,body:{error:"Recipient not found"}}; const history=await deps.repository.list({ownerId,recipientIds:ids}); return {status:200,body:{history,current:currentProjection(history)}}; }
  catch{return {status:503,body:{error:"Opportunity follow-through is unavailable"}};}
}

export function currentProjection(history:OpportunityFollowThroughEvent[]){
  const latest=new Map<string,OpportunityFollowThroughEvent>(); for(const e of history) if(!latest.has(e.lineageId)||latest.get(e.lineageId)!.version<e.version) latest.set(e.lineageId,e);
  return [...latest.values()].filter(e=>e.active&&e.action==="set");
}

export async function mutateOpportunityFollowThroughService(ownerId:string,raw:unknown,deps:OpportunityFollowThroughServiceDeps):Promise<FollowThroughServiceResult>{
  if(!raw||typeof raw!=="object"||Array.isArray(raw)) return {status:400,body:{error:"Invalid follow-through request"}};
  const b=raw as Record<string,unknown>, withdraw=b.withdraw===true;
  const historicalSet=!withdraw&&typeof b.followThroughEventId==="string";
  const allowed=new Set(withdraw?["recipientId","followThroughEventId","expectedVersion","idempotencyKey","withdraw"]:historicalSet?["recipientId","followThroughEventId","dimension","value","expectedVersion","idempotencyKey"]:["recipientId","opportunityId","occurrenceCycleId","dimension","value","expectedVersion","idempotencyKey"]);
  const dimension=b.dimension as FollowThroughDimension, values=dimension==="action"?OPPORTUNITY_ACTION_STATES:dimension==="outcome"?RELATIONSHIP_OUTCOME_STATES:[];
  const valid=!Object.keys(b).some(k=>!allowed.has(k))&&typeof b.recipientId==="string"&&typeof b.idempotencyKey==="string"&&b.idempotencyKey.length>=8&&b.idempotencyKey.length<=128&&Number.isInteger(b.expectedVersion)&&(b.expectedVersion as number)>=0&&(withdraw?typeof b.followThroughEventId==="string":values.includes(b.value as never)&&(historicalSet||typeof b.opportunityId==="string"&&"occurrenceCycleId" in b&&(b.occurrenceCycleId===null||typeof b.occurrenceCycleId==="string")));
  if(!valid) return {status:400,body:{error:"Invalid follow-through request"}};
  const fingerprint=hash(withdraw?{action:"withdraw",recipientId:b.recipientId,followThroughEventId:b.followThroughEventId,expectedVersion:b.expectedVersion}:historicalSet?{action:"set_historical",recipientId:b.recipientId,followThroughEventId:b.followThroughEventId,dimension,value:b.value,expectedVersion:b.expectedVersion}:{action:"set",recipientId:b.recipientId,opportunityId:b.opportunityId,occurrenceCycleId:b.occurrenceCycleId,dimension,value:b.value,expectedVersion:b.expectedVersion});
  try {
    if(!await deps.ownsRecipient(ownerId,b.recipientId as string)) return {status:404,body:{error:"Recipient not found"}};
    const replay=await deps.repository.findReceipt?.({ownerId,idempotencyKey:b.idempotencyKey as string,requestFingerprint:fingerprint}); if(replay)return{status:201,body:{followThrough:replay}};
    const history=await deps.repository.list({ownerId,recipientIds:[b.recipientId as string]}); let target:OpportunityFollowThroughTarget,lineageId:string,prior:OpportunityFollowThroughEvent|undefined,value:any,dim:FollowThroughDimension;
    if(withdraw){const selected=history.find(e=>e.id===b.followThroughEventId);if(!selected)return{status:404,body:{error:"Follow-through report not found"}};target=selected;dim=selected.dimension;value=selected.value;lineageId=selected.lineageId;prior=history.filter(e=>e.lineageId===lineageId).sort((a,c)=>c.version-a.version)[0];if(prior?.action!=="set")return{status:409,body:{error:"No active follow-through lineage to withdraw"}};}
    else if(historicalSet){
      const selected=history.find(e=>e.id===b.followThroughEventId);
      if(!selected)return{status:404,body:{error:"Follow-through report not found"}};
      // All identity and provenance comes from the immutable stored event. The anchor
      // never resolves against a mutable current Opportunity or a later recurrence.
      target={ownerId:selected.ownerId,recipientId:selected.recipientId,opportunityId:selected.opportunityId,occurrenceCycleId:selected.occurrenceCycleId,relationshipId:selected.relationshipId,family:selected.family,sourceType:selected.sourceType,sourceId:selected.sourceId};
      dim=dimension;value=b.value;lineageId=followThroughLineageId(target,dim);
      prior=history.filter(e=>e.lineageId===lineageId).sort((a,c)=>c.version-a.version)[0];
    }
    else {const opportunity=await deps.resolveOpportunity(ownerId,b.recipientId as string,b.opportunityId as string);if(!opportunity||b.occurrenceCycleId!==(opportunity.timing.temporal?.occurrenceCycleId??null))return{status:404,body:{error:"Opportunity not found"}};if(!opportunity.provenance.sourceId)return{status:400,body:{error:"Source-backed Opportunity required"}};target={ownerId,recipientId:opportunity.recipient.id,opportunityId:opportunity.id,occurrenceCycleId:opportunity.timing.temporal?.occurrenceCycleId??null,relationshipId:opportunity.relationshipId,family:opportunity.provenance.sourceId,sourceType:"brain_execution",sourceId:opportunity.provenance.sourceId};dim=dimension;value=b.value;lineageId=followThroughLineageId(target,dim);prior=history.filter(e=>e.lineageId===lineageId).sort((a,c)=>c.version-a.version)[0];}
    const event:OpportunityFollowThroughEvent={...target,id:hash([ownerId,b.idempotencyKey]),lineageId,version:(b.expectedVersion as number)+1,dimension:dim,value,action:withdraw?"withdraw":"set",provenance:"explicit_owner_report",verification:"user_reported",receivedAt:(deps.now??(()=>new Date().toISOString()))(),supersedesId:prior?.id??null,withdrawnEventId:withdraw?prior?.id??null:null,idempotencyKey:b.idempotencyKey as string,active:!withdraw};
    return{status:201,body:{followThrough:await deps.repository.append({event,expectedVersion:b.expectedVersion as number,requestFingerprint:fingerprint})}};
  }catch(error){if(error instanceof OpportunityFollowThroughConflictError)return{status:409,body:{error:error.message}};return{status:503,body:{error:"Opportunity follow-through is unavailable"}};}
}
