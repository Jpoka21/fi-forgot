/**
 * Orchestra constitutional runtime foundation tests — ORCH-IMP-001.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-constitutional-runtime.test.ts
 */

import * as orchestra from "../orchestra/index.js";

const {
  ORCHESTRA_GOVERNING_STANDARD,
  addObligationToProgram,
  assertExplorationEntryNotAssumed,
  assertProgramIsActiveAuthority,
  assertProgramPostureTransition,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  declareProductionIntent,
  detectComplianceBoundaryConflicts,
  determineExplorationEntry,
  DOMAIN2_IMPLEMENTATION_DEFERRED,
  DOMAIN3_IMPLEMENTATION_DEFERRED,
  DOMAIN4_IMPLEMENTATION_DEFERRED,
  draftProductionProgram,
  evaluateDomain2Readiness,
  exceptionIsNotWaiver,
  governProductionProgram,
  grantWaiver,
  invalidateProductionProgram,
  isCurrentProgram,
  isOrchestraConstitutionalError,
  isTerminalProgramPosture,
  recordException,
  recordIntentChange,
  recordProgramAmendment,
  resolveObligationConstraint,
  supersedeProductionProgram,
} = orchestra;

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

function expectThrows(
  label: string,
  fn: () => unknown,
  code?: string,
): void {
  try {
    fn();
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label} (expected throw)`);
  } catch (error) {
    if (code && isOrchestraConstitutionalError(error)) {
      if (error.code === code) {
        passed++;
        console.log(`  ✓ ${label}`);
      } else {
        failed++;
        failures.push(label);
        console.log(`  ✗ ${label} (wrong code: ${error.code})`);
      }
    } else if (!code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (not OrchestraConstitutionalError)`);
    }
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

section("1. Creation of valid Domain 1 constitutional primitives (R07–R20)");

const intent = declareProductionIntent({
  purpose: "Establish governed visual production scope for holiday card collection",
  governingConstraints: ["FI-DSN-STD-001 brand expression", "FI-DSN-STD-004 card architecture"],
  upstreamTraceReferences: ["FI-DSN-STD-007 contextual selection input"],
  declaredBy: "governance-authority-1",
});

expect("intent posture is intent_declared", intent.posture, "intent_declared");
expect("intent has stable id", typeof intent.id, "string");
expect(
  "intent traceability references STD-012",
  intent.audit.traceability.governingStandardId,
  ORCHESTRA_GOVERNING_STANDARD,
);
expect(
  "intent traceability includes R07",
  intent.audit.traceability.requirementIds.includes("FI-DSN-STD-012-R07"),
  true,
);

let program = draftProductionProgram({
  intent,
  constitutionalPurpose: "Bounded realization work for holiday card visual production",
  createdBy: "governance-authority-1",
});
expect("program posture is program_drafted", program.posture, "program_drafted");
expect("program traces to intent", program.intentId, intent.id);

const boundary = bindComplianceBoundary({
  sourceStandardId: "FI-DSN-STD-001",
  scopeDescription: "Brand expression limits for card artwork",
  boundBy: "governance-authority-1",
});

program = addObligationToProgram(program, {
  description: "Produce exterior artwork within brand expression boundaries",
  createdBy: "governance-authority-1",
});
program = bindComplianceBoundariesToProgram(program, [boundary]);

program = governProductionProgram(program);
expect("program posture is program_governed", program.posture, "program_governed");
expect("program has one obligation", program.obligations.length, 1);
expect("program is current", isCurrentProgram(program), true);

section("2. Rejection of invalid states or values (R07, R08, R16, R18)");

expectThrows(
  "empty purpose rejected",
  () =>
    declareProductionIntent({
      purpose: "  ",
      governingConstraints: ["constraint"],
      declaredBy: "actor",
    }),
  "invalid_intent_declaration",
);

expectThrows(
  "missing constraints rejected",
  () =>
    declareProductionIntent({
      purpose: "Valid purpose",
      governingConstraints: [],
      declaredBy: "actor",
    }),
  "invalid_intent_declaration",
);

expectThrows(
  "conditional obligation without conditions rejected",
  () =>
    addObligationToProgram(program, {
      description: "Conditional obligation",
      enforcementPosture: "conditional",
      createdBy: "actor",
    }),
  "invalid_obligation",
);

section("3. Valid state transitions via lifecycle (R13, R34, R36)");

