import assert from 'node:assert/strict';
import {captureQuestionState,verifyQuestionState} from './question-state.mjs';
import {assertPersistedSnapshot} from './lifecycle-assertions.ts';
const owners=[{id:'a',recipientIds:['a1','a2']},{id:'b',recipientIds:['b1']}];
const calls=[];
const call=async(path,owner)=>{
  calls.push({path,owner});
  const id=path.split('/')[3];
  if(!owners.find(row=>row.id===owner).recipientIds.includes(id))throw Error(`${path} returned 404`);
  return {profileComplete:false,profileScore:25,nextQuestion:{question:'Synthetic question',fieldKey:'synthetic'}};
};
const state=await captureQuestionState(call,owners,async()=>[]);
assert.equal(calls.length,9);
assert.equal(state.selections.length,3);
assert.equal(verifyQuestionState(state,{owners}).questionSelectionStateQualified,true);
assert.equal(state.followUpExpiryBranchQualified,false);
await assert.rejects(()=>captureQuestionState(async()=>({profileComplete:false,profileScore:25,nextQuestion:null}),owners,async()=>[]),/Missing expected rejection/);
await assert.rejects(()=>captureQuestionState(call,owners,async()=>[{id:'undeclared',status:'expired'}]),/undeclared follow-up/);
for(const mutate of [
  x=>delete x.selections,
  x=>x.selections.pop(),
  x=>x.selections.push(x.selections[0]),
  x=>x.selections[0].ownerId='b',
  x=>x.selections[0].recipientId='foreign',
  x=>x.selections[0].selection.profileScore=null,
  x=>x.selectionMayMaterializeUnderstanding=false,
  x=>x.selectionMayExpireFollowUps=false,
  x=>x.followUpExpiryBranchQualified=true,
  x=>x.followUps.push({id:'undeclared'}),
]){
  const changed=structuredClone(state);mutate(changed);assert.throws(()=>verifyQuestionState(changed,{owners}));
}
assertPersistedSnapshot({questionState:state},{questionState:structuredClone(state)});
const changed=structuredClone(state);changed.selections[0].selection.nextQuestion.question='Changed';
assert.throws(()=>assertPersistedSnapshot({questionState:state},{questionState:changed}),/durable histories/);
console.log('Question selection materialization/state accounting: PASS (mock boundary; not actual persistence)');
