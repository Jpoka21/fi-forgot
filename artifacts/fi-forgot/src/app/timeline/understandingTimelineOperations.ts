import { timelineService } from '@/app/api/services/timelineService';
import { runTimelineMutation } from './relationshipTimelineMutation';
import type { FiTimelineItem } from './timelineDomain';
type Service=typeof timelineService;
export type InterpretationAction='confirm'|'withdraw'|'reject'|'archive'|'restore';
export function createInterpretationOperation(recipientId:string,text:string,dependencyVersionIds:string[],service:Service=timelineService,operationId=crypto.randomUUID()) {
 return runTimelineMutation(()=>service.createInterpretation(recipientId,{text,dependencyVersionIds,operationId}),()=>service.getTimeline(recipientId),value=>value.items.some(item=>item.type==='interpretation'&&item.actionHistory.some(action=>action.operationId===operationId&&action.action==='create')));
}
export function changeInterpretationOperation(recipientId:string,item:FiTimelineItem,action:InterpretationAction,service:Service=timelineService,operationId=crypto.randomUUID()) {
 return runTimelineMutation(()=>service.changeInterpretation(recipientId,item.id,action,item.revision!,operationId),()=>service.getTimeline(recipientId),value=>value.items.some(current=>current.id===item.id&&current.actionHistory.some(record=>record.operationId===operationId&&record.action===action&&record.expectedRevision===item.revision&&record.newRevision===item.revision!+1)));
}
export function changeAnswerOperation(recipientId:string,item:FiTimelineItem,action:'edit'|'archive'|'restore',text?:string,service:Service=timelineService,operationId=crypto.randomUUID()) {
 const sourceId=item.evidenceId!,versionId=item.history.at(-1)!.id;
 const write=()=>action==='edit'?service.editAnswer(recipientId,sourceId,text!,versionId,operationId):action==='archive'?service.archiveAnswer(recipientId,sourceId,versionId,operationId):service.restoreAnswer(recipientId,sourceId,versionId,operationId);
 return runTimelineMutation(write,()=>service.getTimeline(recipientId),value=>value.items.some(current=>current.evidenceId===sourceId&&current.lastOperationId===operationId&&current.history.at(-1)?.id!==versionId));
}
