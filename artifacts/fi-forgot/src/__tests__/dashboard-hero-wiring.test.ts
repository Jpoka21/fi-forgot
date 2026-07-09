/**
 * Unit tests for Dashboard Brain hero wiring (Step 4f).
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/dashboard-hero-wiring.test.ts
 */

import { buildDashboardSnapshotForDisplay } from "../app/dashboard-brain/buildDashboardSnapshotForDisplay.js";
import {
  mergeBrainHeroIntoSnapshot,
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

section("mergeBrainHeroIntoSnapshot flag off keeps legacy conciergeSummary");
{
  const snapshot = baseSnapshot();
  const merged = mergeBrainHeroIntoSnapshot({
    snapshot,
    opportunities: [OPPORTUNITY_BOB],
    brainEnabled: false,
  });

  expectTrue("same snapshot reference", merged === snapshot);
  expect("legacy conciergeSummary", merged.welcome.conciergeSummary, "Legacy concierge summary");
}

section("flag on uses top Brain opportunity explanation");
{
  const merged = mergeBrainHeroIntoSnapshot({
    snapshot: baseSnapshot(),
    opportunities: [OPPORTUNITY_ALICE],
    brainEnabled: true,
  });

  expect("conciergeSummary from explanation", merged.welcome.conciergeSummary, OPPORTUNITY_ALICE.explanation);
  expect("headline unchanged", merged.welcome.headline, "Hello");
}

section("no frontend ranking for hero");
{
  const merged = mergeBrainHeroIntoSnapshot({
    snapshot: baseSnapshot(),
    opportunities: [OPPORTUNITY_BOB, OPPORTUNITY_ALICE],
    brainEnabled: true,
  });

  expect("uses first opportunity explanation", merged.welcome.conciergeSummary, OPPORTUNITY_BOB.explanation);
}

section("empty Brain opportunities clear conciergeSummary");
{
  const snapshot = baseSnapshot();
  const merged = mergeBrainHeroIntoSnapshot({
    snapshot,
    opportunities: [],
    brainEnabled: true,
  });

  expectTrue("conciergeSummary omitted", merged.welcome.conciergeSummary === undefined);
  expectTrue("no legacy fallback", merged.welcome.conciergeSummary !== "Legacy concierge summary");
}

section("spotlight still works alongside hero merge");
{
  const snapshot = baseSnapshot();
  const withSpotlight = mergeBrainSpotlightIntoSnapshot({
    snapshot,
    opportunities: [OPPORTUNITY_BOB],
    brainEnabled: true,
  });
  const merged = mergeBrainHeroIntoSnapshot({
    snapshot: withSpotlight,
    opportunities: [OPPORTUNITY_BOB],
    brainEnabled: true,
  });

  expect("spotlight recipient", merged.spotlight?.recipient.id, "recipient-bob");
  expect("hero summary", merged.welcome.conciergeSummary, OPPORTUNITY_BOB.explanation);
}

section("suggested actions still work alongside hero merge");
{
  const snapshot = baseSnapshot();
  const withSuggested = mergeBrainSuggestedActionsIntoSnapshot({
    snapshot,
    opportunities: [OPPORTUNITY_BOB, OPPORTUNITY_ALICE],
    brainEnabled: true,
  });
  const merged = mergeBrainHeroIntoSnapshot({
    snapshot: withSuggested,
    opportunities: [OPPORTUNITY_BOB, OPPORTUNITY_ALICE],
    brainEnabled: true,
  });

  expect(
    "suggestedActions order preserved",
    merged.suggestedActions?.map((item) => item.id),
    ["recipient-bob:fresh_update", "recipient-alice:birthday"],
  );
  expect("hero uses first explanation", merged.welcome.conciergeSummary, OPPORTUNITY_BOB.explanation);
}

async function runAsyncTests(): Promise<void> {
  section("buildDashboardSnapshotForDisplay flag off keeps legacy hero");
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

    expect("legacy conciergeSummary", snapshot.welcome.conciergeSummary, "Legacy concierge summary");
    expect("legacy spotlight", snapshot.spotlight?.summary, "Legacy spotlight summary");
  }

  section("buildDashboardSnapshotForDisplay flag on wires hero from API");
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
          }),
      },
    );

    expect(
      "conciergeSummary from API",
      snapshot.welcome.conciergeSummary,
      "Their birthday is inside the preparation window.",
    );
    expect("spotlight wired", snapshot.spotlight?.recipient.id, "recipient-alice");
    expect("suggestedActions wired", snapshot.suggestedActions?.length, 1);
  }

  section("buildDashboardSnapshotForDisplay empty opportunities omit hero summary");
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
            opportunities: [],
            spotlight: null,
          }),
      },
    );

    expectTrue("conciergeSummary omitted", snapshot.welcome.conciergeSummary === undefined);
    expect("spotlight cleared", snapshot.spotlight, null);
    expect("suggestedActions empty", snapshot.suggestedActions, []);
  }
}

await runAsyncTests();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
