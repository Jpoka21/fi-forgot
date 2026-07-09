/**
 * Unit tests for Dashboard Brain spotlight wiring (Step 4e).
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/dashboard-spotlight-wiring.test.ts
 */

import { buildDashboardSnapshotForDisplay } from "../app/dashboard-brain/buildDashboardSnapshotForDisplay.js";
import {
  mergeBrainSpotlightIntoSnapshot,
  mergeBrainSuggestedActionsIntoSnapshot,
} from "../app/dashboard-brain/mergeBrainIntoSnapshot.js";
import type { DashboardOpportunityViewModel } from "../app/dashboard-brain/dashboardOpportunityViewModel.js";
import type { FiDashboardSnapshot } from "../app/dashboard/dashboardDomain.js";
import type { DashboardBrainOpportunities } from "../app/dashboard-brain/dashboardBrainOpportunitiesTypes.js";
import type { ApiResult } from "../app/api/shared/types.js";
import type { Recipient } from "../lib/data.js";

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

const RECIPIENT_ALICE: Recipient = {
  id: "recipient-alice",
  name: "Alice Example",
  relationship: "Friend",
  children: [],
  needsMothersDay: false,
  needsFathersDay: false,
  needsValentinesDay: false,
  needsChristmasHanukkah: false,
  needsThanksgiving: false,
  needsNewYears: false,
  needsEaster: false,
  selectedEvents: ["Birthday"],
  customDates: [],
  tonePreference: "warm",
  personalityNotes: "",
  favoriteMemories: "",
  insideJokes: "",
  thingsToAvoid: "",
  emotionalLevel: 3,
  deliveryPreference: "mail",
  previewDays: 14,
};

const RECIPIENT_BOB: Recipient = {
  id: "recipient-bob",
  name: "Bob Example",
  relationship: "Sibling",
  children: [],
  needsMothersDay: false,
  needsFathersDay: false,
  needsValentinesDay: false,
  needsChristmasHanukkah: false,
  needsThanksgiving: false,
  needsNewYears: false,
  needsEaster: false,
  selectedEvents: ["Birthday"],
  customDates: [],
  tonePreference: "warm",
  personalityNotes: "",
  favoriteMemories: "",
  insideJokes: "",
  thingsToAvoid: "",
  emotionalLevel: 3,
  deliveryPreference: "mail",
  previewDays: 14,
};

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

