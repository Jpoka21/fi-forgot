/**
 * Unit tests for dashboard Brain opportunity ViewModel mapping.
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/map-dashboard-opportunity-view-model.test.ts
 */

import type { DashboardBrainOpportunity } from "../app/dashboard-brain/dashboardBrainOpportunitiesTypes.js";
import {
  dashboardOpportunityViewModelId,
  mapDashboardOpportunityViewModel,
} from "../app/dashboard-brain/mapDashboardOpportunityViewModel.js";

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

const OPPORTUNITY: DashboardBrainOpportunity = {
  recipientId: "recipient-42",
  recipientName: "Alice Example",
  sourceRuleId: "birthday",
  outcome: "ask_question",
  priority: "high",
  title: "Birthday preparation",
  explanation: "Their birthday is inside the preparation window.",
  profileHref: "/relationship/recipient-42",
  actionLabel: "Prepare for birthday",
  rank: 1,
};

section("dashboardOpportunityViewModelId");
{
  expect(
    "stable id",
    dashboardOpportunityViewModelId("recipient-42", "birthday"),
    "recipient-42:birthday",
  );
}

section("mapDashboardOpportunityViewModel");
{
  const viewModel = mapDashboardOpportunityViewModel(OPPORTUNITY);

  expect("id", viewModel.id, "recipient-42:birthday");
  expect("recipientId", viewModel.recipientId, "recipient-42");
  expect("recipientName", viewModel.recipientName, "Alice Example");
  expect("title", viewModel.title, "Birthday preparation");
  expect("explanation", viewModel.explanation, OPPORTUNITY.explanation);
  expect("href from profileHref", viewModel.href, "/relationship/recipient-42");
  expect("priority", viewModel.priority, "high");
  expect("actionLabel from server", viewModel.actionLabel, "Prepare for birthday");
  expectTrue("no sourceRuleId on view model", !("sourceRuleId" in viewModel));
  expectTrue("no rank on view model", !("rank" in viewModel));
}

section("actionLabel is not inferred from sourceRuleId");
{
  const mismatchedLabel: DashboardBrainOpportunity = {
    ...OPPORTUNITY,
    sourceRuleId: "fresh_update",
    actionLabel: "Custom server label",
  };

  const viewModel = mapDashboardOpportunityViewModel(mismatchedLabel);
  expect("uses server actionLabel verbatim", viewModel.actionLabel, "Custom server label");
  expect("id still uses sourceRuleId", viewModel.id, "recipient-42:fresh_update");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
