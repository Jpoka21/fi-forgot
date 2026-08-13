/**
 * ORCH-IMP-021 — STD-015 HOF-G3 Consumer Class Catalog and Binding (R33–R39).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-consumer-binding.test.ts
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
  GOVERNED_HANDOFF_CONSUMER_BINDING_TRACEABILITY,
  governProductionProgram,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
  HCCM_CONSUMER_CLASS_CATALOG,
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
import { rehydrateGovernedHandoffConsumerBinding } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffConsumerBinding } from "../orchestra/persistence/domain3-validation.js";

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
const CONSUMER_KEYS = ["manufacturing", "fulfillment", "catalog", "archival", "production"] as const;
const HGA = HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID;

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-015 HOF-G3 Consumer Binding",
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
    constitutionalPurpose: "HOF-G3 binding scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G3",
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
    grounds: "Pass for HOF-G3",
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

async function admitEntry(ctx: Awaited<ReturnType<typeof grantPassGpra>>) {
  const prep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
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
    grounds: "Pass successor for HOF-G3",
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

section("HOF-G3 catalogs, R33–R39 traceability");

{
  expect("closed catalog length", HCCM_CONSUMER_CLASS_CATALOG.length, 6);
  expect("CC-01 id", HCCM_CONSUMER_CLASS_CATALOG[0]!.consumerClassId, "CC-01");
  expect("CC-06 id", HCCM_CONSUMER_CLASS_CATALOG[5]!.consumerClassId, "CC-06");
  expect(
    "CC-01 posture affinity library",
    HCCM_CONSUMER_CLASS_CATALOG[0]!.postureClassAffinity,
    "library_intake_posture",
  );
  expect(
    "CC-02 posture affinity production catalog",
    HCCM_CONSUMER_CLASS_CATALOG[1]!.postureClassAffinity,
    "production_catalog_posture",
  );
  expectTruthy(
    "CC-01 downstream domain present",
    !!HCCM_CONSUMER_CLASS_CATALOG[0]!.downstreamConsiderationDomain,
  );
  expectTruthy(
    "traceability R33",
    GOVERNED_HANDOFF_CONSUMER_BINDING_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R33"),
  );
  expectTruthy(
    "traceability R39",
    GOVERNED_HANDOFF_CONSUMER_BINDING_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R39"),
  );
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_CONSUMER_BINDING_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
}

section("createGovernedHandoffConsumerBindingRecord not on barrel");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffConsumerBindingRecord not on barrel",
    "createGovernedHandoffConsumerBindingRecord" in mod,
    false,
  );
  expect(
    "assessGovernedHandoffConsumerBinding on barrel",
    "assessGovernedHandoffConsumerBinding" in mod,
    true,
  );
  expect(
    "declareHandoffPosture not on barrel (R40+)",
    "declareHandoffPosture" in mod,
    false,
  );
}

section("Lawful binding: all applicable frozen CCs; not authorization/posture/execution");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);

  for (const cc of ["CC-01", "CC-02", "CC-03", "CC-04"] as const) {
    const assessment = await ctx.domain3.evaluateGovernedHandoffConsumerBinding({
      entryId: entry.entryId,
      consumerClassId: cc,
    });
    expect(`assessment mayBind ${cc}`, assessment.mayBind, true);
    expect(`assessment not authorization ${cc}`, assessment.notHandoffAuthorization, true);
    expect(`assessment not posture ${cc}`, assessment.notHandoffPostureDeclaration, true);
    expect(`assessment not execution ${cc}`, assessment.notHandoffExecution, true);

    const binding = await ctx.domain3.bindHccmConsumerClass({
      entryId: entry.entryId,
      consumerClassId: cc,
      boundBy: ACTOR,
    });
    expectTruthy(`binding id ${cc}`, binding.bindingId.startsWith("governed-handoff-consumer-binding-"));
    expect(`binding class ${cc}`, binding.consumerClassId, cc);
    expect(`binding not authorization ${cc}`, binding.notHandoffAuthorization, true);
    expect(`binding not posture ${cc}`, binding.notHandoffPostureDeclaration, true);
    expect(`binding not membership ${cc}`, binding.notPermanentCollectionMembership, true);
    expect(`binding not acceptance ${cc}`, binding.notDownstreamAcceptance, true);
    expect(
      `binding not mfg/fulfillment exec ${cc}`,
      binding.doesNotAuthorizeManufacturingOrFulfillment,
      true,
    );
    validatePersistedGovernedHandoffConsumerBinding(binding);
  }

  const listed = await ctx.domain3.listGovernedHandoffConsumerBindingsByEntry(entry.entryId);
  expect("multi-CC additive bindings count", listed.length, 4);
  expectTruthy(
    "CC-01 and CC-02 both present (R37 distinct)",
    listed.some((b) => b.consumerClassId === "CC-01") &&
      listed.some((b) => b.consumerClassId === "CC-02"),
  );
  expect(
    "CC-01 consumed keys include catalog/archival intersection",
    [...listed.find((b) => b.consumerClassId === "CC-01")!.consumedHcbmBoundaryKeys].sort(),
    ["archival", "catalog"],
  );
  expect(
    "CC-03 consumed manufacturing only",
    [...listed.find((b) => b.consumerClassId === "CC-03")!.consumedHcbmBoundaryKeys],
    ["manufacturing"],
  );
}

section("Binding does not require HGA authorization; HGA auth remains distinct");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await ctx.domain3.bindHccmConsumerClass({
    entryId: entry.entryId,
    consumerClassId: "CC-03",
    boundBy: ACTOR,
  });
  expect("binding without prior auth", binding.notHandoffAuthorization, true);
  expect("no authorizationActId on binding", "authorizationActId" in binding, false);

  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });
  const act = await ctx.domain3.authorizeGovernedHandoff({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: "CC-03",
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });
  expectTruthy("HGA auth still works after binding", !!act.authorizationActId);
  expect("auth still not posture", act.notHandoffPostureDeclaration, true);
}

section("Unknown/fabricated class; wrong HCBM/CC mapping");

{
  const ctx = await grantPassGpra();
  const prep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: ["manufacturing", "fulfillment"],
    preparedBy: ACTOR,
  });
  const entry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
  });

  await expectThrowsAsync(
    "invented CC-99 rejected",
    () =>
      ctx.domain3.bindHccmConsumerClass({
        entryId: entry.entryId,
        consumerClassId: "CC-99" as never,
        boundBy: ACTOR,
      }),
    "invalid_handoff_consumer_binding",
  );

  const assessment = await ctx.domain3.evaluateGovernedHandoffConsumerBinding({
    entryId: entry.entryId,
    consumerClassId: "CC-01",
  });
  expect("CC-01 without catalog/archival mayBind false", assessment.mayBind, false);
  await expectThrowsAsync(
    "CC-01 rejected when entry lacks catalog/archival keys",
    () =>
      ctx.domain3.bindHccmConsumerClass({
        entryId: entry.entryId,
        consumerClassId: "CC-01",
        boundBy: ACTOR,
      }),
    "invalid_handoff_consumer_binding",
  );
}

section("Missing entry; Invalidated; Superseded predecessor");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const fakeEntryId = "governed-handoff-entry-00000000-0000-4000-8000-000000000001" as never;

  const missing = await ctx.domain3.evaluateGovernedHandoffConsumerBinding({
    entryId: fakeEntryId,
    consumerClassId: "CC-03",
  });
  expect("missing entry mayBind false", missing.mayBind, false);
  await expectThrowsAsync(
    "bind rejects missing entry",
    () =>
      ctx.domain3.bindHccmConsumerClass({
        entryId: fakeEntryId,
        consumerClassId: "CC-03",
        boundBy: ACTOR,
      }),
    "invalid_handoff_consumer_binding",
  );

  const binding = await ctx.domain3.bindHccmConsumerClass({
    entryId: entry.entryId,
    consumerClassId: "CC-03",
    boundBy: ACTOR,
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

  await expectThrowsAsync(
    "bind rejects after Invalidation",
    () =>
      ctx.domain3.bindHccmConsumerClass({
        entryId: entry.entryId,
        consumerClassId: "CC-04",
        boundBy: ACTOR,
      }),
    "invalid_handoff_consumer_binding",
  );
  const historical = await ctx.domain3.loadGovernedHandoffConsumerBinding(binding.bindingId);
  expect("historical binding loadable", historical?.bindingId, binding.bindingId);
  const currency = await ctx.domain3.evaluateHandoffConsumerBindingCurrency(binding.bindingId);
  expect("historical binding currency stale", currency, "stale");
}

section("Superseded predecessor blocked; successor can bind");

{
  const ctx = await grantPassGpra();
  const { entry: predEntry } = await admitEntry(ctx);
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
      constitutionalEvidence: "ST-1 succession for HOF-G3",
    },
  });

  await expectThrowsAsync(
    "bind rejects superseded predecessor entry",
    () =>
      ctx.domain3.bindHccmConsumerClass({
        entryId: predEntry.entryId,
        consumerClassId: "CC-03",
        boundBy: ACTOR,
      }),
    "invalid_handoff_consumer_binding",
  );

  const successorPrep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  const successorEntry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: successorPrep.preparationId,
    enteredBy: ACTOR,
  });
  const succBinding = await ctx.domain3.bindHccmConsumerClass({
    entryId: successorEntry.entryId,
    consumerClassId: "CC-03",
    boundBy: ACTOR,
  });
  expect("successor binding gpra", succBinding.gpraId, successorGpra.gpraId);
}

section("Brain / MAGAC / HGA class cannot mint binding");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const base = {
    entryId: entry.entryId,
    consumerClassId: "CC-03" as const,
    boundBy: ACTOR,
  };

  await expectThrowsAsync(
    "Brain sourceAttribution rejected",
    () => ctx.domain3.bindHccmConsumerClass({ ...base, sourceAttribution: "brain_runtime" }),
    "invalid_handoff_consumer_binding",
  );
  await expectThrowsAsync(
    "Brain boundBy rejected",
    () => ctx.domain3.bindHccmConsumerClass({ ...base, boundBy: "brain_runtime" }),
    "invalid_handoff_consumer_binding",
  );
  await expectThrowsAsync(
    "MAGAC authorityClassId rejected",
    () => ctx.domain3.bindHccmConsumerClass({ ...base, authorityClassId: MAGAC }),
    "invalid_handoff_consumer_binding",
  );
  await expectThrowsAsync(
    "HGA authorityClassId rejected (binding ≠ authorization)",
    () => ctx.domain3.bindHccmConsumerClass({ ...base, authorityClassId: HGA }),
    "invalid_handoff_consumer_binding",
  );
  await expectThrowsAsync(
    "IVAC authorityClassId rejected",
    () => ctx.domain3.bindHccmConsumerClass({ ...base, authorityClassId: IVAC }),
    "invalid_handoff_consumer_binding",
  );
}

section("Binding must not declare posture or execute / attach authorization act");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const base = {
    entryId: entry.entryId,
    consumerClassId: "CC-03" as const,
    boundBy: ACTOR,
  };
  await expectThrowsAsync(
    "handoffPosture rejected",
    () => ctx.domain3.bindHccmConsumerClass({ ...base, handoffPosture: "active" }),
    "invalid_handoff_consumer_binding",
  );
  await expectThrowsAsync(
    "executesHandoff rejected",
    () => ctx.domain3.bindHccmConsumerClass({ ...base, executesHandoff: true }),
    "invalid_handoff_consumer_binding",
  );
  await expectThrowsAsync(
    "authorizationActId rejected",
    () => ctx.domain3.bindHccmConsumerClass({ ...base, authorizationActId: "auth-1" }),
    "invalid_handoff_consumer_binding",
  );
  await expectThrowsAsync(
    "manufacturingExecutionId rejected",
    () => ctx.domain3.bindHccmConsumerClass({ ...base, manufacturingExecutionId: "mfg-1" }),
    "invalid_handoff_consumer_binding",
  );
}

section("Rehydration: foreign lineage / forged CC / posture claim");

{
  const ctx = await grantPassGpra();
  const { prep, entry } = await admitEntry(ctx);
  const binding = await ctx.domain3.bindHccmConsumerClass({
    entryId: entry.entryId,
    consumerClassId: "CC-03",
    boundBy: ACTOR,
  });

  expectThrows(
    "rehydrate rejects foreign GPRA",
    () =>
      rehydrateGovernedHandoffConsumerBinding(binding, {
        entry,
        preparation: prep,
        gpra: {
          ...ctx.gpra,
          gpraId: "gpra-00000000-0000-4000-8000-000000000099" as typeof ctx.gpra.gpraId,
        },
        review: ctx.review,
        determination: ctx.determination,
      }),
    "invalid_handoff_consumer_binding",
  );

  expectThrows(
    "rehydrate rejects wrong Review",
    () =>
      rehydrateGovernedHandoffConsumerBinding(binding, {
        entry,
        preparation: prep,
        gpra: ctx.gpra,
        review: {
          ...ctx.review,
          reviewId:
            "production-readiness-review-00000000-0000-4000-8000-000000000088" as typeof ctx.review.reviewId,
        },
        determination: ctx.determination,
      }),
    "invalid_handoff_consumer_binding",
  );

  expectThrows(
    "rehydrate rejects forged CC",
    () =>
      rehydrateGovernedHandoffConsumerBinding(
        { ...binding, consumerClassId: "CC-99" as never },
        {
          entry,
          preparation: prep,
          gpra: ctx.gpra,
          review: ctx.review,
          determination: ctx.determination,
        },
      ),
    "invalid_handoff_consumer_binding",
  );

  expectThrows(
    "rehydrate rejects posture collapse",
    () =>
      rehydrateGovernedHandoffConsumerBinding(
        { ...binding, notHandoffPostureDeclaration: false as true },
        {
          entry,
          preparation: prep,
          gpra: ctx.gpra,
          review: ctx.review,
          determination: ctx.determination,
        },
      ),
    "invalid_handoff_consumer_binding",
  );

  const ok = rehydrateGovernedHandoffConsumerBinding(binding, {
    entry,
    preparation: prep,
    gpra: ctx.gpra,
    review: ctx.review,
    determination: ctx.determination,
  });
  expect("lawful rehydrate preserves id", ok.bindingId, binding.bindingId);
}

section("R48 boundary: binding ≠ posture; no completion APIs");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await ctx.domain3.bindHccmConsumerClass({
    entryId: entry.entryId,
    consumerClassId: "CC-03",
    boundBy: ACTOR,
  });
  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expectTruthy(
    "declareHandoffPosture available as peer HOF-G4 act (not auto-created by binding)",
    "declareHandoffPosture" in repo,
  );
  const postures = await ctx.domain3.listGovernedHandoffPostureDeclarationActsByEntry(entry.entryId);
  expect("binding alone creates no posture records", postures.length, 0);
  expect("no completeGovernedHandoff", "completeGovernedHandoff" in repo, false);
  expect(
    "binding remains non-authorization non-posture",
    binding.notHandoffAuthorization && binding.notHandoffPostureDeclaration,
    true,
  );
}

console.log(`\nHOF-G3 consumer binding tests: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
