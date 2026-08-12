/**
 * ORCH-IMP-009 — STD-014 G5 Review Determination Outcomes (R27–R33).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-review-determination.test.ts
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
  listMandatoryReviewDimensionIds,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  reviewDeterminationConstitutesApprovalOrGpra,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
  type ReviewDeterminationRecord,
} from "../orchestra/index.js";
import { createDomain3RepositoryWithStorage } from "../orchestra/persistence/domain3-repository.js";
import { createInMemoryDomain3Storage } from "../orchestra/persistence/domain3-in-memory-storage.js";
import {
  rehydrateReviewDetermination,
  rehydrateProductionReadinessReview,
} from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedReviewDetermination } from "../orchestra/persistence/domain3-validation.js";

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
    console.log(`    expected: ${JSON.stringify(expected)}`);
    console.log(`    actual:   ${JSON.stringify(actual)}`);
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
      console.log(`  ✗ ${label} (wrong code: ${(error as { code?: string }).code})`);
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
      console.log(`  ✗ ${label} (wrong code: ${(error as { code?: string }).code})`);
    }
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

const ACTOR = "governance-authority-009";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G5 review determination",
    governingConstraints: ["FI-DSN-STD-001"],
    declaredBy: ACTOR,
  });
  await domain1.persistIntent(intent);
  const brand = bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Brand limits",
    boundBy: ACTOR,
  });
  const mfgPrn = bindComplianceBoundary({
    sourceStandardId: "FI-MFG-PRN-001",
    scopeDescription: "Real-pen production method at design time",
    boundBy: ACTOR,
  });
  let program = draftProductionProgram({
    intent,
    constitutionalPurpose: "G5 determination scope",
    createdBy: ACTOR,
  });
  program = addObligationToProgram(program, {
    description: "Primary obligation",
    createdBy: ACTOR,
  });
  program = bindComplianceBoundariesToProgram(program, [brand, mfgPrn]);
  program = governProductionProgram(program);
  await domain1.persistProgram(program);
  await domain1.persistExplorationDetermination(
    determineExplorationEntry({
      program,
      posture: "exploration_entry_authorized",
      governingBasis: "Exploration authorized",
      determinedBy: ACTOR,
    }),
  );
  return { domain1, program, obligationId: program.obligations[0]!.id };
}

async function admitReview(): Promise<{
  domain1: Domain1Repository;
  domain2: Domain2Repository;
  domain3: Domain3Repository;
  program: ProductionProgram;
  rva: RealizedVisualArtifact;
  review: ProductionReadinessReview;
}> {
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
  const rva = await domain2.promoteRvaToExists({
    rvaId: candidate.id,
    basis: "Exists",
    promotedBy: ACTOR,
  });
  await domain2.determineReviewEntryReadiness({
    rvaId: rva.id,
    determinedBy: ACTOR,
  });
  const review = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  return { domain1, domain2, domain3, program, rva, review };
}

async function addressDimension(
  domain3: Domain3Repository,
  review: ProductionReadinessReview,
  dimensionId: MandatoryReviewDimensionId,
  note: string,
) {
  return domain3.recordReviewDimensionActivity({
    reviewId: review.reviewId,
    dimensionId,
    sourceKind: "observation",
    sourceRecordId: `obs-${dimensionId}-${note}`,
    sourceSnapshot: JSON.stringify({
      dimension: MANDATORY_REVIEW_DIMENSION_LABELS[dimensionId],
      note,
      rvaId: review.rvaId,
    }),
    observation: note,
    recordedBy: ACTOR,
  });
}

async function completeMandatoryActivity(
  domain3: Domain3Repository,
  review: ProductionReadinessReview,
): Promise<void> {
  for (const dimensionId of listMandatoryReviewDimensionIds()) {
    if (dimensionId === "design_time_feasibility") {
      await domain3.recordDesignTimeFeasibilityEvaluation({
        reviewId: review.reviewId,
        evaluationMethodDescription: "Decision-stage DTF observation for G5",
        observations: [
          {
            kind: "compatibility_observation",
            text: "Compatible with bound FI-MFG-PRN-001 at decision stage",
            relatedSourceStandardId: "FI-MFG-PRN-001",
          },
        ],
        affirmsDecisionStageWithoutManufacturingExecution: true,
        evaluatedBy: ACTOR,
      });
      continue;
    }
    await addressDimension(domain3, review, dimensionId, `addressed-${dimensionId}`);
  }
}

section("Illegal premature Determination (R27 / R30)");

{
  const { domain3, review } = await admitReview();
  await expectThrowsAsync(
    "Determination without mandatory evidence rejected",
    () =>
      domain3.recordReviewDetermination({
        reviewId: review.reviewId,
        outcome: "pass",
        grounds: "Attempted Pass without evidence",
        determinedBy: ACTOR,
      }),
    "invalid_review_determination",
  );

  await addressDimension(domain3, review, "identity_and_character_compliance", "partial");
  await expectThrowsAsync(
    "Incomplete evidence does not constitute Conditional",
    () =>
      domain3.recordReviewDetermination({
        reviewId: review.reviewId,
        outcome: "conditional",
        conditions: ["Missing dimensions"],
        grounds: "Incomplete should not become Conditional",
        determinedBy: ACTOR,
      }),
    "invalid_review_determination",
  );
}

section("Lawful Pass Determination (R27–R30, R33)");

{
  const { domain2, domain3, review, rva } = await admitReview();
  await completeMandatoryActivity(domain3, review);

  const beforeEvidence = await domain3.listReviewEvidenceByReview(review.reviewId);
  const beforeActivities = await domain3.listReviewDimensionActivitiesByReview(review.reviewId);
  expectTruthy("Evidence exists before Determination", beforeEvidence.length > 0);

  const result = await domain3.recordReviewDetermination({
    reviewId: review.reviewId,
    outcome: "pass",
    grounds: "All mandatory dimensions addressed with governed evidence",
    determinedBy: ACTOR,
  });

  expect("Outcome is pass", result.determination.outcome, "pass");
  expect("Review posture review_determined", result.review.posture, "review_determined");
  expect(
    "Review linked to Determination",
    result.review.determinationId,
    result.determination.determinationId,
  );
  expect("Determination RVA matches Review", result.determination.rvaId, review.rvaId);
  expect("Empty conditions on Pass", result.determination.conditions.length, 0);
  expectTruthy(
    "Evidence basis non-empty",
    result.determination.evidenceBasisIds.length === beforeEvidence.length,
  );
  expectTruthy(
    "Activity basis non-empty",
    result.determination.activityBasisIds.length === beforeActivities.length,
  );
  expect(
    "Pass is not Approval/GPRA",
    reviewDeterminationConstitutesApprovalOrGpra(result.determination),
    false,
  );

  const keys = Object.keys(result.determination as object);
  expectTruthy("No approval/gpra/grant fields", !keys.includes("approval") && !keys.includes("gpra") && !keys.includes("grant"));

  const active = await domain3.loadActiveProductionReadinessReviewByRva(rva.id);
  expect("activeByRva cleared after Determination", active, null);

  const afterEvidence = await domain3.listReviewEvidenceByReview(review.reviewId);
  expect("G3 evidence preserved", afterEvidence.length, beforeEvidence.length);
  expect("First evidence id unchanged", afterEvidence[0]!.evidenceId, beforeEvidence[0]!.evidenceId);

  const afterDtf = await domain3.listDesignTimeFeasibilityEvaluationsByReview(review.reviewId);
  expectTruthy("G4 DTF preserved", afterDtf.length >= 1);

  const afterRva = await domain2.loadRva(rva.id);
  expect("Domain 2 RVA unchanged", afterRva?.posture, "rva_exists");

  await expectThrowsAsync(
    "Further G3 activity rejected after Determination",
    () =>
      domain3.recordReviewDimensionActivity({
        reviewId: review.reviewId,
        dimensionId: "identity_and_character_compliance",
        sourceKind: "observation",
        sourceRecordId: "late",
        sourceSnapshot: "late",
        observation: "late",
        recordedBy: ACTOR,
      }),
    "invalid_review_activity",
  );

  await expectThrowsAsync(
    "Repeated Determination rejected (R27)",
    () =>
      domain3.recordReviewDetermination({
        reviewId: review.reviewId,
        outcome: "fail",
        grounds: "Second determination illegal",
        determinedBy: ACTOR,
      }),
    "invalid_review_determination",
  );
}

section("Conditional and Fail outcomes (R28–R31)");

{
  const conditionalCtx = await admitReview();
  await completeMandatoryActivity(conditionalCtx.domain3, conditionalCtx.review);

  await expectThrowsAsync(
    "Conditional without conditions rejected",
    () =>
      conditionalCtx.domain3.recordReviewDetermination({
        reviewId: conditionalCtx.review.reviewId,
        outcome: "conditional",
        grounds: "Missing conditions",
        determinedBy: ACTOR,
      }),
    "invalid_review_determination",
  );

  const conditional = await conditionalCtx.domain3.recordReviewDetermination({
    reviewId: conditionalCtx.review.reviewId,
    outcome: "conditional",
    conditions: ["Documented remediable condition A"],
    grounds: "Bounded conditions recorded; not Approval-eligible",
    determinedBy: ACTOR,
  });
  expect("Conditional outcome", conditional.determination.outcome, "conditional");
  expect("Conditions recorded", conditional.determination.conditions.length, 1);
  expect("Conditional completes Review", conditional.review.posture, "review_determined");

  const failCtx = await admitReview();
  await completeMandatoryActivity(failCtx.domain3, failCtx.review);

  await expectThrowsAsync(
    "Fail with Conditional conditions rejected",
    () =>
      failCtx.domain3.recordReviewDetermination({
        reviewId: failCtx.review.reviewId,
        outcome: "fail",
        conditions: ["Should not appear on Fail"],
        grounds: "Documented fail grounds",
        determinedBy: ACTOR,
      }),
    "invalid_review_determination",
  );

  const failedDet = await failCtx.domain3.recordReviewDetermination({
    reviewId: failCtx.review.reviewId,
    outcome: "fail",
    grounds: "Failed Review Determination on documented grounds",
    determinedBy: ACTOR,
  });
  expect("Fail outcome", failedDet.determination.outcome, "fail");
  expect("Fail does not invalidate RVA", (await failCtx.domain2.loadRva(failCtx.rva.id))?.posture, "rva_exists");
  expect(
    "Fail is not Approval/GPRA",
    reviewDeterminationConstitutesApprovalOrGpra(failedDet.determination),
    false,
  );
}

section("Illegal outcome values (R28)");

{
  const { domain3, review } = await admitReview();
  await completeMandatoryActivity(domain3, review);
  await expectThrowsAsync(
    "Fourth outcome rejected",
    () =>
      domain3.recordReviewDetermination({
        reviewId: review.reviewId,
        outcome: "satisfied_conditional" as "pass",
        grounds: "Illegal fourth outcome",
        determinedBy: ACTOR,
      }),
    "invalid_review_determination",
  );
}

section("Subsequent Review after Conditional requires unused resubmission eligibility (R32/R51)");

{
  const { domain2, domain3, review, rva } = await admitReview();
  await completeMandatoryActivity(domain3, review);
  await domain3.recordReviewDetermination({
    reviewId: review.reviewId,
    outcome: "conditional",
    conditions: ["Condition requiring subsequent Review"],
    grounds: "Conditional completed",
    determinedBy: ACTOR,
  });

  expect(
    "No active review after Conditional",
    await domain3.loadActiveProductionReadinessReviewByRva(rva.id),
    null,
  );

  await expectThrowsAsync(
    "Subsequent Review without resubmission eligibility is rejected",
    () =>
      domain3.admitToProductionReadinessReview({
        rvaId: rva.id,
        admittedBy: ACTOR,
      }),
    "invalid_downstream_disposition",
  );

  const eligibility = await domain3.authorizeResubmissionEligibility({
    reviewId: review.reviewId,
    authorityClassId: "downstream_disposition_authority_production_obligation_scope",
    authorizedBy: ACTOR,
  });

  // Same RVA may re-enter G2 after prior Review completed (R32) when R51 eligibility is unused.
  const subsequent = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  expect("Subsequent Review under_review", subsequent.posture, "under_review");
  expect("Subsequent Review distinct identity", subsequent.reviewId !== review.reviewId, true);
  expect("Subsequent Review links prior Review", subsequent.priorReviewId, review.reviewId);
  expect(
    "Subsequent Review consumes eligibility",
    subsequent.resubmissionEligibilityId,
    eligibility.eligibilityId,
  );
  expect("Prior Determination preserved", (await domain3.loadReviewDeterminationByReview(review.reviewId))?.outcome, "conditional");
  expect("Domain 2 RVA still exists", (await domain2.loadRva(rva.id))?.posture, "rva_exists");
}

section("Persistence, rehydration, adversarial validation");

{
  const storage = createInMemoryDomain3Storage();
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3RepositoryWithStorage(domain2, storage);

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
  const rva = await domain2.promoteRvaToExists({
    rvaId: candidate.id,
    basis: "Exists",
    promotedBy: ACTOR,
  });
  await domain2.determineReviewEntryReadiness({
    rvaId: rva.id,
    determinedBy: ACTOR,
  });
  const review = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  await completeMandatoryActivity(domain3, review);
  const recorded = await domain3.recordReviewDetermination({
    reviewId: review.reviewId,
    outcome: "pass",
    grounds: "Persisted Pass",
    determinedBy: ACTOR,
  });

  const loaded = await domain3.loadReviewDetermination(recorded.determination.determinationId);
  expect("Load by id", loaded?.determinationId, recorded.determination.determinationId);

  const rehydrated = rehydrateReviewDetermination(structuredClone(recorded.determination));
  expect("Rehydrate outcome", rehydrated.outcome, "pass");
  expectThrows(
    "Mutating rehydrated determination rejected",
    () => {
      (rehydrated as { outcome: string }).outcome = "fail";
    },
  );

  expectThrows(
    "Unknown outcome rejected on rehydrate",
    () =>
      rehydrateReviewDetermination({
        ...recorded.determination,
        outcome: "approved",
      }),
    "invalid_review_determination",
  );

  expectThrows(
    "Forged Review ID rejected",
    () =>
      validatePersistedReviewDetermination({
        ...recorded.determination,
        reviewId: "not-a-production-readiness-review",
      }),
    "invalid_domain3_persistence_state",
  );

  expectThrows(
    "Missing evidence basis rejected",
    () =>
      validatePersistedReviewDetermination({
        ...recorded.determination,
        evidenceBasisIds: [],
      }),
    "invalid_review_determination",
  );

  expectThrows(
    "Conditional without conditions rejected on rehydrate",
    () =>
      rehydrateReviewDetermination({
        ...recorded.determination,
        outcome: "conditional",
        conditions: [],
      }),
    "invalid_review_determination",
  );

  expectThrows(
    "review_determined without determinationId rejected",
    () =>
      rehydrateProductionReadinessReview({
        ...recorded.review,
        determinationId: null,
      }),
    "invalid_review_determination",
  );

  expectThrows(
    "under_review with determinationId rejected",
    () =>
      rehydrateProductionReadinessReview({
        ...recorded.review,
        posture: "under_review",
        determinationId: recorded.determination.determinationId,
      }),
    "invalid_review_determination",
  );

  const evidenceForeign = {
    ...recorded.determination,
    evidenceBasisIds: ["review-evidence-00000000-0000-4000-8000-000000000001"],
  };
  // Structure validates (IDs well-formed); foreign ownership is enforced at record time.
  validatePersistedReviewDetermination(evidenceForeign as unknown as ReviewDeterminationRecord);
  expectTruthy("Well-formed forged evidence id passes structural validation", true);
}

section("G6 boundary — Determination is not Approval/GPRA");

{
  const { domain3, review } = await admitReview();
  await completeMandatoryActivity(domain3, review);
  const { determination, review: completed } = await domain3.recordReviewDetermination({
    reviewId: review.reviewId,
    outcome: "pass",
    grounds: "Pass for Approval consideration eligibility only",
    determinedBy: ACTOR,
  });

  expectTruthy("No grant field", !("grant" in determination));
  expectTruthy("No deny field", !("deny" in determination));
  expectTruthy("No handoff field", !("handoff" in determination));
  expectTruthy("No productionAuthorization", !("productionAuthorization" in determination));
  expect("Eligibility still review_entry_eligible only", completed.eligibilityStatus, "review_entry_eligible");
  expect("Posture is review_determined not approved", completed.posture, "review_determined");
}

console.log(`\nG5 Review Determination: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
