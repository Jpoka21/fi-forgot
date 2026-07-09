/**
 * Unit tests for brain/questions/selectQuestionForActionPlan.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/select-question-for-action-plan.test.ts
 */

import type { ActionPlan } from "../brain/action/actionPlanTypes.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import {
  RULE_ID_TO_QUESTION_CATEGORY,
  selectFollowUpQuestion,
  selectQuestionForActionPlan,
} from "../brain/questions/index.js";
import type { FollowUpQuestionCategory } from "../brain/questions/questionTypes.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";

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

function normalized(
  overrides: Partial<NormalizedRelationshipState> = {},
): NormalizedRelationshipState {
  const { derivedFrom: derivedOverride, ...rest } = overrides;
  return {
    identity: "empty",
    freshness: "unknown",
    history: "none",
    writing: "none",
    engagement: "none",
    momentum: "new",
    ...rest,
    derivedFrom: {
      signalCount: 0,
      sourcesPresent: [],
      ...derivedOverride,
    },
  };
}

function selectFromPlan(
  actionPlan: ActionPlan,
  normalizedOverrides: Partial<NormalizedRelationshipState> = {},
  lifeEventClassifications: Parameters<typeof buildDecisionContext>[2] = [],
) {
  const decisionContext = buildDecisionContext(
    normalized(normalizedOverrides),
    minimalRelationshipContext(),
    lifeEventClassifications,
  );
  const { decideResult } = planFromDecisionContext(decisionContext);
  return selectQuestionForActionPlan({
    decisionContext,
    decideResult,
    actionPlan,
  });
}

const READY_LIFE_EVENT = {
  type: "family_update",
  category: "family" as const,
  daysAgo: 30,
  followUpWindowDays: 30,
  followUpReady: true,
  source: "fresh_update" as const,
  capturedAt: "2026-06-01T00:00:00.000Z",
  classified: true,
  supported: true,
};

const MAPPED_RULES: Array<{
  sourceRuleId: string;
  category: FollowUpQuestionCategory;
  actionPlan: ActionPlan;
}> = [
  {
    sourceRuleId: "life_event_follow_up",
    category: "life_event_follow_up",
    actionPlan: {
      type: "ask_question",
      category: "follow_up",
      priority: "medium",
      sourceRuleId: "life_event_follow_up",
      primaryReason: "life_event_follow_up_ready",
      reasons: ["life_event_follow_up_ready"],
      confidence: 46,
      debugNotes: ["LifeEventFollowUpRule matched"],
    },
  },
  {
    sourceRuleId: "fresh_update",
    category: "fresh_update_follow_up",
    actionPlan: {
      type: "ask_question",
      category: "fresh_update",
      priority: "medium",
      sourceRuleId: "fresh_update",
      primaryReason: "information_stale",
      reasons: ["information_stale", "fresh_update_due"],
      confidence: 52,
      debugNotes: ["FreshUpdateRule matched"],
    },
  },
  {
    sourceRuleId: "accomplishment_follow_up",
    category: "accomplishment_follow_up",
    actionPlan: {
      type: "ask_question",
      category: "follow_up",
      priority: "medium",
      sourceRuleId: "accomplishment_follow_up",
      primaryReason: "accomplishment_follow_up_due",
      reasons: ["accomplishment_follow_up_due"],
      confidence: 43,
      debugNotes: ["AccomplishmentFollowUpRule matched"],
    },
  },
  {
    sourceRuleId: "inactivity",
    category: "inactivity_reconnect",
    actionPlan: {
      type: "ask_question",
      category: "follow_up",
      priority: "medium",
      sourceRuleId: "inactivity",
      primaryReason: "relationship_inactive",
      reasons: ["relationship_inactive"],
      confidence: 48,
      debugNotes: ["InactivityRule matched"],
    },
  },
  {
    sourceRuleId: "memory_accumulation",
    category: "memory_collection",
    actionPlan: {
      type: "ask_question",
      category: "profile_information",
      priority: "medium",
      sourceRuleId: "memory_accumulation",
      primaryReason: "memory_inventory_thin",
      reasons: ["memory_inventory_thin"],
      confidence: 44,
      debugNotes: ["MemoryAccumulationRule matched"],
    },
  },
  {
    sourceRuleId: "card_gap",
    category: "card_gap_context",
    actionPlan: {
      type: "ask_question",
      category: "card_opportunity",
      priority: "medium",
      sourceRuleId: "card_gap",
      primaryReason: "card_channel_quiet",
      reasons: ["card_channel_quiet"],
      confidence: 45,
      debugNotes: ["CardGapRule matched"],
    },
  },
];