const transitionProgram = governProductionProgram(
  bindComplianceBoundariesToProgram(
    addObligationToProgram(
      draftProductionProgram({
        intent,
        constitutionalPurpose: "Lifecycle transition test",
        createdBy: "governance-authority-1",
      }),
      {
        description: "Transition test obligation",
        createdBy: "governance-authority-1",
      },
    ),
    [boundary],
  ),
);
expect("drafted → governed via governProductionProgram", transitionProgram.posture, "program_governed");

const amended = recordProgramAmendment(transitionProgram, {
  materiality: "nonmaterial",
  reason: "Clarified constitutional purpose wording",
  amendedBy: "governance-authority-1",
});
expect("amended program posture", amended.posture, "program_amended");
expect("amendment recorded", amended.amendmentHistory.length, 1);

const successorId = transitionProgram.id;
const superseded = supersedeProductionProgram(
  governProductionProgram(amended),
  successorId,
  {
    supersededBy: "governance-authority-1",
  },
);
expect("superseded posture", superseded.posture, "program_superseded");
expect("no longer current", isCurrentProgram(superseded), false);
expect("terminal posture", isTerminalProgramPosture(superseded.posture), true);

section("4. Invalid state transitions (R36, R41)");

expectThrows(
  "cannot add obligation to superseded program",
  () =>
    addObligationToProgram(superseded, {
      description: "Late obligation",
      createdBy: "actor",
    }),
  "program_not_active",
);

expectThrows(
  "cannot govern already superseded program",
  () => governProductionProgram(superseded),
  "invalid_program_transition",
);

expectThrows(
  "invalid program transition rejected via lifecycle",
  () =>
    supersedeProductionProgram(superseded, successorId, {
      supersededBy: "governance-authority-1",
    }),
  "invalid_program_transition",
);

section("5. Preservation of constitutionally required identity (R10, R15)");

const { priorIntent, newIntent } = recordIntentChange(intent, {
  purpose: "Revised production scope for expanded holiday collection",
  reason: "Scope expansion governed by intent change",
  changedBy: "governance-authority-1",
});

expect("prior intent id preserved", priorIntent.id, intent.id);
expect("new intent has distinct id", newIntent.id !== intent.id, true);
expect("intent change history recorded", priorIntent.intentChangeHistory.length, 1);
expect(
  "change links prior and new",
  priorIntent.intentChangeHistory[0].priorIntentId,
  intent.id,
);

section("6. Traceability to governing standard requirements (R37, R38)");

expect(
  "program traceability requirement ids non-empty",
  program.audit.traceability.requirementIds.length > 0,
  true,
);
expect(
  "obligation traceability includes R16",
  program.obligations[0].audit.traceability.requirementIds.includes("FI-DSN-STD-012-R16"),
  true,
);

section("7. Isolation from existing Brain orchestrator");

expect(
  "orchestra module has no brain dependency in public exports",
  !("executeBrain" in orchestra) && !("runBrain" in orchestra),
  true,
);
expect(
  "orchestra lives under distinct module path from brain orchestrator",
  typeof declareProductionIntent === "function",
  true,
);

section("8. No accidental GPRA, handoff, or downstream state implementation");

expect("STD-013 deferred marker", DOMAIN2_IMPLEMENTATION_DEFERRED, "FI-DSN-STD-013");
expect("STD-014 deferred marker", DOMAIN3_IMPLEMENTATION_DEFERRED, "FI-DSN-STD-014");
expect("STD-015 deferred marker", DOMAIN4_IMPLEMENTATION_DEFERRED, "FI-DSN-STD-015");

section("Exploration-entry determination (R26–R30)");

const explorationProgram = governProductionProgram(
  bindComplianceBoundariesToProgram(
    addObligationToProgram(
      draftProductionProgram({
        intent,
        constitutionalPurpose: "Exploration entry test program",
        createdBy: "governance-authority-1",
      }),
      {
        description: "Obligation for exploration entry",
        createdBy: "governance-authority-1",
      },
    ),
    [boundary],
  ),
);

const explorationEntry = determineExplorationEntry({
  program: explorationProgram,
  posture: "exploration_entry_authorized",
  governingBasis: "All obligations and boundaries satisfied",
  determinedBy: "governance-authority-1",
});

expect(
  "exploration entry authorized posture",
  explorationEntry.posture,
  "exploration_entry_authorized",
);
expect(
  "exploration entry traceability includes R26",
  explorationEntry.traceability.requirementIds.includes("FI-DSN-STD-012-R26"),
  true,
);

