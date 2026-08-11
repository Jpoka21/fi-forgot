/**
 * ORCH-IMP-005 — STD-013 runtime completion tests.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain2-completion.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createSuccessorProgramId,
  declareProductionIntent,
  determineExplorationEntry,
  draftProductionProgram,
  governProductionProgram,
  isForbiddenBrainDomain2Action,
  isOrchestraConstitutionalError,
  rejectBrainConstitutionalMutationAttempt,
  supersedeProductionProgram,
  validateBrainDomain2Proposal,
  type Domain1Repository,
  type Domain2Repository,
  type ProductionProgram,
} from "../orchestra/index.js";
import { createDomain2RepositoryWithStorage } from "../orchestra/persistence/domain2-repository.js";
import { createInMemoryDomain2Storage } from "../orchestra/persistence/domain2-in-memory-storage.js";

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
  }
}

function expectTruthy(label: string, actual: unknown): void {
  if (actual) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
  }
}

function expectThrows(label: string, fn: () => unknown, code?: string): void {
  try {
    fn();
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label} (expected throw)`);
  } catch (error) {
    if (code && isOrchestraConstitutionalError(error) && error.code === code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else if (!code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (wrong code: ${isOrchestraConstitutionalError(error) ? error.code : "not constitutional"})`);
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
    if (code && isOrchestraConstitutionalError(error) && error.code === code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else if (!code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (wrong code)`);
    }
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

const ACTOR = "governance-authority-completion";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-013 completion test",
    governingConstraints: ["FI-DSN-STD-001"],
    declaredBy: ACTOR,
  });
  await domain1.persistIntent(intent);
  const boundary = bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Brand limits",
    boundBy: ACTOR,
  });
  let program = draftProductionProgram({
    intent,
    constitutionalPurpose: "Completion scope",
    createdBy: ACTOR,
  });
  program = addObligationToProgram(program, {
    description: "Primary obligation",
    createdBy: ACTOR,
  });
  program = bindComplianceBoundariesToProgram(program, [boundary]);
  program = governProductionProgram(program);
  await domain1.persistProgram(program);
  const determination = determineExplorationEntry({
    program,
    posture: "exploration_entry_authorized",
    governingBasis: "Exploration authorized",
    determinedBy: ACTOR,
  });
  await domain1.persistExplorationDetermination(determination);
  return { domain1, program, obligationId: program.obligations[0]!.id };
}

async function buildRvaExists(
  domain2: Domain2Repository,
  program: ProductionProgram,
  obligationId: ProductionProgram["obligations"][number]["id"],
) {
  const exploration = await domain2.beginExplorationPosture({
    programId: program.id,
    obligationId,
    governingBasis: "Exploration",
    operatedBy: ACTOR,
  });
  const exitReady = await domain2.achieveExplorationExitReady({
    recordId: exploration.recordId,
    exitBasis: "Exit ready",
    achievedBy: ACTOR,
  });
  const commitment = await domain2.recordRealizationCommitment({
    programId: program.id,
    obligationId,
    explorationPostureRecordId: exitReady.recordId,
    governingBasis: "Commitment",
    committedBy: ACTOR,
  });
  const candidate = await domain2.establishRealizedVisualArtifact({
    programId: program.id,
    obligationId,
    realizationCommitmentId: commitment.commitmentId,
    realizationPath: "created",
    establishedBy: ACTOR,
  });
  return domain2.promoteRvaToExists({
    rvaId: candidate.id,
    basis: "Exists",
    promotedBy: ACTOR,
  });
}

section("1. Successor failure leaves predecessor active");

const { domain1: d1a, program: progA, obligationId: oblA } = await buildGovernedDomain1();
const storageA = createInMemoryDomain2Storage();
const domain2a = createDomain2RepositoryWithStorage(d1a, storageA);
const priorA = await buildRvaExists(domain2a, progA, oblA);
const failingStorage = createInMemoryDomain2Storage({ failPutRvaForId: priorA.id });
await failingStorage.putRva(priorA);
const domain2fail = createDomain2RepositoryWithStorage(d1a, failingStorage);
await expectThrowsAsync(
  "Successor supersede failure rolls back",
  () =>
    domain2fail.createSuccessorRva({
      priorRvaId: priorA.id,
      realizationPath: "created",
      iterationBasis: "Should fail on supersede",
      createdBy: ACTOR,
    }),
);
const reloadedPrior = await failingStorage.getRva(priorA.id);
expect("Predecessor remains exists", reloadedPrior?.posture, "rva_exists");

section("2. Successful successor transition");

const { domain1: d1b, program: progB, obligationId: oblB } = await buildGovernedDomain1();
const domain2b = createDomain2RepositoryWithStorage(d1b, createInMemoryDomain2Storage());
const priorB = await buildRvaExists(domain2b, progB, oblB);
const succB = await domain2b.createSuccessorRva({
  priorRvaId: priorB.id,
  realizationPath: "generated",
  iterationBasis: "Iteration",
  createdBy: ACTOR,
});
expect("Prior superseded", succB.priorSuperseded.posture, "rva_superseded");
expectTruthy("Successor persisted", !!succB.successor.id);

section("3. Duplicate successor from superseded rejected");

await expectThrowsAsync(
  "Duplicate successor rejected",
  () =>
    domain2b.createSuccessorRva({
      priorRvaId: priorB.id,
      realizationPath: "created",
      iterationBasis: "Duplicate",
      createdBy: ACTOR,
    }),
  "invalid_rva",
);

section("4-7. Shared-Source Linkage");

const { domain1: d1c, program: progC } = await buildGovernedDomain1();
const programC2 = addObligationToProgram(progC, {
  description: "Second obligation for linkage",
  createdBy: ACTOR,
});
await d1c.persistProgram(programC2);
const domain2c = createDomain2RepositoryWithStorage(d1c, createInMemoryDomain2Storage());
const sourceC = await buildRvaExists(domain2c, programC2, programC2.obligations[0]!.id);
const explorationC2 = await domain2c.beginExplorationPosture({
  programId: programC2.id,
  obligationId: programC2.obligations[1]!.id,
  governingBasis: "Exploration",
  operatedBy: ACTOR,
});
const exitC2 = await domain2c.achieveExplorationExitReady({
  recordId: explorationC2.recordId,
  exitBasis: "Exit",
  achievedBy: ACTOR,
});
const commitC2 = await domain2c.recordRealizationCommitment({
  programId: programC2.id,
  obligationId: programC2.obligations[1]!.id,
  explorationPostureRecordId: exitC2.recordId,
  governingBasis: "Commit",
  committedBy: ACTOR,
});
const consumerC = await domain2c.establishRealizedVisualArtifact({
  programId: programC2.id,
  obligationId: programC2.obligations[1]!.id,
  realizationCommitmentId: commitC2.commitmentId,
  realizationPath: "created",
  establishedBy: ACTOR,
});
const linkage = await domain2c.establishSharedSourceLinkage({
  sourceRvaId: sourceC.id,
  consumerRvaId: consumerC.id,
  linkageBasis: "Shared source across obligations",
  establishedBy: ACTOR,
});
expectTruthy("Linkage created", linkage.linkageId.startsWith("shared-source-linkage-"));
expect("Identities preserved", sourceC.id !== consumerC.id, true);
expect("Consumer posture independent", consumerC.posture, "rva_candidate");

const { domain1: d1c2, program: progC3, obligationId: oblC3 } = await buildGovernedDomain1();
const domain2c2 = createDomain2RepositoryWithStorage(d1c2, createInMemoryDomain2Storage());
const sourceOther = await buildRvaExists(domain2c2, progC3, oblC3);
await expectThrowsAsync(
  "Cross-program linkage rejected",
  () =>
    domain2c.establishSharedSourceLinkage({
      sourceRvaId: sourceOther.id,
      consumerRvaId: consumerC.id,
      linkageBasis: "Invalid cross program",
      establishedBy: ACTOR,
    }),
  "invalid_shared_source_linkage",
);

section("8-11. Compliance Boundary change");

const { domain1: d1d, program: progD, obligationId: oblD } = await buildGovernedDomain1();
const domain2d = createDomain2RepositoryWithStorage(d1d, createInMemoryDomain2Storage());
const rvaD = await buildRvaExists(domain2d, progD, oblD);
const nmEvent = await domain2d.recordComplianceBoundaryChange({
  rvaId: rvaD.id,
  complianceBoundarySourceStandardId: "FI-DSN-STD-001",
  materiality: "nonmaterial",
  consequence: "reconsideration",
  changeBasis: "Nonmaterial CB adjustment",
  recordedBy: ACTOR,
});
expect("Nonmaterial consequence", nmEvent.consequence, "reconsideration");

const { domain1: d1d2, program: progD2, obligationId: oblD2 } = await buildGovernedDomain1();
const domain2d2 = createDomain2RepositoryWithStorage(d1d2, createInMemoryDomain2Storage());
const rvaD2 = await buildRvaExists(domain2d2, progD2, oblD2);
const { event: matEvent, rva: invRva } = await domain2d2.resolveComplianceBoundaryChange({
  rvaId: rvaD2.id,
  complianceBoundarySourceStandardId: "FI-DSN-STD-002",
  materiality: "material",
  consequence: "invalidation_required",
  changeBasis: "Material CB violation",
  resolvedBy: ACTOR,
});
expect("Material invalidation applied", invRva.posture, "rva_invalidated");
expectTruthy("CB event recorded", !!matEvent.eventId);

const { domain1: d1d3, program: progD3, obligationId: oblD3 } = await buildGovernedDomain1();
const domain2d3 = createDomain2RepositoryWithStorage(d1d3, createInMemoryDomain2Storage());
const rvaD3 = await buildRvaExists(domain2d3, progD3, oblD3);
const reworkEvent = await domain2d3.recordComplianceBoundaryChange({
  rvaId: rvaD3.id,
  complianceBoundarySourceStandardId: "FI-DSN-STD-003",
  materiality: "material",
  consequence: "rework_required",
  changeBasis: "Material CB requires rework",
  recordedBy: ACTOR,
});
expect("Rework consequence recorded", reworkEvent.consequence, "rework_required");

section("12. R32 does not implement GPRA");

const orchestraIndex = await import("../orchestra/index.js");
expect("No GPRA export", (orchestraIndex as Record<string, unknown>).grantGpra, undefined);

section("13-15. Licensed/acquired intake");

const { domain1: d1e, program: progE, obligationId: oblE } = await buildGovernedDomain1();
const domain2e = createDomain2RepositoryWithStorage(d1e, createInMemoryDomain2Storage());
const explorationE = await domain2e.beginExplorationPosture({
  programId: progE.id,
  obligationId: oblE,
  governingBasis: "Exploration",
  operatedBy: ACTOR,
});
const exitE = await domain2e.achieveExplorationExitReady({
  recordId: explorationE.recordId,
  exitBasis: "Exit",
  achievedBy: ACTOR,
});
const commitE = await domain2e.recordRealizationCommitment({
  programId: progE.id,
  obligationId: oblE,
  explorationPostureRecordId: exitE.recordId,
  governingBasis: "Commit",
  committedBy: ACTOR,
});
const licensedCandidate = await domain2e.establishRealizedVisualArtifact({
  programId: progE.id,
  obligationId: oblE,
  realizationCommitmentId: commitE.commitmentId,
  realizationPath: "licensed_or_acquired",
  establishedBy: ACTOR,
});
await expectThrowsAsync(
  "Missing rights intake rejected at readiness",
  () =>
    domain2e.determineReviewEntryReadiness({
      rvaId: licensedCandidate.id,
      determinedBy: ACTOR,
    }),
  "invalid_review_entry_readiness",
);
const intake = await domain2e.recordLicensedAcquiredIntake({
  rvaId: licensedCandidate.id,
  sourceReference: "license-ref-001",
  rightsBasis: "FI-DSN-STD-013-R39",
  attributionRequirement: "Attribution required",
  recordedBy: ACTOR,
});
expectTruthy("Intake recorded", intake.intakeId.startsWith("licensed-acquired-intake-"));
const licensedExists = await domain2e.promoteRvaToExists({
  rvaId: licensedCandidate.id,
  basis: "Exists",
  promotedBy: ACTOR,
});
const pkg = await domain2e.assembleTraceabilityPackage({ rvaId: licensedExists.id });
expectTruthy("Rights in package", pkg.rightsPosture?.sourceReference === "license-ref-001");

section("16-19. Traceability package completeness");

const { domain1: d1f, program: progF, obligationId: oblF } = await buildGovernedDomain1();
const domain2f = createDomain2RepositoryWithStorage(d1f, createInMemoryDomain2Storage());
const existsF = await buildRvaExists(domain2f, progF, oblF);
const fullPkg = await domain2f.assembleTraceabilityPackage({ rvaId: existsF.id });
expectTruthy("CB bindings in package", fullPkg.complianceBoundaryBindings.length > 0);
expectTruthy("Commitment basis in package", !!fullPkg.realizationCommitmentBasis);
const readinessF = await domain2f.determineReviewEntryReadiness({
  rvaId: existsF.id,
  determinedBy: ACTOR,
});
expect("Readiness posture", readinessF.posture, "review_entry_ready");

section("20-25. Brain consumer boundary");

const proposal = Object.freeze({
  proposalId: "brain-proposal-001",
  kind: "realization_input" as const,
  sourceAttribution: "brain_derived" as const,
  proposedBy: "brain-runtime",
  proposedAt: new Date().toISOString(),
  contentSummary: "Suggested visual direction",
  claimsConstitutionalAuthority: false as const,
});
validateBrainDomain2Proposal(proposal);
expectTruthy("Forbidden action recognized", isForbiddenBrainDomain2Action("establish_rva"));
expectThrows(
  "Brain cannot establish RVA",
  () => rejectBrainConstitutionalMutationAttempt("establish_rva"),
  "invalid_brain_domain2_proposal",
);
expectThrows(
  "Brain cannot mark review ready",
  () => rejectBrainConstitutionalMutationAttempt("determine_review_entry_readiness"),
  "invalid_brain_domain2_proposal",
);
expectThrows(
  "Brain cannot promote exists",
  () => rejectBrainConstitutionalMutationAttempt("promote_rva_exists"),
  "invalid_brain_domain2_proposal",
);
expectThrows(
  "Brain cannot invalidate",
  () => rejectBrainConstitutionalMutationAttempt("invalidate_rva"),
  "invalid_brain_domain2_proposal",
);
expectThrows(
  "Brain cannot grant waiver",
  () => rejectBrainConstitutionalMutationAttempt("grant_waiver"),
  "invalid_brain_domain2_proposal",
);

section("26. Exit Ready typed constraints");

const { domain1: d1g, program: progG, obligationId: oblG } = await buildGovernedDomain1();
let progGBlocked = addObligationToProgram(progG, {
  description: "Unresolved",
  enforcementPosture: "unresolved_constraint",
  createdBy: ACTOR,
});
await d1g.persistProgram(progGBlocked);
const domain2g = createDomain2RepositoryWithStorage(d1g, createInMemoryDomain2Storage());
const explorationG = await domain2g.beginExplorationPosture({
  programId: progGBlocked.id,
  obligationId: oblG,
  governingBasis: "Exploration",
  operatedBy: ACTOR,
});
await expectThrowsAsync(
  "Exit ready blocks unresolved_constraint without description heuristic",
  () =>
    domain2g.achieveExplorationExitReady({
      recordId: explorationG.recordId,
      exitBasis: "Should fail",
      achievedBy: ACTOR,
    }),
  "invalid_exploration_posture",
);

section("27. Program noncurrent blocks readiness");

const { domain1: d1h, program: progH, obligationId: oblH } = await buildGovernedDomain1();
const domain2h = createDomain2RepositoryWithStorage(d1h, createInMemoryDomain2Storage());
const existsH = await buildRvaExists(domain2h, progH, oblH);
const successorId = createSuccessorProgramId();
await d1h.persistProgram(
  supersedeProductionProgram(progH, successorId, { supersededBy: ACTOR }),
);
await expectThrowsAsync(
  "Noncurrent program blocks readiness",
  () =>
    domain2h.determineReviewEntryReadiness({
      rvaId: existsH.id,
      determinedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("28. Amendment blocks promotion");

const { domain1: d1i, program: progI, obligationId: oblI } = await buildGovernedDomain1();
const domain2i = createDomain2RepositoryWithStorage(d1i, createInMemoryDomain2Storage());
const explorationI = await domain2i.beginExplorationPosture({
  programId: progI.id,
  obligationId: oblI,
  governingBasis: "Exploration",
  operatedBy: ACTOR,
});
const exitI = await domain2i.achieveExplorationExitReady({
  recordId: explorationI.recordId,
  exitBasis: "Exit",
  achievedBy: ACTOR,
});
const commitI = await domain2i.recordRealizationCommitment({
  programId: progI.id,
  obligationId: oblI,
  explorationPostureRecordId: exitI.recordId,
  governingBasis: "Commit",
  committedBy: ACTOR,
});
const candI = await domain2i.establishRealizedVisualArtifact({
  programId: progI.id,
  obligationId: oblI,
  realizationCommitmentId: commitI.commitmentId,
  realizationPath: "created",
  establishedBy: ACTOR,
});
await d1i.recordAmendmentWithConsequences(progI, {
  materiality: "material",
  reason: "Before promotion",
  amendedBy: ACTOR,
});
await expectThrowsAsync(
  "Stale evidence blocks promotion",
  () =>
    domain2i.promoteRvaToExists({
      rvaId: candI.id,
      basis: "Should fail",
      promotedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("29. Amendment blocks readiness after exists");

const { domain1: d1j, program: progJ, obligationId: oblJ } = await buildGovernedDomain1();
const domain2j = createDomain2RepositoryWithStorage(d1j, createInMemoryDomain2Storage());
const existsJ = await buildRvaExists(domain2j, progJ, oblJ);
await d1j.recordAmendmentWithConsequences(progJ, {
  materiality: "material",
  reason: "Before readiness",
  amendedBy: ACTOR,
});
await expectThrowsAsync(
  "Stale evidence blocks readiness",
  () =>
    domain2j.determineReviewEntryReadiness({
      rvaId: existsJ.id,
      determinedBy: ACTOR,
    }),
  "domain2_not_ready",
);

section("30-34. Lineage adversarial");

const { validateSuccessorLineage } = await import("../orchestra/rva-lifecycle.js");
const { domain1: d1k, program: progK, obligationId: oblK } = await buildGovernedDomain1();
const domain2k = createDomain2RepositoryWithStorage(d1k, createInMemoryDomain2Storage());
const priorK = await buildRvaExists(domain2k, progK, oblK);
expectThrows(
  "Wrong root rejected",
  () =>
    validateSuccessorLineage(
      priorK,
      { rootRvaId: `rva-wrong` as typeof priorK.id, versionSequence: 2, priorVersionId: priorK.id },
      `rva-new` as typeof priorK.id,
    ),
  "invalid_rva",
);
expectThrows(
  "Wrong priorVersionId rejected",
  () =>
    validateSuccessorLineage(
      priorK,
      { rootRvaId: priorK.lineage.rootRvaId, versionSequence: 2, priorVersionId: `rva-wrong` as typeof priorK.id },
      `rva-new` as typeof priorK.id,
    ),
  "invalid_rva",
);
expectThrows(
  "Wrong sequence rejected",
  () =>
    validateSuccessorLineage(
      priorK,
      { rootRvaId: priorK.lineage.rootRvaId, versionSequence: 99, priorVersionId: priorK.id },
      `rva-new` as typeof priorK.id,
    ),
  "invalid_rva",
);
expectThrows(
  "Cross-sibling lineage rejected",
  () =>
    validateSuccessorLineage(
      priorK,
      {
        rootRvaId: priorK.lineage.rootRvaId,
        versionSequence: 2,
        priorVersionId: `rva-sibling` as typeof priorK.id,
      },
      `rva-new` as typeof priorK.id,
    ),
  "invalid_rva",
);
const invalidatedK = await domain2k.invalidateRva({
  rvaId: priorK.id,
  reason: "Terminal for successor test",
  invalidatedBy: ACTOR,
});
expect("Prior invalidated", invalidatedK.posture, "rva_invalidated");
await expectThrowsAsync(
  "Successor of invalidated rejected",
  () =>
    domain2k.createSuccessorRva({
      priorRvaId: priorK.id,
      realizationPath: "created",
      iterationBasis: "Should fail",
      createdBy: ACTOR,
    }),
  "invalid_rva",
);

const { domain1: d1k2, program: progK2, obligationId: oblK2 } = await buildGovernedDomain1();
const domain2k2 = createDomain2RepositoryWithStorage(d1k2, createInMemoryDomain2Storage());
const priorK2 = await buildRvaExists(domain2k2, progK2, oblK2);
await expectThrowsAsync(
  "Successor of superseded rejected",
  async () => {
    await domain2k2.createSuccessorRva({
      priorRvaId: priorK2.id,
      realizationPath: "created",
      iterationBasis: "First",
      createdBy: ACTOR,
    });
    return domain2k2.createSuccessorRva({
      priorRvaId: priorK2.id,
      realizationPath: "created",
      iterationBasis: "Again",
      createdBy: ACTOR,
    });
  },
  "invalid_rva",
);

section("R32 external rework trigger consumption");

const { domain1: d1r, program: progR, obligationId: oblR } = await buildGovernedDomain1();
const domain2r = createDomain2RepositoryWithStorage(d1r, createInMemoryDomain2Storage());
const existsR = await buildRvaExists(domain2r, progR, oblR);
const trigger = await domain2r.consumeExternalReworkTrigger({
  rvaId: existsR.id,
  externalReviewReference: "STD-014-review-ref-001",
  triggerBasis: "Conditional review disposition",
  consumedBy: ACTOR,
});
expectTruthy("Trigger consumed", trigger.triggerId.startsWith("rework-trigger-"));
expect("No GPRA in trigger", (trigger as { gpra?: unknown }).gpra, undefined);

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
