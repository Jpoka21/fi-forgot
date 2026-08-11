/**
 * ORCH-IMP-008 — STD-014 G4 Design-Time Feasibility integration.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-design-time-feasibility.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  declareProductionIntent,
  DESIGN_TIME_FEASIBILITY_DIMENSION_ID,
  determineExplorationEntry,
  draftProductionProgram,
  FROZEN_BINDING_FI_MFG_STANDARDS,
  governProductionProgram,
  isOrchestraConstitutionalError,
  listMandatoryReviewDimensionIds,
  MANUFACTURING_VALIDATION_DEFERRED,
  FULFILLMENT_EXECUTION_DEFERRED,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";
import { validatePersistedDesignTimeFeasibilityEvaluation } from "../orchestra/persistence/domain3-validation.js";
import { assertFrozenBindingManufacturingAuthority } from "../orchestra/manufacturing-authority.js";
import { createFrozenManufacturingAuthoritySource } from "../orchestra/manufacturing-authority.js";

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

const ACTOR = "governance-authority-008";

async function buildGovernedDomain1(withMfg = true): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G4 Design-Time Feasibility",
    governingConstraints: ["FI-DSN-STD-001"],
    declaredBy: ACTOR,
  });
  await domain1.persistIntent(intent);
  const brand = bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Brand limits",
    boundBy: ACTOR,
  });
  const bindings = [brand];
  if (withMfg) {
    bindings.push(
      bindComplianceBoundary({
        sourceStandardId: "FI-MFG-PRN-001",
        scopeDescription: "Real-pen production method at design time",
        boundBy: ACTOR,
      }),
      bindComplianceBoundary({
        sourceStandardId: "FI-MFG-CON-003",
        scopeDescription: "Vendor capability validation before assumed use",
        boundBy: ACTOR,
      }),
    );
  }
  let program = draftProductionProgram({
    intent,
    constitutionalPurpose: "G4 DTF scope",
    createdBy: ACTOR,
  });
  program = addObligationToProgram(program, {
    description: "Primary obligation",
    createdBy: ACTOR,
  });
  program = bindComplianceBoundariesToProgram(program, bindings);
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

async function admitReview(withMfg = true): Promise<{
  domain1: Domain1Repository;
  domain2: Domain2Repository;
  domain3: Domain3Repository;
  program: ProductionProgram;
  rva: RealizedVisualArtifact;
  review: ProductionReadinessReview;
}> {
  const { domain1, program, obligationId } = await buildGovernedDomain1(withMfg);
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

section("Frozen FI-MFG authority catalog");

{
  expect("Eight frozen binding FI-MFG standards", FROZEN_BINDING_FI_MFG_STANDARDS.length, 8);
  expectTruthy("Manufacturing Validation deferred marker", !!MANUFACTURING_VALIDATION_DEFERRED);
  expectTruthy("Fulfillment Execution deferred marker", !!FULFILLMENT_EXECUTION_DEFERRED);
  expectThrows(
    "Draft POL-003 rejected as frozen authority",
    () =>
      assertFrozenBindingManufacturingAuthority(
        createFrozenManufacturingAuthoritySource(),
        "FI-MFG-POL-003",
      ),
    "invalid_design_time_feasibility",
  );
  expectThrows(
    "Unknown manufacturing authority rejected",
    () =>
      assertFrozenBindingManufacturingAuthority(
        createFrozenManufacturingAuthoritySource(),
        "FI-MFG-FORGED-999",
      ),
    "invalid_design_time_feasibility",
  );
}

section("DTF requires under_review and uses design_time_feasibility");

{
  const { domain3, review, rva } = await admitReview();
  await expectThrowsAsync(
    "DTF against nonexistent review rejected",
    () =>
      domain3.recordDesignTimeFeasibilityEvaluation({
        reviewId:
          "production-readiness-review-00000000-0000-4000-8000-000000000099" as ProductionReadinessReview["reviewId"],
        evaluationMethodDescription: "Governed checklist against bound FI-MFG Compliance Boundaries",
        observations: [
          {
            kind: "compatibility_observation",
            text: "Artifact appears compatible with real-pen production constraints",
            relatedSourceStandardId: "FI-MFG-PRN-001",
          },
        ],
        affirmsDecisionStageWithoutManufacturingExecution: true,
        evaluatedBy: ACTOR,
      }),
    "invalid_review_activity",
  );

  const result = await domain3.recordDesignTimeFeasibilityEvaluation({
    reviewId: review.reviewId,
    evaluationMethodDescription: "Governed checklist against bound FI-MFG Compliance Boundaries",
    observations: [
      {
        kind: "compatibility_observation",
        text: "Artifact appears compatible with real-pen production constraints",
        relatedSourceStandardId: "FI-MFG-PRN-001",
      },
      {
        kind: "compatibility_observation",
        text: "Vendor capability constraints are acknowledged at design time",
        relatedSourceStandardId: "FI-MFG-CON-003",
      },
    ],
    affirmsDecisionStageWithoutManufacturingExecution: true,
    evaluatedBy: ACTOR,
  });

  expect("Uses existing DTF dimension", result.evaluation.dimensionId, DESIGN_TIME_FEASIBILITY_DIMENSION_ID);
  expect("Evidence under DTF dimension", result.evidence.dimensionId, "design_time_feasibility");
  expect("Evidence category matches dimension", result.evidence.evidenceCategoryId, "design_time_feasibility");
  expect("Evidence bound to review", result.evidence.reviewId, review.reviewId);
  expect("Evidence bound to RVA", result.evidence.rvaId, rva.id);
  expect("Activity bound to review", result.activity.reviewId, review.reviewId);
  expectTruthy(
    "Activity references persisted evidence",
    result.activity.evidenceIds.includes(result.evidence.evidenceId),
  );
  expect("Evaluation links same evidence", result.evaluation.evidenceIds[0], result.evidence.evidenceId);
  expect("Evaluation links activity", result.evaluation.activityId, result.activity.activityId);
  expect("Applicable FI-MFG-PRN-001 present", result.evaluation.applicableManufacturingBoundaries.some((b) => b.sourceStandardId === "FI-MFG-PRN-001"), true);
  expect("Applicable FI-MFG-CON-003 present", result.evaluation.applicableManufacturingBoundaries.some((b) => b.sourceStandardId === "FI-MFG-CON-003"), true);
  expect("No manufacturing validation performed", result.evaluation.manufacturingValidationNotPerformed, true);
  expect("No fulfillment execution performed", result.evaluation.fulfillmentExecutionNotPerformed, true);
  expect("Decision stage affirmed", result.evaluation.decisionStageAffirmed, true);
  expectTruthy("Method provenance preserved", result.evaluation.evaluationMethodDescription.includes("Governed checklist"));
  expectTruthy("Deep-freeze evaluation", Object.isFrozen(result.evaluation));
  expectTruthy("Deep-freeze evidence", Object.isFrozen(result.evidence));

  const history = await domain3.listReviewDimensionActivitiesByReview(review.reviewId);
  expectTruthy("DTF activity visible in G3 history", history.some((a) => a.activityId === result.activity.activityId));

  const reloaded = await domain3.loadProductionReadinessReview(review.reviewId);
  expect("Review remains under_review", reloaded?.posture, "under_review");
  expectTruthy("No determination on review", !("determination" in (reloaded as object)));
  expectTruthy("No gpra on review", !("gpra" in (reloaded as object)));
}

section("R26 absence of manufacturing does not waive; empty evidence rejected");

{
  const { domain3, review } = await admitReview(false);
  await expectThrowsAsync(
    "Empty applicable set without applicability_gap rejected",
    () =>
      domain3.recordDesignTimeFeasibilityEvaluation({
        reviewId: review.reviewId,
        evaluationMethodDescription: "Boundary scan",
        observations: [
          {
            kind: "compatibility_observation",
            text: "No manufacturing run occurred so DTF skipped",
          },
        ],
        affirmsDecisionStageWithoutManufacturingExecution: true,
        evaluatedBy: ACTOR,
      }),
    "invalid_design_time_feasibility",
  );

  const gap = await domain3.recordDesignTimeFeasibilityEvaluation({
    reviewId: review.reviewId,
    evaluationMethodDescription: "Decision-stage applicability scan without manufacturing execution",
    observations: [
      {
        kind: "applicability_gap",
        text: "No frozen FI-MFG Compliance Boundaries are bound on the Production Program; Design-Time Feasibility remains required at decision stage",
      },
    ],
    affirmsDecisionStageWithoutManufacturingExecution: true,
    evaluatedBy: ACTOR,
  });
  expect("Applicability gap recorded without waiver", gap.evaluation.applicableManufacturingBoundaries.length, 0);
  expectTruthy("R26 decision-stage still affirmed", gap.evaluation.decisionStageAffirmed);

  await expectThrowsAsync(
    "Empty observations rejected",
    () =>
      domain3.recordDesignTimeFeasibilityEvaluation({
        reviewId: review.reviewId,
        evaluationMethodDescription: "Method",
        observations: [],
        affirmsDecisionStageWithoutManufacturingExecution: true,
        evaluatedBy: ACTOR,
      }),
    "invalid_design_time_feasibility",
  );
}

section("Conflicts as evidence; no Determination language; completeness");

{
  const { domain3, review } = await admitReview();
  const conflict = await domain3.recordDesignTimeFeasibilityEvaluation({
    reviewId: review.reviewId,
    evaluationMethodDescription: "Independent governed review against FI-MFG constraints",
    observations: [
      {
        kind: "boundary_conflict",
        text: "Bound FI-MFG-CON-003 scope conflicts with assumed universal vendor capability",
        relatedSourceStandardId: "FI-MFG-CON-003",
      },
      {
        kind: "feasibility_concern",
        text: "Concern recorded for later constitutional outcome consideration",
        relatedSourceStandardId: "FI-MFG-PRN-001",
      },
    ],
    affirmsDecisionStageWithoutManufacturingExecution: true,
    evaluatedBy: ACTOR,
  });
  expectTruthy("Conflict recorded as observation", conflict.evaluation.observations.some((o) => o.kind === "boundary_conflict"));
  expectTruthy("No pass field", !("pass" in conflict.evaluation));
  expectTruthy("No fail field", !("fail" in conflict.evaluation));

  await expectThrowsAsync(
    "Determination language in method rejected",
    () =>
      domain3.recordDesignTimeFeasibilityEvaluation({
        reviewId: review.reviewId,
        evaluationMethodDescription: "This method grants GPRA",
        observations: [{ kind: "compatibility_observation", text: "ok" }],
        affirmsDecisionStageWithoutManufacturingExecution: true,
        evaluatedBy: ACTOR,
      }),
    "invalid_design_time_feasibility",
  );

  // Address remaining mandatory dimensions so completeness can become true
  for (const dimensionId of listMandatoryReviewDimensionIds().filter(
    (id) => id !== "design_time_feasibility",
  )) {
    await domain3.recordReviewDimensionActivity({
      reviewId: review.reviewId,
      dimensionId,
      sourceKind: "observation",
      sourceRecordId: `obs-${dimensionId}`,
      sourceSnapshot: JSON.stringify({ dimensionId }),
      observation: `address ${dimensionId}`,
      recordedBy: ACTOR,
    });
  }

  const complete = await domain3.evaluateMandatoryReviewActivityCompleteness(review.reviewId);
  expect("G3 completeness recognizes DTF activity", complete.allMandatoryDimensionsAddressed, true);
  expectTruthy("Completeness is not Determination", !("determination" in complete));
}

section("Append-only revisit; immutability; persistence validation");

{
  const { domain3, review } = await admitReview();
  const first = await domain3.recordDesignTimeFeasibilityEvaluation({
    reviewId: review.reviewId,
    evaluationMethodDescription: "First decision-stage review method",
    observations: [
      {
        kind: "compatibility_observation",
        text: "Initial design-time compatibility noted",
        relatedSourceStandardId: "FI-MFG-PRN-001",
      },
    ],
    affirmsDecisionStageWithoutManufacturingExecution: true,
    evaluatedBy: ACTOR,
  });
  const second = await domain3.recordDesignTimeFeasibilityEvaluation({
    reviewId: review.reviewId,
    evaluationMethodDescription: "Second decision-stage review method",
    observations: [
      {
        kind: "feasibility_concern",
        text: "Additional concern after further examination",
        relatedSourceStandardId: "FI-MFG-CON-003",
      },
    ],
    affirmsDecisionStageWithoutManufacturingExecution: true,
    evaluatedBy: "second-reviewer",
  });
  expectTruthy("Distinct evaluation ids", first.evaluation.evaluationId !== second.evaluation.evaluationId);
  expectTruthy("Distinct evidence ids", first.evidence.evidenceId !== second.evidence.evidenceId);

  const listed = await domain3.listDesignTimeFeasibilityEvaluationsByReview(review.reviewId);
  expect("Both evaluations retained", listed.length, 2);

  const loaded = await domain3.loadDesignTimeFeasibilityEvaluation(first.evaluation.evaluationId);
  expect("Historical evaluation immutable actor", loaded?.evaluatedBy, ACTOR);
  expectTruthy(
    "Snapshot includes first method",
    first.evidence.sourceSnapshot.includes("First decision-stage review method"),
  );

  expectThrows(
    "Invalid persisted DTF dimension rejected",
    () =>
      validatePersistedDesignTimeFeasibilityEvaluation({
        ...first.evaluation,
        dimensionId: "identity_and_character_compliance",
      }),
    "invalid_design_time_feasibility",
  );

  expectThrows(
    "Forged related manufacturing authority rejected at construction",
    () =>
      assertFrozenBindingManufacturingAuthority(
        createFrozenManufacturingAuthoritySource(),
        "FI-DSN-STD-001",
      ),
    "invalid_design_time_feasibility",
  );
}

section("No second DTF dimension; primary path is repository");

{
  expect(
    "Single DTF dimension id in mandatory set",
    listMandatoryReviewDimensionIds().filter((id) => id === "design_time_feasibility").length,
    1,
  );
}

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
