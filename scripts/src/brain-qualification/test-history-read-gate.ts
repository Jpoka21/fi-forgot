import assert from 'node:assert/strict';
// @ts-ignore Native test extension.
import {qualificationHistoryReads} from '../../../artifacts/api-server/src/qualification/history-read-gate.ts';
let delegated=0,refused=0,lastOwner:unknown;
const gate=qualificationHistoryReads((req,res)=>{delegated++;lastOwner=req.headers['x-user-id'];res.json({productionReadDelegated:true});});
const invoke=(method:string,path:string,owner:unknown='brain-qual-owner-a',url=path)=>{
 const before=delegated;let body:any;
 gate({method,path,url,headers:{'x-user-id':owner}} as any,{json:(value:any)=>{body=value;}} as any,()=>{refused++;});
 return {delegated:delegated>before,body};
};
for(const path of ['/personal/cards','/personal/briefings']){
 assert.deepEqual(invoke('GET',path),{delegated:true,body:{productionReadDelegated:true}});assert.equal(lastOwner,'brain-qual-owner-a');
 for(const method of ['HEAD','POST','PUT','PATCH','DELETE','OPTIONS'])assert.equal(invoke(method,path).delegated,false);
 for(const owner of [undefined,null,'',' ',['brain-qual-owner-a','brain-qual-owner-b']]){
  const supplied=owner===undefined?null:owner;assert.equal(invoke('GET',path,supplied).delegated,false);
 }
 for(const suffix of ['?','?recipientId=foreign','/','/foreign'])assert.equal(invoke('GET',path+suffix,'brain-qual-owner-a').delegated,false);
 assert.equal(invoke('GET',path,'brain-qual-owner-a',path+'?recipientId=foreign').delegated,false);
}
for(const path of ['/personal/cards/other','/personal/%63ards','/personal/briefings/other','/v2/concierge','/generate','/'])assert.equal(invoke('GET',path).delegated,false);
gate({method:'GET',path:'/personal/cards',url:'/personal/cards',headers:{}} as any,{json:()=>{throw Error('missing owner delegated');}} as any,()=>{refused++;});
assert.equal(delegated,2);assert.ok(refused>=30);
console.log('PASS exact qualification history-read delegation and method/path/query/identity refusal; no production handler or DB executed');
