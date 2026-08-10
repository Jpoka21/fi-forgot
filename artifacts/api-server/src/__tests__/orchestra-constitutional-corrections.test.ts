/**
 * ORCH-IMP-001.2 adversarial regression tests — bounded constitutional corrections.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-constitutional-corrections.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createProductionProgramId,
  declareProductionIntent,
  determineExplorationEntry,
  draftProductionProgram,
  governProductionProgram,
  grantWaiver,
  invalidateProductionProgram,
  isOrchestraConstitutionalError,
  recordException,
  recordProgramAmendment,
  supersedeProductionProgram,
} from "../orchestra/index.js";

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

function expectThrows(label: string, fn: () => unknown, code?: string): void {
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

const intent = declareProductionIntent({
  purpose: "Correction regression test intent",
  governingConstraints: ["FI-DSN-STD-001"],
  declaredBy: "governance-authority-1",
});

const boundary = bindComplianceBoundary({
  sourceStandardId: "FI-DSN-STD-001",
  scopeDescription: "Brand expression limits",
  boundBy: "governance-authority-1",
});

function buildGovernedProgram() {
  return governProductionProgram(
    bindComplianceBoundariesToProgram(
      addObligationToProgram(
        draftProductionProgram({
          intent,
          constitutionalPurpose: "Governed program for correction tests",
          createdBy: "creator-original",
          createdAt: "2026-08-10T10:00:00.000Z",
        }),
        {
          description: "Unconditional obligation",
          createdBy: "governance-authority-1",
        },
      ),
      [boundary],
    ),
  );
}

section("BC-ORCH-001 — transition enforcement via lifecycle");

const drafted = draftProductionProgram({
  intent,
  constitutionalPurpose: "Draft-only program",
  createdBy: "governance-authority-1",
});

expectThrows(
  "lifecycle rejects program_drafted → program_superseded",
  () =>
    supersedeProductionProgram(drafted, createProductionProgramId(), {
      supersededBy: "governance-authority-1",
    }),
  "invalid_program_transition",
);

expectThrows(
  "lifecycle rejects program_drafted → program_invalidated",
  () =>
    invalidateProductionProgram(drafted, {
      reason: "Attempted draft invalidation",
      invalidatedBy: "governance-authority-1",
    }),
  "invalid_program_transition",
);

const governed = buildGovernedProgram();
expect("governed via lifecycle", governed.posture, "program_governed");

const amended = recordProgramAmendment(governed, {
  materiality: "nonmaterial",
  reason: "Clarification",
  amendedBy: "governance-authority-1",
});
const reGoverned = governProductionProgram(amended);
expect("amended → governed via lifecycle", reGoverned.posture, "program_governed");

const superseded = supersedeProductionProgram(reGoverned, createProductionProgramId(), {
  supersededBy: "successor-authority",
  supersededAt: "2026-08-10T12:00:00.000Z",
});
expect("governed → superseded via lifecycle", superseded.posture, "program_superseded");

section("BC-ORCH-002 — exploration entry R27/R28");

const conditionalOnly = governProductionProgram(
  bindComplianceBoundariesToProgram(
    addObligationToProgram(
      draftProductionProgram({
        intent,
        constitutionalPurpose: "Conditional obligation program",
        createdBy: "governance-authority-1",
      }),
      {
        description: "Conditional exterior artwork obligation",
        enforcementPosture: "conditional",
        conditions: ["Awaiting upstream brand approval"],
        createdBy: "governance-authority-1",
      },
    ),
    [boundary],
  ),
);
expect(
  "conditional obligation yields conditionally governed program",
  conditionalOnly.posture,
  "program_conditionally_governed",
);

expectThrows(
  "conditional obligations block exploration_entry_authorized",
  () =>
    determineExplorationEntry({
      program: conditionalOnly,
      posture: "exploration_entry_authorized",
      governingBasis: "Should not authorize",
      determinedBy: "governance-authority-1",
    }),
  "invalid_exploration_entry",
);

const conditionalExploration = determineExplorationEntry({
  program: conditionalOnly,
  posture: "conditionally_authorized",
  governingBasis: "Exploration for defined scope under conditional prerequisites",
  determinedBy: "governance-authority-1",
});
expect(
  "conditional-only program yields conditionally_authorized",
  conditionalExploration.posture,
  "conditionally_authorized",
);
expect(
  "conditional obligation ids recorded",
  conditionalExploration.conditionalObligationIds.length,
  1,
);

const mixedProgram = governProductionProgram(
  bindComplianceBoundariesToProgram(
    addObligationToProgram(
      addObligationToProgram(
        draftProductionProgram({
          intent,
          constitutionalPurpose: "Mixed obligation program",
          createdBy: "governance-authority-1",
        }),
        {
          description: "Satisfied obligation",
          createdBy: "governance-authority-1",
        },
      ),
      {
        description: "Still conditional obligation",
        enforcementPosture: "conditional",
        conditions: ["Pending review"],
        createdBy: "governance-authority-1",
      },
    ),
    [boundary],
  ),
);

expectThrows(
  "one conditional obligation blocks full authorization",
  () =>
    determineExplorationEntry({
      program: mixedProgram,
      posture: "exploration_entry_authorized",
      governingBasis: "Should fail with one conditional obligation",
      determinedBy: "governance-authority-1",
    }),
  "invalid_exploration_entry",
);

const unresolvedOnly = governProductionProgram(
  bindComplianceBoundariesToProgram(
    addObligationToProgram(
      draftProductionProgram({
        intent,
        constitutionalPurpose: "Unresolved constraint program",
        createdBy: "governance-authority-1",
      }),
      {
        description: "Unresolved upstream prerequisite",
        enforcementPosture: "unresolved_constraint",
        createdBy: "governance-authority-1",
      },
    ),
    [boundary],
  ),
);

expectThrows(
  "unresolved constraints block exploration_entry_authorized",
  () =>
    determineExplorationEntry({
      program: unresolvedOnly,
      posture: "exploration_entry_authorized",
      governingBasis: "Should fail with unresolved constraint",
      determinedBy: "governance-authority-1",
    }),
  "invalid_exploration_entry",
);

const fullyGoverned = buildGovernedProgram();
const fullAuth = determineExplorationEntry({
  program: fullyGoverned,
  posture: "exploration_entry_authorized",
  governingBasis: "All prerequisites satisfied",
  determinedBy: "governance-authority-1",
});
expect("fully governed program authorizes exploration", fullAuth.posture, "exploration_entry_authorized");

section("BC-ORCH-003 — compliance conflict enforcement");

const conflictA = bindComplianceBoundary({
  sourceStandardId: "FI-DSN-STD-001",
  scopeDescription: "Scope A",
  boundBy: "governance-authority-1",
});
const conflictB = bindComplianceBoundary({
  sourceStandardId: "FI-DSN-STD-001",
  scopeDescription: "Scope B",
  boundBy: "governance-authority-1",
});

const boundWithConflict = bindComplianceBoundariesToProgram(
  addObligationToProgram(
    draftProductionProgram({
      intent,
      constitutionalPurpose: "Conflict binding program",
      createdBy: "governance-authority-1",
    }),
    {
      description: "Obligation under conflict",
      createdBy: "governance-authority-1",
    },
  ),
  [conflictA, conflictB],
);
expect(
  "binding surfaces compliance conflicts as unresolved constraints",
  boundWithConflict.unresolvedConstraints.length,
  1,
);
expect(
  "conflict binding yields conditionally governed posture on govern",
  governProductionProgram(boundWithConflict).posture,
  "program_conditionally_governed",
);

section("BC-ORCH-004 — audit provenance preservation");

const provenanceProgram = buildGovernedProgram();
const originalCreatedAt = provenanceProgram.audit.createdAt;
const originalCreatedBy = provenanceProgram.audit.createdBy;

const provenanceSuperseded = supersedeProductionProgram(
  recordProgramAmendment(provenanceProgram, {
    materiality: "nonmaterial",
    reason: "Successor program",
    amendedBy: "successor-authority",
  }),
  createProductionProgramId(),
  {
    supersededBy: "successor-authority",
    supersededAt: "2026-08-10T14:00:00.000Z",
  },
);

expect("creation audit.createdAt preserved on supersede", provenanceSuperseded.audit.createdAt, originalCreatedAt);
expect("creation audit.createdBy preserved on supersede", provenanceSuperseded.audit.createdBy, originalCreatedBy);
expect(
  "terminal transition recorded on supersede",
  provenanceSuperseded.terminalTransition?.kind,
  "superseded",
);
expect(
  "supersede actor separately auditable",
  provenanceSuperseded.terminalTransition?.transitionedBy,
  "successor-authority",
);

const invalidateTarget = buildGovernedProgram();
const invalidated = invalidateProductionProgram(invalidateTarget, {
  reason: "Boundaries no longer satisfied",
  invalidatedBy: "invalidation-authority",
  invalidatedAt: "2026-08-10T15:00:00.000Z",
});
expect("creation audit.createdAt preserved on invalidation", invalidated.audit.createdAt, invalidateTarget.audit.createdAt);
expect(
  "invalidation actor separately auditable",
  invalidated.terminalTransition?.transitionedBy,
  "invalidation-authority",
);

section("BC-ORCH-005 — waived obligation linkage");

const waiver = grantWaiver({
  waiverAuthority: "domain_1_governance_authority",
  scope: "Obligation precondition",
  affectedTarget: "obligation-target",
  constitutionalBasis: "STD-012-R31",
  applicabilityPosture: "conditional",
  downstreamEligibilityEffect: "permits waived obligation",
  grantedBy: "waiver-authority-1",
});

const draftForWaiver = draftProductionProgram({
  intent,
  constitutionalPurpose: "Waiver linkage program",
  createdBy: "governance-authority-1",
});

expectThrows(
  "waived obligation without waiver evidence rejected",
  () =>
    addObligationToProgram(draftForWaiver, {
      description: "Improperly waived obligation",
      enforcementPosture: "waived",
      createdBy: "governance-authority-1",
    }),
  "invalid_obligation",
);

const waivedProgram = addObligationToProgram(draftForWaiver, {
  description: "Properly waived obligation",
  enforcementPosture: "waived",
  waiverRecordId: waiver.waiverId,
  createdBy: "governance-authority-1",
});
expect(
  "waiver-linked obligation accepted",
  waivedProgram.obligations[0].waiverRecordId,
  waiver.waiverId,
);

const exception = recordException({
  description: "Documented exception",
  constitutionalBasis: "STD-012-R32",
  recordedBy: "governance-authority-1",
});

expectThrows(
  "exception id cannot substitute for waiver evidence",
  () =>
    addObligationToProgram(draftForWaiver, {
      description: "Exception masquerading as waiver",
      enforcementPosture: "waived",
      waiverRecordId: exception.exceptionId,
      createdBy: "governance-authority-1",
    }),
  "invalid_obligation",
);

section("BC-ORCH-006 — terminal program exploration entry");

const terminalSuperseded = supersedeProductionProgram(
  governProductionProgram(
    bindComplianceBoundariesToProgram(
      addObligationToProgram(
        draftProductionProgram({
          intent,
          constitutionalPurpose: "Terminal supersede exploration test",
          createdBy: "governance-authority-1",
        }),
        {
          description: "Obligation",
          createdBy: "governance-authority-1",
        },
      ),
      [boundary],
    ),
  ),
  createProductionProgramId(),
  { supersededBy: "governance-authority-1" },
);

expectThrows(
  "superseded program cannot receive exploration entry",
  () =>
    determineExplorationEntry({
      program: terminalSuperseded,
      posture: "exploration_entry_withheld",
      governingBasis: "Terminal program",
      determinedBy: "governance-authority-1",
    }),
  "program_not_active",
);

const terminalInvalidated = invalidateProductionProgram(buildGovernedProgram(), {
  reason: "No longer valid",
  invalidatedBy: "governance-authority-1",
});

expectThrows(
  "invalidated program cannot receive exploration entry",
  () =>
    determineExplorationEntry({
      program: terminalInvalidated,
      posture: "exploration_entry_withheld",
      governingBasis: "Terminal program",
      determinedBy: "governance-authority-1",
    }),
  "program_not_active",
);

console.log(`\n${"=".repeat(60)}`);
console.log(`Orchestra constitutional corrections: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
