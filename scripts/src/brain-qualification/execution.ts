// @ts-ignore Native runtime extension.
import {recoverOwnedPostgres} from './postgres-recovery.ts';
// @ts-ignore Native runtime extension.
import {assertPostgresIdentity} from './postgres-identity.ts';
import { chmodSync, existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import {createServer} from 'node:net';
// @ts-ignore Explicit runtime extension.
import {stopManagedProcess,observeManagedChild,requestManagedChildStop} from './process-lifecycle.ts';
// @ts-ignore Native runtime extension.
import {provePostgresRestart,finalizePostgresRestart} from './postgres-restart.ts';
// @ts-ignore Node built-in type stripping requires runtime extensions.
import { assertExecutionGates, buildPlan, sha256, type GateInput, type PlannedCommand, TARGET } from "./plan.ts";
export function subprocessFailureMetadata(result:{status:number|null;signal?:unknown;error?:unknown}){const code=(result.error as {code?:unknown}|undefined)?.code;return {status:Number.isInteger(result.status)?result.status:null,signal:['SIGTERM','SIGKILL','SIGABRT','SIGSEGV'].includes(String(result.signal))?result.signal:result.signal==null?null:'OTHER',errorCode:result.error?['ETIMEDOUT','ENOENT','EACCES','EPIPE','ENOBUFS'].includes(String(code))?code:'OTHER':null};}
export type TargetInspection={resolvedPgdata:string;targetExists:boolean;parentApproved:boolean;postgresMajor:number;sqlHashesVerified:boolean;baselineHashVerified:boolean;catalogState:"absent"|"unexpected"};
export interface ExecutionAdapter{inspect(root:string):TargetInspection;run(command:PlannedCommand):string|Promise<string>;recover?(completed:readonly string[]):void|Promise<void>;}
export function maySkipPreInitializationRecovery(completed:readonly string[],targetExists:boolean){return !completed.includes("initialize-cluster")&&!targetExists;}
export function assertOwnedCleanupEvidence(e:{resolvedPgdata:string;marker:string;postgresMajor:string;postgresStopped:boolean;portReleased:boolean}){if(e.resolvedPgdata!==TARGET.pgdata||e.marker!=="fi-forgot-brain-qualification-owned-v1\n"||e.postgresMajor.trim()!=="16"||!e.postgresStopped||!e.portReleased)throw new Error("FAIL_CLOSED: independently observed cleanup evidence mismatch");}
export async function executeFutureQualification(input:GateInput,adapter:ExecutionAdapter,root=resolve(import.meta.dirname,"../../..")){if(assertExecutionGates(input)!=="execution-authorized")return;const i=adapter.inspect(root);if(i.resolvedPgdata!==TARGET.pgdata||i.targetExists||!i.parentApproved||i.postgresMajor!==16||!i.sqlHashesVerified||!i.baselineHashVerified||i.catalogState!=="absent")throw new Error("FAIL_CLOSED: observed runtime, artifact hashes, or disposable target state did not match");const completed:string[]=[];try{for(const command of buildPlan(root)){const output=await adapter.run(command);if(command.phase==="identity"&&!output.includes(`${TARGET.database}|${TARGET.role}|16`))throw new Error("FAIL_CLOSED: observed PostgreSQL identity mismatch");completed.push(command.phase);}}catch(error){try{await adapter.recover?.(completed);}catch(recoveryError){throw new AggregateError([error,recoveryError],"Qualification failed; recovery also failed closed",{cause:error});}throw error;}}

export function assertPrivateCredentialBase(path:string){const normalized=path.replaceAll("\\","/").replace(/\/$/,"").toLowerCase();for(const mapped of ["C:/ProbeInput","C:/ProbeOutput",TARGET.pgdata.slice(0,TARGET.pgdata.lastIndexOf("/"))]){const boundary=mapped.toLowerCase();if(normalized===boundary||normalized.startsWith(boundary+"/"))throw new Error("FAIL_CLOSED: credential temporary directory is host-mapped");}}
type SystemExecutionDependencies={spawnSync?:typeof spawnSync;spawn?:typeof spawn;credentialBase?:string};
export function createSystemExecutionAdapter(dependencies:SystemExecutionDependencies={}):ExecutionAdapter{
  const runSync=dependencies.spawnSync??spawnSync,runAsync=dependencies.spawn??spawn;
  let api:ChildProcess|null=null;
  let browserCompletionUnproven=false;
  let postgresLog:string|undefined;
  const privatePostgresLog=()=>{if(postgresLog)return postgresLog;const requested=dependencies.credentialBase??'C:/Windows/Temp',base=realpathSync(requested);if(resolve(base).toLowerCase()!==resolve(requested).toLowerCase())throw Error('FAIL_CLOSED: PostgreSQL log base redirected');assertPrivateCredentialBase(base);const directory=mkdtempSync(join(base,'fi-brain-postgres-log-'));if(process.platform==='win32')sync('icacls',[directory,'/inheritance:r','/grant:r','*S-1-5-18:(OI)(CI)F'],{env:scrubbedEnv(),stdio:['ignore','pipe','pipe']});else chmodSync(directory,0o700);postgresLog=join(directory,'postgres.log');writeFileSync(postgresLog,'',{flag:'wx',mode:0o600});return postgresLog;};
  let restartProof:Awaited<ReturnType<typeof provePostgresRestart>>|undefined,afterRestartAssertionsPassed=false;
  const secret=(name:string)=>{const value=process.env[name];if(!value||value.length<20)throw new Error(`FAIL_CLOSED: process-only credential ${name} missing`);return value;};
  const scrubbedEnv=()=>{const env={...process.env};for(const name of Object.keys(env))if(/^PG/i.test(name)||["DATABASE_URL","BRAIN_QUALIFICATION_ADMIN_DATABASE_URL","BRAIN_QUALIFICATION_ADMIN_PASSWORD","BRAIN_QUALIFICATION_APP_PASSWORD"].includes(name.toUpperCase()))delete env[name];return env;};
  const adminEnv=(c:PlannedCommand)=>({...scrubbedEnv(),...c.env,PGPASSWORD:secret("BRAIN_QUALIFICATION_ADMIN_PASSWORD")});
  const appUrl=()=>`postgresql://${TARGET.role}:${encodeURIComponent(secret("BRAIN_QUALIFICATION_APP_PASSWORD"))}@${TARGET.host}:${TARGET.port}/${TARGET.database}`;
  const appEnv=(c:PlannedCommand,psqlPassword=false)=>({...scrubbedEnv(),...c.env,DATABASE_URL:appUrl(),...(psqlPassword?{PGPASSWORD:secret("BRAIN_QUALIFICATION_APP_PASSWORD")}:{}) ,...(c.phase==="fixtures"?{BRAIN_QUALIFICATION_ADMIN_DATABASE_URL:`postgresql://${TARGET.adminRole}:${encodeURIComponent(secret("BRAIN_QUALIFICATION_ADMIN_PASSWORD"))}@${TARGET.host}:${TARGET.port}/postgres`}:{})});
  const sync=(program:string,args:string[],options:Parameters<typeof spawnSync>[2],timeout=15000)=>{const result=runSync(program,args,{...options,timeout,maxBuffer:1024*1024,shell:false});if(result.error||result.status!==0)throw new Error(`qualification subprocess failed: ${program} ${JSON.stringify(subprocessFailureMetadata(result))}`);return result;};
  return {
    inspect(root){const parent=TARGET.pgdata.slice(0,TARGET.pgdata.lastIndexOf("/")),manifest=JSON.parse(readFileSync(resolve(root,"docs/brain-qualification-preparation/migration-manifest.json"),"utf8"));const version=runSync("postgres",["--version"],{encoding:"utf8",shell:false});return{resolvedPgdata:TARGET.pgdata,targetExists:existsSync(TARGET.pgdata),parentApproved:existsSync(parent)&&realpathSync(parent).replaceAll("\\","/")===parent,postgresMajor:Number(/(\d+)\./.exec(String(version.stdout))?.[1]),sqlHashesVerified:manifest.files.every((x:{file:string;sha256:string})=>sha256(resolve(root,"lib/db/src/schema",x.file))===x.sha256),baselineHashVerified:sha256(resolve(root,"docs/brain-qualification-preparation/bootstrap/0000-current.sql"))===manifest.freshBootstrap.sha256,catalogState:"absent"};},
    async run(c){
      if(c.phase==="browser-workflow")browserCompletionUnproven=true;
      if(c.program==='@qualification/restart-postgres'){
        if(api||restartProof)throw Error('FAIL_CLOSED: stop API before one PostgreSQL restart');
        const snapshotPath=resolve(import.meta.dirname,'../../../.orchestra/qualification/brain-qualification-durable-evidence.json');
        const identitySql=`select json_build_object('database',current_database(),'role',current_user,'address',host(inet_server_addr()),'port',inet_server_port(),'version',current_setting('server_version_num'),'dataDirectory',current_setting('data_directory'),'encoding',current_setting('server_encoding'),'systemIdentifier',(pg_control_system()).system_identifier::text,'postmasterStart',to_char(pg_postmaster_start_time() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'))`;
        restartProof=await provePostgresRestart({
          identity(){const result=sync('psql',['--host',TARGET.host,'--port',String(TARGET.port),'--username',TARGET.adminRole,'--dbname','postgres','--no-psqlrc','--tuples-only','--no-align','--set','ON_ERROR_STOP=1','--command',identitySql],{env:adminEnv(c),encoding:'utf8',stdio:['ignore','pipe','pipe']});return JSON.parse(String(result.stdout).trim());},
          ownership(){return {path:realpathSync(TARGET.pgdata),marker:readFileSync(`${TARGET.pgdata}/.fi-forgot-brain-qualification-owned`,'utf8'),major:readFileSync(`${TARGET.pgdata}/PG_VERSION`,'utf8')};},
          snapshotHash(){return sha256(snapshotPath);},
          stop(){sync('pg_ctl',['--pgdata',TARGET.pgdata,'stop','--mode','fast','--wait','--timeout','30'],{env:scrubbedEnv(),stdio:['ignore','inherit','inherit']},45000);},
          status(){const result=runSync('pg_ctl',['--pgdata',TARGET.pgdata,'status'],{env:scrubbedEnv(),stdio:['ignore','pipe','pipe'],timeout:15000,shell:false});return result.error?-1:result.status??-1;},
          assertPortReleased(){return new Promise<void>((resolvePort,reject)=>{const probe=createServer();probe.once('error',()=>reject(Error('FAIL_CLOSED: PostgreSQL port remains occupied before restart')));probe.listen(TARGET.port,TARGET.host,()=>probe.close(error=>error?reject(error):resolvePort()));});},
          start(){sync('pg_ctl',['--pgdata',TARGET.pgdata,'--options',`-h ${TARGET.host} -p ${TARGET.port}`,'start','--wait','--timeout','30','--log',privatePostgresLog()],{env:scrubbedEnv(),stdio:['ignore','ignore','ignore']},45000);},
        },process.env.BRAIN_QUALIFICATION_ATTEMPT_NONCE,process.env.BRAIN_QUALIFICATION_SESSION_ID);
        return '';
      }
      if(c.program==='@qualification/record-postgres-restart-proof'){
        const snapshotPath=resolve(import.meta.dirname,'../../../.orchestra/qualification/brain-qualification-durable-evidence.json');
        const receipt=finalizePostgresRestart(restartProof,afterRestartAssertionsPassed,sha256(snapshotPath));
        writeFileSync(resolve(import.meta.dirname,'../../../.orchestra/qualification/brain-qualification-postgres-restart.json'),JSON.stringify(receipt)+'\n',{flag:'wx'});return '';
      }
      if(c.program==="@qualification/initialize-cluster"){
        const password=secret("BRAIN_QUALIFICATION_ADMIN_PASSWORD");
        // Production Windows execution uses the accepted guest's fixed private
        // system directory, never TEMP/TMP supplied by a parent environment.
        const requestedBase=dependencies.credentialBase??(process.platform==="win32"?"C:/Windows/Temp":tmpdir()),base=realpathSync(requestedBase);
        if(resolve(base).toLowerCase()!==resolve(requestedBase).toLowerCase())throw new Error("FAIL_CLOSED: credential directory is redirected");assertPrivateCredentialBase(base);
        const directory=mkdtempSync(join(base,"fi-brain-initdb-")),passwordFile=join(directory,"password.txt");
        let initializationError:unknown;
        try{
          // The accepted Sandbox wrapper executes as SYSTEM. Restrict the private
          // directory before writing the credential; argv contains only its path.
          if(process.platform==="win32")sync("icacls",[directory,"/inheritance:r","/grant:r","*S-1-5-18:(OI)(CI)F"],{env:scrubbedEnv(),encoding:"utf8",stdio:["ignore","pipe","pipe"]});else chmodSync(directory,0o700);
          writeFileSync(passwordFile,password+"\n",{flag:"wx",mode:0o600});
          sync("initdb",["--pgdata",TARGET.pgdata,"--username",TARGET.adminRole,"--pwfile",passwordFile,"--encoding","UTF8","--auth-local","scram-sha-256","--auth-host","scram-sha-256"],{env:scrubbedEnv(),stdio:["ignore","inherit","inherit"]},300000);
        }catch(error){initializationError=error;throw error;}finally{try{rmSync(directory,{recursive:true,force:false});}catch{const cleanupError=new Error("FAIL_CLOSED: private credential cleanup failed");if(initializationError)throw new AggregateError([initializationError,cleanupError],"Cluster initialization and private credential cleanup failed",{cause:initializationError});throw cleanupError;}}
        return"";
      }
      if(c.program==="@qualification/mark-owned-cluster"){if(!existsSync(TARGET.pgdata))throw new Error("initialized cluster absent");writeFileSync(`${TARGET.pgdata}/.fi-forgot-brain-qualification-owned`,"fi-forgot-brain-qualification-owned-v1\n",{flag:"wx"});return"";}
      if(c.program==="@qualification/create-role"){const password=secret("BRAIN_QUALIFICATION_APP_PASSWORD").replaceAll("'","''");sync("psql",["--host",TARGET.host,"--port",String(TARGET.port),"--username",TARGET.adminRole,"--dbname","postgres","--no-psqlrc","--set","ON_ERROR_STOP=1"],{input:`SET standard_conforming_strings=on;\nCREATE ROLE ${TARGET.role} LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;\n`,env:adminEnv(c),encoding:"utf8",stdio:["pipe","pipe","pipe"]});return"";}
      if(c.phase==="create-database"){sync(c.program,c.args,{env:adminEnv(c),encoding:"utf8",stdio:["ignore","pipe","pipe"]});const identity=sync("psql",["--host",TARGET.host,"--port",String(TARGET.port),"--username",TARGET.adminRole,"--dbname","postgres","--no-psqlrc","--tuples-only","--no-align","--field-separator","|","--command","select current_database(),current_user,current_setting('server_version_num'),host(inet_server_addr()),inet_server_port(),current_setting('data_directory'),current_setting('server_encoding')"],{env:adminEnv(c),encoding:"utf8",stdio:["ignore","pipe","pipe"]});const fields=String(identity.stdout).trim().split("|");assertPostgresIdentity({database:fields[0],role:fields[1],version:fields[2],address:fields[3],port:fields[4],dataDirectory:fields[5],encoding:fields[6]},true);return"";}
      if(c.phase==="start-postgres"){sync(c.program,[...c.args,"--wait","--timeout","30","--log",privatePostgresLog()],{env:scrubbedEnv(),stdio:["ignore","ignore","ignore"]},45000);return "";}
      if(c.process==="capture"){if(api)throw new Error("API process already captured");api=runAsync(c.program,c.args,{cwd:resolve(import.meta.dirname,"../../.."),env:appEnv(c),stdio:["ignore","inherit","inherit","ipc"],shell:false});observeManagedChild(api);if(!api.pid)throw new Error("API process did not start");return"";}
      if(c.process==="stop-captured"){
        if(!api?.pid)throw new Error('No qualified API process captured');
        const child=api;
        await stopManagedProcess({
          requestGracefulStop(){requestManagedChildStop(child);},
          waitForExit(timeoutMs){return new Promise(resolve=>{if(child.exitCode!==null||child.signalCode!==null){resolve(true);return;}const finish=()=>{clearTimeout(timer);resolve(true);};const timer=setTimeout(()=>{child.off('exit',finish);resolve(false);},timeoutMs);child.once('exit',finish);});},
          forceStop(){child.kill('SIGKILL');},
          assertPortReleased(){return new Promise((resolve,reject)=>{const probe=createServer();probe.once('error',()=>reject(new Error('FAIL_CLOSED: API port remains occupied')));probe.listen(TARGET.apiPort,TARGET.host,()=>probe.close(error=>error?reject(error):resolve()));});}
        });
        api=null;return '';
      }
      const nodeApp=c.phase==="browser-workflow"||c.phase==="fixtures"||c.phase.startsWith("assert")||c.phase.startsWith("wait-api"),psqlApp=c.phase==="identity"||c.phase==="fresh-baseline";
      const timeout=c.phase.startsWith("wait-api")?90000:c.phase==="browser-workflow"||c.phase==="fresh-baseline"||c.phase==="fixtures"||c.phase.startsWith("assert")?300000:c.program==="pg_ctl"?90000:15000;
      const r=sync(c.program,c.args,{cwd:resolve(import.meta.dirname,"../../.."),env:nodeApp?appEnv(c):psqlApp?appEnv(c,true):{...scrubbedEnv(),...c.env},encoding:"utf8",stdio:c.phase==="identity"?"pipe":"inherit"},timeout);if(c.phase==='browser-workflow')browserCompletionUnproven=false;if(c.phase==='assert-after-restart')afterRestartAssertionsPassed=true;return String(r.stdout??"").replace(/\s+/g,"");
    },
    async recover(completed){if(browserCompletionUnproven)throw new Error("FAIL_CLOSED: browser completion unproven; preserve PGDATA; stop exact owned Windows Sandbox and verify session absence before guarded host cleanup");if(maySkipPreInitializationRecovery(completed,existsSync(TARGET.pgdata)))return;let apiStopError:unknown;if(api?.pid){const child=api;try{await stopManagedProcess({requestGracefulStop(){requestManagedChildStop(child);},waitForExit(timeoutMs){return new Promise(resolveExit=>{if(child.exitCode!==null||child.signalCode!==null){resolveExit(true);return;}const finish=()=>{clearTimeout(timer);resolveExit(true);},timer=setTimeout(()=>{child.off("exit",finish);resolveExit(false);},timeoutMs);child.once("exit",finish);});},forceStop(){child.kill("SIGKILL");},assertPortReleased(){return new Promise((resolvePort,reject)=>{const probe=createServer();probe.once("error",()=>reject(new Error("FAIL_CLOSED: API port remains occupied")));probe.listen(TARGET.apiPort,TARGET.host,()=>probe.close(error=>error?reject(error):resolvePort()));});}});}catch(error){apiStopError=error;}api=null;}const marker=`${TARGET.pgdata}/.fi-forgot-brain-qualification-owned`;if(!completed.includes("mark-owned-cluster")||!existsSync(marker))throw new Error("FAIL_CLOSED: unowned recovery target");await recoverOwnedPostgres({ownership(){return {path:realpathSync(TARGET.pgdata),marker:readFileSync(marker,'utf8'),major:readFileSync(TARGET.pgdata+'/PG_VERSION','utf8')};},status(){const result=runSync('pg_ctl',['--pgdata',TARGET.pgdata,'status'],{env:scrubbedEnv(),shell:false,stdio:['ignore','pipe','pipe'],timeout:15000});return result.error?-1:result.status??-1;},stop(){sync('pg_ctl',['--pgdata',TARGET.pgdata,'stop','--mode','fast','--wait','--timeout','10'],{env:scrubbedEnv(),stdio:['ignore','ignore','ignore']},20000);},portReleased(){return new Promise<boolean>(resolvePort=>{const probe=createServer();probe.once('error',()=>resolvePort(false));probe.listen(TARGET.port,TARGET.host,()=>probe.close(error=>resolvePort(!error)));});},remove(){rmSync(TARGET.pgdata,{recursive:true,force:false});}},!apiStopError);},
  };
}
