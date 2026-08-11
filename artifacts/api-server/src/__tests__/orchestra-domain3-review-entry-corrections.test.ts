/**
 * ORCH-IMP-006.2 — Domain 3 G2 review-entry boundary corrections.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-review-entry-corrections.test.ts
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
  type ProductionProgram,
  type RealizedVisualArtifact,
  type ReviewEntryReadiness,
} from "../orchestra/index.js";
import { createInMemoryDomain3Storage } from "../orchestra/persistence/domain3-in-memory-storage.js";
import { createDomain3RepositoryWithStorage } from "../orchestra/persistence/domain3-repository.js";
import { validatePersistedProductionReadinessReview } from "../orchestra/persistence/domain3-validation.js";
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
      console.log(`  ✗ ${label} (wrong code)`);
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

const ACTOR = "governance-authority-006-2";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G2 boundary corrections",
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
    constitutionalPurpose: "Review entry correction scope",
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

function attemptNestedMutation(target: object, key: string, value: unknown): boolean {
  try {
    (target as Record<string, unknown>)[key] = value;
    return (target as Record<string, unknown>)[key] === value;
  } catch {
    return false;
  }
}

section("BC-ORCH-016 deep freeze / nested immutability");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva, readiness } = await buildReviewReady(domain2, program, obligationId);
  const review = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });

  expectTruthy("Review object frozen", Object.isFrozen(review));
  expectTruthy("Entry evidence frozen", Object.isFrozen(review.domain2EntryEvidence));
  expectTruthy("Lineage frozen", Object.isFrozen(review.domain2EntryEvidence.lineage));
  expectTruthy("Audit frozen", Object.isFrozen(review.audit));
  expectTruthy("Traceability frozen", Object.isFrozen(review.traceability));
  expectTruthy(
    "Traceability requirementIds frozen",
    Object.isFrozen(review.traceability.requirementIds),
  );

  const evidenceMutated = attemptNestedMutation(
    review.domain2EntryEvidence as object,
    "rvaId",
    "rva-mutated",
  );
  const lineageMutated = attemptNestedMutation(
    review.domain2EntryEvidence.lineage as object,
    "versionSequence",
    999,
  );
  const auditMutated = attemptNestedMutation(review.audit as object, "createdBy", "forged-actor");
  const traceMutated = attemptNestedMutation(
    review.traceability as object,
    "governingStandardId",
    "FI-DSN-STD-999",
  );

  expect("Nested entry evidence mutation blocked", evidenceMutated, false);
  expect("Nested lineage mutation blocked", lineageMutated, false);
  expect("Nested audit mutation blocked", auditMutated, false);
  expect("Nested traceability mutation blocked", traceMutated, false);

  const reloaded = await domain3.loadProductionReadinessReview(review.reviewId);
  expect("Stored evidence rvaId unchanged", reloaded?.domain2EntryEvidence.rvaId, rva.id);
  expect(
    "Stored readiness id unchanged",
    reloaded?.domain2EntryEvidence.reviewEntryReadinessId,
    readiness.readinessId,
  );
  expect("Stored audit actor unchanged", reloaded?.audit.createdBy, ACTOR);
  expect("Stored Domain 3 standard unchanged", reloaded?.traceability.governingStandardId, "FI-DSN-STD-014");
}

section("BC-ORCH-017 live CB blocking after readiness");

async function assertBlockingConsequenceRejects(
  consequence: "rework_required" | "successor_required" | "invalidation_required",
): Promise<void> {
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva } = await buildReviewReady(domain2, program, obligationId);
  await domain2.recordComplianceBoundaryChange({
    rvaId: rva.id,
    complianceBoundarySourceStandardId: "FI-DSN-STD-001",
    materiality: "material",
    consequence,
    changeBasis: `Post-readiness ${consequence}`,
    recordedBy: ACTOR,
  });
  await expectThrowsAsync(
    `${consequence} after readiness rejects admission`,
    () =>
      domain3.admitToProductionReadinessReview({
        rvaId: rva.id,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );
  const readinessStillPresent = await domain2.loadReviewEntryReadinessByRva(rva.id);
  expectTruthy(
    `${consequence}: Domain 2 readiness record retained (not mutated)`,
    !!readinessStillPresent,
  );
}

await assertBlockingConsequenceRejects("rework_required");
await assertBlockingConsequenceRejects("successor_required");
await assertBlockingConsequenceRejects("invalidation_required");

section("BC-ORCH-017 CB binding drift + fresh successor readiness");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva } = await buildReviewReady(domain2, program, obligationId);

  const loadedProgram = await domain1.loadProgram(program.id);
  expectTruthy("Program loaded for CB drift", !!loadedProgram);
  const extraBoundary = bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-002",
    scopeDescription: "Additional surface limits",
    boundBy: ACTOR,
  });
  const drifted = bindComplianceBoundariesToProgram(loadedProgram!, [
    ...loadedProgram!.complianceBoundaries,
    extraBoundary,
  ]);
  await domain1.persistProgram(drifted);

  await expectThrowsAsync(
    "CB binding drift after readiness rejects admission",
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

  await domain2.recordComplianceBoundaryChange({
    rvaId: rva.id,
    complianceBoundarySourceStandardId: "FI-DSN-STD-001",
    materiality: "material",
    consequence: "successor_required",
    changeBasis: "Requires successor after readiness",
    recordedBy: ACTOR,
  });

  await expectThrowsAsync(
    "Stale readiness blocked before successor resolution",
    () =>
      domain3.admitToProductionReadinessReview({
        rvaId: rva.id,
        admittedBy: ACTOR,
      }),
    "invalid_review_entry_eligibility",
  );

  const { successor } = await domain2.createSuccessorRva({
    priorRvaId: rva.id,
    realizationPath: "created",
    iterationBasis: "Resolve successor_required",
    createdBy: ACTOR,
  });
  const existsSuccessor = await domain2.promoteRvaToExists({
    rvaId: successor.id,
    basis: "Successor exists",
    promotedBy: ACTOR,
  });
  const freshReadiness = await domain2.determineReviewEntryReadiness({
    rvaId: existsSuccessor.id,
    determinedBy: ACTOR,
  });
  const admitted = await domain3.admitToProductionReadinessReview({
    rvaId: existsSuccessor.id,
    admittedBy: ACTOR,
  });
  expectTruthy("Fresh successor readiness admits", !!admitted.reviewId);
  expect("Fresh readiness bound", admitted.domain2EntryEvidence.reviewEntryReadinessId, freshReadiness.readinessId);
  expect("Successor RVA bound", admitted.rvaId, existsSuccessor.id);
}

section("BC-ORCH-018 persisted evidence validation");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const { rva, readiness } = await buildReviewReady(domain2, program, obligationId);
  const valid = admitProductionReadinessReview({
    rva,
    reviewEntryReadiness: readiness,
    traceabilityPackage: readiness.traceabilityPackage,
    admittedBy: ACTOR,
  });

  expectThrows(
    "evidence.rvaId mismatch rejected",
    () =>
      validatePersistedProductionReadinessReview({
        ...valid,
        domain2EntryEvidence: {
          ...valid.domain2EntryEvidence,
          rvaId: "rva-00000000-0000-4000-8000-000000000099",
        },
      }),
    "invalid_review_entry_eligibility",
  );

  expectThrows(
    "invalid programId rejected",
    () =>
      validatePersistedProductionReadinessReview({
        ...valid,
        programId: "not-a-program",
        domain2EntryEvidence: {
          ...valid.domain2EntryEvidence,
          programId: "not-a-program",
        },
      }),
    "invalid_domain3_persistence_state",
  );

  expectThrows(
    "invalid obligationId rejected",
    () =>
      validatePersistedProductionReadinessReview({
        ...valid,
        obligationId: "not-an-obligation",
        domain2EntryEvidence: {
          ...valid.domain2EntryEvidence,
          obligationId: "not-an-obligation",
        },
      }),
    "invalid_domain3_persistence_state",
  );

  expectThrows(
    "malformed lineage rejected",
    () =>
      validatePersistedProductionReadinessReview({
        ...valid,
        domain2EntryEvidence: {
          ...valid.domain2EntryEvidence,
          lineage: {
            rootRvaId: valid.rvaId,
            versionSequence: 0,
            priorVersionId: null,
          },
        },
      }),
    "invalid_domain3_persistence_state",
  );

  expectThrows(
    "invalid realizationPath rejected",
    () =>
      validatePersistedProductionReadinessReview({
        ...valid,
        domain2EntryEvidence: {
          ...valid.domain2EntryEvidence,
          realizationPath: "invented_path",
        },
      }),
    "invalid_review_entry_eligibility",
  );

  expectThrows(
    "malformed Domain 3 traceability rejected",
    () =>
      validatePersistedProductionReadinessReview({
        ...valid,
        traceability: {
          governingStandardId: "FI-DSN-STD-013",
          governingStandardVersion: "1.0",
          domainClassification: "CLS-CPR",
          architecturalDomain: "Domain 3",
          requirementIds: ["FI-DSN-STD-014-R08"],
        },
      }),
    "invalid_domain3_persistence_state",
  );

  validatePersistedProductionReadinessReview(valid);
  expectTruthy("Valid review record still validates", true);

  const storage = createInMemoryDomain3Storage();
  const domain3 = createDomain3RepositoryWithStorage(
    {
      assertReviewEntryReadinessCurrentForAdmission: async () => {
        throw new Error("not used");
      },
    },
    storage,
  );
  await storage.putProductionReadinessReview(valid);
  const roundTrip = await domain3.loadProductionReadinessReview(valid.reviewId);
  expect("Valid review round-trips", roundTrip?.reviewId, valid.reviewId);
  expect("Round-trip posture", roundTrip?.posture, "under_review");
  expectTruthy("Round-trip deeply frozen", Object.isFrozen(roundTrip?.domain2EntryEvidence));
}

section("Unchanged Domain 2 + BC-ORCH-019 audit provenance");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2);
  const { rva, readiness } = await buildReviewReady(domain2, program, obligationId);
  const beforeReadiness = structuredClone(readiness);
  const review = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  const afterReadiness = await domain2.loadReviewEntryReadinessByRva(rva.id);
  expect("Domain 2 readiness unchanged by admission", afterReadiness?.readinessId, beforeReadiness.readinessId);
  expect("Domain 2 RVA still exists", (await domain2.loadRva(rva.id))?.posture, "rva_exists");
  expect(
    "Primary Domain 3 G2 traceability on review",
    review.traceability.governingStandardId,
    "FI-DSN-STD-014",
  );
  expectTruthy(
    "G2 requirement IDs present",
    review.traceability.requirementIds.includes("FI-DSN-STD-014-R08"),
  );
  expect(
    "Upstream STD-012-R40 retained on audit",
    review.audit.traceability.requirementIds.includes("FI-DSN-STD-012-R40"),
    true,
  );
}

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
