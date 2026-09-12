import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {verifyBrowserEvidence} from './verify-browser-evidence.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex'),H=hash('synthetic');
function fixture(){
 const files=new Map(),put=(name,value)=>{const data=Buffer.isBuffer(value)?value:Buffer.from(typeof value==='string'?value:JSON.stringify(value));files.set(name,data);return hash(data);};
 const owner={id:'brain-qual-owner-a',recipientIds:['brain-qual-a-r1']};
 const receipt={kind:'BRAIN-BROWSER-EXECUTION',nonce:'attempt',sessionId:'session',success:true,phase:'complete',authenticationQualified:false,startedAt:'2030-01-01T00:00:01Z',completedAt:'2030-01-01T00:00:02Z',durableEvidenceHash:H,runtimePins:{browserArchiveHash:H,browserManifestHash:H,frontendManifestHash:H},processProof:{mainProcesses:1,pipeObserved:true,noSandboxSwitchAbsent:true,privateProfileObserved:true,exactExecutableObserved:true},teardown:{chromeProcesses:0,frontendPortReleased:true},owners:[]};
 const workspace={version:1,opportunities:[{id:'opportunity',recipient:{id:owner.recipientIds[0],name:'Synthetic A1'},title:'Synthetic title',explanation:'Synthetic source',presentation:{recommendationEligible:true},recommendation:{href:'/recipients/brain-qual-a-r1',label:'View'},timing:{}}],recommendations:[],insights:[{recipientId:owner.recipientIds[0],recipientName:'Synthetic A1'}]};
 const bodies=[{userId:owner.id},{recipients:[{id:owner.recipientIds[0],name:'Synthetic A1'}]},workspace,{history:[]},{history:[]},{freshUpdates:[],skipStats:{}},{nextQuestion:{fieldKey:'memory',question:'Synthetic question?',mode:'profile'},profileComplete:false,profileScore:0},{scores:[{recipientId:owner.recipientIds[0],name:'Synthetic A1',score:0}]}];
 const paths=['/api/auth/session','/api/recipients','/api/v2/concierge','/api/v2/concierge/opportunity-feedback','/api/v2/concierge/opportunity-follow-through','/api/v2/recipients/brain-qual-a-r1/fresh-updates','/api/v2/recipients/brain-qual-a-r1/next-question','/api/v2/recipient-health'];
 const responses=bodies.map((body,i)=>{const bodyUtf8=JSON.stringify(body),record={sequence:i+1,path:paths[i],method:i?'GET':'POST',requestOwnerId:i?owner.id:null,bodyHash:hash(bodyUtf8),artifact:'owner-1-response-'+(i+1)+'.json'};return {...record,artifactHash:put(record.artifact,{...record,bodyUtf8})};});
 const assertions=[];
 for(const name of ['initial-workspace','conversation','returned-workspace','workspace']){
  const isJson=name.includes('-'),file='owner-1-'+name+(isJson?'-assertions.json':'.aria.txt');
  const data=isJson?{transition:name,question:{recipientId:owner.recipientIds[0],recipientName:'Synthetic A1',responseRecords:responses.slice(5),nextQuestion:bodies[6].nextQuestion,profileComplete:false,profileScore:0,materializingGet:true},questionDom:{claim:'panel-presence-only',state:'answer-control',recipientId:owner.recipientIds[0],title:'Synthetic question?',answerEmpty:true},responseRecords:responses.slice(2,5),presented:workspace.opportunities.map(({id,title,explanation,recommendation})=>({id,title,explanation,recommendation})),feedback:[],followThrough:[]}:'- tabpanel: Synthetic';
  assertions.push({file,sha256:put(file,data),...(!isJson?{responseRecords:responses.slice(2,5)}:{})});
 }
 receipt.owners.push({id:owner.id,denied:[],pageErrors:[],responses,assertions,observedOpportunityCount:1,presentedIds:['opportunity'],feedbackCount:0,followThroughCount:0,screenshotHash:put('owner-1.png',Buffer.from([137,80,78,71,13,10,26,10])),accessibilityHash:put('owner-1.aria.txt','Synthetic accessibility')});
 const bundle={request:{nonce:'attempt'},owned:{id:'session'},release:{at:'2030-01-01T00:00:00Z'},execution:{completedAt:'2030-01-01T00:00:03Z'},final:{},hashes:{durable:H}};
 const finalize=()=>{bundle.final.browserReceiptHash=put('browser-receipt.json',receipt);files.delete('browser-artifact-manifest.json');bundle.final.browserArtifactManifestHash=put('browser-artifact-manifest.json',{nonce:'attempt',sessionId:'session',files:[...files].map(([name,bytes])=>({path:name,bytes:bytes.length,sha256:hash(bytes)}))});};
 const run=()=>verifyBrowserEvidence({directory:'synthetic',bundle,fixture:{owners:[owner]},pins:new Map(['browser-runtime.zip','browser-manifest.json','frontend-build-manifest.json'].map(x=>[x,H]))},file=>{const value=files.get(path.basename(file));assert.ok(value,'missing file');return value;},()=>[...files.keys()]);
 finalize();return {files,receipt,bundle,run,finalize,put};
}
assert.equal(fixture().run().browserQualified,true);
const rejects=[
 x=>x.receipt.nonce='old',x=>x.receipt.sessionId='old',x=>x.receipt.success=false,x=>x.receipt.authenticationQualified=true,
 x=>x.receipt.startedAt='invalid',x=>x.receipt.completedAt='2030-01-01T00:00:04Z',x=>x.receipt.durableEvidenceHash=hash('changed'),
 x=>x.receipt.runtimePins.browserArchiveHash=hash('changed'),x=>x.receipt.processProof.pipeObserved=false,x=>x.receipt.processProof.noSandboxSwitchAbsent=false,
 x=>x.receipt.teardown.chromeProcesses=1,x=>x.receipt.teardown.frontendPortReleased=false,x=>x.receipt.owners[0].id='another',
 x=>x.receipt.owners[0].pageErrors.push('error'),x=>x.receipt.owners[0].denied.push('external'),x=>x.receipt.owners[0].responses[1].sequence=1,
 x=>x.receipt.owners[0].responses[0].artifactHash=hash('drift'),x=>x.receipt.owners[0].assertions.pop(),x=>x.receipt.owners[0].presentedIds=[],
 x=>x.put('extra.json',{}),x=>x.receipt.owners[0].assertions[0].file='../escape',
 x=>{const name='owner-1-initial-workspace-assertions.json',body=JSON.parse(x.files.get(name));body.presented[0].title='Invented title';x.receipt.owners[0].assertions[0].sha256=x.put(name,body);},
 x=>{const name='owner-1-returned-workspace-assertions.json',body=JSON.parse(x.files.get(name));body.responseRecords[0].bodyHash=hash('stale');x.receipt.owners[0].assertions[2].sha256=x.put(name,body);},
];
for(const mutate of rejects){const x=fixture();mutate(x);x.finalize();assert.throws(x.run);}
const drift=fixture();drift.files.set('owner-1.png',Buffer.from('changed'));assert.throws(drift.run);
for(const [apiPath,body] of [
 ['/api/v2/concierge',{version:1,opportunities:[{recipient:{id:'foreign'}}],recommendations:[],insights:[]}],
 ['/api/v2/concierge/opportunity-feedback',{history:[{recipientId:'foreign'}]}],
 ['/api/v2/concierge/opportunity-follow-through',{history:[{recipientId:'brain-qual-a-r1',ownerId:'foreign'}]}],
 ['/api/personal/briefings',{answers:[{recipientId:'brain-qual-a-r1',userId:'foreign'}]}],
 ['/api/personal/cards',{cards:[{recipientId:'foreign'}]}],
]){const x=fixture(),bodyUtf8=JSON.stringify(body),record={sequence:9,path:apiPath,method:'GET',requestOwnerId:'brain-qual-owner-a',bodyHash:hash(bodyUtf8),artifact:'owner-1-response-9.json'};x.receipt.owners[0].responses.push({...record,artifactHash:x.put(record.artifact,{...record,bodyUtf8})});x.finalize();assert.throws(x.run);}
console.log('Browser evidence validator synthetic chain/projection negatives: PASS ('+(rejects.length+1)+'); no actual browser qualification claimed');
console.log('Additional captured responses with foreign owner/recipient: rejected (5)');

