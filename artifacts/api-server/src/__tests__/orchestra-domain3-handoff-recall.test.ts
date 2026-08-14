/**
 * ORCH-IMP-029 — STD-015 HOF-G6-U4 Handoff Recall (R112–R125).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-recall.test.ts
 */

import {
  addObligationToProgram,
  assessG6SharedPreconditions,
  assertHgaMatrixActMayBePerformed,
  assertHrtcmRecallTriggerId,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  declareProductionIntent,
  determineExplorationEntry,
  draftProductionProgram,
  FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES,
  getHgaMatrixActOperativeStatus,
  GOVERNED_HANDOFF_RECALL_TRACEABILITY,
  governProductionProgram,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
  HRTCM_RECALL_TRIGGER_IDS,
  HRTCM_RECALL_TRIGGER_TRACEABILITY,
  isOrchestraConstitutionalError,
  listMandatoryReviewDimensionIds,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  assertR112PlusUnavailable,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";
import { rehydrateGovernedHandoffRecall } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffRecall } from "../orchestra/persistence/domain3-validation.js";

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

function section(name: string): void {
  console.log(`\n${name}`);
}

const ACTOR = "governance-authority-015";
const MAGAC = "approval_authority_production_obligation_scope" as const;
const IVAC = "invalidation_authority_production_obligation_scope" as const;
const HGA = HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID;
const HANDOFF_CTX = "handoff-consumer-context-opaque-001";
const CONSUMER_KEYS = ["manufacturing", "fulfillment", "catalog", "archival", "production"] as const;

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-015 HOF-G6-U4 Handoff Recall",
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
    constitutionalPurpose: "HOF-G6-U4 recall scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G6-U4",
        observations: [{
          kind: "compatibility_observation",
          text: "Compatible with FI-MFG-PRN-001",
          relatedSourceStandardId: "FI-MFG-PRN-001",
        }],
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
    grounds: "Pass for HOF-G6-U4",
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

async function bindCc(
  ctx: Awaited<ReturnType<typeof grantPassGpra>>,
  entryId: string,
  consumerClassId: "CC-01" | "CC-02" | "CC-03" | "CC-04" | "CC-05" | "CC-06",
) {
  return ctx.domain3.bindHccmConsumerClass({
    entryId: entryId as never,
    consumerClassId,
    boundBy: ACTOR,
  });
}

async function authorize(
  ctx: Awaited<ReturnType<typeof grantPassGpra>>,
  entryId: string,
  consumerClassId: "CC-01" | "CC-02" | "CC-03" | "CC-04" | "CC-05" | "CC-06",
) {
  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entryId as never,
    consumedBy: ACTOR,
  });
  const authorization = await ctx.domain3.authorizeGovernedHandoff({
    entryId: entryId as never,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId,
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });
  return { consumption, authorization };
}

async function pipelineAuthPosture(
  ctx: Awaited<ReturnType<typeof grantPassGpra>>,
  consumerClassId: "CC-01" | "CC-02" = "CC-01",
) {
  const { prep, entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, consumerClassId);
  const { consumption, authorization } = await authorize(ctx, entry.entryId, consumerClassId);
  const posture = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  return { prep, entry, binding, consumption, authorization, posture };
}

function recallInput(
  ready: Awaited<ReturnType<typeof pipelineAuthPosture>>,
  overrides: Record<string, unknown> = {},
) {
  return {
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    recalledBy: ACTOR,
    satisfiedHrtcmTriggers: ["RTC-04"],
    postureChainGovernanceCessationSatisfied: true,
    ...overrides,
  };
}

section("1. catalogs, R112–R125 traceability, HGA recall scope, barrel boundary");

