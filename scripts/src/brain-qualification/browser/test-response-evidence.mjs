import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,sep} from 'node:path';
import {responseEvidence} from './response-evidence.mjs';
import {hash} from './server.mjs';
const root=realpathSync(fileURLToPath(new URL('.',import.meta.url))),directory=mkdtempSync(join(root,'test-evidence-'));
const response=body=>({body:async()=>Buffer.from(body),status:()=>200,url:()=> 'http://127.0.0.1:25460/api/v2/concierge',request:()=>({method:()=> 'GET',headers:()=>({'x-user-id':'owner'}),postData:()=>null})});
try{
 const errors=[],e=responseEvidence(directory,'owner',errors,{id:'owner'}),first=response('{"version":1}'),second=response('{"version":2}');
 const a=await e.capture(first);assert.equal(await e.capture(first),a);const b=await e.capture(second);assert.notEqual(a.record.artifact,b.record.artifact);assert.notEqual(a.record.bodyHash,b.record.bodyHash);
 const bytes=readFileSync(join(directory,a.record.artifact));assert.equal(hash(bytes),a.record.artifactHash);const envelope=JSON.parse(bytes);assert.equal(hash(envelope.bodyUtf8),a.record.bodyHash);assert.equal(JSON.parse(envelope.bodyUtf8).version,1);
 let release;const delayed={...response('{}'),body:()=>new Promise(resolve=>release=resolve)};void e.capture(delayed);const drain=e.drain();const late=e.capture(response('{"late":true}'));release(Buffer.from('{}'));await drain;await late;assert.equal(e.records.length,4);assert.deepEqual(errors,[]);
 await assert.rejects(e.capture(response('x'.repeat(4*1024*1024+1))));await e.drain();assert.deepEqual(errors,['api-response-failure']);assert.equal(e.records.length,4);
 console.log('Draft immutable response identity/hash/size-bound/growing-drain tests PASS; synthetic response objects only');
}finally{const target=realpathSync(directory);assert.ok(target.startsWith(root+sep));rmSync(target,{recursive:true});}