for(const mutate of [p=>p.question.recipientId='brain-qual-b-r1',p=>p.question.materializingGet=false,p=>p.question.nextQuestion.question='invented',p=>p.question.responseRecords[0].path='/api/v2/recipients/brain-qual-b-r1/fresh-updates',p=>p.questionDom.recipientId='foreign',p=>p.questionDom.answerEmpty=false,p=>delete p.question]){const x=fixture(),name='owner-1-initial-workspace-assertions.json',p=JSON.parse(x.files.get(name));mutate(p);x.receipt.owners[0].assertions[0].sha256=x.put(name,p);x.finalize();assert.throws(x.run);}
for(const [index,mutate] of [[5,e=>e.requestOwnerId='foreign'],[5,e=>e.path='/api/v2/recipients/brain-qual-b-r1/fresh-updates'],[6,e=>{const b=JSON.parse(e.bodyUtf8);b.nextQuestion.userId='foreign';e.bodyUtf8=JSON.stringify(b);e.bodyHash=hash(e.bodyUtf8);}], [7,e=>{const b=JSON.parse(e.bodyUtf8);b.scores[0].recipientId='brain-qual-b-r1';e.bodyUtf8=JSON.stringify(b);e.bodyHash=hash(e.bodyUtf8);}]] ){const x=fixture(),r=x.receipt.owners[0].responses[index],e=JSON.parse(x.files.get(r.artifact));mutate(e);for(const key of ['requestOwnerId','path','bodyHash'])r[key]=e[key];r.artifactHash=x.put(r.artifact,e);x.finalize();assert.throws(x.run);}
console.log('Question captured envelope/projection/DOM tamper and foreign owner/path negatives PASS11');

