import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseQualificationDatabaseUrl} from '../target-verification.ts';
import {assertPostgresIdentity} from '../postgres-identity.ts';
import {buildPlan,EXACT_AUTHORIZATION} from '../plan.ts';
const root=resolve(fileURLToPath(new URL('../../../..',import.meta.url)));
export const OWNER_IDENTITY_SQL="select current_database() as database,current_user as role,host(inet_server_addr()) as address,inet_server_port() as port,current_setting('server_version_num') as version,current_setting('server_encoding') as encoding,current_setting('transaction_read_only') as read_only";
export const OWNER_QUERY_SQL='select id,email,name from public.fi_users where email = ANY($1::text[])';
/** Real app-role read, with explicit connection and transaction read-only barriers. */
export async function verifyExistingOwners({databaseUrl,owners},dependencies={}){
 let pool,client,failed=false,rows;
 try{
  const connection=parseQualificationDatabaseUrl(databaseUrl);
  if(owners.length!==2||new Set(owners.map(x=>x.email)).size!==2||owners.some(x=>!x.email.endsWith('@qualification.invalid')))throw Error('fixture owner boundary');
  const Pool=dependencies.Pool??createRequire(resolve(root,'lib/db/package.json'))('pg').Pool;
  pool=new Pool({...connection,max:1,connectionTimeoutMillis:10000,query_timeout:10000,options:'-c default_transaction_read_only=on -c statement_timeout=10000 -c lock_timeout=3000'});
  client=await pool.connect();
  await client.query('BEGIN READ ONLY');
  const observed=(await client.query(OWNER_IDENTITY_SQL)).rows[0];
  assertPostgresIdentity(observed,false);if(observed?.read_only!=='on')throw Error('read-only observation');
  const result=await client.query(OWNER_QUERY_SQL,[owners.map(x=>x.email)]);
  if(result.rows.length!==owners.length)throw Error('existing owner missing');
  rows=owners.map(owner=>{const found=result.rows.filter(row=>row.id===owner.id&&row.email===owner.email&&row.name===owner.name);if(found.length!==1)throw Error('existing owner mismatch');return {id:found[0].id,email:found[0].email,name:found[0].name};});
 }catch{failed=true;}finally{
  if(client){try{await client.query('ROLLBACK');}catch{failed=true;}finally{try{client.release(true);}catch{failed=true;}}}
  if(pool)try{await pool.end();}catch{failed=true;}
 }
 // Never export raw pg errors, SQL error objects, URL or credentials.
 if(failed)throw Error('FAIL_CLOSED: browser existing-owner read failed');
 return rows;
}
export function afterRestartCommand(env){
 parseQualificationDatabaseUrl(env.DATABASE_URL);
 if(env.BRAIN_QUALIFICATION_OWNER_AUTHORIZATION!==EXACT_AUTHORIZATION||!/^\d{4}-\d{2}-\d{2}$/.test(env.BRAIN_QUALIFICATION_SYNTHETIC_RUN_DATE??''))throw Error('FAIL_CLOSED: browser assertion authority/date missing');
 const command=buildPlan(root).find(x=>x.phase==='assert-after-restart');
 const childEnv={};for(const key of ['SystemRoot','WINDIR','COMSPEC'])if(env[key])childEnv[key]=env[key];
 Object.assign(childEnv,command.env,{DATABASE_URL:env.DATABASE_URL,BRAIN_QUALIFICATION_OWNER_AUTHORIZATION:EXACT_AUTHORIZATION,BRAIN_QUALIFICATION_SYNTHETIC_RUN_DATE:env.BRAIN_QUALIFICATION_SYNTHETIC_RUN_DATE,BRAIN_QUALIFICATION_MODE:'true'});
 return {program:command.program,args:[...command.args],options:{cwd:root,env:childEnv,stdio:['ignore','ignore','ignore'],shell:false}};
}
/** Terminate only the just-spawned Windows assertion process and its descendants. */
export async function terminateOwnedWindowsTree(pid,dependencies={}){
 if(!Number.isInteger(pid)||pid<=0)throw Error('FAIL_CLOSED: invalid owned assertion process');
 const run=dependencies.spawn??spawn;
 await new Promise((ok,no)=>{
  let killer,timer,done=false;
  const finish=passed=>{if(done)return;done=true;clearTimeout(timer);passed?ok():no(Error('FAIL_CLOSED: owned assertion tree teardown failed'));};
  try{killer=run('C:/Windows/System32/taskkill.exe',['/PID',String(pid),'/T','/F'],{stdio:'ignore',shell:false,windowsHide:true});killer.once('error',()=>finish(false));killer.once('exit',code=>finish(code===0));timer=setTimeout(()=>{try{killer.kill('SIGKILL')}catch{}finish(false)},5000)}catch{finish(false)}
 });
}
/** Uses the exact existing assertion phase, no loader or mutation replay. */
export async function reassertSnapshot(env=process.env,dependencies={}){
 const command=afterRestartCommand(env),run=dependencies.spawn??spawn;
 const setTimer=dependencies.setTimeout??setTimeout,clearTimer=dependencies.clearTimeout??clearTimeout;
 await new Promise((resolveDone,reject)=>{
  let child,timer,killTimer,done=false,timedOut=false;
  const finish=ok=>{if(done)return;done=true;clearTimer(timer);clearTimer(killTimer);ok?resolveDone():reject(Error('FAIL_CLOSED: browser after-restart assertion failed'));};
  try{
   child=run(command.program,command.args,command.options);
   child.on('error',()=>finish(false));
   child.once('exit',(code,signal)=>{if(!timedOut)finish(code===0&&signal===null)});
   timer=setTimer(()=>{timedOut=true;killTimer=setTimer(()=>finish(false),6000);Promise.resolve().then(()=>(dependencies.terminateTree??terminateOwnedWindowsTree)(child.pid)).then(()=>finish(false),()=>finish(false));},300000);
  }catch{finish(false);}
 });
}

