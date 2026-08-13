/**
 * ORCH-IMP — STD-015 HOF-G7 Evidence and Validity Consumption (R08–R15).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-evidence-consumption.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  declareProductionIntent,
  DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES,
  determineExplorationEntry,
  draftProductionProgram,
  GOVERNED_HANDOFF_EVIDENCE_CONSUMPTION_TRACEABILITY,
  governProductionProgram,
  HANDOFF_EVIDENCE_MODELS,
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
import { rehydrateGovernedHandoffEvidenceConsumption } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffEvidenceConsumption } from "../orchestra/persistence/domain3-validation.js";

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

const ACTOR = "governance-authority-015";
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
    purpose: "STD-015 HOF-G7 Evidence Consumption",
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
    constitutionalPurpose: "HOF-G7 evidence consumption scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G7",
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
    grounds: "Pass for HOF-G7",
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

async function prepareExportReady(ctx: Awaited<ReturnType<typeof grantPassGpra>>) {
  return ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
}

async function admitEntry(ctx: Awaited<ReturnType<typeof grantPassGpra>>) {
  const prep = await prepareExportReady(ctx);
  const entry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
  });
  return { prep, entry };
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
    grounds: "Pass successor for HOF-G7",
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

section("HOF-G7 catalogs and STD-015 traceability");

{
  expect("Four peer-distinct evidence models", HANDOFF_EVIDENCE_MODELS.length, 4);
  expect("evidence models catalog", [...HANDOFF_EVIDENCE_MODELS], [
    "hepm",
    "hvem",
    "hoem",
    "advisory",
  ]);
  expect("Six deferred HOEM classes", DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES.length, 6);
  expectTruthy(
    "includes authorization",
    DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES.includes("authorization"),
  );
  expectTruthy(
    "includes suspension",
    DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES.includes("suspension"),
  );
  expectTruthy(
    "HOF-G7 traceability includes R08",
    GOVERNED_HANDOFF_EVIDENCE_CONSUMPTION_TRACEABILITY.requirementIds.includes(
      "FI-DSN-STD-015-R08",
    ),
  );
  expectTruthy(
    "HOF-G7 traceability includes R15",
    GOVERNED_HANDOFF_EVIDENCE_CONSUMPTION_TRACEABILITY.requirementIds.includes(
      "FI-DSN-STD-015-R15",
    ),
  );
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_EVIDENCE_CONSUMPTION_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
}

section("createGovernedHandoffEvidenceConsumptionRecord not on barrel");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffEvidenceConsumptionRecord not on barrel",
    "createGovernedHandoffEvidenceConsumptionRecord" in mod,
    false,
  );
  expect(
    "assessGovernedHandoffEvidenceConsumption on barrel",
    "assessGovernedHandoffEvidenceConsumption" in mod,
    true,
  );
  expect("HANDOFF_EVIDENCE_MODELS on barrel", "HANDOFF_EVIDENCE_MODELS" in mod, true);
  expect(
    "DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES on barrel",
    "DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES" in mod,
    true,
  );
}

section("Lawful consumption with current entry+prep → mayConsume; four models; HOEM framework only; NOT authorization");

{
  const ctx = await grantPassGpra();
  const { prep, entry } = await admitEntry(ctx);

  const assessment = await ctx.domain3.evaluateGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
  });
  expect("assessment mayConsume", assessment.mayConsume, true);
  expect("assessment not authorization", assessment.notHandoffAuthorization, true);
  expect("assessment not execution", assessment.notHandoffExecution, true);
  expect("assessment not posture", assessment.notHandoffPostureDeclaration, true);
  expect(
    "assessment notEvidenceOfAuthorization",
    assessment.notEvidenceOfHandoffAuthorization,
    true,
  );
  expect(
    "assessment notEvidenceOfPosture",
    assessment.notEvidenceOfHandoffPostureDeclaration,
    true,
  );
  expect("assessment hoemFrameworkOnly", assessment.hoemFrameworkOnly, true);
  expect(
    "assessment doesNotCreateOperativeHandoffActRecords",
    assessment.doesNotCreateOperativeHandoffActRecords,
    true,
  );
  expect("assessment fourModelsPeerDistinct", assessment.fourModelsPeerDistinct, true);
  expect("assessment evidence models", [...assessment.evidenceModelsPreserved], [
    "hepm",
    "hvem",
    "hoem",
    "advisory",
  ]);
  expect("assessment deferred HOEM length", assessment.deferredHoemOperativeRecordClasses.length, 6);
  expect("assessment freshness current", assessment.upstreamFreshnessAtConsumption, "current");

  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });
  expectTruthy(
    "consumption id prefix",
    consumption.consumptionId.startsWith("governed-handoff-evidence-consumption-"),
  );
  expect("consumption entryId", consumption.entryId, entry.entryId);
  expect("consumption preparationId", consumption.preparationId, prep.preparationId);
  expect("consumption gpraId", consumption.gpraId, ctx.gpra.gpraId);
  expect("consumption keys from entry", consumption.consumerCategoryKeys, [...CONSUMER_KEYS]);
  expect("hepm gpra matches", consumption.hepmRefs.gpraId, prep.evidencePackage.gpraId);
  expect(
    "hvem evaluation point gpra",
    consumption.hvemEvaluationPoint.gpraId,
    prep.validityExport.evaluationPoint.gpraId,
  );
  expect("freshness current", consumption.upstreamFreshnessAtConsumption, "current");
  expect("hepm available", consumption.hepmReferencesAvailable, true);
  expect("hvem current", consumption.hvemFactsCurrent, true);
  expect("factual inputs only", consumption.factualInputsToConsiderationOnly, true);
  expect("not authorization", consumption.notHandoffAuthorization, true);
  expect("notEvidenceOfAuthorization", consumption.notEvidenceOfHandoffAuthorization, true);
  expect("notEvidenceOfPosture", consumption.notEvidenceOfHandoffPostureDeclaration, true);
  expect("hoemFrameworkOnly", consumption.hoemFrameworkOnly, true);
  expect(
    "doesNotCreateOperativeHandoffActRecords",
    consumption.doesNotCreateOperativeHandoffActRecords,
    true,
  );
  expect("fourModelsPeerDistinct", consumption.fourModelsPeerDistinct, true);
  expectTruthy("no handoffActId", !("handoffActId" in consumption));
  expectTruthy("no hoemAuthorizationRecordId", !("hoemAuthorizationRecordId" in consumption));
  expectTruthy("no preservationActId", !("preservationActId" in consumption));

  const loaded = await ctx.domain3.loadGovernedHandoffEvidenceConsumption(
    consumption.consumptionId,
  );
  expect("load matches id", loaded?.consumptionId, consumption.consumptionId);

  const byEntry = await ctx.domain3.listGovernedHandoffEvidenceConsumptionsByEntry(entry.entryId);
  expect("list by entry length 1", byEntry.length, 1);
  const byGpra = await ctx.domain3.listGovernedHandoffEvidenceConsumptionsByGpra(ctx.gpra.gpraId);
  expect("list by gpra length 1", byGpra.length, 1);

  const currency = await ctx.domain3.evaluateHandoffEvidenceConsumptionCurrency(
    consumption.consumptionId,
  );
  expect("consumption currency current while upstream current", currency, "current");
}

section("Missing / foreign entry rejected");

{
  const ctx = await grantPassGpra();
  const fakeEntryId =
    "governed-handoff-entry-00000000-0000-4000-8000-000000000001" as const;

  const assessment = await ctx.domain3.evaluateGovernedHandoffEvidenceConsumption({
    entryId: fakeEntryId as never,
  });
  expect("missing entry mayConsume false", assessment.mayConsume, false);

  await expectThrowsAsync(
    "record rejects missing entry",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: fakeEntryId as never,
        consumedBy: ACTOR,
      }),
    "invalid_handoff_evidence_consumption",
  );
}

section("Stale after Invalidation: evaluate blocks; record rejects; historical consumption loadable");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });

  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Material CB change renders GPRA-bound RVA non-compliant",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });

  const assessment = await ctx.domain3.evaluateGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
  });
  expect("stale upstream mayConsume false", assessment.mayConsume, false);

  await expectThrowsAsync(
    "record rejects stale after invalidation",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: ACTOR,
      }),
    "invalid_handoff_evidence_consumption",
  );

  const historical = await ctx.domain3.loadGovernedHandoffEvidenceConsumption(
    consumption.consumptionId,
  );
  expect("historical consumption still loadable", historical?.consumptionId, consumption.consumptionId);
  expect("historical factualInputs marker preserved", historical?.factualInputsToConsiderationOnly, true);

  const currency = await ctx.domain3.evaluateHandoffEvidenceConsumptionCurrency(
    consumption.consumptionId,
  );
  expect("historical consumption currency stale", currency, "stale");
}

section("Superseded predecessor blocked; successor current path can consume");

{
  const ctx = await grantPassGpra();
  const { entry: predecessorEntry } = await admitEntry(ctx);
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
      constitutionalEvidence: "ST-1 succession for HOF-G7",
    },
  });

  const predAssessment = await ctx.domain3.evaluateGovernedHandoffEvidenceConsumption({
    entryId: predecessorEntry.entryId,
  });
  expect("predecessor entry mayConsume false", predAssessment.mayConsume, false);

  await expectThrowsAsync(
    "record rejects superseded predecessor entry",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: predecessorEntry.entryId,
        consumedBy: ACTOR,
      }),
    "invalid_handoff_evidence_consumption",
  );

  const successorPrep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  expect("successor prep gpra", successorPrep.gpraId, successorGpra.gpraId);

  const successorEntry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: successorPrep.preparationId,
    enteredBy: ACTOR,
  });
  const succAssessment = await ctx.domain3.evaluateGovernedHandoffEvidenceConsumption({
    entryId: successorEntry.entryId,
  });
  expect("successor entry mayConsume", succAssessment.mayConsume, true);

  const succConsumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: successorEntry.entryId,
    consumedBy: ACTOR,
  });
  expect("successor consumption gpra", succConsumption.gpraId, successorGpra.gpraId);
}

section("Wrong consumer key override rejected");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);

  await expectThrowsAsync(
    "record rejects invented consumerCategoryKeys override",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: ACTOR,
        consumerCategoryKeys: ["manufacturing", "fulfillment", "catalog"],
      }),
    "invalid_handoff_evidence_consumption",
  );

  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });
  expect("consumption keys only from entry", consumption.consumerCategoryKeys, [...CONSUMER_KEYS]);
}

section("Rehydration: foreign / wrong lineage fails");

{
  const ctx = await grantPassGpra();
  const { prep, entry } = await admitEntry(ctx);
  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });
  validatePersistedGovernedHandoffEvidenceConsumption(consumption);

  const foreignGpra = {
    ...ctx.gpra,
    gpraId: "gpra-00000000-0000-4000-8000-000000000099" as typeof ctx.gpra.gpraId,
  };
  expectThrows(
    "rehydrate rejects foreign GPRA",
    () =>
      rehydrateGovernedHandoffEvidenceConsumption(consumption, {
        entry,
        preparation: prep,
        gpra: foreignGpra,
        review: ctx.review,
        determination: ctx.determination,
      }),
    "invalid_handoff_evidence_consumption",
  );

  const wrongReview = {
    ...ctx.review,
    reviewId:
      "production-readiness-review-00000000-0000-4000-8000-000000000088" as typeof ctx.review.reviewId,
  };
  expectThrows(
    "rehydrate rejects wrong Review",
    () =>
      rehydrateGovernedHandoffEvidenceConsumption(consumption, {
        entry,
        preparation: prep,
        gpra: ctx.gpra,
        review: wrongReview,
        determination: ctx.determination,
      }),
    "invalid_handoff_evidence_consumption",
  );

  const forgedKeys = {
    ...consumption,
    consumerCategoryKeys: ["catalog", "archival"] as typeof consumption.consumerCategoryKeys,
  };
  expectThrows(
    "rehydrate rejects forged consumer keys",
    () =>
      rehydrateGovernedHandoffEvidenceConsumption(forgedKeys, {
        entry,
        preparation: prep,
        gpra: ctx.gpra,
        review: ctx.review,
        determination: ctx.determination,
      }),
    "invalid_handoff_evidence_consumption",
  );
}

section("Brain cannot mint; advisory cite OK but nonbinding");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);

  await expectThrowsAsync(
    "Brain sourceAttribution rejected",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: ACTOR,
        sourceAttribution: "brain_runtime",
      }),
    "invalid_handoff_evidence_consumption",
  );

  await expectThrowsAsync(
    "writing_engine consumedBy rejected",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: "writing_engine",
      }),
    "invalid_handoff_evidence_consumption",
  );

  await expectThrowsAsync(
    "MAGAC as handoffAuthorityClassId rejected",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: ACTOR,
        handoffAuthorityClassId: MAGAC,
      }),
    "invalid_handoff_evidence_consumption",
  );

  const advisory = await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: "brain-1.0.0",
    decisionStage: "handoff_preparation",
    outputClass: "nonbinding_recommendation",
    reviewId: ctx.review.reviewId,
    gpraId: ctx.gpra.gpraId,
    postureState: "retention",
    advisoryContent: "Optional readiness signal for evidence consumption",
  });

  const withAdvisory = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
    brainAdvisoryIds: [advisory.advisoryId],
  });
  expect("advisory cited", withAdvisory.brainAdvisoryIds[0], advisory.advisoryId);
  expect(
    "advisory does not elevate",
    withAdvisory.doesNotElevateAdvisoryToConstitutionalFact,
    true,
  );
  expect("still not authorization", withAdvisory.notHandoffAuthorization, true);
  expect(
    "still notEvidenceOfAuthorization",
    withAdvisory.notEvidenceOfHandoffAuthorization,
    true,
  );
}

section("Unknown evidence model / HOEM act instance / R16 boundary rejected");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);

  await expectThrowsAsync(
    "unknownEvidenceModel rejected",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: ACTOR,
        unknownEvidenceModel: "forged_model",
      }),
    "invalid_handoff_evidence_consumption",
  );

  await expectThrowsAsync(
    "HOEM act instance fields rejected",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: ACTOR,
        hoemOperativeActRecords: [{ class: "authorization", actId: "forged" }],
      }),
    "invalid_handoff_evidence_consumption",
  );

  await expectThrowsAsync(
    "handoffAuthorizationActId rejected (auth HOEM boundary)",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: ACTOR,
        handoffAuthorizationActId: "forged-auth-act",
      }),
    "invalid_handoff_evidence_consumption",
  );

  await expectThrowsAsync(
    "G10 preservationActId rejected (R16 boundary)",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: ACTOR,
        preservationActId: "forged-preservation",
      }),
    "invalid_handoff_evidence_consumption",
  );

  await expectThrowsAsync(
    "executionQueueId rejected (R15)",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: ACTOR,
        executionQueueId: "forged-queue",
      }),
    "invalid_handoff_evidence_consumption",
  );

  await expectThrowsAsync(
    "forged evidenceModels catalog rejected",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: ACTOR,
        evidenceModels: ["hepm", "forged"],
      }),
    "invalid_handoff_evidence_consumption",
  );
}

section("G1/G8/G9/G10/G11 smoke after consumption");

{
  const ctx = await grantPassGpra();
  const { prep, entry } = await admitEntry(ctx);
  await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });

  const loadedEntry = await ctx.domain3.loadGovernedHandoffEntry(entry.entryId);
  expect("G1 entry still loadable", loadedEntry?.entryId, entry.entryId);

  const validity = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId, HANDOFF_CTX);
  expect("G8/G9 validity still Retention after consumption", validity.posture, "retention");

  const listedPrep = await ctx.domain3.listGovernedHandoffPreparationsByGpra(ctx.gpra.gpraId);
  expect("G11 prep still listed", listedPrep.length, 1);
  expect("G11 prep id unchanged", listedPrep[0]?.preparationId, prep.preparationId);

  const advisory = await ctx.domain3.recordDomain3BrainAdvisory({
    sourceAttribution: "brain_runtime",
    brainRuntimeVersion: "brain-1.0.0",
    decisionStage: "handoff_preparation",
    outputClass: "nonbinding_recommendation",
    reviewId: ctx.review.reviewId,
    gpraId: ctx.gpra.gpraId,
    postureState: "retention",
    advisoryContent: "G10 smoke after G7 consumption",
  });
  expectTruthy("G10 advisory still recordable", !!advisory.advisoryId);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
