import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createRequire} from 'node:module';
import {verifyExistingOwners,reassertSnapshot,afterRestartCommand,OWNER_IDENTITY_SQL,OWNER_QUERY_SQL} from './integration-adapters.mjs';
import {TARGET,EXACT_AUTHORIZATION} from '../plan.ts';
// Read production table metadata, without creating a pool or connecting to a DB.
const dbRequire=createRequire(new URL('../../../../lib/db/package.json',import.meta.url));
const {getTableName,getTableColumns}=dbRequire('drizzle-orm');
const {usersTable}=await import(new URL('../../../../lib/db/src/schema/users.ts',import.meta.url).href);
const columns=getTableColumns(usersTable);
assert.equal(OWNER_QUERY_SQL,`select ${columns.id.name},${columns.email.name},${columns.name.name} from public.${getTableName(usersTable)} where ${columns.email.name} = ANY($1::text[])`);
const secret='synthetic-test-secret-only',databaseUrl=`postgresql://${TARGET.role}:${secret}@127.0.0.1:55432/${TARGET.database}`;
const owners=[{id:'fixture-a',email:'a@qualification.invalid',name:'A'},{id:'fixture-b',email:'b@qualification.invalid',name:'B'}];
for(const mode of ['good','wrong-address','wrong-role','wrong-encoding','missing','mismatch','not-read-only','query-error','rollback-error']){
 const calls=[];let config;
 class Pool{constructor(options){config=options;}async connect(){return {query:async(sql,parameters)=>{calls.push(sql);assert.ok(['BEGIN READ ONLY','ROLLBACK',OWNER_IDENTITY_SQL,OWNER_QUERY_SQL].includes(sql));assert.ok(!/\b(insert|update|delete|commit)\b/i.test(sql));if(sql==='ROLLBACK'&&mode==='rollback-error')throw Error(secret);if(sql===OWNER_IDENTITY_SQL)return {rows:[{database:TARGET.database,role:mode==='wrong-role'?'wrong':TARGET.role,address:mode==='wrong-address'?'127.0.0.2':TARGET.host,port:55432,version:'160015',encoding:mode==='wrong-encoding'?'WIN1252':'UTF8',read_only:mode==='not-read-only'?'off':'on'}]};if(sql===OWNER_QUERY_SQL){assert.deepEqual(parameters,[owners.map(x=>x.email)]);assert.ok(!sql.includes(owners[0].email));if(mode==='query-error')throw Error(secret);return {rows:mode==='missing'?owners.slice(0,1):mode==='mismatch'?[owners[0],{...owners[1],id:'wrong'}]:[...owners].reverse()};}return {rows:[]};},release:destroy=>{assert.equal(destroy,true);calls.push('release');}};}async end(){calls.push('end');}}
 if(mode==='good')assert.deepEqual(await verifyExistingOwners({databaseUrl,owners},{Pool}),owners);
 else await assert.rejects(verifyExistingOwners({databaseUrl,owners},{Pool}),error=>String(error).includes('FAIL_CLOSED')&&!String(error).includes(secret));
 assert.equal(config.options,'-c default_transaction_read_only=on -c statement_timeout=10000 -c lock_timeout=3000');assert.deepEqual(calls.slice(-3),['ROLLBACK','release','end']);
 if(mode.startsWith('wrong-')||mode==='not-read-only')assert.ok(!calls.includes(OWNER_QUERY_SQL));
}
let connected=0;await assert.rejects(verifyExistingOwners({databaseUrl:databaseUrl.replace('55432','5432'),owners},{Pool:class{constructor(){connected++;}}}));assert.equal(connected,0);
const env={DATABASE_URL:databaseUrl,BRAIN_QUALIFICATION_OWNER_AUTHORIZATION:EXACT_AUTHORIZATION,BRAIN_QUALIFICATION_SYNTHETIC_RUN_DATE:'2031-04-05',PGPASSWORD:'admin-secret',BRAIN_QUALIFICATION_ADMIN_DATABASE_URL:'postgresql://admin-secret',BRAIN_QUALIFICATION_ADMIN_PASSWORD:'admin-secret',BRAIN_QUALIFICATION_APP_PASSWORD:'extra-app-secret',NODE_OPTIONS:'--require evil',ARBITRARY_SECRET:'secret'};
const command=afterRestartCommand(env);assert.deepEqual(command.args.slice(-2),['assert','--after-restart']);assert.ok(!command.args.includes('load'));assert.ok(!JSON.stringify(command.args).includes(secret));for(const key of ['PGPASSWORD','BRAIN_QUALIFICATION_ADMIN_DATABASE_URL','BRAIN_QUALIFICATION_ADMIN_PASSWORD','BRAIN_QUALIFICATION_APP_PASSWORD','NODE_OPTIONS','ARBITRARY_SECRET'])assert.equal(command.options.env[key],undefined);assert.equal(command.options.env.DATABASE_URL,databaseUrl);assert.deepEqual(command.options.stdio,['ignore','ignore','ignore']);
for(const mode of ['success','exit-failure','error','throw','timeout']){
 const timers=[],child=new EventEmitter();child.pid=123;
 const run=reassertSnapshot(env,{spawn(){if(mode==='throw')throw Error(secret);queueMicrotask(()=>{if(mode==='timeout')timers[0]();else if(mode==='error')child.emit('error',Error(secret));else child.emit('exit',mode==='success'?0:1,null);});return child;},terminateTree:async pid=>{assert.equal(pid,123);child.emit('exit',null,'SIGKILL')},setTimeout(callback,ms){assert.ok(ms===300000||ms===6000);timers.push(callback);return timers.length;},clearTimeout(){}});
 if(mode==='success')await run;else await assert.rejects(run,error=>String(error).includes('FAIL_CLOSED')&&!String(error).includes(secret));
}
console.log('Draft real-adapter logic PASS with fake PostgreSQL and child responses; no connection/process/browser/server started');

