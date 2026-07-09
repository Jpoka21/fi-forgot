/**
 * Unit tests for brain/product/buildProductBrainDecision.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/product-brain-decision.test.ts
 */

import type { BrainExecutionResult } from "../brain/orchestrator.js";
import { buildProductBrainDecision } from "../brain/product/buildProductBrainDecision.js";
import {
  PRODUCT_BRAIN_DECISION_VERSION,
  type ProductBrainDecision,
} from "../brain/product/productBrainDecisionTypes.js";
import {
  PRODUCT_BRAIN_DISPLAY_BY_RULE_ID,
  resolveProductBrainDisplay,
} from "../brain/product/productBrainDisplayCopy.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import type { LifeEventClassification } from "../brain/lifeEvents/lifeEventTypes.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { selectQuestionForActionPlan } from "../brain/questions/index.js";
import { BRAIN_CONTEXT_VERSION } from "../brain/types.js";
import type { RelationshipContextLoadResult } from "../brain/types.js";
import {
  minimalRelationshipContext,
  type MinimalRelationshipContextOptions,
} from "./fixtures/minimalRelationshipContext.js";

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

const READY_LIFE_EVENT: LifeEventClassification = {
  type: "family_update",
  category: "family",
  daysAgo: 30,
  followUpWindowDays: 30,
  followUpReady: true,
  source: "fresh_update",
  capturedAt: "2026-06-01T00:00:00.000Z",
  classified: true,
  supported: true,
};

function buildExecution(
  normalizedOverrides: Partial<NormalizedRelationshipState> = {},
  contextOptions: MinimalRelationshipContextOptions = {},
  lifeEvents: LifeEventClassification[] = [],
): BrainExecutionResult {
  const normalizedState = normalized(normalizedOverrides);
  const decisionContext = buildDecisionContext(
    normalizedState,
    minimalRelationshipContext(contextOptions),
    lifeEvents,
  );
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(decisionContext);
  const selectedFollowUpQuestion = selectQuestionForActionPlan({
    decisionContext,
    decideResult,
    actionPlan,
  });

  const loadResult: RelationshipContextLoadResult = {
    brainContextVersion: BRAIN_CONTEXT_VERSION,
    relationshipId: "recipient-1",
    userId: "user-1",
    loadedAt: "2026-01-01T00:00:00.000Z",
    relationshipContext: minimalRelationshipContext(contextOptions),
  };

  return {
    loadResult,
    extraction: {
      availableSignals: [],
      contributorGroups: [],
    },
    normalized: normalizedState,
    decisionContext,
    decideResult,
    actionPlan,
    ruleEvaluation,
    selectedFollowUpQuestion,
  };
}

const FORBIDDEN_TOP_LEVEL_KEYS = [
  "confidence",
  "reasons",
  "debugNotes",
  "normalized",
  "decisionContext",
  "loadResult",
  "extraction",
  "ruleEvaluation",
];

function assertNoForbiddenKeys(decision: ProductBrainDecision, label: string): void {
  for (const key of FORBIDDEN_TOP_LEVEL_KEYS) {
    expectTrue(`${label}: no top-level ${key}`, !(key in decision));
  }
}

section("version is always 1");
{
  const execution = buildExecution();
  const decision = buildProductBrainDecision("recipient-1", execution);
  expect("version", decision.version, PRODUCT_BRAIN_DECISION_VERSION);
}

section("no top-level confidence on public DTO");
{
  const execution = buildExecution({ freshness: "stale" });
  const decision = buildProductBrainDecision("recipient-1", execution);
  expectTrue("confidence absent", !("confidence" in decision));
  assertNoForbiddenKeys(decision, "public DTO");
}

section("confidence appears in debug only when includeDebug is true");
{
  const execution = buildExecution({ freshness: "stale" });
  const withoutDebug = buildProductBrainDecision("recipient-1", execution, {
    includeDebug: false,
  });
  const withDebug = buildProductBrainDecision("recipient-1", execution, {
    includeDebug: true,
  });

  expectTrue("no debug key when includeDebug false", !("debug" in withoutDebug));
  expectTrue("debug present when includeDebug true", withDebug.debug !== undefined);
  expectTrue(
    "confidence only in debug",
    withDebug.debug !== undefined && typeof withDebug.debug.confidence === "number",
  );
  expect(
    "debug reasons copied",
    withDebug.debug?.reasons,
    execution.decideResult.reasons,
  );
  expect(
    "debug brainContextVersion",
    withDebug.debug?.brainContextVersion,
    execution.loadResult.brainContextVersion,
  );
  expect(
    "debug ruleEvaluation",
    withDebug.debug?.ruleEvaluation,
    execution.ruleEvaluation,
  );
}

section("wait fixture");
{
  const execution = buildExecution();
  const decision = buildProductBrainDecision("recipient-1", execution);

  expect("outcome", decision.decision.outcome, "wait");
  expect("sourceRuleId", decision.sourceRuleId, "wait");
  expect("selectedFollowUpQuestion", decision.selectedFollowUpQuestion, null);
  expect("display", decision.display, resolveProductBrainDisplay("wait"));
}

