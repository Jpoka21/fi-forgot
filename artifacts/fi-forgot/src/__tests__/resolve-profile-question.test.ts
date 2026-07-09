/**
 * Unit tests for relationship-profile sequential question resolution.
 *
 * Run with:
 *   npx tsx artifacts/fi-forgot/src/__tests__/resolve-profile-question.test.ts
 */

import { mapBrainToProfileQuestionViewModel } from "../app/relationship-profile/mapBrainToProfileQuestionViewModel.js";
import { mapLegacyToProfileQuestionViewModel } from "../app/relationship-profile/mapLegacyToProfileQuestionViewModel.js";
import {
  resolveFromBrain,
  resolveProfileGapFallback,
  resolveProfileQuestion,
} from "../app/relationship-profile/resolveProfileQuestion.js";
import type { ProductBrainDecision } from "../app/product-brain/productBrainDecisionTypes.js";
import type { NextQuestion } from "../app/relationship-profile/relationshipProfileDomain.js";

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

function section(name: string) {
  console.log(`\n${name}`);
}

const BRAIN_DECISION: ProductBrainDecision = {
  version: 1,
  recipientId: "r1",
  decision: { outcome: "ask_question" },
  sourceRuleId: "fresh_update",
  actionPlan: {
    type: "ask_question",
    category: "fresh_update",
    priority: "medium",
    primaryReason: "information_stale",
  },
  selectedFollowUpQuestion: {
    questionId: "fresh_update_follow_up_01",
    questionText: "What's been going on with them lately?",
    category: "fresh_update_follow_up",
    sensitivity: "low",
  },
  display: {
    title: "Fresh update",
    explanation: "Profile information is stale.",
  },
};

const PROFILE_GAP: NextQuestion = {
  fieldKey: "interests",
  fieldLabel: "Interests",
  category: "profile",
  priority: "high",
  question: "What are their interests?",
  reason: "Interests help personalize cards.",
  mode: "profile_gap",
};

const FRESH_UPDATE: NextQuestion = {
  fieldKey: "recent_memory",
  fieldLabel: "Recent memory",
  category: "update",
  priority: "medium",
  question: "What's new?",
  reason: "Stay current.",
  mode: "fresh_update",
};

section("mapBrainToProfileQuestionViewModel");
{
  const vm = mapBrainToProfileQuestionViewModel(BRAIN_DECISION);
  expect("title", vm.title, "Fresh update");
  expect("explanation", vm.explanation, "Profile information is stale.");
  expect("question", vm.question, "What's been going on with them lately?");
  expect("source", vm.source, "brain");
  expect("saveFieldKey", vm.saveFieldKey, "fresh_update_follow_up_01");
  expect("saveTriggerType", vm.saveTriggerType, "fresh_update");
}

section("mapLegacyToProfileQuestionViewModel");
{
  const vm = mapLegacyToProfileQuestionViewModel(PROFILE_GAP);
  expect("source", vm.source, "profile_gap");
  expect("saveFieldKey", vm.saveFieldKey, "interests");
  expect("saveTriggerType", vm.saveTriggerType, "profile_gap");
}

section("resolveFromBrain");
{
  expectTrue("returns view model when question present", resolveFromBrain(BRAIN_DECISION) !== null);
  expect(
    "null when no question",
    resolveFromBrain({ ...BRAIN_DECISION, selectedFollowUpQuestion: null }),
    null,
  );
}

section("resolveProfileGapFallback");
{
  const gap = resolveProfileGapFallback({
    nextQuestion: PROFILE_GAP,
    profileComplete: false,
    profileScore: 40,
  });
  expectTrue("profile_gap maps", gap.profileQuestion !== null);
  expect("profileComplete", gap.profileComplete, false);

  const ignored = resolveProfileGapFallback({
    nextQuestion: FRESH_UPDATE,
    profileComplete: true,
    profileScore: 100,
  });
  expect("fresh_update ignored", ignored.profileQuestion, null);
  expect("metadata kept", ignored.profileComplete, true);
}

async function runSequentialTests(): Promise<void> {
  section("resolveProfileQuestion sequential");

  let nextQuestionCalls = 0;

  const withBrain = await resolveProfileQuestion(
    async () => BRAIN_DECISION,
    async () => {
      nextQuestionCalls += 1;
      return { nextQuestion: PROFILE_GAP, profileComplete: false, profileScore: 0 };
    },
  );
  expectTrue("brain question returned", withBrain.profileQuestion !== null);
  expect("next-question not called when brain has question", nextQuestionCalls, 0);
  expect("brain title", withBrain.profileQuestion?.title, "Fresh update");

  nextQuestionCalls = 0;
  const withGap = await resolveProfileQuestion(
    async () => ({ ...BRAIN_DECISION, selectedFollowUpQuestion: null }),
    async () => {
      nextQuestionCalls += 1;
      return { nextQuestion: PROFILE_GAP, profileComplete: false, profileScore: 12 };
    },
  );
  expect("next-question called once", nextQuestionCalls, 1);
  expectTrue("profile_gap fallback", withGap.profileQuestion?.source === "profile_gap");

  nextQuestionCalls = 0;
  const withFreshIgnored = await resolveProfileQuestion(
    async () => ({ ...BRAIN_DECISION, selectedFollowUpQuestion: null }),
    async () => {
      nextQuestionCalls += 1;
      return { nextQuestion: FRESH_UPDATE, profileComplete: true, profileScore: 100 };
    },
  );
  expect("next-question called for null brain question", nextQuestionCalls, 1);
  expect("legacy fresh_update ignored", withFreshIgnored.profileQuestion, null);

  nextQuestionCalls = 0;
  await resolveProfileQuestion(
    async () => {
      throw new Error("brain down");
    },
    async () => {
      nextQuestionCalls += 1;
      return { nextQuestion: PROFILE_GAP, profileComplete: false, profileScore: 5 };
    },
  );
  expectTrue("brain error falls through to next-question", nextQuestionCalls === 1);
}

void runSequentialTests().then(() => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("Failures:", failures.join(", "));
    process.exit(1);
  }
});
