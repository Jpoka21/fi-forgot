import { createPgOpportunityFeedbackRepository, feedbackLineageId, listOpportunityFeedbackService, mutateOpportunityFeedbackService, OpportunityFeedbackConflictError, type OpportunityFeedbackEvent } from "../brain/feedback/index.js";
import { buildConciergeWorkspace } from "../brain/product/buildConciergeWorkspace.js";

import { UnderstandingPgFixture } from './understanding-pg-fixture.js';
import { opportunityFeedbackTable, opportunityFeedbackReceiptTable } from '@workspace/db/schema';

/** Actual Drizzle SQL/row conversion and adapter, backed by a controlled protocol fixture.
 * Transactions are serialized here; live PostgreSQL concurrency remains unqualified. */
class FeedbackPgFixture extends UnderstandingPgFixture {
  override async query(config: string | {text: string; rowMode?: string}, parameters: unknown[] = []) {
    const result = await super.query(config, parameters);
    for (const row of this.tables.opportunity_feedback_receipts ?? []) {
      if (typeof row.response === 'string') row.response = JSON.parse(row.response);
    }
    for (const [table, keys] of [
      ['opportunity_feedback_events', ['lineage_id', 'version']],
      ['opportunity_feedback_receipts', ['owner_id', 'idempotency_key']],
    ] as const) {
      const seen = new Set<string>();
      for (const row of this.tables[table] ?? []) {
        const key = JSON.stringify(keys.map(field => row[field]));
        if (seen.has(key)) throw Object.assign(new Error('unique constraint'), {code: '23505'});
        seen.add(key);
      }
    }
    return result;
  }
}
const fixture = new FeedbackPgFixture();
const db = fixture.db;
const originalTransaction = db.transaction.bind(db);
let queue: Promise<unknown> = Promise.resolve();
db.transaction = ((...args: Parameters<typeof originalTransaction>) => {
  const operation = queue.then(() => originalTransaction(...args));
  queue = operation.catch(() => undefined);
  return operation;
}) as typeof db.transaction;
const repository = createPgOpportunityFeedbackRepository(async () => ({db, opportunityFeedbackTable, opportunityFeedbackReceiptTable}) as never);
const eventCount = () => (fixture.tables.opportunity_feedback_events ?? []).length;
const target = { ownerId: "owner", recipientId: "recipient", opportunityId: "recipient:birthday", occurrenceCycleId: "cycle", relationshipId: "relationship", family: "birthday" };
const base: OpportunityFeedbackEvent = { ...target, id: "event-1", lineageId: feedbackLineageId(target, "occurrence"), version: 1, action: "set", type: "do_not_remind", scope: "occurrence", notBefore: null, timingProvenance: "qualitative", provenance: "explicit_owner_feedback", receivedAt: "2026-01-01T00:00:00.000Z", supersedesId: null, withdrawnEventId: null, idempotencyKey: "request-one", active: true };
await repository.append({ event: base, expectedVersion: 0, requestFingerprint: "same" });
const replay = await repository.append({ event: base, expectedVersion: 0, requestFingerprint: "same" });
if (replay.id !== base.id || eventCount() !== 1) throw new Error("retry appended or changed response");
let mismatch = false; try { await repository.append({ event: base, expectedVersion: 0, requestFingerprint: "different" }); } catch (error) { mismatch = error instanceof OpportunityFeedbackConflictError; }
if (!mismatch) throw new Error("changed payload reused an idempotency key");
await repository.append({ event: { ...base, id: "event-2", version: 1, idempotencyKey: "request-two", supersedesId: base.id }, expectedVersion: 0, requestFingerprint: "equal-new-key" });
if (eventCount() !== 1) throw new Error("equal semantic repeat appended a version");
let stale = false; try { await repository.append({ event: { ...base, id: "event-3", type: "less_often", idempotencyKey: "request-three" }, expectedVersion: 0, requestFingerprint: "stale" }); } catch (error) { stale = error instanceof OpportunityFeedbackConflictError; }
if (!stale) throw new Error("stale mutation did not conflict");
if ((await repository.list({ ownerId: "other", recipientIds: ["recipient"] })).length || (await repository.list({ ownerId: "owner", recipientIds: ["other"] })).length) throw new Error("adapter leaked owner or recipient rows");
const ownedRead = await listOpportunityFeedbackService("owner", "recipient", { repository, listOwnedRecipientIds: async (owner, recipient) => owner === "owner" && recipient === "recipient" ? ["recipient"] : [] });
if (ownedRead.status !== 200 || !(ownedRead.body.history as unknown[]).length) throw new Error("owned history handler did not return durable feedback");
if ((await listOpportunityFeedbackService("other", "recipient", { repository, listOwnedRecipientIds: async () => [] })).status !== 404) throw new Error("history handler leaked cross-owner recipient");
if ((await listOpportunityFeedbackService("owner", null, { repository, listOwnedRecipientIds: async () => { throw new Error("down"); } })).status !== 503) throw new Error("history handler read failure did not stay unavailable");

