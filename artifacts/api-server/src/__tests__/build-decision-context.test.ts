/**
 * Unit tests for brain/decision/buildDecisionContext.
 *
 * Pure module — no database, no orchestrator. Run with:
 *   npx tsx artifacts/api-server/src/__tests__/build-decision-context.test.ts
 */

import { buildDecisionContext } from "../brain/decision/index.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";

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

section("conservative defaults from empty normalized state");
{
  const ctx = buildDecisionContext(normalized());
  expect("identity empty", ctx.identity, "empty");
  expect("freshness unknown", ctx.freshness, "unknown");
  expect("history none", ctx.history, "none");
  expect("writing none", ctx.writing, "none");
  expect("engagement none", ctx.engagement, "none");
  expect("momentum new", ctx.momentum, "new");
  expect("relationshipMaturity mirrors identity", ctx.relationshipMaturity, "empty");
  expect("informationFreshness mirrors freshness", ctx.informationFreshness, "unknown");
  expect("writingReadiness mirrors writing", ctx.writingReadiness, "none");
  expect("engagementLevel mirrors engagement", ctx.engagementLevel, "none");
  expect("relationshipMomentum mirrors momentum", ctx.relationshipMomentum, "new");
  expect("timelineHistory mirrors history", ctx.timelineHistory, "none");
  expect("signalCount 0", ctx.derivedFrom.signalCount, 0);
  expect("sourcesPresent []", ctx.derivedFrom.sourcesPresent, []);
}

section("full rich state maps decision vocabulary 1:1");
{
  const input = normalized({
    identity: "established",
    freshness: "current",
    history: "rich",
    writing: "high",
    engagement: "moderate",
    momentum: "active",
    derivedFrom: {
      signalCount: 70,
      sourcesPresent: ["profile_completeness", "relationship_timeline"],
    },
  });
  const ctx = buildDecisionContext(input);

  expect("identity established", ctx.identity, "established");
  expect("relationshipMaturity established", ctx.relationshipMaturity, "established");
  expect("informationFreshness current", ctx.informationFreshness, "current");
  expect("writingReadiness high", ctx.writingReadiness, "high");
  expect("engagementLevel moderate", ctx.engagementLevel, "moderate");
  expect("relationshipMomentum active", ctx.relationshipMomentum, "active");
  expect("timelineHistory rich", ctx.timelineHistory, "rich");
  expect("signalCount 70", ctx.derivedFrom.signalCount, 70);
  expect(
    "sourcesPresent",
    ctx.derivedFrom.sourcesPresent,
    ["profile_completeness", "relationship_timeline"],
  );
  expect(
    "normalizedSnapshot",
    ctx.derivedFrom.normalizedSnapshot,
    {
      identity: "established",
      freshness: "current",
      history: "rich",
      writing: "high",
      engagement: "moderate",
      momentum: "active",
    },
  );
}

section("sourcesPresent is a copy (mutation safe)");
{
  const sources = ["engagement"];
  const input = normalized({
    derivedFrom: { signalCount: 1, sourcesPresent: sources },
  });
  const ctx = buildDecisionContext(input);
  sources.push("mutated");
  expect("builder does not retain caller array", ctx.derivedFrom.sourcesPresent, [
    "engagement",
  ]);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
