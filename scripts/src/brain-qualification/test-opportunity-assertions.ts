import assert from 'node:assert/strict';
// @ts-ignore runtime extension
import {qualifyOpportunitySemantics,assertOriginalSlots,assertSeparateReports,opportunitySemantics,assertTemporalExamples} from './opportunity-assertions.ts';
// @ts-ignore runtime extension
import {assertPersistedSnapshot} from './lifecycle-assertions.ts';
const load=(path:string)=>import(new URL('../../../artifacts/api-server/src/'+path,import.meta.url).href);
const {UnderstandingPgFixture}=await load('__tests__/understanding-pg-fixture.ts');
const {createPgOpportunityFeedbackRepository,mutateOpportunityFeedbackService,listOpportunityFeedbackService}=await load('brain/feedback/index.ts');
const {createPgOpportunityFollowThroughRepository,mutateOpportunityFollowThroughService,listOpportunityFollowThroughService}=await load('brain/follow-through/index.ts');
const {createPgOpportunityTemporalHistoryRepository}=await load('brain/temporal/index.ts');
const {buildConciergeWorkspace}=await load('brain/product/buildConciergeWorkspace.ts');
const schema=await import(new URL('../../../lib/db/src/schema/index.ts',import.meta.url).href);
// Model JSONB key normalization before the real Drizzle adapter decodes rows.
const jsonbOrder=(value:any):any=>Array.isArray(value)?value.map(jsonbOrder):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,jsonbOrder(value[k])])):value;
class JsonbPgFixture extends UnderstandingPgFixture {
 async query(config:any,parameters:any[]=[]){
  for(const rows of Object.values(this.tables) as any[][])for(const row of rows)if(row.evidence!=null)row.evidence=typeof row.evidence==='string'?JSON.stringify(jsonbOrder(JSON.parse(row.evidence))):jsonbOrder(row.evidence);
  return super.query(config,parameters);
 }
}
const fixture=new JsonbPgFixture();
const feedback=createPgOpportunityFeedbackRepository(async()=>({db:fixture.db,...schema})),follow=createPgOpportunityFollowThroughRepository(async()=>({db:fixture.db,...schema})),temporal=createPgOpportunityTemporalHistoryRepository(async()=>({db:fixture.db,...schema}));
const recipients=Array.from({length:5},(_,i)=>({recipientId:'brain-qual-a-r'+(i+1),recipientName:'Synthetic '+i}));
const brain=(id:string)=>({loadResult:{loadedAt:'2026-09-12T00:00:00.000Z',relationshipContext:{}},extraction:{availableSignals:id.endsWith('5')?[]:[{source:'event_timing',label:'birthday',value:'09-19'}]},decideResult:{decision:{outcome:id.endsWith('5')?'wait':'prepare_card'},confidence:60},actionPlan:{type:id.endsWith('5')?'wait':'prepare_card',category:'event',priority:'high',sourceRuleId:id.endsWith('5')?'wait':'birthday',primaryReason:'synthetic',reasons:[],confidence:60,debugNotes:[]},selectedFollowUpQuestion:null});
const build=()=>buildConciergeWorkspace({userId:'brain-qual-owner-a',recipients,generatedAt:'2026-09-12T00:00:00.000Z',runBrain:async(id:string)=>brain(id),feedbackRepository:feedback,followThroughRepository:follow,temporalHistoryRepository:temporal});
const deps=(repository:any)=>({repository,ownsRecipient:async()=>true,listOwnedRecipientIds:async()=>recipients.map(r=>r.recipientId),resolveOpportunity:async(_o:string,_r:string,id:string)=>(await build()).opportunities.find((o:any)=>o.id===id)});
const call=async(path:string,owner:string,init?:RequestInit)=>{if(path==='/v2/concierge')return build();const isFeedback=path.endsWith('opportunity-feedback'),d=deps(isFeedback?feedback:follow);const result=init?await(isFeedback?mutateOpportunityFeedbackService:mutateOpportunityFollowThroughService)(owner,JSON.parse(String(init.body)),d):await(isFeedback?listOpportunityFeedbackService:listOpportunityFollowThroughService)(owner,null,d);if(result.status>=400)throw Error(path+' returned '+result.status);return result.body;};
const result=await qualifyOpportunitySemantics(call);assert.equal(result.coverage.suppressedSlots.length,2);assert.equal(result.coverage.restoredSlots.length,3);
const semantics=opportunitySemantics(await build());assertTemporalExamples(semantics,'brain-qual-a-r5');
const corrupt=structuredClone(await build());corrupt.opportunities.find((o:any)=>o.id===result.coverage.fourthCandidate).presentation.recommendationEligible=true;assert.throws(()=>assertOriginalSlots(result.coverage.originalSlots,corrupt,null));
assert.throws(()=>assertSeparateReports(result.coverage.followThrough.action,{...result.coverage.followThrough.outcome,lineageId:result.coverage.followThrough.action.lineageId}));assert.throws(()=>assertSeparateReports({...result.coverage.followThrough.action,verification:'externally_verified'},result.coverage.followThrough.outcome));
for(const field of ['state','decay','occurrenceCycleId','effectiveDate','history','evidence']){const changed=structuredClone(semantics);changed[0].timing.temporal[field]='corrupt';assert.throws(()=>assertPersistedSnapshot({opportunities:semantics},{opportunities:changed}));}
const unknown=structuredClone(semantics);unknown.find((o:any)=>o.recipientId==='brain-qual-a-r5').recommendation={};assert.throws(()=>assertTemporalExamples(unknown,'brain-qual-a-r5'));
console.log('Opportunity semantic qualification harness PASS: production services/Drizzle adapters with fake PG protocol; no live DB');
// @ts-ignore runtime extension
import {qualifyRollbackDecay} from './temporal-decay-assertions.ts';
const {evaluateOpportunityTemporal}=await load('brain/temporal/index.ts');
const makeTemporal=(db:any)=>createPgOpportunityTemporalHistoryRepository(async()=>({db,opportunityTemporalHistoryTable:schema.opportunityTemporalHistoryTable}));
const actual=(await build()).opportunities.find((o:any)=>o.timing.temporal.family==='annual_recurring');
const priorTables=structuredClone(fixture.tables);
const decay=await qualifyRollbackDecay(fixture.db,makeTemporal,evaluateOpportunityTemporal,'brain-qual-owner-a',actual);
assert.deepEqual(fixture.tables,priorTables);assert.deepEqual(decay.observations.map((o:any)=>o.temporal.decay),['watch','watch','none','diminished','exhausted']);assert.equal(decay.rolledBack,true);assert.equal(decay.transitionHistoryCommittedAcrossRestart,false);
await assert.rejects(()=>qualifyRollbackDecay(fixture.db,makeTemporal,(i:any)=>({...evaluateOpportunityTemporal(i),decay:'none'}),'brain-qual-owner-a',actual));assert.deepEqual(fixture.tables,priorTables);
await assert.rejects(()=>qualifyRollbackDecay({...fixture.db,transaction:async()=>undefined},()=>makeTemporal(fixture.db),evaluateOpportunityTemporal,'brain-qual-owner-a',actual),/unexpectedly committed/);
console.log('Rollback-only retained occurrence decay harness PASS with real evaluator/Drizzle adapter and fake PG; live transitions unqualified until execution');
export const semanticTestFixture={coverage:{...result.coverage,decay,decayTransitionsQualified:true},decay,semantics,recipients};
const bundled=await import(new URL('./temporal-runtime.mjs',import.meta.url).href);
assert.throws(()=>bundled.createPgOpportunityTemporalHistoryRepository(),/explicit qualification database injection/);
for(const observed of decay.observations){const input={family:'one_time',dateValue:decay.sourceEvidence.dateValue,dateLabel:decay.sourceEvidence.dateLabel,evaluatedAt:observed.evaluatedAt,evidence:decay.sourceEvidence,fixedOccurrenceCycleId:decay.occurrenceCycleId,fixedOccurrenceDate:decay.effectiveDate};assert.deepEqual(bundled.evaluateOpportunityTemporal(input),evaluateOpportunityTemporal(input));}
console.log('Generated temporal runtime evaluator equivalence and explicit injection guard PASS');
