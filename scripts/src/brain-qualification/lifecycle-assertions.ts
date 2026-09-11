import assert from 'node:assert/strict';

/** Future HTTP qualification. Importing this module starts no app and opens no connection. */
export type QualificationCall = (path:string, owner:string, init?:RequestInit)=>Promise<any>;
export async function qualifyUnderstanding(call:QualificationCall) {
  const owner='brain-qual-owner-a', recipient='brain-qual-a-r1', source='qa-a-active';
  const base=`/v2/recipients/${recipient}`;
  const timeline=()=>call(`${base}/timeline`,owner);
  const mutate=(path:string,body:unknown)=>call(`${base}/${path}`,owner,{method:path==='interpretations'?'POST':'PATCH',body:JSON.stringify(body)});
  const observation=(t:any)=>{const o=t.items.find((i:any)=>i.evidenceId===source);assert.ok(o,'synthetic observation absent');return o;};
  const hypothesis=(t:any)=>{const h=t.items.find((i:any)=>i.type==='hypothesis');assert.ok(h,'source-grounded hypothesis absent');return h;};
  let t=await timeline(), o=observation(t), h=hypothesis(t);
  assert.equal(o.history.length,1);assert.equal(o.observationAt,null);assert.equal(h.confidence,null);
  assert.ok(h.dependencyVersionIds.includes(o.history[0].id));
  const v1=o.history[0].id;
  const interpretation=await mutate('interpretations',{text:'Phone may work well for them.',dependencyVersionIds:[v1],operationId:'brain-qual-interpretation-create'});
  assert.ok(interpretation.id);
  for(const [index,action] of ['confirm','withdraw','restore','reject','restore','archive','restore'].entries()) {
    await mutate(`interpretations/${interpretation.id}/${action}`,{expectedRevision:index+1,operationId:`brain-qual-interpretation-${index}-${action}`});
  }
  t=await timeline();
  let meaning=t.items.find((i:any)=>i.id===interpretation.id);
  assert.equal(meaning.actionHistory.length,8);assert.equal(meaning.lifecycleState,'active');
  await mutate(`answers/${source}/edit`,{answerText:'They prefer a phone call in the evening',expectedVersionId:v1});
  t=await timeline();o=observation(t);assert.equal(o.history.length,2);assert.notEqual(o.history.at(-1).id,v1);
  meaning=t.items.find((i:any)=>i.id===interpretation.id);assert.equal(meaning.lifecycleState,'superseded');assert.equal(meaning.canRestore,false);
  await mutate(`answers/${source}/archive`,{expectedVersionId:o.history.at(-1).id});
  t=await timeline();o=observation(t);assert.equal(o.isArchived,true);assert.equal(hypothesis(t).lifecycleState,'retired');
  await mutate(`answers/${source}/restore`,{expectedVersionId:o.history.at(-1).id});
  t=await timeline();o=observation(t);assert.equal(o.history.length,4);assert.equal(o.isArchived,false);
  assert.equal(hypothesis(t).lifecycleState,'retired','identical restored content must not revive retired understanding');
  await mutate(`answers/${source}/edit`,{answerText:'They prefer texts.',expectedVersionId:o.history.at(-1).id});
  t=await timeline();h=hypothesis(t);assert.equal(h.lifecycleState,'active','new evidence content must support revival');
  for(const action of ['disagree','reverse','confirm','withdraw','reverse']) {
    h=hypothesis(await timeline());
    await mutate(`hypotheses/${h.id}/${action}`,{expectedRevision:h.revision,operationId:`brain-qual-hypothesis-${action}-${h.revision}`});
    const changed=hypothesis(await timeline());
    assert.equal(changed.responseState,({disagree:'disagreed',reverse:'none',confirm:'confirmed',withdraw:'withdrawn'} as Record<string,string>)[action]);
    assert.equal(changed.confidence,null);
  }
  t=await timeline();o=observation(t);assert.equal(o.history.length,5);assert.equal(o.history[0].id,v1);
  assert.equal(t.items.find((i:any)=>i.id===interpretation.id).actionHistory.length,8);
  assert.ok(hypothesis(t).history.length>1);
  // Cross-owner mutation must be refused without changing the preserved timeline.
  await assert.rejects(()=>call(`${base}/answers/${source}/edit`,'brain-qual-owner-b',{method:'PATCH',body:JSON.stringify({answerText:'Cross-owner forbidden',expectedVersionId:o.history.at(-1).id})}),/returned 403|returned 404/);
  assert.deepEqual(await timeline(),t);
  return {source,interpretationId:interpretation.id,hypothesisId:hypothesis(t).id,observationVersionIds:o.history.map((v:any)=>v.id)};
}

/** Comparisons run after restart without replaying mutation requests. */
export function assertPersistedSnapshot(before:unknown,after:unknown) {
  assert.ok(before&&typeof before==='object','missing pre-restart evidence');
  assert.deepEqual(after,before,'durable histories or active state changed across API restart');
}
