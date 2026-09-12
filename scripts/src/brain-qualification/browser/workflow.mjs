import {questionProjection} from './question-evidence.mjs';
import {awaitResponsesForTrigger,prepareConciergeNavigation,captureFailureDiagnostics,finishBrowserReceipt,cleanupOwner,errorKind} from './workflow-lifecycle.mjs';
import {responseEvidence} from './response-evidence.mjs';
import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {startFrontend,hash} from './server.mjs';
import {origin,admittedApi,staticPath,presented,current,deniedRequest,questionRequestKind} from './policy.mjs';
/** Draft integration contract: all paths/runtime/build hashes admitted by the guest wrapper.
 * verifyExistingOwners must read the actual exact PG target, reassertSnapshot must run
 * the existing future-workflow.ts assert --after-restart (no replay). Neither may be a stub.
 * No executable CLI entry or import-time launch is provided in this draft.
 */
export async function qualifyBrowser({chromium,chrome,dist,manifest,owners,output,nonce,sessionId,verifyExistingOwners,reassertSnapshot,durablePath,verifyProcess,verifyTeardown,runtimePins}){
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 assert.ok(uuid.test(nonce)&&uuid.test(sessionId));assert.equal(owners.length,2);
 assert.ok(owners.every(o=>o.email.endsWith('@qualification.invalid')&&Array.isArray(o.recipientIds)));
 mkdirSync(output);const before=hash(readFileSync(durablePath));
 const receipt={kind:'BRAIN-BROWSER-EXECUTION',nonce,sessionId,runtimePins,authenticationQualified:false,success:false,owners:[],phase:'existing-owner-read',startedAt:new Date().toISOString()};
 let browser,stop,primaryError;
 try{
  // Return only id/email/name from a read-only exact-target query. Exact equality
  // blocks /auth/session's create-user fallback before browser startup.
  assert.deepEqual(await verifyExistingOwners(),owners.map(({id,email,name})=>({id,email,name})));
  receipt.phase='chrome-start';
  const env={};for(const key of ['SystemRoot','WINDIR','COMSPEC','TEMP','TMP'])if(process.env[key])env[key]=process.env[key];
  // chromium.launch uses Playwright's debugging pipe; never a debugging TCP port.
  browser=await chromium.launch({executablePath:chrome,headless:true,chromiumSandbox:true,env,args:['--disable-background-networking','--disable-component-update','--no-first-run']});
  receipt.processProof=await verifyProcess();
  assert.ok(receipt.processProof.mainProcesses===1&&receipt.processProof.pipeObserved===true&&receipt.processProof.noSandboxSwitchAbsent===true&&receipt.processProof.privateProfileObserved===true&&receipt.processProof.exactExecutableObserved===true);
  for(const owner of owners){
   receipt.phase=`owner-${receipt.owners.length+1}`;
   const denied=[],pageErrors=[],stem=`owner-${receipt.owners.length+1}`,assertions=[];
   const evidence=responseEvidence(output,stem,pageErrors,owner);
   receipt.activeOwner={id:owner.id,denied,pageErrors,responses:evidence.records,assertions};
   stop=await startFrontend({dist,manifest,owner,denied});
   const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
   let page,ownerError;
   try{
    await context.route('**/*',async route=>{
     const request=route.request(),url=new URL(request.url());
     const allowed=url.origin===origin&&!url.search&&(url.pathname.startsWith('/api/')?admittedApi(request.method(),url.pathname,request.headers(),request.postData()??'',owner):request.method()==='GET'&&staticPath(url.pathname)!==null);
     if(!allowed){denied.push(deniedRequest(request.method(),request.url(),request.headers(),owner));await route.abort('blockedbyclient');}else await route.continue();
    });
    await context.addInitScript(({name,email})=>{localStorage.setItem('fi_forgot_storage_version','2');localStorage.setItem('fi_forgot_data_version','5');localStorage.setItem('fi_forgot_user',JSON.stringify({name,email}));localStorage.setItem('fi_forgot_onboarding','true');localStorage.setItem('fi_forgot_workspaces','[]');},owner);
    page=await context.newPage();page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(20000);
    page.on('pageerror',()=>pageErrors.push('page-error'));
    page.on('response',response=>{const url=new URL(response.url());if(url.origin===origin&&url.pathname.startsWith('/api/'))void evidence.capture(response).catch(()=>{});});
    receipt.phase='recipients-navigation';
    const [sessionResponse,recipientsResponse]=await awaitResponsesForTrigger([
     ()=>page.waitForResponse(r=>new URL(r.url()).pathname==='/api/auth/session'),
     ()=>page.waitForResponse(r=>new URL(r.url()).pathname==='/api/recipients'&&r.request().headers()['x-user-id']===owner.id)
    ],()=>page.goto(origin+'/recipients'));
    assert.equal((await sessionResponse.json()).userId,owner.id);
    const recipients=(await recipientsResponse.json()).recipients;
    assert.deepEqual(recipients.map(r=>r.id).sort(),[...owner.recipientIds].sort());receipt.phase='recipients-hydration';
    await page.waitForFunction(ids=>{try{return ids.every(id=>JSON.parse(localStorage.getItem('fi_forgot_recipients')??'[]').some(r=>r.id===id));}catch{return false;}},owner.recipientIds);
    const paths=['/api/v2/concierge','/api/v2/concierge/opportunity-feedback','/api/v2/concierge/opportunity-follow-through'];
    const awaitCycle=async(trigger,withQuestion=false)=>{
     const responses=await awaitResponsesForTrigger([...paths.map(path=>()=>page.waitForResponse(r=>new URL(r.url()).pathname===path&&r.request().headers()['x-user-id']===owner.id)),...(withQuestion?['fresh','question','health'].map(kind=>()=>page.waitForResponse(r=>questionRequestKind(new URL(r.url()).pathname,owner)===kind&&r.request().headers()['x-user-id']===owner.id)):[])],trigger);
     const captured=await Promise.all(responses.map(response=>evidence.capture(response)));
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     return {workspace:captured[0].body,feedback:captured[1].body,follow:captured[2].body,responseRecords:captured.slice(0,3).map(x=>x.record),question:withQuestion?questionProjection(captured.slice(3),owner,recipients,captured[0].body.insights):null};
    };
    const assertWorkspace=async({workspace,feedback,follow,responseRecords,question},transition)=>{
    assert.equal(workspace.version,1);assert.ok(Array.isArray(workspace.opportunities));
    for(const row of [...workspace.opportunities.map(o=>({recipientId:o.recipient.id})),...workspace.recommendations,...workspace.insights,...feedback.history,...follow.history]){assert.ok(owner.recipientIds.includes(row.recipientId));if('ownerId'in row)assert.equal(row.ownerId,owner.id);}
    // This first workflow deliberately requires observed opportunities. A legacy
    // fallback/empty-only result is recorded as failed, never relabeled qualified.
    assert.ok(workspace.opportunities.length>0);
    const expected=presented(workspace.opportunities),section=page.locator('section[aria-labelledby="concierge-recommendations-title"]');
    await section.waitFor({state:'visible'});
    await page.waitForFunction(ids=>JSON.stringify([...document.querySelectorAll('section[aria-labelledby="concierge-recommendations-title"] select[id^="action-state-"]')].map(e=>e.id))===JSON.stringify(ids),expected.map(o=>'action-state-'+o.id));
    await page.waitForFunction(projections=>projections.every(({title,rows})=>{
     const actual=[...document.querySelectorAll('section[aria-labelledby="'+title+'"] > ul > li')];
     return actual.length===rows.length&&actual.every((row,index)=>row.querySelector(':scope > strong')?.textContent===rows[index].heading&&(!rows[index].text||row.querySelector(':scope > span')?.textContent?.includes(rows[index].text)));
    }),[
     {title:'concierge-recommendations-title',rows:expected.map(x=>({heading:x.title,text:x.explanation}))},
     {title:'concierge-feedback-title',rows:current(feedback.history).map(x=>({heading:x.type.replaceAll('_',' ')}))},
     {title:'concierge-follow-through-title',rows:current(follow.history).map(x=>({heading:x.dimension==='action'?'Action report':'Relationship outcome',text:x.value.replaceAll('_',' ')+' (reported by you)'}))}
    ]);
    const rows=section.locator(':scope > ul > li');assert.equal(await rows.count(),expected.length);
    for(let i=0;i<expected.length;i++){const row=rows.nth(i),item=expected[i];assert.equal(await row.locator(':scope > strong').innerText(),item.title);assert.equal(await row.locator(':scope > span').innerText(),item.explanation);const link=row.locator(':scope > a');assert.equal(await link.getAttribute('href'),item.recommendation.href);assert.equal(await link.innerText(),item.recommendation.label);assert.ok((await row.innerText()).includes('Links and clicks do not verify completion or outcomes.'));}
    for(const [title,events,followThrough] of [['concierge-feedback-title',current(feedback.history),false],['concierge-follow-through-title',current(follow.history),true]]){
     const list=page.locator(`section[aria-labelledby="${title}"] > ul > li`);assert.equal(await list.count(),events.length);
     for(let i=0;i<events.length;i++){const event=events[i],row=list.nth(i);assert.equal(await row.locator(':scope > strong').innerText(),followThrough?(event.dimension==='action'?'Action report':'Relationship outcome'):event.type.replaceAll('_',' '));if(followThrough){assert.ok((await row.locator(':scope > span').innerText()).includes(event.value.replaceAll('_',' ')+' (reported by you)'));}}
    }
    assert.ok(question);const questionPanel=page.locator('section[aria-labelledby="concierge-learn-title"]');
    let questionDom;if(question.nextQuestion===null){await page.waitForFunction(()=>!document.querySelector('section[aria-labelledby="concierge-learn-title"]'));questionDom={claim:'panel-presence-only',state:'absent',recipientId:question.recipientId};}else{await questionPanel.waitFor({state:'visible'});const heading=questionPanel.locator('#fi-concierge-question-title');await heading.waitFor({state:'visible'});const title=await heading.innerText();assert.ok(title.length>0&&title.length<=4096);const answer=questionPanel.getByRole('textbox',{name:'Your answer about '+question.recipientName,exact:true});const inputCount=await answer.count();assert.ok(inputCount===0||inputCount===1);if(inputCount){await answer.waitFor({state:'visible'});assert.equal(await answer.inputValue(),'');}else assert.equal(title,'I already know enough for now');questionDom={claim:'panel-presence-only',state:inputCount?'answer-control':'no-answer-control',recipientId:question.recipientId,title,answerEmpty:inputCount?true:null};}
    const projection={transition,responseRecords,question,questionDom,presented:expected.map(({id,title,explanation,recommendation})=>({id,title,explanation,recommendation})),feedback:current(feedback.history),followThrough:current(follow.history)};
    const file=stem+'-'+transition+'-assertions.json',bytes=JSON.stringify(projection)+'\n';writeFileSync(join(output,file),bytes,{flag:'wx'});assertions.push({file,sha256:hash(bytes)});
    };
    receipt.phase='search-navigation';const conciergeOption=await prepareConciergeNavigation(page);
    receipt.phase='concierge-navigation';const initial=await awaitCycle(()=>conciergeOption.click(),true);
    receipt.phase='initial-workspace';
    await assertWorkspace(initial,'initial-workspace');
    let finalCycle=initial;
    for(const name of ['Conversation','Workspace']){
     receipt.phase=name==='Conversation'?'conversation-tab':'workspace-tab';
     finalCycle=await awaitCycle(()=>page.getByRole('tablist',{name:'Concierge sections'}).getByRole('tab',{name,exact:true}).click(),name==='Workspace');
     const tab=page.getByRole('tablist',{name:'Concierge sections'}).getByRole('tab',{name,exact:true});assert.equal(await tab.getAttribute('aria-selected'),'true');
     const panel=page.getByRole('tabpanel',{name,exact:true});await panel.waitFor({state:'visible'});await page.waitForFunction(()=>document.activeElement?.id==='concierge-main');
     if(name==='Workspace')await assertWorkspace(finalCycle,'returned-workspace');
     else{await panel.getByRole('log').waitFor({state:'visible'});await panel.getByRole('textbox').waitFor({state:'visible'});assert.equal(await panel.locator('article').count(),0);}
     const file=stem+'-'+name.toLowerCase()+'.aria.txt',bytes=await panel.ariaSnapshot();writeFileSync(join(output,file),bytes,{flag:'wx'});assertions.push({file,sha256:hash(bytes),responseRecords:finalCycle.responseRecords});
    }
    receipt.phase='final-artifacts';
    const screen=join(output,stem+'.png'),ax=join(output,stem+'.aria.txt');
    await page.screenshot({path:screen,fullPage:true});writeFileSync(ax,await page.locator('#concierge-main').ariaSnapshot(),{flag:'wx'});
    await evidence.drain();assert.deepEqual(pageErrors,[]);assert.deepEqual(denied,[]);
    // Close first: late response/page handlers remain attached until closure. Then
    // drain a growing queue rather than a snapshot of pending promises.
    await context.close();await evidence.drain();await stop();stop=undefined;
    assert.deepEqual(pageErrors,[]);assert.deepEqual(denied,[]);
    receipt.owners.push({id:owner.id,observedOpportunityCount:finalCycle.workspace.opportunities.length,presentedIds:presented(finalCycle.workspace.opportunities).map(x=>x.id),feedbackCount:current(finalCycle.feedback.history).length,followThroughCount:current(finalCycle.follow.history).length,responses:evidence.records,assertions,screenshotHash:hash(readFileSync(screen)),accessibilityHash:hash(readFileSync(ax)),denied,pageErrors});

   }catch(error){ownerError=error;receipt.failure=await captureFailureDiagnostics({page,output,stem,phase:receipt.phase,error});throw error;}finally{
    const cleanupFailures=await cleanupOwner(ownerError,[()=>context.close(),()=>evidence.drain(),async()=>{if(stop)await stop();stop=undefined;}]);
    if(cleanupFailures.length)receipt.ownerCleanupFailures=cleanupFailures;
   }
  }
  await browser.close();browser=undefined;receipt.phase='snapshot-reassert';await reassertSnapshot();assert.equal(hash(readFileSync(durablePath)),before);receipt.durableEvidenceHash=before;
  receipt.teardown=await verifyTeardown();assert.ok(receipt.teardown.chromeProcesses===0&&receipt.teardown.frontendPortReleased===true);
  receipt.success=true;delete receipt.activeOwner;receipt.phase='complete';
 }catch(error){primaryError=error;receipt.success=false;receipt.failure??={phase:receipt.phase,errorKind:errorKind(error)};throw error;}finally{
  await finishBrowserReceipt({receipt,output,primaryError,cleanup:[async()=>{if(browser)await browser.close();},async()=>{if(stop)await stop();}]});
 }
 return receipt;
}
