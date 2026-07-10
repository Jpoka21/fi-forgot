/**
 * Brain outcome persistence tests (Step 6c).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-outcomes-persistence.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertValidOutcomeMetadataCorrelation,
  assertValidRecordBrainOutcomeInput,
  createInMemoryBrainOutcomeRepository,
  createPersistentBrainOutcomeRecorder,
  formatQuestionAnswerSourceActionId,
  type RecordBrainOutcomeInput,
} from "../brain/outcomes/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");
const OUTCOMES_ROOT = join(BRAIN_ROOT, "outcomes");

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expect(label: string, actual: unknown, expected: unknown): void {
  const ok =
    typeof expected === "object" && expected !== null
      ? JSON.stringify(actual) === JSON.stringify(expected)
      : actual === expected;
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
    console.log(`      expected: ${JSON.stringify(expected)}`);
    console.log(`      received: ${JSON.stringify(actual)}`);
  }
}

function expectTrue(label: string, condition: boolean): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
  }
}

function expectThrows(label: string, fn: () => void): void {
  try {
    fn();
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
  } catch {
    passed++;
    console.log(`  ✓ ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

function listTypeScriptSources(root: string): string {
  const files: string[] = [];

  function walk(directory: string): void {
    for (const entry of readdirSync(directory)) {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.endsWith(".ts")) {
        files.push(readFileSync(fullPath, "utf8"));
      }
    }
  }

  walk(root);
  return files.join("\n");
}

const QUESTION_INPUT: RecordBrainOutcomeInput = {
  userId: "user-1",
  recipientId: "recipient-1",
  opportunityKey: "recipient-1:fresh_update",
  outcomeType: "question_answered",
  occurredAt: new Date("2026-07-10T14:00:00.000Z"),
  metadata: {
    fieldKey: "recent_accomplishment",
    triggerType: "fresh_update",
  },
};

async function run(): Promise<void> {
  section("append creates one persisted event with generated id");
  {
    const repo = createInMemoryBrainOutcomeRepository();
    const event = await repo.append(QUESTION_INPUT);

    expectTrue("event id assigned", typeof event.id === "string" && event.id.length > 0);
    expect("userId", event.userId, "user-1");
    expect("outcomeType", event.outcomeType, "question_answered");
    expect("occurredAt preserved", event.occurredAt, "2026-07-10T14:00:00.000Z");
    expect("metadata persisted", event.metadata, QUESTION_INPUT.metadata);

    const listed = await repo.listOutcomeEventsForUser("user-1");
    expect("listed count", listed.length, 1);
    expect("listed id", listed[0]?.id, event.id);
  }

  section("multiple identical outcomes remain separate append-only facts");
  {
    const repo = createInMemoryBrainOutcomeRepository();

    const first = await repo.append(QUESTION_INPUT);
    const second = await repo.append(QUESTION_INPUT);

    expectTrue("ids differ", first.id !== second.id);
    const listed = await repo.listOutcomeEventsForUser("user-1");
    expect("append-only count", listed.length, 2);
  }

  section("default occurredAt assignment and ISO normalization");
  {
    const repo = createInMemoryBrainOutcomeRepository();
    const before = Date.now();
    const event = await repo.append({
      userId: "user-1",
      recipientId: "recipient-1",
      opportunityKey: "recipient-1:birthday",
      outcomeType: "card_sent",
      metadata: {
        cardId: "card-1",
        cardStatus: "Mailed to me",
      },
    });
    const after = Date.now();

    const occurredMs = Date.parse(event.occurredAt);
    expectTrue("occurredAt is ISO UTC", event.occurredAt.endsWith("Z"));
    expectTrue("occurredAt assigned near now", occurredMs >= before && occurredMs <= after);
  }

  section("append does not mutate input");
  {
    const repo = createInMemoryBrainOutcomeRepository();
    const input: RecordBrainOutcomeInput = {
      userId: QUESTION_INPUT.userId,
      recipientId: QUESTION_INPUT.recipientId,
      opportunityKey: QUESTION_INPUT.opportunityKey,
      outcomeType: "question_answered",
      metadata: {
        fieldKey: "birthday",
        triggerType: "profile_gap",
      },
    };
    const snapshot = structuredClone(input);

    await repo.append(input);
    expect("input unchanged", input, snapshot);
  }

  section("invalid opportunity identity rejection");
  {
    const repo = createInMemoryBrainOutcomeRepository();

    let rejected = false;
    try {
      await repo.append({
        userId: "user-1",
        recipientId: "recipient-1",
        opportunityKey: "other:birthday",
        outcomeType: "question_answered",
      });
    } catch {
      rejected = true;
    }
    expectTrue("rejects mismatched opportunityKey", rejected);
  }

  section("invalid outcome and metadata combination rejection");
  {
    expectThrows("rejects card metadata on question_answered", () => {
      assertValidOutcomeMetadataCorrelation({
        userId: "user-1",
        recipientId: "recipient-1",
        opportunityKey: "recipient-1:fresh_update",
        outcomeType: "question_answered",
        metadata: {
          cardId: "card-1",
          cardStatus: "Approved",
        },
      } as unknown as RecordBrainOutcomeInput);
    });

    expectThrows("rejects question metadata on card_sent", () => {
      assertValidOutcomeMetadataCorrelation({
        userId: "user-1",
        recipientId: "recipient-1",
        opportunityKey: "recipient-1:birthday",
        outcomeType: "card_sent",
        metadata: {
          fieldKey: "birthday",
          triggerType: "profile_gap",
        },
      } as unknown as RecordBrainOutcomeInput);
    });

    expectThrows("rejects invalid outcome type", () => {
      assertValidRecordBrainOutcomeInput({
        userId: "user-1",
        recipientId: "recipient-1",
        opportunityKey: "recipient-1:birthday",
        outcomeType: "card_draft" as RecordBrainOutcomeInput["outcomeType"],
      });
    });
  }

  section("repository-backed recorder delegates append");
  {
    const repo = createInMemoryBrainOutcomeRepository();
    const recorder = createPersistentBrainOutcomeRecorder(repo);

    await recorder.record({
      userId: "user-2",
      recipientId: "recipient-2",
      opportunityKey: "recipient-2:card_gap",
      outcomeType: "card_approved",
      metadata: {
        cardId: "card-9",
        cardStatus: "Approved",
      },
    });

    const listed = await repo.listOutcomeEventsForUser("user-2");
    expect("recorder persisted one event", listed.length, 1);
    expect("recorder persisted outcomeType", listed[0]?.outcomeType, "card_approved");
  }

  section("user isolation and since filter");
  {
    const repo = createInMemoryBrainOutcomeRepository();

    await repo.append({
      userId: "user-a",
      recipientId: "alice",
      opportunityKey: "alice:birthday",
      outcomeType: "opportunity_dismissed",
      occurredAt: new Date("2026-07-08T10:00:00.000Z"),
      metadata: { dismissSource: "notifications" },
    });

    await repo.append({
      userId: "user-b",
      recipientId: "bob",
      opportunityKey: "bob:fresh_update",
      outcomeType: "question_answered",
      occurredAt: new Date("2026-07-09T10:00:00.000Z"),
      metadata: {
        fieldKey: "recent_memory",
        triggerType: "fresh_update",
      },
    });

    await repo.append({
      userId: "user-a",
      recipientId: "alice",
      opportunityKey: "alice:birthday",
      outcomeType: "card_created",
      occurredAt: new Date("2026-07-10T10:00:00.000Z"),
      metadata: {
        cardId: "card-1",
        cardStatus: "Ready for approval",
      },
    });

    const userAEvents = await repo.listOutcomeEventsForUser("user-a");
    const filtered = await repo.listOutcomeEventsForUser("user-a", {
      since: "2026-07-09T00:00:00.000Z",
    });

    expect("user-a count", userAEvents.length, 2);
    expect("filtered count", filtered.length, 1);
    expect("filtered outcomeType", filtered[0]?.outcomeType, "card_created");
  }

  section("appendOnceForSourceAction idempotency");
  {
    const repo = createInMemoryBrainOutcomeRepository();
    const input = {
      userId: "user-1",
      recipientId: "recipient-1",
      opportunityKey: "recipient-1:accomplishment_follow_up",
      outcomeType: "question_answered" as const,
      sourceActionId: formatQuestionAnswerSourceActionId("answer-idempotent-1"),
      metadata: {
        fieldKey: "accomplishment_follow_up_01",
        triggerType: "fresh_update" as const,
      },
    };

    const first = await repo.appendOnceForSourceAction(input);
    const second = await repo.appendOnceForSourceAction(input);

    expect("first status", first.status, "appended");
    expect("second status", second.status, "already_exists");
    expect("same event id", second.event.id, first.event.id);

    const listed = await repo.listOutcomeEventsForUser("user-1");
    expect("one persisted outcome", listed.length, 1);
  }

  section("appendOnceForSourceAction distinct sourceActionIds remain separate");
  {
    const repo = createInMemoryBrainOutcomeRepository();
    const base = {
      userId: "user-1",
      recipientId: "recipient-1",
      opportunityKey: "recipient-1:fresh_update",
      outcomeType: "question_answered" as const,
      metadata: {
        fieldKey: "fresh_update_follow_up_01",
        triggerType: "fresh_update" as const,
      },
    };

    await repo.appendOnceForSourceAction({
      ...base,
      sourceActionId: formatQuestionAnswerSourceActionId("answer-a"),
    });
    await repo.appendOnceForSourceAction({
      ...base,
      sourceActionId: formatQuestionAnswerSourceActionId("answer-b"),
    });

    const listed = await repo.listOutcomeEventsForUser("user-1");
    expect("two outcomes for two answers", listed.length, 2);
  }

  section("architecture — persistence module remains isolated");
  {
    const persistenceSource = [
      "outcomeRepository.ts",
      "pgOutcomeRepository.ts",
      "outcomeValidation.ts",
      "outcomeTimestamps.ts",
      "outcomeTypes.ts",
      "brainOutcomeRecorder.ts",
      "noOpBrainOutcomeRecorder.ts",
      "createPersistentBrainOutcomeRecorder.ts",
    ]
      .map((file) => readFileSync(join(OUTCOMES_ROOT, file), "utf8"))
      .join("\n");

    for (const token of [
      "appendExposureEvent",
      "insertExposureEvent",
      "recordSurfacedOpportunities",
      "projectOutcomeToExposure",
      "brainOpportunityExposureEventsTable",
    ]) {
      expectTrue(`persistence outcomes source has no ${token}`, !persistenceSource.includes(token));
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("Failures:", failures.join(", "));
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
