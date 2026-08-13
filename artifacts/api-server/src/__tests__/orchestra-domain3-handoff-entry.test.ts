/**
 * ORCH-IMP — STD-015 HOF-G1 Upstream Entry (R01–R07).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-entry.test.ts
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
  GOVERNED_HANDOFF_ENTRY_TRACEABILITY,
  governProductionProgram,
  HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS,
  HOF_P_DISTINCTIONS_PRESERVED,
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
import { rehydrateGovernedHandoffEntry } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffEntry } from "../orchestra/persistence/domain3-validation.js";

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
    purpose: "STD-015 HOF-G1 Handoff Entry",
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
    constitutionalPurpose: "HOF-G1 handoff entry scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G1",
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
    grounds: "Pass for HOF-G1",
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
    grounds: "Pass successor for HOF-G1",
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

section("HOF-G1 catalogs and STD-015 traceability");

{
  expect("Six deferred principal subjects", HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS.length, 6);
  expect("Eight HOF-P distinctions", HOF_P_DISTINCTIONS_PRESERVED.length, 8);
  expectTruthy(
    "HOF-G1 traceability includes R01",
    GOVERNED_HANDOFF_ENTRY_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R01"),
  );
  expectTruthy(
    "HOF-G1 traceability includes R07",
    GOVERNED_HANDOFF_ENTRY_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R07"),
  );
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_ENTRY_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
}

section("createGovernedHandoffEntryRecord not on barrel");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffEntryRecord not on barrel",
    "createGovernedHandoffEntryRecord" in mod,
    false,
  );
  expect("assessGovernedHandoffEntry on barrel", "assessGovernedHandoffEntry" in mod, true);
  expect(
    "HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS on barrel",
    "HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS" in mod,
    true,
  );
}

section("Lawful entry with current export_ready prep → considerationMayCommence, NOT authorization");

{
  const ctx = await grantPassGpra();
  const prep = await prepareExportReady(ctx);

  const assessment = await ctx.domain3.evaluateGovernedHandoffEntry({
    preparationId: prep.preparationId,
  });
  expect("assessment mayCommence", assessment.mayCommence, true);
  expect("assessment not authorization", assessment.notHandoffAuthorization, true);
  expect("assessment not execution", assessment.notHandoffExecution, true);
  expect("assessment not posture", assessment.notHandoffPostureDeclaration, true);
  expect("assessment not mfg", assessment.doesNotAuthorizeManufacturingOrFulfillment, true);
  expect("assessment hofG1Only", assessment.hofG1Only, true);

  const entry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
  });
  expect("entry considerationMayCommence", entry.considerationMayCommence, true);
  expect("entry not authorization", entry.notHandoffAuthorization, true);
  expect("entry not execution", entry.notHandoffExecution, true);
  expect("entry not posture", entry.notHandoffPostureDeclaration, true);
  expect("entry not mfg", entry.doesNotAuthorizeManufacturingOrFulfillment, true);
  expect("entry not G11 prep", entry.doesNotPerformG11Preparation, true);
  expect("entry not grant GPRA", entry.doesNotGrantGpraOrApproval, true);
  expect("entry not bind HOF-G3", entry.doesNotBindConsumerClassCatalog, true);
  expect("entry currency current", entry.preparationCurrencyAtEntry, "current");
  expect("entry eligibility consumed", entry.eligibilityLayerConditionConsumed, "export_ready");
  expectTruthy("entry id prefix", entry.entryId.startsWith("governed-handoff-entry-"));
  expect("entry prep id", entry.preparationId, prep.preparationId);
  expect("entry gpraId", entry.gpraId, ctx.gpra.gpraId);
  expect("entry keys from prep", entry.consumerCategoryKeys, [...CONSUMER_KEYS]);
  expectTruthy("no handoffActId", !("handoffActId" in entry));
  expectTruthy("no hoemEvidenceId", !("hoemEvidenceId" in entry));
  expectTruthy("no handoffAuthorizationActId", !("handoffAuthorizationActId" in entry));

  const loaded = await ctx.domain3.loadGovernedHandoffEntry(entry.entryId);
  expect("load matches id", loaded?.entryId, entry.entryId);

  const byPrep = await ctx.domain3.listGovernedHandoffEntriesByPreparation(prep.preparationId);
  expect("list by prep length 1", byPrep.length, 1);
  const byGpra = await ctx.domain3.listGovernedHandoffEntriesByGpra(ctx.gpra.gpraId);
  expect("list by gpra length 1", byGpra.length, 1);

  const currency = await ctx.domain3.evaluateHandoffEntryCurrency(entry.entryId);
  expect("entry currency current while prep current", currency, "current");
}

section("Missing preparation → reject");

{
  const ctx = await grantPassGpra();
  const fakePrepId =
    "governed-handoff-preparation-00000000-0000-4000-8000-000000000001" as const;

  const assessment = await ctx.domain3.evaluateGovernedHandoffEntry({
    preparationId: fakePrepId as never,
  });
  expect("missing prep mayCommence false", assessment.mayCommence, false);

  await expectThrowsAsync(
    "admit rejects missing preparation",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: fakePrepId as never,
        enteredBy: ACTOR,
      }),
    "invalid_handoff_entry",
  );
}

section("Stale preparation after Invalidation → evaluate blocks; admit rejects; historical entry loadable");

{
  const ctx = await grantPassGpra();
  const prep = await prepareExportReady(ctx);
  const entry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
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

  const prepCurrency = await ctx.domain3.evaluateHandoffPreparationCurrency(prep.preparationId);
  expect("prep currency stale after invalidation", prepCurrency, "stale");

  const assessment = await ctx.domain3.evaluateGovernedHandoffEntry({
    preparationId: prep.preparationId,
  });
  expect("stale prep mayCommence false", assessment.mayCommence, false);

  await expectThrowsAsync(
    "admit rejects stale preparation after invalidation",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: prep.preparationId,
        enteredBy: ACTOR,
      }),
    "invalid_handoff_entry",
  );

  const historical = await ctx.domain3.loadGovernedHandoffEntry(entry.entryId);
  expect("historical entry still loadable", historical?.entryId, entry.entryId);
  expect("historical consideration marker preserved", historical?.considerationMayCommence, true);

  const entryCurrency = await ctx.domain3.evaluateHandoffEntryCurrency(entry.entryId);
  expect("historical entry currency stale", entryCurrency, "stale");
}

section("Superseded predecessor prep blocked; successor current prep can enter");

{
  const ctx = await grantPassGpra();
  const predecessorPrep = await prepareExportReady(ctx);
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
      constitutionalEvidence: "ST-1 succession for HOF-G1",
    },
  });

  const predAssessment = await ctx.domain3.evaluateGovernedHandoffEntry({
    preparationId: predecessorPrep.preparationId,
  });
  expect("predecessor prep mayCommence false", predAssessment.mayCommence, false);

  await expectThrowsAsync(
    "admit rejects superseded predecessor prep",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: predecessorPrep.preparationId,
        enteredBy: ACTOR,
      }),
    "invalid_handoff_entry",
  );

  const successorPrep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  expect("successor prep gpra", successorPrep.gpraId, successorGpra.gpraId);

  const succAssessment = await ctx.domain3.evaluateGovernedHandoffEntry({
    preparationId: successorPrep.preparationId,
  });
  expect("successor prep mayCommence", succAssessment.mayCommence, true);

  const succEntry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: successorPrep.preparationId,
    enteredBy: ACTOR,
  });
  expect("successor entry gpra", succEntry.gpraId, successorGpra.gpraId);
}

section("Invented consumer key cannot be added beyond prep keys");

{
  const ctx = await grantPassGpra();
  const prep = await prepareExportReady(ctx);

  await expectThrowsAsync(
    "admit rejects invented consumerCategoryKeys override",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: prep.preparationId,
        enteredBy: ACTOR,
        consumerCategoryKeys: ["manufacturing", "fulfillment", "catalog"],
      }),
    "invalid_handoff_entry",
  );

  const entry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
  });
  expect("entry keys only from prep", entry.consumerCategoryKeys, [...CONSUMER_KEYS]);
}

section("Rehydration: foreign / wrong lineage fails");

{
  const ctx = await grantPassGpra();
  const prep = await prepareExportReady(ctx);
  const entry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
  });
  validatePersistedGovernedHandoffEntry(entry);

  const foreignGpra = {
    ...ctx.gpra,
    gpraId: "gpra-00000000-0000-4000-8000-000000000099" as typeof ctx.gpra.gpraId,
  };
  expectThrows(
    "rehydrate rejects foreign GPRA",
    () =>
      rehydrateGovernedHandoffEntry(entry, {
        preparation: prep,
        gpra: foreignGpra,
        review: ctx.review,
        determination: ctx.determination,
      }),
    "invalid_handoff_entry",
  );

  const wrongReview = {
    ...ctx.review,
    reviewId: "production-readiness-review-00000000-0000-4000-8000-000000000088" as typeof ctx.review.reviewId,
  };
  expectThrows(
    "rehydrate rejects wrong Review",
    () =>
      rehydrateGovernedHandoffEntry(entry, {
        preparation: prep,
        gpra: ctx.gpra,
        review: wrongReview,
        determination: ctx.determination,
      }),
    "invalid_handoff_entry",
  );

  const wrongDetermination = {
    ...ctx.determination,
    determinationId:
      "review-determination-00000000-0000-4000-8000-000000000077" as typeof ctx.determination.determinationId,
  };
  expectThrows(
    "rehydrate rejects wrong Determination",
    () =>
      rehydrateGovernedHandoffEntry(entry, {
        preparation: prep,
        gpra: ctx.gpra,
        review: ctx.review,
        determination: wrongDetermination,
      }),
    "invalid_handoff_entry",
  );

  const forgedKeys = {
    ...entry,
    consumerCategoryKeys: ["manufacturing", "catalog"] as const,
  };
  expectThrows(
    "rehydrate rejects forged consumer keys beyond prep",
    () =>
      rehydrateGovernedHandoffEntry(forgedKeys, {
        preparation: prep,
        gpra: ctx.gpra,
        review: ctx.review,
        determination: ctx.determination,
      }),
    "invalid_handoff_entry",
  );
}

section("Brain cannot mint entry; MAGAC/IVAC not handoff authority");

{
  const ctx = await grantPassGpra();
  const prep = await prepareExportReady(ctx);

  await expectThrowsAsync(
    "Brain sourceAttribution rejected",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: prep.preparationId,
        enteredBy: ACTOR,
        sourceAttribution: "brain_runtime",
      }),
    "invalid_handoff_entry",
  );

  await expectThrowsAsync(
    "writing_engine enteredBy rejected",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: prep.preparationId,
        enteredBy: "writing_engine",
      }),
    "invalid_handoff_entry",
  );

  await expectThrowsAsync(
    "MAGAC as handoffAuthorityClassId rejected",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: prep.preparationId,
        enteredBy: ACTOR,
        handoffAuthorityClassId: MAGAC,
      }),
    "invalid_handoff_entry",
  );

  await expectThrowsAsync(
    "IVAC as handoffAuthorityClassId rejected",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: prep.preparationId,
        enteredBy: ACTOR,
        handoffAuthorityClassId: IVAC,
      }),
    "invalid_handoff_entry",
  );

  await expectThrowsAsync(
    "execution claim handoffAuthorized rejected",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: prep.preparationId,
        enteredBy: ACTOR,
        handoffAuthorized: true,
      }),
    "invalid_handoff_entry",
  );

  await expectThrowsAsync(
    "HOEM claim rejected (R08 boundary)",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: prep.preparationId,
        enteredBy: ACTOR,
        hoemEvidenceId: "hoem-forged",
      }),
    "invalid_handoff_entry",
  );
}

section("export_ready markers prove not authorization / posture / execution / MFG");

{
  const ctx = await grantPassGpra();
  const prep = await prepareExportReady(ctx);
  const entry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
  });
  expect("std015HofG1EntryBoundaryOnly", entry.std015HofG1EntryBoundaryOnly, true);
  expect("r01InheritanceLock", entry.r01InheritanceLock, true);
  expect("r02DoesNotWeakenStd012Or013", entry.r02DoesNotWeakenStd012Or013, true);
  expect("r03MfgComplianceBoundaryContextOnly", entry.r03MfgComplianceBoundaryContextOnly, true);
  expect("r04DecisionStagePolicyOnly", entry.r04DecisionStagePolicyOnly, true);
  expect("r05PrincipalSubjectsDeferred", entry.r05PrincipalSubjectsDeferred, true);
  expect(
    "r06DoesNotPerformReviewApprovalGpraOrG11Prep",
    entry.r06DoesNotPerformReviewApprovalGpraOrG11Prep,
    true,
  );
  expect("deferred subjects length", entry.deferredPrincipalSubjects.length, 6);
  expectTruthy(
    "includes handoff_authorization deferred",
    entry.deferredPrincipalSubjects.includes("handoff_authorization"),
  );
  expectTruthy("includes HOF-P1", entry.hofPDistinctionsPreserved.includes("HOF-P1"));
  expectTruthy("includes HOF-P10", entry.hofPDistinctionsPreserved.includes("HOF-P10"));
}

section("G8/G9/G10/G11 smoke after entry");

{
  const ctx = await grantPassGpra();
  const prep = await prepareExportReady(ctx);
  await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
  });

  const validity = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId, HANDOFF_CTX);
  expect("G8/G9 validity still Retention after entry", validity.posture, "retention");

  const listedPrep = await ctx.domain3.listGovernedHandoffPreparationsByGpra(ctx.gpra.gpraId);
  expect("G11 prep still listed", listedPrep.length, 1);

  const eligibility = await ctx.domain3.evaluateGovernedHandoffEligibility({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
  });
  expect("G11 eligibility still export_ready", eligibility.eligibilityLayerCondition, "export_ready");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
