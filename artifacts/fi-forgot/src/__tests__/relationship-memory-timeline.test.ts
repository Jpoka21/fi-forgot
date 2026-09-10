import { normalizeTimelineItem } from "../app/timeline/timelineDomain.js";
import { formatTimelineDate } from "../app/timeline/timelineEngine.js";
import { applyTimelineMutationOutcome, runTimelineMutation, type TimelineMutationAction } from "../app/timeline/relationshipTimelineMutation.js";
import { timelineService } from "../app/api/services/timelineService.js";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { RelationshipTimelineController } from "../app/timeline/hooks/useRelationshipTimeline.js";

(globalThis as typeof globalThis & { React: typeof React }).React = React;
const { FiRelationshipTimelineView } = await import("../app/components/timeline/FiRelationshipTimeline.js");
const item = normalizeTimelineItem({ id:"x", date:"", type:"future_kind", label:"Unknown", summary:"", source:"", canArchive:false, canEdit:false, isArchived:false });
if (!item || item.type !== "unknown") throw new Error("unknown kind became a profile fact");
if (item.evidenceId !== null || item.occurrenceAt !== null || item.observationAt !== null) throw new Error("missing evidence fields were inferred");
const unknownDate=normalizeTimelineItem({id:"n",date:null,type:"user_report",sourceKind:"user_report",semanticClassification:"reported_information",label:"Report",summary:"",source:"Reported",canArchive:true,canEdit:true,isArchived:false});
if(!unknownDate||unknownDate.date!==null||unknownDate.sourceKind!=="user_report"||unknownDate.semanticClassification!=="reported_information")throw new Error("source metadata or unknown date was lost");
const invalidDate=normalizeTimelineItem({id:"bad-date",date:"not-a-date",type:"user_report",label:"Report",summary:"",source:"Reported",recordedAt:"also-bad",activityAt:"",occurrenceAt:undefined,observationAt:"invalid",canArchive:false,canEdit:false,isArchived:false});
if(!invalidDate||invalidDate.date!==null||invalidDate.recordedAt!==null||invalidDate.activityAt!==null||invalidDate.occurrenceAt!==null||invalidDate.observationAt!==null||formatTimelineDate(invalidDate.date)!=="Unknown date")throw new Error("invalid timestamps were rendered or invented");
const editedCard=normalizeTimelineItem({id:"card",date:"2026-01-01T00:00:00Z",type:"user_edited_card_text",sourceKind:"user_edited_card_text",semanticClassification:"user_edited_content",label:"Birthday card",summary:"my correction",source:"Card text edited by you",canArchive:false,canEdit:false,isArchived:false});
if(!editedCard||editedCard.type!=="user_edited_card_text"||editedCard.semanticClassification!=="user_edited_content")throw new Error("card edit provenance was lost in transport normalization");
const originalFetch=globalThis.fetch;
globalThis.fetch=async()=>new Response(JSON.stringify({error:"denied"}),{status:409,headers:{"content-type":"application/json"}});
try{await timelineService.archiveAnswer("r","e");throw new Error("HTTP failure resolved as success");}catch(error){if((error as Error).message==="HTTP failure resolved as success")throw error;}
globalThis.fetch=async()=>{throw new TypeError("network lost");};
try{await timelineService.editAnswer("r","e","text");throw new Error("network failure resolved as success");}catch(error){if((error as Error).message==="network failure resolved as success")throw error;}
let restoreCalls=0;globalThis.fetch=async()=>{restoreCalls++;return new Response(JSON.stringify({ok:true}),{status:200,headers:{"content-type":"application/json"}});};
await timelineService.restoreAnswer("r","e");if(restoreCalls!==1)throw new Error("restore transport was not executed exactly once");globalThis.fetch=originalFetch;
globalThis.fetch=async()=>new Response(JSON.stringify({error:"offline"}),{status:503,headers:{"content-type":"application/json"}});try{await timelineService.getTimeline("r");throw new Error("failed GET became authoritative");}catch(error){if((error as Error).message==="failed GET became authoritative")throw error;}
globalThis.fetch=async()=>new Response(JSON.stringify({wrong:[]}),{status:200,headers:{"content-type":"application/json"}});try{await timelineService.getTimeline("r");throw new Error("invalid payload became empty timeline");}catch(error){if((error as Error).message==="invalid payload became empty timeline")throw error;}
globalThis.fetch=async()=>new Response(JSON.stringify({items:[]}),{status:200,headers:{"content-type":"application/json"}});if((await timelineService.getTimeline("r")).items.length!==0)throw new Error("genuine empty timeline failed");globalThis.fetch=originalFetch;
let writes=0,reloads=0;
let outcome=await runTimelineMutation(async()=>{writes++;throw new Error("network");},async()=>{reloads++;return["authoritative"];});
if(outcome.kind!=="write_failed_reloaded"||writes!==1||reloads!==1)throw new Error("ambiguous write was retried or not reloaded");
outcome=await runTimelineMutation(async()=>{writes++;throw new Error("lost response");},async()=>{reloads++;return["committed"];},value=>value[0]==="committed");
if(outcome.kind!=="confirmed_after_ambiguous_write")throw new Error("authoritative committed state was reported as request failure");
outcome=await runTimelineMutation(async()=>{writes++;},async()=>{reloads++;throw new Error("reload");});
if(outcome.kind!=="write_confirmed_reload_failed")throw new Error("confirmed write/reload failure misreported");
outcome=await runTimelineMutation(async()=>{writes++;},async()=>{reloads++;return["restored"];},value=>value[0]==="restored");
if(outcome.kind!=="confirmed"||outcome.value[0]!=="restored")throw new Error("successful authoritative restore failed");
for(const action of ["edit","archive","restore"]){const before=writes;outcome=await runTimelineMutation(async()=>{writes++;},async()=>{reloads++;return[`${action}-old-state`];},()=>false);if(outcome.kind!=="write_resolved_state_mismatch"||writes!==before+1)throw new Error(`${action} mismatch produced false success or duplicate write`);}
outcome=await runTimelineMutation(async()=>{writes++;throw new Error("lost response");},async()=>{reloads++;throw new Error("offline");});
if(outcome.kind!=="write_failed_stale")throw new Error("unconfirmed outcome was asserted unchanged");
outcome=await runTimelineMutation(async()=>{writes++;},async()=>{throw new Error("production GET rejected");},()=>true);if(outcome.kind!=="write_confirmed_reload_failed")throw new Error("failed authoritative reload was treated as confirmed");
if(!unknownDate)throw new Error("timeline fixture missing");
let appliedItems=[unknownDate],appliedMutationError:string|null=null,confirmedApplications=0;
const connectedMismatch=await runTimelineMutation(async()=>undefined,async()=>({items:[unknownDate]}),()=>false);
applyTimelineMutationOutcome("edit",connectedMismatch,{
  setItems:(next)=>{appliedItems=next as typeof appliedItems;},
  setMutationError:(next)=>{appliedMutationError=next;},
  onConfirmed:()=>{confirmedApplications++;},
});
if(!appliedMutationError||confirmedApplications!==0||appliedItems[0]?.id!=="n")throw new Error("production mutation application falsely confirmed or lost authoritative items");
for(const action of ["edit","archive","restore"] as TimelineMutationAction[]){
  let closes=0,events=0,error:string|null="old";
  const rejected=await runTimelineMutation(async()=>{throw new Error("network");},async()=>({items:[unknownDate]}),()=>false);
  applyTimelineMutationOutcome(action,rejected,{setItems:()=>{},setMutationError:(next)=>{error=next;},onConfirmed:()=>{closes++;events++;}});
  if(!error||closes||events)throw new Error(`${action} rejection produced false success application`);
  const accepted=await runTimelineMutation(async()=>undefined,async()=>({items:[unknownDate]}),()=>true);
  applyTimelineMutationOutcome(action,accepted,{setItems:()=>{},setMutationError:(next)=>{error=next;},onConfirmed:()=>{closes++;events++;}});
  if(error!==null||closes!==1||events!==1)throw new Error(`${action} confirmation was not applied exactly once`);
}
const visibleFailureController={
  items:appliedItems,filteredItems:appliedItems,visibleItems:appliedItems,
  groupedItems:[{key:"unknown",label:"Unknown date",items:appliedItems}],
  filter:"all",query:"",debouncedQuery:"",isLoading:false,isRefreshing:false,
  error:null,mutationError:appliedMutationError,
  hasMore:false,editingId:"n",confirmArchiveId:null,showEmpty:false,showResults:true,
  setQuery:()=>{},setFilter:()=>{},setEditingId:()=>{},setConfirmArchiveId:()=>{},
  refresh:async()=>true,loadMore:()=>{},archiveItem:async()=>{},saveEdit:async()=>{},restoreItem:async()=>{},
} as unknown as RelationshipTimelineController;
const visibleFailureHtml=renderToStaticMarkup(FiRelationshipTimelineView({timeline:visibleFailureController}));
if(!visibleFailureHtml.includes("correction outcome could not be confirmed")||!visibleFailureHtml.includes("Save"))throw new Error("connected production mutation application hid feedback or closed the editor");
const controlsFailureHtml=renderToStaticMarkup(FiRelationshipTimelineView({timeline:{...visibleFailureController,editingId:null} as RelationshipTimelineController}));
if(!controlsFailureHtml.includes("correction outcome could not be confirmed")||!controlsFailureHtml.includes("Edit")||!controlsFailureHtml.includes("Archive"))throw new Error("connected production mutation application hid retained controls");
console.log("relationship memory timeline passed");
