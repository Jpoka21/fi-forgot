import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export const supplementalQuestionInputSeed = Object.freeze({
  id: "qa-r1-archive-restore-supplemental",
  userId: "brain-qual-owner-a",
  recipientId: "brain-qual-a-r1",
  eventType: "qualification_synthetic",
  questionKey: "anything_to_remember",
  questionText: "Anything else worth remembering?",
  answerText: "Synthetic active archive restore evidence",
  wasSkipped: false,
  triggerType: "fresh_update",
  importanceScore: null,
  archivedAt: null,
});

export function effectiveSupplementalQuestionInputSeed(syntheticRunDate: string) {
  assert.match(syntheticRunDate, /^\d{4}-\d{2}-\d{2}$/);
  return { ...supplementalQuestionInputSeed, eventYear: Number(syntheticRunDate.slice(0, 4)) };
}

export function supplementalQuestionInputSeedHash(syntheticRunDate: string) {
  return createHash("sha256").update(JSON.stringify(effectiveSupplementalQuestionInputSeed(syntheticRunDate))).digest("hex");
}

export function validateSupplementalQuestionInputSeed(fixture: any, syntheticRunDate: string) {
  const descriptor = effectiveSupplementalQuestionInputSeed(syntheticRunDate);
  assert.ok(fixture.owners.some((owner: any) => owner.id === descriptor.userId));
  assert.ok(fixture.recipients.some((recipient: any) => recipient.id === descriptor.recipientId && recipient.userId === descriptor.userId));
  assert.ok(!fixture.questionAnswers.some((answer: any) => answer.id === descriptor.id), "supplemental question input ID collision");
  return { descriptor, hash: supplementalQuestionInputSeedHash(syntheticRunDate) };
}

const iso = (value: unknown) => {
  if (value instanceof Date) {
    assert.ok(Number.isFinite(value.getTime()), "supplemental seed requires an actual recorded timestamp");
    return value.toISOString();
  }
  if (typeof value !== "string") assert.fail("supplemental seed requires a Date or timestamp string");
  const time = new Date(value).getTime();
  assert.ok(Number.isFinite(time), "supplemental seed requires an actual recorded timestamp");
  return new Date(time).toISOString();
};

export function assertSupplementalQuestionInputDatabaseRow(row: any, descriptor: any, archived: boolean) {
  assert.deepEqual({id:row?.id,userId:row?.userId,recipientId:row?.recipientId,eventType:row?.eventType,eventYear:row?.eventYear,questionKey:row?.questionKey,questionText:row?.questionText,answerText:row?.answerText,wasSkipped:row?.wasSkipped,triggerType:row?.triggerType,importanceScore:row?.importanceScore},{id:descriptor.id,userId:descriptor.userId,recipientId:descriptor.recipientId,eventType:descriptor.eventType,eventYear:descriptor.eventYear,questionKey:descriptor.questionKey,questionText:descriptor.questionText,answerText:descriptor.answerText,wasSkipped:descriptor.wasSkipped,triggerType:descriptor.triggerType,importanceScore:descriptor.importanceScore});
  assert.equal(archived, row.archivedAt !== null);
  return { ...row, createdAt: iso(row.createdAt), archivedAt: row.archivedAt === null ? null : iso(row.archivedAt) };
}

export function assertSupplementalQuestionInputApiRow(row: any, descriptor: any, recordedCreatedAt: string) {
  assert.deepEqual({id:row?.id,questionKey:row?.questionKey,questionText:row?.questionText,answerText:row?.answerText,importanceScore:row?.importanceScore,createdAt:row?.createdAt},{id:descriptor.id,questionKey:descriptor.questionKey,questionText:descriptor.questionText,answerText:descriptor.answerText,importanceScore:descriptor.importanceScore,createdAt:recordedCreatedAt});
  return structuredClone(row);
}
export function assertQuestionInputIntegrity(section:any,expected:any){assert.equal(section?.kind,"BRAIN-QUESTION-INPUT-INTEGRITY");assert.equal(section.nonce,expected.nonce);assert.equal(section.sessionId,expected.sessionId);assert.equal(section.sourceHash,expected.sourceHash);assert.equal(section.snapshotHash,expected.snapshotHash);assert.equal(section.archiveRestore?.historicalPreserved,true);assert.equal(section.archiveRestore?.archivedExcluded,true);assert.equal(section.archiveRestore?.restoredActive,true);assert.equal(section.mountedHook?.success,true);assert.equal(section.mountedHook?.mockedReact,false);assert.equal(section.mountedHook?.bundleHash,expected.bundleHash);assert.equal(section.browserTransport?.exactRecipientIds,true);return true;}
