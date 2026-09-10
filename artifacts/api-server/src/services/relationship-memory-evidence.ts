import type { PersonalCard, QuestionAnswer } from "@workspace/db";

export type RelationshipEvidenceKind = "user_report" | "generated_card_text" | "user_edited_card_text" | "platform_action" | "profile_date" | "derived" | "unknown";
export type RelationshipEvidenceSemantic = "reported_information" | "generated_content" | "user_edited_content" | "observed_platform_activity" | "profile_information" | "derived_information" | "unclassified";
export const MUTABLE_ANSWER_TRIGGER_TYPES = ["profile_gap", "fresh_update", "follow_up"] as const;
export function isMutableAnswerTriggerType(value: string): boolean {
  return (MUTABLE_ANSWER_TRIGGER_TYPES as readonly string[]).includes(value);
}
export interface RelationshipMemoryEvidence {
  displayId: string; evidenceId: string | null; memberEvidenceIds: string[];
  sourceIdentity?: null; relationshipIdentity?: null; provenance?: null; confidence?: null;
  sourceKind: RelationshipEvidenceKind; semanticClassification: RelationshipEvidenceSemantic;
  activityKind: "profile_gap" | "fresh_update" | "follow_up_answer" | "event_briefing" | "card" | "important_date" | "unknown";
  recordedAt: string | null; activityAt: string | null; occurrenceAt: string | null; observationAt: string | null;
  archivedAt: string | null; label: string; summary: string; source: string;
  canEdit: boolean; canArchive: boolean; canRestore: boolean;
}
const LABELS: Record<string, string> = { things_to_avoid:"Things to avoid", interests:"Interests", favorite_memories:"Favorite memories", inside_jokes:"Inside jokes", personality_notes:"Personality notes", personality_traits:"Personality traits", preferred_tone:"Preferred tone", emotional_openness:"Emotional openness", always_include:"Always include", birthday:"Birthday", anniversary:"Anniversary", delivery_preference:"Delivery preference", briefing_answers:"General notes", recent_memory:"Recent memory", current_excitement:"Current excitement", current_challenge:"Current challenge", recent_accomplishment:"Recent accomplishment", family_news:"Family & home life", new_hobby:"New hobby or interest", anything_to_remember:"Anything to remember" };
export function validIso(value: Date | string | null | undefined): string | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
export interface FollowUpEvidenceSource {
  id: string; status: string; originalAnswer: string;
  answeredAt: Date | null; triggerDate: Date; createdAt: Date;
}
export function projectRelationshipMemoryEvidence(input: { answers?: QuestionAnswer[]; cards?: PersonalCard[]; followUps?: FollowUpEvidenceSource[]; profileDates?: Array<{ kind:"birthday"|"anniversary"; value:string|null }> }): RelationshipMemoryEvidence[] {
  const result: RelationshipMemoryEvidence[] = []; const groups = new Map<string, QuestionAnswer[]>();
  for (const answer of input.answers ?? []) {
    if (answer.triggerType === "event_briefing" && answer.archivedAt == null) { const key=`${answer.eventType}_${answer.eventYear}`; groups.set(key,[...(groups.get(key)??[]),answer]); continue; }
    const archivedAt=validIso(answer.archivedAt);
    const evidenceId=typeof answer.id === "string" && answer.id.trim() ? answer.id : null;
    const activityKind = answer.triggerType === "fresh_update" ? "fresh_update" : answer.triggerType === "follow_up" ? "follow_up_answer" : answer.triggerType === "profile_gap" ? "profile_gap" : "unknown";
    const mutable=isMutableAnswerTriggerType(answer.triggerType);
    result.push({ displayId:evidenceId??`unidentified_answer_${result.length}`,evidenceId,memberEvidenceIds:evidenceId?[evidenceId]:[],sourceKind:"user_report",semanticClassification:"reported_information",activityKind,recordedAt:validIso(answer.createdAt),activityAt:null,occurrenceAt:null,observationAt:null,archivedAt,label:LABELS[answer.questionKey]??answer.questionKey,summary:answer.answerText,source:"Reported by you",canEdit:mutable&&!!evidenceId&&!archivedAt,canArchive:mutable&&!!evidenceId&&!archivedAt,canRestore:mutable&&!!evidenceId&&!!archivedAt });
  }
  for (const [key,group] of groups) { const first=group[0]!; const members=group.map(r=>r.id).filter((id):id is string=>typeof id==="string"&&!!id.trim()); const latest=group.map(r=>validIso(r.createdAt)).filter((v):v is string=>!!v).sort().at(-1)??null;
    result.push({displayId:`briefing_${key}`,evidenceId:group.length===1?(members[0]??null):null,memberEvidenceIds:members,sourceKind:"user_report",semanticClassification:"reported_information",activityKind:"event_briefing",recordedAt:latest,activityAt:null,occurrenceAt:null,observationAt:null,archivedAt:null,label:`${first.eventType} ${first.eventYear}`,summary:group.length===1?first.answerText:`${group.length} reported answers`,source:"Event briefing reported by you",canEdit:false,canArchive:false,canRestore:false}); }
  for (const card of input.cards ?? []) { if(card.status==="draft")continue; const recordedAt=validIso(card.createdAt); const message=card.messageFinal??card.messageOriginal??"";
    const wasEdited=(card as PersonalCard & {wasEdited?:boolean}).wasEdited;
    const contentProvenance=wasEdited===true
      ? {sourceKind:"user_edited_card_text" as const,semanticClassification:"user_edited_content" as const,source:"Card text edited by you"}
      : wasEdited===false
        ? {sourceKind:"generated_card_text" as const,semanticClassification:"generated_content" as const,source:"Generated card text"}
        : {sourceKind:"unknown" as const,semanticClassification:"unclassified" as const,source:"Card text (provenance unknown)"};
    result.push({displayId:`card_${card.id}_content`,evidenceId:card.id,memberEvidenceIds:[card.id],...contentProvenance,activityKind:"card",recordedAt,activityAt:validIso(card.approvedAt ?? card.createdAt),occurrenceAt:null,observationAt:null,archivedAt:null,label:`${card.eventType} card`,summary:message.slice(0,120),canEdit:false,canArchive:false,canRestore:false});
    if (card.status === "mailed" && card.mailedAt) result.push({displayId:`card_${card.id}_mailed`,evidenceId:card.id,memberEvidenceIds:[card.id],sourceKind:"platform_action",semanticClassification:"observed_platform_activity",activityKind:"card",recordedAt:null,activityAt:validIso(card.mailedAt),occurrenceAt:null,observationAt:null,archivedAt:null,label:`${card.eventType} card mailed`,summary:"",source:"Card mailing activity",canEdit:false,canArchive:false,canRestore:false}); }
  for(const profile of input.profileDates??[]){if(!profile.value)continue;result.push({displayId:`profile_date_${profile.kind}`,evidenceId:null,memberEvidenceIds:[],sourceKind:"profile_date",semanticClassification:"profile_information",activityKind:"important_date",recordedAt:null,activityAt:null,occurrenceAt:validIso(profile.value),observationAt:null,archivedAt:null,label:profile.kind==="birthday"?"Birthday":"Anniversary",summary:profile.value,source:"Recipient profile date",canEdit:false,canArchive:false,canRestore:false});}
  for (const followUp of input.followUps ?? []) {
    const activityAt = validIso(followUp.answeredAt ?? followUp.triggerDate);
    const statusLabel = followUp.status === "answered" ? "Answered follow-up" : followUp.status === "expired" ? "Follow-up expired" : "Follow-up pending";
    result.push({displayId:`followup_${followUp.id}`,evidenceId:followUp.id,memberEvidenceIds:[followUp.id],sourceKind:"platform_action",semanticClassification:"observed_platform_activity",activityKind:"follow_up_answer",recordedAt:validIso(followUp.createdAt),activityAt,occurrenceAt:null,observationAt:null,archivedAt:null,label:"Follow Up",summary:`Follow-up on: \"${followUp.originalAnswer.slice(0,80)}\"`,source:statusLabel,canEdit:false,canArchive:false,canRestore:false});
  }
  const time=(e:RelationshipMemoryEvidence)=>Date.parse(e.activityAt??e.recordedAt??e.occurrenceAt??"");
  return result.sort((a,b)=>(Number.isFinite(time(b))?time(b):-Infinity)-(Number.isFinite(time(a))?time(a):-Infinity));
}

