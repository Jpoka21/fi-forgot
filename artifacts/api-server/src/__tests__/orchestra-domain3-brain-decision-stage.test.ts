/**
 * ORCH-IMP — STD-014 G10 Brain and Decision-Stage Interaction (R73–R82).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-brain-decision-stage.test.ts
 */

import * as Orchestra from "../orchestra/index.js";
import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  declareProductionIntent,
  determineExplorationEntry,
  DOMAIN3_DECISION_STAGES,
  draftProductionProgram,
  evaluateGpraValidityFromPostureActs,
  GPRA_BRAIN_DECISION_STAGE_TRACEABILITY,
  governProductionProgram,
  isOrchestraConstitutionalError,
  listMandatoryReviewDimensionIds,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  rejectBrainDomain3ConstitutionalMutationAttempt,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";
import { rehydrateDomain3BrainAdvisory } from "../orchestra/persistence/domain3-rehydration.js";

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

const ACTOR = "governance-authority-014";
const MAGAC = "approval_authority_production_obligation_scope" as const;
const BRAIN_VERSION = "brain-runtime-g10-test-1.0";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G10 Brain Decision-Stage",
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
    constitutionalPurpose: "G10 brain advisory scope",
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
        evaluationMethodDescription: "Decision-stage DTF for G10",
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

async function grantPassGpra() {
  const ctx = await admitReview();
  await completeMandatoryActivity(ctx.domain3, ctx.review);
  const determined = await ctx.domain3.recordReviewDetermination({
    reviewId: ctx.review.reviewId,
    outcome: "pass",
    grounds: "Pass for G10",
    determinedBy: ACTOR,
  });
  await ctx.domain3.recordApprovalAct({
    reviewId: determined.review.reviewId,
    authorityClassId: MAGAC,
    approvedBy: ACTOR,
  });
  const gpra = await ctx.domain3.grantGpra({
    reviewId: determined.review.reviewId,
    grantedBy: ACTOR,
  });
  return {
    ...ctx,
    review: determined.review,
    determination: determined.determination,
    gpra,
  };
}

section("DSIB catalog and G10 traceability");

{
  expect("Ten DSIB stages", DOMAIN3_DECISION_STAGES.length, 10);
  expectTruthy(
    "G10 traceability includes R73",
    GPRA_BRAIN_DECISION_STAGE_TRACEABILITY.requirementIds.includes("FI-DSN-STD-014-R73"),
  );
  expectTruthy(
    "G10 traceability includes R82",
    GPRA_BRAIN_DECISION_STAGE_TRACEABILITY.requirementIds.includes("FI-DSN-STD-014-R82"),
  );
  expect(
    "createDomain3BrainAdvisoryRecord not on barrel",
    "createDomain3BrainAdvisoryRecord" in Orchestra,
    false,
  );
}

section("Lawful advisories at active_review / approval_consideration / retention");

{
  const ctx = await grantPassGpra();

  const activeCtx = await admitReview();
  const activeAdvisory = await activeCtx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: BRAIN_VERSION,
    decisionStage: "active_review",
    outputClass: "nonbinding_recommendation",
    reviewId: activeCtx.review.reviewId,
    advisoryContent: "Recommend reviewer attention to brand Compliance Boundary evidence",
  });
  expect("active_review advisory nonbinding", activeAdvisory.nonbinding, true);
  expect("active_review stage", activeAdvisory.decisionStage, "active_review");
  expect("active_review not authority", activeAdvisory.notConstitutionalAuthority, true);

  const approvalAdvisory = await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "writing_engine",
    brainRuntimeVersion: BRAIN_VERSION,
    decisionStage: "approval_consideration",
    outputClass: "evaluative_treatment",
    reviewId: ctx.review.reviewId,
    determinationId: ctx.determination.determinationId,
    advisoryContent: "Evaluative treatment of Pass Determination for MAGAC consideration",
  });
  expect("approval_consideration attribution", approvalAdvisory.sourceAttribution, "writing_engine");
  expect("approval_consideration class", approvalAdvisory.outputClass, "evaluative_treatment");

  const retentionAdvisory = await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: BRAIN_VERSION,
    decisionStage: "retention",
    outputClass: "inconsistency_detection_signal",
    reviewId: ctx.review.reviewId,
    gpraId: ctx.gpra.gpraId,
    postureState: "retention",
    advisoryContent: "No inconsistency detected against Retention posture",
  });
  expect("retention advisory posture", retentionAdvisory.postureState, "retention");
  expect("retention does not compel", retentionAdvisory.doesNotCompelConstitutionalAction, true);
}

