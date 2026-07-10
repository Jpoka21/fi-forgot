/**
 * Unit tests for relationship Brain notifications (Step 2b).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/notifications-brain.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import type { BrainExecutionResult } from "../brain/orchestrator.js";
import { buildNotificationItem, buildNotificationId } from "../brain/product/buildNotificationItem.js";
import { buildNotifications } from "../brain/product/buildNotifications.js";
import { buildProductBrainDecision } from "../brain/product/buildProductBrainDecision.js";
import {
  NOTIFICATIONS_MAX,
  NOTIFICATIONS_VERSION,
  NOTIFICATION_SOURCE_BRAIN,
} from "../brain/product/notificationTypes.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { selectQuestionForActionPlan } from "../brain/questions/index.js";
import {
  compareRankableNotifications,
  rankNotifications,
} from "../brain/product/rankNotifications.js";
import { shouldIncludeNotification } from "../brain/product/shouldIncludeNotification.js";
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

function decisionFixture(
  overrides: Partial<ProductBrainDecision> & {
    sourceRuleId: string;
    outcome: ProductBrainDecision["decision"]["outcome"];
    priority?: ProductBrainDecision["actionPlan"]["priority"];
    title?: string;
    explanation?: string;
  },
): ProductBrainDecision {
  const {
    sourceRuleId,
    outcome,
    priority = "medium",
    title = "Title",
    explanation = "Explanation.",
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
    display: { title, explanation },
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
    relationshipId: "recipient-1",
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

const FORBIDDEN_PUBLIC_FIELDS = [
  "confidence",
  "ruleEvaluation",
  "sourceRuleId",
  "outcome",
  "debug",
  "version",
  "actionPlan",
  "selectedFollowUpQuestion",
  "display",
  "decision",
] as const;

section("shouldIncludeNotification");
{
  expectTrue(
    "includes ask_question",
    shouldIncludeNotification(
      decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question" }),
    ),
  );
  expectTrue(
    "includes recommend_action",
    shouldIncludeNotification(
      decisionFixture({ sourceRuleId: "inactivity", outcome: "recommend_action" }),
    ),
  );
  expectTrue(
    "includes show_dashboard_insight",
    shouldIncludeNotification(
      decisionFixture({ sourceRuleId: "memory_accumulation", outcome: "show_dashboard_insight" }),
    ),
  );
  expectTrue(
    "excludes wait outcome",
    !shouldIncludeNotification(
      decisionFixture({ sourceRuleId: "wait", outcome: "wait" }),
    ),
  );
  expectTrue(
    "excludes wait sourceRuleId even if outcome ask_question",
    !shouldIncludeNotification(
      decisionFixture({ sourceRuleId: "wait", outcome: "ask_question" }),
    ),
  );
  expectTrue(
    "excludes do_nothing",
    !shouldIncludeNotification(
      decisionFixture({ sourceRuleId: "fresh_update", outcome: "do_nothing" }),
    ),
  );
  expectTrue(
    "includes prepare_card",
    shouldIncludeNotification(
      decisionFixture({ sourceRuleId: "birthday", outcome: "prepare_card" }),
    ),
  );
}

section("buildNotificationItem");
{
  const decision = decisionFixture({
    sourceRuleId: "birthday",
    outcome: "ask_question",
    priority: "high",
    title: "Birthday preparation",
    explanation: "Their birthday is inside the preparation window.",
    actionPlan: {
      type: "ask_question",
      category: "birthday",
      priority: "high",
      primaryReason: "event_briefing_incomplete",
      routing: {
        experience: "event_briefing",
        eventId: "birthday",
        briefingEventLabel: "Birthday",
      },
    },
  });
  const item = buildNotificationItem(
    decision,
    { recipientId: "r-42", recipientName: "Alice" },
    "2026-07-09T12:00:00.000Z",
  );
  expect("id", item.id, buildNotificationId("r-42", "birthday"));
  expect("recipientId", item.recipientId, "r-42");
  expect("recipientName", item.recipientName, "Alice");
  expect("title", item.title, "Birthday preparation");
  expect("body", item.body, "Their birthday is inside the preparation window.");
  expect("href", item.href, "/briefings/r-42/Birthday");
  expect("actionLabel server-provided", item.actionLabel, "Add birthday details");
  expect("priority", item.priority, "high");
  expect("createdAt", item.createdAt, "2026-07-09T12:00:00.000Z");
  expect("source", item.source, NOTIFICATION_SOURCE_BRAIN);
  for (const field of FORBIDDEN_PUBLIC_FIELDS) {
    expectTrue(`no ${field} field`, !(field in item));
  }
}

section("rank stability and ordering");
{
  const items = rankNotifications([
    {
      decision: decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question", recipientId: "b" }),
      recipientId: "b",
      recipientName: "Bob",
    },
    {
      decision: decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a" }),
      recipientId: "a",
      recipientName: "Alice",
    },
    {
      decision: decisionFixture({
        sourceRuleId: "memory_accumulation",
        outcome: "ask_question",
        priority: "low",
        recipientId: "c",
      }),
      recipientId: "c",
      recipientName: "Cara",
    },
  ]);

  expect("birthday ranks first", items[0]?.decision.sourceRuleId, "birthday");
  expect("fresh_update ranks second", items[1]?.decision.sourceRuleId, "fresh_update");

  const again = rankNotifications([...items].reverse());
  expect(
    "stable reorder",
    again.map((item) => item.recipientId),
    items.map((item) => item.recipientId),
  );

  expectTrue(
    "compare is deterministic",
    compareRankableNotifications(items[0]!, items[1]!) < 0,
  );
}

async function runAsyncTests(): Promise<void> {
  section("empty recipients");
  {
    const result = await buildNotifications({
      userId: "user-1",
      recipients: [],
      runBrain: async () => buildExecution(),
      generatedAt: "2026-07-09T12:00:00.000Z",
    });
    expect("version", result.version, NOTIFICATIONS_VERSION);
    expect("generatedAt", result.generatedAt, "2026-07-09T12:00:00.000Z");
    expect("notifications empty", result.notifications, []);
    expect("unreadCount zero", result.unreadCount, 0);
  }

  section("buildNotifications with mocked brain runs");
  {
    const waitExecution = buildExecution();
    const staleExecution = buildExecution({ freshness: "stale" });

    const result = await buildNotifications({
      userId: "user-1",
      recipients: [
        { recipientId: "wait-recipient", recipientName: "Wait Person" },
        { recipientId: "stale-recipient", recipientName: "Stale Person" },
      ],
      runBrain: async (recipientId) => {
        if (recipientId === "stale-recipient") return staleExecution;
        return waitExecution;
      },
      generatedAt: "2026-07-09T12:00:00.000Z",
    });

    expect("only non-wait included", result.notifications.length, 1);
    expect("included recipient", result.notifications[0]?.recipientId, "stale-recipient");
    expect("uses display title", result.notifications[0]?.title, "Fresh update");
    expect("unreadCount matches notifications", result.unreadCount, 1);
    expect("source brain", result.notifications[0]?.source, NOTIFICATION_SOURCE_BRAIN);

    const staleDecision = buildProductBrainDecision("stale-recipient", staleExecution);
    expectTrue(
      "stale maps to included notification",
      shouldIncludeNotification(staleDecision),
    );
  }

  section("ranked notifications preserve deterministic order");
  {
    const staleExecution = buildExecution({ freshness: "stale" });

    const result = await buildNotifications({
      userId: "user-1",
      recipients: [
        { recipientId: "alpha", recipientName: "Alpha" },
        { recipientId: "beta", recipientName: "Beta" },
      ],
      runBrain: async (recipientId) => {
        if (recipientId === "alpha") {
          return buildExecution(
            {},
            { birthday: "1988-07-08", generatedAt: "2026-07-01T00:00:00.000Z" },
          );
        }
        return staleExecution;
      },
      generatedAt: "2026-07-09T12:00:00.000Z",
    });

    expect("two notifications", result.notifications.length, 2);
    expect("birthday first", result.notifications[0]?.id, buildNotificationId("alpha", "birthday"));
    expect("fresh update second", result.notifications[1]?.recipientId, "beta");
  }

  section("caps ranked notifications");
  {
    const staleExecution = buildExecution({ freshness: "stale" });
    const recipients = Array.from({ length: NOTIFICATIONS_MAX + 3 }, (_, index) => ({
      recipientId: `recipient-${index}`,
      recipientName: `Person ${index}`,
    }));

    const result = await buildNotifications({
      userId: "user-1",
      recipients,
      runBrain: async () => staleExecution,
      generatedAt: "2026-07-09T12:00:00.000Z",
    });

    expect("capped length", result.notifications.length, NOTIFICATIONS_MAX);
    expect("unreadCount matches capped length", result.unreadCount, NOTIFICATIONS_MAX);
  }

  section("DTO does not expose Brain internals");
  {
    const staleExecution = buildExecution({ freshness: "stale" });
    const result = await buildNotifications({
      userId: "user-1",
      recipients: [{ recipientId: "r-1", recipientName: "Sam" }],
      runBrain: async () => staleExecution,
      generatedAt: "2026-07-09T12:00:00.000Z",
    });

    const item = result.notifications[0]!;
    for (const field of FORBIDDEN_PUBLIC_FIELDS) {
      expectTrue(`notification item has no ${field}`, !(field in item));
    }
    expectTrue("response has no opportunities field", !("opportunities" in result));
    expectTrue("response has no spotlight field", !("spotlight" in result));
  }
}

await runAsyncTests();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
