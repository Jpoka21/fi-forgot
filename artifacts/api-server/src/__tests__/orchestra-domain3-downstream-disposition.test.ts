/**
 * ORCH-IMP-011 — STD-014 G7 Downstream Disposition (R44–R51).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-downstream-disposition.test.ts
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
  DOWNSTREAM_DISPOSITION_TRACEABILITY,
  FROZEN_ESTABLISHED_DOWNSTREAM_DISPOSITION_AUTHORITY_CLASSES,
  FROZEN_ROUTE_C_RETURN_AUTHORIZING_SOURCES,
  governProductionProgram,
  isOrchestraConstitutionalError,
  listMandatoryReviewDimensionIds,
  MANDATORY_GOVERNED_DEFICIENCY_FAMILIES,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";
import { createDomain3GovernedCreationMarker } from "../orchestra/domain3-entry.js";
import {
  rehydrateDownstreamDeficiencyRecord,
  rehydrateReworkAuthorization,
  rehydrateReturnPosture,
  rehydrateResubmissionEligibility,
} from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedReturnPosture } from "../orchestra/persistence/domain3-validation.js";

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

function section(name: string) {
  console.log(`\n${name}`);
}

const ACTOR = "governance-authority-011";
const DDAC = "downstream_disposition_authority_production_obligation_scope" as const;

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G7 disposition",
    governingConstraints: ["FI-DSN-STD-001"],
    declaredBy: ACTOR,
  });
  await domain1.persistIntent(intent);
  const brand = bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Brand limits",
    boundBy: ACTOR,
  });
  const mfg = bindComplianceBoundary({
    sourceStandardId: "FI-MFG-PRN-001",
    scopeDescription: "Real-pen production method",
    boundBy: ACTOR,
  });
  let program = draftProductionProgram({
    intent,
    constitutionalPurpose: "G7 disposition scope",
    createdBy: ACTOR,
  });
  program = addObligationToProgram(program, {
    description: "Primary obligation",
    createdBy: ACTOR,
  });
  program = bindComplianceBoundariesToProgram(program, [brand, mfg]);
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
  const domain3 = createDomain3Repository(domain2, undefined, domain1);
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
  await domain2.determineReviewEntryReadiness({ rvaId: rva.id, determinedBy: ACTOR });
  const review = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  return { domain1, domain2, domain3, program, rva, review };
}

async function completeMandatoryActivity(
  domain3: Domain3Repository,
  review: ProductionReadinessReview,
): Promise<void> {
  for (const dimensionId of listMandatoryReviewDimensionIds()) {
    if (dimensionId === "design_time_feasibility") {
      await domain3.recordDesignTimeFeasibilityEvaluation({
        reviewId: review.reviewId,
        evaluationMethodDescription: "Decision-stage DTF for G7",
        observations: [
          {
            kind: "compatibility_observation",
            text: "Compatible with FI-MFG-PRN-001",
            relatedSourceStandardId: "FI-MFG-PRN-001",
          },
        ],
        affirmsDecisionStageWithoutManufacturingExecution: true,
        evaluatedBy: ACTOR,
      });
      continue;
    }
    await domain3.recordReviewDimensionActivity({
      reviewId: review.reviewId,
      dimensionId: dimensionId as MandatoryReviewDimensionId,
      sourceKind: "observation",
      sourceRecordId: `obs-${dimensionId}`,
      sourceSnapshot: JSON.stringify({
        dimension: MANDATORY_REVIEW_DIMENSION_LABELS[dimensionId as MandatoryReviewDimensionId],
      }),
      observation: `addressed-${dimensionId}`,
      recordedBy: ACTOR,
    });
  }
}

async function completeOutcome(outcome: "conditional" | "fail" | "pass") {
  const ctx = await admitReview();
  await completeMandatoryActivity(ctx.domain3, ctx.review);
  const determined = await ctx.domain3.recordReviewDetermination({
    reviewId: ctx.review.reviewId,
    outcome,
    conditions: outcome === "conditional" ? ["Fix surface fit"] : undefined,
    grounds: `${outcome} for G7`,
    determinedBy: ACTOR,
  });
  return { ...ctx, review: determined.review, determination: determined.determination };
}

section("DDAC and EGDF catalogs");

{
  expect("Two DDAC classes", FROZEN_ESTABLISHED_DOWNSTREAM_DISPOSITION_AUTHORITY_CLASSES.length, 2);
  expect("Four EGDF families", MANDATORY_GOVERNED_DEFICIENCY_FAMILIES.length, 4);
  expect("Route C authorizing catalog empty", FROZEN_ROUTE_C_RETURN_AUTHORIZING_SOURCES.length, 0);
}

section("Illegal G7 entry — Pass without withholding");

{
  const ctx = await completeOutcome("pass");
  const eligibility = await ctx.domain3.evaluateDownstreamDispositionEligibility(
    ctx.review.reviewId,
  );
  expect("Pass not disposition eligible", eligibility.dispositionEligible, false);
  expect("Pass not rework eligible", eligibility.reworkAuthorizationEligible, false);
  await expectThrowsAsync(
    "Deficiency on Pass rejected",
    () =>
      ctx.domain3.recordDownstreamDeficiency({
        reviewId: ctx.review.reviewId,
        deficiencyFamily: "identity_compliance",
        grounds: "Should fail",
        authorityClassId: DDAC,
        recordedBy: ACTOR,
      }),
    "invalid_downstream_disposition",
  );
  await expectThrowsAsync(
    "Rework on Pass rejected",
    () =>
      ctx.domain3.authorizeRework({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        authorizedBy: ACTOR,
      }),
    "invalid_downstream_disposition",
  );
}

section("Conditional path — EGDF, DSRA, return, resubmission");

{
  const ctx = await completeOutcome("conditional");
  const eligibility = await ctx.domain3.evaluateDownstreamDispositionEligibility(
    ctx.review.reviewId,
  );
  expect("Conditional disposition eligible", eligibility.dispositionEligible, true);
  expect("Conditional rework eligible", eligibility.reworkAuthorizationEligible, true);
  expect("Route conditional", eligibility.route, "conditional_route");

  await expectThrowsAsync(
    "Forged DDAC class rejected",
    () =>
      ctx.domain3.recordDownstreamDeficiency({
        reviewId: ctx.review.reviewId,
        deficiencyFamily: "identity_compliance",
        grounds: "Identity issue",
        authorityClassId: "forged_ddac" as typeof DDAC,
        recordedBy: ACTOR,
      }),
    "invalid_downstream_disposition",
  );

  const deficiency = await ctx.domain3.recordDownstreamDeficiency({
    reviewId: ctx.review.reviewId,
    deficiencyFamily: "surface_fit",
    grounds: "Surface fit deficiency",
    authorityClassId: DDAC,
    recordedBy: ACTOR,
  });
  expect("EGDF family", deficiency.deficiencyFamily, "surface_fit");
  expect("Determination not revised", deficiency.determinationNotRevised, true);
  expect(
    "Prior Conditional preserved",
    (await ctx.domain3.loadReviewDeterminationByReview(ctx.review.reviewId))!.outcome,
    "conditional",
  );

  const rework = await ctx.domain3.authorizeRework({
    reviewId: ctx.review.reviewId,
    authorityClassId: DDAC,
    authorizedBy: ACTOR,
  });
  expect("Rework not Approval", rework.notApproval, true);
  expect("Rework not GPRA", rework.notGpra, true);
  expect("STD-013 iteration not performed", rework.std013IterationNotPerformed, true);

  await expectThrowsAsync(
    "Duplicate rework rejected",
    () =>
      ctx.domain3.authorizeRework({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        authorizedBy: ACTOR,
      }),
    "invalid_downstream_disposition",
  );

  const ret = await ctx.domain3.establishReturnPosture({
    reviewId: ctx.review.reviewId,
    authorityClassId: DDAC,
    establishedBy: ACTOR,
    targetObligationScope: "same_obligation",
  });
  expect("Correction return kind", ret.returnKind, "correction_return_to_realization");
  expect("Termination not authorized", ret.terminationNotAuthorized, true);

  const eligibilityAct = await ctx.domain3.authorizeResubmissionEligibility({
    reviewId: ctx.review.reviewId,
    authorityClassId: DDAC,
    authorizedBy: ACTOR,
  });
  expectTruthy("Resubmission eligibility id", !!eligibilityAct.eligibilityId);
  expect("Satisfied Conditional not recognized", eligibilityAct.satisfiedConditionalNotRecognized, true);

  const next = await ctx.domain3.admitToProductionReadinessReview({
    rvaId: ctx.rva.id,
    admittedBy: ACTOR,
  });
  expect("Subsequent Review links prior", next.priorReviewId, ctx.review.reviewId);
  expect("Subsequent Review links eligibility", next.resubmissionEligibilityId, eligibilityAct.eligibilityId);
  expect("Prior Conditional still Conditional", ctx.determination.outcome, "conditional");
}

section("Fail path");

{
  const ctx = await completeOutcome("fail");
  const eligibility = await ctx.domain3.evaluateDownstreamDispositionEligibility(
    ctx.review.reviewId,
  );
  expect("Fail disposition eligible", eligibility.dispositionEligible, true);
  expect("Route fail", eligibility.route, "fail_route");

  await expectThrowsAsync(
    "Re-admit after Fail without eligibility rejected",
    () => ctx.domain3.admitToProductionReadinessReview({ rvaId: ctx.rva.id, admittedBy: ACTOR }),
  );

  const withhold = await ctx.domain3.withholdReworkAuthorization({
    reviewId: ctx.review.reviewId,
    authorityClassId: DDAC,
    grounds: "Governing hold under DSRA",
    withheldBy: ACTOR,
  });
  expect("Rework withholding preserves Determination", withhold.determinationNotRevised, true);
  expect("DSRA governing source", withhold.governingSourceId, "PD-STD-014-009");

  await expectThrowsAsync(
    "Rework after withholding rejected",
    () =>
      ctx.domain3.authorizeRework({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        authorizedBy: ACTOR,
      }),
    "invalid_downstream_disposition",
  );

  const ret = await ctx.domain3.establishReturnPosture({
    reviewId: ctx.review.reviewId,
    authorityClassId: DDAC,
    establishedBy: ACTOR,
  });
  expect("Fail return kind", ret.returnKind, "rework_return_to_realization");

  await ctx.domain3.authorizeResubmissionEligibility({
    reviewId: ctx.review.reviewId,
    authorityClassId: DDAC,
    authorizedBy: ACTOR,
  });
  const next = await ctx.domain3.admitToProductionReadinessReview({
    rvaId: ctx.rva.id,
    admittedBy: ACTOR,
  });
  expectTruthy("Fail path subsequent Review admitted", next.posture === "under_review");
}

section("Approval withholding path (Route C) — block without return");

{
  const ctx = await completeOutcome("pass");
  const withholding = await ctx.domain3.withholdApproval({
    reviewId: ctx.review.reviewId,
    groundFamily: "authority_or_provenance_defects",
    grounds: "Authority defect",
    withheldBy: ACTOR,
  });
  const eligibility = await ctx.domain3.evaluateDownstreamDispositionEligibility(
    ctx.review.reviewId,
  );
  expect("Withholding blocks Approval only", eligibility.withholdingBlocksApprovalOnly, true);
  expect("Not EGDF eligible", eligibility.dispositionEligible, false);
  expect("Not rework eligible", eligibility.reworkAuthorizationEligible, false);
  expect("Route C return not eligible (dormant)", eligibility.returnPostureEligible, false);
  expect("Route C identity retained", eligibility.route, "withholding_return_only");
  expect(
    "Pass Determination preserved after withholding",
    (await ctx.domain3.loadReviewDeterminationByReview(ctx.review.reviewId))!.outcome,
    "pass",
  );
  expect(
    "G6 withholding unchanged",
    (await ctx.domain3.loadApprovalWithholdingByReview(ctx.review.reviewId))!.withholdingId,
    withholding.withholdingId,
  );

  await expectThrowsAsync(
    "EGDF from withholding path rejected",
    () =>
      ctx.domain3.recordDownstreamDeficiency({
        reviewId: ctx.review.reviewId,
        deficiencyFamily: "identity_compliance",
        grounds: "Should fail",
        authorityClassId: DDAC,
        recordedBy: ACTOR,
      }),
    "invalid_downstream_disposition",
  );

  await expectThrowsAsync(
    "DSRA from withholding path rejected",
    () =>
      ctx.domain3.authorizeRework({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        authorizedBy: ACTOR,
      }),
    "invalid_downstream_disposition",
  );

  await expectThrowsAsync(
    "Return after withholding alone rejected",
    () =>
      ctx.domain3.establishReturnPosture({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        establishedBy: ACTOR,
      }),
    "invalid_downstream_disposition",
  );

  await expectThrowsAsync(
    "Empty returnGoverningSourceId cannot authorize Route C",
    () =>
      ctx.domain3.establishReturnPosture({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        establishedBy: ACTOR,
        returnGoverningSourceId: "",
      }),
    "invalid_downstream_disposition",
  );

  await expectThrowsAsync(
    "Arbitrary string cannot authorize Route C",
    () =>
      ctx.domain3.establishReturnPosture({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        establishedBy: ACTOR,
        returnGoverningSourceId: "made-up-authority",
      }),
    "invalid_downstream_disposition",
  );

  await expectThrowsAsync(
    "Fabricated PD-STD identifier cannot authorize Route C",
    () =>
      ctx.domain3.establishReturnPosture({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        establishedBy: ACTOR,
        returnGoverningSourceId: "PD-STD-999-999",
      }),
    "invalid_downstream_disposition",
  );

  await expectThrowsAsync(
    "PD-STD-014-010 alone cannot authorize Route C",
    () =>
      ctx.domain3.establishReturnPosture({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        establishedBy: ACTOR,
        returnGoverningSourceId: "PD-STD-014-010",
      }),
    "invalid_downstream_disposition",
  );

  await expectThrowsAsync(
    "Actor assertion cannot authorize Route C",
    () =>
      ctx.domain3.establishReturnPosture({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        establishedBy: "actor-claims-route-c-return",
        returnGoverningSourceId: "actor-asserted-return-ground",
      }),
    "invalid_downstream_disposition",
  );

  await expectThrowsAsync(
    "Workflow or Brain markers cannot authorize Route C",
    () =>
      ctx.domain3.establishReturnPosture({
        reviewId: ctx.review.reviewId,
        authorityClassId: DDAC,
        establishedBy: ACTOR,
        returnGoverningSourceId: "brain_workflow_queue_return_authorization",
      }),
    "invalid_downstream_disposition",
  );

  // Forged persisted Route C records must not survive validation / trusted rehydration.
  const now = new Date().toISOString();
  const forgedRouteC = {
    returnPostureId: "return-posture-forged-route-c",
    reviewId: ctx.review.reviewId,
    determinationId: ctx.determination.determinationId,
    rvaId: ctx.review.rvaId,
    programId: ctx.review.programId,
    obligationId: ctx.review.obligationId,
    route: "withholding_return_only" as const,
    returnKind: "return_authorized_after_approval_withholding" as const,
    targetObligationScope: null,
    approvalWithholdingId: withholding.withholdingId,
    returnGoverningSourceId: "made-up-authority",
    authorityClassId: DDAC,
    establishedAt: now,
    establishedBy: ACTOR,
    determinationNotRevised: true as const,
    terminationNotAuthorized: true as const,
    audit: {
      createdAt: now,
      createdBy: ACTOR,
      traceability: { requirementIds: ["FI-DSN-STD-012-R40"] },
    },
    traceability: DOWNSTREAM_DISPOSITION_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  };

  expectThrows(
    "Persisted Route C with arbitrary source fails validation",
    () => validatePersistedReturnPosture(structuredClone(forgedRouteC)),
    "invalid_downstream_disposition",
  );

  expectThrows(
    "Persisted Route C with arbitrary source fails rehydration",
    () =>
      rehydrateReturnPosture(structuredClone(forgedRouteC), {
        review: ctx.review,
        determination: ctx.determination,
        approvalWithholding: withholding,
      }),
    "invalid_downstream_disposition",
  );

  const forgedPd010 = {
    ...forgedRouteC,
    returnPostureId: "return-posture-forged-pd010",
    returnGoverningSourceId: "PD-STD-014-010",
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  };
  expectThrows(
    "Persisted Route C using only PD-STD-014-010 fails validation",
    () => validatePersistedReturnPosture(structuredClone(forgedPd010)),
    "invalid_downstream_disposition",
  );
  expectThrows(
    "Persisted Route C using only PD-STD-014-010 fails rehydration",
    () =>
      rehydrateReturnPosture(structuredClone(forgedPd010), {
        review: ctx.review,
        determination: ctx.determination,
        approvalWithholding: withholding,
      }),
    "invalid_downstream_disposition",
  );

  const gpraBefore = await ctx.domain3.loadGpraGrantByRvaObligation({
    rvaId: ctx.rva.id,
    obligationId: ctx.review.obligationId,
  });
  expect("No GPRA created or altered on withholding path", gpraBefore, null);
}

section("GPRA / Pass path isolation");

{
  const ctx = await completeOutcome("pass");
  await ctx.domain3.recordApprovalAct({
    reviewId: ctx.review.reviewId,
    authorityClassId: "approval_authority_production_obligation_scope",
    approvedBy: ACTOR,
  });
  const gpra = await ctx.domain3.grantGpra({ reviewId: ctx.review.reviewId, grantedBy: ACTOR });
  expectTruthy("GPRA exists", !!gpra.gpraId);
  const eligibility = await ctx.domain3.evaluateDownstreamDispositionEligibility(
    ctx.review.reviewId,
  );
  expect("GPRA path not G7 disposition", eligibility.dispositionEligible, false);
  // Re-admit after Pass does not require G7 eligibility
  const next = await ctx.domain3.admitToProductionReadinessReview({
    rvaId: ctx.rva.id,
    admittedBy: ACTOR,
  });
  expect("Pass re-admit has no prior G7 linkage", next.priorReviewId, null);
}

section("Persistence / rehydration / immutability");

{
  const ctx = await completeOutcome("conditional");
  const deficiency = await ctx.domain3.recordDownstreamDeficiency({
    reviewId: ctx.review.reviewId,
    deficiencyFamily: "design_time_feasibility",
    grounds: "DTF deficiency",
    authorityClassId: DDAC,
    recordedBy: ACTOR,
  });
  const rework = await ctx.domain3.authorizeRework({
    reviewId: ctx.review.reviewId,
    authorityClassId: DDAC,
    authorizedBy: ACTOR,
  });
  const ret = await ctx.domain3.establishReturnPosture({
    reviewId: ctx.review.reviewId,
    authorityClassId: DDAC,
    establishedBy: ACTOR,
  });
  const elig = await ctx.domain3.authorizeResubmissionEligibility({
    reviewId: ctx.review.reviewId,
    authorityClassId: DDAC,
    authorizedBy: ACTOR,
  });

  const loadedDef = await ctx.domain3.loadDownstreamDeficiencyRecord(deficiency.deficiencyRecordId);
  expectTruthy("Load deficiency", !!loadedDef);
  const frozen = rehydrateDownstreamDeficiencyRecord(structuredClone(deficiency), {
    review: ctx.review,
    determination: ctx.determination,
  });
  expectThrows("Deficiency immutable", () => {
    (frozen as { grounds: string }).grounds = "mutated";
  });

  const frozenRework = rehydrateReworkAuthorization(structuredClone(rework), {
    review: ctx.review,
    determination: ctx.determination,
  });
  expectThrows("Rework immutable", () => {
    (frozenRework as { authorizedBy: string }).authorizedBy = "mutated";
  });

  const frozenRet = rehydrateReturnPosture(structuredClone(ret), {
    review: ctx.review,
    determination: ctx.determination,
    approvalWithholding: null,
  });
  expectThrows("Return immutable", () => {
    (frozenRet as { establishedBy: string }).establishedBy = "mutated";
  });

  const frozenElig = rehydrateResubmissionEligibility(structuredClone(elig), {
    review: ctx.review,
    determination: ctx.determination,
  });
  expectThrows("Eligibility immutable", () => {
    (frozenElig as { authorizedBy: string }).authorizedBy = "mutated";
  });

  expectThrows(
    "Rehydrate rejects Conditional deficiency with Fail determination",
    () =>
      rehydrateDownstreamDeficiencyRecord(structuredClone(deficiency), {
        review: ctx.review,
        determination: {
          ...ctx.determination,
          outcome: "fail",
          conditions: Object.freeze([]),
        },
      }),
    "invalid_downstream_disposition",
  );
}

section("G8 boundary");

{
  const ctx = await completeOutcome("fail");
  const keys = Object.keys(
    await ctx.domain3.recordDownstreamDeficiency({
      reviewId: ctx.review.reviewId,
      deficiencyFamily: "contextual_obligations",
      grounds: "Context",
      authorityClassId: DDAC,
      recordedBy: ACTOR,
    }),
  );
  expectTruthy(
    "No revocation/invalidation fields",
    !keys.includes("revocation") && !keys.includes("invalidated") && !keys.includes("suspension"),
  );
}

console.log(`\nG7 Downstream Disposition: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