section("Lawful reevaluation_request invalidation_review / supersession_review");

{
  const ctx = await grantPassGpra();
  const invalidationReq = await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: BRAIN_VERSION,
    decisionStage: "retention",
    outputClass: "nonbinding_reevaluation_request",
    reviewId: ctx.review.reviewId,
    gpraId: ctx.gpra.gpraId,
    postureState: "retention",
    reevaluationRequestType: "invalidation_review",
    routesToAuthorityKind: "ivac",
    advisoryContent: "Request IVAC consider invalidation review under IT-family signals",
  });
  expect("invalidation_review type", invalidationReq.reevaluationRequestType, "invalidation_review");
  expect("invalidation_review routes ivac", invalidationReq.routesToAuthorityKind, "ivac");
  expect("invalidation_review doesNotAuthorize", invalidationReq.doesNotAuthorize, true);

  const supersessionReq = await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: BRAIN_VERSION,
    decisionStage: "retention",
    outputClass: "nonbinding_reevaluation_request",
    reviewId: ctx.review.reviewId,
    gpraId: ctx.gpra.gpraId,
    postureState: "retention",
    reevaluationRequestType: "supersession_review",
    routesToAuthorityKind: "ssac",
    advisoryContent: "Request SSAC consider supersession review under ST-family signals",
  });
  expect("supersession_review type", supersessionReq.reevaluationRequestType, "supersession_review");
  expect("supersession_review routes ssac", supersessionReq.routesToAuthorityKind, "ssac");
}

section("Brain cannot claim Determination / Approval / GPRA (R74)");

{
  expectThrows(
    "reject record_review_determination",
    () => rejectBrainDomain3ConstitutionalMutationAttempt("record_review_determination"),
    "invalid_domain3_brain_advisory",
  );
  expectThrows(
    "reject perform_approval",
    () => rejectBrainDomain3ConstitutionalMutationAttempt("perform_approval"),
    "invalid_domain3_brain_advisory",
  );
  expectThrows(
    "reject grant_gpra",
    () => rejectBrainDomain3ConstitutionalMutationAttempt("grant_gpra"),
    "invalid_domain3_brain_advisory",
  );
  expectThrows(
    "reject establish_invalidated",
    () => rejectBrainDomain3ConstitutionalMutationAttempt("establish_invalidated"),
    "invalid_domain3_brain_advisory",
  );
  expectThrows(
    "reject perform_handoff",
    () => rejectBrainDomain3ConstitutionalMutationAttempt("perform_handoff"),
    "invalid_domain3_brain_advisory",
  );

  const ctx = await grantPassGpra();
  await expectThrowsAsync(
    "claims constitutionalAuthority rejected",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        sourceAttribution: "brain_runtime",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "retention",
        outputClass: "nonbinding_recommendation",
        reviewId: ctx.review.reviewId,
        advisoryContent: "Would-be authority claim",
        claimsConstitutionalAuthority: true,
      }),
    "invalid_domain3_brain_advisory",
  );
  await expectThrowsAsync(
    "overridesConstitutionalRecord rejected",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        sourceAttribution: "brain_runtime",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "retention",
        outputClass: "nonbinding_recommendation",
        reviewId: ctx.review.reviewId,
        advisoryContent: "Override claim",
        overridesConstitutionalRecord: true,
      }),
    "invalid_domain3_brain_advisory",
  );
  await expectThrowsAsync(
    "constitutionalActKind Determination rejected",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        sourceAttribution: "brain_runtime",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "active_review",
        outputClass: "nonbinding_recommendation",
        reviewId: ctx.review.reviewId,
        advisoryContent: "Emulation",
        constitutionalActKind: "review_determination",
      }),
    "invalid_domain3_brain_advisory",
  );
}

section("Wrong stage for output class rejected");

