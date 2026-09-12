import assert from 'node:assert/strict';
// @ts-ignore Explicit extension for built-in type stripping.
import {stopManagedProcess,waitForReadiness} from './process-lifecycle.ts';
// @ts-ignore Native runtime extension.
import {observeManagedChild,requestManagedChildStop} from './process-lifecycle.ts';
import {spawn} from 'node:child_process';
import {EventEmitter} from 'node:events';
for(const mode of ['exited','callback-error','throw','late-error']){
 const child=Object.assign(new EventEmitter(),{exitCode:mode==='exited'?0:null,signalCode:null,connected:true,kills:0,kill(){this.kills++;return true;},send(_message:string,callback:(error:Error|null)=>void){if(mode==='throw')throw Error('EPIPE');callback(mode==='callback-error'?Error('EPIPE'):null);}});
 observeManagedChild(child as any);requestManagedChildStop(child as any);child.emit('error',Error('late EPIPE'));
 assert.equal(child.kills,mode==='callback-error'||mode==='throw'?1:0);
}
// Actual child exits while the parent cannot process its exit/IPC events.
const nativeChild=spawn(process.execPath,['-e','process.exit(0)'],{stdio:['ignore','ignore','ignore','ipc']});
observeManagedChild(nativeChild);await new Promise<void>((resolve,reject)=>{nativeChild.once('spawn',resolve);nativeChild.once('error',reject);});
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,350);
requestManagedChildStop(nativeChild);
await new Promise<void>((resolve,reject)=>{if(nativeChild.exitCode!==null)return resolve();const timer=setTimeout(()=>reject(Error('native child exit timeout')),5000);nativeChild.once('exit',()=>{clearTimeout(timer);resolve();});});
for(const graceful of [true,false]){
  const events:string[]=[];let waits=0;
  await stopManagedProcess({requestGracefulStop(){events.push('graceful');},async waitForExit(){events.push('wait');return graceful||++waits===2;},forceStop(){events.push('force');},async assertPortReleased(){events.push('port');}});
  assert.deepEqual(events,graceful?['graceful','wait','port']:['graceful','wait','force','wait','port']);
}
let portChecked=false;
await assert.rejects(()=>stopManagedProcess({requestGracefulStop(){},async waitForExit(){return false;},forceStop(){},async assertPortReleased(){portChecked=true;}}),/did not terminate/);
assert.equal(portChecked,false);
await assert.rejects(()=>stopManagedProcess({requestGracefulStop(){},async waitForExit(){return true;},forceStop(){throw new Error('unexpected');},async assertPortReleased(){throw new Error('port occupied');}}),/port occupied/);
let probes=0;await waitForReadiness(async()=>++probes===3,async()=>{},4);assert.equal(probes,3);
await assert.rejects(()=>waitForReadiness(async()=>false,async()=>{},2),/readiness timed out/);
console.log('Readiness, graceful/forced shutdown and port failure sequencing PASS (synthetic sequencing plus real exited-child IPC race; no database)');
