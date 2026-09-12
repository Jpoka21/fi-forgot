import assert from 'node:assert/strict';
import {admittedApi,staticPath,presented,current,deniedRequest} from './policy.mjs';
const owner={id:'fixture-owner',email:'fixture@qualification.invalid',name:'Fixture'},body=JSON.stringify({email:owner.email,name:owner.name});
assert.equal(admittedApi('POST','/api/auth/session',{},body,owner),true);
for(const [method,path,headers,data] of [['POST','/api/v2/concierge/opportunity-feedback',{},body],['POST','/api/auth/session',{},JSON.stringify({...JSON.parse(body),id:'invented'})],['POST','/api/auth/session',{},body.replace('fixture@','another@')],['GET','/api/recipients',{},''],['GET','/api/recipients',{'x-user-id':'other'},''],['GET','/api/recipients?owner=x',{'x-user-id':owner.id},''],['GET','/api/admin/resetAllData',{'x-user-id':owner.id},'']])assert.equal(admittedApi(method,path,headers,data,owner),false);
assert.equal(admittedApi('GET','/api/recipients',{'x-user-id':owner.id},'',owner),true);
for(const path of ['/../private','/%2e%2e/private','/a\\private','//x/../private','/a?secret=x'])assert.equal(staticPath(path),null);
assert.equal(staticPath('/concierge'),'index.html');assert.equal(staticPath('/assets/app.js'),'assets/app.js');
const opportunity=(id,eligible=true,temporal=true)=>({id,presentation:{recommendationEligible:eligible},recommendation:{href:'/recipients'},timing:{temporal:{recommendationEligible:temporal}}});
assert.deepEqual(presented([opportunity('no',false),opportunity('stale',true,false),...['a','b','c','d'].map(id=>opportunity(id))]).map(x=>x.id),['a','b','c']);
assert.deepEqual(current([{lineageId:'a',version:1,active:true,action:'set'},{lineageId:'a',version:2,active:false,action:'withdraw'}]),[]);
console.log('Draft pure request policy, traversal, presentation and retained-history tests PASS; no listener/browser/database started');

const diagnosticOwner={...owner,recipientIds:['brain-qual-a-r1']};
for(const path of ['/api/v2/recipients/brain-qual-a-r1/fresh-updates','/api/v2/recipients/brain-qual-a-r1/next-question','/api/v2/recipient-health']){const record=deniedRequest('GET',path,{'x-user-id':owner.id},diagnosticOwner);assert.equal(record.path,path);assert.equal(record.ownerHeader,'matching');assert.equal(admittedApi('GET',path,{'x-user-id':owner.id},'',diagnosticOwner),false);}
for(const url of ['http://external.invalid/SECRET?token=SECRET','/api/SECRET?token=SECRET','/assets/SECRET.js?token=SECRET','/api/v2/recipients/SECRET/next-question']){const text=JSON.stringify(deniedRequest('SECRET',url,{'x-user-id':'SECRET',authorization:'SECRET'},diagnosticOwner));assert.ok(!text.includes('SECRET'));}
assert.equal(deniedRequest('GET','/api/v2/recipient-health?token=SECRET',{},diagnosticOwner).queryPresent,true);
console.log('Bounded denial diagnostics PASS: known route identity, owner-header category, secret omission; admission unchanged');

assert.equal(deniedRequest('GET','/api/recipients',{},diagnosticOwner).reason,'owner-header-mismatch');assert.equal(deniedRequest('GET','/api/v2/recipient-health',{'x-user-id':owner.id},diagnosticOwner).reason,'route-not-admitted');assert.equal(deniedRequest('GET','/api/recipients?x=SECRET',{},diagnosticOwner).reason,'query-present');

for(const [group,count] of [['a',5],['b',2]]){const exactOwner={id:'brain-qual-owner-'+group,recipientIds:Array.from({length:count},(_,i)=>'brain-qual-'+group+'-r'+(i+1))};for(const id of exactOwner.recipientIds)for(const suffix of ['fresh-updates','next-question']){const route='/api/v2/recipients/'+id+'/'+suffix;assert.equal(admittedApi('GET',route,{'x-user-id':exactOwner.id},'',exactOwner),true);for(const [method,path,header] of [['HEAD',route,exactOwner.id],['POST',route,exactOwner.id],['GET',route+'?id=x',exactOwner.id],['GET',route,'foreign'],['GET',route.replace('-'+group+'-','-'+(group==='a'?'b':'a')+'-'),exactOwner.id]])assert.equal(admittedApi(method,path,{'x-user-id':header},'',exactOwner),false);}assert.equal(admittedApi('GET','/api/v2/recipient-health',{'x-user-id':exactOwner.id},'',exactOwner),true);}
console.log('Exact two-owner question request scope PASS; methods/query/foreign-owner/foreign-recipient denied');
