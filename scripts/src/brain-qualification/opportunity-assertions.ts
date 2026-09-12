import assert from 'node:assert/strict';
import type {QualificationCall} from './lifecycle-assertions';
/** Preserve all source dates, timing history (including its recorded evaluation times),
 * decay, support, confidence and restraint. Workspace generatedAt is not evidence. */
export function opportunitySemantics(workspace:any){
 assert.ok(Array.isArray(workspace.opportunities)&&workspace.opportunities.length);
 return workspace.opportunities.map((o:any)=>{
  assert.ok(o.id&&o.recipient?.id&&o.timing?.temporal);
  const t=o.timing.temporal;assert.equal(t.persistence,'available');assert.ok(Array.isArray(t.history)&&t.history.length>0);
  return {id:o.id,recipientId:o.recipient.id,relationshipId:o.relationshipId,relationshipIdentityProvenance:o.relationshipIdentityProvenance,provenance:o.provenance,confidence:o.confidence,timing:o.timing,restraint:o.restraint,presentation:o.presentation,recommendation:o.recommendation};
 }).sort((a:any,b:any)=>a.id.localeCompare(b.id));
}
export function assertTemporalExamples(semantics:any[],unknownRecipient:string){
 assert.ok(semantics.some(o=>o.timing.temporal.family==='annual_recurring'&&o.timing.temporal.support==='supported'&&o.timing.temporal.occurrenceCycleId&&o.timing.temporal.effectiveDate),'supported dated occurrence absent');
 const unknown=semantics.find(o=>o.recipientId===unknownRecipient);assert.ok(unknown,'unknown recipient absent');
 assert.equal(unknown.timing.observedAt,null);assert.equal(unknown.timing.temporal.state,'unknown');assert.equal(unknown.timing.temporal.decay,'unknown');assert.equal(unknown.timing.temporal.occurrenceCycleId,null);assert.equal(unknown.timing.temporal.effectiveDate,null);assert.equal(unknown.recommendation,null);assert.equal(unknown.restraint.restrained,true);assert.equal(unknown.presentation.recommendationEligible,false);
}
const presented=(w:any):string[]=>w.opportunities.filter((o:any)=>o.presentation.recommendationEligible).map((o:any)=>o.id).sort();
export function assertOriginalSlots(original:string[],workspace:any,suppressed:string|null){assert.equal(original.length,3);assert.deepEqual(presented(workspace),original.filter(id=>id!==suppressed).sort(),'original slots changed or backfilled');}
export function assertAppendOnly(before:any[],after:any[],appended:any){assert.equal(after.length,before.length+1);assert.deepEqual(after.filter(e=>e.id!==appended.id),before);assert.deepEqual(after.find(e=>e.id===appended.id),appended);}
export function assertSeparateReports(action:any,outcome:any){
 for(const e of [action,outcome]){assert.ok(e.id&&e.lineageId);assert.equal(e.provenance,'explicit_owner_report');assert.equal(e.verification,'user_reported');assert.equal(e.active,true);assert.equal(e.action,'set');assert.equal(e.version,1);}
 assert.equal(action.dimension,'action');assert.equal(action.value,'user_reported_completed');assert.equal(outcome.dimension,'outcome');assert.equal(outcome.value,'went_well');assert.notEqual(action.id,outcome.id);assert.notEqual(action.lineageId,outcome.lineageId);
 for(const k of ['ownerId','recipientId','opportunityId','occurrenceCycleId','relationshipId','family','sourceType','sourceId'])assert.equal(action[k],outcome[k]);
}
export async function qualifyOpportunitySemantics(call:QualificationCall){
 const owner='brain-qual-owner-a',feedbackPath='/v2/concierge/opportunity-feedback',followPath='/v2/concierge/opportunity-follow-through';
 const workspace=()=>call('/v2/concierge',owner),post=(path:string,body:any)=>call(path,owner,{method:'POST',body:JSON.stringify(body)});
 // Materialize retained history before taking the mutation baseline.
 await workspace();
 const initial=await workspace(),original=presented(initial),candidates=initial.recommendations.map((r:any)=>r.id);
 assert.ok(candidates.length>3,'fourth eligible source candidate absent');assert.equal(new Set(candidates).size,candidates.length);assert.equal(original.length,3);assert.deepEqual(original,[...candidates.slice(0,3)].sort());
 const fourth=candidates[3];assert.ok(fourth);const target=initial.opportunities.find((o:any)=>o.id===original[0]);assert.ok(target?.timing.temporal.occurrenceCycleId);
 const identity={recipientId:target.recipient.id,opportunityId:target.id,occurrenceCycleId:target.timing.temporal.occurrenceCycleId};
 const baseline=opportunitySemantics(initial),feedbackBefore=(await call(feedbackPath,owner)).history;
 const preference=(await post(feedbackPath,{...identity,type:'do_not_remind',scope:'occurrence',expectedVersion:0,idempotencyKey:'brain-qual-feedback-suppress-v2'})).feedback;
 assert.equal(preference.type,'do_not_remind');assert.equal(preference.scope,'occurrence');assert.equal(preference.provenance,'explicit_owner_feedback');assert.equal(preference.version,1);assert.equal(preference.active,true);
 const suppressed=await workspace();assertOriginalSlots(original,suppressed,target.id);const restrained=suppressed.opportunities.find((o:any)=>o.id===target.id);assert.equal(restrained.recommendation,null);assert.equal(restrained.restraint.restrained,true);assert.equal(suppressed.opportunities.find((o:any)=>o.id===fourth).presentation.recommendationEligible,false);
 for(const o of suppressed.opportunities){const previous=initial.opportunities.find((p:any)=>p.id===o.id);assert.deepEqual(o.timing,previous.timing);assert.deepEqual(o.provenance,previous.provenance);if(o.id!==target.id){assert.deepEqual(o.restraint,previous.restraint);assert.deepEqual(o.recommendation,previous.recommendation);}}
 const historySet=(await call(feedbackPath,owner)).history;assertAppendOnly(feedbackBefore,historySet,preference);
 const withdrawal=(await post(feedbackPath,{recipientId:identity.recipientId,feedbackEventId:preference.id,withdraw:true,expectedVersion:preference.version,idempotencyKey:'brain-qual-feedback-withdraw-v2'})).feedback;
 assert.equal(withdrawal.lineageId,preference.lineageId);assert.equal(withdrawal.version,2);assert.equal(withdrawal.withdrawnEventId,preference.id);assert.equal(withdrawal.supersedesId,preference.id);assert.equal(withdrawal.active,false);
 const restored=await workspace();assertOriginalSlots(original,restored,null);assert.deepEqual(opportunitySemantics(restored),baseline);const historyWithdraw=(await call(feedbackPath,owner)).history;assertAppendOnly(historySet,historyWithdraw,withdrawal);
 const followBefore=(await call(followPath,owner)).history;
 const action=(await post(followPath,{...identity,dimension:'action',value:'user_reported_completed',expectedVersion:0,idempotencyKey:'brain-qual-follow-action-v2'})).followThrough;
 const completed=await workspace();assertOriginalSlots(original,completed,target.id);assert.equal(completed.opportunities.find((o:any)=>o.id===target.id).recommendation,null);
 const outcome=(await post(followPath,{recipientId:identity.recipientId,followThroughEventId:action.id,dimension:'outcome',value:'went_well',expectedVersion:0,idempotencyKey:'brain-qual-follow-outcome-v2'})).followThrough;assertSeparateReports(action,outcome);
 const withOutcome=await call(followPath,owner);assert.deepEqual(withOutcome.current.find((e:any)=>e.id===action.id),action);assert.deepEqual(withOutcome.current.find((e:any)=>e.id===outcome.id),outcome);assertAppendOnly(followBefore,withOutcome.history.filter((e:any)=>e.id!==outcome.id),action);
 const actionWithdrawal=(await post(followPath,{recipientId:identity.recipientId,followThroughEventId:action.id,withdraw:true,expectedVersion:action.version,idempotencyKey:'brain-qual-follow-withdraw-v2'})).followThrough;
 assert.equal(actionWithdrawal.dimension,'action');assert.equal(actionWithdrawal.lineageId,action.lineageId);assert.equal(actionWithdrawal.version,2);assert.equal(actionWithdrawal.active,false);assert.equal(actionWithdrawal.withdrawnEventId,action.id);assert.equal(actionWithdrawal.supersedesId,action.id);
 const finalReports=await call(followPath,owner);assertAppendOnly(withOutcome.history,finalReports.history,actionWithdrawal);assert.ok(!finalReports.current.some((e:any)=>e.lineageId===action.lineageId));assert.deepEqual(finalReports.current.find((e:any)=>e.id===outcome.id),outcome);
 const finalWorkspace=await workspace();assertOriginalSlots(original,finalWorkspace,null);assert.deepEqual(opportunitySemantics(finalWorkspace),baseline);
 return {identity,coverage:{version:1,originalSlots:original,orderedCandidates:candidates,fourthCandidate:fourth,suppressedSlots:presented(suppressed),restoredSlots:presented(restored),baseline,afterSuppression:opportunitySemantics(suppressed),afterRestoration:opportunitySemantics(restored),feedback:{preference,withdrawal,history:historyWithdraw},followThrough:{action,outcome,actionWithdrawal,history:finalReports.history,current:finalReports.current},decayTransitionsQualified:false}};
}
