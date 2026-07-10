/**
 * Fatigue rule tests (Step 5f).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-fatigue-rules.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { planAttentionOrder } from "../brain/attention/planAttentionOrder.js";
import type { GlobalOpportunity } from "../brain/attention/globalOpportunityTypes.js";
import { applyFatigue } from "../brain/fatigue/applyFatigue.js";
import { RECENTLY_SURFACED_COOLDOWN_MS } from "../brain/fatigue/fatiguePolicyConstants.js";
import { materializeExposureSnapshot } from "../brain/fatigue/exposure/materializeExposureSnapshot.js";
import type { ExposureEvent } from "../brain/fatigue/exposure/exposureTypes.js";
import { getVisibleFatigueOpportunities } from "../brain/fatigue/getVisibleFatigueOpportunities.js";
import { evaluateRecentlySurfacedRule } from "../brain/fatigue/rules/recentlySurfacedRule.js";
import { isWithinCooldown } from "../brain/fatigue/utils/isWithinCooldown.js";
import { parseExposureTimestamp } from "../brain/fatigue/utils/parseExposureTimestamp.js";
import { buildDashboardBrainOpportunities } from "../brain/product/buildDashboardBrainOpportunities.js";
import { buildNotifications } from "../brain/product/buildNotifications.js";
import { buildConciergeWorkspace } from "../brain/product/buildConciergeWorkspace.js";
import { DASHBOARD_BRAIN_OPPORTUNITIES_MAX } from "../brain/product/dashboardBrainOpportunitiesTypes.js";
import type { FatigueContext } from "../brain/fatigue/fatigueTypes.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";
import type { BrainExecutionResult } from "../brain/orchestrator.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { selectQuestionForActionPlan } from "../brain/questions/index.js";
import { BRAIN_CONTEXT_VERSION, type RelationshipContextLoadResult } from "../brain/types.js";
import {
  minimalRelationshipContext,
  type MinimalRelationshipContextOptions,
} from "./fixtures/minimalRelationshipContext.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const FATIGUE_ROOT = join(TEST_DIR, "../brain/fatigue");

const ORIGINAL_ENFORCE = process.env["BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED"];
const ORIGINAL_SHADOW = process.env["BRAIN_FATIGUE_SHADOW_RECENTLY_SURFACED"];

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

function setEnforcement(enabled: boolean): void {
  process.env["BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED"] = enabled ? "true" : "false";
}

function setShadow(enabled: boolean): void {
  process.env["BRAIN_FATIGUE_SHADOW_RECENTLY_SURFACED"] = enabled ? "true" : "false";
}

function restoreEnv(): void {
  if (ORIGINAL_ENFORCE === undefined) {
    delete process.env["BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED"];
  } else {
    process.env["BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED"] = ORIGINAL_ENFORCE;
  }

  if (ORIGINAL_SHADOW === undefined) {
    delete process.env["BRAIN_FATIGUE_SHADOW_RECENTLY_SURFACED"];
  } else {
    process.env["BRAIN_FATIGUE_SHADOW_RECENTLY_SURFACED"] = ORIGINAL_SHADOW;
  }
}

function decisionFixture(
  overrides: Partial<ProductBrainDecision> & {
    sourceRuleId: string;
    outcome: ProductBrainDecision["decision"]["outcome"];
    priority?: ProductBrainDecision["actionPlan"]["priority"];
    recipientId?: string;
  },
): ProductBrainDecision {
  const {
    sourceRuleId,
    outcome,
    priority = "medium",
    recipientId = "recipient-1",
    ...rest
  } = overrides;

  return {
    version: 1,
    recipientId,
    decision: { outcome },
    sourceRuleId,
    actionPlan: {
      type: outcome,
      category: "follow_up",
      priority,
      primaryReason: "test_reason",
    },
    selectedFollowUpQuestion: null,
    display: { title: "Title", explanation: "Explanation." },
    ...rest,
  };
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

function buildExecution(
  normalizedOverrides: Partial<NormalizedRelationshipState> = {},
  contextOptions: MinimalRelationshipContextOptions = {},
  recipientId = "recipient-1",
): BrainExecutionResult {
  const normalizedState = normalized(normalizedOverrides);
  const relationshipContext = minimalRelationshipContext(contextOptions);
  const decisionContext = buildDecisionContext(
    normalizedState,
    relationshipContext,
    [],
  );
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(decisionContext);
  const selectedFollowUpQuestion = selectQuestionForActionPlan({
    decisionContext,
    decideResult,
    actionPlan,
  });

  const loadResult: RelationshipContextLoadResult = {
    brainContextVersion: BRAIN_CONTEXT_VERSION,
    relationshipId: recipientId,
    userId: "user-1",
    loadedAt: "2026-01-01T00:00:00.000Z",
    relationshipContext,
  };

  return {
    loadResult,
    extraction: { availableSignals: [], contributorGroups: [] },
    normalized: normalizedState,
    decisionContext,
    decideResult,
    actionPlan,
    ruleEvaluation,
    selectedFollowUpQuestion,
  };
}

function exposureEvent(
  overrides: Partial<ExposureEvent> & Pick<ExposureEvent, "opportunityKey" | "occurredAt">,
): ExposureEvent {
  const [recipientId, sourceRuleId] = overrides.opportunityKey.split(":");
  return {
    recipientId: recipientId ?? "a",
    sourceRuleId: sourceRuleId ?? "birthday",
    eventType: "surfaced",
    ...overrides,
  };
}

function fatigueContextWithEvents(
  events: ExposureEvent[],
  evaluatedAt: string,
  userId = "user-1",
): FatigueContext {
  return {
    userId,
    evaluatedAt,
    exposureSnapshot: materializeExposureSnapshot(events, evaluatedAt),
  };
}

function rankedOpportunity(key: string): GlobalOpportunity {
  const [recipientId, sourceRuleId] = key.split(":");
  return {
    opportunityKey: key,
    recipientId: recipientId!,
    recipientName: recipientId!,
    decision: decisionFixture({ sourceRuleId: sourceRuleId!, outcome: "ask_question", recipientId }),
    attentionScore: 1,
    globalRank: 1,
    suppressionReason: null,
    metadata: {},
  };
}

setEnforcement(false);
setShadow(true);

try {

section("no exposure record returns visible");
{
  setEnforcement(true);
  const result = evaluateRecentlySurfacedRule(
    rankedOpportunity("a:birthday"),
    fatigueContextWithEvents([], "2026-07-10T14:00:00.000Z"),
  );
  expect("decision", result.fatigueDecision, "visible");
  expect("reason", result.suppressionReason, null);
  setEnforcement(false);
}

section("exposure outside cooldown returns visible");
{
  setEnforcement(true);
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  const lastSurfacedAt = new Date(
    Date.parse(evaluatedAt) - RECENTLY_SURFACED_COOLDOWN_MS,
  ).toISOString();
  const result = evaluateRecentlySurfacedRule(
    rankedOpportunity("a:birthday"),
    fatigueContextWithEvents(
      [exposureEvent({ opportunityKey: "a:birthday", occurredAt: lastSurfacedAt })],
      evaluatedAt,
    ),
  );
  expect("decision", result.fatigueDecision, "visible");
  setEnforcement(false);
}

section("exposure inside cooldown produces suppressed with recently_surfaced");
{
  setEnforcement(true);
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  const result = evaluateRecentlySurfacedRule(
    rankedOpportunity("a:birthday"),
    fatigueContextWithEvents(
      [exposureEvent({ opportunityKey: "a:birthday", occurredAt: "2026-07-10T12:00:00.000Z" })],
      evaluatedAt,
    ),
  );
  expect("decision", result.fatigueDecision, "suppressed");
  expect("reason", result.suppressionReason, "recently_surfaced");
  setEnforcement(false);
}

section("exact 24 hour boundary is visible");
{
  setEnforcement(true);
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  const lastSurfacedAt = new Date(
    Date.parse(evaluatedAt) - RECENTLY_SURFACED_COOLDOWN_MS,
  ).toISOString();
  const result = evaluateRecentlySurfacedRule(
    rankedOpportunity("a:birthday"),
    fatigueContextWithEvents(
      [exposureEvent({ opportunityKey: "a:birthday", occurredAt: lastSurfacedAt })],
      evaluatedAt,
    ),
  );
  expect("decision at boundary", result.fatigueDecision, "visible");
  expectTrue(
    "boundary uses elapsed >= cooldown",
    !isWithinCooldown({
      lastEventAtMs: parseExposureTimestamp(lastSurfacedAt)!,
      evaluatedAtMs: parseExposureTimestamp(evaluatedAt)!,
      cooldownMs: RECENTLY_SURFACED_COOLDOWN_MS,
    }),
  );
  setEnforcement(false);
}

section("invalid timestamp returns visible");
{
  setEnforcement(true);
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  const snapshot = materializeExposureSnapshot(
    [
      {
        opportunityKey: "a:birthday",
        recipientId: "a",
        sourceRuleId: "birthday",
        eventType: "surfaced",
        occurredAt: "not-a-timestamp",
      },
    ],
    evaluatedAt,
  );
  const result = evaluateRecentlySurfacedRule(rankedOpportunity("a:birthday"), {
    userId: "user-1",
    evaluatedAt,
    exposureSnapshot: snapshot,
  });
  expect("decision", result.fatigueDecision, "visible");
  setEnforcement(false);
}

section("future timestamp returns visible");
{
  setEnforcement(true);
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  const result = evaluateRecentlySurfacedRule(
    rankedOpportunity("a:birthday"),
    fatigueContextWithEvents(
      [exposureEvent({ opportunityKey: "a:birthday", occurredAt: "2026-07-11T00:00:00.000Z" })],
      evaluatedAt,
    ),
  );
  expect("decision", result.fatigueDecision, "visible");
  setEnforcement(false);
}

section("multiple opportunities preserve exact planner order");
{
  setEnforcement(true);
  const decisions = [
    decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a", priority: "high" }),
    decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question", recipientId: "b" }),
    decisionFixture({ sourceRuleId: "memory_accumulation", outcome: "show_dashboard_insight", recipientId: "c", priority: "low" }),
  ];
  const recipients = [
    { recipientId: "a", recipientName: "Alice" },
    { recipientId: "b", recipientName: "Bob" },
    { recipientId: "c", recipientName: "Cara" },
  ];
  const ranked = planAttentionOrder({ decisions, recipients });
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  const context = fatigueContextWithEvents(
    [exposureEvent({ opportunityKey: "b:fresh_update", occurredAt: "2026-07-10T13:00:00.000Z" })],
    evaluatedAt,
  );
  const fatigued = applyFatigue(ranked, context);

  expect(
    "recipient order",
    fatigued.map((item) => item.opportunity.recipientId),
    ranked.map((item) => item.recipientId),
  );
  expect("middle item suppressed", fatigued[1]?.fatigueDecision, "suppressed");
  expect("first item visible", fatigued[0]?.fatigueDecision, "visible");
  setEnforcement(false);
}

section("fatigue source does not sort ranked opportunities");
{
  const source = readFileSync(join(FATIGUE_ROOT, "applyFatigue.ts"), "utf8");
  expectTrue("applyFatigue has no sort(", !source.includes(".sort("));
  expectTrue("applyFatigue maps in order", source.includes("ranked.map"));
}

section("applyFatigue does not mutate GlobalOpportunity objects");
{
  setEnforcement(true);
  const decisions = [
    decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a", priority: "high" }),
  ];
  const ranked = planAttentionOrder({
    decisions,
    recipients: [{ recipientId: "a", recipientName: "Alice" }],
  });
  const before = ranked.map((item) => snapshotGlobalOpportunity(item));
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  applyFatigue(
    ranked,
    fatigueContextWithEvents(
      [exposureEvent({ opportunityKey: "a:birthday", occurredAt: "2026-07-10T13:00:00.000Z" })],
      evaluatedAt,
    ),
  );
  const after = ranked.map((item) => snapshotGlobalOpportunity(item));
  expect("GlobalOpportunity snapshots unchanged", after, before);
  setEnforcement(false);
}

section("suppressed opportunities are excluded before product caps");
{
  setEnforcement(true);
  const decisions = Array.from({ length: DASHBOARD_BRAIN_OPPORTUNITIES_MAX + 2 }, (_, index) =>
    decisionFixture({
      sourceRuleId: index === 0 ? "birthday" : "fresh_update",
      outcome: "ask_question",
      recipientId: `recipient-${index}`,
      priority: "high",
    }),
  );
  const recipients = decisions.map((decision) => ({
    recipientId: decision.recipientId,
    recipientName: decision.recipientId,
  }));
  const ranked = planAttentionOrder({ decisions, recipients });
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  const events = ranked.slice(0, 1).map((item) =>
    exposureEvent({
      opportunityKey: item.opportunityKey,
      occurredAt: "2026-07-10T13:00:00.000Z",
    }),
  );
  const visible = getVisibleFatigueOpportunities(applyFatigue(ranked, fatigueContextWithEvents(events, evaluatedAt)));
  const capped = visible.slice(0, DASHBOARD_BRAIN_OPPORTUNITIES_MAX);
  expectTrue("visible count reduced by suppression", visible.length < ranked.length);
  expectTrue("visible count still exceeds cap", visible.length > DASHBOARD_BRAIN_OPPORTUNITIES_MAX);
  expect("cap applies to visible only", capped.length, DASHBOARD_BRAIN_OPPORTUNITIES_MAX);
  setEnforcement(false);
}

section("capped-out opportunities are not in delivered visible list");
{
  setEnforcement(true);
  const decisions = Array.from({ length: DASHBOARD_BRAIN_OPPORTUNITIES_MAX + 1 }, (_, index) =>
    decisionFixture({
      sourceRuleId: "fresh_update",
      outcome: "ask_question",
      recipientId: `cap-${index}`,
    }),
  );
  const recipients = decisions.map((decision) => ({
    recipientId: decision.recipientId,
    recipientName: decision.recipientId,
  }));
  const ranked = planAttentionOrder({ decisions, recipients });
  const visible = getVisibleFatigueOpportunities(
    applyFatigue(ranked, fatigueContextWithEvents([], "2026-07-10T14:00:00.000Z")),
  );
  const capped = visible.slice(0, DASHBOARD_BRAIN_OPPORTUNITIES_MAX);
  expect("delivered count", capped.length, DASHBOARD_BRAIN_OPPORTUNITIES_MAX);
  expectTrue("one opportunity capped out", visible.length > capped.length);
  setEnforcement(false);
}

section("suppressed opportunities are not visible for surfaced recording");
{
  setEnforcement(true);
  const ranked = planAttentionOrder({
    decisions: [
      decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a", priority: "high" }),
    ],
    recipients: [{ recipientId: "a", recipientName: "Alice" }],
  });
  const fatigued = applyFatigue(
    ranked,
    fatigueContextWithEvents(
      [exposureEvent({ opportunityKey: "a:birthday", occurredAt: "2026-07-10T13:00:00.000Z" })],
      "2026-07-10T14:00:00.000Z",
    ),
  );
  const visible = getVisibleFatigueOpportunities(fatigued);
  expect("visible count", visible.length, 0);
  setEnforcement(false);
}

async function runParityTests(): Promise<void> {
  const parityRecipients = [
    { recipientId: "alpha", recipientName: "Alpha" },
    { recipientId: "beta", recipientName: "Beta" },
    { recipientId: "wait-recipient", recipientName: "Wait Person" },
  ];
  const parityGeneratedAt = "2026-07-09T12:00:00.000Z";
  const waitExecution = buildExecution();
  const staleExecution = buildExecution({ freshness: "stale" });

  const parityRunBrain = async (recipientId: string): Promise<BrainExecutionResult> => {
    if (recipientId === "alpha") {
      return buildExecution(
        {},
        { birthday: "1988-07-08", generatedAt: "2026-07-01T00:00:00.000Z" },
        recipientId,
      );
    }
    if (recipientId === "beta") return staleExecution;
    return waitExecution;
  };

  const parityOptions = {
    userId: "user-1",
    recipients: parityRecipients,
    runBrain: parityRunBrain,
    generatedAt: parityGeneratedAt,
  };

  setEnforcement(false);

  section("dashboard parity when enforcement is off");
  {
    const first = await buildDashboardBrainOpportunities(parityOptions);
    const second = await buildDashboardBrainOpportunities(parityOptions);
    expect("dashboard stable", JSON.stringify(first), JSON.stringify(second));
  }

  section("notifications parity when enforcement is off");
  {
    const first = await buildNotifications(parityOptions);
    const second = await buildNotifications(parityOptions);
    expect("notifications stable", JSON.stringify(first), JSON.stringify(second));
  }

  section("concierge parity when enforcement is off");
  {
    const first = await buildConciergeWorkspace(parityOptions);
    const second = await buildConciergeWorkspace(parityOptions);
    expect("concierge stable", JSON.stringify(first), JSON.stringify(second));
  }
}

section("applyFatigue fail-open returns visible on evaluation throw");
{
  setEnforcement(true);
  const ranked = planAttentionOrder({
    decisions: [
      decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a", priority: "high" }),
    ],
    recipients: [{ recipientId: "a", recipientName: "Alice" }],
  });

  const poisonedContext: FatigueContext = {
    userId: "user-1",
    evaluatedAt: "2026-07-10T14:00:00.000Z",
    exposureSnapshot: {
      loadedAt: "2026-07-10T14:00:00.000Z",
      byOpportunityKey: new Proxy(
        {},
        {
          get() {
            throw new Error("snapshot read failed");
          },
        },
      ) as FatigueContext["exposureSnapshot"]["byOpportunityKey"],
    },
  };

  const fatigued = applyFatigue(ranked, poisonedContext);
  expectTrue("fail-open visible", fatigued.every((item) => item.fatigueDecision === "visible"));
  setEnforcement(false);
}

section("cross-user isolation");
{
  setEnforcement(true);
  const opportunity = rankedOpportunity("a:birthday");
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  const userAContext = fatigueContextWithEvents(
    [exposureEvent({ opportunityKey: "a:birthday", occurredAt: "2026-07-10T13:00:00.000Z" })],
    evaluatedAt,
    "user-a",
  );
  const userBContext = fatigueContextWithEvents([], evaluatedAt, "user-b");

  expect("user-a suppressed", evaluateRecentlySurfacedRule(opportunity, userAContext).fatigueDecision, "suppressed");
  expect("user-b visible", evaluateRecentlySurfacedRule(opportunity, userBContext).fatigueDecision, "visible");
  setEnforcement(false);
}

section("cross-product shared opportunityKey suppresses when enforcement is on");
{
  setEnforcement(true);
  const opportunity = rankedOpportunity("alpha:birthday");
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  const context = fatigueContextWithEvents(
    [exposureEvent({ opportunityKey: "alpha:birthday", occurredAt: "2026-07-10T13:00:00.000Z" })],
    evaluatedAt,
  );
  const result = evaluateRecentlySurfacedRule(opportunity, context);
  expect("cross-product key suppressed", result.fatigueDecision, "suppressed");
  setEnforcement(false);
}

section("shadow mode keeps visible when enforcement is off");
{
  setEnforcement(false);
  setShadow(true);
  const ranked = planAttentionOrder({
    decisions: [
      decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a", priority: "high" }),
    ],
    recipients: [{ recipientId: "a", recipientName: "Alice" }],
  });
  const fatigued = applyFatigue(
    ranked,
    fatigueContextWithEvents(
      [exposureEvent({ opportunityKey: "a:birthday", occurredAt: "2026-07-10T13:00:00.000Z" })],
      "2026-07-10T14:00:00.000Z",
    ),
  );
  expectTrue("shadow keeps visible", fatigued.every((item) => item.fatigueDecision === "visible"));
}

section("architecture — rules live under fatigue/rules");
{
  const rulesDir = join(FATIGUE_ROOT, "rules");
  const entries = readdirSync(rulesDir);
  expectTrue("recentlySurfacedRule exists", entries.includes("recentlySurfacedRule.ts"));
}

function snapshotGlobalOpportunity(opportunity: GlobalOpportunity): string {
  return JSON.stringify({
    opportunityKey: opportunity.opportunityKey,
    recipientId: opportunity.recipientId,
    recipientName: opportunity.recipientName,
    attentionScore: opportunity.attentionScore,
    globalRank: opportunity.globalRank,
    suppressionReason: opportunity.suppressionReason,
    metadata: opportunity.metadata,
    decision: opportunity.decision,
  });
}

function listFatigueSources(): string {
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

  walk(FATIGUE_ROOT);
  return files.join("\n");
}

section("architecture — fatigue does not sort opportunities");
{
  const source = listFatigueSources();
  expectTrue("no .sort( in fatigue module", !source.includes(".sort("));
}

await runParityTests();

} finally {
  restoreEnv();
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
