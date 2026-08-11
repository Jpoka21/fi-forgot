/**
 * ORCH-IMP-002 — Domain 1 persistence, governed program split, and boundary validation.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-persistence.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createSuccessorProgramId,
  declareProductionIntent,
  determineExplorationEntry,
  draftProductionProgram,
  evaluateDomain2Readiness,
  governProductionProgram,
  grantWaiver,
  invalidateProductionProgram,
  isOrchestraConstitutionalError,
  recordException,
  resolveObligationConstraint,
  supersedeProductionProgram,
  type Domain1Repository,
  type ProductionProgram,
} from "../orchestra/index.js";
import { createProductionObligation } from "../orchestra/production-obligation.js";
import { executeGovernedProgramSplit } from "../orchestra/program-split.js";

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

async function expectThrowsAsync(
  label: string,
  fn: () => Promise<unknown>,
  code?: string,
): Promise<void> {
  try {
    await fn();
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

function buildGovernedProgram(actor = "governance-authority-1"): {
  intent: ReturnType<typeof declareProductionIntent>;
  program: ProductionProgram;
} {
  const intent = declareProductionIntent({
    purpose: "Persistence test production intent",
    governingConstraints: ["FI-DSN-STD-001"],
    declaredBy: actor,
  });
  const boundary = bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Brand expression limits",
    boundBy: actor,
  });
  let program = draftProductionProgram({
    intent,
    constitutionalPurpose: "Bounded realization scope for persistence testing",
    createdBy: actor,
  });
  program = addObligationToProgram(program, {
    description: "Produce governed visual artifact candidate",
    createdBy: actor,
  });
  program = bindComplianceBoundariesToProgram(program, [boundary]);
  program = governProductionProgram(program);
  return { intent, program };
}

async function buildRepository(): Promise<Domain1Repository> {
  const { createDomain1Repository } = await import("../orchestra/index.js");
  return createDomain1Repository();
}

section("1. Valid intent persistence and rehydration");

const repo1 = await buildRepository();
const { intent: testIntent, program: testProgram } = buildGovernedProgram();
const persistedIntent = await repo1.persistIntent(testIntent);
const reloadedIntent = await repo1.loadIntent(testIntent.id);
expect("intent round trip id", reloadedIntent?.id, testIntent.id);
expect("intent frozen on reload", Object.isFrozen(reloadedIntent), true);
await repo1.persistProgram(testProgram);

section("2. Valid program persistence and rehydration");

const reloadedProgram = await repo1.loadProgram(testProgram.id);
expect("program round trip id", reloadedProgram?.id, testProgram.id);
expect("program posture preserved", reloadedProgram?.posture, "program_governed");
expect("program frozen on reload", Object.isFrozen(reloadedProgram), true);

section("3. Obligation persistence and rehydration");

expect("obligation count", reloadedProgram?.obligations.length, 1);
expect(
  "obligation description preserved",
  reloadedProgram?.obligations[0]?.description,
  "Produce governed visual artifact candidate",
);
expect("obligation resolution null initially", reloadedProgram?.obligations[0]?.resolution, null);

section("4. Compliance-boundary persistence");

expect("compliance boundary count", reloadedProgram?.complianceBoundaries.length, 1);
expect(
  "compliance boundary source",
  reloadedProgram?.complianceBoundaries[0]?.sourceStandardId,
  "FI-DSN-STD-001",
);

section("5. Invalid program posture rejected on rehydration");

await expectThrowsAsync(
  "unknown posture string rejected",
  async () => {
    const forged = structuredClone(testProgram) as unknown as Record<string, unknown>;
    forged.posture = "program_active";
    await repo1.persistProgram(forged as unknown as ProductionProgram);
  },
  "invalid_persistence_state",
);

section("6. Invalid ID rejected");

await expectThrowsAsync(
  "malformed program ID rejected",
  async () => {
    const forged = structuredClone(testProgram) as unknown as Record<string, unknown>;
    forged.id = "program-not-a-uuid";
    await repo1.persistProgram(forged as unknown as ProductionProgram);
  },
  "identity_violation",
);

section("7. Invalid audit metadata rejected");

await expectThrowsAsync(
  "missing audit actor rejected",
  async () => {
    const forged = structuredClone(testProgram) as unknown as Record<string, unknown>;
    const audit = forged.audit as Record<string, unknown>;
    audit.createdBy = "";
    await repo1.persistProgram(forged as unknown as ProductionProgram);
  },
  "invalid_persistence_state",
);

section("8. Invalid terminal transition rejected");

await expectThrowsAsync(
  "invalid terminal transition kind rejected",
  async () => {
    const forged = structuredClone(testProgram) as unknown as Record<string, unknown>;
    forged.terminalTransition = {
      kind: "revoked",
      transitionedAt: new Date().toISOString(),
      transitionedBy: "actor",
    };
    await repo1.persistProgram(forged as unknown as ProductionProgram);
  },
  "invalid_persistence_state",
);

section("9. Invalid waiver linkage rejected");

const repo2 = await buildRepository();
const { intent: waiverIntent, program: waiverProgram } = buildGovernedProgram();
await repo2.persistIntent(waiverIntent);
let waivedProgram = addObligationToProgram(waiverProgram, {
  description: "Waived obligation scope",
  enforcementPosture: "waived",
  waiverRecordId: "waiver-00000000-0000-4000-8000-000000000001",
  createdBy: "governance-authority-1",
});
await expectThrowsAsync(
  "nonexistent waiver rejected at persistence",
  () => repo2.persistProgram(waivedProgram),
  "invalid_waiver",
);

section("10. Real waiver linkage accepted");

const pendingObligation = createProductionObligation({
  programId: waiverProgram.id,
  description: "Waived obligation with real waiver",
  createdBy: "governance-authority-1",
});
const waiver = grantWaiver({
  waiverAuthority: "domain_1_governance_authority",
  scope: "Obligation precondition",
  affectedTarget: pendingObligation.id,
  constitutionalBasis: "FI-DSN-STD-012-R31",
  applicabilityPosture: "conditional",
  downstreamEligibilityEffect: "permitted",
  grantedBy: "governance-authority-1",
});
await repo2.persistWaiver(waiver);
const waivedObligation = Object.freeze({
  ...pendingObligation,
  enforcementPosture: "waived" as const,
  waiverRecordId: waiver.waiverId,
});
waivedProgram = Object.freeze({
  ...waiverProgram,
  obligations: Object.freeze([...waiverProgram.obligations, waivedObligation]),
});
const savedWaived = await repo2.persistProgram(waivedProgram);
expect(
  "waived obligation persisted",
  savedWaived.obligations.some((o) => o.waiverRecordId === waiver.waiverId),
  true,
);

section("11. Brain-derived waiver rejected");

const repo3 = await buildRepository();
const brainWaiver = {
  ...waiver,
  waiverId: "waiver-00000000-0000-4000-8000-000000000099",
  sourceAttribution: "brain_derived" as const,
};
await expectThrowsAsync(
  "brain-derived waiver rejected on persist",
  () => repo3.persistWaiver(brainWaiver),
  "invalid_waiver",
);

section("12. R12 valid split");

const repo4 = await buildRepository();
const { intent: splitIntent, program: splitSource } = buildGovernedProgram();
await repo4.persistIntent(splitIntent);
await repo4.persistProgram(splitSource);
const splitResult = await repo4.executeProgramSplit({
  intent: splitIntent,
  sourceProgram: splitSource,
  branches: [
    {
      constitutionalPurpose: "Distinct scope A — portrait realization",
      obligationDescriptions: ["Portrait obligation scope"],
    },
    {
      constitutionalPurpose: "Distinct scope B — landscape realization",
      obligationDescriptions: ["Landscape obligation scope"],
    },
  ],
  scopeSeparationReason:
    "Materially distinct realization scopes cannot share one program boundary",
  splitAuthority: "domain-1-governance-authority",
  splitBy: "governance-authority-1",
});
expect("split creates two resulting programs", splitResult.resultingPrograms.length, 2);
expect("split record has provenance", splitResult.splitRecord.splitId.startsWith("split-"), true);

section("13. R12 invalid/unauthorized split");

const repo5 = await buildRepository();
const { intent: badIntent, program: badProgram } = buildGovernedProgram();
const otherIntent = declareProductionIntent({
  purpose: "Different intent",
  governingConstraints: ["FI-DSN-STD-001"],
  declaredBy: "governance-authority-1",
});
expectThrows(
  "split referencing another intent rejected",
  () =>
    executeGovernedProgramSplit({
      intent: otherIntent,
      sourceProgram: badProgram,
      branches: [
        {
          constitutionalPurpose: "Scope A",
          obligationDescriptions: ["Obligation A"],
        },
      ],
      scopeSeparationReason: "Scope separation",
      splitAuthority: "authority",
      splitBy: "actor",
    }),
  "invalid_program_split",
);

let draftedOnly = draftProductionProgram({
  intent: badIntent,
  constitutionalPurpose: "Draft only",
  createdBy: "actor",
});
expectThrows(
  "split from drafted program rejected",
  () =>
    executeGovernedProgramSplit({
      intent: badIntent,
      sourceProgram: draftedOnly,
      branches: [
        {
          constitutionalPurpose: "Scope A",
          obligationDescriptions: ["Obligation A"],
        },
      ],
      scopeSeparationReason: "Scope separation",
      splitAuthority: "authority",
      splitBy: "actor",
    }),
  "invalid_program_split",
);

section("14. Split provenance");

expect(
  "split references source program",
  splitResult.splitRecord.sourceProgramId,
  splitSource.id,
);
expect(
  "split references intent",
  splitResult.splitRecord.intentId,
  splitIntent.id,
);
expect(
  "split records resulting program IDs",
  splitResult.splitRecord.resultingProgramIds.length,
  2,
);

section("15. Current-program semantics after split");

const currentAfterSplit = await repo4.getCurrentPrograms(splitIntent.id);
expect("three current programs after split", currentAfterSplit.length, 3);
for (const program of splitResult.resultingPrograms) {
  const isCurrent = await repo4.isConstitutionallyCurrent(program);
  expect(`resulting program ${program.id} is current`, isCurrent, true);
}

section("16. Invalid current-program combination rejected");

const repo6 = await buildRepository();
const { intent: singleIntent, program: firstProgram } = buildGovernedProgram();
await repo6.persistIntent(singleIntent);
await repo6.persistProgram(firstProgram);
const secondProgram = draftProductionProgram({
  intent: singleIntent,
  constitutionalPurpose: "Unauthorized second program",
  createdBy: "governance-authority-1",
});
await expectThrowsAsync(
  "multiple current programs without split rejected",
  () => repo6.persistProgram(secondProgram),
  "invalid_current_program",
);

section("17. Exploration authorization not inherited by split programs");

const repo7 = await buildRepository();
const { intent: expIntent, program: expSource } = buildGovernedProgram();
await repo7.persistIntent(expIntent);
await repo7.persistProgram(expSource);
const exploration = determineExplorationEntry({
  program: expSource,
  posture: "exploration_entry_authorized",
  governingBasis: "All prerequisites satisfied",
  determinedBy: "governance-authority-1",
});
await repo7.persistExplorationDetermination(exploration);
const expSplit = await repo7.executeProgramSplit({
  intent: expIntent,
  sourceProgram: expSource,
  branches: [
    {
      constitutionalPurpose: "Split branch scope",
      obligationDescriptions: ["Branch obligation"],
    },
  ],
  scopeSeparationReason: "Scope separation required",
  splitAuthority: "domain-1-governance-authority",
  splitBy: "governance-authority-1",
});
const branchExploration = await repo7.loadActiveExplorationDetermination(
  expSplit.resultingPrograms[0]!.id,
);
expect("split program has no inherited exploration", branchExploration, null);
const sourceExploration = await repo7.loadActiveExplorationDetermination(expSource.id);
expect("source retains its exploration determination", sourceExploration?.posture, "exploration_entry_authorized");

section("18. Material amendment causes Domain 1 reconsideration");

const repo8 = await buildRepository();
const { intent: matIntent, program: matProgram } = buildGovernedProgram();
await repo8.persistIntent(matIntent);
await repo8.persistProgram(matProgram);
const matExploration = determineExplorationEntry({
  program: matProgram,
  posture: "exploration_entry_authorized",
  governingBasis: "Prerequisites satisfied",
  determinedBy: "governance-authority-1",
});
await repo8.persistExplorationDetermination(matExploration);
const amended = await repo8.recordAmendmentWithConsequences(matProgram, {
  materiality: "material",
  reason: "Material compliance boundary change",
  amendedBy: "governance-authority-1",
});
expect("amended program posture", amended.posture, "program_amended");
const staleExploration = await repo8.loadExplorationDetermination(matProgram.id);
expect("exploration superseded after material amendment", staleExploration?.status, "superseded");

section("19. Nonmaterial amendment follows correct path");

const repo9 = await buildRepository();
const { intent: nmIntent, program: nmProgram } = buildGovernedProgram();
await repo9.persistIntent(nmIntent);
await repo9.persistProgram(nmProgram);
const nmExploration = determineExplorationEntry({
  program: nmProgram,
  posture: "exploration_entry_authorized",
  governingBasis: "Prerequisites satisfied",
  determinedBy: "governance-authority-1",
});
await repo9.persistExplorationDetermination(nmExploration);
const nmAmended = await repo9.recordAmendmentWithConsequences(nmProgram, {
  materiality: "nonmaterial",
  reason: "Clarifying documentation only",
  amendedBy: "governance-authority-1",
  nonmaterialEligibilityPreserved: true,
});
expect("nonmaterial amended posture", nmAmended.posture, "program_amended");
const activeExploration = await repo9.loadActiveExplorationDetermination(nmProgram.id);
expect("exploration remains active after nonmaterial amendment", activeExploration?.posture, "exploration_entry_authorized");

await expectThrowsAsync(
  "nonmaterial without eligibility preservation rejected",
  async () => {
    const repoNm = await buildRepository();
    const { intent: nmIntent2, program: nmProgram2 } = buildGovernedProgram();
    await repoNm.persistIntent(nmIntent2);
    await repoNm.persistProgram(nmProgram2);
    await repoNm.recordAmendmentWithConsequences(nmProgram2, {
      materiality: "nonmaterial",
      reason: "Test without preservation flag",
      amendedBy: "governance-authority-1",
    });
  },
  "invalid_amendment",
);

section("20. Original obligation creation provenance survives resolution");

const repo10 = await buildRepository();
const { intent: resIntent } = buildGovernedProgram();
const boundary = bindComplianceBoundary({
  sourceStandardId: "FI-DSN-STD-001",
  scopeDescription: "Brand expression limits",
  boundBy: "governance-authority-1",
});
let resDraft = draftProductionProgram({
  intent: resIntent,
  constitutionalPurpose: "Resolution provenance test scope",
  createdBy: "governance-authority-1",
});
resDraft = addObligationToProgram(resDraft, {
  description: "Base obligation",
  createdBy: "governance-authority-1",
});
resDraft = addObligationToProgram(resDraft, {
  description: "Constraint to resolve",
  enforcementPosture: "unresolved_constraint",
  createdBy: "governance-authority-1",
});
resDraft = bindComplianceBoundariesToProgram(resDraft, [boundary]);
const constrained = governProductionProgram(resDraft);
const originalCreatedBy = constrained.obligations[1]!.audit.createdBy;
const originalCreatedAt = constrained.obligations[1]!.audit.createdAt;
const resolved = resolveObligationConstraint(constrained.obligations[1]!, {
  resolution: "Constraint satisfied by governed review",
  resolvedBy: "governance-authority-1",
});
const updatedObligations = constrained.obligations.map((o) =>
  o.id === resolved.id ? resolved : o,
);
const resolvedProgram = Object.freeze({
  ...constrained,
  obligations: Object.freeze(updatedObligations),
});
await repo10.persistIntent(resIntent);
await repo10.persistProgram(resolvedProgram);
const reloaded = await repo10.loadProgram(resolvedProgram.id);
const reloadedObligation = reloaded!.obligations.find((o) => o.id === resolved.id)!;
expect("creation provenance preserved", reloadedObligation.audit.createdBy, originalCreatedBy);
expect("creation timestamp preserved", reloadedObligation.audit.createdAt, originalCreatedAt);

section("21. Constraint-resolution provenance separately recorded");

expect(
  "resolution recorded separately",
  reloadedObligation.resolution?.resolvedBy,
  "governance-authority-1",
);
expect(
  "resolution detail recorded",
  reloadedObligation.resolution?.resolution.includes("governed review"),
  true,
);

section("22. Domain 2 readiness rejects another program's determination");

const repo11 = await buildRepository();
const { intent: d2Intent, program: d2ProgramA } = buildGovernedProgram();
const { program: d2ProgramB } = buildGovernedProgram();
const crossExploration = determineExplorationEntry({
  program: d2ProgramA,
  posture: "exploration_entry_authorized",
  governingBasis: "Prerequisites satisfied",
  determinedBy: "governance-authority-1",
});
expectThrows(
  "cross-program exploration determination rejected",
  () =>
    evaluateDomain2Readiness({
      program: d2ProgramB,
      explorationEntry: crossExploration,
      explorationEntryStatus: "active",
      isConstitutionallyCurrent: true,
    }),
  "invalid_exploration_entry",
);

section("23. Domain 2 readiness rejects inactive/noncurrent program");

const inactive = invalidateProductionProgram(d2ProgramA, {
  reason: "Governing basis failed",
  invalidatedBy: "governance-authority-1",
});
expectThrows(
  "inactive program rejected for domain 2",
  () =>
    evaluateDomain2Readiness({
      program: inactive,
      explorationEntry: crossExploration,
      explorationEntryStatus: "active",
      isConstitutionallyCurrent: true,
    }),
  "program_not_active",
);

const nonCurrentReadiness = evaluateDomain2Readiness({
  program: d2ProgramA,
  explorationEntry: crossExploration,
  explorationEntryStatus: "active",
  isConstitutionallyCurrent: false,
});
expect("noncurrent program returns null readiness", nonCurrentReadiness, null);

section("24. Rehydrated state cannot be casually mutated");

const repo12 = await buildRepository();
const { intent: immIntent, program: immProgram } = buildGovernedProgram();
await repo12.persistIntent(immIntent);
await repo12.persistProgram(immProgram);
const frozen = await repo12.loadProgram(immProgram.id);
let mutationFailed = false;
try {
  (frozen as { constitutionalPurpose: string }).constitutionalPurpose = "mutated";
} catch {
  mutationFailed = true;
}
expect("rehydrated program is frozen", Object.isFrozen(frozen), true);

section("25–27. Adversarial forged persisted state");

await expectThrowsAsync(
  "forged invalid traceability rejected",
  async () => {
    const forged = structuredClone(testProgram) as unknown as Record<string, unknown>;
    const audit = forged.audit as Record<string, unknown>;
    audit.traceability = { governingStandardId: "FI-DSN-STD-999" };
    await repo1.persistProgram(forged as unknown as ProductionProgram);
  },
  "invalid_persistence_state",
);

await expectThrowsAsync(
  "waived obligation with exception ID shape rejected at validation",
  async () => {
    const forged = structuredClone(testProgram) as unknown as Record<string, unknown>;
    const obligations = [
      {
        id: "obligation-00000000-0000-4000-8000-000000000001",
        programId: testProgram.id,
        description: "Forged waived",
        enforcementPosture: "waived",
        conditions: [],
        complianceBoundaryRefs: [],
        waiverRecordId: "exception-00000000-0000-4000-8000-000000000001",
        audit: testProgram.audit,
        resolution: null,
      },
    ];
    forged.obligations = obligations;
    await repo1.persistProgram(forged as unknown as ProductionProgram);
  },
  "identity_violation",
);

await expectThrowsAsync(
  "split referencing nonexistent program rejected",
  async () => {
    const repoSplit = await buildRepository();
    const { intent: splitTestIntent, program: splitTestProgram } = buildGovernedProgram();
    await repoSplit.persistIntent(splitTestIntent);
    await repoSplit.persistProgram(splitTestProgram);
    const ghostId = createSuccessorProgramId();
    await repoSplit.executeProgramSplit({
      intent: splitTestIntent,
      sourceProgram: { ...splitTestProgram, id: ghostId },
      branches: [
        {
          constitutionalPurpose: "Scope",
          obligationDescriptions: ["Obligation"],
        },
      ],
      scopeSeparationReason: "Test",
      splitAuthority: "authority",
      splitBy: "actor",
    });
  },
  "invalid_program_split",
);

section("Exception record persistence");

const repo13 = await buildRepository();
const exception = recordException({
  description: "Documented departure from default rule",
  constitutionalBasis: "FI-DSN-STD-012-R32",
  recordedBy: "governance-authority-1",
});
await repo13.persistException(exception);
expect("exception persisted", exception.exceptionId.startsWith("exception-"), true);

section("Terminal transition persistence");

const repo14 = await buildRepository();
const { intent: termIntent, program: termProgram } = buildGovernedProgram();
await repo14.persistIntent(termIntent);
await repo14.persistProgram(termProgram);
const superseded = supersedeProductionProgram(termProgram, createSuccessorProgramId(), {
  supersededBy: "governance-authority-1",
});
await repo14.persistProgram(superseded);
const reloadedSuperseded = await repo14.loadProgram(termProgram.id);
expect("terminal transition preserved", reloadedSuperseded?.terminalTransition?.kind, "superseded");
expect("terminal transition actor preserved", reloadedSuperseded?.terminalTransition?.transitionedBy, "governance-authority-1");

section("Amendment history persistence");

const repo15 = await buildRepository();
const { intent: amdIntent, program: amdProgram } = buildGovernedProgram();
await repo15.persistIntent(amdIntent);
await repo15.persistProgram(amdProgram);
const amendedProgram = await repo15.recordAmendmentWithConsequences(amdProgram, {
  materiality: "material",
  reason: "Scope change",
  amendedBy: "governance-authority-1",
});
const reloadedAmended = await repo15.loadProgram(amdProgram.id);
expect("amendment history preserved", reloadedAmended?.amendmentHistory.length, 1);

console.log(`\n${"=".repeat(60)}`);
console.log(`ORCH-IMP-002 persistence tests: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) {
    console.log(`  - ${f}`);
  }
  process.exit(1);
}