{
  expectTruthy(
    "traceability R112",
    GOVERNED_HANDOFF_RECALL_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R112"),
  );
  expectTruthy(
    "traceability R125",
    GOVERNED_HANDOFF_RECALL_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R125"),
  );
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_RECALL_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
  expectTruthy(
    "HRTCM traceability",
    HRTCM_RECALL_TRIGGER_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R115"),
  );
  expect(
    "HRTCM ids RTC-01..04",
    [...HRTCM_RECALL_TRIGGER_IDS],
    ["RTC-01", "RTC-02", "RTC-03", "RTC-04"],
  );
  const hga = FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!;
  expectTruthy(
    "HGA includes recall scope",
    hga.authorizedConstitutionalScopes.includes("handoff_recall_act"),
  );
  expect("recall catalog operative", getHgaMatrixActOperativeStatus("recall"), "operative");
  assertHgaMatrixActMayBePerformed("recall");
  passed++;
  console.log("  ✓ recall mayBePerformed");

  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffRecallActRecord not on barrel",
    "createGovernedHandoffRecallActRecord" in mod,
    false,
  );
  expect("recallGovernedHandoff not on barrel", "recallGovernedHandoff" in mod, false);
  expect("assessGovernedHandoffRecall on barrel", "assessGovernedHandoffRecall" in mod, true);
}

section("2. U1 P1 requires attributable HGA class; MAGAC/invented/Brain rejected");

{
  const base = {
    actType: "recall",
    bindingId: "governed-handoff-consumer-binding-test",
    hasPriorAuthorization: true,
    hasPriorPosture: true,
    hasLifecycleOperativeHistory: true,
    hccmBoundContextEstablished: true,
    traceableConstitutionalBasis: true,
  };
  const booleanOnly = assessG6SharedPreconditions({
    ...base,
    hgaPerformerAttributable: true,
  });
  expect("boolean attributable claim insufficient", booleanOnly.categories.c_authorizedHgaPerformerAttributable, false);
  const performerOnly = assessG6SharedPreconditions({
    ...base,
    performerClass: "workflow_operator",
  });
  expect("nonprohibited performer alone insufficient", performerOnly.categories.c_authorizedHgaPerformerAttributable, false);

  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  for (const [label, overrides] of [
    ["MAGAC cannot recall", { authorityClassId: MAGAC }],
    ["invented authority class cannot recall", { authorityClassId: "invented_handoff_authority" }],
    ["Brain recalledBy rejected", { recalledBy: "brain_runtime" }],
    ["Brain source attribution rejected", { sourceAttribution: "brain_runtime" }],
  ] as const) {
    await expectThrowsAsync(
      label,
      () => ctx.domain3.recallGovernedHandoff(recallInput(ready, overrides) as never),
      "invalid_handoff_recall",
    );
  }
}

section("3. lawful RTC-04 recall under retention GPRA projects recalled");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const assessment = await ctx.domain3.evaluateGovernedHandoffRecall(recallInput(ready));
  expect("may recall without completion or suspension", assessment.mayRecall, true);
  expect("catalog alone does not mint", assessment.doesNotAuthorizeActMintViaCatalogAlone, true);

  const act = await ctx.domain3.recallGovernedHandoff(recallInput(ready));
  expect("scope handoff_recall_act", act.authorityConstitutionalScope, "handoff_recall_act");
  expect("HOEM actType recall", act.hoemRecallRecord.actType, "recall");
  expect("effect framing responsive termination", act.effectFraming, "responsive_forward_reliance_termination");
  expect("forward reliance ceased", act.forwardRelianceCeased, true);
  expect("authorization retained", act.doesNotEraseAuthorization, true);
  expect("posture retained", act.doesNotErasePosture, true);
  expect("not suspension", act.notHandoffSuspension, true);
  expect("not withdrawal", act.notHandoffWithdrawal, true);
  expect("no reentry mint", act.notHercmReentry, true);
  validatePersistedGovernedHandoffRecall(act);

  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("HSLM recalled", lifecycle.currentState, "recalled");
  expect("authoritative recall", lifecycle.authoritativeRecallActId, act.recallActId);
  expect("recall mechanics operative", lifecycle.recallMechanicsOperative, true);
  expect("recall currency current", await ctx.domain3.evaluateHandoffRecallCurrency(act.recallActId), "current");
}

