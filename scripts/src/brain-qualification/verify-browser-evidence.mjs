import {questionRequestKind} from './browser/policy.mjs';import {questionResponse,questionProjection} from './browser/question-evidence.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const need=(ok,message)=>{if(!ok)throw Error('FAIL_CLOSED: browser '+message);};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const eq=(a,b)=>typeof a==='string'&&/^[a-f0-9]{64}$/i.test(a)&&typeof b==='string'&&a.toLowerCase()===b.toLowerCase();
const decode=bytes=>JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const presented=items=>items.filter(x=>x.presentation.recommendationEligible&&x.recommendation!==null&&(x.timing.temporal?.recommendationEligible??true)).slice(0,3);
const current=history=>{const latest=new Map();for(const e of history)if(!latest.has(e.lineageId)||latest.get(e.lineageId).version<e.version)latest.set(e.lineageId,e);return [...latest.values()].filter(e=>e.active&&e.action==='set');};

/** Read-only evidence validation. It cannot launch the browser, API, or database. */
export function verifyBrowserEvidence({directory,bundle,fixture,pins},read=fs.readFileSync,list=fs.readdirSync){
 const artifact=name=>{need(typeof name==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name)&&!name.includes('..'),'unsafe artifact name');return path.join(directory,name);};
 const bytes=name=>read(artifact(name));
 const receiptBytes=bytes('browser-receipt.json'),manifestBytes=bytes('browser-artifact-manifest.json');
 const receipt=decode(receiptBytes),manifest=decode(manifestBytes);
 need(eq(hash(receiptBytes),bundle.final.browserReceiptHash)&&eq(hash(manifestBytes),bundle.final.browserArtifactManifestHash),'final artifact binding');
 for(const value of [receipt,manifest])need(value.nonce===bundle.request.nonce&&value.sessionId===bundle.owned.id,'stale session');
 need(receipt.kind==='BRAIN-BROWSER-EXECUTION'&&receipt.success===true&&receipt.phase==='complete'&&receipt.authenticationQualified===false,'completion semantics');
 const start=Date.parse(receipt.startedAt),end=Date.parse(receipt.completedAt);
 need(Number.isFinite(start)&&Number.isFinite(end)&&start>=Date.parse(bundle.release.at)&&end>=start&&end<=Date.parse(bundle.execution.completedAt),'chronology');
 need(eq(receipt.durableEvidenceHash,bundle.hashes.durable),'snapshot binding');
 for(const [field,file] of [['browserArchiveHash','browser-runtime.zip'],['browserManifestHash','browser-manifest.json'],['frontendManifestHash','frontend-build-manifest.json']])need(eq(receipt.runtimePins?.[field],pins.get(file)),'runtime pin '+field);
 const proof=receipt.processProof;
 need(proof?.mainProcesses===1&&['pipeObserved','noSandboxSwitchAbsent','privateProfileObserved','exactExecutableObserved'].every(k=>proof[k]===true),'actual process boundary');
 need(receipt.teardown?.chromeProcesses===0&&receipt.teardown?.frontendPortReleased===true,'process teardown');
 need(Array.isArray(manifest.files)&&manifest.files.length>0&&manifest.files.length<=300,'artifact manifest');
 const entries=new Map();
 for(const item of manifest.files){need(!entries.has(item.path)&&item.path!=='browser-artifact-manifest.json','duplicate manifest artifact');const data=bytes(item.path);need(Number.isSafeInteger(item.bytes)&&item.bytes===data.length&&eq(hash(data),item.sha256),'artifact content drift');entries.set(item.path,item);}
 need(same([...list(directory)].sort(),[...entries.keys(),'browser-artifact-manifest.json'].sort()),'unlisted or missing artifact');
 const referenced=new Set(['browser-receipt.json']);
 const checked=(name,expected)=>{need(entries.has(name)&&eq(entries.get(name).sha256,expected),'reference hash mismatch');referenced.add(name);return bytes(name);};
 need(Array.isArray(receipt.owners)&&receipt.owners.length===fixture.owners.length,'owner count');
 for(const [index,owner] of fixture.owners.entries()){
  const observed=receipt.owners[index],stem='owner-'+(index+1);
  need(observed.id===owner.id&&same(observed.denied,[])&&same(observed.pageErrors,[]),'owner isolation or page failure');
  const png=checked(stem+'.png',observed.screenshotHash);need(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'screenshot format');
  need(checked(stem+'.aria.txt',observed.accessibilityHash).length>0,'accessibility absent');
  need(Array.isArray(observed.responses)&&observed.responses.length>0&&observed.responses.length<=128,'response inventory');
  const records=new Map(),sequences=new Set();
  for(const response of observed.responses){
   need(Number.isInteger(response.sequence)&&response.sequence>0&&!sequences.has(response.sequence)&&response.artifact===stem+'-response-'+response.sequence+'.json','response identity');sequences.add(response.sequence);
   const envelope=decode(checked(response.artifact,response.artifactHash));
   for(const key of ['sequence','path','method','requestOwnerId','bodyHash','artifact'])need(same(envelope[key],response[key]),'response envelope');
   need(typeof envelope.bodyUtf8==='string'&&Buffer.byteLength(envelope.bodyUtf8)<=4*1024*1024&&eq(hash(envelope.bodyUtf8),response.bodyHash),'response body hash');
   const body=JSON.parse(envelope.bodyUtf8);
   need(response.path==='/api/auth/session'?response.method==='POST':response.method==='GET','response method');
   need(response.requestOwnerId===(response.method==='GET'?owner.id:null),'request owner binding');
   if(response.path==='/api/auth/session')need(body.userId===owner.id,'session owner');
   else if(response.path==='/api/recipients')need(same(body.recipients.map(x=>x.id).sort(),[...owner.recipientIds].sort()),'recipient owners');
   else need(['/api/personal/cards','/api/personal/briefings','/api/v2/concierge','/api/v2/concierge/opportunity-feedback','/api/v2/concierge/opportunity-follow-through'].includes(response.path)||questionRequestKind(response.path,owner)!==null,'unapproved response');
   if(questionRequestKind(response.path,owner)!==null)questionResponse(response.path,body,owner);
   let scoped=[];
   if(response.path==='/api/v2/concierge'){need(body.version===1&&Array.isArray(body.opportunities)&&Array.isArray(body.recommendations)&&Array.isArray(body.insights),'workspace response shape');scoped=[...body.opportunities.map(x=>({recipientId:x.recipient.id})),...body.recommendations,...body.insights];}
   if(['/api/v2/concierge/opportunity-feedback','/api/v2/concierge/opportunity-follow-through'].includes(response.path)){need(Array.isArray(body.history),'history response shape');scoped=body.history;}
   for(const row of scoped)need(owner.recipientIds.includes(row.recipientId)&&(!('ownerId'in row)||row.ownerId===owner.id),'captured response cross-owner payload');
   if(response.path==='/api/personal/briefings'){need(Array.isArray(body.answers),'briefing response shape');for(const row of body.answers)need(row.userId===owner.id&&owner.recipientIds.includes(row.recipientId),'briefing owner');}
   // Card data is a free-form payload; this qualifies only exposed owner/recipient
   // identifiers, not undisclosed ownership metadata removed by the API.
   if(response.path==='/api/personal/cards'){need(Array.isArray(body.cards),'card response shape');for(const row of body.cards)need(row&&typeof row==='object'&&(!('userId'in row)||row.userId===owner.id)&&(!('recipientId'in row)||owner.recipientIds.includes(row.recipientId)),'card exposed owner');}
   records.set(response.artifact,{response,body});
  }
  need([...records.values()].some(x=>x.response.path==='/api/auth/session')&&[...records.values()].some(x=>x.response.path==='/api/recipients'),'hydration evidence');
  const cycle=refs=>{need(Array.isArray(refs)&&refs.length===3,'cycle references');return refs.map((ref,i)=>{const record=records.get(ref.artifact);need(record&&same(record.response,ref)&&ref.path===['/api/v2/concierge','/api/v2/concierge/opportunity-feedback','/api/v2/concierge/opportunity-follow-through'][i],'cycle binding');return record.body;});};
  need(Array.isArray(observed.assertions)&&observed.assertions.length===4,'assertion inventory');
  for(const [i,assertion] of observed.assertions.entries()){
   const data=checked(assertion.file,assertion.sha256);
   if(i===0||i===2){
    const transition=i===0?'initial-workspace':'returned-workspace';need(assertion.file===stem+'-'+transition+'-assertions.json','assertion path');
    const projection=decode(data),[workspace,feedback,follow]=cycle(projection.responseRecords);
    need(projection.transition===transition&&workspace.version===1&&workspace.opportunities.length>0,'workspace evidence');
    for(const row of [...workspace.opportunities.map(x=>({recipientId:x.recipient.id})),...workspace.recommendations,...workspace.insights,...feedback.history,...follow.history])need(owner.recipientIds.includes(row.recipientId)&&(!('ownerId'in row)||row.ownerId===owner.id),'cross-owner payload');
    const refs=projection.question?.responseRecords;need(Array.isArray(refs)&&refs.length===3,'question cycle references');const captures=refs.map(ref=>{const row=records.get(ref.artifact);need(row&&same(row.response,ref),'question envelope binding');return {record:row.response,body:row.body};});const hydrated=[...records.values()].find(x=>x.response.path==='/api/recipients').body.recipients;const expectedQuestion=questionProjection(captures,owner,hydrated,workspace.insights);need(same(projection.question,expectedQuestion),'question projection');const dom=projection.questionDom;need(dom?.claim==='panel-presence-only'&&dom?.recipientId===expectedQuestion.recipientId,'question DOM recipient');if(expectedQuestion.nextQuestion===null)need(dom.state==='absent','absent question DOM');else need(['answer-control','no-answer-control'].includes(dom.state)&&typeof dom.title==='string'&&dom.title.length>0&&dom.title.length<=4096&&(dom.state==='answer-control'?dom.answerEmpty===true:dom.answerEmpty===null&&dom.title==='I already know enough for now'),'question DOM observation');
    const expected=presented(workspace.opportunities).map(({id,title,explanation,recommendation})=>({id,title,explanation,recommendation}));
    need(same(projection.presented,expected)&&same(projection.feedback,current(feedback.history))&&same(projection.followThrough,current(follow.history)),'UI response projection');
    if(i===2)need(observed.observedOpportunityCount===workspace.opportunities.length&&same(observed.presentedIds,expected.map(x=>x.id))&&observed.feedbackCount===projection.feedback.length&&observed.followThroughCount===projection.followThrough.length,'final owner projection');
   }else{need(assertion.file===stem+'-'+(i===1?'conversation':'workspace')+'.aria.txt'&&data.length>0,'tab accessibility');cycle(assertion.responseRecords);}
  }
 }
 need(same([...entries.keys()].sort(),[...referenced].sort()),'unreferenced artifact');
 return {browserQualified:true,realAuthenticationQualified:false};
}
