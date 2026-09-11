import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
// @ts-ignore Node built-in type stripping requires the runtime extension.
import { EXACT_AUTHORIZATION, SQL_ORDER, TARGET, buildPlan, renderCommand, sha256 } from "./plan.ts";
const root=resolve(import.meta.dirname,"../../..");
const bytes=(p:string)=>readFileSync(resolve(root,p));
const hash=(p:string)=>createHash("sha256").update(bytes(p)).digest("hex");
const manifest=JSON.parse(bytes("docs/brain-qualification-preparation/migration-manifest.json").toString());
if(hash("docs/brain-integration-readiness.md")!==manifest.historicalReadinessSha256)throw new Error("historical readiness hash drift");
if(JSON.stringify(manifest.files.map((x:{file:string})=>x.file))!==JSON.stringify(SQL_ORDER))throw new Error("five-file order drift");
for(const item of manifest.files)if(sha256(resolve(root,"lib/db/src/schema",item.file))!==item.sha256)throw new Error(`SQL hash drift: ${item.file}`);
if(hash("docs/brain-qualification-preparation/bootstrap/0000-current.sql")!==manifest.freshBootstrap.sha256)throw new Error("baseline hash drift");
const serialized=bytes("docs/brain-qualification-preparation/bootstrap/schema-snapshot.json").toString();
if(!serialized.includes("relationship_hypothesis_evidence_uq")||!serialized.includes("nullsNotDistinct"))throw new Error("serialized nullable uniqueness absent");
const source=bytes("lib/db/src/schema/opportunity-follow-through.ts").toString();
for(const name of ["sourceTypeCheck","dimensionCheck","actionCheck","provenanceCheck","verificationCheck"])if(!source.includes(name))throw new Error(`Drizzle CHECK absent: ${name}`);
const plan=JSON.stringify(buildPlan(root));if(plan.includes("BRAIN_QUALIFICATION_OS_NETWORK_BOUNDARY"))throw new Error("plan must not manufacture OS-boundary approval");for(const value of [TARGET.host,TARGET.port,TARGET.database,TARGET.role,TARGET.pgdata])if(!plan.includes(String(value)))throw new Error(`plan target drift: ${value}`);
const docs=bytes("docs/brain-qualification-preparation/README.md").toString(),fixtureHash=hash("docs/brain-qualification-preparation/synthetic-fixtures.json"),packageJson=JSON.parse(bytes("scripts/package.json").toString());
for(const value of [fixtureHash,EXACT_AUTHORIZATION,TARGET.host,String(TARGET.port),TARGET.database,TARGET.role,TARGET.adminRole,TARGET.pgdata,"BRAIN_QUALIFICATION_SYNTHETIC_RUN_DATE","brain-qualification:verify-no-db","/concierge"])if(!docs.includes(value))throw new Error(`documentation drift: ${value}`);
for(const name of ["brain-qualification:verify-static","brain-qualification:test","brain-qualification:verify-fixtures","brain-qualification:verify-no-db","brain-qualification:regression"])if(!packageJson.scripts[name])throw new Error(`admitted script absent: ${name}`);
for(const command of buildPlan(root)){if(!command.program||!Array.isArray(command.args)||renderCommand(command).includes("<"))throw new Error(`non-executable typed plan phase: ${command.phase}`);}
const future=bytes("scripts/src/brain-qualification/future-workflow.ts").toString();for(const value of["fixtureHash","markerPath","parseQualificationAdminDatabaseUrl","inet_server_addr","data_directory","pool.end","--after-restart","qualifyUnderstanding","cross-owner feedback","feedbackMutation","outcomeMutation"])if(!future.includes(value))throw new Error(`future workflow guard/lifecycle drift: ${value}`);
console.log("brain qualification static verification: PASS");
