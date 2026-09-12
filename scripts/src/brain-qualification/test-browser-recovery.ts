import assert from 'node:assert/strict';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
// @ts-ignore Native type stripping runtime extension.
import {createSystemExecutionAdapter} from './execution.ts';
// @ts-ignore Native type stripping runtime extension.
import {buildPlan} from './plan.ts';
const originalApp=process.env.BRAIN_QUALIFICATION_APP_PASSWORD;
const originals={existsSync:fs.existsSync,rmSync:fs.rmSync,realpathSync:fs.realpathSync};
process.env.BRAIN_QUALIFICATION_APP_PASSWORD='synthetic-only-app-password-123';
try{
 for(const outcome of ['exit-failure','timeout','spawn-throw','missing-credential']){
  let spawnCalls=0,filesystemCalls=0;let exercised="";
  const adapter=createSystemExecutionAdapter({spawnSync:((program:string)=>{spawnCalls++;assert.equal(program,process.execPath);exercised=outcome;if(outcome==='spawn-throw')throw Error('fake spawn failure');return outcome==='timeout'?{status:null,error:Object.assign(Error('fake timeout'),{code:'ETIMEDOUT'})}:{status:1};}) as any});
  if(outcome==='missing-credential')delete process.env.BRAIN_QUALIFICATION_APP_PASSWORD;
  await assert.rejects(async()=>adapter.run(buildPlan().find(c=>c.phase==='browser-workflow')!));
  process.env.BRAIN_QUALIFICATION_APP_PASSWORD='synthetic-only-app-password-123';
  // Any target inspection/removal or PG subprocess during recovery is a defect.
  for(const key of ['existsSync','rmSync','realpathSync'] as const)(fs as any)[key]=()=>{filesystemCalls++;throw Error('unexpected recovery filesystem action');};
  syncBuiltinESMExports();
  try{for(const completed of [[],['initialize-cluster','mark-owned-cluster']])await assert.rejects(async()=>adapter.recover!(completed),/preserve PGDATA; stop exact owned Windows Sandbox and verify session absence/);}
  finally{Object.assign(fs,originals);syncBuiltinESMExports();}
  assert.equal(filesystemCalls,0);assert.equal(spawnCalls,outcome==='missing-credential'?0:1);assert.equal(exercised,outcome==='missing-credential'?'':outcome);
 }
}finally{Object.assign(fs,originals);syncBuiltinESMExports();if(originalApp===undefined)delete process.env.BRAIN_QUALIFICATION_APP_PASSWORD;else process.env.BRAIN_QUALIFICATION_APP_PASSWORD=originalApp;}
console.log('Browser failure/timeout recovery preserves target without PG or filesystem actions: PASS (fake subprocesses only)');
