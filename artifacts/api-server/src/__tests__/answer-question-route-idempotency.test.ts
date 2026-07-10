/**
 * Route-level answer idempotency review tests (Step 6e.1).
 *
 * Documents actual POST /v2/recipients/:id/answer-question retry behavior.
 * Does not require DATABASE_URL or a running server.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/answer-question-route-idempotency.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  formatQuestionAnswerSourceActionId,
  parseQuestionAnswerSourceActionId,
  QUESTION_ANSWER_SOURCE_ACTION_PREFIX,
  createInMemoryBrainOutcomeRepository,
  createBrainOutcomeExposureProjector,
  recordQuestionAnsweredBrainOutcome,
} from "../brain/outcomes/index.js";
import { createInMemoryExposureEventRepository } from "../brain/fatigue/exposure/index.js";
import {
  buildFreshUpdateAnswerId,
  buildProfileGapAnswerId,
} from "../services/answer-question-ids.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTE_SOURCE = readFileSync(join(TEST_DIR, "../routes/v2-recipients.ts"), "utf8");

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

function section(name: string): void {
  console.log(`\n${name}`);
}

async function run(): Promise<void> {
  section("route request contract — no stable submission identifier");
  {
    expectTrue("route reads fieldKey from body", ROUTE_SOURCE.includes("fieldKey"));
    expectTrue("route reads triggerType from body", ROUTE_SOURCE.includes("triggerType"));
    expectTrue(
      "route body contract has no client answerId",
      !ROUTE_SOURCE.includes("answerId?:  string") && !ROUTE_SOURCE.includes("answerId?: string"),
    );
    expectTrue("route does not read submissionId", !ROUTE_SOURCE.includes("submissionId"));
    expectTrue("route does not read idempotency key header", !ROUTE_SOURCE.includes("idempotency"));
  }

  section("fresh/catalog answer IDs — HTTP retry creates a new row identity");
  {
    const recipientId = "recipient-1";
    const fieldKey = "accomplishment_follow_up_01";
    const t1 = new Date("2026-07-10T14:00:00.000Z");
    const t2 = new Date("2026-07-10T14:00:00.001Z");
    const first = buildFreshUpdateAnswerId(recipientId, fieldKey, t1);
    const retry = buildFreshUpdateAnswerId(recipientId, fieldKey, t2);

    expectTrue("first attempt assigns an answer id", first.length > 0);
    expectTrue("retry with later timestamp gets a different answer id", first !== retry);
    expect(
      "first id embeds timestamp",
      first,
      `fresh_update_${recipientId}_${fieldKey}_${t1.getTime()}`,
    );
    expect(
      "retry id embeds later timestamp",
      retry,
      `fresh_update_${recipientId}_${fieldKey}_${t2.getTime()}`,
    );
  }

  section("profile-gap answer IDs — same field upserts on one stable id");
  {
    const recipientId = "recipient-1";
    const fieldKey = "interests";
    const first = buildProfileGapAnswerId(recipientId, fieldKey);
    const retry = buildProfileGapAnswerId(recipientId, fieldKey);

    expect("stable profile gap id", first, "profile_gap_recipient-1_interests");
    expectTrue("retry reuses same profile gap id", first === retry);
  }

  section("database — question_answers has no logical-answer uniqueness beyond primary key");
  {
    const schemaSource = readFileSync(
      join(TEST_DIR, "../../../../lib/db/src/schema/question-answers.ts"),
      "utf8",
    );
    expectTrue("primary key on id only", schemaSource.includes('id: text("id").primaryKey()'));
    expectTrue("no recipient plus field unique index", !schemaSource.includes("uniqueIndex"));
    expectTrue("fresh updates intentionally allow multiple rows", ROUTE_SOURCE.includes("never upserted"));
  }

  section("Step 6e producer — idempotent per persisted answerId, not per HTTP retry");
  {
    const outcomeRepository = createInMemoryBrainOutcomeRepository();
    const exposureRepository = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepository);

    const firstAnswerId = buildFreshUpdateAnswerId(
      "recipient-1",
      "fresh_update_follow_up_01",
      new Date("2026-07-10T14:00:00.000Z"),
    );
    const retryAnswerId = buildFreshUpdateAnswerId(
      "recipient-1",
      "fresh_update_follow_up_01",
      new Date("2026-07-10T14:00:00.001Z"),
    );

    const baseAnswer = {
      userId: "user-1",
      recipientId: "recipient-1",
      fieldKey: "fresh_update_follow_up_01",
      triggerType: "fresh_update" as const,
      createdAt: new Date("2026-07-10T14:00:00.000Z"),
    };

    await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: { ...baseAnswer, answerId: firstAnswerId },
      authenticatedUserId: "user-1",
      dependencies: { outcomeRepository, projector },
    });
    await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: { ...baseAnswer, answerId: retryAnswerId },
      authenticatedUserId: "user-1",
      dependencies: { outcomeRepository, projector },
    });

    const outcomes = await outcomeRepository.listOutcomeEventsForUser("user-1");
    expect(
      "simulated HTTP retry creates two Brain outcomes for two answer rows",
      outcomes.length,
      2,
    );
  }

  section("Step 6e producer — repeating the same persisted answerId is idempotent");
  {
    const outcomeRepository = createInMemoryBrainOutcomeRepository();
    const exposureRepository = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepository);
    const answerId = buildFreshUpdateAnswerId(
      "recipient-1",
      "fresh_update_follow_up_01",
      new Date("2026-07-10T14:00:00.000Z"),
    );

    const persistedAnswer = {
      answerId,
      userId: "user-1",
      recipientId: "recipient-1",
      fieldKey: "fresh_update_follow_up_01",
      triggerType: "fresh_update" as const,
      createdAt: new Date("2026-07-10T14:00:00.000Z"),
    };

    const first = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer,
      authenticatedUserId: "user-1",
      dependencies: { outcomeRepository, projector },
    });
    const second = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer,
      authenticatedUserId: "user-1",
      dependencies: { outcomeRepository, projector },
    });

    expect("first status", first.status, "recorded_and_projected");
    expect("second status", second.status, "already_recorded");
    const outcomes = await outcomeRepository.listOutcomeEventsForUser("user-1");
    expect("one outcome for one persisted answer id", outcomes.length, 1);
  }

  section("source_action_id namespace — question_answer prefix prevents cross-producer collision");
  {
    const answerId = "fresh_update_r1_fresh_update_follow_up_01_1710000000000";
    const namespaced = formatQuestionAnswerSourceActionId(answerId);

    expectTrue("uses question_answer prefix", namespaced.startsWith(QUESTION_ANSWER_SOURCE_ACTION_PREFIX));
    expect(
      "namespaced value",
      namespaced,
      "question_answer:fresh_update_r1_fresh_update_follow_up_01_1710000000000",
    );
    expect("round trip", parseQuestionAnswerSourceActionId(namespaced), answerId);
    expectTrue(
      "card id with same suffix would not collide",
      namespaced !== "card_sent:fresh_update_r1_fresh_update_follow_up_01_1710000000000",
    );
  }

  section("existing Step 6e tests cover producer replay, not HTTP route retry");
  {
    const producerTestSource = readFileSync(
      join(TEST_DIR, "brain-outcomes-question-answered-producer.test.ts"),
      "utf8",
    );
    expectTrue(
      "producer tests retry with same answerId",
      producerTestSource.includes('answerId: "answer-retry-1"'),
    );
    expectTrue(
      "producer tests do not simulate route timestamp retry",
      !producerTestSource.includes("buildFreshUpdateAnswerId"),
    );
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
