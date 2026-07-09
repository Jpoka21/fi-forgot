/**
 * Unit tests for brain/questions — catalog and selectFollowUpQuestion.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/follow-up-question-catalog.test.ts
 */

import {
  FOLLOW_UP_QUESTION_CATALOG,
  selectFollowUpQuestion,
} from "../brain/questions/index.js";
import type { FollowUpQuestionCategory } from "../brain/questions/questionTypes.js";

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

function section(name: string) {
  console.log(`\n${name}`);
}

const CATEGORIES: FollowUpQuestionCategory[] = [
  "life_event_follow_up",
  "fresh_update_follow_up",
  "accomplishment_follow_up",
  "inactivity_reconnect",
  "memory_collection",
  "card_gap_context",
];

const EXPECTED_COUNTS: Record<FollowUpQuestionCategory, number> = {
  life_event_follow_up: 4,
  fresh_update_follow_up: 4,
  accomplishment_follow_up: 4,
  inactivity_reconnect: 4,
  memory_collection: 3,
  card_gap_context: 3,
};

section("each category returns a question");
{
  for (const category of CATEGORIES) {
    const question = selectFollowUpQuestion({ category });
    expect(`${category} returns question`, question !== null, true);
    expect(`${category} matches category`, question?.category, category);
    expect(`${category} rotationOrder is 1`, question?.rotationOrder, 1);
  }
}

section("unknown category returns null");
{
  expect(
    "unknown category",
    selectFollowUpQuestion({ category: "unknown_category" }),
    null,
  );
}

section("deterministic repeatability");
{
  const first = selectFollowUpQuestion({ category: "life_event_follow_up" });
  const second = selectFollowUpQuestion({ category: "life_event_follow_up" });
  expect("same reference values", first, second);
  expect("same id", first?.id, second?.id);
}

section("catalog integrity");
{
  expect("total question count", FOLLOW_UP_QUESTION_CATALOG.length, 22);

  for (const category of CATEGORIES) {
    const count = FOLLOW_UP_QUESTION_CATALOG.filter(
      (question) => question.category === category,
    ).length;
    expect(`${category} count`, count, EXPECTED_COUNTS[category]);
  }

  for (const question of FOLLOW_UP_QUESTION_CATALOG) {
    expect(`${question.id} has text`, question.text.length > 0, true);
    expect(
      `${question.id} sensitivity valid`,
      ["low", "medium", "high"].includes(question.sensitivity),
      true,
    );
  }
}

section("unique ids");
{
  const ids = FOLLOW_UP_QUESTION_CATALOG.map((question) => question.id);
  const uniqueIds = new Set(ids);
  expect("all ids unique", uniqueIds.size, ids.length);
}

section("no duplicate rotation order inside a category");
{
  for (const category of CATEGORIES) {
    const orders = FOLLOW_UP_QUESTION_CATALOG.filter(
      (question) => question.category === category,
    ).map((question) => question.rotationOrder);
    const uniqueOrders = new Set(orders);
    expect(`${category} unique rotation orders`, uniqueOrders.size, orders.length);
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
