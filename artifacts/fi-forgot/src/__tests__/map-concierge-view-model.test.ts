/**
 * Unit tests for Concierge workspace ViewModel mapping.
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/map-concierge-view-model.test.ts
 */

import type {
  ConciergeInsight,
  ConciergeRecommendation,
  ConciergeWorkspaceResponse,
} from "../app/concierge-brain/conciergeWorkspaceTypes.js";
import {
  adaptConciergeInsightToRelationshipInsight,
  adaptConciergeRecommendationToFiAiRecommendation,
  mapConciergeInsightViewModel,
  mapConciergeRecommendationViewModel,
  mapConciergeWorkspaceViewModel,
} from "../app/concierge-brain/mapConciergeViewModel.js";

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

const RECOMMENDATION: ConciergeRecommendation = {
  id: "recipient-42:birthday",
  recipientId: "recipient-42",
  recipientName: "Alice Example",
  title: "Birthday preparation",
  body: "Their birthday is inside the preparation window.",
  href: "/relationship/recipient-42",
  actionLabel: "Prepare for birthday",
  priority: "high",
  kind: "relationship",
};

const INSIGHT: ConciergeInsight = {
  id: "recipient-42:birthday:insight",
  recipientId: "recipient-42",
  recipientName: "Alice Example",
  title: "Birthday preparation",
  body: "Their birthday is inside the preparation window.",
  href: "/relationship/recipient-42",
};

const FORBIDDEN_VIEW_MODEL_FIELDS = [
  "confidence",
  "ruleEvaluation",
  "sourceRuleId",
  "outcome",
  "debug",
  "decision",
  "actionPlan",
  "display",
  "opportunities",
  "notifications",
] as const;

section("mapConciergeRecommendationViewModel");
{
  const viewModel = mapConciergeRecommendationViewModel(RECOMMENDATION);
  expect("id from server", viewModel.id, "recipient-42:birthday");
  expect("actionLabel from server", viewModel.actionLabel, "Prepare for birthday");
  expect("kind relationship", viewModel.kind, "relationship");
  for (const field of FORBIDDEN_VIEW_MODEL_FIELDS) {
    expectTrue(`no ${field} on recommendation view model`, !(field in viewModel));
  }
}

section("mapConciergeInsightViewModel");
{
  const viewModel = mapConciergeInsightViewModel(INSIGHT);
  expect("id from server", viewModel.id, "recipient-42:birthday:insight");
  expect("body", viewModel.body, INSIGHT.body);
  for (const field of FORBIDDEN_VIEW_MODEL_FIELDS) {
    expectTrue(`no ${field} on insight view model`, !(field in viewModel));
  }
}

section("adaptConciergeRecommendationToFiAiRecommendation");
{
  const viewModel = mapConciergeRecommendationViewModel(RECOMMENDATION);
  const adapted = adaptConciergeRecommendationToFiAiRecommendation(viewModel);
  expect("description from body", adapted.description, RECOMMENDATION.body);
  expect("actionLabel verbatim", adapted.actionLabel, "Prepare for birthday");
  expect("confidence from priority", adapted.confidence, "high");
  expect("sourceType relationship", adapted.sourceType, "relationship");
  expectTrue("no sourceRuleId", !("sourceRuleId" in adapted));
}

section("adaptConciergeInsightToRelationshipInsight");
{
  const viewModel = mapConciergeInsightViewModel(INSIGHT);
  const adapted = adaptConciergeInsightToRelationshipInsight(viewModel);
  expect("description from body", adapted.description, INSIGHT.body);
  expect("recipientName", adapted.recipientName, "Alice Example");
}

section("empty recommendations and insights");
{
  const emptyResponse: ConciergeWorkspaceResponse = {
    version: 1,
    generatedAt: "2026-07-09T12:00:00.000Z",
    recommendations: [],
    insights: [],
  };
  const viewModel = mapConciergeWorkspaceViewModel(emptyResponse);
  expect("empty recommendations", viewModel.recommendations, []);
  expect("empty insights", viewModel.insights, []);
}

section("server order preserved");
{
  const response: ConciergeWorkspaceResponse = {
    version: 1,
    generatedAt: "2026-07-09T12:00:00.000Z",
    recommendations: [
      { ...RECOMMENDATION, id: "alpha:birthday", recipientId: "alpha", title: "First" },
      { ...RECOMMENDATION, id: "beta:fresh_update", recipientId: "beta", title: "Second" },
    ],
    insights: [
      { ...INSIGHT, id: "alpha:birthday:insight", recipientId: "alpha", title: "First insight" },
      { ...INSIGHT, id: "beta:fresh_update:insight", recipientId: "beta", title: "Second insight" },
    ],
  };

  const viewModel = mapConciergeWorkspaceViewModel(response);
  expect(
    "recommendation order",
    viewModel.recommendations.map((item) => item.id),
    ["alpha:birthday", "beta:fresh_update"],
  );
  expect(
    "insight order",
    viewModel.insights.map((item) => item.id),
    ["alpha:birthday:insight", "beta:fresh_update:insight"],
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
