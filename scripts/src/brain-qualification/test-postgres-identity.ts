import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// @ts-ignore Native runtime extension.
import {assertPostgresIdentity} from './postgres-identity.ts';
// @ts-ignore Native runtime extension.
import {TARGET} from './plan.ts';
const admin={database:'postgres',role:TARGET.adminRole,address:TARGET.host,port:TARGET.port,version:'160015',dataDirectory:TARGET.pgdata,encoding:'UTF8'};
const app={...admin,database:TARGET.database,role:TARGET.role};
for(const [identity,isAdmin] of [[admin,true],[app,false]] as const){
 assert.doesNotThrow(()=>assertPostgresIdentity(identity,isAdmin));
 for(const bad of [{database:'wrong'},{role:'wrong'},{address:'127.0.0.1/32'},{address:'localhost'},{address:'192.0.2.1'},{port:5432},{version:'NaN'},{version:'170000'},{version:'159999'},{version:160015},{encoding:'WIN1252'},...(isAdmin?[{dataDirectory:'C:/wrong'}]:[])]){
  let writes=0;assert.throws(()=>{assertPostgresIdentity({...identity,...bad},isAdmin);writes++;},/FAIL_CLOSED/);assert.equal(writes,0);
 }
 assert.throws(()=>assertPostgresIdentity(undefined,isAdmin),/FAIL_CLOSED/);
 const secret='secret-should-never-appear';
 assert.throws(()=>assertPostgresIdentity({database:secret,role:secret,address:secret,port:secret,version:secret,dataDirectory:secret,encoding:secret},isAdmin),(error:unknown)=>!String(error).includes(secret)&&String(error).includes('"address":false')&&String(error).includes('"encoding":false'));
}
// Verify each real query uses the documented host representation and observes UTF8.
for(const file of ['execution.ts','future-workflow.ts']){
 const source=readFileSync(new URL(file,import.meta.url),'utf8');assert.ok(!source.includes('inet_server_addr()::text'));
 const expected=file==='future-workflow.ts'?4:2; // Includes decay and question-state snapshot connections.
 assert.equal(source.split('host(inet_server_addr())').length-1,expected);
 assert.equal(source.split("current_setting('server_encoding')").length-1,expected);
}
console.log('PostgreSQL exact identity/encoding, before-write rejection and nonsecret diagnostics PASS (no database)');