const opportunity = { id: target.opportunityId, relationshipId: "relationship", recipient: { id: "recipient", name: "R" }, provenance: { sourceId: "birthday" }, timing: { temporal: { occurrenceCycleId: "cycle" } } } as any;
const deps = { repository, ownsRecipient: async (owner: string, recipient: string) => owner === "owner" && recipient === "recipient", resolveOpportunity: async () => opportunity, now: () => "2026-01-01T00:00:00.000Z" };
for (const hostile of [null, [], { ...base, evidence: {} }, { recipientId: "recipient", opportunityId: target.opportunityId, type: "not_now", expectedVersion: 0, idempotencyKey: "abcdefgh" }, { recipientId: "recipient", opportunityId: target.opportunityId, occurrenceCycleId: "cycle", type: "not_now", notBefore: "2026-02-31", expectedVersion: 0, idempotencyKey: "abcdefgh" }]) if ((await mutateOpportunityFeedbackService("owner", hostile, deps)).status !== 400) throw new Error("hostile payload accepted");
if ((await mutateOpportunityFeedbackService("other", { recipientId: "recipient", opportunityId: target.opportunityId, occurrenceCycleId: "cycle", type: "helpful", expectedVersion: 0, idempotencyKey: "abcdefgh" }, deps)).status !== 404) throw new Error("cross-owner mutation accepted");
const historicalRepo = repository;
const withdrawn = await mutateOpportunityFeedbackService("owner", { recipientId: "recipient", feedbackEventId: base.id, expectedVersion: 1, idempotencyKey: "withdraw-one", withdraw: true }, { ...deps, repository: historicalRepo, resolveOpportunity: async () => null });
if (withdrawn.status !== 201) throw new Error("disappeared Opportunity could not be withdrawn");
const failed = await mutateOpportunityFeedbackService("owner", { recipientId: "recipient", opportunityId: target.opportunityId, occurrenceCycleId: "cycle", type: "helpful", expectedVersion: 0, idempotencyKey: "failure-1" }, { ...deps, repository: { list: async () => { throw new Error("down"); }, append: async () => { throw new Error("down"); } } });
if (failed.status !== 503) throw new Error("read failure did not stay unavailable");
const writeFailed = await mutateOpportunityFeedbackService("owner", { recipientId: "recipient", opportunityId: target.opportunityId, occurrenceCycleId: "cycle", type: "helpful", expectedVersion: 0, idempotencyKey: "failure-2" }, { ...deps, repository: { list: async () => [], append: async () => { throw new Error("down"); } } });
if (writeFailed.status !== 503) throw new Error("write failure did not stay unavailable");

// The production workspace reloads the actual feedback adapter on every request.
const { OPPORTUNITY_FEEDBACK_TYPES } = await import('../brain/feedback/index.js');
const brainExecution = {
  loadResult: {brainContextVersion: 1, relationshipId: 'live-r', userId: 'owner', loadedAt: '2026-01-01T00:00:00.000Z', relationshipContext: {}},
  extraction: {availableSignals: [{source: 'event_timing', label: 'birthday', value: '01-20'}], contributorGroups: []},
  decideResult: {decision: {outcome: 'prepare_card'}, confidence: 60, reasons: [], debugNotes: []},
  actionPlan: {type: 'prepare_card', category: 'event', priority: 'high', sourceRuleId: 'birthday', primaryReason: 'fixture', reasons: [], confidence: 60, debugNotes: []},
  selectedFollowUpQuestion: null, normalized: {}, decisionContext: {}, ruleEvaluation: {},
};
const unchangedBrain = JSON.stringify(brainExecution);
const build = (day = '2026-01-01') => buildConciergeWorkspace({userId: 'owner', recipients: [{recipientId: 'live-r', recipientName: 'Live R'}], generatedAt: day+'T00:00:00.000Z', runBrain: async () => brainExecution as never, feedbackRepository: repository,
  temporalHistoryRepository: {listRetained: async () => [], loadHistory: async () => [], appendChange: async () => undefined}});