section("4. missing HRTCM triggers deny/throw; invalid trigger id throws; notes alone insufficient");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);

  const missing = await ctx.domain3.evaluateGovernedHandoffRecall({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    recalledBy: ACTOR,
    postureChainGovernanceCessationSatisfied: true,
  });
  expect("missing triggers mayRecall false", missing.mayRecall, false);
  expectTruthy(
    "missing triggers denial",
    missing.denialReasons.includes("at_least_one_hrtcm_rtc_required"),
  );
  await expectThrowsAsync(
    "missing triggers mint rejected",
    () =>
      ctx.domain3.recallGovernedHandoff({
        entryId: ready.entry.entryId,
        bindingId: ready.binding.bindingId,
        authorityClassId: HGA,
        recalledBy: ACTOR,
        postureChainGovernanceCessationSatisfied: true,
      }),
    "invalid_handoff_recall",
  );

  expectThrows(
    "invalid trigger id throws",
    () => assertHrtcmRecallTriggerId("RTC-99"),
    "invalid_handoff_recall",
  );
  await expectThrowsAsync(
    "invalid trigger id mint rejected",
    () =>
      ctx.domain3.recallGovernedHandoff(
        recallInput(ready, { satisfiedHrtcmTriggers: ["RTC-99"] }),
      ),
    "invalid_handoff_recall",
  );

  await expectThrowsAsync(
    "notes alone rejected",
    () =>
      ctx.domain3.recallGovernedHandoff({
        entryId: ready.entry.entryId,
        bindingId: ready.binding.bindingId,
        authorityClassId: HGA,
        recalledBy: ACTOR,
        hrtcmTriggerEvidenceNotes: "recall now",
      }),
    "invalid_handoff_recall",
  );
  expect(
    "invalid attempts minted no recall",
    (await ctx.domain3.listGovernedHandoffRecallActsByBinding(ready.binding.bindingId)).length,
    0,
  );
}

section("5. RTC-01 path after GPRA invalidation succeeds; history preserved");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx, "CC-02");

  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Material CB change renders GPRA-bound RVA non-compliant",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });

  const act = await ctx.domain3.recallGovernedHandoff(
    recallInput(ready, { satisfiedHrtcmTriggers: ["RTC-01"] }),
  );
  expect("RTC-01 recall succeeds", act.satisfiedHrtcmTriggers.includes("RTC-01"), true);
  expect(
    "HSLM recalled after invalidation",
    (await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId)).currentState,
    "recalled",
  );
  expect(
    "historical authorization loadable",
    (await ctx.domain3.loadGovernedHandoffAuthorizationAct(ready.authorization.authorizationActId))
      ?.authorizationActId,
    ready.authorization.authorizationActId,
  );
  expect(
    "historical posture loadable",
    (await ctx.domain3.loadGovernedHandoffPostureDeclarationAct(ready.posture.postureDeclarationActId))
      ?.postureDeclarationActId,
    ready.posture.postureDeclarationActId,
  );
}

section("6. RTC-01 without invalidation fails");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const assessment = await ctx.domain3.evaluateGovernedHandoffRecall(
    recallInput(ready, { satisfiedHrtcmTriggers: ["RTC-01"] }),
  );
  expect("RTC-01 without invalidation mayRecall false", assessment.mayRecall, false);
  expectTruthy(
    "RTC-01 requires invalidated GPRA",
    assessment.denialReasons.includes("rtc_01_requires_gpra_invalidated"),
  );
  await expectThrowsAsync(
    "RTC-01 without invalidation rejected",
    () =>
      ctx.domain3.recallGovernedHandoff(
        recallInput(ready, { satisfiedHrtcmTriggers: ["RTC-01"] }),
      ),
    "invalid_handoff_recall",
  );
}

