import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const root=new URL('../../../',import.meta.url),load=(p:string)=>import(new URL(p,root).href);
const {createRecipientQuestionRouter}=await load('artifacts/api-server/src/routes/recipient-question-reads.ts');
const {qualificationQuestionRoutes}=await load('artifacts/api-server/src/qualification/question-route-gate.ts');
const {createDueFollowUpQuestionReader}=await load('artifacts/api-server/src/services/due-follow-up-questions.ts');
const require=createRequire(new URL('artifacts/api-server/package.json',root));
const express=require('express'),{PgDialect}=require('drizzle-orm/pg-core');const dialect=new PgDialect();
let materializations=0,dueCalls=0,mode='gap',queries=0;
const db={select(){return {from(){return {where(expression:any){queries++;const q=dialect.sqlToQuery(expression),owned=q.params.includes('owned')&&q.params.includes('owner');return {limit:async()=>owned?[{id:'owned'}]:[],orderBy:async()=>[],then:(ok:any)=>ok([])}}}}}}};
const question={fieldKey:'personality',question:'Synthetic profile question',mode:'profile_gap'};
const services={assembleRecipientContext:async()=>{materializations++;return {profileCompleteness:{score:40},freshUpdates:[]}},getNextQuestion:()=>mode==='gap'?question:null,getNextFreshUpdateQuestion:()=>({question:'Synthetic fresh question',mode:'fresh_update'}),getDueFollowUpQuestion:async()=>{dueCalls++;return mode==='due'?{id:'due',question:'Synthetic due',originalAnswer:'Synthetic old',category:'GENERAL'}:null}};
const app=express(),router=createRecipientQuestionRouter(db,services);let health=0;
app.use(qualificationQuestionRoutes(router,(_req:any,res:any)=>{health++;res.json({scores:[]})}));app.use((_req:any,res:any)=>res.status(503).end());
const server=app.listen(0,'127.0.0.1');await new Promise<void>(ok=>server.once('listening',ok));
try{
 const request=async(path:string,method='GET',owner:string|undefined='owner')=>{const response=await fetch('http://127.0.0.1:'+server.address().port+path,{method,headers:owner?{'x-user-id':owner}:{},signal:AbortSignal.timeout(5000)});const text=await response.text();return {status:response.status,body:text?JSON.parse(text):null}};
 for(const suffix of ['next-question','fresh-updates']){const before=materializations;assert.equal((await request('/v2/recipients/owned/'+suffix,'GET','foreign')).status,404);assert.equal(materializations,before);const denied=queries;for(const method of ['HEAD','POST','PUT','PATCH','DELETE','OPTIONS'])assert.equal((await request('/v2/recipients/owned/'+suffix,method)).status,503);for(const path of ['/v2/recipients/owned/'+suffix+'?x=1','/v2/recipients/owned/'+suffix+'/','/v2/recipients/%6fwned/'+suffix])assert.equal((await request(path)).status,503);assert.equal((await request('/v2/recipients/owned/'+suffix,'GET','')).status,503);assert.equal(queries,denied);}
 const gap=await request('/v2/recipients/owned/next-question');assert.equal(gap.status,200);assert.deepEqual(gap.body,{nextQuestion:question,profileComplete:false,profileScore:40});assert.equal(dueCalls,0);
 mode='due';const due=await request('/v2/recipients/owned/next-question');assert.equal(due.body.nextQuestion.mode,'follow_up');assert.deepEqual(due.body.nextQuestion.followUp,{id:'due',originalAnswer:'Synthetic old',category:'GENERAL'});
 mode='fresh';assert.equal((await request('/v2/recipients/owned/next-question')).body.nextQuestion.mode,'fresh_update');assert.equal(materializations,3);assert.equal(dueCalls,2);
 const fresh=await request('/v2/recipients/owned/fresh-updates');assert.equal(fresh.status,200);assert.deepEqual(fresh.body.freshUpdates,[]);assert.equal(Object.keys(fresh.body.skipStats).length,7);assert.equal(materializations,3);
 assert.equal((await request('/v2/recipient-health')).status,200);for(const method of ['HEAD','POST','DELETE'])assert.equal((await request('/v2/recipient-health',method)).status,503);assert.equal((await request('/v2/recipient-health?x=1')).status,503);assert.equal(health,1);
}finally{server.closeAllConnections();await new Promise<void>((ok,no)=>server.close((e:any)=>e?no(e):ok()))}
// Assert the actual due-selector's SQL scope, date bounds, ordering, and nonfatal expiry.
for(const failExpiry of [false,true]){
 let updates=0,selects=0;let expiryQuery:any,expiryValues:any;const before=Date.now();

 const fake={
  update(){return {set(value:any){
   expiryValues=value;
   return {async where(expression:any){
    updates++;expiryQuery=dialect.sqlToQuery(expression);
    if(failExpiry)throw Error('synthetic expiry failure');
   }};
  }};},
  select(){return {from(){return {where(expression:any){
   selects++;const q=dialect.sqlToQuery(expression);
   assert.deepEqual(q.params.slice(0,3),['owner','owned','pending']);
   assert.match(q.sql,/"trigger_date" <=/);assert.ok(Math.abs(new Date(q.params[3]).getTime()-before)<2000);
   return {orderBy(column:any){assert.equal(column.name,'trigger_date');return {async limit(n:number){
    assert.equal(n,1);return [{id:'due',category:'GENERAL',question:'Synthetic due',originalAnswer:'Synthetic old'}];
   }}}};
  }}}};}
 };
 assert.deepEqual(await createDueFollowUpQuestionReader(fake)('owner','owned'),{id:'due',category:'GENERAL',question:'Synthetic due',originalAnswer:'Synthetic old'});assert.equal(updates,1);assert.equal(selects,1);
 assert.deepEqual(expiryValues,{status:'expired'});assert.deepEqual(expiryQuery.params.slice(0,3),['owner','owned','pending']);
 assert.match(expiryQuery.sql,/"user_id" = .*"recipient_id" = .*"status" = .*"trigger_date" </);
 const expectedExpiry=new Date(before);expectedExpiry.setDate(expectedExpiry.getDate()-180);assert.ok(Math.abs(new Date(expiryQuery.params[3]).getTime()-expectedExpiry.getTime())<2000);
}
console.log('Provider-free production question handlers: native HTTP branches/ownership-before-materialization/exact admission and due expiry SQL parity PASS; fake DB only');
