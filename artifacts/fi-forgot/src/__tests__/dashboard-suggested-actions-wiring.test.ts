/**
 * Unit tests for Dashboard Brain suggested-actions wiring (Step 4d).
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/dashboard-suggested-actions-wiring.test.ts
 */

import { buildDashboardSnapshotForDisplay } from "../app/dashboard-brain/buildDashboardSnapshotForDisplay.js";
import { mergeBrainSuggestedActionsIntoSnapshot } from "../app/dashboard-brain/mergeBrainIntoSnapshot.js";
import {
  limitDashboardSuggestedActions,
  resolveDashboardSuggestedActions,
} from "../app/dashboard-brain/resolveDashboardSuggestedActions.js";
import type { DashboardOpportunityViewModel } from "../app/dashboard-brain/dashboardOpportunityViewModel.js";
import type { FiDashboardSnapshot } from "../app/dashboard/dashboardDomain.js";
import type { DashboardBrainOpportunities } from "../app/dashboard-brain/dashboardBrainOpportunitiesTypes.js";
import type { ApiResult } from "../app/api/shared/types.js";

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

const OPPORTUNITY_ALICE: DashboardOpportunityViewModel = {
  id: "recipient-alice:birthday",
  recipientId: "recipient-alice",
  recipientName: "Alice Example",
  title: "Birthday preparation",
  explanation: "Their birthday is inside the preparation window.",
  href: "/relationship/recipient-alice",
  priority: "high",
  actionLabel: "Prepare for birthday",
};

const OPPORTUNITY_BOB: DashboardOpportunityViewModel = {
  id: "recipient-bob:fresh_update",
  recipientId: "recipient-bob",
  recipientName: "Bob Example",
  title: "Fresh update",
  explanation: "Profile information is stale.",
  href: "/relationship/recipient-bob",
  priority: "medium",
  actionLabel: "Add a fresh update",
};

function minimalSnapshot(): FiDashboardSnapshot {
  return {
    recipients: [],
    cards: [],
    upcomingEvents: [],
    upcomingMoments: [],
    pendingReviewCount: 0,
    attentionItems: [],
    highlights: [],
    recentActivity: [],
    spotlight: {
      recipient: {
        id: "legacy",
        name: "Legacy",
        relationship: "Friend",
        children: [],
        needsMothersDay: false,
        needsFathersDay: false,
        needsValentinesDay: false,
        needsChristmasHanukkah: false,
        needsThanksgiving: false,
        needsNewYears: false,
        needsEaster: false,
        selectedEvents: [],
        customDates: [],
        tonePreference: "warm",
        personalityNotes: "",
        favoriteMemories: "",
        insideJokes: "",
        thingsToAvoid: "",
        emotionalLevel: 3,
        deliveryPreference: "mail",
        previewDays: 14,
      },
      summary: "Legacy spotlight",
      suggestedActionLabel: "Legacy action",
      suggestedActionHref: "/relationship/legacy",
    },
    welcome: {
      dateLabel: "Thursday, July 9",
      headline: "Hello",
      subheadline: "Sub",
      conciergeSummary: "Legacy concierge summary",
      pendingReviewCount: 0,
    },
    quickActions: [],
    isEmpty: false,
    isFirstTime: false,
  };
}

function apiOk(data: DashboardBrainOpportunities): ApiResult<DashboardBrainOpportunities> {
  return {
    ok: true,
    status: 200,
    data,
    error: null,
    response: new Response(),
  };
}

section("resolveDashboardSuggestedActions flag off uses legacy source");
{
  const legacyFixture = [
    {
      id: "legacy-1",
      type: "improve_profile" as const,
      title: "Legacy suggestion",
      description: "Legacy description",
      href: "/relationship/legacy",
      actionLabel: "Open profile",
      urgency: "medium" as const,
    },
  ];

  const model = resolveDashboardSuggestedActions({
    brainEnabled: false,
    userEmail: "user@example.com",
    loadLegacySuggestions: () => legacyFixture,
  });

  expect("source legacy", model.source, "legacy");
  expect("brain actions empty", model.brainActions, []);
  expect("legacy actions from loader", model.legacyActions, legacyFixture);
}

section("resolveDashboardSuggestedActions flag on uses brain snapshot only");
{
  const suggested = mergeBrainSuggestedActionsIntoSnapshot({
    snapshot: minimalSnapshot(),
    opportunities: [OPPORTUNITY_ALICE, OPPORTUNITY_BOB],
    brainEnabled: true,
  }).suggestedActions!;

  const model = resolveDashboardSuggestedActions({
    brainEnabled: true,
    snapshotSuggestedActions: suggested,
    userEmail: "user@example.com",
  });

  expect("source brain", model.source, "brain");
  expect("legacy actions not loaded", model.legacyActions, []);
  expect(
    "brain actions from snapshot",
    model.brainActions.map((item) => item.id),
    ["recipient-alice:birthday", "recipient-bob:fresh_update"],
  );
}

