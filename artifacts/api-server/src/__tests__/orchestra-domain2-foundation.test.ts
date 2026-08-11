/**
 * ORCH-IMP-003 — STD-013 Domain 2 Realization Foundation tests.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain2-foundation.test.ts
 */

import { randomUUID } from "node:crypto";

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  createSuccessorProgramId,
  declareProductionIntent,
  determineExplorationEntry,
  draftProductionProgram,
  evaluateDomain2Readiness,
  governProductionProgram,
  invalidateProductionProgram,
  isOrchestraConstitutionalError,
  supersedeProductionProgram,
  type Domain1Repository,
  type Domain2Repository,
  type ProductionProgram,
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

function expectTruthy(label: string, actual: unknown): void {
  if (actual) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label} (expected truthy, got ${JSON.stringify(actual)})`);
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

const ACTOR = "governance-authority-domain2";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "Domain 2 foundation test intent",
    governingConstraints: ["FI-DSN-STD-001"],
    declaredBy: ACTOR,
  });
  await domain1.persistIntent(intent);

  const boundary = bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Brand expression limits",
    boundBy: ACTOR,
  });

  let program = draftProductionProgram({
    intent,
    constitutionalPurpose: "Domain 2 realization foundation scope",
    createdBy: ACTOR,
  });
  program = addObligationToProgram(program, {
    description: "Produce governed visual artifact",
    createdBy: ACTOR,
  });
  program = bindComplianceBoundariesToProgram(program, [boundary]);
  program = governProductionProgram(program);
  await domain1.persistProgram(program);

  const determination = determineExplorationEntry({
    program,
    posture: "exploration_entry_authorized",
    governingBasis: "All prerequisites satisfied for exploration entry",
    determinedBy: ACTOR,
  });
  await domain1.persistExplorationDetermination(determination);

  return { domain1, program, obligationId: program.obligations[0]!.id };
}

async function buildFullRva(domain2: Domain2Repository, program: ProductionProgram, obligationId: ProductionProgram["obligations"][number]["id"]) {
  const exploration = await domain2.beginExplorationPosture({
    programId: program.id,
    obligationId,
    governingBasis: "Begin governed exploration for obligation scope",
    operatedBy: ACTOR,
  });
  const exitReady = await domain2.achieveExplorationExitReady({
    recordId: exploration.recordId,
    exitBasis: "Sufficient exploration direction for realization eligibility",
    achievedBy: ACTOR,
  });
  const commitment = await domain2.recordRealizationCommitment({
    programId: program.id,
    obligationId,
    explorationPostureRecordId: exitReady.recordId,
    governingBasis: "Explicit Realization Commitment for obligation scope",
    committedBy: ACTOR,
  });
  return domain2.establishRealizedVisualArtifact({
    programId: program.id,
    obligationId,
    realizationCommitmentId: commitment.commitmentId,
    realizationPath: "created",
    establishedBy: ACTOR,
  });
}

section("1. Valid Domain 1 readiness permits realization creation");

const { domain1: d1a, program: progA, obligationId: oblA } = await buildGovernedDomain1();
const domain2a = createDomain2Repository(d1a);
const rvaA = await buildFullRva(domain2a, progA, oblA);
expectTruthy("RVA created with stable identity", rvaA.id.startsWith("rva-"));
expect("RVA binds to parent program", rvaA.programId, progA.id);
expect("RVA binds to obligation", rvaA.obligationId, oblA);
expect("RVA initial posture is rva_candidate", rvaA.posture, "rva_candidate");
expect("RVA lineage version sequence is 1", rvaA.lineage.versionSequence, 1);
expect("RVA lineage root is self", rvaA.lineage.rootRvaId, rvaA.id);
expectTruthy("Entry evidence preserved", rvaA.domain1EntryEvidence.constitutionalCurrentnessVerified === true);
expectTruthy("Audit metadata preserved", typeof rvaA.audit.createdAt === "string");
expectTruthy("STD-013 traceability preserved", rvaA.traceability.governingStandardId === "FI-DSN-STD-013");

section("2. Missing Domain 1 readiness rejects creation");

const domain1b = createDomain1Repository();
const intentB = declareProductionIntent({
  purpose: "Unreadiness test",
  governingConstraints: ["FI-DSN-STD-001"],
  declaredBy: ACTOR,
});
await domain1b.persistIntent(intentB);
let programB = draftProductionProgram({
  intent: intentB,
  constitutionalPurpose: "No exploration entry",
  createdBy: ACTOR,
});
programB = addObligationToProgram(programB, {
  description: "Obligation without exploration",
  createdBy: ACTOR,
});
programB = bindComplianceBoundariesToProgram(programB, [
  bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Limits",
    boundBy: ACTOR,
  }),
]);
programB = governProductionProgram(programB);
await domain1b.persistProgram(programB);
const domain2b = createDomain2Repository(domain1b);
await expectThrowsAsync(
  "beginExplorationPosture without exploration entry rejected",
  () =>
    domain2b.beginExplorationPosture({
      programId: programB.id,
      obligationId: programB.obligations[0]!.id,
      governingBasis: "Should fail",
      operatedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("3. Superseded exploration determination rejects creation");

const { domain1: d1c, program: progC, obligationId: oblC } = await buildGovernedDomain1();
const domain2c = createDomain2Repository(d1c);
await d1c.recordAmendmentWithConsequences(progC, {
  materiality: "material",
  reason: "Material change supersedes exploration",
  amendedBy: ACTOR,
});
await expectThrowsAsync(
  "Domain 2 after material amendment rejected",
  () =>
    domain2c.beginExplorationPosture({
      programId: progC.id,
      obligationId: oblC,
      governingBasis: "Should fail after material amendment",
      operatedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("4. Noncurrent parent program rejects creation");

const { domain1: d1d, program: progD, obligationId: oblD } = await buildGovernedDomain1();
const domain2d = createDomain2Repository(d1d);
const successorId = createSuccessorProgramId();
const superseded = supersedeProductionProgram(progD, successorId, {
  supersededBy: ACTOR,
});
await d1d.persistProgram(superseded);
await expectThrowsAsync(
  "Domain 2 on superseded program rejected",
  () =>
    domain2d.beginExplorationPosture({
      programId: progD.id,
      obligationId: oblD,
      governingBasis: "Should fail on superseded program",
      operatedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("5. Exploration determination for another program rejects via evaluateDomain2Readiness");

const { domain1: d1e, program: progE } = await buildGovernedDomain1();
const stored = await d1e.loadExplorationDetermination(progE.id);
expectThrows(
  "evaluateDomain2Readiness rejects wrong program",
  () =>
    evaluateDomain2Readiness({
      program: { ...progE, id: `program-${randomUUID()}` as ProductionProgram["id"] },
      explorationEntry: stored!.determination,
      explorationEntryStatus: "active",
      isConstitutionallyCurrent: true,
    }),
  "invalid_exploration_entry",
);

section("6. Realization binds to exactly one parent program");

const { domain1: d1f, program: progF, obligationId: oblF } = await buildGovernedDomain1();
const domain2f = createDomain2Repository(d1f);
const rvaF = await buildFullRva(domain2f, progF, oblF);
expect("RVA program binding exact", rvaF.programId, progF.id);
expect("Entry evidence program matches", rvaF.domain1EntryEvidence.programId, progF.id);

section("7. Split sibling mismatch rejected");

const { domain1: d1g, program: progG } = await buildGovernedDomain1();
const intentG = await d1g.loadIntent(progG.intentId);
const splitResult = await d1g.executeProgramSplit({
  intent: intentG!,
  sourceProgram: progG,
  branches: [
    {
      constitutionalPurpose: "Branch A realization scope",
      obligationDescriptions: ["Branch A obligation"],
    },
    {
      constitutionalPurpose: "Branch B realization scope",
      obligationDescriptions: ["Branch B obligation"],
    },
  ],
  scopeSeparationReason: "Parallel realization branches",
  splitAuthority: ACTOR,
  splitBy: ACTOR,
});
const branchA = splitResult.resultingPrograms[0]!;
const branchB = splitResult.resultingPrograms[1]!;
for (const branch of [branchA, branchB]) {
  const exploration = determineExplorationEntry({
    program: branch,
    posture: "exploration_entry_authorized",
    governingBasis: "Exploration entry for split branch",
    determinedBy: ACTOR,
  });
  await d1g.persistExplorationDetermination(exploration);
}
const domain2g = createDomain2Repository(d1g);
await expectThrowsAsync(
  "Obligation from branch A used on branch B rejected",
  () =>
    domain2g.beginExplorationPosture({
      programId: branchB.id,
      obligationId: branchA.obligations[0]!.id,
      governingBasis: "Wrong sibling obligation",
      operatedBy: ACTOR,
    }),
  "invalid_obligation",
);

section("8. Stable realization identity");

const { domain1: d1h, program: progH, obligationId: oblH } = await buildGovernedDomain1();
const domain2h = createDomain2Repository(d1h);
const rvaH = await buildFullRva(domain2h, progH, oblH);
const reloaded = await domain2h.loadRva(rvaH.id);
expect("RVA identity stable after reload", reloaded?.id, rvaH.id);

section("9. Lawful initial posture");

const { domain1: d1i, program: progI, obligationId: oblI } = await buildGovernedDomain1();
const domain2i = createDomain2Repository(d1i);
expect(
  "Exploration begins at exploration_active",
  (
    await domain2i.beginExplorationPosture({
      programId: progI.id,
      obligationId: oblI,
      governingBasis: "Exploration for posture test",
      operatedBy: ACTOR,
    })
  ).posture,
  "exploration_active",
);

section("10. Unauthorized initial posture rejected");

const { establishRealizedVisualArtifact: establishRva } = await import(
  "../orchestra/realized-visual-artifact.js"
);
const { recordRealizationCommitment: recordCommitment } = await import(
  "../orchestra/realization-commitment.js"
);
const { achieveExplorationExitReady: achieveExit, beginExplorationPosture: beginExploration } =
  await import("../orchestra/exploration-posture.js");

const { domain1: d1j, program: progJ, obligationId: oblJ } = await buildGovernedDomain1();
const storedJ = await d1j.loadExplorationDetermination(progJ.id);
const explorationJ = beginExploration({
  program: progJ,
  obligationId: oblJ,
  explorationEntry: storedJ!.determination,
  explorationEntryStatus: "active",
  isConstitutionallyCurrent: true,
  governingBasis: "Exploration for posture test",
  operatedBy: ACTOR,
});
const exitJ = achieveExit({
  record: explorationJ,
  program: progJ,
  exitBasis: "Exit ready",
  achievedBy: ACTOR,
});
const commitmentJ = recordCommitment({
  program: progJ,
  obligationId: oblJ,
  explorationPostureRecord: exitJ,
  governingBasis: "Commitment",
  committedBy: ACTOR,
});
expectThrows(
  "Unauthorized realization path rejected",
  () =>
    establishRva({
      program: progJ,
      obligationId: oblJ,
      realizationCommitment: commitmentJ,
      realizationPath: "forged_path" as "created",
      establishedBy: ACTOR,
    }),
  "invalid_rva",
);

section("11. Required entry evidence preserved");

const { domain1: d1k, program: progK, obligationId: oblK } = await buildGovernedDomain1();
const domain2k = createDomain2Repository(d1k);
const rvaK = await buildFullRva(domain2k, progK, oblK);
expectTruthy("explorationDeterminationId preserved", !!rvaK.domain1EntryEvidence.explorationDeterminationId);
expectTruthy("explorationEntryPosture preserved", !!rvaK.domain1EntryEvidence.explorationEntryPosture);
expectTruthy("entry timestamp preserved", !!rvaK.domain1EntryEvidence.domain1ReadinessEstablishedAt);

section("12. Audit metadata preserved");

expectTruthy("createdBy preserved", rvaK.audit.createdBy === ACTOR);
expectTruthy("governance traceability on audit", !!rvaK.audit.traceability);

section("13. Parent Program identity preserved");

expect("programId in entry evidence matches RVA", rvaK.domain1EntryEvidence.programId, progK.id);

section("14. Domain 1 program cannot be silently replaced");

const { domain1: d1l, program: progL, obligationId: oblL } = await buildGovernedDomain1();
const domain2l = createDomain2Repository(d1l);
const rvaL = await buildFullRva(domain2l, progL, oblL);
expect("RVA retains original program binding after creation", rvaL.programId, progL.id);

section("15. No GPRA behavior exists");

const orchestraIndex = await import("../orchestra/index.js");
expect("No GPRA export in primary barrel", (orchestraIndex as Record<string, unknown>)["grantGpra"], undefined);
expect("No production readiness grant export", (orchestraIndex as Record<string, unknown>)["grantProductionReadiness"], undefined);

section("16. No handoff behavior exists");

expect("No handoff export in primary barrel", (orchestraIndex as Record<string, unknown>)["executeHandoff"], undefined);

section("17. Persistence round-trip");

const { domain1: d1m, program: progM, obligationId: oblM } = await buildGovernedDomain1();
const domain2m = createDomain2Repository(d1m);
const rvaM = await buildFullRva(domain2m, progM, oblM);
const loadedM = await domain2m.loadRva(rvaM.id);
expect("Round-trip posture", loadedM?.posture, "rva_candidate");
expect("Round-trip program binding", loadedM?.programId, progM.id);

section("18. Invalid rehydration rejection");

const { validatePersistedRva } = await import("../orchestra/persistence/domain2-validation.js");
expectThrows(
  "Invalid RVA rehydration rejected",
  () => validatePersistedRva({ id: "not-valid" }),
  "identity_violation",
);

section("19. Deep-freeze after reload");

const reloadedM = await domain2m.loadRva(rvaM.id);
expectThrows(
  "Reloaded RVA is deep-frozen",
  () => {
    (reloadedM as { posture: string }).posture = "rva_exists";
  },
);

section("20. Adversarial — forged readiness via noncurrent program");

const { domain1: d1n, program: progN, obligationId: oblN } = await buildGovernedDomain1();
const invalidated = invalidateProductionProgram(progN, {
  reason: "Terminal for adversarial test",
  invalidatedBy: ACTOR,
});
await d1n.persistProgram(invalidated);
const domain2n = createDomain2Repository(d1n);
await expectThrowsAsync(
  "Terminal program rejects Domain 2",
  () =>
    domain2n.beginExplorationPosture({
      programId: progN.id,
      obligationId: oblN,
      governingBasis: "Should fail on invalidated program",
      operatedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("21. Adversarial — forged governed creation marker");

const { domain1: d1o, program: progO, obligationId: oblO } = await buildGovernedDomain1();
const domain2o = createDomain2Repository(d1o);
const rvaO = await buildFullRva(domain2o, progO, oblO);
const { validatePersistedRva: validateRva } = await import(
  "../orchestra/persistence/domain2-validation.js"
);
expectThrows(
  "Forged governed creation marker rejected",
  () => validateRva({ ...rvaO, governedCreationMarker: "forged-marker" }),
  "invalid_domain2_persistence_state",
);

section("22. Adversarial — Realization Commitment without Exploration Exit Ready");

const { domain1: d1p, program: progP, obligationId: oblP } = await buildGovernedDomain1();
const storedP = await d1p.loadExplorationDetermination(progP.id);
const { beginExplorationPosture: beginP } = await import("../orchestra/exploration-posture.js");
const { recordRealizationCommitment: recordP } = await import("../orchestra/realization-commitment.js");
const activeOnly = beginP({
  program: progP,
  obligationId: oblP,
  explorationEntry: storedP!.determination,
  explorationEntryStatus: "active",
  isConstitutionallyCurrent: true,
  governingBasis: "Active only",
  operatedBy: ACTOR,
});
expectThrows(
  "Realization Commitment without Exit Ready rejected",
  () =>
    recordP({
      program: progP,
      obligationId: oblP,
      explorationPostureRecord: activeOnly,
      governingBasis: "Premature commitment",
      committedBy: ACTOR,
    }),
  "invalid_realization_commitment",
);

section("23. Adversarial — RVA without Realization Commitment posture");

const { domain1: d1q, program: progQ, obligationId: oblQ } = await buildGovernedDomain1();
const storedQ = await d1q.loadExplorationDetermination(progQ.id);
const explorationQ = beginP({
  program: progQ,
  obligationId: oblQ,
  explorationEntry: storedQ!.determination,
  explorationEntryStatus: "active",
  isConstitutionallyCurrent: true,
  governingBasis: "Exploration",
  operatedBy: ACTOR,
});
const exitQ = (await import("../orchestra/exploration-posture.js")).achieveExplorationExitReady({
  record: explorationQ,
  program: progQ,
  exitBasis: "Exit",
  achievedBy: ACTOR,
});
const commitmentQ = recordP({
  program: progQ,
  obligationId: oblQ,
  explorationPostureRecord: exitQ,
  governingBasis: "Commitment",
  committedBy: ACTOR,
});
const forgedCommitment = { ...commitmentQ, posture: "rva_candidate" as "realization_committed" };
expectThrows(
  "RVA with forged commitment posture rejected",
  () =>
    establishRva({
      program: progQ,
      obligationId: oblQ,
      realizationCommitment: forgedCommitment,
      realizationPath: "created",
      establishedBy: ACTOR,
    }),
  "invalid_rva",
);

section("24. ORCH-IMP-004 — raw Domain 2 chain functions not in primary barrel");

const barrel = await import("../orchestra/index.js");
expect("beginExplorationPosture not exported", (barrel as Record<string, unknown>).beginExplorationPosture, undefined);
expect("achieveExplorationExitReady not exported", (barrel as Record<string, unknown>).achieveExplorationExitReady, undefined);
expect("recordRealizationCommitment not exported", (barrel as Record<string, unknown>).recordRealizationCommitment, undefined);
expect("establishRealizedVisualArtifact not exported", (barrel as Record<string, unknown>).establishRealizedVisualArtifact, undefined);
expectTruthy("createDomain2Repository still exported", typeof barrel.createDomain2Repository === "function");

section("25. evaluateDomain2Readiness constitutional currentness required");

const { domain1: d1r, program: progR } = await buildGovernedDomain1();
const storedR = await d1r.loadExplorationDetermination(progR.id);
const readinessNull = evaluateDomain2Readiness({
  program: progR,
  explorationEntry: storedR!.determination,
  explorationEntryStatus: "active",
  isConstitutionallyCurrent: false,
});
expect("Noncurrent returns null", readinessNull, null);

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
