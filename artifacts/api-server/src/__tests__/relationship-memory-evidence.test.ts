import { isMutableAnswerTriggerType, projectRelationshipMemoryEvidence, validIso } from "../services/relationship-memory-evidence.js";
import type { PersonalCard, QuestionAnswer } from "@workspace/db";
import { loadRelationshipContext } from "../brain/context/loadRelationshipContext.js";

const answer = (id: string, triggerType = "fresh_update", createdAt: Date = new Date("2026-01-02T12:00:00Z")) => ({
  id, triggerType, createdAt, archivedAt: null, eventType: "birthday", eventYear: 2026,
  questionKey: "recent_memory", answerText: `answer-${id}`,
}) as QuestionAnswer;
const single = projectRelationshipMemoryEvidence({ answers: [answer("a1")] })[0]!;
if (single.evidenceId !== "a1" || single.memberEvidenceIds.join() !== "a1") throw new Error("single evidence identity was not preserved");
if (single.recordedAt !== "2026-01-02T12:00:00.000Z" || single.occurrenceAt !== null || single.observationAt !== null) throw new Error("answer time semantics were conflated");
if (single.semanticClassification !== "reported_information") throw new Error("user report was promoted to fact");
const grouped = projectRelationshipMemoryEvidence({ answers: [answer("b1", "event_briefing"), answer("b2", "event_briefing")] })[0]!;
if (grouped.evidenceId !== null || grouped.memberEvidenceIds.join() !== "b1,b2" || !grouped.displayId.startsWith("briefing_")) throw new Error("group membership/display identity contract failed");
if (validIso("not-a-date") !== null) throw new Error("invalid date was invented");
const oneMemberGroup = projectRelationshipMemoryEvidence({ answers: [answer("only", "event_briefing")] })[0]!;
if (oneMemberGroup.evidenceId !== "only" || oneMemberGroup.memberEvidenceIds.join() !== "only") throw new Error("single-member group lost provenance");
const mailed = projectRelationshipMemoryEvidence({ cards: [{ id:"c1", status:"mailed", eventType:"birthday", createdAt:new Date("2026-01-01Z"), mailedAt:new Date("2026-01-03Z"), messageFinal:"hello", wasEdited:false } as PersonalCard] });
if (mailed.length !== 2 || !mailed.some(e => e.sourceKind === "generated_card_text") || !mailed.some(e => e.sourceKind === "platform_action")) throw new Error("generated content and mailing activity were conflated");
const editedCard=projectRelationshipMemoryEvidence({cards:[{id:"edited",status:"approved",eventType:"birthday",createdAt:new Date("2026-01-01Z"),messageOriginal:"generated draft",messageFinal:"my correction",wasEdited:true} as PersonalCard]})[0]!;
if(editedCard.sourceKind!=="user_edited_card_text"||editedCard.semanticClassification!=="user_edited_content"||editedCard.summary!=="my correction"||!editedCard.source.includes("edited by you")||editedCard.observationAt!==null)throw new Error("known card edit provenance was discarded or embellished");
const unknownCard=projectRelationshipMemoryEvidence({cards:[{id:"unknown",status:"approved",eventType:"birthday",createdAt:new Date("2026-01-01Z"),messageFinal:"text",wasEdited:undefined} as unknown as PersonalCard]})[0]!;
if(unknownCard.sourceKind!=="unknown"||unknownCard.semanticClassification!=="unclassified"||!unknownCard.source.includes("unknown"))throw new Error("unknown card provenance was invented");
if (isMutableAnswerTriggerType("event_briefing") || !isMutableAnswerTriggerType("fresh_update")) throw new Error("supported mutation kinds are incorrect");
const absent=projectRelationshipMemoryEvidence({answers:[{...answer("temporary"),id:undefined,createdAt:new Date("invalid")} as unknown as QuestionAnswer]})[0]!;
if(absent.evidenceId!==null||absent.memberEvidenceIds.length!==0||absent.recordedAt!==null||absent.canEdit||absent.canArchive||absent.sourceIdentity!==undefined||absent.relationshipIdentity!==undefined||absent.confidence!==undefined)throw new Error("missing identity, metadata, or invalid date was invented");
let assembledFor:string|null=null;const loaded=await loadRelationshipContext("recipient-only","user",async(recipientId)=>{assembledFor=recipientId;return {} as never;});
if(assembledFor!=="recipient-only"||loaded.recipientId!=="recipient-only"||loaded.relationshipId!==null)throw new Error("recipient lookup identity was exposed as relationship identity");
console.log("relationship memory evidence passed");