{
  const ctx = await admitReview();
  await expectThrowsAsync(
    "gpra_grant_consumed cannot emit recommendation",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        sourceAttribution: "brain_runtime",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "gpra_grant_consumed",
        outputClass: "nonbinding_recommendation",
        reviewId: ctx.review.reviewId,
        advisoryContent: "Illegal at grant-consumed stage",
      }),
    "invalid_domain3_brain_advisory",
  );
  await expectThrowsAsync(
    "pre_review cannot emit evaluative_treatment",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        sourceAttribution: "brain_runtime",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "pre_review",
        outputClass: "evaluative_treatment",
        programId: ctx.review.programId,
        obligationId: ctx.review.obligationId,
        rvaId: ctx.review.rvaId,
        advisoryContent: "Illegal evaluative at pre_review",
      }),
    "invalid_domain3_brain_advisory",
  );
  await expectThrowsAsync(
    "invalidation_review wrong route rejected",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        sourceAttribution: "brain_runtime",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "retention",
        outputClass: "nonbinding_reevaluation_request",
        reviewId: ctx.review.reviewId,
        reevaluationRequestType: "invalidation_review",
        routesToAuthorityKind: "magac",
        advisoryContent: "Wrong route",
      }),
    "invalid_domain3_brain_advisory",
  );
}

section("MAGAC / DDAC / IVAC / SSAC attribution rejected");

{
  const ctx = await admitReview();
  await expectThrowsAsync(
    "MAGAC-like attribution rejected",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        // @ts-expect-error intentional forbidden attribution
        sourceAttribution: "magac",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "active_review",
        outputClass: "routing_suggestion",
        reviewId: ctx.review.reviewId,
        advisoryContent: "Bad attribution",
      }),
    "invalid_domain3_brain_advisory",
  );
  await expectThrowsAsync(
    "human reviewer attribution rejected",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        // @ts-expect-error intentional forbidden attribution
        sourceAttribution: "human_reviewer",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "active_review",
        outputClass: "routing_suggestion",
        reviewId: ctx.review.reviewId,
        advisoryContent: "Bad attribution",
      }),
    "invalid_domain3_brain_advisory",
  );
  await expectThrowsAsync(
    "ddac attribution rejected",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        // @ts-expect-error intentional forbidden attribution
        sourceAttribution: "ddac",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "downstream_disposition",
        outputClass: "nonbinding_recommendation",
        reviewId: ctx.review.reviewId,
        advisoryContent: "Bad attribution",
      }),
    "invalid_domain3_brain_advisory",
  );
  await expectThrowsAsync(
    "ivac attribution rejected",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        // @ts-expect-error intentional forbidden attribution
        sourceAttribution: "ivac",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "retention",
        outputClass: "inconsistency_detection_signal",
        reviewId: ctx.review.reviewId,
        advisoryContent: "Bad attribution",
      }),
    "invalid_domain3_brain_advisory",
  );
  await expectThrowsAsync(
    "ssac attribution rejected",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        // @ts-expect-error intentional forbidden attribution
        sourceAttribution: "ssac",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "retention",
        outputClass: "inconsistency_detection_signal",
        reviewId: ctx.review.reviewId,
        advisoryContent: "Bad attribution",
      }),
    "invalid_domain3_brain_advisory",
  );
}

section("Persistence + load + rehydration");

{
  const ctx = await grantPassGpra();
  const recorded = await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: BRAIN_VERSION,
    decisionStage: "retention",
    outputClass: "evidence_consumption_analysis",
    reviewId: ctx.review.reviewId,
    gpraId: ctx.gpra.gpraId,
    postureState: "retention",
    advisoryContent: "Consumed Retention posture as fact",
  });
  const loaded = await ctx.domain3.loadDomain3BrainAdvisory(recorded.advisoryId);
  expectTruthy("load advisory", !!loaded);
  expect("loaded id", loaded!.advisoryId, recorded.advisoryId);
  expect("loaded content", loaded!.advisoryContent, "Consumed Retention posture as fact");

  const listed = await ctx.domain3.listDomain3BrainAdvisoriesByReview(ctx.review.reviewId);
  expectTruthy("list includes advisory", listed.some((a) => a.advisoryId === recorded.advisoryId));

  const rehydrated = rehydrateDomain3BrainAdvisory(structuredClone(recorded), {
    review: ctx.review,
    determination: ctx.determination,
    gpra: ctx.gpra,
  });
  expect("rehydrated id", rehydrated.advisoryId, recorded.advisoryId);
  expect("rehydrated distinguishable", rehydrated.distinguishableFromConstitutionalActs, true);
}