section("7. RTC-03 with hrwmEligibilityLossSatisfied under retention succeeds");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const act = await ctx.domain3.recallGovernedHandoff(
    recallInput(ready, {
      satisfiedHrtcmTriggers: ["RTC-03"],
      hrwmEligibilityLossSatisfied: true,
    }),
  );
  expect("RTC-03 recall succeeds", act.satisfiedHrtcmTriggers.includes("RTC-03"), true);

  const ctx2 = await grantPassGpra();
  const ready2 = await pipelineAuthPosture(ctx2);
  await expectThrowsAsync(
    "RTC-03 without hrwm flag rejected",
    () =>
      ctx2.domain3.recallGovernedHandoff(
        recallInput(ready2, { satisfiedHrtcmTriggers: ["RTC-03"] }),
      ),
    "invalid_handoff_recall",
  );

  const ctx3 = await grantPassGpra();
  const ready3 = await pipelineAuthPosture(ctx3, "CC-02");
  await ctx3.domain3.invalidateGpra({
    gpraId: ctx3.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Material CB change renders GPRA-bound RVA non-compliant",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });
  await expectThrowsAsync(
    "RTC-03 incompatible with invalidated GPRA",
    () =>
      ctx3.domain3.recallGovernedHandoff(
        recallInput(ready3, {
          satisfiedHrtcmTriggers: ["RTC-03"],
          hrwmEligibilityLossSatisfied: true,
        }),
      ),
    "invalid_handoff_recall",
  );
}

section("8. after withdrawal, recall fails forward_reliance_already_ceased (R114)");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  await ctx.domain3.withdrawGovernedHandoff({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    withdrawnBy: ACTOR,
    constitutionalBasisKind: "hga_initiated_forward_reliance_retraction_warranted",
  });
  const assessment = await ctx.domain3.evaluateGovernedHandoffRecall(recallInput(ready));
  expect("recall after withdrawal mayRecall false", assessment.mayRecall, false);
  expectTruthy(
    "R114 denial forward_reliance_already_ceased",
    assessment.denialReasons.includes("forward_reliance_already_ceased"),
  );
  await expectThrowsAsync(
    "recall after withdrawal rejected",
    () => ctx.domain3.recallGovernedHandoff(recallInput(ready)),
    "invalid_handoff_recall",
  );
}

section("9. after recall, second recall fails R114; only one persisted");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  await ctx.domain3.recallGovernedHandoff(recallInput(ready));
  const assessment = await ctx.domain3.evaluateGovernedHandoffRecall(recallInput(ready));
  expect("second recall mayRecall false", assessment.mayRecall, false);
  expectTruthy(
    "R114 denial on second recall",
    assessment.denialReasons.includes("forward_reliance_already_ceased"),
  );
  await expectThrowsAsync(
    "second recall rejected",
    () => ctx.domain3.recallGovernedHandoff(recallInput(ready)),
    "invalid_handoff_recall",
  );
  expect(
    "only one recall persisted",
    (await ctx.domain3.listGovernedHandoffRecallActsByBinding(ready.binding.bindingId)).length,
    1,
  );
}

section("10. suspension does NOT block RTC-04 recall; recall outranks suspended");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const suspension = await ctx.domain3.suspendGovernedHandoff({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    suspendedBy: ACTOR,
    constitutionalBasisKind: "temporary_forward_reliance_pause_warranted",
  });
  const act = await ctx.domain3.recallGovernedHandoff(recallInput(ready));
  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("recalled outranks suspended", lifecycle.currentState, "recalled");
  expect("suspension history preserved", lifecycle.authoritativeSuspensionActId, suspension.suspensionActId);
  expectTruthy("recall recorded", !!(await ctx.domain3.loadGovernedHandoffRecallAct(act.recallActId)));
}

section("11. completion/exit not required for recall");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  await ctx.domain3.completeGovernedHandoff({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    completedBy: ACTOR,
  });
  const assessment = await ctx.domain3.evaluateGovernedHandoffRecall(recallInput(ready));
  expect("may recall after completion without exit", assessment.mayRecall, true);
  const act = await ctx.domain3.recallGovernedHandoff(recallInput(ready));
  expectTruthy("recall after completion succeeds", !!act.recallActId);
}

section("12. sole substitutes throw/deny without proper HGA+RTC path");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  for (const [label, overrides] of [
    ["RTC catalog alone", { rtcCatalogAlone: true }],
    ["GPRA invalidated alone", { gpraInvalidatedAlone: true }],
    ["G11 blocked alone", { g11BlockedAlone: true }],
    ["HRWM loss alone", { hrwmLossAlone: true }],
    ["advisory evidence alone", { advisoryEvidenceAlone: true }],
  ] as const) {
    await expectThrowsAsync(
      `${label} rejected`,
      () => ctx.domain3.recallGovernedHandoff(recallInput(ready, overrides) as never),
      "invalid_handoff_recall",
    );
  }
  expect(
    "invalid attempts minted no recall",
    (await ctx.domain3.listGovernedHandoffRecallActsByBinding(ready.binding.bindingId)).length,
    0,
  );
}

