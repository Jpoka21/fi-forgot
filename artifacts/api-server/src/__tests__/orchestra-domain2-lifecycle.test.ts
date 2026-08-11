/**
 * ORCH-IMP-004 — STD-013 Domain 2 Lifecycle Extension tests.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain2-lifecycle.test.ts
 */

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
  EXPLORATION_POSTURE_BYPASS_EFFECT,
  governProductionProgram,
  grantWaiver,
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

const ACTOR = "governance-authority-domain2-lifecycle";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "Domain 2 lifecycle test intent",
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
    constitutionalPurpose: "Domain 2 lifecycle scope",
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

async function buildExplorationExitReady(
  domain2: Domain2Repository,
  program: ProductionProgram,
  obligationId: ProductionProgram["obligations"][number]["id"],
) {
  const exploration = await domain2.beginExplorationPosture({
    programId: program.id,
    obligationId,
    governingBasis: "Begin governed exploration",
    operatedBy: ACTOR,
  });
  return domain2.achieveExplorationExitReady({
    recordId: exploration.recordId,
    exitBasis: "Sufficient exploration direction",
    achievedBy: ACTOR,
  });
}

async function buildRvaCandidate(
  domain2: Domain2Repository,
  program: ProductionProgram,
  obligationId: ProductionProgram["obligations"][number]["id"],
) {
  const exitReady = await buildExplorationExitReady(domain2, program, obligationId);
  const commitment = await domain2.recordRealizationCommitment({
    programId: program.id,
    obligationId,
    explorationPostureRecordId: exitReady.recordId,
    governingBasis: "Explicit Realization Commitment",
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

async function buildRvaExists(
  domain2: Domain2Repository,
  program: ProductionProgram,
  obligationId: ProductionProgram["obligations"][number]["id"],
) {
  const candidate = await buildRvaCandidate(domain2, program, obligationId);
  return domain2.promoteRvaToExists({
    rvaId: candidate.id,
    basis: "RVA materially exists for obligation scope",
    promotedBy: ACTOR,
  });
}

section("1. Valid Exploration Waived path");

const { domain1: d1w, program: progW, obligationId: oblW } = await buildGovernedDomain1();
const waiver = grantWaiver({
  waiverAuthority: "domain_1_governance_authority",
  scope: "Exploration posture bypass for obligation",
  affectedTarget: oblW,
  constitutionalBasis: "FI-DSN-STD-013-R14",
  applicabilityPosture: "conditional",
  downstreamEligibilityEffect: EXPLORATION_POSTURE_BYPASS_EFFECT,
  grantedBy: ACTOR,
});
await d1w.persistWaiver(waiver);
const domain2w = createDomain2Repository(d1w);
const waived = await domain2w.beginExplorationWaived({
  programId: progW.id,
  obligationId: oblW,
  waiverId: waiver.waiverId,
  governingBasis: "Exploration waived per Domain 1 waiver authority",
  operatedBy: ACTOR,
});
expect("Exploration Waived posture", waived.posture, "exploration_waived");
expect("Waiver record linked", waived.explorationWaiverRecordId, waiver.waiverId);
const exitWaived = await domain2w.achieveExplorationExitReady({
  recordId: waived.recordId,
  exitBasis: "Waived path exit ready",
  achievedBy: ACTOR,
});
expect("Waived path reaches exit ready", exitWaived.posture, "exploration_exit_ready");
const commitmentWaived = await domain2w.recordRealizationCommitment({
  programId: progW.id,
  obligationId: oblW,
  explorationPostureRecordId: exitWaived.recordId,
  governingBasis: "Commitment still required after waiver",
  committedBy: ACTOR,
});
expectTruthy("Realization Commitment required after waiver", !!commitmentWaived.commitmentId);

section("2. Invalid waiver scope rejected");

const { domain1: d1wi, program: progWi, obligationId: oblWi } = await buildGovernedDomain1();
const wrongWaiver = grantWaiver({
  waiverAuthority: "domain_1_governance_authority",
  scope: "Wrong target",
  affectedTarget: "obligation-wrong-target",
  constitutionalBasis: "FI-DSN-STD-013-R14",
  applicabilityPosture: "conditional",
  downstreamEligibilityEffect: EXPLORATION_POSTURE_BYPASS_EFFECT,
  grantedBy: ACTOR,
});
await d1wi.persistWaiver(wrongWaiver);
const domain2wi = createDomain2Repository(d1wi);
await expectThrowsAsync(
  "Wrong waiver target rejected",
  () =>
    domain2wi.beginExplorationWaived({
      programId: progWi.id,
      obligationId: oblWi,
      waiverId: wrongWaiver.waiverId,
      governingBasis: "Should fail",
      operatedBy: ACTOR,
    }),
  "invalid_waiver",
);

section("3. Exit Ready rechecks live Domain 1 state");

const { domain1: d1e, program: progE, obligationId: oblE } = await buildGovernedDomain1();
let programWithUnresolved = addObligationToProgram(progE, {
  description: "Unresolved obligation blocks exit",
  enforcementPosture: "unresolved_constraint",
  createdBy: ACTOR,
});
await d1e.persistProgram(programWithUnresolved);
const domain2e = createDomain2Repository(d1e);
const explorationE = await domain2e.beginExplorationPosture({
  programId: programWithUnresolved.id,
  obligationId: oblE,
  governingBasis: "Exploration with unresolved sibling",
  operatedBy: ACTOR,
});
await expectThrowsAsync(
  "Exit Ready blocked by unresolved obligation",
  () =>
    domain2e.achieveExplorationExitReady({
      recordId: explorationE.recordId,
      exitBasis: "Should fail",
      achievedBy: ACTOR,
    }),
  "invalid_exploration_posture",
);

section("4. Material amendment between Exploration Active and Exit Ready");

const { domain1: d1a, program: progA, obligationId: oblA } = await buildGovernedDomain1();
const domain2a = createDomain2Repository(d1a);
const explorationA = await domain2a.beginExplorationPosture({
  programId: progA.id,
  obligationId: oblA,
  governingBasis: "Exploration before amendment",
  operatedBy: ACTOR,
});
await d1a.recordAmendmentWithConsequences(progA, {
  materiality: "material",
  reason: "Material change before exit ready",
  amendedBy: ACTOR,
});
await expectThrowsAsync(
  "Stale entry evidence blocks exit ready",
  () =>
    domain2a.achieveExplorationExitReady({
      recordId: explorationA.recordId,
      exitBasis: "Should fail",
      achievedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("5. Material amendment between Exit Ready and Commitment");

const { domain1: d1b, program: progB, obligationId: oblB } = await buildGovernedDomain1();
const domain2b = createDomain2Repository(d1b);
const exitB = await buildExplorationExitReady(domain2b, progB, oblB);
await d1b.recordAmendmentWithConsequences(progB, {
  materiality: "material",
  reason: "Material change before commitment",
  amendedBy: ACTOR,
});
await expectThrowsAsync(
  "Stale entry evidence blocks commitment",
  () =>
    domain2b.recordRealizationCommitment({
      programId: progB.id,
      obligationId: oblB,
      explorationPostureRecordId: exitB.recordId,
      governingBasis: "Should fail",
      committedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("6. Material amendment between Commitment and RVA creation");

const { domain1: d1c, program: progC, obligationId: oblC } = await buildGovernedDomain1();
const domain2c = createDomain2Repository(d1c);
const exitC = await buildExplorationExitReady(domain2c, progC, oblC);
const commitmentC = await domain2c.recordRealizationCommitment({
  programId: progC.id,
  obligationId: oblC,
  explorationPostureRecordId: exitC.recordId,
  governingBasis: "Commitment before amendment",
  committedBy: ACTOR,
});
await d1c.recordAmendmentWithConsequences(progC, {
  materiality: "material",
  reason: "Material change before RVA",
  amendedBy: ACTOR,
});
await expectThrowsAsync(
  "Stale entry evidence blocks RVA creation",
  () =>
    domain2c.establishRealizedVisualArtifact({
      programId: progC.id,
      obligationId: oblC,
      realizationCommitmentId: commitmentC.commitmentId,
      realizationPath: "created",
      establishedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("7. Valid RVA Candidate to RVA Exists");

const { domain1: d1x, program: progX, obligationId: oblX } = await buildGovernedDomain1();
const domain2x = createDomain2Repository(d1x);
const candidateX = await buildRvaCandidate(domain2x, progX, oblX);
const existsX = await domain2x.promoteRvaToExists({
  rvaId: candidateX.id,
  basis: "RVA exists promotion",
  promotedBy: ACTOR,
});
expect("RVA Exists posture", existsX.posture, "rva_exists");
expect("Same RVA identity", existsX.id, candidateX.id);
expectTruthy("Exists promotion provenance", existsX.existsPromotion?.promotedBy === ACTOR);

section("8. Unauthorized RVA Exists transition rejected");

const { domain1: d1u, program: progU, obligationId: oblU } = await buildGovernedDomain1();
const domain2u = createDomain2Repository(d1u);
const existsU = await buildRvaExists(domain2u, progU, oblU);
await expectThrowsAsync(
  "Double promotion rejected",
  () =>
    domain2u.promoteRvaToExists({
      rvaId: existsU.id,
      basis: "Should fail",
      promotedBy: ACTOR,
    }),
  "invalid_rva",
);

section("9. Stable RVA identity through Candidate to Exists");

const { domain1: d1i, program: progI, obligationId: oblI } = await buildGovernedDomain1();
const domain2i = createDomain2Repository(d1i);
const candidateI = await buildRvaCandidate(domain2i, progI, oblI);
const existsI = await domain2i.promoteRvaToExists({
  rvaId: candidateI.id,
  basis: "Promotion",
  promotedBy: ACTOR,
});
expect("Identity stable", existsI.id, candidateI.id);
expect("Creation audit preserved", existsI.audit.createdBy, ACTOR);

section("10. Valid successor RVA creation");

const { domain1: d1s, program: progS, obligationId: oblS } = await buildGovernedDomain1();
const domain2s = createDomain2Repository(d1s);
const priorS = await buildRvaExists(domain2s, progS, oblS);
const { priorSuperseded, successor } = await domain2s.createSuccessorRva({
  priorRvaId: priorS.id,
  realizationPath: "generated",
  iterationBasis: "Iteration for improved realization",
  createdBy: ACTOR,
});
expectTruthy("Successor created", successor.id !== priorS.id);
expect("Prior superseded", priorSuperseded.posture, "rva_superseded");

section("11. New successor has new RVA ID");

expect("Successor ID differs", successor.id !== priorS.id, true);

section("12. Lineage root preserved");

expect("Root preserved", successor.lineage.rootRvaId, priorS.lineage.rootRvaId);

section("13. Version sequence correct");

expect("Version incremented", successor.lineage.versionSequence, priorS.lineage.versionSequence + 1);

section("14. priorVersionId correct");

expect("Prior version reference", successor.lineage.priorVersionId, priorS.id);

section("15. Invalid lineage rejected");

const { validateSuccessorLineage } = await import("../orchestra/rva-lifecycle.js");
const { domain1: d1l, program: progL, obligationId: oblL } = await buildGovernedDomain1();
const domain2l = createDomain2Repository(d1l);
const priorL = await buildRvaCandidate(domain2l, progL, oblL);
expectThrows(
  "Forged lineage rejected",
  () =>
    validateSuccessorLineage(
      priorL,
      {
        rootRvaId: priorL.lineage.rootRvaId,
        versionSequence: 99,
        priorVersionId: priorL.id,
      },
      `rva-forged` as typeof priorL.id,
    ),
  "invalid_rva",
);

section("16. Cross-program successor rejected");

const { domain1: d1p, program: progP, obligationId: oblP } = await buildGovernedDomain1();
const { program: progP2 } = await buildGovernedDomain1();
const domain2p = createDomain2Repository(d1p);
const priorP = await buildRvaCandidate(domain2p, progP, oblP);
const { createSuccessorRva: rawSuccessor } = await import("../orchestra/rva-lifecycle.js");
expectThrows(
  "Cross-program successor rejected",
  () =>
    rawSuccessor({
      priorRva: priorP,
      program: progP2,
      realizationPath: "created",
      iterationBasis: "Cross program",
      createdBy: ACTOR,
    }),
  "invalid_obligation",
);

section("17. Cross-obligation successor rejected");

const { domain1: d1o, program: progO } = await buildGovernedDomain1();
const domain2o = createDomain2Repository(d1o);
const oblO = progO.obligations[0]!.id;
const programWithExtra = addObligationToProgram(progO, {
  description: "Second obligation",
  createdBy: ACTOR,
});
await d1o.persistProgram(programWithExtra);
const priorO = await buildRvaCandidate(domain2o, programWithExtra, oblO);
const wrongProgram = Object.freeze({
  ...programWithExtra,
  obligations: Object.freeze([programWithExtra.obligations[1]!]),
});
expectThrows(
  "Cross-obligation scope rejected",
  () =>
    rawSuccessor({
      priorRva: priorO,
      program: wrongProgram,
      realizationPath: "created",
      iterationBasis: "Wrong obligation",
      createdBy: ACTOR,
    }),
  "invalid_obligation",
);

section("18. Prior RVA superseded correctly");

const { domain1: d1ss, program: progSs, obligationId: oblSs } = await buildGovernedDomain1();
const domain2ss = createDomain2Repository(d1ss);
const priorSs = await buildRvaExists(domain2ss, progSs, oblSs);
const resultSs = await domain2ss.createSuccessorRva({
  priorRvaId: priorSs.id,
  realizationPath: "created",
  iterationBasis: "Successor iteration",
  createdBy: ACTOR,
});
expect("Prior posture superseded", resultSs.priorSuperseded.posture, "rva_superseded");

section("19. Supersession provenance preserved separately");

expectTruthy(
  "Supersession transition recorded",
  resultSs.priorSuperseded.terminalTransition?.kind === "superseded",
);
expectTruthy(
  "Successor ID in supersession",
  resultSs.priorSuperseded.terminalTransition?.successorRvaId === resultSs.successor.id,
);
expect("Original creation audit preserved", resultSs.priorSuperseded.audit.createdBy, ACTOR);

section("20. Valid invalidation");

const { domain1: d1inv, program: progInv, obligationId: oblInv } = await buildGovernedDomain1();
const domain2inv = createDomain2Repository(d1inv);
const candidateInv = await buildRvaCandidate(domain2inv, progInv, oblInv);
const invalidated = await domain2inv.invalidateRva({
  rvaId: candidateInv.id,
  reason: "Realization no longer valid",
  invalidatedBy: ACTOR,
});
expect("Invalidated posture", invalidated.posture, "rva_invalidated");
expectTruthy("Invalidation transition", invalidated.terminalTransition?.kind === "invalidated");

section("21. Invalid terminal transition rejected");

await expectThrowsAsync(
  "Iteration from invalidated rejected",
  () =>
    domain2inv.createSuccessorRva({
      priorRvaId: invalidated.id,
      realizationPath: "created",
      iterationBasis: "Should fail",
      createdBy: ACTOR,
    }),
  "invalid_rva",
);

section("22. Superseded RVA cannot become Review-Entry Ready");

const { domain1: d1r, program: progR, obligationId: oblR } = await buildGovernedDomain1();
const domain2r = createDomain2Repository(d1r);
const priorR = await buildRvaExists(domain2r, progR, oblR);
const succR = await domain2r.createSuccessorRva({
  priorRvaId: priorR.id,
  realizationPath: "created",
  iterationBasis: "Successor",
  createdBy: ACTOR,
});
await expectThrowsAsync(
  "Superseded RVA rejected for review entry",
  () =>
    domain2r.determineReviewEntryReadiness({
      rvaId: succR.priorSuperseded.id,
      determinedBy: ACTOR,
    }),
  "invalid_review_entry_readiness",
);

section("23. Invalidated RVA cannot become Review-Entry Ready");

const { domain1: d1ri, program: progRi, obligationId: oblRi } = await buildGovernedDomain1();
const domain2ri = createDomain2Repository(d1ri);
const candRi = await buildRvaCandidate(domain2ri, progRi, oblRi);
const invRi = await domain2ri.invalidateRva({
  rvaId: candRi.id,
  reason: "Invalid",
  invalidatedBy: ACTOR,
});
await expectThrowsAsync(
  "Invalidated RVA rejected for review entry",
  () =>
    domain2ri.determineReviewEntryReadiness({
      rvaId: invRi.id,
      determinedBy: ACTOR,
    }),
  "invalid_review_entry_readiness",
);

section("24. Traceability Package contains required components");

const { domain1: d1t, program: progT, obligationId: oblT } = await buildGovernedDomain1();
const domain2t = createDomain2Repository(d1t);
const existsT = await buildRvaExists(domain2t, progT, oblT);
const pkg = await domain2t.assembleTraceabilityPackage({ rvaId: existsT.id });
expect("Package RVA ID", pkg.rvaId, existsT.id);
expect("Package program ID", pkg.programId, progT.id);
expect("Package obligation ID", pkg.obligationId, oblT);
expectTruthy("Domain 1 entry evidence", pkg.domain1EntryEvidence.constitutionalCurrentnessVerified === true);
expectTruthy("Commitment reference", !!pkg.realizationCommitmentId);
expectTruthy("Exploration posture reference", !!pkg.explorationPostureRecordId);

section("25. Missing traceability component prevents Review-Entry Readiness");

const { determineReviewEntryReadiness: rawReadiness } = await import(
  "../orchestra/review-entry-readiness.js"
);
const { assembleRealizationTraceabilityPackage: rawPackage } = await import(
  "../orchestra/traceability-package.js"
);
const incompletePkg = Object.freeze({
  ...pkg,
  domain1EntryEvidence: Object.freeze({
    ...pkg.domain1EntryEvidence,
    constitutionalCurrentnessVerified: false as true,
  }),
});
expectThrows(
  "Incomplete traceability blocks readiness",
  () =>
    rawReadiness({
      rva: existsT,
      traceabilityPackage: incompletePkg,
      determinedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("26. Valid Review-Entry Readiness created");

const { domain1: d1rr, program: progRr, obligationId: oblRr } = await buildGovernedDomain1();
const domain2rr = createDomain2Repository(d1rr);
const existsRr = await buildRvaExists(domain2rr, progRr, oblRr);
const readiness = await domain2rr.determineReviewEntryReadiness({
  rvaId: existsRr.id,
  determinedBy: ACTOR,
});
expect("Review entry ready posture", readiness.posture, "review_entry_ready");
expect("Readiness binds to RVA", readiness.rvaId, existsRr.id);
expectTruthy("Traceability package attached", readiness.traceabilityPackage.rvaId === existsRr.id);

section("27. Review-Entry Readiness does not create GPRA state");

const orchestraIndex = await import("../orchestra/index.js");
expect("No GPRA export", (orchestraIndex as Record<string, unknown>).grantGpra, undefined);
expect("Readiness is not approval", readiness.posture, "review_entry_ready");

section("28. Raw public API cannot bypass repository lifecycle");

expect(
  "beginExplorationPosture not in barrel",
  (orchestraIndex as Record<string, unknown>).beginExplorationPosture,
  undefined,
);

section("29-30. Adversarial lifecycle cases");

const { domain1: d1adv, program: progAdv, obligationId: oblAdv } = await buildGovernedDomain1();
const domain2adv = createDomain2Repository(d1adv);
const priorAdv = await buildRvaExists(domain2adv, progAdv, oblAdv);
const firstSucc = await domain2adv.createSuccessorRva({
  priorRvaId: priorAdv.id,
  realizationPath: "created",
  iterationBasis: "First successor",
  createdBy: ACTOR,
});
await expectThrowsAsync(
  "Duplicate successor from superseded prior rejected",
  () =>
    domain2adv.createSuccessorRva({
      priorRvaId: priorAdv.id,
      realizationPath: "created",
      iterationBasis: "Duplicate",
      createdBy: ACTOR,
    }),
  "invalid_rva",
);

const secondSucc = await domain2adv.createSuccessorRva({
  priorRvaId: firstSucc.successor.id,
  realizationPath: "generated",
  iterationBasis: "Successor of successor",
  createdBy: ACTOR,
});
expect("Successor of successor version 3", secondSucc.successor.lineage.versionSequence, 3);

const successorId = createSuccessorProgramId();
const supersededProg = supersedeProductionProgram(progAdv, successorId, {
  supersededBy: ACTOR,
});
await d1adv.persistProgram(supersededProg);
await expectThrowsAsync(
  "Successor after program noncurrent rejected",
  () =>
    domain2adv.createSuccessorRva({
      priorRvaId: secondSucc.successor.id,
      realizationPath: "created",
      iterationBasis: "After noncurrent",
      createdBy: ACTOR,
    }),
  "domain2_not_ready",
);

const { domain1: d1inv2, program: progInv2, obligationId: oblInv2 } = await buildGovernedDomain1();
const domain2inv2 = createDomain2Repository(d1inv2);
const existsInv2 = await buildRvaExists(domain2inv2, progInv2, oblInv2);
const succInv2 = await domain2inv2.createSuccessorRva({
  priorRvaId: existsInv2.id,
  realizationPath: "created",
  iterationBasis: "Before invalidation test",
  createdBy: ACTOR,
});
await expectThrowsAsync(
  "Invalidation of superseded prior rejected",
  () =>
    domain2inv2.invalidateRva({
      rvaId: succInv2.priorSuperseded.id,
      reason: "Too late",
      invalidatedBy: ACTOR,
    }),
  "invalid_rva",
);

const candInv2 = await buildRvaCandidate(domain2inv2, progInv2, oblInv2);
const invCand2 = await domain2inv2.invalidateRva({
  rvaId: candInv2.id,
  reason: "Invalidate before successor",
  invalidatedBy: ACTOR,
});
await expectThrowsAsync(
  "Successor after invalidation rejected",
  () =>
    domain2inv2.createSuccessorRva({
      priorRvaId: invCand2.id,
      realizationPath: "created",
      iterationBasis: "After invalidation",
      createdBy: ACTOR,
    }),
  "invalid_rva",
);

const { validatePersistedReviewEntryReadiness } = await import(
  "../orchestra/persistence/domain2-validation.js"
);
expectThrows(
  "Forged review readiness rejected",
  () => validatePersistedReviewEntryReadiness({ readinessId: "forged" }),
  "identity_violation",
);

const { beginExplorationPosture: rawBegin } = await import("../orchestra/exploration-posture.js");
const storedRaw = await d1adv.loadExplorationDetermination(progAdv.id);
expectThrows(
  "Raw begin without repository readiness rejected when program wrong",
  () =>
    rawBegin({
      program: { ...progAdv, id: `program-forged` as typeof progAdv.id },
      obligationId: oblAdv,
      explorationEntry: storedRaw!.determination,
      explorationEntryStatus: "active",
      isConstitutionallyCurrent: true,
      governingBasis: "Bypass",
      operatedBy: ACTOR,
    }),
  "invalid_exploration_entry",
);

section("31. Candidate cannot achieve Review-Entry Readiness without Exists promotion");

const { domain1: d1cand, program: progCand, obligationId: oblCand } = await buildGovernedDomain1();
const domain2cand = createDomain2Repository(d1cand);
const candOnly = await buildRvaCandidate(domain2cand, progCand, oblCand);
await expectThrowsAsync(
  "Candidate blocked from review entry",
  () =>
    domain2cand.determineReviewEntryReadiness({
      rvaId: candOnly.id,
      determinedBy: ACTOR,
    }),
  "invalid_review_entry_readiness",
);

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