section("mergeBrainSuggestedActionsIntoSnapshot does not wire spotlight or hero");
{
  const snapshot = minimalSnapshot();
  const merged = mergeBrainSuggestedActionsIntoSnapshot({
    snapshot,
    opportunities: [OPPORTUNITY_ALICE],
    brainEnabled: true,
  });

  expect("spotlight unchanged", merged.spotlight, snapshot.spotlight);
  expect("conciergeSummary unchanged", merged.welcome.conciergeSummary, "Legacy concierge summary");
}

section("server order is preserved");
{
  const inputOrder = [OPPORTUNITY_BOB, OPPORTUNITY_ALICE];
  const merged = mergeBrainSuggestedActionsIntoSnapshot({
    snapshot: minimalSnapshot(),
    opportunities: inputOrder,
    brainEnabled: true,
  });

  expect(
    "suggestedActions order",
    merged.suggestedActions?.map((item) => item.id),
    inputOrder.map((item) => item.id),
  );
}

section("server actionLabel is used verbatim");
{
  const custom: DashboardOpportunityViewModel = {
    ...OPPORTUNITY_ALICE,
    actionLabel: "Custom server-provided label",
  };
  const merged = mergeBrainSuggestedActionsIntoSnapshot({
    snapshot: minimalSnapshot(),
    opportunities: [custom],
    brainEnabled: true,
  });

  expect("actionLabel verbatim", merged.suggestedActions?.[0]?.actionLabel, "Custom server-provided label");
}

section("empty Brain opportunities are safe");
{
  const model = resolveDashboardSuggestedActions({
    brainEnabled: true,
    snapshotSuggestedActions: [],
  });

  expect("empty brain actions", model.brainActions, []);
  expectTrue("no legacy fallback when flag on", model.legacyActions.length === 0);

  const merged = mergeBrainSuggestedActionsIntoSnapshot({
    snapshot: minimalSnapshot(),
    opportunities: [],
    brainEnabled: true,
  });
  expect("snapshot suggestedActions empty array", merged.suggestedActions, []);
  expectTrue("spotlight still intact for this step", merged.spotlight !== null);
}

section("display limit preserves order without re-ranking");
{
  const many = Array.from({ length: 5 }, (_, index) => ({
    ...OPPORTUNITY_ALICE,
    id: `recipient-${index}:birthday`,
    title: `Opportunity ${index}`,
  }));

  const limited = limitDashboardSuggestedActions(many);
  expect("limits to three", limited.length, 3);
  expect(
    "first three in original order",
    limited.map((item) => item.id),
    many.slice(0, 3).map((item) => item.id),
  );
}

async function runAsyncTests(): Promise<void> {
  section("buildDashboardSnapshotForDisplay flag on merges suggestedActions and spotlight");
  {
    const apiPayload: DashboardBrainOpportunities = {
      version: 1,
      generatedAt: "2026-07-09T12:00:00.000Z",
      opportunities: [
        {
          recipientId: "recipient-alice",
          recipientName: "Alice Example",
          sourceRuleId: "birthday",
          outcome: "ask_question",
          priority: "high",
          title: "Birthday preparation",
          explanation: "Their birthday is inside the preparation window.",
          profileHref: "/relationship/recipient-alice",
          actionLabel: "Prepare for birthday",
          rank: 1,
        },
      ],
      spotlight: null,
    };

    const snapshot = await buildDashboardSnapshotForDisplay(
      { userName: "James", firstTimeDismissed: true },
      {
        brainEnabled: true,
        buildLegacySnapshot: () => minimalSnapshot(),
        fetchOpportunities: async () => apiOk(apiPayload),
      },
    );

    expect("suggestedActions merged", snapshot.suggestedActions?.length, 1);
    expect("actionLabel from API", snapshot.suggestedActions?.[0]?.actionLabel, "Prepare for birthday");
    expect(
      "conciergeSummary from top explanation",
      snapshot.welcome.conciergeSummary,
      "Their birthday is inside the preparation window.",
    );
  }

  section("buildDashboardSnapshotForDisplay flag off skips fetch");
  {
    let fetchCalled = false;
    const snapshot = await buildDashboardSnapshotForDisplay(
      { userName: "James", firstTimeDismissed: true },
      {
        brainEnabled: false,
        buildLegacySnapshot: () => minimalSnapshot(),
        fetchOpportunities: async () => {
          fetchCalled = true;
          return apiOk({
            version: 1,
            generatedAt: "2026-07-09T12:00:00.000Z",
            opportunities: [],
            spotlight: null,
          });
        },
      },
    );

    expectTrue("fetch not called", !fetchCalled);
    expectTrue("no suggestedActions on snapshot", snapshot.suggestedActions === undefined);
  }
}

await runAsyncTests();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
