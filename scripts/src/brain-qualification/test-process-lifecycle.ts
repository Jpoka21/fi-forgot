import assert from 'node:assert/strict';
// @ts-ignore Explicit extension for built-in type stripping.
import {stopManagedProcess,waitForReadiness} from './process-lifecycle.ts';
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
console.log('Readiness, graceful/forced shutdown and port failure sequencing PASS (fake process only)');
