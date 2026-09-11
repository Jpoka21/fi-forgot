import { resolve } from "node:path";
// @ts-ignore Node's built-in type stripping requires the runtime extension.
import { assertExecutionGates, buildPlan, EXECUTION_REQUIREMENTS, QUALIFICATION_LIMITATIONS, SYNTHETIC_DATE_REQUIREMENT, EXACT_AUTHORIZATION, SQL_ORDER, TARGET, sha256 } from "./plan.ts";
// @ts-ignore Node built-in type stripping requires the runtime extension.
import { createSystemExecutionAdapter, executeFutureQualification } from "./execution.ts";

const args=new Set(process.argv.slice(2));
for(const arg of args)if(arg!=="--execute")throw new Error(`FAIL_CLOSED: unknown qualification argument ${arg}`);
const execute=args.has("--execute");
const gates={execute,syntheticRunDate:process.env.BRAIN_QUALIFICATION_SYNTHETIC_RUN_DATE,osBoundary:process.env.BRAIN_QUALIFICATION_OS_NETWORK_BOUNDARY,authorization:process.env.BRAIN_QUALIFICATION_OWNER_AUTHORIZATION,host:process.env.BRAIN_QUALIFICATION_HOST,port:Number(process.env.BRAIN_QUALIFICATION_PORT),database:process.env.BRAIN_QUALIFICATION_DATABASE,role:process.env.BRAIN_QUALIFICATION_ROLE,pgdata:process.env.BRAIN_QUALIFICATION_PGDATA,postgresMajor:Number(process.env.BRAIN_QUALIFICATION_POSTGRES_MAJOR),disposable:process.env.BRAIN_QUALIFICATION_DISPOSABLE==="true",catalogApproved:process.env.BRAIN_QUALIFICATION_CATALOG_APPROVED==="true",hashesApproved:process.env.BRAIN_QUALIFICATION_HASHES_APPROVED==="true",credentialEnv:process.env.PGPASSWORD?"PGPASSWORD":undefined};
if(execute){await executeFutureQualification(gates,createSystemExecutionAdapter());process.exit(0);}assertExecutionGates(gates);
const root=resolve(import.meta.dirname,"../../..");
console.log(JSON.stringify({mode:"plan-only",target:TARGET,sql:SQL_ORDER.map(file=>({file,sha256:sha256(resolve(root,"lib/db/src/schema",file))})),commands:buildPlan(root),executionRequirements:EXECUTION_REQUIREMENTS,syntheticDateRequirement:SYNTHETIC_DATE_REQUIREMENT,limitations:QUALIFICATION_LIMITATIONS},null,2));
