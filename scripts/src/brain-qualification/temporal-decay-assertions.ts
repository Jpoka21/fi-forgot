import assert from 'node:assert/strict';
/** Explicit synthetic clock parameters exercise the public retained-occurrence evaluator.
 * Only the injected real repository writes inside a transaction that must roll back. */
export async function qualifyRollbackDecay(db:any,makeRepository:(db:any)=>any,evaluate:(input:any)=>any,ownerId:string,opportunity:any){
 const source=opportunity.timing.temporal;assert.equal(source.family,'annual_recurring');assert.equal(source.support,'supported');assert.ok(source.occurrenceCycleId&&source.effectiveDate);assert.equal(opportunity.timing.observedAt,null);
 const scope={userId:ownerId,opportunityId:opportunity.id},outside=makeRepository(db),before=await outside.loadHistory(scope);assert.ok(before.length);
 const shifted=(offset:number)=>{const d=new Date(source.effectiveDate+'T00:00:00.000Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString();};
 const rollback=Object.freeze({qualificationRollback:true});let rolledBack=false,observations:any[]=[];
 try{await db.transaction(async(tx:any)=>{
  const repo=makeRepository(tx);let previous=await repo.loadHistory(scope);
  // Synthetic evaluation dates predate/advance beyond the current run. Repository ordering
  // is by evaluatedAt, so compare each persisted set by identity, without discarding history.
  for(const [offset,state,decay] of [[-45,'premature','watch'],[-35,'approaching_relevance','watch'],[-7,'valid_now','none'],[1,'stale','diminished'],[31,'expired','exhausted']] as const){
   const evaluatedAt=shifted(offset),result=evaluate({family:'one_time',dateValue:source.evidence.dateValue,dateLabel:source.evidence.dateLabel,evaluatedAt,evidence:source.evidence,previousHistory:previous,fixedOccurrenceCycleId:source.occurrenceCycleId,fixedOccurrenceDate:source.effectiveDate});
   assert.equal(result.state,state);assert.equal(result.decay,decay);assert.equal(result.occurrenceCycleId,source.occurrenceCycleId);assert.equal(result.effectiveDate,source.effectiveDate);assert.deepEqual(result.evidence,source.evidence);assert.equal(result.recommendationEligible,state==='valid_now');if(state!=='valid_now')assert.ok(result.restraintReason);
   const change=result.history.at(-1);assert.equal(change.evaluatedAt,evaluatedAt);assert.equal(result.history.length,previous.length+1);
   await repo.appendChange({...scope,change,evidence:result.evidence,opportunity:{...opportunity,timing:{...opportunity.timing,temporal:result}}});
   const read=await repo.loadHistory(scope),sort=(rows:any[])=>[...rows].sort((a,b)=>a.changeId.localeCompare(b.changeId));assert.deepEqual(sort(read),sort(result.history),'real repository reload lost/changed temporal history');
   observations.push({evaluatedAt,offsetDays:offset,temporal:result,persistedHistory:read});previous=result.history;
  }
  throw rollback;
 });throw Error('FAIL_CLOSED: decay transaction unexpectedly committed');}catch(error){if(error!==rollback)throw error;rolledBack=true;}
 const after=await makeRepository(db).loadHistory(scope);assert.deepEqual(after,before,'rollback changed committed temporal history');assert.equal(rolledBack,true);
 return {kind:'BRAIN-QUALIFICATION-ROLLBACK-DECAY',scope:'real-postgresql-transaction-rolled-back',evaluationClock:'explicit-synthetic-evaluatedAt',family:'one_time',occurrenceSemantics:'retained-existing-occurrence',ownerId,opportunityId:opportunity.id,occurrenceCycleId:source.occurrenceCycleId,effectiveDate:source.effectiveDate,sourceEvidence:source.evidence,sourceObservedAt:opportunity.timing.observedAt,observations,rolledBack,committedHistoryBefore:before,committedHistoryAfter:after,transitionHistoryCommittedAcrossRestart:false};
}
