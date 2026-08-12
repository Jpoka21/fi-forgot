/**
 * ORCH-IMP-014 — STD-014 G11 Governed Handoff Preparation (R83–R95).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-preparation.test.ts
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
  evaluateGpraValidityFromPostureActs,
  GOVERNED_HANDOFF_PREPARATION_TRACEABILITY,
  governProductionProgram,
  HANDOFF_CONSUMER_CATEGORY_KEYS,
  HANDOFF_ELIGIBILITY_LAYER_CONDITIONS,
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
import { rehydrateGovernedHandoffPreparation } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffPreparation } from "../orchestra/persistence/domain3-validation.js";

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

function section(name: string) {
  console.log(`\n${name}`);
}

const ACTOR = "governance-authority-014";
const MAGAC = "approval_authority_production_obligation_scope" as const;
const SSAC = "supersession_authority_production_obligation_scope" as const;
const IVAC = "invalidation_authority_production_obligation_scope" as const;
const HANDOFF_CTX = "handoff-consumer-context-opaque-001";
const CONSUMER_KEYS = ["manufacturing", "fulfillment"] as const;

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G11 Handoff Preparation",
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
    constitutionalPurpose: "G11 handoff preparation scope",
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

async function admitReviewOnProgram(
  domain1: Domain1Repository,
  program: ProductionProgram,
  obligationId: ProductionProgram["obligations"][number]["id"],
): Promise<{
  domain2: Domain2Repository;
  domain3: Domain3Repository;
  rva: RealizedVisualArtifact;
  review: ProductionReadinessReview;
}> {
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
  return { domain2, domain3, rva, review };
}

async function completeMandatoryActivity(
  domain3: Domain3Repository,
  review: ProductionReadinessReview,
): Promise<void> {
  for (const dimensionId of listMandatoryReviewDimensionIds()) {
    if (dimensionId === "design_time_feasibility") {
      await domain3.recordDesignTimeFeasibilityEvaluation({
        reviewId: review.reviewId,
        evaluationMethodDescription: "Decision-stage DTF for G11",
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
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const ctx = await admitReviewOnProgram(domain1, program, obligationId);
  await completeMandatoryActivity(ctx.domain3, ctx.review);
  const determined = await ctx.domain3.recordReviewDetermination({
    reviewId: ctx.review.reviewId,
    outcome: "pass",
    grounds: "Pass for G11",
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
    domain1,
    program,
    obligationId,
    ...ctx,
    review: determined.review,
    determination: determined.determination,
    gpra,
  };
}

async function prepareSuccessorPassReady(ctx: Awaited<ReturnType<typeof grantPassGpra>>) {
  const { successor } = await ctx.domain2.createSuccessorRva({
    priorRvaId: ctx.rva.id,
    realizationPath: "created",
    iterationBasis: "ST-1 succession successor RVA",
    createdBy: ACTOR,
  });
  const successorExists = await ctx.domain2.promoteRvaToExists({
    rvaId: successor.id,
    basis: "Successor exists",
    promotedBy: ACTOR,
  });
  await ctx.domain2.determineReviewEntryReadiness({
    rvaId: successorExists.id,
    determinedBy: ACTOR,
  });
  const review = await ctx.domain3.admitToProductionReadinessReview({
    rvaId: successorExists.id,
    admittedBy: ACTOR,
  });
  await completeMandatoryActivity(ctx.domain3, review);
  const determined = await ctx.domain3.recordReviewDetermination({
    reviewId: review.reviewId,
    outcome: "pass",
    grounds: "Pass successor for G11 ST-1",
    determinedBy: ACTOR,
  });
  await ctx.domain3.recordApprovalAct({
    reviewId: determined.review.reviewId,
    authorityClassId: MAGAC,
    approvedBy: ACTOR,
  });
  return {
    successorRva: successorExists,
    successorReview: determined.review,
    successorDetermination: determined.determination,
  };
}

section("HCBM / HSLM catalogs and G11 traceability");

{
  expect("Seven HCBM keys", HANDOFF_CONSUMER_CATEGORY_KEYS.length, 7);
  expect("Three HSLM conditions", HANDOFF_ELIGIBILITY_LAYER_CONDITIONS.length, 3);
  expectTruthy(
    "G11 traceability includes R83",
    GOVERNED_HANDOFF_PREPARATION_TRACEABILITY.requirementIds.includes("FI-DSN-STD-014-R83"),
  );
  expectTruthy(
    "G11 traceability includes R95",
    GOVERNED_HANDOFF_PREPARATION_TRACEABILITY.requirementIds.includes("FI-DSN-STD-014-R95"),
  );
}

section("createGovernedHandoffPreparationRecord not on barrel");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffPreparationRecord not on barrel",
    "createGovernedHandoffPreparationRecord" in mod,
    false,
  );
  expect(
    "assessGovernedHandoffEligibility on barrel",
    "assessGovernedHandoffEligibility" in mod,
    true,
  );
  expect(
    "HANDOFF_CONSUMER_CATEGORY_KEYS on barrel",
    "HANDOFF_CONSUMER_CATEGORY_KEYS" in mod,
    true,
  );
}

section("Lawful prepare with Retention authoritative GPRA → export_ready");

{
  const ctx = await grantPassGpra();
  const assessment = await ctx.domain3.evaluateGovernedHandoffEligibility({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
  });
  expect("assessment export_ready", assessment.eligibilityLayerCondition, "export_ready");
  expect("assessment not authorization", assessment.notHandoffAuthorization, true);
  expect("assessment not execution", assessment.notHandoffExecution, true);

  const prep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  expect("prep export_ready", prep.eligibilityLayerCondition, "export_ready");
  expect("prep gpraId", prep.gpraId, ctx.gpra.gpraId);
  expect("prep forward eligibility", prep.forwardHandoffEligibility, true);
  expect("prep std015 boundary only", prep.std015ConsumptionBoundaryOnly, true);
  expect("prep not mfg/fulfillment auth", prep.doesNotAuthorizeManufacturingOrFulfillment, true);
  expectTruthy("prep id prefix", prep.preparationId.startsWith("governed-handoff-preparation-"));
  expect("validity posture retention", prep.validityExport.evaluationPoint.posture, "retention");
  expectTruthy("no handoffActId", !("handoffActId" in prep));

  const loaded = await ctx.domain3.loadGovernedHandoffPreparation(prep.preparationId);
  expect("load matches id", loaded?.preparationId, prep.preparationId);

  const listed = await ctx.domain3.listGovernedHandoffPreparationsByGpra(ctx.gpra.gpraId);
  expect("list length 1", listed.length, 1);

  const currency = await ctx.domain3.evaluateHandoffPreparationCurrency(prep.preparationId);
  expect("currency current", currency, "current");
}

section("Missing / no authoritative → not_export_ready / prepare reject");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const ctx = await admitReviewOnProgram(domain1, program, obligationId);
  // Review admitted but no Determination / Approval / GPRA — not export_ready

  const assessment = await ctx.domain3.evaluateGovernedHandoffEligibility({
    obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
  });
  expect("no GPRA → not_export_ready", assessment.eligibilityLayerCondition, "not_export_ready");

  await expectThrowsAsync(
    "prepare rejects not_export_ready",
    () =>
      ctx.domain3.prepareGovernedHandoff({
        obligationId,
        handoffConsumerContextId: HANDOFF_CTX,
        consumerCategoryKeys: [...CONSUMER_KEYS],
        preparedBy: ACTOR,
      }),
    "invalid_handoff_preparation",
  );
}

section("Invalidated GPRA → blocked / prepare reject");

{
  const ctx = await grantPassGpra();
  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Material CB change renders GPRA-bound RVA non-compliant",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });

  const assessment = await ctx.domain3.evaluateGovernedHandoffEligibility({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
  });
  expect("invalidated → blocked", assessment.eligibilityLayerCondition, "blocked");

  await expectThrowsAsync(
    "prepare rejects blocked after invalidation",
    () =>
      ctx.domain3.prepareGovernedHandoff({
        obligationId: ctx.obligationId,
        handoffConsumerContextId: HANDOFF_CTX,
        consumerCategoryKeys: [...CONSUMER_KEYS],
        preparedBy: ACTOR,
      }),
    "invalid_handoff_preparation",
  );
}

section("Superseded predecessor → blocked; successor Retention can prepare");

{
  const ctx = await grantPassGpra();
  const successorReady = await prepareSuccessorPassReady(ctx);
  const successorGpra = await ctx.domain3.grantGpra({
    reviewId: successorReady.successorReview.reviewId,
    grantedBy: ACTOR,
    st1Supersession: {
      predecessorGpraId: ctx.gpra.gpraId,
      handoffConsumerContextId: HANDOFF_CTX,
      authorityClassId: SSAC,
      supersededBy: ACTOR,
      triggeringGoverningSourceId: "FI-DSN-STD-014",
      constitutionalEvidence: "ST-1 replacement GPRA grant succession",
    },
  });

  const predValidity = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId, HANDOFF_CTX);
  expect("predecessor superseded", predValidity.posture, "superseded");

  // After supersession, authoritative is successor — export_ready on successor
  const assessment = await ctx.domain3.evaluateGovernedHandoffEligibility({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
  });
  expect("successor context export_ready", assessment.eligibilityLayerCondition, "export_ready");
  expect("authoritative is successor", assessment.gpraId, successorGpra.gpraId);

  const prep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  expect("prep binds successor", prep.gpraId, successorGpra.gpraId);
}

section("Wrong consumer category reject");

{
  const ctx = await grantPassGpra();
  await expectThrowsAsync(
    "invented consumer category rejected",
    () =>
      ctx.domain3.prepareGovernedHandoff({
        obligationId: ctx.obligationId,
        handoffConsumerContextId: HANDOFF_CTX,
        consumerCategoryKeys: ["warehouse_routing" as "manufacturing"],
        preparedBy: ACTOR,
      }),
    "invalid_handoff_preparation",
  );
}

section("Brain advisory nonauthority — optional cite OK; Brain cannot mint preparation");

{
  const ctx = await grantPassGpra();
  const advisory = await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: "brain-1.0.0",
    decisionStage: "handoff_preparation",
    outputClass: "nonbinding_recommendation",
    reviewId: ctx.review.reviewId,
    gpraId: ctx.gpra.gpraId,
    postureState: "retention",
    advisoryContent: "Optional readiness signal for handoff consideration",
  });

  const prep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
    brainAdvisoryIds: [advisory.advisoryId],
  });
  expect("brain advisory cited", prep.brainAdvisoryIds[0], advisory.advisoryId);
  expect("still not handoff auth", prep.notHandoffAuthorization, true);

  await expectThrowsAsync(
    "brain_runtime sourceAttribution rejected on prepare",
    () =>
      ctx.domain3.prepareGovernedHandoff({
        obligationId: ctx.obligationId,
        handoffConsumerContextId: HANDOFF_CTX,
        consumerCategoryKeys: [...CONSUMER_KEYS],
        preparedBy: ACTOR,
        sourceAttribution: "brain_runtime",
      }),
    "invalid_handoff_preparation",
  );

  await expectThrowsAsync(
    "preparedBy brain_runtime rejected",
    () =>
      ctx.domain3.prepareGovernedHandoff({
        obligationId: ctx.obligationId,
        handoffConsumerContextId: HANDOFF_CTX,
        consumerCategoryKeys: [...CONSUMER_KEYS],
        preparedBy: "brain_runtime",
      }),
    "invalid_handoff_preparation",
  );

  await expectThrowsAsync(
    "MAGAC as handoff authority class rejected",
    () =>
      ctx.domain3.prepareGovernedHandoff({
        obligationId: ctx.obligationId,
        handoffConsumerContextId: HANDOFF_CTX,
        consumerCategoryKeys: [...CONSUMER_KEYS],
        preparedBy: ACTOR,
        authorityClassId: MAGAC,
      }),
    "invalid_handoff_preparation",
  );
}

section("Currency: after invalidation, load still works, currency=stale");

{
  const ctx = await grantPassGpra();
  const prep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  expect(
    "currency current before invalidation",
    await ctx.domain3.evaluateHandoffPreparationCurrency(prep.preparationId),
    "current",
  );

  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "governing_law_failure",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Governing law failure for currency stale test",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
  });

  const loaded = await ctx.domain3.loadGovernedHandoffPreparation(prep.preparationId);
  expectTruthy("historical prep still loadable", !!loaded);
  expect("historical still export_ready snapshot", loaded!.eligibilityLayerCondition, "export_ready");
  expect(
    "currency stale after invalidation",
    await ctx.domain3.evaluateHandoffPreparationCurrency(prep.preparationId),
    "stale",
  );
}

section("Persistence + rehydration foreign gpra / wrong lineage fails");

{
  const ctx = await grantPassGpra();
  const prep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  validatePersistedGovernedHandoffPreparation(prep);

  const other = await grantPassGpra();
  let threwForeign = false;
  try {
    rehydrateGovernedHandoffPreparation(prep, {
      gpra: other.gpra,
      review: ctx.review,
      determination: ctx.determination,
    });
  } catch (error) {
    threwForeign =
      isOrchestraConstitutionalError(error) && error.code === "invalid_handoff_preparation";
  }
  expect("foreign gpra rehydration fails", threwForeign, true);

  const lineageAttacks: Array<{ label: string; patch: Record<string, unknown> }> = [
    { label: "wrong Review", patch: { reviewId: other.review.reviewId } },
    { label: "wrong Determination", patch: { determinationId: other.determination.determinationId } },
    { label: "wrong Approval", patch: { approvalActId: other.gpra.approvalActId } },
    { label: "wrong RVA", patch: { rvaId: other.gpra.rvaId } },
    { label: "wrong Program", patch: { programId: other.program.id } },
    { label: "wrong Production Obligation", patch: { obligationId: other.obligationId } },
  ];

  for (const attack of lineageAttacks) {
    const forged = {
      ...prep,
      ...attack.patch,
      evidencePackage: { ...prep.evidencePackage, ...attack.patch },
      validityExport: {
        ...prep.validityExport,
        evaluationPoint: {
          ...prep.validityExport.evaluationPoint,
          ...(attack.patch.obligationId
            ? { obligationId: attack.patch.obligationId }
            : {}),
        },
        ...(attack.patch.approvalActId
          ? { approvalActId: attack.patch.approvalActId }
          : {}),
      },
    };
    let threw = false;
    try {
      rehydrateGovernedHandoffPreparation(forged, {
        gpra: ctx.gpra,
        review: ctx.review,
        determination: ctx.determination,
      });
    } catch (error) {
      threw =
        isOrchestraConstitutionalError(error) && error.code === "invalid_handoff_preparation";
    }
    expect(`${attack.label} rehydration fails`, threw, true);
  }
}

section("No handoff execution fields");

{
  const ctx = await grantPassGpra();
  await expectThrowsAsync(
    "executesHandoff rejected",
    () =>
      ctx.domain3.prepareGovernedHandoff({
        obligationId: ctx.obligationId,
        handoffConsumerContextId: HANDOFF_CTX,
        consumerCategoryKeys: [...CONSUMER_KEYS],
        preparedBy: ACTOR,
        executesHandoff: true,
      }),
    "invalid_handoff_preparation",
  );
  await expectThrowsAsync(
    "manufacturingExecutionId rejected",
    () =>
      ctx.domain3.prepareGovernedHandoff({
        obligationId: ctx.obligationId,
        handoffConsumerContextId: HANDOFF_CTX,
        consumerCategoryKeys: [...CONSUMER_KEYS],
        preparedBy: ACTOR,
        manufacturingExecutionId: "mfg-exec-1",
      }),
    "invalid_handoff_preparation",
  );
}

section("Multiple preparations allowed (HPAM additive history)");

{
  const ctx = await grantPassGpra();
  const a = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  const b = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: ["catalog", "publication"],
    preparedBy: ACTOR,
  });
  expectTruthy("distinct preparation ids", a.preparationId !== b.preparationId);
  const listed = await ctx.domain3.listGovernedHandoffPreparationsByGpra(ctx.gpra.gpraId);
  expect("two historical preparations", listed.length, 2);
}

section("G8/G9 smoke after preparation");

{
  const ctx = await grantPassGpra();
  await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  const validity = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId);
  expect("still Retention after preparation", validity.posture, "retention");
  expect("still forward active", validity.forwardActive, true);

  const fromPosture = evaluateGpraValidityFromPostureActs({
    gpraId: ctx.gpra.gpraId,
    invalidation: null,
    supersession: null,
  });
  expect("evaluateGpraValidityFromPostureActs Retention", fromPosture.posture, "retention");

  const authoritative = await ctx.domain3.loadAuthoritativeGpraByObligationContext({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
  });
  expect("authoritative still loadable", authoritative?.gpraId, ctx.gpra.gpraId);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const label of failures) {
    console.log(`  - ${label}`);
  }
  process.exit(1);
}
