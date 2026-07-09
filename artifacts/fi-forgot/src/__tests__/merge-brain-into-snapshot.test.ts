/**
 * Unit tests for dashboard Brain snapshot merge layer.
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/merge-brain-into-snapshot.test.ts
 */

import { mergeBrainIntoSnapshot } from "../app/dashboard-brain/mergeBrainIntoSnapshot.js";
import type { DashboardOpportunityViewModel } from "../app/dashboard-brain/dashboardOpportunityViewModel.js";
import type { FiDashboardSnapshot } from "../app/dashboard/dashboardDomain.js";
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
  selectedEvents: ["Birthday"],
  mailingAddress: { line1: "1 Main St", city: "Town", state: "NY", zip: "10001" },
};

const RECIPIENT_BOB: Recipient = {
  id: "recipient-bob",
  name: "Bob Example",
  relationship: "Sibling",
  selectedEvents: ["Birthday"],
  mailingAddress: { line1: "2 Oak Ave", city: "Town", state: "NY", zip: "10001" },
};

function baseSnapshot(): FiDashboardSnapshot {
  return {
    recipients: [RECIPIENT_ALICE, RECIPIENT_BOB],
    cards: [],
    upcomingEvents: [],
    upcomingMoments: [],
    pendingReviewCount: 2,
    attentionItems: [
      {
        id: "plan-limit",
        title: "Plan limit",
        actionLabel: "View plans",
        href: "#upgrade",
      },
    ],
    highlights: [{ id: "highlight-1", title: "Legacy highlight", detail: "Keep me", href: "/cards/review" }],
    recentActivity: [
      {
        id: "activity-1",
        title: "Recent card",
        detail: "Queued to mail",
        href: "/cards/review?id=1",
        sortKey: 100,
      },
    ],
    spotlight: {
      recipient: RECIPIENT_ALICE,
      summary: "Legacy spotlight summary",
      suggestedActionLabel: "Legacy spotlight action",
      suggestedActionHref: "/relationship/recipient-alice",
      healthInsight: "Legacy health gap",
    },
    welcome: {
      dateLabel: "Thursday, July 9",
      headline: "Good afternoon, James.",
      subheadline: "Here's what's coming up.",
      conciergeSummary: "Legacy concierge summary",
      pendingReviewCount: 2,
    },
    quickActions: [{ id: "add-person", label: "Add someone", href: "/recipients/new" }],
    isEmpty: false,
    isFirstTime: false,
  };
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

section("flag off preserves snapshot");
{
  const snapshot = baseSnapshot();
  const merged = mergeBrainIntoSnapshot({
    snapshot,
    opportunities: [OPPORTUNITY_ALICE],
    brainEnabled: false,
  });

  expectTrue("returns same snapshot reference", merged === snapshot);
  expectTrue("no suggestedActions field", merged.suggestedActions === undefined);
  expect("legacy spotlight unchanged", merged.spotlight?.summary, "Legacy spotlight summary");
  expect("legacy conciergeSummary unchanged", merged.welcome.conciergeSummary, "Legacy concierge summary");
  expect("operational attentionItems unchanged", merged.attentionItems, snapshot.attentionItems);
  expect("operational recentActivity unchanged", merged.recentActivity, snapshot.recentActivity);
}

section("flag on with opportunities replaces relationship opportunity fields");
{
  const snapshot = baseSnapshot();
  const merged = mergeBrainIntoSnapshot({
    snapshot,
    opportunities: [OPPORTUNITY_ALICE, OPPORTUNITY_BOB],
    brainEnabled: true,
  });

  expect("suggestedActions count", merged.suggestedActions?.length, 2);
  expect("first suggested action uses server actionLabel", merged.suggestedActions?.[0]?.actionLabel, "Prepare for birthday");
  expect("second suggested action uses server actionLabel", merged.suggestedActions?.[1]?.actionLabel, "Add a fresh update");
  expectTrue("legacy highlights preserved", merged.highlights === snapshot.highlights);
  expectTrue("legacy attentionItems preserved", merged.attentionItems === snapshot.attentionItems);
  expectTrue("legacy recentActivity preserved", merged.recentActivity === snapshot.recentActivity);
  expect("pendingReviewCount preserved", merged.pendingReviewCount, 2);
}

section("top opportunity controls spotlight and hero conciergeSummary");
{
  const snapshot = baseSnapshot();
  const merged = mergeBrainIntoSnapshot({
    snapshot,
    opportunities: [OPPORTUNITY_BOB, OPPORTUNITY_ALICE],
    brainEnabled: true,
  });

  expect("spotlight recipient from top opportunity", merged.spotlight?.recipient.id, "recipient-bob");
  expect("spotlight actionLabel from server", merged.spotlight?.suggestedActionLabel, "Add a fresh update");
  expect("spotlight href from opportunity", merged.spotlight?.suggestedActionHref, "/relationship/recipient-bob");
  expect("conciergeSummary from top explanation", merged.welcome.conciergeSummary, OPPORTUNITY_BOB.explanation);
  expect("welcome headline preserved", merged.welcome.headline, snapshot.welcome.headline);
}

section("flag on with empty opportunities is safe");
{
  const snapshot = baseSnapshot();
  const merged = mergeBrainIntoSnapshot({
    snapshot,
    opportunities: [],
    brainEnabled: true,
  });

  expect("suggestedActions empty", merged.suggestedActions, []);
  expect("spotlight cleared", merged.spotlight, null);
  expectTrue("conciergeSummary cleared", merged.welcome.conciergeSummary === undefined);
  expectTrue("operational sections intact", merged.attentionItems.length === snapshot.attentionItems.length);
  expectTrue("highlights intact", merged.highlights.length === snapshot.highlights.length);
}

section("no frontend ranking");
{
  const snapshot = baseSnapshot();
  const inputOrder = [OPPORTUNITY_BOB, OPPORTUNITY_ALICE];
  const merged = mergeBrainIntoSnapshot({
    snapshot,
    opportunities: inputOrder,
    brainEnabled: true,
  });

  expect(
    "suggestedActions preserve server/input order",
    merged.suggestedActions?.map((item) => item.id),
    inputOrder.map((item) => item.id),
  );
  expect(
    "spotlight follows first input opportunity not re-ranked by priority",
    merged.spotlight?.recipient.id,
    "recipient-bob",
  );
}

section("actionLabel is not inferred from sourceRuleId");
{
  const snapshot = baseSnapshot();
  const custom: DashboardOpportunityViewModel = {
    ...OPPORTUNITY_ALICE,
    id: "recipient-alice:fresh_update",
    actionLabel: "Custom server-provided label",
  };

  const merged = mergeBrainIntoSnapshot({
    snapshot,
    opportunities: [custom],
    brainEnabled: true,
  });

  expect("spotlight actionLabel verbatim", merged.spotlight?.suggestedActionLabel, "Custom server-provided label");
  expect("suggestedActions actionLabel verbatim", merged.suggestedActions?.[0]?.actionLabel, "Custom server-provided label");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
