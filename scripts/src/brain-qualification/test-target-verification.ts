import assert from 'node:assert/strict';
// @ts-ignore Node built-in stripping uses runtime extensions.
import {TARGET} from './plan.ts';
// @ts-ignore Node built-in stripping uses runtime extensions.
import {parseQualificationAdminDatabaseUrl,parseQualificationDatabaseUrl,assertObservedQualificationTarget,withVerifiedQualificationTarget} from './target-verification.ts';
// A synthetic string used only by this pure test, never supplied to PostgreSQL.
const url=`postgresql://${TARGET.role}:synthetic-test-only@${TARGET.host}:${TARGET.port}/${TARGET.database}`;
const observed={database:TARGET.database,role:TARGET.role,serverAddress:TARGET.host,serverPort:TARGET.port,serverVersion:160004,dataDirectory:TARGET.pgdata};
assert.equal(parseQualificationDatabaseUrl(url).host,TARGET.host);assertObservedQualificationTarget(observed);
const adminUrl=`postgresql://${TARGET.adminRole}:synthetic-test-only@${TARGET.host}:${TARGET.port}/postgres`;assert.equal(parseQualificationAdminDatabaseUrl(adminUrl).user,TARGET.adminRole);for(const invalid of[adminUrl.replace('/postgres','/'+TARGET.database),adminUrl.replace(TARGET.adminRole,TARGET.role),adminUrl+'?sslmode=require'])assert.throws(()=>parseQualificationAdminDatabaseUrl(invalid),/FAIL_CLOSED/);
for(const invalid of [undefined,'not a URL',url.replace('127.0.0.1','localhost'),url.replace('55432','5432'),url.replace('/'+TARGET.database,'/postgres'),url.replace(TARGET.role,'other_role'),url+'?host=example.invalid',url+'?sslmode=require',url+'#fragment'])assert.throws(()=>parseQualificationDatabaseUrl(invalid),/FAIL_CLOSED/);
let inspected=0,writes=0;
const input={databaseUrl:url,artifactHashesVerified:true,ownedDirectoryVerified:true};
const inspect=async()=>{inspected++;return observed;},write=async()=>{writes++;return 'done';};
assert.equal(await withVerifiedQualificationTarget(input,inspect,write),'done');assert.equal(writes,1);
for(const bad of [null,{}, {...observed,database:'postgres'},{...observed,role:TARGET.adminRole},{...observed,serverAddress:'192.0.2.1'},{...observed,serverPort:5432},{...observed,serverVersion:170000},{...observed,dataDirectory:'C:/unknown'}]){
  const before:number=writes;await assert.rejects(withVerifiedQualificationTarget(input,async()=>bad,write),/FAIL_CLOSED/);assert.equal(writes,before);
}
for(const bad of [{...input,artifactHashesVerified:false},{...input,ownedDirectoryVerified:false},{...input,databaseUrl:url+'?host=example.invalid'}]){
  const before:number=inspected;await assert.rejects(withVerifiedQualificationTarget(bad,inspect,write),/FAIL_CLOSED/);assert.equal(inspected,before);assert.equal(writes,1);
}
await assert.rejects(withVerifiedQualificationTarget(input,async()=>{throw new Error('unverifiable')},write),/unverifiable/);assert.equal(writes,1);
console.log('Target verification PASS: approved synthetic identity; host/port/database/role/options/identity/directory/hash failures cause zero writes; no connection');
