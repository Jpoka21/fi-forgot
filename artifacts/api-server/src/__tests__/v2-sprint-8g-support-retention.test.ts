/**
 * Sprint 8G — John live QA: supporting detail retention + rewrite differentiation.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/v2-sprint-8g-support-retention.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildMemoryDensityRequirement,
  buildPrimaryContentPriorityBlock,
  buildPrimaryReasonRule,
  buildPrimarySubjectOutputContract,
  draftRecognizesSuppliedSupport,
} from "../routes/v2GenerateCardContextLines.js";
import {
  buildRefineSystemPrompt,
  buildRefineUserPrompt,
  buildRefineVisibleRetentionContract,
} from "../routes/v2RefineCardGrounding.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const FE_INSTR_SOURCE = readFileSync(
  join(TEST_DIR, "../../../fi-forgot/src/app/card-creation/buildTryRefineGrounding.ts"),
  "utf8",
);

let passed = 0;
let failed = 0;

function expectTrue(label: string, value: boolean): void {
  if (value) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

const PRIMARY = "Another year of being great friends";
const SUPPORT =
  "When we were kids you had a girl over and lasted five seconds";
const SIGNOFF = "Poka";

const BATTERY_ORIGINAL = `John —

Another year of being great friends deserves a real note — not just a "happy birthday" text that dies when the phone battery does.

Happy Birthday.

Poka`;

const JOHN_GROUNDING = {
  firstName: "John",
  relationship: "Friend",
  occasion: "Birthday",
  primaryOccasionContext: PRIMARY,
  details: SUPPORT,
  tone: "Funny",
  emotionalOpenness: "Warm",
  signOff: SIGNOFF,
};

section("A. Generation prompt — support supplied");
{
  const priority = buildPrimaryContentPriorityBlock(true);
  const reason = buildPrimaryReasonRule(true);
  const density = buildMemoryDensityRequirement(true, true);
  const contract = buildPrimarySubjectOutputContract(PRIMARY, SUPPORT);
  const assembled = [priority, reason, density, contract].join("\n");

  expectTrue("normally retain brief support in priority", priority.includes("normally retain with one brief recognizable callback"));
  expectTrue("primary remains dominant", priority.includes("Primary reason — mandatory center"));
  expectTrue(
    "structure keeps primary first",
    priority.includes("Primary subject → normally one brief supplied-support callback"),
  );
  expectTrue("reason requires recognizable callback", reason.includes("brief recognizable callback"));
  expectTrue(
    "forbids generic joke replacement",
    reason.includes("unrelated generic joke") && contract.includes("unrelated generic joke"),
  );
  expectTrue(
    "forbids inventing additional history",
    contract.includes("Inventing additional personal memories") ||
      assembled.includes("Do not invent additional"),
  );
  expectTrue("checklist labels supplied support", contract.includes("SUPPLIED SUPPORT (normally retain"));
  expectTrue(
    "validation prefers recognizable support",
    contract.includes("Prefer a recognizable reference to SUPPLIED SUPPORT"),
  );
  expectTrue(
    "omission allowed for listed reasons",
    contract.includes("inappropriate for the occasion") &&
      assembled.includes("materially reduce the quality"),
  );
  expectTrue("support fact verbatim in contract", contract.includes(SUPPORT));
  expectTrue("primary fact verbatim in contract", contract.includes(PRIMARY));
}

section("A. Generation prompt — support blank");
{
  const priority = buildPrimaryContentPriorityBlock(false);
  const reason = buildPrimaryReasonRule(false);
  const density = buildMemoryDensityRequirement(true, false);
  const contract = buildPrimarySubjectOutputContract(PRIMARY, "   ");

  expectTrue("no support required", priority.includes("none supplied; do not invent any"));
  expectTrue("reason invents nothing", reason.includes("do not invent any"));
  expectTrue("density invents nothing", density.includes("do not invent a supporting memory"));
  expectTrue(
    "contract optional none + invent nothing",
    contract.includes("OPTIONAL SUPPORT") && contract.includes("do not invent a supporting memory"),
  );
  expectTrue("no REQUIRED BRIEF SUPPORT when blank", !contract.includes("REQUIRED BRIEF SUPPORT"));
  expectTrue("no unconditional SUPPLIED SUPPORT label when blank", !contract.includes("SUPPLIED SUPPORT (normally retain"));
}

section("B. Refine prompt — recover omitted support + rewrite freshness");
{
  const sys = buildRefineSystemPrompt();
  const retention = buildRefineVisibleRetentionContract(JOHN_GROUNDING);
  const user = buildRefineUserPrompt({
    grounding: JOHN_GROUNDING,
    cardText: BATTERY_ORIGINAL,
    instruction:
      "Completely rewrite with a genuinely different opening, a different sentence progression or structural beat order, and substantially fresh wording and rhythm, while retaining every supplied personal fact — recipient, occasion, primary reason, supporting personal details, and sign-off. Do not reuse distinctive metaphors, punchlines, invented jokes, or framing from the original card unless they came from authoritative user-supplied facts. Do not invent new personal facts, memories, places, or events. Do not produce a sentence-by-sentence paraphrase.",
  });

  expectTrue("visible retention in system", /VISIBLE FACT RETENTION/i.test(sys));
  expectTrue("weave missing support in system", /absent from the ORIGINAL CARD/i.test(sys));
  expectTrue("rewrite freshness in system", /genuinely different opening/i.test(sys));
  expectTrue(
    "no reuse non-authoritative metaphors in system",
    /Do not reuse distinctive metaphors/i.test(sys),
  );

  expectTrue("retention contract present", retention.includes("VISIBLE RETENTION CONTRACT"));
  expectTrue("weave support into revision", retention.includes("should normally contain one brief recognizable callback"));
  expectTrue("primary preserved in retention", retention.includes(PRIMARY));
  expectTrue("support fact in retention", retention.includes(SUPPORT));
  expectTrue(
    "omission reasons listed",
    retention.includes("inappropriate for the occasion") &&
      retention.includes("materially reduce the quality"),
  );

  expectTrue("user has AUTHORITATIVE support", user.includes(SUPPORT));
  expectTrue("user has primary", user.includes(PRIMARY));
  expectTrue("user has battery original", /phone battery/i.test(user));
  expectTrue("user has Poka", user.includes("Poka"));
  expectTrue(
    "user requires weave supporting detail",
    /should normally contain one brief recognizable callback/i.test(user),
  );
  expectTrue(
    "instruction forbids battery-style metaphor reuse",
    /Do not reuse distinctive metaphors/i.test(user),
  );
  expectTrue(
    "instruction requires different opening/structure",
    /genuinely different opening/i.test(user) && /structural beat order/i.test(user),
  );
  expectTrue("no invented new memory", /Do not invent/i.test(user));
  expectTrue("sign-off once language in system", /exact sign-off once/i.test(sys));
}

section("C. Frontend action instructions");
{
  expectTrue(
    "rewrite fresh opening/structure/wording",
    /genuinely different opening/i.test(FE_INSTR_SOURCE) &&
      /structural beat order/i.test(FE_INSTR_SOURCE) &&
      /substantially fresh wording/i.test(FE_INSTR_SOURCE),
  );
  expectTrue(
    "rewrite forbids non-authoritative metaphor reuse",
    /Do not reuse distinctive metaphors/i.test(FE_INSTR_SOURCE) &&
      /unless they came from authoritative/i.test(FE_INSTR_SOURCE),
  );
  expectTrue(
    "newVersion different take same facts",
    /clearly different take using the same authoritative facts/i.test(FE_INSTR_SOURCE),
  );
  expectTrue(
    "morePersonal uses existing details",
    /using the supplied primary reason and supporting details more effectively/i.test(FE_INSTR_SOURCE) &&
      /do not invent/i.test(FE_INSTR_SOURCE),
  );
  expectTrue(
    "FE rewrite normally retains support",
    /normally include one brief recognizable callback/i.test(FE_INSTR_SOURCE),
  );
}

section("D. Output contract fixture — recognizable support");
{
  const pass = `John — another year of being great friends is worth celebrating. Still laughing about when we were kids and that girl-over five-seconds moment. Happy Birthday.\n\nPoka`;
  const fail = `John — another year of being great friends deserves a real note — not just a text that dies when the phone battery does. Happy Birthday.\n\nPoka`;

  expectTrue("passing draft recognizes support", draftRecognizesSuppliedSupport(pass, SUPPORT));
  expectTrue("failing draft omits support", !draftRecognizesSuppliedSupport(fail, SUPPORT));
  expectTrue(
    "passing keeps friendship/birthday primary signals",
    /great friends/i.test(pass) && /birthday/i.test(pass),
  );
  expectTrue("failing is battery-only humor", /battery/i.test(fail) && !/five seconds/i.test(fail));
}

section("Avoid conflict priority documented");
{
  const priority = buildPrimaryContentPriorityBlock(true);
  const contract = buildPrimarySubjectOutputContract(PRIMARY, SUPPORT);
  expectTrue("generate priority notes avoid wins", priority.includes("AVOID CONFLICT"));
  expectTrue("generate contract notes avoid wins", contract.includes("AVOID CONFLICT"));
  expectTrue(
    "refine system notes avoid wins",
    /AVOID CONFLICT/i.test(buildRefineSystemPrompt()),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
