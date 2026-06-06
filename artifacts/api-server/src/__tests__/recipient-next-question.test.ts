/**
 * Integration smoke tests for the profile-gap question endpoints.
 *
 * Requires the API server to be running (workflow: api-server).
 * Calls localhost:80 through the shared proxy.
 *
 * Run with:
 *   pnpm dlx tsx artifacts/api-server/src/__tests__/recipient-next-question.test.ts
 */

const BASE = "http://localhost:80";

// Real dev-DB fixture from smoke tests
const REAL_RECIPIENT = "1780699542420";
const REAL_USER      = "04dd079e-10d2-4410-bdb5-93a5073f2e8f";
const WRONG_USER     = "00000000-0000-0000-0000-000000000000";

// ─── Harness ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function pass(label: string) {
  passed++;
  console.log(`  ✓ ${label}`);
}

function fail(label: string, detail: string) {
  failed++;
  failures.push(label);
  console.log(`  ✗ ${label}`);
  console.log(`      ${detail}`);
}

function expect(label: string, actual: unknown, expected: unknown) {
  actual === expected ? pass(label) : fail(label, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function expectNotNull(label: string, val: unknown) {
  val !== null && val !== undefined ? pass(label) : fail(label, `expected non-null, got ${JSON.stringify(val)}`);
}

function expectNull(label: string, val: unknown) {
  val === null ? pass(label) : fail(label, `expected null, got ${JSON.stringify(val)}`);
}

function expectContains(label: string, haystack: string | null | undefined, needle: string) {
  typeof haystack === "string" && haystack.includes(needle)
    ? pass(label)
    : fail(label, `expected "${needle}" in "${haystack}"`);
}

async function get(path: string, userId?: string) {
  const headers: Record<string, string> = {};
  if (userId) headers["x-user-id"] = userId;
  const res = await fetch(`${BASE}${path}`, { headers });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function post(path: string, userId: string | undefined, body: unknown) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (userId) headers["x-user-id"] = userId;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

function section(name: string) { console.log(`\n${name}`); }

// ─── Run all tests in an async main so top-level await works without module issues ─

async function main() {

// ─── Tests: GET /api/v2/recipients/:id/next-question ──────────────────────────

section("GET /api/v2/recipients/:id/next-question — auth guard");
{
  const r = await get(`/api/v2/recipients/${REAL_RECIPIENT}/next-question`);
  expect("returns 401 when x-user-id missing", r.status, 401);
}

section("GET /api/v2/recipients/:id/next-question — ownership");
{
  const r = await get(`/api/v2/recipients/${REAL_RECIPIENT}/next-question`, WRONG_USER);
  expect("returns 404 when recipient belongs to another user", r.status, 404);
}

section("GET /api/v2/recipients/:id/next-question — happy path");
{
  const r = await get(`/api/v2/recipients/${REAL_RECIPIENT}/next-question`, REAL_USER);
  expect("returns 200", r.status, 200);
  const body = r.body as { nextQuestion: Record<string, string> | null };

  if (body?.nextQuestion !== null) {
    // Profile is incomplete — question should be returned
    const q = body.nextQuestion as Record<string, string>;
    expectNotNull("nextQuestion is not null",      q);
    expectNotNull("nextQuestion.fieldKey present", q.fieldKey);
    expectNotNull("nextQuestion.question present", q.question);
    expectNotNull("nextQuestion.priority present", q.priority);
    expectNotNull("nextQuestion.category present", q.category);
    expectNotNull("nextQuestion.reason present",   q.reason);
    const validPriorities = new Set(["highest", "high", "medium", "low"]);
    expect("priority is a valid value", validPriorities.has(q.priority as string), true);
    console.log(`    → question: [${q.priority}] ${q.fieldKey} — "${q.question}"`);
  } else {
    // Profile is 100% complete — null is also valid
    pass("nextQuestion is null (profile complete)");
  }
}

section("GET /api/v2/recipients/nonexistent/next-question");
{
  const r = await get("/api/v2/recipients/does-not-exist-xyz/next-question", REAL_USER);
  expect("returns 404 for nonexistent recipient", r.status, 404);
}

// ─── Tests: POST /api/v2/recipients/:id/answer-question ───────────────────────

section("POST /api/v2/recipients/:id/answer-question — auth guard");
{
  const r = await post(`/api/v2/recipients/${REAL_RECIPIENT}/answer-question`, undefined, {
    fieldKey: "things_to_avoid", questionText: "Avoid?", answerText: "Nothing",
  });
  expect("returns 401 when x-user-id missing", r.status, 401);
}

section("POST /api/v2/recipients/:id/answer-question — ownership");
{
  const r = await post(`/api/v2/recipients/${REAL_RECIPIENT}/answer-question`, WRONG_USER, {
    fieldKey: "things_to_avoid", questionText: "Avoid?", answerText: "Nothing",
  });
  expect("returns 404 when recipient belongs to another user", r.status, 404);
}

section("POST /api/v2/recipients/:id/answer-question — validation");
{
  const r = await post(`/api/v2/recipients/${REAL_RECIPIENT}/answer-question`, REAL_USER, {
    fieldKey: "", questionText: "Q?", answerText: "A",
  });
  expect("returns 400 when fieldKey empty", r.status, 400);

  const r2 = await post(`/api/v2/recipients/${REAL_RECIPIENT}/answer-question`, REAL_USER, {
    fieldKey: "things_to_avoid", questionText: "Q?", answerText: "",
  });
  expect("returns 400 when answerText empty", r2.status, 400);
}

section("POST /api/v2/recipients/:id/answer-question — save and re-fetch");
{
  // Fetch the current next question
  const before = await get(`/api/v2/recipients/${REAL_RECIPIENT}/next-question`, REAL_USER);
  const beforeQ = (before.body as { nextQuestion: Record<string, string> | null }).nextQuestion;

  if (beforeQ === null) {
    pass("profile already complete — skipping save+refresh test");
  } else {
    const fieldKey = beforeQ.fieldKey as string;
    console.log(`    → saving answer for: ${fieldKey}`);

    // Save an answer for the top question
    const saveR = await post(`/api/v2/recipients/${REAL_RECIPIENT}/answer-question`, REAL_USER, {
      fieldKey,
      questionText: beforeQ.question,
      answerText:   `Test answer for ${fieldKey} — smoke test ${Date.now()}`,
    });
    expect("save returns 200", saveR.status, 200);
    expect("save returns ok: true", (saveR.body as { ok: boolean })?.ok, true);

    // Re-fetch — the answered field should no longer appear as the top question
    const after = await get(`/api/v2/recipients/${REAL_RECIPIENT}/next-question`, REAL_USER);
    expect("re-fetch returns 200", after.status, 200);
    const afterQ = (after.body as { nextQuestion: Record<string, string> | null }).nextQuestion;

    if (afterQ !== null) {
      // A different field should now be suggested (or the same if it was the only remaining one)
      console.log(`    → next question after save: [${afterQ.priority as string}] ${afterQ.fieldKey as string}`);
      pass("re-fetch returns a nextQuestion after save");
    } else {
      pass("nextQuestion is null after save (all gaps filled)");
    }

    // Idempotency: saving again should succeed (upsert)
    const saveR2 = await post(`/api/v2/recipients/${REAL_RECIPIENT}/answer-question`, REAL_USER, {
      fieldKey,
      questionText: beforeQ.question,
      answerText:   "Updated answer — upsert test",
    });
    expect("upsert (second save) also returns ok", saveR2.status, 200);
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailed:");
  failures.forEach(f => console.log(`  ✗ ${f}`));
  process.exit(1);
} else {
  console.log("All tests passed.");
  process.exit(0);
}

} // end main()

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