section("each mapped ask_question rule selects the correct category");
{
  for (const { sourceRuleId, category, actionPlan } of MAPPED_RULES) {
    const selected = selectFromPlan(actionPlan);
    const expected = selectFollowUpQuestion({ category });
    expect(`${sourceRuleId} not null`, selected !== null, true);
    expect(`${sourceRuleId} category`, selected?.category, category);
    expect(`${sourceRuleId} questionId`, selected?.questionId, expected?.id);
    expect(`${sourceRuleId} sourceRuleId`, selected?.sourceRuleId, sourceRuleId);
    expect(`${sourceRuleId} reason`, selected?.reason, actionPlan.primaryReason);
    expect(`${sourceRuleId} rotationKey`, selected?.rotationKey, category);
  }
}

section("planFromDecisionContext integration selects question for stale freshness");
{
  const decisionContext = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext(),
  );
  const { decideResult, actionPlan } = planFromDecisionContext(decisionContext);
  const selected = selectQuestionForActionPlan({
    decisionContext,
    decideResult,
    actionPlan,
  });
  expect("fresh_update selected", selected?.category, "fresh_update_follow_up");
  expect("matches catalog first question", selected?.questionId, "fresh_update_follow_up_01");
}

section("planFromDecisionContext integration selects question for life event");
{
  const decisionContext = buildDecisionContext(
    normalized({ freshness: "current" }),
    minimalRelationshipContext(),
    [READY_LIFE_EVENT],
  );
  const { decideResult, actionPlan } = planFromDecisionContext(decisionContext);
  const selected = selectQuestionForActionPlan({
    decisionContext,
    decideResult,
    actionPlan,
  });
  expect("life_event selected", selected?.category, "life_event_follow_up");
  expect("sourceRuleId", selected?.sourceRuleId, "life_event_follow_up");
}

section("non ask_question action returns null");
{
  const waitPlan: ActionPlan = {
    type: "wait",
    category: "none",
    priority: "low",
    sourceRuleId: "wait",
    primaryReason: "read_only_scaffold",
    reasons: ["read_only_scaffold", "no_behavior_change"],
    confidence: 0,
    debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
  };
  expect("wait returns null", selectFromPlan(waitPlan), null);
}

section("unknown source rule returns null");
{
  const birthdayPlan: ActionPlan = {
    type: "ask_question",
    category: "birthday",
    priority: "medium",
    sourceRuleId: "birthday",
    primaryReason: "birthday_preparation_window",
    reasons: ["birthday_preparation_window"],
    confidence: 60,
    debugNotes: ["BirthdayRule matched"],
  };
  expect("birthday returns null", selectFromPlan(birthdayPlan), null);
  expect("mapping excludes birthday", RULE_ID_TO_QUESTION_CATEGORY.birthday, undefined);
}

section("selectFollowUpQuestion behavior unchanged");
{
  const direct = selectFollowUpQuestion({ category: "memory_collection" });
  const viaPlan = selectFromPlan(MAPPED_RULES[4]!.actionPlan);
  expect("same question id", viaPlan?.questionId, direct?.id);
  expect("same question text", viaPlan?.questionText, direct?.text);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