const {questionProjection}=await import('./browser/question-evidence.mjs');
for(const group of ['a','b']){const owner={id:'brain-qual-owner-'+group,recipientIds:['brain-qual-'+group+'-r1']},id=owner.recipientIds[0],recipients=[{id,name:'Synthetic '+group}];const captured=[{record:{path:'/api/v2/recipients/'+id+'/fresh-updates'},body:{freshUpdates:[]}},{record:{path:'/api/v2/recipients/'+id+'/next-question'},body:{nextQuestion:null,profileComplete:true,profileScore:100}},{record:{path:'/api/v2/recipient-health'},body:{scores:[{recipientId:id,name:recipients[0].name,score:50}]}}];assert.equal(questionProjection(captured,owner,recipients,[{recipientName:recipients[0].name}]).recipientId,id);for(const mutate of [c=>c[0].record.path=c[0].record.path.replace(id,'brain-qual-foreign'),c=>c[1].record.path=c[1].record.path+'?recipient=x',c=>c[2].body.scores[0].name='foreign',c=>c[2].body.scores=[],c=>c.reverse()]){const bad=structuredClone(captured);mutate(bad);assert.throws(()=>questionProjection(bad,owner,recipients,[{recipientName:recipients[0].name}]));}}
console.log('Both-owner question projection identity/order/health negatives PASS');

{const x=fixture(),name='owner-1-initial-workspace-assertions.json',p=JSON.parse(x.files.get(name));p.questionDom.claim='semantic-question-correctness';x.receipt.owners[0].assertions[0].sha256=x.put(name,p);x.finalize();assert.throws(x.run);}
{const owner={id:'brain-qual-owner-b',recipientIds:['brain-qual-b-r1','brain-qual-b-r2']},recipients=[{id:owner.recipientIds[0],name:'First'},{id:owner.recipientIds[1],name:'Second'}],captured=[{record:{path:'/api/v2/recipients/brain-qual-b-r1/fresh-updates'},body:{freshUpdates:[]}},{record:{path:'/api/v2/recipients/brain-qual-b-r1/next-question'},body:{nextQuestion:null,profileComplete:true,profileScore:100}},{record:{path:'/api/v2/recipient-health'},body:{scores:recipients.map(r=>({recipientId:r.id,name:r.name,score:50}))}}];assert.throws(()=>questionProjection(captured,owner,recipients,[{recipientName:'Second'}]));assert.throws(()=>questionProjection(captured,owner,recipients,[]));}
console.log('Selected insight recipient and semantic-claim overstatement rejected');
