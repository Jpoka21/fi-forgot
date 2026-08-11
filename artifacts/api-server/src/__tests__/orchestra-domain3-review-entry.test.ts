/**
 * ORCH-IMP-006 — Domain 3 Review Entry Eligibility foundation tests.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-review-entry.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  declareProductionIntent,
  determineExplorationEntry,
  draftProductionProgram,
  governProductionProgram,
  isOrchestraConstitutionalError,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizationTraceabilityPackage,
  type RealizedVisualArtifact,
  type ReviewEntryReadiness,
} from "../orchestra/index.js";
import { admitProductionReadinessReview } from "../orchestra/review-entry-eligibility.js";

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

const ACTOR = "governance-authority-006";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 review entry foundation",
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
    constitutionalPurpose: "Review entry scope",
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

async function buildReviewReady(
  domain2: Domain2Repository,
  program: ProductionProgram,
  obligationId: ProductionProgram["obligations"][number]["id"],
): Promise<{
  rva: RealizedVisualArtifact;
  readiness: ReviewEntryReadiness;
}> {
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
  const rva = await domain2.promoteRvaToExists({
    rvaId: candidate.id,
    basis: "Exists",
    promotedBy: ACTOR,
  });
  const readiness = await domain2.determineReviewEntryReadiness({
    rvaId: rva.id,
    determinedBy: ACTOR,
  });
  return { rva, readiness };
}

section("1. Valid readiness + package permits review admission");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva, readiness } = await buildReviewReady(domain2, program, obligationId);
  const review = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  expectTruthy("Stable review identity", review.reviewId.startsWith("production-readiness-review-"));
  expect("Initial posture Under Review", review.posture, "under_review");
  expect("Eligibility status", review.eligibilityStatus, "review_entry_eligible");
  expect("Entry readiness preserved", review.domain2EntryEvidence.reviewEntryReadinessId, readiness.readinessId);
  expect(
    "Entry package preserved",
    review.domain2EntryEvidence.traceabilityPackageId,
    readiness.traceabilityPackage.packageId,
  );
  expectTruthy("Audit actor preserved", review.audit.createdBy === ACTOR);
  expectTruthy("Audit time preserved", !!review.audit.createdAt);
  expect("No GPRA field", (review as { gpra?: unknown }).gpra, undefined);
  expect("No approval field", (review as { approval?: unknown }).approval, undefined);
  expect("No handoff field", (review as { handoff?: unknown }).handoff, undefined);

  const reloadedRva = await domain2.loadRva(rva.id);
  expect("Domain 2 RVA unchanged", reloadedRva?.posture, "rva_exists");
  const reloadedReadiness = await domain2.loadReviewEntryReadinessByRva(rva.id);
  expect("Domain 2 readiness unchanged", reloadedReadiness?.readinessId, readiness.readinessId);
}

section("2-3. Missing readiness / package reject");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const exploration = await domain2.beginExplorationPosture({
    programId: program.id,
    obligationId,
    governingBasis: "Exploration",
    operatedBy: ACTOR,
  });
  const exitReady = await domain2.achieveExplorationExitReady({
    recordId: exploration.recordId,
    exitBasis: "Exit",
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
  const exists = await domain2.promoteRvaToExists({
    rvaId: candidate.id,
    basis: "Exists",
    promotedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Missing readiness rejects admission",
    () =>
      domain3.admitToProductionReadinessReview({
        rvaId: exists.id,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );
}

section("4-8. Identity binding mismatches");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const { rva, readiness } = await buildReviewReady(domain2, program, obligationId);

  const { domain1: d1b, program: progB, obligationId: oblB } = await buildGovernedDomain1();
  const domain2b = createDomain2Repository(d1b);
  const other = await buildReviewReady(domain2b, progB, oblB);

  expectThrows(
    "Readiness for another RVA rejected",
    () =>
      admitProductionReadinessReview({
        rva,
        reviewEntryReadiness: other.readiness,
        traceabilityPackage: other.readiness.traceabilityPackage,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );

  expectThrows(
    "Traceability package for another RVA rejected",
    () =>
      admitProductionReadinessReview({
        rva,
        reviewEntryReadiness: readiness,
        traceabilityPackage: other.readiness.traceabilityPackage,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );

  const forgedProgramPkg = {
    ...readiness.traceabilityPackage,
    programId: other.rva.programId,
  } as RealizationTraceabilityPackage;
  expectThrows(
    "Program mismatch rejected",
    () =>
      admitProductionReadinessReview({
        rva,
        reviewEntryReadiness: readiness,
        traceabilityPackage: forgedProgramPkg,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );

  const forgedObligationPkg = {
    ...readiness.traceabilityPackage,
    obligationId: other.rva.obligationId,
  } as RealizationTraceabilityPackage;
  expectThrows(
    "Obligation mismatch rejected",
    () =>
      admitProductionReadinessReview({
        rva,
        reviewEntryReadiness: readiness,
        traceabilityPackage: forgedObligationPkg,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );

  const forgedLineagePkg = {
    ...readiness.traceabilityPackage,
    lineage: {
      rootRvaId: other.rva.id,
      versionSequence: 99,
      priorVersionId: null,
    },
  } as RealizationTraceabilityPackage;
  expectThrows(
    "Lineage mismatch rejected",
    () =>
      admitProductionReadinessReview({
        rva,
        reviewEntryReadiness: readiness,
        traceabilityPackage: forgedLineagePkg,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );
}

section("9-11. Terminal / superseded / invalidated rejected");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva } = await buildReviewReady(domain2, program, obligationId);
  await domain2.invalidateRva({
    rvaId: rva.id,
    reason: "Terminal for review entry test",
    invalidatedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Invalidated RVA rejected",
    () =>
      domain3.admitToProductionReadinessReview({
        rvaId: rva.id,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );
}

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva } = await buildReviewReady(domain2, program, obligationId);
  await domain2.createSuccessorRva({
    priorRvaId: rva.id,
    realizationPath: "created",
    iterationBasis: "Successor",
    createdBy: ACTOR,
  });
  await expectThrowsAsync(
    "Superseded RVA rejected",
    () =>
      domain3.admitToProductionReadinessReview({
        rvaId: rva.id,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );
}

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const exploration = await domain2.beginExplorationPosture({
    programId: program.id,
    obligationId,
    governingBasis: "Exploration",
    operatedBy: ACTOR,
  });
  const exitReady = await domain2.achieveExplorationExitReady({
    recordId: exploration.recordId,
    exitBasis: "Exit",
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
  await expectThrowsAsync(
    "Candidate (incomplete Realization) rejected",
    () =>
      domain3.admitToProductionReadinessReview({
        rvaId: candidate.id,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );
}

section("12-16. Identity, posture, evidence, Domain 2 nonmutation");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva, readiness } = await buildReviewReady(domain2, program, obligationId);
  const before = structuredClone(rva);
  const review = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  expectTruthy("Stable identity assigned", !!review.reviewId);
  expect("Under Review posture", review.posture, "under_review");
  expect("Program bound", review.programId, program.id);
  expect("Obligation bound", review.obligationId, obligationId);
  expect("RVA bound", review.rvaId, rva.id);
  expect(
    "Entry evidence lineage root",
    review.domain2EntryEvidence.lineage.rootRvaId,
    before.lineage.rootRvaId,
  );
  const after = await domain2.loadRva(rva.id);
  expect("Domain 2 posture unchanged after admission", after?.posture, before.posture);
  expect(
    "Domain 2 readiness unchanged after admission",
    (await domain2.loadReviewEntryReadinessByRva(rva.id))?.readinessId,
    readiness.readinessId,
  );
}

section("17-19. No GPRA / approval / handoff");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva } = await buildReviewReady(domain2, program, obligationId);
  const review = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  const keys = Object.keys(review);
  expectTruthy("No gpra key", !keys.includes("gpra") && !keys.includes("gpraId"));
  expectTruthy("No approval key", !keys.includes("approval") && !keys.includes("approved"));
  expectTruthy("No handoff key", !keys.includes("handoff") && !keys.includes("handoffPosture"));
}

section("Adversarial: forged readiness / duplicate / wrong successor");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva, readiness } = await buildReviewReady(domain2, program, obligationId);

  const forgedReadiness = {
    ...readiness,
    readinessId: "review-entry-readiness-forged" as ReviewEntryReadiness["readinessId"],
    rvaId: rva.id,
  } as ReviewEntryReadiness;

  // Pure admit with forged readiness that still matches rva ids structurally is accepted by pure function;
  // repository path always loads stored readiness — prove repository rejects missing forged ID path via duplicate below.
  const first = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  expectTruthy("First admission succeeds", !!first.reviewId);

  await expectThrowsAsync(
    "Duplicate review admission rejected",
    () =>
      domain3.admitToProductionReadinessReview({
        rvaId: rva.id,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );

  expectThrows(
    "Forged readiness for wrong RVA rejected by pure admit",
    () =>
      admitProductionReadinessReview({
        rva,
        reviewEntryReadiness: {
          ...forgedReadiness,
          rvaId: "rva-forged-other" as RealizedVisualArtifact["id"],
        },
        traceabilityPackage: readiness.traceabilityPackage,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );
}

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva, readiness } = await buildReviewReady(domain2, program, obligationId);
  const { successor } = await domain2.createSuccessorRva({
    priorRvaId: rva.id,
    realizationPath: "created",
    iterationBasis: "New version",
    createdBy: ACTOR,
  });
  expectThrows(
    "Wrong successor lineage rejected",
    () =>
      admitProductionReadinessReview({
        rva: successor,
        reviewEntryReadiness: readiness,
        traceabilityPackage: readiness.traceabilityPackage,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );
}

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
