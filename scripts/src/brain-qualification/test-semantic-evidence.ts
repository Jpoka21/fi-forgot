import assert from 'node:assert/strict';
// @ts-ignore Native harness extension.
import {semanticTestFixture as f} from './test-opportunity-assertions.ts';
// @ts-ignore Native module.
import {verifySemanticEvidence} from './verify-semantic-evidence.mjs';
const owner='brain-qual-owner-a',ids=f.recipients.map((r:any)=>r.recipientId);
const fixture={owners:[{id:owner,recipientIds:ids}],expected:{restrainedRecipientId:'brain-qual-a-r5'}};
const durable={semanticCoverage:f.coverage,snapshots:[{owner,ids,opportunityIds:f.semantics.map((o:any)=>o.id),opportunities:f.semantics,feedback:{history:f.coverage.feedback.history},followThrough:{history:f.coverage.followThrough.history,current:f.coverage.followThrough.current}}]};
assert.equal(verifySemanticEvidence(durable,fixture).semanticQualification,true);
let negatives=0;
for(const mutate of [
 (d:any)=>delete d.semanticCoverage,
 (d:any)=>d.semanticCoverage.originalSlots.pop(),
 (d:any)=>d.semanticCoverage.orderedCandidates.reverse(),
 (d:any)=>d.semanticCoverage.fourthCandidate='invented',
 (d:any)=>d.semanticCoverage.suppressedSlots.push(d.semanticCoverage.fourthCandidate),
 (d:any)=>d.semanticCoverage.afterSuppression[0].timing.temporal.history=[],
 (d:any)=>d.semanticCoverage.feedback.withdrawal.withdrawnEventId='invented',
 (d:any)=>d.semanticCoverage.feedback.history.shift(),
 (d:any)=>d.semanticCoverage.followThrough.outcome.verification='externally_verified',
 (d:any)=>d.semanticCoverage.followThrough.outcome.lineageId=d.semanticCoverage.followThrough.action.lineageId,
 (d:any)=>d.semanticCoverage.followThrough.current=[],
 (d:any)=>d.snapshots[0].opportunities[0].timing.temporal.history=[],
 (d:any)=>d.snapshots[0].opportunities.find((o:any)=>o.recipientId==='brain-qual-a-r5').timing.observedAt='invented',
 (d:any)=>delete d.semanticCoverage.decay,
 (d:any)=>d.semanticCoverage.decayTransitionsQualified=false,
 (d:any)=>d.semanticCoverage.decay.rolledBack=false,
 (d:any)=>d.semanticCoverage.decay.transitionHistoryCommittedAcrossRestart=true,
 (d:any)=>d.semanticCoverage.decay.committedHistoryAfter=[],
 (d:any)=>d.semanticCoverage.decay.observations.pop(),
 (d:any)=>d.semanticCoverage.decay.observations[3].temporal.decay='none',
 (d:any)=>d.semanticCoverage.decay.observations[2].persistedHistory=[],
 (d:any)=>d.semanticCoverage.decay.observations[4].evaluatedAt='2020-01-01T00:00:00.000Z',
 (d:any)=>{const c=d.semanticCoverage;for(const e of [c.followThrough.action,c.followThrough.outcome,...c.followThrough.history,...c.followThrough.current,...d.snapshots[0].followThrough.history,...d.snapshots[0].followThrough.current])e.ownerId='foreign-owner';},
 (d:any)=>{d.semanticCoverage.decay.committedHistoryBefore[0].state='forged';d.semanticCoverage.decay.committedHistoryAfter[0].state='forged';},
 (d:any)=>{const r=d.semanticCoverage.decay.observations.at(-1);r.temporal.history.at(-1).state='valid_now';r.persistedHistory.find((x:any)=>x.changeId===r.temporal.history.at(-1).changeId).state='valid_now';},
 (d:any)=>{const c=d.semanticCoverage;c.afterSuppression.find((o:any)=>o.id!==c.feedback.preference.opportunityId).restraint={restrained:true};},
 (d:any)=>{const c=d.semanticCoverage,id=c.feedback.withdrawal.id;for(const e of [c.feedback.withdrawal,...c.feedback.history,...d.snapshots[0].feedback.history])if(e.id===id)e.ownerId='foreign';},
 (d:any)=>{const c=d.semanticCoverage,id=c.followThrough.actionWithdrawal.id;for(const e of [c.followThrough.actionWithdrawal,...c.followThrough.history,...d.snapshots[0].followThrough.history])if(e.id===id)e.recipientId='foreign';},
 (d:any)=>{const r=d.semanticCoverage.decay.observations.at(-1),id=r.temporal.history.at(-1).changeId;for(const e of [...r.temporal.history,...r.persistedHistory])if(e.changeId===id)e.reason='invented';},
]){const changed=JSON.parse(JSON.stringify(durable));mutate(changed);assert.throws(()=>verifySemanticEvidence(changed,fixture));negatives++;}
console.log(`PASS semantic evidence admission with ${negatives} missing/tampered/overclaim negatives; fake PG fixture only, no live evidence admitted`);