section("13. foreign binding / wrong entry fails");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const foreign = await bindCc(ctx, ready.entry.entryId, "CC-02");
  await expectThrowsAsync(
    "foreign binding without matching auth/posture rejected",
    () =>
      ctx.domain3.recallGovernedHandoff({
        ...recallInput(ready),
        bindingId: foreign.bindingId,
      }),
    "invalid_handoff_recall",
  );
}

section("14. forged rehydration fails closed");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const act = await ctx.domain3.recallGovernedHandoff(recallInput(ready));
  const loaded = rehydrateGovernedHandoffRecall(act, {
    entry: ready.entry,
    binding: ready.binding,
    authorization: ready.authorization,
    posture: ready.posture,
    preparation: ready.prep,
    gpra: ctx.gpra,
    review: ctx.review,
    determination: ctx.determination,
  });
  expect("lawful rehydration succeeds", loaded.recallActId, act.recallActId);
  for (const [label, forged] of [
    ["forged scope", { ...act, authorityConstitutionalScope: "handoff_suspension_act" }],
    ["forged class", { ...act, authorityClassId: "invented_handoff_authority" }],
    ["forged trigger", { ...act, satisfiedHrtcmTriggers: ["RTC-99"] }],
  ] as const) {
    expectThrows(
      `${label} rejected on validate`,
      () => validatePersistedGovernedHandoffRecall(forged),
      "invalid_handoff_recall",
    );
    expectThrows(
      `${label} rejected on rehydrate`,
      () =>
        rehydrateGovernedHandoffRecall(forged, {
          entry: ready.entry,
          binding: ready.binding,
          authorization: ready.authorization,
          posture: ready.posture,
        }),
      "invalid_handoff_recall",
    );
  }
}

section("15. no automatic reentry fields; rejectHandoff fails; performHgaAct absent");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("no reenterHandoff", typeof repo.reenterHandoff, "undefined");
  expect("no restoreHandoff", typeof repo.restoreHandoff, "undefined");
  expect("no resumeHandoff", typeof repo.resumeHandoff, "undefined");
  expect("no performHgaAct", typeof repo.performHgaAct, "undefined");
  await expectThrowsAsync(
    "rejectHandoff field rejected",
    () =>
      ctx.domain3.recallGovernedHandoff(
        recallInput(ready, { rejectHandoff: true }),
      ),
    "invalid_handoff_recall",
  );
}

section("16. R126 unavailable guard; recall mechanics operative");

{
  assertR112PlusUnavailable("r126");
  passed++;
  console.log("  ✓ assertR112PlusUnavailable no-op retained");
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("recall mechanics operative before recall", lifecycle.recallMechanicsOperative, true);
}

section("17. withdrawal after recall fails (R100)");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  await ctx.domain3.recallGovernedHandoff(recallInput(ready));
  const assessment = await ctx.domain3.evaluateGovernedHandoffWithdrawal({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    constitutionalBasisKind: "hga_initiated_forward_reliance_retraction_warranted",
  });
  expect("withdrawal after recall mayWithdraw false", assessment.mayWithdraw, false);
  expectTruthy(
    "R100 denial forward_reliance_already_ceased",
    assessment.denialReasons.includes("forward_reliance_already_ceased"),
  );
  await expectThrowsAsync(
    "withdrawal after recall rejected",
    () =>
      ctx.domain3.withdrawGovernedHandoff({
        entryId: ready.entry.entryId,
        bindingId: ready.binding.bindingId,
        authorityClassId: HGA,
        withdrawnBy: ACTOR,
        constitutionalBasisKind: "hga_initiated_forward_reliance_retraction_warranted",
      }),
    "invalid_handoff_withdrawal",
  );
}

section("18. catalog membership / RTC catalog alone does not mint without HGA path");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const assessment = await ctx.domain3.evaluateGovernedHandoffRecall(recallInput(ready));
  expect("catalog alone does not mint", assessment.doesNotAuthorizeActMintViaCatalogAlone, true);
  expect("RTC catalog alone does not mint", assessment.doesNotAuthorizeActMintViaRtcCatalogAlone, true);
  await expectThrowsAsync(
    "hrtcmRtcAlone rejected",
    () =>
      ctx.domain3.recallGovernedHandoff(
        recallInput(ready, { hrtcmRtcAlone: true }),
      ),
    "invalid_handoff_recall",
  );
}

console.log(`\nHOF-G6-U4 recall tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exit(1);
}
