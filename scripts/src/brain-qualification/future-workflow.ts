// @ts-ignore Native runtime extension.
import {qualifyRollbackDecay} from './temporal-decay-assertions.ts';
// @ts-ignore Native runtime extension.
import {qualifyOpportunitySemantics,opportunitySemantics,assertTemporalExamples} from './opportunity-assertions.ts';
// @ts-ignore Native runtime extension.
import {qualificationPersonalRecipients,qualificationProfiles,selectDatedQualificationOpportunity} from './fixture-config.ts';
// @ts-ignore Native runtime extension.
import {assertPostgresIdentity} from './postgres-identity.ts';
// @ts-ignore Native runtime JavaScript helper.
import {captureQuestionState} from './question-state.mjs';
// @ts-ignore Native runtime type stripping resolves the shared contract.
import {assertSupplementalQuestionInputApiRow,assertSupplementalQuestionInputDatabaseRow,validateSupplementalQuestionInputSeed} from './question-input-assertions.ts';
/** Future-only production loader/assertion entry. Preparation tests never import it. */
// @ts-ignore Node built-in stripping requires explicit runtime extensions.
import {parseQualificationAdminDatabaseUrl,parseQualificationDatabaseUrl} from './target-verification.ts';
import{createRequire}from'node:module';
// @ts-ignore Node built-in stripping requires explicit runtime extensions.
import {qualifyUnderstanding,assertPersistedSnapshot} from './lifecycle-assertions.ts';
import{createHash}from"node:crypto";import{existsSync,readFileSync,writeFileSync}from"node:fs";import{resolve}from"node:path";
const root=resolve(import.meta.dirname,"../../.."),action=process.argv[2],rest=process.argv.slice(3),fixturePath=resolve(root,"docs/brain-qualification-preparation/synthetic-fixtures.json"),markerPath="C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata/.fi-forgot-brain-qualification-owned";
if(!["load","assert"].includes(action??""))throw new Error("Expected load or assert");
if(action==="load"&&(rest.length!==2||rest[0]!=="--fixture"||resolve(rest[1])!==fixturePath))throw new Error("FAIL_CLOSED: load requires exact approved fixture");
if(action==="assert"&&!(rest.length===0||(rest.length===1&&rest[0]==="--after-restart")))throw new Error("FAIL_CLOSED: unknown assertion argument");
if(process.env.BRAIN_QUALIFICATION_OWNER_AUTHORIZATION!=="OWNER-AUTHORIZES-BRAIN-QUALIFICATION-EXECUTION"||process.env.BRAIN_QUALIFICATION_EXECUTION_ADMITTED!=="true")throw new Error("FAIL_CLOSED: exact execution admission required");
const fixtureBytes=readFileSync(fixturePath),fixtureHash=createHash("sha256").update(fixtureBytes).digest("hex");
if(fixtureHash!=="1591c1c7e2adeab1d5f253a3d0de00ee1a1c2cea07ad1acff316eb9c9e843e62"||!existsSync(markerPath)||readFileSync(markerPath,"utf8")!=="fi-forgot-brain-qualification-owned-v1\n")throw new Error("FAIL_CLOSED: fixture drift or disposable marker missing");
const databaseUrl=new URL(process.env.DATABASE_URL??"invalid:");if(databaseUrl.protocol!=="postgresql:"||databaseUrl.hostname!=="127.0.0.1"||databaseUrl.port!=="55432"||databaseUrl.pathname!=="/fi_forgot_brain_qualification"||decodeURIComponent(databaseUrl.username)!=="fi_forgot_brain_qualifier"||!databaseUrl.password)throw new Error("FAIL_CLOSED: exact credential-bearing qualification DATABASE_URL required");
const appConnection=parseQualificationDatabaseUrl(process.env.DATABASE_URL);
const fixture=JSON.parse(fixtureBytes.toString("utf8")),runDate=process.env.BRAIN_QUALIFICATION_SYNTHETIC_RUN_DATE;if(!/^\d{4}-\d{2}-\d{2}$/.test(runDate??"")||new Date(`${runDate}T00:00:00Z`).toISOString().slice(0,10)!==runDate)throw new Error("FAIL_CLOSED: exact synthetic run date required");const relativeDate=(days:number)=>{const date=new Date(`${runDate}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10);};
const supplementalSeed=validateSupplementalQuestionInputSeed(fixture,runDate!);
if(action==="load"){
 const adminConnection=parseQualificationAdminDatabaseUrl(process.env.BRAIN_QUALIFICATION_ADMIN_DATABASE_URL),localRequire=createRequire(resolve(root,'lib/db/package.json')),PgPool=localRequire('pg').Pool,adminPool=new PgPool(adminConnection);
 try{const observed=(await adminPool.query("select current_database() as database,current_user as role,host(inet_server_addr()) as address,inet_server_port() as port,current_setting('server_version_num') as version,current_setting('server_encoding') as encoding,current_setting('data_directory') as data_directory")).rows[0];assertPostgresIdentity({...observed,dataDirectory:observed?.data_directory},true);}finally{await adminPool.end();}
 const[{db,pool},schema]=await Promise.all([import(new URL("../../../lib/db/src/index.ts",import.meta.url).href),import(new URL("../../../lib/db/src/schema/index.ts",import.meta.url).href)]);
 try{const observed=(await pool.query("select current_database() as database,current_user as role,host(inet_server_addr()) as address,inet_server_port() as port,current_setting('server_version_num') as version,current_setting('server_encoding') as encoding")).rows[0];assertPostgresIdentity({...observed,dataDirectory:observed?.data_directory},false);
 await db.transaction(async(tx:any)=>{await tx.insert(schema.usersTable).values(fixture.owners.map((x:any)=>({id:x.id,email:x.email,name:x.name}))).onConflictDoNothing();await tx.insert(schema.recipientsTable).values(fixture.recipients.map((x:any)=>({id:x.id,userId:x.userId,firstName:x.firstName,relationshipType:x.relationshipType,birthday:fixture.qualificationTiming.birthdayOffsetsDays[x.id]!=null?relativeDate(fixture.qualificationTiming.birthdayOffsetsDays[x.id]):x.birthday,anniversary:x.anniversary}))).onConflictDoNothing();await tx.insert(schema.recipientProfileTable).values(qualificationProfiles(fixture)).onConflictDoNothing();await tx.insert(schema.personalRecipientsTable).values(qualificationPersonalRecipients(fixture,relativeDate)).onConflictDoNothing();await tx.insert(schema.questionAnswersTable).values(fixture.questionAnswers.map((x:any)=>({...x,eventYear:Number(runDate.slice(0,4)),archivedAt:x.archivedAt?new Date(`${relativeDate(-30)}T00:00:00Z`):null}))).onConflictDoNothing();await tx.insert(schema.questionAnswersTable).values(supplementalSeed.descriptor);});console.log("approved synthetic production-schema fixture plus one supplemental question input loaded");}finally{await pool.end();}
}else{
 const afterRestart=rest[0]==="--after-restart", evidencePath=process.env.BRAIN_QUALIFICATION_DURABLE_EVIDENCE_PATH;
 if(!evidencePath||resolve(evidencePath)!==resolve(root,'.orchestra/qualification/brain-qualification-durable-evidence.json'))throw new Error('FAIL_CLOSED: exact durable evidence path required');
 if(!afterRestart&&existsSync(evidencePath))throw new Error('FAIL_CLOSED: previous evidence exists; inspect before repeating mutations');
 const call=async(path:string,owner:string,init?:RequestInit)=>{const response=await fetch(`http://127.0.0.1:8080/api${path}`,{...init,redirect:'error',signal:AbortSignal.timeout(10000),headers:{'content-type':'application/json','x-user-id':owner,...init?.headers}});if(!response.ok)throw new Error(`${path} returned ${response.status}`);return response.json()as Promise<any>;};
 let semanticCoverage:any=afterRestart?JSON.parse(readFileSync(evidencePath,'utf8')).semanticCoverage:null;
 if(!afterRestart){
   await qualifyUnderstanding(call);
   const qualified=await qualifyOpportunitySemantics(call);semanticCoverage=qualified.coverage;
   const {recipientId,opportunityId,occurrenceCycleId:cycle}=qualified.identity;
   const [{db:decayDb,pool:decayPool},schema,temporal]=await Promise.all([import(new URL('../../../lib/db/src/index.ts',import.meta.url).href),import(new URL('../../../lib/db/src/schema/index.ts',import.meta.url).href),import(new URL('./temporal-runtime.mjs',import.meta.url).href)]);
   try{const identity=(await decayPool.query("select current_database() as database,current_user as role,host(inet_server_addr()) as address,inet_server_port() as port,current_setting('server_version_num') as version,current_setting('server_encoding') as encoding")).rows[0];assertPostgresIdentity(identity,false);
    const current=await call('/v2/concierge','brain-qual-owner-a'),actual=current.opportunities.find((o:any)=>o.id===opportunityId);
    semanticCoverage.decay=await qualifyRollbackDecay(decayDb,(db:any)=>temporal.createPgOpportunityTemporalHistoryRepository(async()=>({db,opportunityTemporalHistoryTable:schema.opportunityTemporalHistoryTable})),temporal.evaluateOpportunityTemporal,'brain-qual-owner-a',actual);
    semanticCoverage.decayTransitionsQualified=true;
   }finally{await decayPool.end();}

   await call('/v2/concierge/opportunity-feedback','brain-qual-owner-b',{method:'POST',body:JSON.stringify({recipientId,opportunityId,occurrenceCycleId:cycle,type:'helpful',expectedVersion:0,idempotencyKey:'brain-qual-cross-owner-feedback'})}).then(()=>{throw new Error('cross-owner feedback mutation succeeded')},error=>{if(!/returned 404|returned 403/.test(String(error)))throw error;});
   await call('/v2/concierge/opportunity-follow-through','brain-qual-owner-b',{method:'POST',body:JSON.stringify({recipientId,opportunityId,occurrenceCycleId:cycle,dimension:'action',value:'planned',expectedVersion:0,idempotencyKey:'brain-qual-cross-owner-follow'})}).then(()=>{throw new Error('cross-owner follow-through mutation succeeded')},error=>{if(!/returned 404|returned 403/.test(String(error)))throw error;});
 }
 // The real question-selection GET can write understanding/expiry state. Prime
 // it before the baseline and retain its complete observable state on every
 // restart/post-browser comparison; never classify it as a read-only endpoint.
 const withVerifiedAppRead=async<T>(callback:(client:any)=>Promise<T>)=>{const localRequire=createRequire(resolve(root,'lib/db/package.json')),PgPool=localRequire('pg').Pool,pool=new PgPool(appConnection);let client:any;try{client=await pool.connect();const observed=(await client.query("select current_database() as database,current_user as role,host(inet_server_addr()) as address,inet_server_port() as port,current_setting('server_version_num') as version,current_setting('server_encoding') as encoding")).rows[0];assertPostgresIdentity(observed,false);return await callback(client);}finally{client?.release();await pool.end();}};
 const captureCurrentQuestionState=()=>captureQuestionState(call,fixture.owners,()=>withVerifiedAppRead(async client=>(await client.query('select id,user_id,recipient_id,source_answer_id,category,trigger_date,question,original_answer,status,created_at,answered_at from public.follow_up_questions where user_id = ANY($1::text[]) order by user_id,recipient_id,id',[fixture.owners.map((owner:any)=>owner.id)])).rows));
 let questionInputIntegrity:any;
 const immutableHistory=(history:any[])=>history.map(({lifecycleState,...record}:any)=>record);
 const inputOwner='brain-qual-owner-a',inputRecipient='brain-qual-a-r1',inputBase=`/v2/recipients/${inputRecipient}`;
 const readSeedDatabaseRow=(archived:boolean)=>withVerifiedAppRead(async client=>{const rows=(await client.query('select id,user_id as "userId",recipient_id as "recipientId",event_type as "eventType",event_year as "eventYear",question_key as "questionKey",question_text as "questionText",answer_text as "answerText",was_skipped as "wasSkipped",trigger_type as "triggerType",importance_score as "importanceScore",archived_at as "archivedAt",created_at as "createdAt" from public.question_answers where id=$1 and user_id=$2 and recipient_id=$3',[supplementalSeed.descriptor.id,inputOwner,inputRecipient])).rows;if(rows.length!==1)throw new Error('supplemental seed database identity absent or ambiguous');return assertSupplementalQuestionInputDatabaseRow(rows[0],supplementalSeed.descriptor,archived);});
 if(!afterRestart){
   const beforeTimelines:any[]=[];for(const owner of fixture.owners)for(const recipientId of owner.recipientIds)beforeTimelines.push({ownerId:owner.id,recipientId,timeline:await call(`/v2/recipients/${recipientId}/timeline`,owner.id)});
   const seedDbBeforeArchive=await readSeedDatabaseRow(false),active=await call(`${inputBase}/fresh-updates`,inputOwner),activeRows=active.freshUpdates.filter((row:any)=>row.id===supplementalSeed.descriptor.id),activeRow=activeRows[0];if(activeRows.length!==1)throw new Error('supplemental fresh answer absent or ambiguous');const seedApiBeforeArchive=assertSupplementalQuestionInputApiRow(activeRow,supplementalSeed.descriptor,seedDbBeforeArchive.createdAt);
   const timeline=async()=>call(`${inputBase}/timeline`,inputOwner),find=(value:any)=>value.items.find((item:any)=>item.evidenceId===activeRow.id);
   const activeTimeline=await timeline(),activeObservation=find(activeTimeline);if(!activeObservation||activeObservation.evidenceId!==supplementalSeed.descriptor.id||activeObservation.isArchived||activeObservation.version!==1||activeObservation.history.length!==1||activeObservation.history[0].stateAtRevision!=='active')throw new Error('fresh answer history identity absent');
   await call(`${inputBase}/answers/${activeRow.id}/archive`,inputOwner,{method:'PATCH',body:JSON.stringify({expectedVersionId:activeObservation.history.at(-1).id})});
   const seedDbArchived=await readSeedDatabaseRow(true),archived=await call(`${inputBase}/fresh-updates`,inputOwner),archivedTimeline=await timeline(),archivedObservation=find(archivedTimeline);if(archived.freshUpdates.some((row:any)=>row.id===activeRow.id)||!archivedObservation?.isArchived||archivedObservation.history.length!==2||JSON.stringify(immutableHistory(archivedObservation.history.slice(0,1)))!==JSON.stringify(immutableHistory(activeObservation.history))||activeObservation.history[0].stateAtRevision!=='active'||archivedObservation.history.at(-1).stateAtRevision!=='archived')throw new Error('archived answer remained active or history changed incorrectly');
   await call(`${inputBase}/answers/${activeRow.id}/restore`,inputOwner,{method:'PATCH',body:JSON.stringify({expectedVersionId:archivedObservation.history.at(-1).id})});
   const seedDbRestored=await readSeedDatabaseRow(false),restored=await call(`${inputBase}/fresh-updates`,inputOwner),restoredRow=restored.freshUpdates.find((row:any)=>row.id===activeRow.id),seedApiRestored=assertSupplementalQuestionInputApiRow(restoredRow,supplementalSeed.descriptor,seedDbRestored.createdAt),restoredTimeline=await timeline(),restoredObservation=find(restoredTimeline);if(!restoredRow||restoredObservation?.isArchived||restoredObservation.history.length!==3||JSON.stringify(immutableHistory(restoredObservation.history.slice(0,2)))!==JSON.stringify(immutableHistory(archivedObservation.history))||restoredObservation.history.at(-1).stateAtRevision!=='active')throw new Error('restored answer absent or history not append-only');
   const afterTimelines:any[]=[];for(const owner of fixture.owners)for(const recipientId of owner.recipientIds)afterTimelines.push({ownerId:owner.id,recipientId,timeline:await call(`/v2/recipients/${recipientId}/timeline`,owner.id)});
   const unaffectedRecipients:any[]=[],targetSources:any[]=[];
   for(const before of beforeTimelines){const after=afterTimelines.find(row=>row.ownerId===before.ownerId&&row.recipientId===before.recipientId);if(before.ownerId!==inputOwner||before.recipientId!==inputRecipient){if(JSON.stringify(after.timeline)!==JSON.stringify(before.timeline))throw new Error('unaffected recipient history changed during archive restore');unaffectedRecipients.push({ownerId:before.ownerId,recipientId:before.recipientId,before:before.timeline,after:after.timeline});continue;}const seedItems=before.timeline.items.filter((row:any)=>row.evidenceId===supplementalSeed.descriptor.id);if(seedItems.length!==1)throw new Error('supplemental source inventory mismatch');for(const item of before.timeline.items.filter((row:any)=>row.evidenceId&&row.evidenceId!==supplementalSeed.descriptor.id)){const current=after.timeline.items.find((row:any)=>row.evidenceId===item.evidenceId);if(JSON.stringify(current)!==JSON.stringify(item))throw new Error('unaffected source projection/history changed during archive restore');targetSources.push({evidenceId:item.evidenceId,before:item,after:current});}}
   questionInputIntegrity={kind:'BRAIN-QUESTION-INPUT-PERSISTENCE',origin:'synthetic_fixture_loader',seed:{descriptor:supplementalSeed.descriptor,hash:supplementalSeed.hash,baseFixtureHash:fixtureHash,database:{beforeArchive:seedDbBeforeArchive,archived:seedDbArchived,restored:seedDbRestored},api:{beforeArchive:seedApiBeforeArchive,restored:seedApiRestored}},ownerId:inputOwner,recipientId:inputRecipient,answerId:activeRow.id,answerText:activeRow.answerText,versionIds:restoredObservation.history.map((row:any)=>row.id),active:{row:activeRow,observation:activeObservation},archived:{activeRows:archived.freshUpdates,observation:archivedObservation},restored:{row:restoredRow,observation:restoredObservation},unaffectedRecipients,targetSources,archivedExcluded:true,restoredActive:true,historicalPreserved:true,foreignHistoryUnchanged:true,unaffectedSourceHistoriesUnchanged:true,apiCreationQualified:false,providerClassificationQualified:false,pointsOutcomeQualified:false};
 }else{
   const prior=JSON.parse(readFileSync(evidencePath,'utf8')).questionInputIntegrity,restored=await call(`${inputBase}/fresh-updates`,inputOwner),timeline=await call(`${inputBase}/timeline`,inputOwner),observation=timeline.items.find((item:any)=>item.evidenceId===prior.answerId);
   const seedDbAfterRestart=await readSeedDatabaseRow(false),row=restored.freshUpdates.find((row:any)=>row.id===prior.answerId&&row.answerText===prior.answerText),seedApiAfterRestart=assertSupplementalQuestionInputApiRow(row,supplementalSeed.descriptor,seedDbAfterRestart.createdAt);if(!row||observation?.isArchived||JSON.stringify(observation)!==JSON.stringify(prior.restored.observation)||JSON.stringify(row)!==JSON.stringify(prior.restored.row)||JSON.stringify(seedDbAfterRestart)!==JSON.stringify(prior.seed.database.restored)||JSON.stringify(seedApiAfterRestart)!==JSON.stringify(prior.seed.api.restored))throw new Error('question input archive/restore state did not survive restart');
   console.log(`QUESTION_INPUT_RESTART_OBSERVATION ${JSON.stringify({database:seedDbAfterRestart,api:seedApiAfterRestart,observation})}`);
   questionInputIntegrity=prior;
 }
 const questionState=await captureCurrentQuestionState();
 const snapshots=[];
 for(const owner of fixture.owners){
   // Ensure initial retained history has been materialized before the durable baseline.
   if(!afterRestart)await call('/v2/concierge',owner.id);
   const recipients=await call('/recipients',owner.id), workspace=await call('/v2/concierge',owner.id);
   const ids=(recipients.recipients??[]).map((r:any)=>r.id).sort();
   if(JSON.stringify(ids)!==JSON.stringify([...owner.recipientIds].sort()))throw new Error('owner recipient inventory mismatch');
   if(!workspace.opportunities?.length||workspace.recommendations?.length>6||workspace.opportunities.filter((o:any)=>o.presentation?.recommendationEligible).length>3)throw new Error('empty Opportunity projection or maximum-three violation');
   for(const opportunity of workspace.opportunities){if(!owner.recipientIds.includes(opportunity.recipient?.id))throw new Error('cross-owner Opportunity');if(!opportunity.timing)throw new Error('missing timing state');}
   const timelines=[];
   for(const id of owner.recipientIds){
     const timeline=await call(`/v2/recipients/${id}/timeline`,owner.id);if(!Array.isArray(timeline.items))throw new Error('missing timeline history');timelines.push({id,timeline});
     const other=fixture.owners.find((o:any)=>o.id!==owner.id).id;
     await call(`/v2/recipients/${id}/timeline`,other).then(()=>{throw new Error('cross-owner timeline succeeded')},e=>{if(!/returned 403|returned 404/.test(String(e)))throw e;});
   }
   const feedback=await call('/v2/concierge/opportunity-feedback',owner.id),followThrough=await call('/v2/concierge/opportunity-follow-through',owner.id);
   const opportunities=opportunitySemantics(workspace);if(owner.id==='brain-qual-owner-a')assertTemporalExamples(opportunities,fixture.expected.restrainedRecipientId);
   snapshots.push({owner:owner.id,ids,timelines,feedback,followThrough,opportunityIds:workspace.opportunities.map((o:any)=>o.id).sort(),opportunities});
 }
 const snapshot={fixtureHash,syntheticRunDate:runDate,semanticCoverage,questionState,questionInputIntegrity,snapshots};
 if(afterRestart)assertPersistedSnapshot(JSON.parse(readFileSync(evidencePath,'utf8')),snapshot);
 else writeFileSync(evidencePath,JSON.stringify(snapshot)+'\n',{flag:'wx'});
 console.log(afterRestart?'Persisted lifecycle/history and ownership reads match pre-restart evidence':'Lifecycle mutations and pre-restart evidence captured');
}