export function projectActiveRelationshipMemoryEvidence(input: Parameters<typeof projectRelationshipMemoryEvidence>[0]): RelationshipMemoryEvidence[] {
  return projectRelationshipMemoryEvidence(input).filter((evidence) => evidence.archivedAt === null);
}

export type RelationshipAnswerMutation =
  | { action: "edit"; answerText: string }
  | { action: "archive" }
  | { action: "restore" };
export interface RelationshipAnswerRecord {
  id: string; userId: string; recipientId: string; triggerType: string;
  answerText: string; archivedAt: Date | null;
}
export interface RelationshipAnswerScope { userId: string; recipientId: string; answerId: string }
export interface RelationshipAnswerRepository {
  read(scope: RelationshipAnswerScope): Promise<RelationshipAnswerRecord | null>;
  write(scope: RelationshipAnswerScope, mutation: RelationshipAnswerMutation, expectedArchived: boolean): Promise<RelationshipAnswerRecord | null>;
}
export type RelationshipAnswerMutationResult =
  | { ok: true; status: 200; record: RelationshipAnswerRecord }
  | { ok: false; status: 400 | 404 | 409; error: string };

export async function executeRelationshipAnswerMutation(
  repository: RelationshipAnswerRepository,
  scope: RelationshipAnswerScope,
  mutation: RelationshipAnswerMutation,
): Promise<RelationshipAnswerMutationResult> {
  if (mutation.action === "edit" && !mutation.answerText.trim()) return { ok:false, status:400, error:"answerText is required" };
  const record = await repository.read(scope);
  if (!record) return { ok:false, status:404, error:"Answer not found" };
  if (!isMutableAnswerTriggerType(record.triggerType)) return { ok:false, status:404, error:"Answer not found" };
  const expectedArchived = mutation.action === "restore";
  if ((record.archivedAt !== null) !== expectedArchived) return { ok:false, status:409, error: expectedArchived ? "Answer is already active" : "Answer is already archived" };
  const updated = await repository.write(scope, mutation.action === "edit" ? { ...mutation, answerText:mutation.answerText.trim() } : mutation, expectedArchived);
  return updated ? { ok:true, status:200, record:updated } : { ok:false, status:409, error:"Answer state changed before the update completed" };
}