section("fresh update fixture");
{
  const execution = buildExecution({ freshness: "stale" });
  const decision = buildProductBrainDecision("recipient-1", execution);

  expect("sourceRuleId", decision.sourceRuleId, "fresh_update");
  expect("outcome", decision.decision.outcome, "ask_question");
  expectTrue("question present", decision.selectedFollowUpQuestion !== null);
  expect(
    "question category",
    decision.selectedFollowUpQuestion?.category,
    "fresh_update_follow_up",
  );
}

section("life event follow-up fixture");
{
  const execution = buildExecution({}, {}, [READY_LIFE_EVENT]);
  const decision = buildProductBrainDecision("recipient-1", execution);

  expect("sourceRuleId", decision.sourceRuleId, "life_event_follow_up");
  expectTrue("question present", decision.selectedFollowUpQuestion !== null);
  expect(
    "question category",
    decision.selectedFollowUpQuestion?.category,
    "life_event_follow_up",
  );
}

section("birthday fixture");
{
  const execution = buildExecution(
    {},
    { birthday: "1988-07-08", generatedAt: "2026-07-01T00:00:00.000Z" },
  );
  const decision = buildProductBrainDecision("recipient-1", execution);

  expect("sourceRuleId", decision.sourceRuleId, "birthday");
  expect("outcome", decision.decision.outcome, "ask_question");
  expect("selectedFollowUpQuestion", decision.selectedFollowUpQuestion, null);
  expect("display.title", decision.display.title, "Birthday preparation");
}

section("selectedFollowUpQuestion projection excludes internal fields");
{
  const execution = buildExecution({ freshness: "stale" });
  const decision = buildProductBrainDecision("recipient-1", execution);
  const question = decision.selectedFollowUpQuestion;

  expectTrue("question projected", question !== null);
  if (question) {
    expectTrue("no sourceRuleId", !("sourceRuleId" in question));
    expectTrue("no reason", !("reason" in question));
    expectTrue("no rotationKey", !("rotationKey" in question));
    expectTrue("has questionId", typeof question.questionId === "string");
    expectTrue("has questionText", typeof question.questionText === "string");
    expectTrue("has category", typeof question.category === "string");
    expectTrue("has sensitivity", typeof question.sensitivity === "string");
  }
}

section("actionPlan projection includes only public fields");
{
  const execution = buildExecution({ freshness: "stale" });
  const decision = buildProductBrainDecision("recipient-1", execution);

  expectTrue("no confidence on actionPlan", !("confidence" in decision.actionPlan));
  expectTrue("no reasons on actionPlan", !("reasons" in decision.actionPlan));
  expectTrue("no debugNotes on actionPlan", !("debugNotes" in decision.actionPlan));
  expectTrue("no sourceRuleId on actionPlan", !("sourceRuleId" in decision.actionPlan));
  expect("type", decision.actionPlan.type, execution.actionPlan.type);
  expect("category", decision.actionPlan.category, execution.actionPlan.category);
  expect("priority", decision.actionPlan.priority, execution.actionPlan.priority);
  expect(
    "primaryReason",
    decision.actionPlan.primaryReason,
    execution.actionPlan.primaryReason,
  );
}

section("all 10 rule ids have factual static display copy");
{
  const ruleIds = Object.keys(PRODUCT_BRAIN_DISPLAY_BY_RULE_ID);
  expect("rule count", ruleIds.length, 10);

  for (const ruleId of ruleIds) {
    const display = resolveProductBrainDisplay(ruleId);
    expectTrue(`${ruleId}: title non-empty`, display.title.length > 0);
    expectTrue(`${ruleId}: explanation non-empty`, display.explanation.length > 0);
    expectTrue(
      `${ruleId}: no instructional 'should'`,
      !/\bshould\b/i.test(display.explanation),
    );
    expectTrue(
      `${ruleId}: no instructional 'consider'`,
      !/\bconsider\b/i.test(display.explanation),
    );
  }
}

section("display copy matches static lookup exactly");
{
  for (const [ruleId, expected] of Object.entries(PRODUCT_BRAIN_DISPLAY_BY_RULE_ID)) {
    expect(`display for ${ruleId}`, resolveProductBrainDisplay(ruleId), expected);
  }
}

section("unknown sourceRuleId uses fallback display");
{
  expect("fallback", resolveProductBrainDisplay("unknown_rule"), {
    title: "Opportunity",
    explanation: "An opportunity rule matched.",
  });
}

section("mapper uses only BrainExecutionResult — recipientId from route param");
{
  const execution = buildExecution();
  const decision = buildProductBrainDecision("route-recipient-id", execution);
  expect("recipientId from param", decision.recipientId, "route-recipient-id");
  expect(
    "recipientId not loadResult.relationshipId",
    decision.recipientId !== execution.loadResult.relationshipId,
    true,
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
