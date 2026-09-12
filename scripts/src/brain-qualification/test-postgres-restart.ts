import assert from 'node:assert/strict';
// @ts-ignore Native runtime extension.
import {provePostgresRestart,finalizePostgresRestart,type RestartAdapter} from './postgres-restart.ts';
// @ts-ignore Native runtime extension.
import {TARGET,buildPlan} from './plan.ts';
const nonce='00000000-0000-0000-0000-000000000001',session='00000000-0000-0000-0000-000000000002',digest='a'.repeat(64);
function fixture(change=''){
 let observations=0,hashes=0;const calls:string[]=[];
 const adapter:RestartAdapter={
  identity(){calls.push('identity');const after=observations++>0;return {database:'postgres',role:TARGET.adminRole,address:change==='address'?'192.0.2.1':TARGET.host,port:TARGET.port,version:after&&change==='version'?'160016':'160015',encoding:change==='encoding'?'WIN1252':'UTF8',dataDirectory:change==='directory'?'C:/wrong':TARGET.pgdata,systemIdentifier:change==='zero-id'?'0':after&&change==='system-id'?'222':'111',postmasterStart:after&&change!=='same-start'?'2031-04-05T12:00:01.000Z':'2031-04-05T12:00:00.000Z'};},
  ownership(){calls.push('ownership');return {path:TARGET.pgdata,marker:change==='marker'?'unknown':'fi-forgot-brain-qualification-owned-v1\n',major:'16'};},
  snapshotHash(){calls.push('snapshot');return hashes++>0&&change==='snapshot'?'b'.repeat(64):digest;},
  stop(){calls.push('stop');if(change==='stop-failure')throw Error('stop failed');},
  status(){calls.push('status');return change==='still-running'?0:3;},
  async assertPortReleased(){calls.push('port-free');if(change==='occupied')throw Error('occupied');},
  start(){calls.push('start');if(change==='start-failure')throw Error('start failed');},
 };return {adapter,calls};
}
const valid=fixture(),proof=await provePostgresRestart(valid.adapter,nonce,session);
assert.deepEqual(valid.calls,['ownership','identity','snapshot','stop','status','port-free','ownership','start','identity','ownership','snapshot']);
assert.equal(proof.beforeSystemIdentifier,proof.afterSystemIdentifier);assert.notEqual(proof.beforePostmasterStart,proof.afterPostmasterStart);assert.equal(proof.stoppedStatusExit,3);assert.equal(proof.durableEvidenceHash,digest);
assert.throws(()=>finalizePostgresRestart(proof,false,digest));assert.throws(()=>finalizePostgresRestart(undefined,true,digest));assert.throws(()=>finalizePostgresRestart(proof,true,'b'.repeat(64)));
const final=finalizePostgresRestart(proof,true,digest);assert.equal(final.persistenceAssertionsPassed,true);assert.equal(final.sessionId,session);assert.equal(final.nonce,nonce);
for(const change of ['encoding','address','directory','marker','zero-id','stop-failure','still-running','occupied','start-failure','system-id','same-start','version','snapshot']){const f=fixture(change);await assert.rejects(provePostgresRestart(f.adapter,nonce,session));if(['encoding','address','directory','marker','zero-id'].includes(change))assert.ok(!f.calls.includes('stop'));if(['stop-failure','still-running','occupied'].includes(change))assert.ok(!f.calls.includes('start'));}
for(const [a,b] of [[undefined,session],[nonce,undefined],['wrong',session],[nonce,'wrong']]){const f=fixture();await assert.rejects(provePostgresRestart(f.adapter,a,b));assert.deepEqual(f.calls,[]);}
const plan=buildPlan(),phases=plan.map(c=>c.phase);assert.equal(phases[phases.indexOf('stop-api')+1],'restart-postgres');assert.equal(phases[phases.indexOf('restart-postgres')+1],'restart-api');assert.equal(phases[phases.indexOf('assert-after-restart')+1],'record-postgres-restart-proof');assert.equal(phases.filter(p=>p==='fixtures').length,1);assert.ok(phases.indexOf('fixtures')<phases.indexOf('restart-postgres'));
console.log('PostgreSQL restart admission/order/stopped-port/cluster-identity/start-time/snapshot/assertion binding PASS (synthetic adapter only; no database)');