const initialWorkspace = await build();
const initialOpportunity = initialWorkspace.opportunities[0]!;
if (!initialOpportunity.recommendation) throw Error('Expected eligible source-backed baseline');
const immutableFields = (o: typeof initialOpportunity) => JSON.stringify({provenance:o.provenance, confidence:o.confidence, timing:o.timing, relationshipId:o.relationshipId});
const baselineFields = immutableFields(initialOpportunity);
const liveDeps = {repository, ownsRecipient: async (owner: string, recipient: string) => owner === 'owner' && recipient === 'live-r', resolveOpportunity: async (_owner: string, _recipient: string, id: string) => id === initialOpportunity.id ? initialOpportunity : null};
let version = 0;
for (const type of OPPORTUNITY_FEEDBACK_TYPES) {
  const result = await mutateOpportunityFeedbackService('owner', {recipientId:'live-r', opportunityId:initialOpportunity.id, occurrenceCycleId:initialOpportunity.timing.temporal!.occurrenceCycleId, type, expectedVersion:version, idempotencyKey:'live-'+type}, liveDeps);
  if (result.status !== 201) throw Error('Feedback service rejected '+type);
  version = (result.body.feedback as OpportunityFeedbackEvent).version;
  const after = await build();
  const current = after.opportunities[0]!;
  if (immutableFields(current) !== baselineFields || JSON.stringify(brainExecution) !== unchangedBrain) throw Error('Feedback rewrote relationship/temporal evidence or confidence');
  const shouldShow = type === 'helpful' || type === 'more_often';
  if (Boolean(current.recommendation) !== shouldShow || Boolean(current.presentation.recommendationEligible) !== shouldShow || after.recommendations.length !== (shouldShow ? 1 : 0)) throw Error('Incorrect eligibility for '+type);
  if (!shouldShow && (!current.restraint.restrained || after.insights.length)) throw Error('Suppression escaped into an insight');
}
const countBeforePassive = eventCount();
await build(); await build();
if (eventCount() !== countBeforePassive) throw Error('Read/presentation behavior created durable preferences');
const deferred = await mutateOpportunityFeedbackService('owner', {recipientId:'live-r', opportunityId:initialOpportunity.id, occurrenceCycleId:initialOpportunity.timing.temporal!.occurrenceCycleId, type:'not_now', notBefore:'2026-01-10', expectedVersion:version, idempotencyKey:'live-explicit-date'}, liveDeps);
if (deferred.status !== 201 || (deferred.body.feedback as OpportunityFeedbackEvent).timingProvenance !== 'user_not_before') throw Error('User timing provenance lost');
version = (deferred.body.feedback as OpportunityFeedbackEvent).version;
if ((await build('2026-01-09')).recommendations.length || !(await build('2026-01-10')).recommendations.length) throw Error('Explicit not-before activation failed');
const history = await repository.list({ownerId:'owner', recipientIds:['live-r']});
const removed = await mutateOpportunityFeedbackService('owner', {recipientId:'live-r', feedbackEventId:(deferred.body.feedback as OpportunityFeedbackEvent).id, expectedVersion:version, idempotencyKey:'live-withdraw-date', withdraw:true}, {...liveDeps, resolveOpportunity:async()=>null});
if (removed.status !== 201 || !(await build()).recommendations.length) throw Error('Historical withdrawal failed to restore allowed presentation');
const removedAgain = await mutateOpportunityFeedbackService('owner', {recipientId:'live-r', feedbackEventId:(deferred.body.feedback as OpportunityFeedbackEvent).id, expectedVersion:version, idempotencyKey:'live-withdraw-date', withdraw:true}, {...liveDeps, resolveOpportunity:async()=>null});
if (removedAgain.status !== 201 || (removedAgain.body.feedback as OpportunityFeedbackEvent).id !== (removed.body.feedback as OpportunityFeedbackEvent).id) throw Error('Withdrawal retry was not idempotent');
const afterHistory = await repository.list({ownerId:'owner', recipientIds:['live-r']});
if (afterHistory.length !== history.length+1 || JSON.stringify(afterHistory.slice(0,-1)) !== JSON.stringify(history)) throw Error('Historical versions were rewritten');
const failClosed = await buildConciergeWorkspace({userId:'owner', recipients:[{recipientId:'live-r',recipientName:'Live R'}], generatedAt:'2026-01-01T00:00:00.000Z', runBrain:async()=>brainExecution as never, temporalHistoryRepository:{listRetained:async()=>[],loadHistory:async()=>[],appendChange:async()=>undefined}, feedbackRepository:{list:async()=>{throw Error('read unavailable')},append:async()=>{throw Error('write unavailable')}}});
if (!failClosed.opportunities.length || failClosed.recommendations.length || failClosed.insights.length || failClosed.opportunities[0]!.recommendation) throw Error('Unavailable preferences failed open');
if ((await build('2026-12-01')).recommendations.length) throw Error('Preferences bypassed premature annual timing');
// Two requests racing at one expected version cannot both advance the lineage.
const raceVersion = (removed.body.feedback as OpportunityFeedbackEvent).version;
const race = await Promise.all(['helpful','less_often'].map(type => mutateOpportunityFeedbackService('owner',{recipientId:'live-r',opportunityId:initialOpportunity.id,occurrenceCycleId:initialOpportunity.timing.temporal!.occurrenceCycleId,type,expectedVersion:raceVersion,idempotencyKey:'concurrent-'+type}, liveDeps)));
if (race.filter(r=>r.status===201).length!==1 || race.filter(r=>r.status===409).length!==1) throw Error('Concurrent mutation winner/conflict was not deterministic');
if (!fixture.queries.some(q=>q.text.includes('"owner_id"') && q.text.includes('"recipient_id"') && q.text.includes('where'))) throw Error('Actual scoped SQL was not exercised');
console.log('Production feedback reload, all nine effects, temporal/evidence invariants, passive abstention, historical withdrawal, failure restraint, and concurrent CAS passed.');

