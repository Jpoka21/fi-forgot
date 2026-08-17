/**
 * ORCH-IMP-030 — STD-015 HERCM Handoff Re-entry & Resumption (R126–R139).
 *
 * Re-entry and resumption remain HERCM-governed. R140–R141 catalog them as HGA
 * matrix members without changing REC semantics.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-hercm.test.ts
 */

import {
  addObligationToProgram,
  assertHgaMatrixActType,
  assertHercmActIsHgaMatrixActType,
  assertHercmActIsNotHgaMatrixActType,
  assertR140PlusUnavailable,
  assertR142PlusUnavailable,
  assessGovernedHandoffReentry,
  assessHercmCatalogIntegrity,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  declareProductionIntent,
  determineExplorationEntry,
  draftProductionProgram,
  FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES,
  GOVERNED_HANDOFF_HERCM_TRACEABILITY,
  GOVERNED_HANDOFF_REENTRY_TRACEABILITY,
  GOVERNED_HANDOFF_RESUMPTION_TRACEABILITY,
  governProductionProgram,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
  HERCM_CATEGORY_IDS,
  HERCM_REENTRY_CATEGORY_IDS,
  HERCM_RESUMPTION_CATEGORY_IDS,
  HGA_MATRIX_ACT_TYPES,
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
import {
  rehydrateGovernedHandoffReentry,
  rehydrateGovernedHandoffResumption,
} from "../orchestra/persistence/domain3-rehydration.js";
import {
  validatePersistedGovernedHandoffReentry,
  validatePersistedGovernedHandoffResumption,
} from "../orchestra/persistence/domain3-validation.js";

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
    if (!code || (isOrchestraConstitutionalError(error) && error.code === code)) {
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
    if (!code || (isOrchestraConstitutionalError(error) && error.code === code)) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (wrong code: ${(error as { code?: string }).code})`);
    }
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

const ACTOR = "governance-authority-015";
const MAGAC = "approval_authority_production_obligation_scope" as const;
const IVAC = "invalidation_authority_production_obligation_scope" as const;
const HGA = HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID;
const HANDOFF_CTX = "handoff-consumer-context-opaque-001";
const CONSUMER_KEYS = [
  "manufacturing",
  "fulfillment",
  "catalog",
  "archival",
  "production",
] as const;

const SUSPENSION_BASIS = "temporary_forward_reliance_pause_warranted";
const WITHDRAWAL_BASIS = "hga_initiated_forward_reliance_retraction_warranted";
const RESUMPTION_BASIS = "suspension_grounds_constitutionally_cleared";
const REENTRY_EXPORT_BASIS = "g11_export_ready_and_entry_inputs_satisfied_anew";
const REENTRY_REJECTION_BASIS = "rejection_grounds_constitutionally_addressable";
const REENTRY_VALIDITY_BASIS = "validity_or_time_boundary_addressed_upstream";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-015 HERCM re-entry and resumption",
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
    constitutionalPurpose: "HERCM scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HERCM",
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
        dimension:
          MANDATORY_REVIEW_DIMENSION_LABELS[dimensionId as MandatoryReviewDimensionId],
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
    grounds: "Pass for HERCM",
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

type Ctx = Awaited<ReturnType<typeof grantPassGpra>>;

async function pipelineAuthPosture(ctx: Ctx, consumerClassId: "CC-01" | "CC-02" = "CC-01") {
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
  const binding = await ctx.domain3.bindHccmConsumerClass({
    entryId: entry.entryId,
    consumerClassId,
    boundBy: ACTOR,
  });
  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });
  const authorization = await ctx.domain3.authorizeGovernedHandoff({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId,
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });
  const posture = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  return { prep, entry, binding, consumption, authorization, posture };
}

type Ready = Awaited<ReturnType<typeof pipelineAuthPosture>>;

function resumeInput(ready: Ready, overrides: Record<string, unknown> = {}) {
  return {
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    resumedBy: ACTOR,
    hercmCategory: "REC-02",
    constitutionalBasisKind: RESUMPTION_BASIS,
    ...overrides,
  };
}

function reenterInput(ready: Ready, overrides: Record<string, unknown> = {}) {
  return {
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    reenteredBy: ACTOR,
    hercmCategory: "REC-03",
    constitutionalBasisKind: REENTRY_EXPORT_BASIS,
    ...overrides,
  };
}

async function suspend(ctx: Ctx, ready: Ready) {
  return ctx.domain3.suspendGovernedHandoff({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    suspendedBy: ACTOR,
    constitutionalBasisKind: SUSPENSION_BASIS,
  });
}

async function withdraw(ctx: Ctx, ready: Ready) {
  return ctx.domain3.withdrawGovernedHandoff({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    withdrawnBy: ACTOR,
    constitutionalBasisKind: WITHDRAWAL_BASIS,
  });
}

async function recall(ctx: Ctx, ready: Ready) {
  return ctx.domain3.recallGovernedHandoff({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    recalledBy: ACTOR,
    satisfiedHrtcmTriggers: ["RTC-04"],
    postureChainGovernanceCessationSatisfied: true,
  });
}

section(
  "1. catalog integrity; matrix is eight; scopes include resumption/reentry; R140–R141 complete",
);

{
  const integrity = assessHercmCatalogIntegrity();
  expect("catalog integrity ok", integrity.integrityOk, true);
  expect("closed catalog REC-01..05", [...HERCM_CATEGORY_IDS], [
    "REC-01",
    "REC-02",
    "REC-03",
    "REC-04",
    "REC-05",
  ]);
  expect("REC-02 is the only resumption category", [...HERCM_RESUMPTION_CATEGORY_IDS], [
    "REC-02",
  ]);
  expect("re-entry categories", [...HERCM_REENTRY_CATEGORY_IDS], [
    "REC-01",
    "REC-03",
    "REC-04",
    "REC-05",
  ]);
  expect("hercm acts are matrix act types", integrity.hercmActsAreMatrixActTypes, true);
  expect("hercm constitutional scopes present", integrity.hercmConstitutionalScopesPresent, true);
  expect("HGA matrix act type count eight", integrity.hgaMatrixActTypeCount, 8);
  expect("HSLM remains eight states", integrity.hslmStateCount, 8);
  expect("no reentered HSLM state", integrity.noReenteredHslmState, true);
  expect("no resumed HSLM state", integrity.noResumedHslmState, true);
  expect("export_ready alone does not reenter or resume", integrity.exportReadyAloneDoesNotReenterOrResume, true);
  expect("R126–R139 operative", integrity.r126ThroughR139, true);
  expect("R140–R141 complete", integrity.r140R141Complete, true);
  expect("R142+ deferred", integrity.r142PlusDeferred, false);
  expect("R142–R145 complete", integrity.r142R145Complete, true);

  expect("HGA matrix exactly eight", HGA_MATRIX_ACT_TYPES.length, 8);
  const hga = FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!;
  expect("HGA constitutional scopes now eight", hga.authorizedConstitutionalScopes.length, 8);
  expectTruthy(
    "HGA includes resumption scope",
    hga.authorizedConstitutionalScopes.includes("handoff_resumption_act"),
  );
  expectTruthy(
    "HGA includes reentry scope",
    hga.authorizedConstitutionalScopes.includes("handoff_reentry_act"),
  );

  for (const id of ["FI-DSN-STD-015-R126", "FI-DSN-STD-015-R139"]) {
    expectTruthy(
      `HERCM traceability ${id}`,
      GOVERNED_HANDOFF_HERCM_TRACEABILITY.requirementIds.includes(id as never),
    );
  }
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_HERCM_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
  expectTruthy(
    "resumption traceability R132",
    GOVERNED_HANDOFF_RESUMPTION_TRACEABILITY.requirementIds.includes(
      "FI-DSN-STD-015-R132" as never,
    ),
  );
  expectTruthy(
    "reentry traceability R132",
    GOVERNED_HANDOFF_REENTRY_TRACEABILITY.requirementIds.includes(
      "FI-DSN-STD-015-R132" as never,
    ),
  );

  for (const claim of [
    "ninth_matrix_act_type",
    "restoration_operative_mechanics_available",
    "expiry_operative_mechanics_available",
  ]) {
    expectThrows(
      `assertR142PlusUnavailable rejects ${claim}`,
      () => assertR142PlusUnavailable(claim),
      "invalid_handoff_g6_lifecycle_foundation",
    );
  }
  expectThrows(
    "assertR140PlusUnavailable rejects matrix_still_six",
    () => assertR140PlusUnavailable("matrix_still_six"),
    "invalid_handoff_g6_lifecycle_foundation",
  );
  assertR140PlusUnavailable();
  passed++;
  console.log("  ✓ assertR140PlusUnavailable() no-arg is a no-op after R140–R141");
  assertR142PlusUnavailable();
  passed++;
  console.log("  ✓ assertR142PlusUnavailable() passes without an R142+ claim");

  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffResumptionActRecord not on barrel",
    "createGovernedHandoffResumptionActRecord" in mod,
    false,
  );
  expect(
    "createGovernedHandoffReentryActRecord not on barrel",
    "createGovernedHandoffReentryActRecord" in mod,
    false,
  );
  expect("resumeGovernedHandoff not on barrel", "resumeGovernedHandoff" in mod, false);
  expect("reenterGovernedHandoff not on barrel", "reenterGovernedHandoff" in mod, false);
  expect(
    "assessGovernedHandoffResumption on barrel",
    "assessGovernedHandoffResumption" in mod,
    true,
  );
  expect("assessGovernedHandoffReentry on barrel", "assessGovernedHandoffReentry" in mod, true);
  expect("assessHercmCatalogIntegrity on barrel", "assessHercmCatalogIntegrity" in mod, true);
}

section("2. lawful REC-02 resumption after suspension lifts the pause on existing authorization");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const suspension = await suspend(ctx, ready);
  const suspended = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("HSLM suspended before resumption", suspended.currentState, "suspended");

  const assessment = await ctx.domain3.assessGovernedHandoffResumption(resumeInput(ready));
  expect("may resume", assessment.mayResume, true);
  expect("category REC-02", assessment.hercmCategory, "REC-02");
  expect("qualifying prior state suspended", assessment.qualifyingPriorState, "suspended");
  expect("catalog alone does not mint", assessment.doesNotAuthorizeActMintViaCatalogAlone, true);

  const act = await ctx.domain3.resumeGovernedHandoff(resumeInput(ready));
  expect("scope handoff_resumption_act", act.authorityConstitutionalScope, "handoff_resumption_act");
  expect(
    "effect framing resumption on existing authorization",
    act.effectFraming,
    "forward_reliance_resumption_on_existing_authorization",
  );
  expect("HOEM actType resumption", act.hoemResumptionRecord.actType, "resumption");
  expect("HOEM category REC-02", act.hoemResumptionRecord.hercmCategory, "REC-02");
  expect(
    "HOEM qualifying prior state suspended",
    act.hoemResumptionRecord.qualifyingPriorState,
    "suspended",
  );
  expect("resumes the suspension tip", act.resumedSuspensionActId, suspension.suspensionActId);
  expect("same posture chain retained", act.samePostureChainRetained, true);
  expect("mints no authorization", act.doesNotMintNewAuthorization, true);
  expect("mints no posture", act.doesNotMintNewPostureDeclaration, true);
  expect("not a matrix act type", act.notHgaMatrixActType, true);
  expect("not a re-entry", act.notHercmReentry, true);
  expect("not restoration", act.notRestoration, true);
  expect("HSLM remains eight states", act.hslmRemainsEightStates, true);
  validatePersistedGovernedHandoffResumption(act);

  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("HSLM leaves suspended", lifecycle.currentState, "authorized");
  expect("resumption clears suspended projection", lifecycle.resumptionClearsSuspendedProjection, true);
  expect("authoritative resumption tip", lifecycle.authoritativeResumptionActId, act.resumptionActId);
  expect("suspension history preserved", lifecycle.authoritativeSuspensionActId, suspension.suspensionActId);
  expect("hercm mechanics operative", lifecycle.hercmMechanicsOperative, true);
  expect("no reentered/resumed HSLM state", lifecycle.noReenteredOrResumedHslmState, true);
  expect("R140–R141 complete on lifecycle", lifecycle.r140PlusUnavailable, false);
  expect("R142+ unavailable on lifecycle", lifecycle.r142PlusUnavailable, true);
  expect(
    "authorization still current",
    await ctx.domain3.evaluateHandoffAuthorizationCurrency(
      ready.authorization.authorizationActId,
    ),
    "current",
  );
  expect(
    "resumption currency current",
    await ctx.domain3.evaluateHandoffResumptionCurrency(act.resumptionActId),
    "current",
  );
}

section("3. REC-02 denied without cleared basis, without suspension, and after cessation");

{
  const noSuspensionCtx = await grantPassGpra();
  const noSuspensionReady = await pipelineAuthPosture(noSuspensionCtx);
  const noSuspension = await noSuspensionCtx.domain3.assessGovernedHandoffResumption(
    resumeInput(noSuspensionReady),
  );
  expect("no suspension mayResume false", noSuspension.mayResume, false);
  expectTruthy(
    "denial qualifying_prior_suspension_missing",
    noSuspension.denialReasons.includes("qualifying_prior_suspension_missing"),
  );
  await expectThrowsAsync(
    "resumption without suspension rejected",
    () => noSuspensionCtx.domain3.resumeGovernedHandoff(resumeInput(noSuspensionReady)),
    "invalid_handoff_resumption",
  );

  const basisCtx = await grantPassGpra();
  const basisReady = await pipelineAuthPosture(basisCtx);
  await suspend(basisCtx, basisReady);
  const noBasis = await basisCtx.domain3.assessGovernedHandoffResumption(
    resumeInput(basisReady, { constitutionalBasisKind: undefined }),
  );
  expect("no basis mayResume false", noBasis.mayResume, false);
  expectTruthy(
    "denial suspension_grounds_cleared_basis_required",
    noBasis.denialReasons.includes("suspension_grounds_cleared_basis_required"),
  );
  const notesOnly = await basisCtx.domain3.assessGovernedHandoffResumption(
    resumeInput(basisReady, {
      constitutionalBasisKind: undefined,
      constitutionalBasisNotes: "grounds look cleared to me",
    }),
  );
  expectTruthy(
    "notes alone cannot substitute for basis",
    notesOnly.denialReasons.includes("notes_cannot_be_sole_constitutional_basis"),
  );
  const wrongBasis = await basisCtx.domain3.assessGovernedHandoffResumption(
    resumeInput(basisReady, { constitutionalBasisKind: REENTRY_EXPORT_BASIS }),
  );
  expect("re-entry basis invalid for REC-02", wrongBasis.mayResume, false);
  const wrongCategory = await basisCtx.domain3.assessGovernedHandoffResumption(
    resumeInput(basisReady, {
      hercmCategory: "REC-03",
      constitutionalBasisKind: REENTRY_EXPORT_BASIS,
    }),
  );
  expectTruthy(
    "REC-03 is not a resumption category",
    wrongCategory.denialReasons.includes("hercm_category_not_rec_02"),
  );

  const cessationCtx = await grantPassGpra();
  const cessationReady = await pipelineAuthPosture(cessationCtx);
  await suspend(cessationCtx, cessationReady);
  await withdraw(cessationCtx, cessationReady);
  const afterWithdrawal = await cessationCtx.domain3.assessGovernedHandoffResumption(
    resumeInput(cessationReady),
  );
  expect("resumption after withdrawal mayResume false", afterWithdrawal.mayResume, false);
  expectTruthy(
    "denial suspension_superseded_by_cessation",
    afterWithdrawal.denialReasons.includes("suspension_superseded_by_cessation"),
  );
  expectTruthy(
    "denial forward_reliance_already_ceased",
    afterWithdrawal.denialReasons.includes("forward_reliance_already_ceased"),
  );
  await expectThrowsAsync(
    "resumption after withdrawal rejected",
    () => cessationCtx.domain3.resumeGovernedHandoff(resumeInput(cessationReady)),
    "invalid_handoff_resumption",
  );
}

section("4. lawful REC-03 re-entry after withdrawal returns toward eligible only");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const withdrawal = await withdraw(ctx, ready);
  const withdrawn = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("HSLM withdrawn before re-entry", withdrawn.currentState, "withdrawn");

  const assessment = await ctx.domain3.assessGovernedHandoffReentry(reenterInput(ready));
  expect("may reenter", assessment.mayReenter, true);
  expect("qualifying prior state withdrawn", assessment.qualifyingPriorState, "withdrawn");
  expect("returns toward eligible only", assessment.returnsTowardEligibleForConsiderationOnly, true);
  expect("requires new G2 authorization", assessment.requiresNewAuthorizationViaG2, true);
  expect("REC-03 requires no new posture", assessment.requiresNewPostureAfterNewAuthorization, false);

  const act = await ctx.domain3.reenterGovernedHandoff(reenterInput(ready));
  expect("scope handoff_reentry_act", act.authorityConstitutionalScope, "handoff_reentry_act");
  expect(
    "effect framing return toward eligible",
    act.effectFraming,
    "return_toward_eligible_for_consideration",
  );
  expect("HOEM actType reentry", act.hoemReentryRecord.actType, "reentry");
  expect("HOEM category REC-03", act.hoemReentryRecord.hercmCategory, "REC-03");
  expect(
    "HOEM qualifying prior state withdrawn",
    act.hoemReentryRecord.qualifyingPriorState,
    "withdrawn",
  );
  expect("predecessor withdrawal linked", act.predecessorWithdrawalActId, withdrawal.withdrawalActId);
  expect("no rejection attribution", act.predecessorRejectionAttributionId, null);
  expect("no expiry act", act.predecessorExpiryActId, null);
  expect("does not resurrect authorization", act.doesNotResurrectAuthorization, true);
  expect("does not resurrect posture", act.doesNotResurrectPosture, true);
  expect("not a resumption", act.notHercmResumption, true);
  expect("not a matrix act type", act.notHgaMatrixActType, true);
  validatePersistedGovernedHandoffReentry(act);

  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("HSLM eligible for consideration", lifecycle.currentState, "eligible_for_consideration");
  expect("reentry clears cessation projection", lifecycle.reentryClearsCessationProjection, true);
  expect("authoritative reentry tip", lifecycle.authoritativeReentryActId, act.reentryActId);
  expect("withdrawal history preserved", lifecycle.authoritativeWithdrawalActId, withdrawal.withdrawalActId);
  expect(
    "predecessor authorization not treated as current authorized",
    lifecycle.currentState === "authorized",
    false,
  );
  expect(
    "reentry currency current",
    await ctx.domain3.evaluateHandoffReentryCurrency(act.reentryActId),
    "current",
  );

  // R100 — the withdrawal tip survives and still blocks another withdrawal.
  await expectThrowsAsync(
    "second withdrawal still blocked by surviving tip",
    () => withdraw(ctx, ready),
    "invalid_handoff_withdrawal",
  );

  // R132 — only a NEW G2 authorization moves the binding back to authorized.
  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: ready.entry.entryId,
    consumedBy: ACTOR,
  });
  const newAuth = await ctx.domain3.authorizeGovernedHandoff({
    entryId: ready.entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: "CC-01",
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });
  const reauthorized = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("new authorization after re-entry projects authorized", reauthorized.currentState, "authorized");
  expect(
    "new authorization is the matching tip",
    reauthorized.matchingAuthorizationActId,
    newAuth.authorizationActId,
  );
}

section("5. lawful REC-04 re-entry after RTC-04 recall requires a new posture path");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const recalled = await recall(ctx, ready);
  const beforeReentry = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("HSLM recalled before re-entry", beforeReentry.currentState, "recalled");

  const input = reenterInput(ready, { hercmCategory: "REC-04" });
  const assessment = await ctx.domain3.assessGovernedHandoffReentry(input);
  expect("may reenter after recall", assessment.mayReenter, true);
  expect("qualifying prior state recalled", assessment.qualifyingPriorState, "recalled");
  expect(
    "REC-04 requires new posture after new authorization",
    assessment.requiresNewPostureAfterNewAuthorization,
    true,
  );

  const act = await ctx.domain3.reenterGovernedHandoff(input);
  expect("predecessor recall linked", act.predecessorRecallActId, recalled.recallActId);
  expect("no predecessor withdrawal", act.predecessorWithdrawalActId, null);
  expect(
    "requiresNewPostureAfterNewAuthorization flag",
    act.requiresNewPostureAfterNewAuthorization,
    true,
  );
  expect("HOEM category REC-04", act.hoemReentryRecord.hercmCategory, "REC-04");
  expect(
    "HOEM qualifying prior state recalled",
    act.hoemReentryRecord.qualifyingPriorState,
    "recalled",
  );

  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("HSLM eligible after REC-04", lifecycle.currentState, "eligible_for_consideration");
  expect("recall history preserved", lifecycle.authoritativeRecallActId, recalled.recallActId);

  // Category must match the qualifying prior tip.
  const mismatchCtx = await grantPassGpra();
  const mismatchReady = await pipelineAuthPosture(mismatchCtx);
  await withdraw(mismatchCtx, mismatchReady);
  const mismatch = await mismatchCtx.domain3.assessGovernedHandoffReentry(
    reenterInput(mismatchReady, { hercmCategory: "REC-04" }),
  );
  expect("REC-04 after withdrawal denied", mismatch.mayReenter, false);
  expectTruthy(
    "denial qualifying_prior_recall_missing",
    mismatch.denialReasons.includes("qualifying_prior_recall_missing"),
  );
}

section("6. REC-01 / REC-05 deny when the qualifying prior state is not projected");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  await withdraw(ctx, ready);

  const rejected = await ctx.domain3.assessGovernedHandoffReentry(
    reenterInput(ready, {
      hercmCategory: "REC-01",
      constitutionalBasisKind: REENTRY_REJECTION_BASIS,
    }),
  );
  expect("REC-01 denied without projected rejected", rejected.mayReenter, false);
  expectTruthy(
    "denial qualifying_prior_rejected_missing",
    rejected.denialReasons.includes("qualifying_prior_rejected_missing"),
  );

  const expired = await ctx.domain3.assessGovernedHandoffReentry(
    reenterInput(ready, {
      hercmCategory: "REC-05",
      constitutionalBasisKind: REENTRY_VALIDITY_BASIS,
    }),
  );
  expect("REC-05 denied without projected expired", expired.mayReenter, false);
  expectTruthy(
    "denial qualifying_prior_expired_missing",
    expired.denialReasons.includes("qualifying_prior_expired_missing"),
  );

  // A claimed boolean can never substitute for the projected qualifying fact.
  const claimed = await ctx.domain3.assessGovernedHandoffReentry(
    reenterInput(ready, {
      hercmCategory: "REC-01",
      constitutionalBasisKind: REENTRY_REJECTION_BASIS,
      qualifyingPriorRejected: true,
    } as never),
  );
  expect("claimed qualifyingPriorRejected does not mint", claimed.mayReenter, false);
}

section("7. R129 — invalidated / superseded GPRA blocks predecessor-context HERCM");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx, "CC-02");
  await withdraw(ctx, ready);
  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Material CB change renders GPRA-bound RVA non-compliant",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });

  const assessment = await ctx.domain3.assessGovernedHandoffReentry(reenterInput(ready));
  expect("invalidated GPRA blocks re-entry", assessment.mayReenter, false);
  expectTruthy(
    "denial names a GPRA validity failure",
    assessment.denialReasons.some((r) => r.startsWith("gpra_")),
  );
  await expectThrowsAsync(
    "re-entry under invalidated GPRA rejected",
    () => ctx.domain3.reenterGovernedHandoff(reenterInput(ready)),
    "invalid_handoff_reentry",
  );

  const suspendedCtx = await grantPassGpra();
  const suspendedReady = await pipelineAuthPosture(suspendedCtx, "CC-02");
  await suspend(suspendedCtx, suspendedReady);
  await suspendedCtx.domain3.invalidateGpra({
    gpraId: suspendedCtx.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Material CB change renders GPRA-bound RVA non-compliant",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });
  await expectThrowsAsync(
    "resumption under invalidated GPRA rejected",
    () => suspendedCtx.domain3.resumeGovernedHandoff(resumeInput(suspendedReady)),
    "invalid_handoff_resumption",
  );
}

section("8. Brain / MAGAC / invented class cannot perform HERCM acts");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  await suspend(ctx, ready);
  for (const [label, overrides] of [
    ["MAGAC cannot resume", { authorityClassId: MAGAC }],
    ["invented class cannot resume", { authorityClassId: "invented_handoff_authority" }],
    ["Brain resumedBy rejected", { resumedBy: "brain_runtime" }],
    ["Brain source attribution rejected on resumption", { sourceAttribution: "brain_runtime" }],
    ["prohibited performer class rejected on resumption", { performerClass: "brain" }],
  ] as const) {
    await expectThrowsAsync(
      label,
      () => ctx.domain3.resumeGovernedHandoff(resumeInput(ready, overrides) as never),
      "invalid_handoff_resumption",
    );
  }

  const reentryCtx = await grantPassGpra();
  const reentryReady = await pipelineAuthPosture(reentryCtx);
  await withdraw(reentryCtx, reentryReady);
  for (const [label, overrides] of [
    ["MAGAC cannot reenter", { authorityClassId: MAGAC }],
    ["invented class cannot reenter", { authorityClassId: "invented_handoff_authority" }],
    ["Brain reenteredBy rejected", { reenteredBy: "brain_runtime" }],
    ["Brain source attribution rejected on reentry", { sourceAttribution: "brain_runtime" }],
    ["prohibited performer class rejected on reentry", { performerClass: "magac" }],
  ] as const) {
    await expectThrowsAsync(
      label,
      () => reentryCtx.domain3.reenterGovernedHandoff(reenterInput(reentryReady, overrides) as never),
      "invalid_handoff_reentry",
    );
  }
}

section("9. R128/R129 — export_ready alone and automatic recovery never mint a HERCM act");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  await withdraw(ctx, ready);
  // The pure assessor denies an export_ready-only basis; the repository boundary refuses
  // the claim outright so it can never reach a mint path.
  const exportReadyAlone = assessGovernedHandoffReentry({
    entry: null,
    entryCurrency: null,
    binding: null,
    bindingCurrency: null,
    authorization: null,
    authorizationCurrency: null,
    posture: null,
    postureCurrency: null,
    gpraValidityPosture: "retention",
    eligibilityLayerCondition: "export_ready",
    lineageMatchesAuthoritativeGpra: true,
    hercmCategory: "REC-03",
    constitutionalBasisKind: REENTRY_EXPORT_BASIS,
    exportReadyAlone: true,
  });
  expect("export_ready alone does not mint re-entry", exportReadyAlone.mayReenter, false);
  expectTruthy(
    "denial export_ready_alone_cannot_be_sole_basis",
    exportReadyAlone.denialReasons.includes("export_ready_alone_cannot_be_sole_basis"),
  );
  await expectThrowsAsync(
    "exportReadyAlone refused at repository boundary on assess",
    () => ctx.domain3.assessGovernedHandoffReentry(reenterInput(ready, { exportReadyAlone: true })),
    "invalid_handoff_reentry",
  );
  await expectThrowsAsync(
    "exportReadyAlone rejected on mint",
    () => ctx.domain3.reenterGovernedHandoff(reenterInput(ready, { exportReadyAlone: true })),
    "invalid_handoff_reentry",
  );
  for (const key of ["automaticRecovery", "autoReenter", "restoreHandoff", "reviveHandoff"]) {
    await expectThrowsAsync(
      `${key} rejected on re-entry`,
      () => ctx.domain3.reenterGovernedHandoff(reenterInput(ready, { [key]: true }) as never),
      "invalid_handoff_reentry",
    );
  }

  const resumeCtx = await grantPassGpra();
  const resumeReady = await pipelineAuthPosture(resumeCtx);
  await suspend(resumeCtx, resumeReady);
  for (const key of ["automaticRecovery", "autoResume", "restoreHandoff", "reenterHandoff"]) {
    await expectThrowsAsync(
      `${key} rejected on resumption`,
      () => resumeCtx.domain3.resumeGovernedHandoff(resumeInput(resumeReady, { [key]: true }) as never),
      "invalid_handoff_resumption",
    );
  }
  await expectThrowsAsync(
    "exportReadyAlone refused for resumption",
    () =>
      resumeCtx.domain3.assessGovernedHandoffResumption(
        resumeInput(resumeReady, { exportReadyAlone: true }),
      ),
    "invalid_handoff_resumption",
  );
}

section("10. eight-type matrix; reentry/resumption are matrix members; no ninth type");

{
  for (const label of ["reentry", "resumption"] as const) {
    try {
      assertHgaMatrixActType(label);
      assertHercmActIsHgaMatrixActType(label);
      passed++;
      console.log(`  ✓ ${label} is an HGA matrix act type`);
    } catch {
      failed++;
      failures.push(`${label} is an HGA matrix act type`);
      console.log(`  ✗ ${label} is an HGA matrix act type`);
    }
  }
  for (const label of ["re-entry", "resume", "restoration", "rejection", "exit_boundary"]) {
    expectThrows(`assertHgaMatrixActType(${label}) throws`, () =>
      assertHgaMatrixActType(label),
    );
    assertHercmActIsNotHgaMatrixActType(label);
    passed++;
    console.log(`  ✓ ${label} absent from the HGA matrix`);
  }
  expect("matrix act types eight", [...HGA_MATRIX_ACT_TYPES], [
    "authorization",
    "posture_declaration",
    "completion",
    "suspension",
    "withdrawal",
    "recall",
    "reentry",
    "resumption",
  ]);

  const domain1 = createDomain1Repository();
  const domain2 = createDomain2Repository(domain1);
  const repo = createDomain3Repository(domain2, undefined, domain1) as unknown as Record<
    string,
    unknown
  >;
  expect("resumeGovernedHandoff on repository", typeof repo.resumeGovernedHandoff, "function");
  expect("reenterGovernedHandoff on repository", typeof repo.reenterGovernedHandoff, "function");
  expect("restoreGovernedHandoff absent", typeof repo.restoreGovernedHandoff, "undefined");
  expect("reinstateGovernedHandoff absent", typeof repo.reinstateGovernedHandoff, "undefined");
  expect("performHgaAct absent", typeof repo.performHgaAct, "undefined");
}

section("11. forged HERCM rehydration fails closed");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const suspension = await suspend(ctx, ready);
  const resumption = await ctx.domain3.resumeGovernedHandoff(resumeInput(ready));
  const lineage = {
    entry: ready.entry,
    binding: ready.binding,
    authorization: ready.authorization,
    posture: ready.posture,
    preparation: ready.prep,
    gpra: ctx.gpra,
    review: ctx.review,
    determination: ctx.determination,
  };
  const loadedResumption = rehydrateGovernedHandoffResumption(resumption, {
    ...lineage,
    suspension,
  });
  expect("lawful resumption rehydration", loadedResumption.resumptionActId, resumption.resumptionActId);
  for (const [label, forged] of [
    ["forged resumption scope", { ...resumption, authorityConstitutionalScope: "handoff_recall_act" }],
    ["forged resumption class", { ...resumption, authorityClassId: "invented_handoff_authority" }],
    ["forged resumption category", { ...resumption, hercmCategory: "REC-03" }],
    ["forged resumption basis", { ...resumption, constitutionalBasisKind: REENTRY_EXPORT_BASIS }],
  ] as const) {
    expectThrows(
      `${label} rejected on validate`,
      () => validatePersistedGovernedHandoffResumption(forged),
      "invalid_handoff_resumption",
    );
    expectThrows(
      `${label} rejected on rehydrate`,
      () => rehydrateGovernedHandoffResumption(forged, { ...lineage, suspension }),
      "invalid_handoff_resumption",
    );
  }

  const reentryCtx = await grantPassGpra();
  const reentryReady = await pipelineAuthPosture(reentryCtx);
  const withdrawal = await withdraw(reentryCtx, reentryReady);
  const reentry = await reentryCtx.domain3.reenterGovernedHandoff(reenterInput(reentryReady));
  const reentryLineage = {
    entry: reentryReady.entry,
    binding: reentryReady.binding,
    authorization: reentryReady.authorization,
    posture: reentryReady.posture,
    withdrawal,
    preparation: reentryReady.prep,
    gpra: reentryCtx.gpra,
    review: reentryCtx.review,
    determination: reentryCtx.determination,
  };
  const loadedReentry = rehydrateGovernedHandoffReentry(reentry, reentryLineage);
  expect("lawful re-entry rehydration", loadedReentry.reentryActId, reentry.reentryActId);
  for (const [label, forged] of [
    ["forged reentry scope", { ...reentry, authorityConstitutionalScope: "handoff_resumption_act" }],
    ["forged reentry class", { ...reentry, authorityClassId: "invented_handoff_authority" }],
    ["forged reentry category", { ...reentry, hercmCategory: "REC-02" }],
    ["forged reentry basis", { ...reentry, constitutionalBasisKind: RESUMPTION_BASIS }],
  ] as const) {
    expectThrows(
      `${label} rejected on validate`,
      () => validatePersistedGovernedHandoffReentry(forged),
      "invalid_handoff_reentry",
    );
    expectThrows(
      `${label} rejected on rehydrate`,
      () => rehydrateGovernedHandoffReentry(forged, reentryLineage),
      "invalid_handoff_reentry",
    );
  }

  // Foreign binding lineage must fail closed.
  const foreignBinding = await ctx.domain3.bindHccmConsumerClass({
    entryId: ready.entry.entryId,
    consumerClassId: "CC-02",
    boundBy: ACTOR,
  });
  expectThrows(
    "foreign binding on resumption rehydrate rejected",
    () =>
      rehydrateGovernedHandoffResumption(resumption, {
        ...lineage,
        binding: foreignBinding,
        suspension,
      }),
    "invalid_handoff_resumption",
  );
}

section("12. R135/R139 — histories remain loadable and repeated HERCM acts are additive");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const firstSuspension = await suspend(ctx, ready);
  const firstResumption = await ctx.domain3.resumeGovernedHandoff(resumeInput(ready));
  const secondSuspension = await suspend(ctx, ready);
  const resuspended = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("re-suspension controls again", resuspended.currentState, "suspended");
  expect(
    "first resumption no longer clears projection",
    resuspended.resumptionClearsSuspendedProjection,
    false,
  );

  const secondResumption = await ctx.domain3.resumeGovernedHandoff(resumeInput(ready));
  expect(
    "second resumption targets the later suspension",
    secondResumption.resumedSuspensionActId,
    secondSuspension.suspensionActId,
  );
  const resumedAgain = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("second resumption lifts the pause", resumedAgain.currentState, "authorized");
  expect(
    "second resumption is the tip",
    resumedAgain.authoritativeResumptionActId,
    secondResumption.resumptionActId,
  );

  const resumptions = await ctx.domain3.listGovernedHandoffResumptionActsByBinding(
    ready.binding.bindingId,
  );
  expect("both resumptions preserved", resumptions.length, 2);
  expect(
    "first resumption still loadable",
    (await ctx.domain3.loadGovernedHandoffResumptionAct(firstResumption.resumptionActId))
      ?.resumptionActId,
    firstResumption.resumptionActId,
  );
  expect(
    "superseded resumption currency stale",
    await ctx.domain3.evaluateHandoffResumptionCurrency(firstResumption.resumptionActId),
    "stale",
  );

  const suspensions = await ctx.domain3.listGovernedHandoffSuspensionActsByBinding(
    ready.binding.bindingId,
  );
  expect("suspension history preserved", suspensions.length, 2);
  expectTruthy(
    "first suspension still loadable after HERCM",
    (await ctx.domain3.loadGovernedHandoffSuspensionAct(firstSuspension.suspensionActId)) !== null,
  );
  expect(
    "resumptions listable by entry",
    (await ctx.domain3.listGovernedHandoffResumptionActsByEntry(ready.entry.entryId)).length,
    2,
  );
  expect(
    "resumptions listable by GPRA",
    (await ctx.domain3.listGovernedHandoffResumptionActsByGpra(ctx.gpra.gpraId)).length,
    2,
  );

  // Re-entry history stays loadable alongside the surviving cessation tip.
  const reentryCtx = await grantPassGpra();
  const reentryReady = await pipelineAuthPosture(reentryCtx);
  const withdrawal = await withdraw(reentryCtx, reentryReady);
  const firstReentry = await reentryCtx.domain3.reenterGovernedHandoff(reenterInput(reentryReady));
  const secondReentry = await reentryCtx.domain3.reenterGovernedHandoff(reenterInput(reentryReady));
  const reentries = await reentryCtx.domain3.listGovernedHandoffReentryActsByBinding(
    reentryReady.binding.bindingId,
  );
  expect("both re-entries preserved", reentries.length, 2);
  expect(
    "authoritative re-entry is the latest",
    (await reentryCtx.domain3.getAuthoritativeHandoffReentryForBinding(
      reentryReady.binding.bindingId,
    ))?.reentryActId,
    secondReentry.reentryActId,
  );
  expect(
    "superseded re-entry currency stale",
    await reentryCtx.domain3.evaluateHandoffReentryCurrency(firstReentry.reentryActId),
    "stale",
  );
  expectTruthy(
    "withdrawal still loadable after re-entry",
    (await reentryCtx.domain3.loadGovernedHandoffWithdrawalAct(withdrawal.withdrawalActId)) !== null,
  );
}

console.log(`\nHERCM R126–R139 tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
