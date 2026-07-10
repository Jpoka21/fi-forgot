/**
 * Brain outcomes module tests (Step 6b).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-outcomes.test.ts
 */

import {
  assertValidBrainOutcomeOpportunityIdentity,
  BRAIN_OUTCOME_TYPES,
  createNoOpBrainOutcomeRecorder,
  isBrainOutcomeType,
  noOpBrainOutcomeRecorder,
  type RecordBrainOutcomeInput,
} from "../brain/outcomes/index.js";

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

const VALID_INPUT: RecordBrainOutcomeInput = {
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

section("outcome type vocabulary");
{
  expect("approved outcome count", BRAIN_OUTCOME_TYPES.length, 5);
  expectTrue(
    "includes question_answered",
    BRAIN_OUTCOME_TYPES.includes("question_answered"),
  );
  expectTrue("includes card_created", BRAIN_OUTCOME_TYPES.includes("card_created"));
  expectTrue("includes card_approved", BRAIN_OUTCOME_TYPES.includes("card_approved"));
  expectTrue("includes card_sent", BRAIN_OUTCOME_TYPES.includes("card_sent"));
  expectTrue(
    "includes opportunity_dismissed",
    BRAIN_OUTCOME_TYPES.includes("opportunity_dismissed"),
  );
  expectTrue("isBrainOutcomeType accepts question_answered", isBrainOutcomeType("question_answered"));
  expectTrue("isBrainOutcomeType rejects card_draft", isBrainOutcomeType("card_draft") === false);
}

section("opportunity identity validation");
{
  expectThrows("rejects mismatched recipient", () => {
    assertValidBrainOutcomeOpportunityIdentity({
      opportunityKey: "other:birthday",
      recipientId: "recipient-1",
    });
  });

  expectThrows("rejects missing sourceRuleId", () => {
    assertValidBrainOutcomeOpportunityIdentity({
      opportunityKey: "recipient-1:",
      recipientId: "recipient-1",
    });
  });

  let threw = false;
  try {
    assertValidBrainOutcomeOpportunityIdentity({
      opportunityKey: "recipient-1:birthday",
      recipientId: "recipient-1",
    });
  } catch {
    threw = true;
  }
  expectTrue("accepts valid opportunityKey", !threw);
}

section("no-op recorder accepts valid input");
{
  let resolved = false;
  await noOpBrainOutcomeRecorder.record(VALID_INPUT).then(() => {
    resolved = true;
  });
  expectTrue("record resolves", resolved);

  await createNoOpBrainOutcomeRecorder().record({
    userId: "user-2",
    recipientId: "recipient-2",
    opportunityKey: "recipient-2:card_gap",
    outcomeType: "card_sent",
    metadata: {
      cardId: "card-1",
      cardStatus: "Mailed to me",
    },
  });
  expectTrue("factory recorder accepts card_sent input", true);
}

section("no-op recorder performs no side effects");
{
  const input: RecordBrainOutcomeInput = {
    ...VALID_INPUT,
    metadata: {
      fieldKey: "birthday",
      triggerType: "profile_gap",
    },
  };
  const snapshot = structuredClone(input);

  await noOpBrainOutcomeRecorder.record(input);

  expect("input is not mutated", input, snapshot);
}

section("module exports");
{
  expectTrue("noOpBrainOutcomeRecorder is exported", typeof noOpBrainOutcomeRecorder.record === "function");
  expectTrue("createNoOpBrainOutcomeRecorder is exported", typeof createNoOpBrainOutcomeRecorder === "function");
  expectTrue("assertValidBrainOutcomeOpportunityIdentity is exported", typeof assertValidBrainOutcomeOpportunityIdentity === "function");
}

section("metadata correlation rejects card metadata for question_answered");
{
  let rejected = false;
  try {
    const { assertValidOutcomeMetadataCorrelation } = await import("../brain/outcomes/index.js");
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
  } catch {
    rejected = true;
  }
  expectTrue("invalid metadata combination rejected", rejected);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
