import assert from 'node:assert/strict';
// @ts-ignore Native runtime extension.
import {recoverOwnedPostgres} from './postgres-recovery.ts';
// @ts-ignore Native runtime extension.
import {TARGET} from './plan.ts';
for(const mode of ['running','stopped','wrong-path','wrong-marker','wrong-major','unknown','timeout','stop-failed','still-running','port-occupied','api-failed','ownership-drift']){
 const calls:string[]=[];let checks=0,statuses=0;
 const adapter={ownership(){calls.push('ownership');checks++;return {path:mode==='wrong-path'?'C:/wrong':TARGET.pgdata,marker:mode==='wrong-marker'||(mode==='ownership-drift'&&checks===2)?'wrong':'fi-forgot-brain-qualification-owned-v1\n',major:mode==='wrong-major'?'15':'16'};},status(){calls.push('status');return mode==='unknown'?4:mode==='timeout'?-1:mode==='still-running'?0:statuses++===0&&mode!=='stopped'?0:3;},stop(){calls.push('stop');if(mode==='stop-failed')throw Error('synthetic stop failure');},async portReleased(){calls.push('port');return mode!=='port-occupied';},remove(){calls.push('remove');}};
 if(mode==='running'||mode==='stopped'){await recoverOwnedPostgres(adapter,true);assert.equal(calls.at(-1),'remove');assert.equal(calls.includes('stop'),mode==='running');}
 else{await assert.rejects(recoverOwnedPostgres(adapter,mode!=='api-failed'));assert.ok(!calls.includes('remove'));if(mode.startsWith('wrong-')||mode==='unknown'||mode==='timeout')assert.ok(!calls.includes('stop'));if(mode==='api-failed')assert.ok(calls.includes('stop')&&calls.includes('port'));}
}
console.log('Observed owned PostgreSQL recovery running/stopped/unknown/failure tests PASS (no database)');
