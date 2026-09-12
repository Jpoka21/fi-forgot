export function qualificationProfiles(fixture:{qualificationTiming:{previewDays:number};recipients:Array<{id:string}>}){
 if(fixture.qualificationTiming.previewDays!==14||new Set(fixture.recipients.map(x=>x.id)).size!==fixture.recipients.length)throw Error('FAIL_CLOSED: synthetic profile configuration mismatch');
 return fixture.recipients.map(({id})=>({id,recipientId:id,previewDays:fixture.qualificationTiming.previewDays}));
}
/** Missing temporal identity remains a failure, with fixed safe diagnostic fields. */
export function selectDatedQualificationOpportunity(workspace:any){
 const opportunities=Array.isArray(workspace?.opportunities)?workspace.opportunities:[];
 const selected=opportunities.find((o:any)=>typeof o.id==='string'&&o.id.length>0&&typeof o.recipient?.id==='string'&&o.recipient.id.length>0&&typeof o.timing?.temporal?.occurrenceCycleId==='string'&&o.timing.temporal.occurrenceCycleId.length>0);
 if(selected)return selected;
 const rules=['birthday','anniversary','valentines_day','inactivity','fresh_update','life_event_follow_up','card_gap','memory_accumulation','accomplishment_follow_up','wait'];
 const known=(value:unknown,values:string[])=>values.includes(String(value))?value:'OTHER';
 const diagnostics=opportunities.slice(0,16).map((o:any)=>({sourceRule:known(o.provenance?.sourceId,rules),family:known(o.timing?.temporal?.family,['annual_recurring','one_time','unsupported']),state:known(o.timing?.temporal?.state,['valid_now','premature','approaching_relevance','stale','expired','unknown']),temporalReason:known(o.timing?.temporal?.restraintReason,['unsupported_temporal_family','unknown_date','missing_date','invalid_date','not_yet_relevant','expired','stale']),cyclePresent:typeof o.timing?.temporal?.occurrenceCycleId==='string',recommendationPresent:o.recommendation!=null}));
 throw Error('FAIL_CLOSED: production Opportunity lacks mutation identity '+JSON.stringify(diagnostics));
}

/** Empty optional profile data matches normal recipient creation, not observed facts. */
export function qualificationPersonalRecipients(fixture:any,relativeDate:(offset:number)=>string){
 const defaults=fixture.personalRecipientDefaults;
 if(!defaults||Object.keys(defaults).sort().join(',')!=='customDates,favoriteMemories,insideJokes,selectedEvents'||!Array.isArray(defaults.customDates)||defaults.customDates.length||!Array.isArray(defaults.selectedEvents)||defaults.selectedEvents.length||defaults.favoriteMemories!==''||defaults.insideJokes!=='')throw Error('FAIL_CLOSED: synthetic personal recipient defaults mismatch');
 return fixture.recipients.map((x:any)=>({id:x.id,userId:x.userId,data:{id:x.id,name:x.firstName,relationship:x.relationshipType,birthday:fixture.qualificationTiming.birthdayOffsetsDays[x.id]!=null?relativeDate(fixture.qualificationTiming.birthdayOffsetsDays[x.id]):x.birthday,anniversaryDate:x.anniversary,active:true,customDates:[],selectedEvents:[],favoriteMemories:'',insideJokes:''}}));
}
