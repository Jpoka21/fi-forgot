/**
 * Unit tests for Concierge workspace Brain wiring (Step 3c–3e).
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/concierge-workspace-wiring.test.ts
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { API_ENDPOINTS } from "../app/api/endpoints.js";
import { buildConciergeWorkspaceForDisplay } from "../app/concierge-brain/buildConciergeWorkspaceForDisplay.js";
import { fetchConciergeWorkspace } from "../app/concierge-brain/fetchConciergeWorkspace.js";
import type { ConciergeWorkspaceResponse } from "../app/concierge-brain/conciergeWorkspaceTypes.js";
import type { ApiResult } from "../app/api/shared/types.js";
import type { ConciergeRelationshipInsight } from "../app/ai-concierge/aiConciergeDomain.js";
import type { FiAiRecommendation } from "../app/ai/aiDomain.js";

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

const WORKSPACE_RESPONSE: ConciergeWorkspaceResponse = {
  version: 1,
  generatedAt: "2026-07-09T12:00:00.000Z",
  recommendations: [
    {
      id: "alpha:birthday",
      recipientId: "alpha",
      recipientName: "Alice",
      title: "Birthday preparation",
      body: "Their birthday is inside the preparation window.",
      href: "/relationship/alpha",
      actionLabel: "Prepare for birthday",
      priority: "high",
      kind: "relationship",
    },
  ],
  insights: [
    {
      id: "alpha:birthday:insight",
      recipientId: "alpha",
      recipientName: "Alice",
      title: "Birthday preparation",
      body: "Their birthday is inside the preparation window.",
      href: "/relationship/alpha",
    },
  ],
};

const LEGACY_RECOMMENDATIONS: FiAiRecommendation[] = [
  {
    id: "legacy-1",
    title: "Legacy recommendation",
    description: "From concierge suggestions engine.",
    href: "/relationship/legacy",
    actionLabel: "Open profile",
    confidence: "medium",
    sourceType: "improve_profile",
  },
];

const LEGACY_INSIGHTS: ConciergeRelationshipInsight[] = [
  {
    id: "legacy-insight-1",
    title: "Legacy insight",
    description: "From relationship health.",
    href: "/relationship/legacy",
    recipientName: "Legacy Person",
  },
];

function okResult(data: ConciergeWorkspaceResponse): ApiResult<ConciergeWorkspaceResponse> {
  return {
    ok: true,
    status: 200,
    data,
    error: null,
    response: new Response(null, { status: 200 }),
  };
}

function failedResult(): ApiResult<ConciergeWorkspaceResponse> {
  return {
    ok: false,
    status: 500,
    data: null,
    error: { message: "Server error", status: 500, statusText: "Internal Server Error", data: null, response: new Response(null, { status: 500 }), name: "AppApiError" },
    response: new Response(null, { status: 500 }),
  };
}

section("API client endpoint");
{
  expect("fetchConciergeWorkspace uses /api/v2/concierge", API_ENDPOINTS.concierge.workspace, "/api/v2/concierge");
  expectTrue("fetchConciergeWorkspace is defined", typeof fetchConciergeWorkspace === "function");
}

section("flag off uses legacy workspace path");
{
  let legacyCalled = false;
  let fetchCalled = false;

  const display = await buildConciergeWorkspaceForDisplay(
    { userEmail: "user@example.com" },
    {
      brainEnabled: false,
      fetchConciergeWorkspace: async () => {
        fetchCalled = true;
        return okResult(WORKSPACE_RESPONSE);
      },
      loadLegacyWorkspace: () => {
        legacyCalled = true;
        return {
          recommendations: LEGACY_RECOMMENDATIONS,
          insights: LEGACY_INSIGHTS,
        };
      },
    },
  );

  expectTrue("legacy loader called", legacyCalled);
  expectTrue("fetch not called", !fetchCalled);
  expect("returns legacy recommendations", display.recommendations, LEGACY_RECOMMENDATIONS);
  expect("returns legacy insights", display.insights, LEGACY_INSIGHTS);
}

section("flag on uses Brain API");
{
  let fetchCalled = false;
  const display = await buildConciergeWorkspaceForDisplay(
    {},
    {
      brainEnabled: true,
      fetchConciergeWorkspace: async () => {
        fetchCalled = true;
        return okResult(WORKSPACE_RESPONSE);
      },
      loadLegacyWorkspace: () => {
        throw new Error("legacy workspace should not be used");
      },
    },
  );

  expectTrue("fetch called", fetchCalled);
  expect("one recommendation", display.recommendations.length, 1);
  expect("actionLabel from server", display.recommendations[0]?.actionLabel, "Prepare for birthday");
  expect("one insight", display.insights.length, 1);
  expect("insight description from body", display.insights[0]?.description, WORKSPACE_RESPONSE.insights[0]?.body);
}

section("flag on does not fallback to legacy on fetch failure");
{
  let legacyCalled = false;
  const display = await buildConciergeWorkspaceForDisplay(
    {},
    {
      brainEnabled: true,
      fetchConciergeWorkspace: async () => failedResult(),
      loadLegacyWorkspace: () => {
        legacyCalled = true;
        return {
          recommendations: LEGACY_RECOMMENDATIONS,
          insights: LEGACY_INSIGHTS,
        };
      },
    },
  );

  expectTrue("legacy loader not called", !legacyCalled);
  expect("empty recommendations on failure", display.recommendations, []);
  expect("empty insights on failure", display.insights, []);
}

section("empty recommendations and insights");
{
  const display = await buildConciergeWorkspaceForDisplay(
    {},
    {
      brainEnabled: true,
      fetchConciergeWorkspace: async () =>
        okResult({
          version: 1,
          generatedAt: "2026-07-09T12:00:00.000Z",
          recommendations: [],
          insights: [],
        }),
    },
  );

  expect("empty recommendations", display.recommendations, []);
  expect("empty insights", display.insights, []);
}

section("no Brain internals on adapted display model");
{
  const display = await buildConciergeWorkspaceForDisplay(
    {},
    {
      brainEnabled: true,
      fetchConciergeWorkspace: async () => okResult(WORKSPACE_RESPONSE),
    },
  );

  const recommendation = display.recommendations[0]!;
  expectTrue("no sourceRuleId", !("sourceRuleId" in recommendation));
  expectTrue("no outcome", !("outcome" in recommendation));
  expectTrue("no ruleEvaluation", !("ruleEvaluation" in recommendation));
}

section("workspace hook delegates to buildConciergeWorkspaceForDisplay");
{
  const hookPath = join(
    dirname(fileURLToPath(import.meta.url)),
    "../app/ai-concierge/hooks/useAiConciergeWorkspace.ts",
  );
  const source = readFileSync(hookPath, "utf8");

  expectTrue("uses buildConciergeWorkspaceForDisplay", source.includes("buildConciergeWorkspaceForDisplay"));
  expectTrue("passes userEmail for legacy fallback", source.includes("userEmail: user?.email"));
  expectTrue("does not import loadAiRecommendations", !source.includes("loadAiRecommendations"));
  expectTrue("does not import buildRelationshipInsights", !source.includes("buildRelationshipInsights"));
  expectTrue("does not import relationship-health", !source.includes("relationship-health"));
  expectTrue("does not import conciergeSuggestionsEngine", !source.includes("conciergeSuggestionsEngine"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
