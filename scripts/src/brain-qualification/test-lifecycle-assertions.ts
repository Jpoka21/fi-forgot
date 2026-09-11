import assert from 'node:assert/strict';
import {qualifyUnderstanding,assertPersistedSnapshot} from './lifecycle-assertions';
const fixtureModule=new URL('../../../artifacts/api-server/src/__tests__/understanding-pg-fixture.ts',import.meta.url).href,handlerModule=new URL('../../../artifacts/api-server/src/services/versioned-understanding-repository.ts',import.meta.url).href;
const {UnderstandingPgFixture}=await import(fixtureModule),{createVersionedUnderstandingHandlers}=await import(handlerModule);
const fixture=new UnderstandingPgFixture();
fixture.seed('recipients',[{id:'brain-qual-a-r1',user_id:'brain-qual-owner-a',birthday:null,anniversary:null}]);
fixture.seed('question_answers',[{id:'qa-a-active',user_id:'brain-qual-owner-a',recipient_id:'brain-qual-a-r1',event_type:'Profile',event_year:2026,question_key:'communication',question_text:'How?',answer_text:'They prefer a phone call',was_skipped:false,trigger_type:'profile_gap',archived_at:null,created_at:'2026-01-01T00:00:00Z'}]);
const handlers=createVersionedUnderstandingHandlers(fixture.db,(req:any,res:any)=>{const owner=req.headers['x-user-id'];if(typeof owner!=='string'){res.status(401).json({error:'missing'});return null;}return owner;});
let mutations=0;
await qualifyUnderstanding(async(path,owner,init)=>{
  const parts=path.split('/'),tail=parts.slice(4);const params:any={id:parts[3]};
  let name:keyof typeof handlers='timeline';
  if(tail[0]==='answers'){params.answerId=tail[1];name=tail[2] as keyof typeof handlers;}
  if(tail[0]==='interpretations'){name=tail.length===1?'createInterpretation':'changeInterpretation';params.interpretationId=tail[1];params.action=tail[2];}
  if(tail[0]==='hypotheses'){name='changeHypothesisLifecycle';params.hypothesisId=tail[1];params.action=tail[2];}
  if(init)mutations++;
  let status=200,data:any;const response={status(value:number){status=value;return response;},json(value:unknown){data=value;return response;}};
  await handlers[name]({headers:{'x-user-id':owner},params,body:JSON.parse(String(init?.body??'{}'))} as any,response as any);
  if(status>=400)throw new Error(`${path} returned ${status}`);return data;
});
assert.ok(mutations>=18);
const before=structuredClone(fixture.tables);assertPersistedSnapshot(before,structuredClone(before));
assert.throws(()=>assertPersistedSnapshot(before,{}));assert.throws(()=>assertPersistedSnapshot(null,null));
console.log('Future lifecycle assertion harness PASS against local substitute; PostgreSQL and restart NOT qualified');
