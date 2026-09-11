import {createHash}from"node:crypto";import{readFileSync}from"node:fs";import{resolve}from"node:path";
export const TARGET=Object.freeze({postgresMajor:16,host:"127.0.0.1",port:55432,database:"fi_forgot_brain_qualification",role:"fi_forgot_brain_qualifier",adminRole:"fi_forgot_brain_cluster_admin",pgdata:"C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata",apiPort:8080,frontendPort:25460});
export const EXACT_AUTHORIZATION="OWNER-AUTHORIZES-BRAIN-QUALIFICATION-EXECUTION";
export const SQL_ORDER=["evolving-understanding-migration.sql","opportunity-temporal-migration.sql","opportunity-feedback-migration.sql","opportunity-follow-through-migration.sql","versioned-understanding-snapshot.sql"]as const;
export type PlannedCommand={phase:string;program:string;args:string[];mutates:boolean;env?:Record<string,string>;process?:"foreground"|"capture"|"stop-captured"};
export const renderCommand=(c:PlannedCommand)=>[c.program,...c.args.map(x=>/\s/.test(x)?JSON.stringify(x):x)].join(" ");
export function sha256(path:string){return createHash("sha256").update(readFileSync(path)).digest("hex");}
export function buildPlan(root=resolve(import.meta.dirname,"../../..")):PlannedCommand[]{const baseline=resolve(root,"docs/brain-qualification-preparation/bootstrap/0000-current.sql"),fixture=resolve(root,"docs/brain-qualification-preparation/synthetic-fixtures.json"),runner=resolve(root,"scripts/src/brain-qualification/future-workflow.ts"),tsx=resolve(root,"scripts/node_modules/tsx/dist/cli.mjs"),evidencePath=resolve(root,".orchestra/qualification/brain-qualification-durable-evidence.json");const db=["--host",TARGET.host,"--port",String(TARGET.port),"--username",TARGET.role,"--dbname",TARGET.database,"--no-psqlrc"],evidenceEnv={BRAIN_QUALIFICATION_EXECUTION_ADMITTED:"true",BRAIN_QUALIFICATION_HOST:TARGET.host,BRAIN_QUALIFICATION_PORT:String(TARGET.port),BRAIN_QUALIFICATION_DATABASE:TARGET.database,BRAIN_QUALIFICATION_ROLE:TARGET.role,BRAIN_QUALIFICATION_HASHES_VERIFIED:"true",BRAIN_QUALIFICATION_CATALOG_VERIFIED:"true",BRAIN_QUALIFICATION_DISPOSABLE_MARKER_VERIFIED:"true",BRAIN_QUALIFICATION_DURABLE_EVIDENCE_PATH:evidencePath};const apiEnv={...evidenceEnv,BRAIN_QUALIFICATION_MODE:"true",HOST:TARGET.host,PORT:String(TARGET.apiPort)};return[
{phase:"initialize-cluster",program:"@qualification/initialize-cluster",args:[TARGET.pgdata,TARGET.adminRole],mutates:true},
{phase:"mark-owned-cluster",program:"@qualification/mark-owned-cluster",args:[TARGET.pgdata],mutates:true},
{phase:"start-postgres",program:"pg_ctl",args:["--pgdata",TARGET.pgdata,"--options",`-h ${TARGET.host} -p ${TARGET.port}`,"start"],mutates:true},
{phase:"create-role",program:"@qualification/create-role",args:[TARGET.role],mutates:true},
{phase:"create-database",program:"createdb",args:["--host",TARGET.host,"--port",String(TARGET.port),"--username",TARGET.adminRole,"--owner",TARGET.role,TARGET.database],mutates:true},
{phase:"identity",program:"psql",args:[...db,"--tuples-only","--command","select current_database(),current_user,current_setting('server_version_num')"],mutates:false},
{phase:"fresh-baseline",program:"psql",args:[...db,"--set","ON_ERROR_STOP=1","--file",baseline],mutates:true},
{phase:"fixtures",program:process.execPath,args:[tsx,runner,"load","--fixture",fixture],env:evidenceEnv,mutates:true},
{phase:"start-api",program:process.execPath,args:["--enable-source-maps",resolve(root,"artifacts/api-server/dist/index.mjs")],env:apiEnv,mutates:true,process:"capture"},
{phase:"wait-api",program:process.execPath,args:[tsx,resolve(root,"scripts/src/brain-qualification/wait-api.ts")],env:evidenceEnv,mutates:false},
{phase:"assert",program:process.execPath,args:[tsx,runner,"assert"],env:evidenceEnv,mutates:true},
{phase:"stop-api",program:"@captured-api",args:[],mutates:true,process:"stop-captured"},
{phase:"restart-api",program:process.execPath,args:["--enable-source-maps",resolve(root,"artifacts/api-server/dist/index.mjs")],env:apiEnv,mutates:true,process:"capture"},
{phase:"wait-api-after-restart",program:process.execPath,args:[tsx,resolve(root,"scripts/src/brain-qualification/wait-api.ts")],env:evidenceEnv,mutates:false},
{phase:"assert-after-restart",program:process.execPath,args:[tsx,runner,"assert","--after-restart"],env:evidenceEnv,mutates:false},
{phase:"stop-api-final",program:"@captured-api",args:[],mutates:true,process:"stop-captured"},
{phase:"stop-postgres",program:"pg_ctl",args:["--pgdata",TARGET.pgdata,"stop"],mutates:true},
];}
export function buildUpgradePlan(root=resolve(import.meta.dirname,"../../..")):PlannedCommand[]{const schema=resolve(root,"lib/db/src/schema");return SQL_ORDER.map((file,index)=>({phase:`upgrade-${index+1}`,program:"psql",args:["--host",TARGET.host,"--port",String(TARGET.port),"--username",TARGET.role,"--dbname",TARGET.database,"--no-psqlrc","--set","ON_ERROR_STOP=1","--file",resolve(schema,file)],mutates:true}));}
export type GateInput={execute:boolean;authorization?:string;host?:string;port?:number;database?:string;role?:string;pgdata?:string;postgresMajor?:number;disposable?:boolean;catalogApproved?:boolean;hashesApproved?:boolean;credentialEnv?:string;osBoundary?:string;syntheticRunDate?:string};
export const EXECUTION_REQUIREMENTS=Object.freeze({authorization:EXACT_AUTHORIZATION,host:TARGET.host,port:TARGET.port,database:TARGET.database,role:TARGET.role,pgdata:TARGET.pgdata,postgresMajor:16,disposable:true,catalogApproved:true,hashesApproved:true,credentialEnv:'PGPASSWORD',osBoundary:'reviewed-loopback-only'});
export const QUALIFICATION_LIMITATIONS=Object.freeze([
 'Preparation only: PostgreSQL creation, migration and fixture execution require separate owner authorization.',
 'Fresh baseline only; existing-schema upgrade requires actual predecessor and catalog evidence.',
 'OS containment and process-only credentials must be independently established before execution.',
 'Caller-supplied identifiers do not establish authenticated isolation.',
 'Offline substitutes do not prove PostgreSQL persistence, recovery, browser behavior or external delivery.',
 'Recovery may remove only the independently verified disposable target; no reviewed down migration exists.'
]);
export const SYNTHETIC_DATE_REQUIREMENT='An explicit valid YYYY-MM-DD synthetic run date is required and recorded in restart evidence.';
export function assertExecutionGates(i:GateInput){
 if(!i.execute)return 'plan-only' as const;
 let date=false;try{date=/^\d{4}-\d{2}-\d{2}$/.test(i.syntheticRunDate??'')&&new Date(`${i.syntheticRunDate}T00:00:00Z`).toISOString().slice(0,10)===i.syntheticRunDate;}catch{}
 const exact=Object.entries(EXECUTION_REQUIREMENTS).every(([key,value])=>(i as unknown as Record<string,unknown>)[key]===value);
 if(!exact||!date)throw new Error('FAIL_CLOSED: exact authorization, target, synthetic run date, observed runtime evidence, approved hashes/catalog, disposability, OS boundary and process-only credential are required');
 return 'execution-authorized' as const;
}