const historicalReplay = await mutateOpportunityFeedbackService('owner',{recipientId:'live-r',opportunityId:initialOpportunity.id,occurrenceCycleId:initialOpportunity.timing.temporal!.occurrenceCycleId,type:'helpful',expectedVersion:0,idempotencyKey:'live-helpful'},{...liveDeps,resolveOpportunity:async()=>null});
if(historicalReplay.status!==201 || (historicalReplay.body.feedback as OpportunityFeedbackEvent).version!==1)throw Error('Completed request stopped replaying after Opportunity disappeared');
const ownershipFailure=await mutateOpportunityFeedbackService('owner',{recipientId:'live-r',opportunityId:initialOpportunity.id,occurrenceCycleId:initialOpportunity.timing.temporal!.occurrenceCycleId,type:'helpful',expectedVersion:0,idempotencyKey:'owner-read-failure'},{...liveDeps,ownsRecipient:async()=>{throw Error('ownership storage unavailable')}});
if(ownershipFailure.status!==503)throw Error('Ownership read failure did not report unavailable');
const latestLive=(await repository.list({ownerId:'owner',recipientIds:['live-r']})).sort((a,b)=>b.version-a.version)[0]!;
const beforeFailedWrite=JSON.stringify(fixture.tables);
fixture.failOn=/insert into "opportunity_feedback_events"/;
const writeFailure=await mutateOpportunityFeedbackService('owner',{recipientId:'live-r',opportunityId:initialOpportunity.id,occurrenceCycleId:initialOpportunity.timing.temporal!.occurrenceCycleId,type:'already_handled',expectedVersion:latestLive.version,idempotencyKey:'actual-write-failure'},liveDeps);
if(writeFailure.status!==503 || JSON.stringify(fixture.tables)!==beforeFailedWrite)throw Error('Failed transaction changed persisted feedback or reported success');
let wrappedConflict=false;
try {await repository.append({event:{...latestLive,id:'deliberate-constraint-collision',type:'too_late',idempotencyKey:'wrapped-unique-key'},expectedVersion:latestLive.version,requestFingerprint:'wrapped-unique'});}catch(error){wrappedConflict=error instanceof OpportunityFeedbackConflictError;}
if(!wrappedConflict || JSON.stringify(fixture.tables)!==beforeFailedWrite)throw Error('Drizzle-wrapped constraint failure was not a rolled-back conflict');
console.log('Completed requests replay after source loss; actual driver failures roll back and wrapped unique violations retain conflict semantics.');