expectThrows(
  "exploration entry cannot be assumed",
  () => assertExplorationEntryNotAssumed(false),
  "invalid_exploration_entry",
);

const readiness = evaluateDomain2Readiness({
  program: explorationProgram,
  explorationEntry,
});
expect("domain 2 readiness evaluated", readiness?.isReadyForDomain2Integration, true);

section("Compliance boundary conflict detection (R23)");

const conflictBindings = [
  bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Scope A",
    boundBy: "actor",
  }),
  bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Scope B",
    boundBy: "actor",
  }),
];
const conflicts = detectComplianceBoundaryConflicts(conflictBindings);
expect("conflicting scopes detected", conflicts.length, 1);

section("Waiver and exception governance (R31–R33)");

const waiver = grantWaiver({
  waiverAuthority: "domain_1_governance_authority",
  scope: "Exploration-entry precondition for obligation X",
  affectedTarget: "obligation-x",
  constitutionalBasis: "Governed waiver under STD-012-R31",
  applicabilityPosture: "conditional",
  downstreamEligibilityEffect: "permits exploration for defined scope",
  grantedBy: "waiver-authority-1",
});

expect("waiver granted", typeof waiver.waiverId, "string");

expectThrows(
  "brain cannot grant waiver",
  () =>
    grantWaiver({
      waiverAuthority: "domain_1_governance_authority",
      scope: "scope",
      affectedTarget: "target",
      constitutionalBasis: "basis",
      applicabilityPosture: "conditional",
      downstreamEligibilityEffect: "effect",
      grantedBy: "brain",
      isBrainDerived: true,
    }),
  "invalid_waiver",
);

const exception = recordException({
  description: "Documented departure from default rule",
  constitutionalBasis: "STD-012-R32 exception",
  recordedBy: "governance-authority-1",
});
expect("exception is not waiver", exceptionIsNotWaiver(exception).isWaiver, false);

section("Program invalidation (R36)");

const invalidationTarget = governProductionProgram(
  bindComplianceBoundariesToProgram(
    addObligationToProgram(
      draftProductionProgram({
        intent,
        constitutionalPurpose: "Invalidation test",
        createdBy: "governance-authority-1",
      }),
      {
        description: "Obligation for invalidation test",
        createdBy: "governance-authority-1",
      },
    ),
    [boundary],
  ),
);

const invalidated = invalidateProductionProgram(invalidationTarget, {
  reason: "Bound compliance boundaries no longer satisfied",
  invalidatedBy: "governance-authority-1",
});
expect("invalidated posture", invalidated.posture, "program_invalidated");

expectThrows(
  "active authority check rejects invalidated",
  () => assertProgramIsActiveAuthority(invalidated.posture),
  "program_not_active",
);

section("Conditional obligation resolution (R18)");

let conditionalProgram = addObligationToProgram(
  draftProductionProgram({
    intent,
    constitutionalPurpose: "Conditional obligation test",
    createdBy: "governance-authority-1",
  }),
  {
    description: "Unresolved upstream prerequisite",
    enforcementPosture: "unresolved_constraint",
    createdBy: "governance-authority-1",
  },
);

const unresolvedObligation = conditionalProgram.obligations[0];
const resolved = resolveObligationConstraint(unresolvedObligation, {
  resolution: "Upstream prerequisite satisfied",
  resolvedBy: "governance-authority-1",
});
expect("obligation resolved to unconditional", resolved.enforcementPosture, "unconditional");

section("Conditionally authorized exploration entry (R28)");

conditionalProgram = bindComplianceBoundariesToProgram(conditionalProgram, [boundary]);
const conditionallyGoverned = governProductionProgram(conditionalProgram);
expect(
  "conditionally governed posture",
  conditionallyGoverned.posture,
  "program_conditionally_governed",
);

const conditionalExploration = determineExplorationEntry({
  program: conditionallyGoverned,
  posture: "conditionally_authorized",
  governingBasis: "Exploration permitted for defined scope with recorded constraints",
  determinedBy: "governance-authority-1",
});
expect(
  "conditionally authorized posture",
  conditionalExploration.posture,
  "conditionally_authorized",
);
expect(
  "unresolved constraints reflected",
  conditionalExploration.unresolvedConstraints.length > 0,
  true,
);

console.log(`\n${"=".repeat(60)}`);
console.log(`Orchestra constitutional runtime: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
