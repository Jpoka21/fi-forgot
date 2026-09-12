import {admittedApi,origin} from './policy.mjs';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {hash} from './server.mjs';
/** One immutable file per response object; never index by replaceable URL alone. */
export function responseEvidence(output,stem,errors,owner){
 const seen=new Map(),pending=[],records=[];let bytesSeen=0;
 const capture=response=>{
  if(seen.has(response))return seen.get(response);
  const sequence=seen.size+1;
  const task=(async()=>{
   if(sequence>128)throw Error('response count bound');
   const bytes=await response.body();bytesSeen+=bytes.length;
   if(bytes.length>4*1024*1024||bytesSeen>32*1024*1024||response.status()!==200)throw Error('response bound/status');
   const body=JSON.parse(bytes),url=new URL(response.url()),request=response.request();if(url.origin!==origin||url.search||!admittedApi(request.method(),url.pathname,request.headers(),request.postData()??'',owner))throw Error('response request identity');
   const record=Object.freeze({sequence,path:url.pathname,method:request.method(),requestOwnerId:request.method()==='GET'?owner.id:null,bodyHash:hash(bytes),artifact:`${stem}-response-${sequence}.json`});
   // JSON envelope preserves the exact bounded body bytes as UTF8 text plus its hash.
   const envelope=JSON.stringify({...record,bodyUtf8:bytes.toString('utf8')})+'\n';
   writeFileSync(join(output,record.artifact),envelope,{flag:'wx'});
   const item=Object.freeze({...record,artifactHash:hash(envelope)});records.push(item);
   return {body,record:item};
  })();
  seen.set(response,task);pending.push(task.catch(()=>{errors.push('api-response-failure');}));return task;
 };
 async function drain(){let drained=0;while(drained<pending.length){const batch=pending.slice(drained);drained=pending.length;await Promise.all(batch);}}
 return {capture,drain,records};
}