function baseSnapshot(): FiDashboardSnapshot {
  return {
    recipients: [RECIPIENT_ALICE, RECIPIENT_BOB],
    cards: [],
    upcomingEvents: [],
    upcomingMoments: [],
    pendingReviewCount: 0,
    attentionItems: [],
    highlights: [],
    recentActivity: [],
    spotlight: {
      recipient: RECIPIENT_ALICE,
      summary: "Legacy spotlight summary",
      suggestedActionLabel: "Legacy spotlight action",
      suggestedActionHref: "/relationship/recipient-alice",
      healthInsight: "Legacy health gap",
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

section("mergeBrainSpotlightIntoSnapshot flag off keeps legacy spotlight");
{
  const snapshot = baseSnapshot();
  const merged = mergeBrainSpotlightIntoSnapshot({
    snapshot,
    opportunities: [OPPORTUNITY_BOB],
    brainEnabled: false,
  });

  expectTrue("same snapshot reference", merged === snapshot);
  expect("legacy spotlight summary", merged.spotlight?.summary, "Legacy spotlight summary");
}

section("flag on uses top Brain opportunity for spotlight");
{
  const merged = mergeBrainSpotlightIntoSnapshot({
    snapshot: baseSnapshot(),
    opportunities: [OPPORTUNITY_ALICE],
    brainEnabled: true,
  });

  expect("spotlight recipient", merged.spotlight?.recipient.id, "recipient-alice");
  expect("spotlight summary uses name and title", merged.spotlight?.summary, "Alice Example · Birthday preparation");
  expect("spotlight actionLabel from server", merged.spotlight?.suggestedActionLabel, "Prepare for birthday");
  expect("spotlight href from ViewModel", merged.spotlight?.suggestedActionHref, "/relationship/recipient-alice");
  expect("healthInsight uses explanation", merged.spotlight?.healthInsight, OPPORTUNITY_ALICE.explanation);
}

section("server order is preserved for spotlight");
{
  const merged = mergeBrainSpotlightIntoSnapshot({
    snapshot: baseSnapshot(),
    opportunities: [OPPORTUNITY_BOB, OPPORTUNITY_ALICE],
    brainEnabled: true,
  });

  expect("first opportunity drives spotlight", merged.spotlight?.recipient.id, "recipient-bob");
  expect("not second opportunity", merged.spotlight?.suggestedActionLabel, "Add a fresh update");
}

section("empty Brain opportunities clear legacy spotlight");
{
  const snapshot = baseSnapshot();
  const merged = mergeBrainSpotlightIntoSnapshot({
    snapshot,
    opportunities: [],
    brainEnabled: true,
  });

  expect("spotlight null", merged.spotlight, null);
  expectTrue("no legacy fallback", merged.spotlight?.summary !== "Legacy spotlight summary");
}

section("hero conciergeSummary unchanged by spotlight merge");
{
  const merged = mergeBrainSpotlightIntoSnapshot({
    snapshot: baseSnapshot(),
    opportunities: [OPPORTUNITY_ALICE],
    brainEnabled: true,
  });

  expect("conciergeSummary unchanged", merged.welcome.conciergeSummary, "Legacy concierge summary");
}

section("suggested actions still work alongside spotlight merge");
{
  const snapshot = baseSnapshot();
  const withSuggested = mergeBrainSuggestedActionsIntoSnapshot({
    snapshot,
    opportunities: [OPPORTUNITY_BOB, OPPORTUNITY_ALICE],
    brainEnabled: true,
  });
  const merged = mergeBrainSpotlightIntoSnapshot({
    snapshot: withSuggested,
    opportunities: [OPPORTUNITY_BOB, OPPORTUNITY_ALICE],
    brainEnabled: true,
  });

  expect(
    "suggestedActions order preserved",
    merged.suggestedActions?.map((item) => item.id),
    ["recipient-bob:fresh_update", "recipient-alice:birthday"],
  );
  expect("spotlight from first opportunity", merged.spotlight?.recipient.id, "recipient-bob");
}

section("server actionLabel used verbatim");
{
  const custom: DashboardOpportunityViewModel = {
    ...OPPORTUNITY_ALICE,
    actionLabel: "Custom server label",
  };
  const merged = mergeBrainSpotlightIntoSnapshot({
    snapshot: baseSnapshot(),
    opportunities: [custom],
    brainEnabled: true,
  });

  expect("actionLabel verbatim", merged.spotlight?.suggestedActionLabel, "Custom server label");
}

async function runAsyncTests(): Promise<void> {
  section("buildDashboardSnapshotForDisplay flag off keeps legacy spotlight");
  {
    const snapshot = await buildDashboardSnapshotForDisplay(
      { userName: "James", firstTimeDismissed: true },
      {
        brainEnabled: false,
        buildLegacySnapshot: () => baseSnapshot(),
        fetchOpportunities: async () =>
          apiOk({
            version: 1,
            generatedAt: "2026-07-09T12:00:00.000Z",
            opportunities: [],
            spotlight: null,
          }),
      },
    );

    expect("legacy spotlight", snapshot.spotlight?.summary, "Legacy spotlight summary");
    expectTrue("hero unchanged", snapshot.welcome.conciergeSummary === "Legacy concierge summary");
  }

  section("buildDashboardSnapshotForDisplay flag on wires spotlight from API");
  {
    const snapshot = await buildDashboardSnapshotForDisplay(
      { userName: "James", firstTimeDismissed: true },
      {
        brainEnabled: true,
        buildLegacySnapshot: () => baseSnapshot(),
        fetchOpportunities: async () =>
          apiOk({
            version: 1,
            generatedAt: "2026-07-09T12:00:00.000Z",
            opportunities: [
              {
                recipientId: "recipient-bob",
                recipientName: "Bob Example",
                sourceRuleId: "fresh_update",
                outcome: "ask_question",
                priority: "medium",
                title: "Fresh update",
                explanation: "Profile information is stale.",
                profileHref: "/relationship/recipient-bob",
                actionLabel: "Add a fresh update",
                rank: 1,
              },
            ],
            spotlight: null,
          }),
      },
    );

    expect("brain spotlight recipient", snapshot.spotlight?.recipient.id, "recipient-bob");
    expect("suggestedActions present", snapshot.suggestedActions?.length, 1);
    expect(
      "hero conciergeSummary from top explanation",
      snapshot.welcome.conciergeSummary,
      "Profile information is stale.",
    );
  }
}

await runAsyncTests();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
