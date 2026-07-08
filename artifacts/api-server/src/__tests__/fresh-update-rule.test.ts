/**
 * Unit tests for brain/decision/rules/freshUpdateRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/fresh-update-rule.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { freshUpdateRule } from "../brain/decision/rules/freshUpdateRule.js";
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

const STALE_CANDIDATE = {
  ruleId: "fresh_update",
  priority: 40,
  confidence: 52,
  decision: { outcome: "ask_question" },
  reasons: ["information_stale", "fresh_update_due"],
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
};

section("FreshUpdateRule matches only stale freshness");
{
  const stale = buildDecisionContext(normalized({ freshness: "stale" }));
  const unknown = buildDecisionContext(normalized({ freshness: "unknown" }));
  const aging = buildDecisionContext(normalized({ freshness: "aging" }));
  const current = buildDecisionContext(normalized({ freshness: "current" }));

  expect("stale matches", freshUpdateRule.evaluate(stale), STALE_CANDIDATE);
  expect("unknown does not match", freshUpdateRule.evaluate(unknown), null);
  expect("aging does not match", freshUpdateRule.evaluate(aging), null);
  expect("current does not match", freshUpdateRule.evaluate(current), null);
}

section("FreshUpdateRule ignores other DecisionContext dimensions");
{
  const thinStale = buildDecisionContext(
    normalized({ identity: "thin", freshness: "stale", engagement: "high" }),
  );
  const establishedStale = buildDecisionContext(
    normalized({ identity: "established", freshness: "stale", writing: "high" }),
  );

  expect("thin stale", freshUpdateRule.evaluate(thinStale), STALE_CANDIDATE);
  expect("established stale", freshUpdateRule.evaluate(establishedStale), STALE_CANDIDATE);
  expect(
    "same candidate regardless of identity",
    freshUpdateRule.evaluate(thinStale),
    freshUpdateRule.evaluate(establishedStale),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
