/**
 * ORCH-IMP-007 — STD-014 G3 Review activity and mandatory dimensions.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-review-activity.test.ts
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
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";
import { validatePersistedReviewDimensionActivity } from "../orchestra/persistence/domain3-validation.js";
import {
  createReviewDimensionActivityRecord,
  createReviewEvidenceRecord,
} from "../orchestra/review-activity.js";

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

const ACTOR = "governance-authority-007";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G3 review activity",
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
    constitutionalPurpose: "G3 review scope",
    createdBy: ACTOR,
  });
  program = addObligationToProgram(program, {
    description: "Primary obligation",
    createdBy: ACTOR,
  });
  program = bindComplianceBoundariesToProgram(program, [boundary]);
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
      entryReadinessId: review.domain2EntryEvidence.reviewEntryReadinessId,
    }),
    observation: note,
    recordedBy: ACTOR,
  });
}

section("G3 activity requires existing under_review review");

{
  const { domain3 } = await admitReview();
  await expectThrowsAsync(
    "Activity against nonexistent review rejected",
    () =>
      domain3.recordReviewDimensionActivity({
        reviewId: "production-readiness-review-00000000-0000-4000-8000-000000000001" as ProductionReadinessReview["reviewId"],
        dimensionId: "identity_and_character_compliance",
        sourceKind: "observation",
        sourceRecordId: "obs-1",
        sourceSnapshot: "snapshot",
        observation: "note",
        recordedBy: ACTOR,
      }),
    "invalid_review_activity",
  );
}

section("Mandatory dimensions accepted; unknown rejected");

{
  const { domain3, review, rva } = await admitReview();
  const entryEvidenceBefore = structuredClone(review.domain2EntryEvidence);

  for (const dimensionId of listMandatoryReviewDimensionIds()) {
    const result = await addressDimension(domain3, review, dimensionId, `address-${dimensionId}`);
    expect(`Dimension ${dimensionId} accepted`, result.activity.dimensionId, dimensionId);
    expect(`Evidence bound to review`, result.evidence.reviewId, review.reviewId);
    expect(`Evidence bound to RVA`, result.evidence.rvaId, rva.id);
    expectTruthy(`Audit actor preserved ${dimensionId}`, result.activity.audit.createdBy === ACTOR);
    expectTruthy(
      `G3 traceability ${dimensionId}`,
      result.activity.traceability.requirementIds.includes("FI-DSN-STD-014-R14"),
    );
  }

  await expectThrowsAsync(
    "Unknown dimension rejected",
    () =>
      domain3.recordReviewDimensionActivity({
        reviewId: review.reviewId,
        dimensionId: "aesthetic_preference" as MandatoryReviewDimensionId,
        sourceKind: "observation",
        sourceRecordId: "bad",
        sourceSnapshot: "bad",
        observation: "bad",
        recordedBy: ACTOR,
      }),
    "invalid_review_activity",
  );

  const reloaded = await domain3.loadProductionReadinessReview(review.reviewId);
  expect("Review remains under_review", reloaded?.posture, "under_review");
  expect(
    "G2 entry evidence unchanged",
    reloaded?.domain2EntryEvidence.reviewEntryReadinessId,
    entryEvidenceBefore.reviewEntryReadinessId,
  );
  expect(
    "G2 package id unchanged",
    reloaded?.domain2EntryEvidence.traceabilityPackageId,
    entryEvidenceBefore.traceabilityPackageId,
  );
}

section("Evidence binding, append-only history, completeness");

{
  const { domain3, review, domain2, rva } = await admitReview();

  const incomplete = await domain3.evaluateMandatoryReviewActivityCompleteness(review.reviewId);
  expect("Completeness false before activity", incomplete.allMandatoryDimensionsAddressed, false);
  expect("Missing all four initially", incomplete.missingDimensionIds.length, 4);

  const first = await addressDimension(
    domain3,
    review,
    "identity_and_character_compliance",
    "first-pass",
  );
  const second = await addressDimension(
    domain3,
    review,
    "identity_and_character_compliance",
    "second-pass",
  );
  expectTruthy("Append-only distinct activity ids", first.activity.activityId !== second.activity.activityId);
  expectTruthy("Append-only distinct evidence ids", first.evidence.evidenceId !== second.evidence.evidenceId);

  const activities = await domain3.listReviewDimensionActivitiesByReview(review.reviewId);
  expect("Identity dimension history preserved", activities.length, 2);

  const stillIncomplete = await domain3.evaluateMandatoryReviewActivityCompleteness(review.reviewId);
  expect(
    "Completeness false when required dimensions missing",
    stillIncomplete.allMandatoryDimensionsAddressed,
    false,
  );

  for (const dimensionId of listMandatoryReviewDimensionIds().filter(
    (id) => id !== "identity_and_character_compliance",
  )) {
    await addressDimension(domain3, review, dimensionId, `complete-${dimensionId}`);
  }

  const complete = await domain3.evaluateMandatoryReviewActivityCompleteness(review.reviewId);
  expect("Completeness true after all mandatory dimensions", complete.allMandatoryDimensionsAddressed, true);
  expect("No missing dimensions", complete.missingDimensionIds.length, 0);
  expectTruthy("No determination field", !("determination" in complete));
  expectTruthy("No GPRA field", !("gpra" in complete));
  expectTruthy("No approval field", !("approval" in complete));

  const keys = Object.keys(await domain3.loadProductionReadinessReview(review.reviewId) as object);
  expectTruthy("No gpra on review", !keys.includes("gpra") && !keys.includes("approval"));

  const afterRva = await domain2.loadRva(rva.id);
  expect("Domain 2 RVA unchanged", afterRva?.posture, "rva_exists");
}

section("Wrong review / forged evidence / deep freeze / persistence");

{
  const first = await admitReview();
  const second = await admitReview();

  const forged = createReviewEvidenceRecord({
    review: second.review,
    dimensionId: "surface_and_spatial_fit",
    sourceKind: "observation",
    sourceRecordId: "foreign",
    sourceSnapshot: "foreign-snapshot",
    capturedBy: ACTOR,
  });

  expectThrows(
    "Evidence from another review rejected by activity construction",
    () =>
      createReviewEvidenceRecord({
        review: first.review,
        dimensionId: "surface_and_spatial_fit",
        sourceKind: "forged_category" as "observation",
        sourceRecordId: "x",
        sourceSnapshot: "y",
        capturedBy: ACTOR,
      }),
    "invalid_review_activity",
  );

  // Cross-review evidence cannot be attached via repository path (constructs its own evidence).
  expectThrows(
    "Foreign evidence rejected for activity",
    () =>
      createReviewDimensionActivityRecord({
        review: first.review,
        dimensionId: "surface_and_spatial_fit",
        evidence: [forged],
        observation: "cross",
        addressedBy: ACTOR,
      }),
    "invalid_review_activity",
  );

  const recorded = await first.domain3.recordReviewDimensionActivity({
    reviewId: first.review.reviewId,
    dimensionId: "design_time_feasibility",
    sourceKind: "compliance_boundary",
    sourceRecordId: "FI-MFG-STD-PLACEHOLDER",
    sourceSnapshot: JSON.stringify({ feasibility: "compatible-at-design-time" }),
    observation: "DTF foundation evidence",
    recordedBy: ACTOR,
  });

  expectTruthy("Persisted activity deep-frozen", Object.isFrozen(recorded.activity));
  expectTruthy("Persisted evidence deep-frozen", Object.isFrozen(recorded.evidence));
  expectTruthy("Evidence ids frozen", Object.isFrozen(recorded.activity.evidenceIds));

  const loaded = await first.domain3.loadReviewDimensionActivity(recorded.activity.activityId);
  expect("Activity round-trips", loaded?.activityId, recorded.activity.activityId);
  expectTruthy("Loaded activity nested frozen", Object.isFrozen(loaded?.audit));

  try {
    (loaded!.audit as { createdBy: string }).createdBy = "mutator";
  } catch {
    // strict freeze may throw
  }
  const reloaded = await first.domain3.loadReviewDimensionActivity(recorded.activity.activityId);
  expect("Nested mutation does not alter storage", reloaded?.audit.createdBy, ACTOR);

  expectThrows(
    "Invalid persisted dimension rejected",
    () =>
      validatePersistedReviewDimensionActivity({
        ...recorded.activity,
        dimensionId: "not_a_dimension",
      }),
    "invalid_review_activity",
  );

  expectThrows(
    "Invalid persisted reviewId rejected",
    () =>
      validatePersistedReviewDimensionActivity({
        ...recorded.activity,
        reviewId: "bad-review-id",
      }),
    "invalid_domain3_persistence_state",
  );
}

section("Adversarial: duplicate evidence path / malformed source");

{
  const { domain3, review } = await admitReview();
  await expectThrowsAsync(
    "Empty observation rejected",
    () =>
      domain3.recordReviewDimensionActivity({
        reviewId: review.reviewId,
        dimensionId: "contextual_and_personalization_obligations",
        sourceKind: "observation",
        sourceRecordId: "obs",
        sourceSnapshot: "snap",
        observation: "   ",
        recordedBy: ACTOR,
      }),
    "invalid_review_activity",
  );

  await expectThrowsAsync(
    "Empty snapshot rejected",
    () =>
      domain3.recordReviewDimensionActivity({
        reviewId: review.reviewId,
        dimensionId: "contextual_and_personalization_obligations",
        sourceKind: "observation",
        sourceRecordId: "obs",
        sourceSnapshot: " ",
        observation: "ok",
        recordedBy: ACTOR,
      }),
    "invalid_review_activity",
  );

  const a = await addressDimension(
    domain3,
    review,
    "contextual_and_personalization_obligations",
    "reviewer-a",
  );
  const b = await addressDimension(
    domain3,
    review,
    "contextual_and_personalization_obligations",
    "reviewer-b",
  );
  expectTruthy("Multiple reviewers preserve history", a.activity.activityId !== b.activity.activityId);

  const completeness = await domain3.evaluateMandatoryReviewActivityCompleteness(review.reviewId);
  expectTruthy(
    "Completeness is not GPRA authority",
    completeness.allMandatoryDimensionsAddressed === false && !("gpraGranted" in completeness),
  );
}

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
