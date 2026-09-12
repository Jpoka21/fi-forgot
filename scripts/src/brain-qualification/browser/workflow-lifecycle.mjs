import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {hash} from './server.mjs';
import {origin} from './policy.mjs';
/** Attach rejection handlers before the trigger can yield. A trigger failure remains
 * primary even if concurrently armed, bounded Playwright waiters time out first. */
export async function awaitResponsesForTrigger(starters,trigger){
 const waiters=starters.map(start=>{try{return Promise.resolve(start());}catch(error){return Promise.reject(error);}});
 const settled=Promise.allSettled(waiters);let triggerError,triggerFailed=false;
 try{await trigger();}catch(error){triggerError=error;triggerFailed=true;}
 const results=await settled;if(triggerFailed)throw triggerError;
 const failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;
 return results.map(r=>r.value);
}
/** Source-grounded navigation: People uses AppNav (no Concierge anchor); global
 * search renders the existing nav-concierge index entry as an option button. */
export async function prepareConciergeNavigation(page){
 await page.getByRole('button',{name:/^Open search \(/}).click();
 const dialog=page.getByRole('dialog',{name:'Global search',exact:true});await dialog.waitFor({state:'visible'});
 await dialog.getByRole('textbox').fill('Concierge');
 const option=dialog.locator('#nav-concierge[role="option"]');await option.waitFor({state:'visible'});return option;
}
const phases=new Set(['recipients-navigation','recipients-hydration','search-navigation','concierge-navigation','initial-workspace','conversation-tab','workspace-tab','final-artifacts']);
export function errorKind(error){return ['TimeoutError','AssertionError','TypeError','Error'].includes(error?.name)?error.name:'Error';}
export async function captureFailureDiagnostics({page,output,stem,phase,error}){
 const result={phase:phases.has(phase)?phase:'other',errorKind:errorKind(error),page:'unapproved',screenshot:'unavailable',accessibility:'unavailable'};
 if(!page)return result;
 try{const url=new URL(page.url());if(url.origin!==origin||url.search||url.hash||!['/recipients','/people','/concierge'].includes(url.pathname))return result;result.page=url.pathname;}catch{return result;}
 try{const bytes=await page.screenshot({fullPage:false,timeout:5000});if(bytes.length<=2*1024*1024){const file=stem+'-failure.png';writeFileSync(join(output,file),bytes,{flag:'wx'});result.screenshot={file,bytes:bytes.length,sha256:hash(bytes)};}else result.screenshot='size-bound';}catch{result.screenshot='capture-failed';}
 try{const bytes=await page.locator('body').ariaSnapshot({timeout:5000});if(Buffer.byteLength(bytes)<=64*1024){const file=stem+'-failure.aria.txt';writeFileSync(join(output,file),bytes,{flag:'wx'});result.accessibility={file,bytes:Buffer.byteLength(bytes),sha256:hash(bytes)};}else result.accessibility='size-bound';}catch{result.accessibility='capture-failed';}
 return result;
}
export async function finishBrowserReceipt({receipt,output,primaryError,cleanup}){
 const failures=[];for(const close of cleanup)try{await close();}catch(error){failures.push(error);}
 if(failures.length){receipt.success=false;receipt.cleanupFailures=failures.map(errorKind);}
 receipt.completedAt=new Date().toISOString();
 try{writeFileSync(join(output,'browser-receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});}catch(error){if(!primaryError)throw error;}
 if(!primaryError&&failures.length)throw failures[0];
}
export async function cleanupOwner(primaryError,steps){const errors=[];for(const step of steps)try{await step();}catch(error){errors.push(error);}if(!primaryError&&errors.length)throw errors[0];return errors.map(errorKind);}