section("Foreign review linkage fails rehydration");

{
  const ctxA = await grantPassGpra();
  const ctxB = await grantPassGpra();
  const advisory = await ctxA.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: BRAIN_VERSION,
    decisionStage: "retention",
    outputClass: "routing_suggestion",
    reviewId: ctxA.review.reviewId,
    gpraId: ctxA.gpra.gpraId,
    advisoryContent: "Route attention within lineage A",
  });
  expectThrows(
    "foreign review rehydration rejected",
    () =>
      rehydrateDomain3BrainAdvisory(structuredClone(advisory), {
        review: ctxB.review,
        determination: ctxB.determination,
        gpra: ctxB.gpra,
      }),
    "invalid_domain3_brain_advisory",
  );
}

section("Advisory does not create Determination / Approval / GPRA");

{
  const ctx = await admitReview();
  const beforeDet = await ctx.domain3.loadReviewDeterminationByReview(ctx.review.reviewId);
  const beforeApproval = await ctx.domain3.loadApprovalActByReview(ctx.review.reviewId);
  const beforeGpra = await ctx.domain3.loadGpraGrantByReview(ctx.review.reviewId);

  await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: BRAIN_VERSION,
    decisionStage: "active_review",
    outputClass: "inconsistency_detection_signal",
    reviewId: ctx.review.reviewId,
    advisoryContent: "Signal only — no constitutional effect",
  });

  expect(
    "no Determination created",
    await ctx.domain3.loadReviewDeterminationByReview(ctx.review.reviewId),
    beforeDet,
  );
  expect(
    "no Approval created",
    await ctx.domain3.loadApprovalActByReview(ctx.review.reviewId),
    beforeApproval,
  );
  expect(
    "no GPRA created",
    await ctx.domain3.loadGpraGrantByReview(ctx.review.reviewId),
    beforeGpra,
  );
}

section("handoff_preparation advisory allowed; no handoff execution");

{
  const ctx = await grantPassGpra();
  const readiness = await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: BRAIN_VERSION,
    decisionStage: "handoff_preparation",
    outputClass: "routing_suggestion",
    reviewId: ctx.review.reviewId,
    gpraId: ctx.gpra.gpraId,
    postureState: "retention",
    advisoryContent: "Advisory export readiness signal only",
  });
  expect("handoff_preparation stage", readiness.decisionStage, "handoff_preparation");
  expectTruthy("no handoffActId on record", !("handoffActId" in readiness));

  await expectThrowsAsync(
    "handoff execution field rejected",
    () =>
      ctx.domain3.recordDomain3BrainAdvisory({
        sourceAttribution: "brain_runtime",
        brainRuntimeVersion: BRAIN_VERSION,
        decisionStage: "handoff_preparation",
        outputClass: "nonbinding_reevaluation_request",
        reviewId: ctx.review.reviewId,
        gpraId: ctx.gpra.gpraId,
        reevaluationRequestType: "handoff_eligibility_review",
        routesToAuthorityKind: "handoff_authority_boundary",
        advisoryContent: "Would execute handoff",
        executesHandoff: true,
      }),
    "invalid_domain3_brain_advisory",
  );
}

section("G8/G9 smoke — evaluateGpraValidity still works after advisory");

{
  const ctx = await grantPassGpra();
  await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: BRAIN_VERSION,
    decisionStage: "retention",
    outputClass: "evidence_consumption_analysis",
    reviewId: ctx.review.reviewId,
    gpraId: ctx.gpra.gpraId,
    postureState: "retention",
    advisoryContent: "Post-advisory validity smoke",
  });
  const validity = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId);
  expect("still Retention after advisory", validity.posture, "retention");
  expect("still forward active", validity.forwardActive, true);

  const fromPosture = evaluateGpraValidityFromPostureActs({
    gpraId: ctx.gpra.gpraId,
    invalidation: null,
    supersession: null,
  });
  expect("evaluateGpraValidityFromPostureActs Retention", fromPosture.posture, "retention");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const label of failures) {
    console.log(`  - ${label}`);
  }
  process.exit(1);
}