const familyResult=await mutateOpportunityFeedbackService('owner',{recipientId:'live-r',opportunityId:initialOpportunity.id,occurrenceCycleId:initialOpportunity.timing.temporal!.occurrenceCycleId,type:'do_not_remind',scope:'recipient_family',expectedVersion:0,idempotencyKey:'explicit-family-suppression'},liveDeps);
if(familyResult.status!==201 || (familyResult.body.feedback as OpportunityFeedbackEvent).relationshipId!==null)throw Error('Explicit recipient scope required or fabricated relationship identity');
if((await build('2027-01-01')).recommendations.length)throw Error('Explicit recipient/family preference did not survive the next occurrence');
const otherFamilyExecution=structuredClone(brainExecution);
otherFamilyExecution.actionPlan.sourceRuleId='anniversary';
otherFamilyExecution.extraction.availableSignals=[{source:'event_timing',label:'anniversary',value:'01-20'}];
const alternative=await buildConciergeWorkspace({userId:'owner',recipients:[{recipientId:'live-r',recipientName:'Live R'}],generatedAt:'2027-01-01T00:00:00.000Z',runBrain:async()=>otherFamilyExecution as never,feedbackRepository:repository,temporalHistoryRepository:{listRetained:async()=>[],loadHistory:async()=>[],appendChange:async()=>undefined}});
if(alternative.recommendations.length!==1)throw Error('Birthday preference generalized to anniversary');
const otherPerson=await buildConciergeWorkspace({userId:'owner',recipients:[{recipientId:'other-person',recipientName:'Other'}],generatedAt:'2027-01-01T00:00:00.000Z',runBrain:async()=>brainExecution as never,feedbackRepository:repository,temporalHistoryRepository:{listRetained:async()=>[],loadHistory:async()=>[],appendChange:async()=>undefined}});
if(otherPerson.recommendations.length!==1)throw Error('Recipient preference generalized to another person');
console.log('Explicit recipient/family scope preserves unknown relationship identity and isolates future birthday occurrences from anniversaries and other people.');

const capRecipients=Array.from({length:5},(_,i)=>({recipientId:'feedback-cap-'+i,recipientName:'Cap '+i}));
const capBuild=()=>buildConciergeWorkspace({userId:'owner',recipients:capRecipients,generatedAt:'2026-01-01T00:00:00.000Z',runBrain:async()=>brainExecution as never,feedbackRepository:repository,temporalHistoryRepository:{listRetained:async()=>[],loadHistory:async()=>[],appendChange:async()=>undefined}});
const capBaseline=await capBuild();
const presented=capBaseline.opportunities.filter(o=>o.presentation.recommendationEligible);
if(presented.length!==3)throw Error('Expected established maximum-three baseline');
for(const [i,o] of presented.entries()){
 const result=await mutateOpportunityFeedbackService('owner',{recipientId:o.recipient.id,opportunityId:o.id,occurrenceCycleId:o.timing.temporal!.occurrenceCycleId,type:'not_now',expectedVersion:0,idempotencyKey:'cap-restraint-'+i},{repository,ownsRecipient:async(owner,id)=>owner==='owner'&&capRecipients.some(r=>r.recipientId===id),resolveOpportunity:async(_owner,id,key)=>capBaseline.opportunities.find(item=>item.id===key&&item.recipient.id===id)??null});
 if(result.status!==201)throw Error('Cap fixture feedback was rejected');
}
const cappedAfter=await capBuild();
if(cappedAfter.opportunities.length!==5||cappedAfter.opportunities.some(o=>o.presentation.recommendationEligible))throw Error('Feedback erased Opportunities or backfilled restrained presentation slots');
console.log('Feedback retains five Opportunities while respecting three original presentation slots with no forced backfill.');

for(const type of ['already_handled','not_now','too_early','too_late','helpful','not_helpful']) {
 const invalidScope=await mutateOpportunityFeedbackService('owner',{recipientId:'live-r',opportunityId:initialOpportunity.id,occurrenceCycleId:initialOpportunity.timing.temporal!.occurrenceCycleId,type,scope:'recipient_family',expectedVersion:0,idempotencyKey:'invalid-broad-'+type},liveDeps);
 if(invalidScope.status!==400)throw Error(type+' improperly suppressed future occurrences');
}
console.log('Current-occurrence feedback cannot acquire family-wide authority.');
