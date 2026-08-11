/**
 * ORCH-IMP-005.2 — STD-013 compliance progression correction tests.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain2-compliance-progression.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  declareProductionIntent,
  determineExplorationEntry,
  draftProductionProgram,
  EXPLORATION_POSTURE_BYPASS_EFFECT,
  governProductionProgram,
  grantWaiver,
  isOrchestraConstitutionalError,
  type Domain1Repository,
  type Domain2Repository,
  type ProductionProgram,
  type RealizationTraceabilityPackage,
} from "../orchestra/index.js";
import { createDomain2RepositoryWithStorage } from "../orchestra/persistence/domain2-repository.js";
import { createInMemoryDomain2Storage } from "../orchestra/persistence/domain2-in-memory-storage.js";
import { assertTraceabilityPackageComplete } from "../orchestra/traceability-package.js";
import { createDomain2GovernanceTraceability } from "../orchestra/domain2-authority.js";

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
      console.log(
        `  ✗ ${label} (wrong code: ${isOrchestraConstitutionalError(error) ? error.code : "not constitutional"})`,
      );
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

const ACTOR = "governance-authority-005-2";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-013 progression correction",
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
    constitutionalPurpose: "Progression correction scope",
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

async function buildCandidate(
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
  return domain2.establishRealizedVisualArtifact({
    programId: program.id,
    obligationId,
    realizationCommitmentId: commitment.commitmentId,
    realizationPath: "created",
    establishedBy: ACTOR,
  });
}

async function buildExists(
  domain2: Domain2Repository,
  program: ProductionProgram,
  obligationId: ProductionProgram["obligations"][number]["id"],
) {
  const candidate = await buildCandidate(domain2, program, obligationId);
  return domain2.promoteRvaToExists({
    rvaId: candidate.id,
    basis: "Exists",
    promotedBy: ACTOR,
  });
}

section("1-2. Candidate blocked by unresolved rework/successor_required");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2RepositoryWithStorage(domain1, createInMemoryDomain2Storage());
  const candidate = await buildCandidate(domain2, program, obligationId);
  await domain2.recordComplianceBoundaryChange({
    rvaId: candidate.id,
    complianceBoundarySourceStandardId: "FI-DSN-STD-002",
    materiality: "material",
    consequence: "rework_required",
    changeBasis: "Material CB requires rework",
    recordedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Candidate + rework_required cannot promote to Exists",
    () =>
      domain2.promoteRvaToExists({
        rvaId: candidate.id,
        basis: "Should fail",
        promotedBy: ACTOR,
      }),
    "invalid_compliance_boundary_change",
  );
}

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2RepositoryWithStorage(domain1, createInMemoryDomain2Storage());
  const candidate = await buildCandidate(domain2, program, obligationId);
  await domain2.recordComplianceBoundaryChange({
    rvaId: candidate.id,
    complianceBoundarySourceStandardId: "FI-DSN-STD-002",
    materiality: "material",
    consequence: "successor_required",
    changeBasis: "Material CB requires successor",
    recordedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Candidate + successor_required cannot promote to Exists",
    () =>
      domain2.promoteRvaToExists({
        rvaId: candidate.id,
        basis: "Should fail",
        promotedBy: ACTOR,
      }),
    "invalid_compliance_boundary_change",
  );
}

section("3-4. Exists blocked by unresolved rework/successor_required");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2RepositoryWithStorage(domain1, createInMemoryDomain2Storage());
  const exists = await buildExists(domain2, program, obligationId);
  await domain2.recordComplianceBoundaryChange({
    rvaId: exists.id,
    complianceBoundarySourceStandardId: "FI-DSN-STD-002",
    materiality: "material",
    consequence: "rework_required",
    changeBasis: "Material CB requires rework after Exists",
    recordedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Exists + rework_required cannot become Review-Entry Ready",
    () =>
      domain2.determineReviewEntryReadiness({
        rvaId: exists.id,
        determinedBy: ACTOR,
      }),
    "invalid_compliance_boundary_change",
  );
}

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2RepositoryWithStorage(domain1, createInMemoryDomain2Storage());
  const exists = await buildExists(domain2, program, obligationId);
  await domain2.recordComplianceBoundaryChange({
    rvaId: exists.id,
    complianceBoundarySourceStandardId: "FI-DSN-STD-002",
    materiality: "material",
    consequence: "successor_required",
    changeBasis: "Material CB requires successor after Exists",
    recordedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Exists + successor_required cannot become Review-Entry Ready",
    () =>
      domain2.determineReviewEntryReadiness({
        rvaId: exists.id,
        determinedBy: ACTOR,
      }),
    "invalid_compliance_boundary_change",
  );
}

section("5. Nonblocking reconsideration does not block");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2RepositoryWithStorage(domain1, createInMemoryDomain2Storage());
  const candidate = await buildCandidate(domain2, program, obligationId);
  await domain2.recordComplianceBoundaryChange({
    rvaId: candidate.id,
    complianceBoundarySourceStandardId: "FI-DSN-STD-001",
    materiality: "nonmaterial",
    consequence: "reconsideration",
    changeBasis: "Nonmaterial CB reconsideration",
    recordedBy: ACTOR,
  });
  const exists = await domain2.promoteRvaToExists({
    rvaId: candidate.id,
    basis: "Exists after reconsideration",
    promotedBy: ACTOR,
  });
  expect("Exists after reconsideration", exists.posture, "rva_exists");
  const readiness = await domain2.determineReviewEntryReadiness({
    rvaId: exists.id,
    determinedBy: ACTOR,
  });
  expect("Readiness after reconsideration", readiness.posture, "review_entry_ready");
}

section("6. invalidation_required remains terminal");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2RepositoryWithStorage(domain1, createInMemoryDomain2Storage());
  const candidate = await buildCandidate(domain2, program, obligationId);
  await domain2.recordComplianceBoundaryChange({
    rvaId: candidate.id,
    complianceBoundarySourceStandardId: "FI-DSN-STD-002",
    materiality: "material",
    consequence: "invalidation_required",
    changeBasis: "Material CB requires invalidation",
    recordedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Unresolved invalidation_required blocks Exists promotion",
    () =>
      domain2.promoteRvaToExists({
        rvaId: candidate.id,
        basis: "Should fail",
        promotedBy: ACTOR,
      }),
    "invalid_compliance_boundary_change",
  );

  const { domain1: d1b, program: progB, obligationId: oblB } = await buildGovernedDomain1();
  const domain2b = createDomain2RepositoryWithStorage(d1b, createInMemoryDomain2Storage());
  const existsB = await buildExists(domain2b, progB, oblB);
  const { rva: invalidated } = await domain2b.resolveComplianceBoundaryChange({
    rvaId: existsB.id,
    complianceBoundarySourceStandardId: "FI-DSN-STD-002",
    materiality: "material",
    consequence: "invalidation_required",
    changeBasis: "Resolve via invalidation",
    resolvedBy: ACTOR,
  });
  expect("Invalidation applied", invalidated.posture, "rva_invalidated");
  await expectThrowsAsync(
    "Terminal invalidated RVA cannot achieve Review-Entry Ready",
    () =>
      domain2b.determineReviewEntryReadiness({
        rvaId: existsB.id,
        determinedBy: ACTOR,
      }),
    "invalid_review_entry_readiness",
  );
}

section("7-8. Successor resolves predecessor without contaminating successor");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2RepositoryWithStorage(domain1, createInMemoryDomain2Storage());
  const exists = await buildExists(domain2, program, obligationId);
  const event = await domain2.recordComplianceBoundaryChange({
    rvaId: exists.id,
    complianceBoundarySourceStandardId: "FI-DSN-STD-002",
    materiality: "material",
    consequence: "successor_required",
    changeBasis: "Requires successor",
    recordedBy: ACTOR,
  });
  const { priorSuperseded, successor } = await domain2.createSuccessorRva({
    priorRvaId: exists.id,
    realizationPath: "created",
    iterationBasis: "Successor after CB decision",
    createdBy: ACTOR,
  });
  expect("Predecessor superseded", priorSuperseded.posture, "rva_superseded");
  expect("Successor is candidate", successor.posture, "rva_candidate");
  const promotedSuccessor = await domain2.promoteRvaToExists({
    rvaId: successor.id,
    basis: "Successor Exists",
    promotedBy: ACTOR,
  });
  expect("Successor Exists independent of prior block", promotedSuccessor.posture, "rva_exists");
  const pkg = await domain2.assembleTraceabilityPackage({ rvaId: exists.id });
  expectTruthy(
    "Blocking CB event retained on predecessor package",
    pkg.complianceBoundaryChangeEventIds.includes(event.eventId),
  );
  const successorPkg = await domain2.assembleTraceabilityPackage({ rvaId: successor.id });
  expect(
    "Successor package does not inherit predecessor CB events",
    successorPkg.complianceBoundaryChangeEventIds.length,
    0,
  );
  const readiness = await domain2.determineReviewEntryReadiness({
    rvaId: successor.id,
    determinedBy: ACTOR,
  });
  expect("Successor Review-Entry Ready", readiness.posture, "review_entry_ready");
}

section("9-10. Waived-path package evidence");

{
  const basePkg: RealizationTraceabilityPackage = Object.freeze({
    packageId: "traceability-package-test",
    rvaId: "rva-test" as RealizationTraceabilityPackage["rvaId"],
    programId: "program-test" as RealizationTraceabilityPackage["programId"],
    obligationId: "obligation-test" as RealizationTraceabilityPackage["obligationId"],
    realizationCommitmentId:
      "realization-commitment-test" as RealizationTraceabilityPackage["realizationCommitmentId"],
    explorationPostureRecordId:
      "exploration-posture-test" as RealizationTraceabilityPackage["explorationPostureRecordId"],
    realizationCommitmentBasis: "Commitment basis",
    realizationPath: "created",
    rvaPosture: "rva_exists",
    lineage: Object.freeze({
      rootRvaId: "rva-test" as RealizationTraceabilityPackage["rvaId"],
      versionSequence: 1,
      priorVersionId: null,
    }),
    domain1EntryEvidence: Object.freeze({
      programId: "program-test" as RealizationTraceabilityPackage["programId"],
      explorationDeterminationId: "exploration-determination-test",
      explorationEntryPosture: "exploration_entry_authorized" as const,
      domain1ReadinessEstablishedAt: new Date().toISOString(),
      constitutionalCurrentnessVerified: true as const,
    }),
    explorationWaiverRecordId: null,
    explorationPostureHistory: Object.freeze([
      Object.freeze({
        recordId:
          "exploration-posture-test" as RealizationTraceabilityPackage["explorationPostureRecordId"],
        posture: "exploration_exit_ready" as const,
        governingBasis: "Exit",
      }),
    ]),
    complianceBoundaryBindings: Object.freeze([
      Object.freeze({
        sourceStandardId: "FI-DSN-STD-001",
        scopeDescription: "Brand",
        boundAt: new Date().toISOString(),
        boundBy: ACTOR,
      }),
    ]),
    unresolvedConstraints: Object.freeze([]),
    consumedWaiverEvidence: Object.freeze([]),
    rightsPosture: null,
    sharedSourceLinkageIds: Object.freeze([]),
    complianceBoundaryChangeEventIds: Object.freeze([]),
    domain2DecisionHistory: Object.freeze([]),
    assembledAt: new Date().toISOString(),
    traceability: createDomain2GovernanceTraceability(["FI-DSN-STD-013-R41"]),
  });

  assertTraceabilityPackageComplete(basePkg);
  expectTruthy("Nonwaived path does not require waiver evidence", true);

  const waivedMissing: RealizationTraceabilityPackage = Object.freeze({
    ...basePkg,
    explorationWaiverRecordId: "waiver-missing",
    explorationPostureHistory: Object.freeze([
      Object.freeze({
        recordId:
          "exploration-posture-test" as RealizationTraceabilityPackage["explorationPostureRecordId"],
        posture: "exploration_waived" as const,
        governingBasis: "Waived",
      }),
    ]),
    consumedWaiverEvidence: Object.freeze([]),
  });

  expectThrows(
    "Waived path + missing waiver evidence fails",
    () => assertTraceabilityPackageComplete(waivedMissing),
    "invalid_rva",
  );

  const waivedPresent: RealizationTraceabilityPackage = Object.freeze({
    ...waivedMissing,
    explorationWaiverRecordId: "waiver-present",
    consumedWaiverEvidence: Object.freeze([
      Object.freeze({
        waiverId: "waiver-present",
        affectedTarget: "obligation-test",
        constitutionalBasis: "Exploration posture bypass",
      }),
    ]),
  });

  assertTraceabilityPackageComplete(waivedPresent);
  expectTruthy("Waived path + valid waiver evidence passes completeness", true);
}

section("11. Governed waived path readiness still works");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const waiver = grantWaiver({
    waiverAuthority: "domain_1_governance_authority",
    scope: "Exploration posture bypass for obligation",
    affectedTarget: obligationId,
    constitutionalBasis: "FI-DSN-STD-013-R14",
    applicabilityPosture: "conditional",
    downstreamEligibilityEffect: EXPLORATION_POSTURE_BYPASS_EFFECT,
    grantedBy: ACTOR,
  });
  await domain1.persistWaiver(waiver);
  const domain2 = createDomain2Repository(domain1);
  const waived = await domain2.beginExplorationWaived({
    programId: program.id,
    obligationId,
    waiverId: waiver.waiverId,
    governingBasis: "Waived exploration",
    operatedBy: ACTOR,
  });
  const exit = await domain2.achieveExplorationExitReady({
    recordId: waived.recordId,
    exitBasis: "Exit via waived path",
    achievedBy: ACTOR,
  });
  const commitment = await domain2.recordRealizationCommitment({
    programId: program.id,
    obligationId,
    explorationPostureRecordId: exit.recordId,
    governingBasis: "Commitment after waiver",
    committedBy: ACTOR,
  });
  const candidate = await domain2.establishRealizedVisualArtifact({
    programId: program.id,
    obligationId,
    realizationCommitmentId: commitment.commitmentId,
    realizationPath: "created",
    establishedBy: ACTOR,
  });
  const exists = await domain2.promoteRvaToExists({
    rvaId: candidate.id,
    basis: "Exists via waived path",
    promotedBy: ACTOR,
  });
  const pkg = await domain2.assembleTraceabilityPackage({ rvaId: exists.id });
  expectTruthy(
    "Waived package includes waiver evidence",
    pkg.consumedWaiverEvidence.some((e) => e.waiverId === waiver.waiverId),
  );
  const readiness = await domain2.determineReviewEntryReadiness({
    rvaId: exists.id,
    determinedBy: ACTOR,
  });
  expect("Waived path Review-Entry Ready", readiness.posture, "review_entry_ready");
}

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
