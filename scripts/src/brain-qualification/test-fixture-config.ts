import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// @ts-ignore runtime TypeScript entry
import {qualificationProfiles,selectDatedQualificationOpportunity} from './fixture-config.ts';
const {minimalRelationshipContext}=await import(new URL('../../../artifacts/api-server/src/__tests__/fixtures/minimalRelationshipContext.ts',import.meta.url).href);
const {buildDelivery}=await import(new URL('../../../artifacts/api-server/src/services/recipient-context.ts',import.meta.url).href);
const {extractSignals}=await import(new URL('../../../artifacts/api-server/src/brain/signals/extractSignals.ts',import.meta.url).href);
const {normalizeSignals}=await import(new URL('../../../artifacts/api-server/src/brain/normalization/normalizeSignals.ts',import.meta.url).href);
const {buildDecisionContext}=await import(new URL('../../../artifacts/api-server/src/brain/decision/buildDecisionContext.ts',import.meta.url).href);
const {planFromDecisionContext}=await import(new URL('../../../artifacts/api-server/src/brain/planFromDecisionContext.ts',import.meta.url).href);
const {buildProductBrainDecision}=await import(new URL('../../../artifacts/api-server/src/brain/product/buildProductBrainDecision.ts',import.meta.url).href);
const {buildRelationshipOpportunity}=await import(new URL('../../../artifacts/api-server/src/brain/product/buildRelationshipOpportunity.ts',import.meta.url).href);
const fixture=JSON.parse(readFileSync(new URL('../../../docs/brain-qualification-preparation/synthetic-fixtures.json',import.meta.url),'utf8'));
const profiles=qualificationProfiles(fixture);
assert.deepEqual(profiles.map(p=>[p.id,p.recipientId,p.previewDays]),fixture.recipients.map((r:any)=>[r.id,r.id,14]));
assert.throws(()=>qualificationProfiles({...fixture,qualificationTiming:{previewDays:13}}));
assert.throws(()=>qualificationProfiles({...fixture,recipients:[fixture.recipients[0],fixture.recipients[0]]}));
function opportunity(profile:any,birthday:string|null='2026-09-19'){
 const context=minimalRelationshipContext({generatedAt:'2026-09-12T00:00:00.000Z',birthday});context.delivery=buildDelivery(profile);
 const loadResult={brainContextVersion:1 as const,relationshipId:context.recipientId,userId:context.userId,loadedAt:context.generatedAt,relationshipContext:context};
 const extraction=extractSignals(loadResult),normalized=normalizeSignals(extraction.availableSignals),decisionContext=buildDecisionContext(normalized,context,[]),planned=planFromDecisionContext(decisionContext);
 const execution={loadResult,extraction,normalized,decisionContext,...planned,selectedFollowUpQuestion:null};
 return buildRelationshipOpportunity(buildProductBrainDecision(context.recipientId,execution),execution,{recipientId:context.recipientId,recipientName:'Synthetic'},undefined,undefined,{evaluatedAt:context.generatedAt});
}
const absent=opportunity(null);assert.equal(absent.recommendation,null);assert.equal(absent.timing.temporal?.occurrenceCycleId,null);assert.throws(()=>selectDatedQualificationOpportunity({opportunities:[absent]}),/lacks mutation identity/);
const configured=opportunity(profiles[0]);assert.equal(configured.provenance.sourceId,'birthday');assert.equal(configured.timing.temporal?.family,'annual_recurring');assert.ok(configured.timing.temporal?.occurrenceCycleId);assert.equal(selectDatedQualificationOpportunity({opportunities:[absent,configured]}),configured);
assert.equal(opportunity(profiles[0],null).timing.temporal?.occurrenceCycleId,null);
for(const corrupt of [{...configured,id:''},{...configured,recipient:{...configured.recipient,id:''}}])assert.throws(()=>selectDatedQualificationOpportunity({opportunities:[corrupt]}));
try{selectDatedQualificationOpportunity({opportunities:[{provenance:{sourceId:'SECRET'},timing:{temporal:{restraintReason:'SECRET'}}}]});assert.fail('expected rejection');}catch(error){assert.ok(!String(error).includes('SECRET'));}
console.log('fixture profile production assembly/rules/Opportunity qualification: PASS (no database)');
