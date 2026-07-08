/**
 * Unit tests for brain/decision/relationshipTypeMatchers.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/relationship-type-matchers.test.ts
 */

import { isRomanticRelationshipType } from "../brain/decision/relationshipTypeMatchers.js";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expect(label: string, actual: unknown, expected: unknown): void {
  const ok = actual === expected;
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

section("romantic relationship types");
{
  expect("Wife", isRomanticRelationshipType("Wife"), true);
  expect("Spouse / Partner", isRomanticRelationshipType("Spouse / Partner"), true);
  expect("Girlfriend", isRomanticRelationshipType("Girlfriend"), true);
  expect("Husband", isRomanticRelationshipType("Husband"), true);
  expect("Boyfriend", isRomanticRelationshipType("Boyfriend"), true);
}

section("non romantic relationship types");
{
  expect("Friend", isRomanticRelationshipType("Friend"), false);
  expect("Parent", isRomanticRelationshipType("Parent"), false);
  expect("Sibling", isRomanticRelationshipType("Sibling"), false);
}

section("missing relationship classification");
{
  expect("null", isRomanticRelationshipType(null), false);
  expect("empty string", isRomanticRelationshipType(""), false);
  expect("whitespace", isRomanticRelationshipType("   "), false);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
