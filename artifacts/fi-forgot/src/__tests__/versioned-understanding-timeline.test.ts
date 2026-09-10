import assert from 'node:assert/strict';
import * as React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {normalizeTimelineItem,type FiTimelineItem as Item} from '../app/timeline/timelineDomain';
import {timelineService} from '../app/api/services/timelineService';
import {createInterpretationOperation,changeInterpretationOperation,changeAnswerOperation} from '../app/timeline/understandingTimelineOperations';
import {applyTimelineMutationOutcome} from '../app/timeline/relationshipTimelineMutation';
import type {RelationshipTimelineController} from '../app/timeline/hooks/useRelationshipTimeline';
(globalThis as typeof globalThis&{React:typeof React}).React=React;
const {FiTimelineItem}=await import('../app/components/timeline/FiTimelineItem');
const {FiRelationshipTimelineView}=await import('../app/components/timeline/FiRelationshipTimeline');
const date='2026-09-10T00:00:00.000Z';
const action=(operationId:string,name:string,from:number)=>({operationId,action:name,actorUserId:'u',actedAt:date,expectedRevision:from,newRevision:from+1});
const base=normalizeTimelineItem({id:'i',type:'interpretation',date,label:'Your interpretation',summary:'Perhaps they need quiet time',source:'User-authored interpretation',sourceKind:'interpretation',semanticClassification:'uncertain_interpretation',uncertain:true,lifecycleState:'active',revision:1,canArchive:true,canEdit:false,isArchived:false,history:[],dependencyVersionIds:['v1'],actionHistory:[action('old-create','create',0)],lastOperationId:'old-create'})!;
const report=normalizeTimelineItem({id:'a',type:'profile_gap',date,label:'Your report',summary:'Reported story',source:'Your answer',sourceKind:'user_report',semanticClassification:'reported_information',evidenceId:'a',version:1,lifecycleState:'active',canEdit:true,canArchive:true,history:[{id:'v1',version:1,text:'Reported story',lifecycleState:'active',recordedAt:date}]})!;
let rows:Item[]=[base,report],failWrite=false,failReload=false;let writes=0;let seen:unknown;
const service={...timelineService,
 async getTimeline(){if(failReload)throw Error('reload');return{items:rows};},
 async createInterpretation(_recipient:string,input:unknown){writes++;seen=input;if(failWrite)throw Error('write');return{} as any;},
 async changeInterpretation(_recipient:string,_id:string,_action:string,_revision:number,operationId:string){writes++;seen=operationId;if(failWrite)throw Error('write');return{} as any;},
 async editAnswer(_recipient:string,_id:string,_text:string,_version:string,operationId?:string){writes++;seen=operationId;if(failWrite)throw Error('write');return{} as any;},
};
failWrite=true;
let outcome=await createInterpretationOperation('r',base.summary,['v1'],service,'new-create');assert.equal(outcome.kind,'write_failed_reloaded','old identical text cannot confirm a new write');
let error:string|null=null,closed=0,applied:Item[]=[];
assert.equal(applyTimelineMutationOutcome('interpretation',outcome,{setItems:value=>{applied=value;},setMutationError:value=>{error=value;},onConfirmed:()=>{closed++;}}),false);
assert.ok(error);assert.equal(closed,0);assert.deepEqual(applied,rows);
rows=[{...base,id:'new',lastOperationId:'new-create',actionHistory:[action('new-create','create',0)]},report];
outcome=await createInterpretationOperation('r',base.summary,['v1'],service,'new-create');assert.equal(outcome.kind,'confirmed_after_ambiguous_write');assert.equal(writes,2,'no automatic write retry');
failWrite=false;rows=[base,report];outcome=await createInterpretationOperation('r',base.summary,['v1'],service,'another');assert.equal(outcome.kind,'write_resolved_state_mismatch');
failReload=true;outcome=await createInterpretationOperation('r',base.summary,['v1'],service,'another');assert.equal(outcome.kind,'write_confirmed_reload_failed');
failWrite=true;outcome=await createInterpretationOperation('r',base.summary,['v1'],service,'another');assert.equal(outcome.kind,'write_failed_stale');failReload=false;
rows=[{...base,revision:2,confirmedAt:date,actionHistory:[...base.actionHistory,action('old-confirm','confirm',1)]}];
outcome=await changeInterpretationOperation('r',base,'confirm',service,'new-confirm');assert.equal(outcome.kind,'write_failed_reloaded','prior endorsement does not prove a stale action');
for(const name of ['confirm','withdraw','reject','archive','restore'] as const){
 rows=[{...base,revision:2,lastOperationId:name,actionHistory:[...base.actionHistory,action(name,name,1)]}];
 outcome=await changeInterpretationOperation('r',base,name,service,name);assert.equal(outcome.kind,'confirmed_after_ambiguous_write');assert.equal(seen,name);
}
rows=[{...report,version:2,lastOperationId:'other-edit',history:[...report.history,{id:'v2',version:2,text:report.summary,lifecycleState:'active',recordedAt:date}]}];
outcome=await changeAnswerOperation('r',report,'edit',report.summary,service,'this-edit');assert.equal(outcome.kind,'write_failed_reloaded','a different successor does not prove this edit');
rows=[{...rows[0],lastOperationId:'this-edit'}];outcome=await changeAnswerOperation('r',report,'edit',report.summary,service,'this-edit');assert.equal(outcome.kind,'confirmed_after_ambiguous_write');
// Exercise actual service transport, including expected revision and operation identity.
const originalFetch=globalThis.fetch;let body:any;
globalThis.fetch=async(_url,options)=>{body=JSON.parse(String(options?.body));return new Response(JSON.stringify({error:'stale'}),{status:409,headers:{'content-type':'application/json'}});};
try{await assert.rejects(()=>timelineService.changeInterpretation('r','i','confirm',1,'transport'));assert.deepEqual(body,{expectedRevision:1,operationId:'transport'});}finally{globalThis.fetch=originalFetch;}
const callbacks:string[]=[];
function clickButtons(node:any){if(!node||typeof node!=='object')return;if(node.props?.onClick)node.props.onClick();React.Children.forEach(node.props?.children,clickButtons);}
for(const state of ['active','withdrawn','rejected','archived'] as const){
 const item={...base,lifecycleState:state,isArchived:state!=='active',canRestore:state!=='active',actionHistory:[action('history',state==='active'?'create':state,0)]};
 const tree=FiTimelineItem({item,onInterpretationAction:(_id,name)=>{callbacks.push(name);}});clickButtons(tree);
 const html=renderToStaticMarkup(tree);assert.ok(html.includes(`Status: ${state}`));assert.ok(html.includes('Interpretation history'));assert.ok(html.includes('uncertain'));
}
clickButtons(FiTimelineItem({item:{...base,confirmedAt:date},onInterpretationAction:(_id,name)=>{callbacks.push(name);}}));
for(const action of ['confirm','withdraw','reject','archive','restore'])assert.ok(callbacks.includes(action),`reachable ${action} control`);
const controller={items:[base,report],filteredItems:[base,report],visibleItems:[base,report],groupedItems:[{key:'month',label:'This month',items:[base,report]}],filter:'all',query:'',debouncedQuery:'',isLoading:false,isRefreshing:false,error:null,mutationError:error,hasMore:false,editingId:null,confirmArchiveId:null,showEmpty:false,showResults:true,setQuery(){},setFilter(){},setEditingId(){},setConfirmArchiveId(){},refresh:async()=>true,loadMore(){},archiveItem:async()=>{},saveEdit:async()=>{},restoreItem:async()=>{},createInterpretation:async()=>false,changeInterpretation:async()=>false} as unknown as RelationshipTimelineController;
const html=renderToStaticMarkup(FiRelationshipTimelineView({timeline:controller,interpretationText:'Keep this draft',dependencyVersionId:'v1'}));
assert.ok(html.includes('Answer report dates show when you saved an answer'));
assert.ok(html.includes('Observation version dates show when a source snapshot was captured'));
assert.ok(html.includes('Neither date says when the described experience happened'));
assert.ok(html.includes('Save uncertain interpretation'));assert.ok(html.includes('Keep this draft'));assert.ok(html.includes(error!));assert.ok(html.includes('Endorse interpretation'));
function findForm(node:any):any {if(!node||typeof node!=='object')return null;if(node.type==='form')return node;let found:any=null;React.Children.forEach(node.props?.children,child=>{found??=findForm(child);});return found;}
let saved=0,submitted=0;
const submitView=(success:boolean)=>FiRelationshipTimelineView({timeline:{...controller,createInterpretation:async(text,ids)=>{submitted++;assert.equal(text,'Keep this draft');assert.deepEqual(ids,['v1']);return success;}},interpretationText:'Keep this draft',dependencyVersionId:'v1',onInterpretationSaved:()=>{saved++;}});
findForm(submitView(false)).props.onSubmit({preventDefault(){}});await Promise.resolve();assert.equal(saved,0,'failed creation retains the composer');
findForm(submitView(true)).props.onSubmit({preventDefault(){}});await Promise.resolve();assert.equal(saved,1);assert.equal(submitted,2);
console.log('production timeline operations, exact reload identity, failures, transport, controls and action history passed');
