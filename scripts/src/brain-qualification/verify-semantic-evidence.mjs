import assert from 'node:assert/strict';
const same=(a,b)=>assert.deepEqual(a,b);
const sorted=xs=>[...xs].sort();
const slots=xs=>sorted(xs.filter(x=>x.presentation.recommendationEligible).map(x=>x.id));
export function verifySemanticEvidence(durable,fixture){
 const c=durable.semanticCoverage;assert.equal(c?.version,1);
 assert.equal(c.originalSlots.length,3);assert.equal(new Set(c.originalSlots).size,3);
 assert.ok(c.orderedCandidates.length>3);assert.equal(new Set(c.orderedCandidates).size,c.orderedCandidates.length);
 same(sorted(c.originalSlots),sorted(c.orderedCandidates.slice(0,3)));assert.equal(c.fourthCandidate,c.orderedCandidates[3]);
 same(slots(c.baseline),sorted(c.originalSlots));same(slots(c.afterSuppression),sorted(c.suppressedSlots));same(slots(c.afterRestoration),sorted(c.originalSlots));same(c.baseline,c.afterRestoration);
 const {preference:p,withdrawal:w,history:fh}=c.feedback;
 assert.equal(p.type,'do_not_remind');assert.equal(p.scope,'occurrence');assert.equal(p.active,true);assert.equal(p.version,1);assert.equal(p.provenance,'explicit_owner_feedback');
 assert.equal(w.active,false);assert.equal(w.version,2);assert.equal(w.lineageId,p.lineageId);assert.equal(w.withdrawnEventId,p.id);assert.equal(w.supersedesId,p.id);
 for(const key of ['ownerId','recipientId','opportunityId','occurrenceCycleId'])same(w[key],p[key]);
 same(fh.find(e=>e.id===p.id),p);same(fh.find(e=>e.id===w.id),w);
 same(sorted(c.suppressedSlots),sorted(c.originalSlots.filter(id=>id!==p.opportunityId)));assert.equal(c.suppressedSlots.length,2);
 const suppressed=c.afterSuppression.find(o=>o.id===p.opportunityId);assert.equal(suppressed.restraint.restrained,true);assert.equal(suppressed.recommendation,null);
 assert.equal(c.afterSuppression.find(o=>o.id===c.fourthCandidate).presentation.recommendationEligible,false);
 same(sorted(c.afterSuppression.map(x=>x.id)),sorted(c.baseline.map(x=>x.id)));
 for(const o of c.afterSuppression){const b=c.baseline.find(x=>x.id===o.id);same(o.timing,b.timing);same(o.provenance,b.provenance);if(o.id!==p.opportunityId){same(o.restraint,b.restraint);same(o.recommendation,b.recommendation);}}
 const {action:a,outcome:o,actionWithdrawal:aw,history:th,current}=c.followThrough;
 for(const e of [a,o]){assert.ok(e.id&&e.lineageId);assert.equal(e.provenance,'explicit_owner_report');assert.equal(e.verification,'user_reported');assert.equal(e.active,true);assert.equal(e.version,1);assert.equal(e.action,'set');same(th.find(x=>x.id===e.id),e);}
 assert.equal(a.dimension,'action');assert.equal(a.value,'user_reported_completed');assert.equal(o.dimension,'outcome');assert.equal(o.value,'went_well');assert.notEqual(a.lineageId,o.lineageId);assert.notEqual(a.id,o.id);
 for(const key of ['ownerId','recipientId','opportunityId','occurrenceCycleId','relationshipId','family','sourceType','sourceId'])same(a[key],o[key]);
 for(const key of ['ownerId','recipientId','opportunityId','occurrenceCycleId'])same(a[key],p[key]);
 assert.equal(aw.dimension,'action');assert.equal(aw.lineageId,a.lineageId);assert.equal(aw.version,2);assert.equal(aw.active,false);assert.equal(aw.withdrawnEventId,a.id);assert.equal(aw.supersedesId,a.id);same(th.find(e=>e.id===aw.id),aw);
 for(const key of ['ownerId','recipientId','opportunityId','occurrenceCycleId'])same(aw[key],a[key]);
 assert.ok(!current.some(e=>e.lineageId===a.lineageId));same(current.find(e=>e.id===o.id),o);
 for(const owner of fixture.owners){const s=durable.snapshots.find(x=>x.owner===owner.id);assert.ok(s);assert.ok(s.opportunities.length);same(sorted(s.opportunities.map(x=>x.id)),sorted(s.opportunityIds));
  for(const x of s.opportunities){assert.ok(owner.recipientIds.includes(x.recipientId));assert.equal(x.timing.temporal.persistence,'available');assert.ok(x.timing.temporal.history.length);assert.ok(x.provenance);}
 }
 const first=durable.snapshots.find(x=>x.owner===p.ownerId);assert.ok(first);same(first.feedback.history,fh);same(first.followThrough.history,th);same(first.followThrough.current,current);same(first.opportunities,c.baseline);
 const unknown=first.opportunities.find(x=>x.recipientId===fixture.expected.restrainedRecipientId);assert.ok(unknown);assert.equal(unknown.timing.observedAt,null);assert.equal(unknown.timing.temporal.state,'unknown');assert.equal(unknown.timing.temporal.decay,'unknown');assert.equal(unknown.timing.temporal.occurrenceCycleId,null);assert.equal(unknown.timing.temporal.effectiveDate,null);assert.equal(unknown.restraint.restrained,true);assert.equal(unknown.recommendation,null);assert.equal(unknown.presentation.recommendationEligible,false);
 const d=c.decay;assert.equal(c.decayTransitionsQualified,true);assert.equal(d.kind,'BRAIN-QUALIFICATION-ROLLBACK-DECAY');assert.equal(d.scope,'real-postgresql-transaction-rolled-back');assert.equal(d.evaluationClock,'explicit-synthetic-evaluatedAt');assert.equal(d.family,'one_time');assert.equal(d.occurrenceSemantics,'retained-existing-occurrence');assert.equal(d.rolledBack,true);assert.equal(d.transitionHistoryCommittedAcrossRestart,false);assert.equal(d.sourceObservedAt,null);
 assert.equal(d.ownerId,p.ownerId);assert.equal(d.opportunityId,p.opportunityId);assert.equal(d.occurrenceCycleId,p.occurrenceCycleId);same(d.committedHistoryBefore,d.committedHistoryAfter);assert.ok(d.committedHistoryBefore.length);
 const source=first.opportunities.find(x=>x.id===d.opportunityId);same(d.sourceEvidence,source.timing.temporal.evidence);assert.equal(d.effectiveDate,source.timing.temporal.effectiveDate);
 assert.equal(d.occurrenceCycleId,source.timing.temporal.occurrenceCycleId);
 assert.equal(source.recipientId,p.recipientId);assert.equal(source.timing.observedAt,null);assert.equal(source.timing.temporal.family,'annual_recurring');assert.equal(source.timing.temporal.support,'supported');
 const historyById=xs=>[...xs].sort((a,b)=>a.changeId.localeCompare(b.changeId));same(historyById(d.committedHistoryBefore),historyById(source.timing.temporal.history));
 assert.equal(d.observations.length,5);let previous=d.committedHistoryBefore;
 for(const [i,[offset,state,decay]] of [[-45,'premature','watch'],[-35,'approaching_relevance','watch'],[-7,'valid_now','none'],[1,'stale','diminished'],[31,'expired','exhausted']].entries()){
  const r=d.observations[i],t=r.temporal,date=new Date(d.effectiveDate+'T00:00:00.000Z');date.setUTCDate(date.getUTCDate()+offset);assert.equal(r.offsetDays,offset);assert.equal(r.evaluatedAt,date.toISOString());assert.equal(t.state,state);assert.equal(t.decay,decay);assert.equal(t.occurrenceCycleId,d.occurrenceCycleId);assert.equal(t.effectiveDate,d.effectiveDate);same(t.evidence,d.sourceEvidence);assert.equal(t.recommendationEligible,state==='valid_now');if(state!=='valid_now')assert.ok(t.restraintReason);
  assert.equal(t.history.length,previous.length+1);same(t.history.slice(0,-1),previous);assert.equal(t.history.at(-1).evaluatedAt,r.evaluatedAt);
  assert.equal(t.family,'one_time');assert.equal(t.support,'supported');assert.equal(t.persistence,'available');
  const change=t.history.at(-1);for(const key of ['state','occurrenceCycleId','effectiveDate','family','evidence'])same(change[key],t[key]);assert.equal(change.reason,state==='valid_now'?'within_policy_preparation_window':`timing_${state}`);assert.ok(t.history.every(x=>typeof x.changeId==='string'&&x.changeId.length));assert.equal(new Set(t.history.map(x=>x.changeId)).size,t.history.length);
  const byId=xs=>[...xs].sort((a,b)=>a.changeId.localeCompare(b.changeId));same(byId(r.persistedHistory),byId(t.history));previous=t.history;
 }
 return {semanticQualification:true,syntheticDecayRollbackQualified:true,decayTransitionRestartPersistenceQualified:false};
}
