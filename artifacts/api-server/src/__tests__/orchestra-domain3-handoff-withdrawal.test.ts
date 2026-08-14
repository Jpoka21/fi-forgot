/**
 * ORCH-IMP-028 — STD-015 HOF-G6-U3 Handoff Withdrawal (R98–R111).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-withdrawal.test.ts
 */

import {
  addObligationToProgram,
  assessG6SharedPreconditions,
  assertHgaMatrixActMayBePerformed,
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
  GOVERNED_HANDOFF_WITHDRAWAL_TRACEABILITY,
  governProductionProgram,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
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
import { rehydrateGovernedHandoffWithdrawal } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffWithdrawal } from "../orchestra/persistence/domain3-validation.js";

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
const HGA = HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID;
const HANDOFF_CTX = "handoff-consumer-context-opaque-001";
const CONSUMER_KEYS = ["manufacturing", "fulfillment", "catalog", "archival", "production"] as const;
const BASIS = "hga_initiated_forward_reliance_retraction_warranted" as const;

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-015 HOF-G6-U3 Handoff Withdrawal",
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
    constitutionalPurpose: "HOF-G6-U3 withdrawal scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G6-U3",
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
    grounds: "Pass for HOF-G6-U3",
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

async function completeAndExit(
  ctx: Awaited<ReturnType<typeof grantPassGpra>>,
  ready: Awaited<ReturnType<typeof pipelineAuthPosture>>,
) {
  const completion = await ctx.domain3.completeGovernedHandoff({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    completedBy: ACTOR,
  });
  const exit = await ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    attributedBy: ACTOR,
  });
  return { completion, exit };
}

function withdrawalInput(
  ready: Awaited<ReturnType<typeof pipelineAuthPosture>>,
  overrides: Record<string, unknown> = {},
) {
  return {
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    withdrawnBy: ACTOR,
    constitutionalBasisKind: BASIS,
    ...overrides,
  };
}

section("catalogs, R98–R111 traceability, and barrel boundary");

{
  expectTruthy(
    "traceability R98",
    GOVERNED_HANDOFF_WITHDRAWAL_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R98"),
  );
  expectTruthy(
    "traceability R111",
    GOVERNED_HANDOFF_WITHDRAWAL_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R111"),
  );
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_WITHDRAWAL_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
  const hga = FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!;
  expectTruthy(
    "HGA includes withdrawal scope",
    hga.authorizedConstitutionalScopes.includes("handoff_withdrawal_act"),
  );
  expect("withdrawal catalog operative", getHgaMatrixActOperativeStatus("withdrawal"), "operative");
  expect("recall catalog operative", getHgaMatrixActOperativeStatus("recall"), "operative");
  assertHgaMatrixActMayBePerformed("withdrawal");
  passed++;
  console.log("  ✓ withdrawal mayBePerformed");
  assertHgaMatrixActMayBePerformed("recall");
  passed++;
  console.log("  ✓ recall mayBePerformed");

  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffWithdrawalActRecord not on barrel",
    "createGovernedHandoffWithdrawalActRecord" in mod,
    false,
  );
  expect("withdrawGovernedHandoff not on barrel", "withdrawGovernedHandoff" in mod, false);
  expect("assessGovernedHandoffWithdrawal on barrel", "assessGovernedHandoffWithdrawal" in mod, true);
}

section("U1 P1 requires attributable HGA class");

{
  const base = {
    actType: "withdrawal",
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
    ["MAGAC cannot withdraw", { authorityClassId: MAGAC }],
    ["invented authority class cannot withdraw", { authorityClassId: "invented_handoff_authority" }],
    ["Brain withdrawnBy rejected", { withdrawnBy: "brain_runtime" }],
    ["Brain source attribution rejected", { sourceAttribution: "brain_runtime" }],
  ] as const) {
    await expectThrowsAsync(
      label,
      () => ctx.domain3.withdrawGovernedHandoff(withdrawalInput(ready, overrides) as never),
      "invalid_handoff_withdrawal",
    );
  }
}

section("lawful withdrawal without suspension projects withdrawn");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const assessment = await ctx.domain3.evaluateGovernedHandoffWithdrawal({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    constitutionalBasisKind: BASIS,
  });
  expect("may withdraw without completion or suspension", assessment.mayWithdraw, true);
  expect("catalog alone does not mint", assessment.doesNotAuthorizeActMintViaCatalogAlone, true);

  const act = await ctx.domain3.withdrawGovernedHandoff(withdrawalInput(ready));
  expect("scope handoff_withdrawal_act", act.authorityConstitutionalScope, "handoff_withdrawal_act");
  expect("HOEM actType withdrawal", act.hoemWithdrawalRecord.actType, "withdrawal");
  expect("effect framing retraction", act.effectFraming, "hga_initiated_retraction");
  expect("forward reliance ceased", act.forwardRelianceCeased, true);
  expect("authorization retained", act.doesNotEraseAuthorization, true);
  expect("posture retained", act.doesNotErasePosture, true);
  expect("not suspension", act.notHandoffSuspension, true);
  expect("not recall", act.notHandoffRecall, true);
  expect("no reentry mint", act.notHercmReentry, true);
  validatePersistedGovernedHandoffWithdrawal(act);

  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("HSLM withdrawn", lifecycle.currentState, "withdrawn");
  expect("authoritative withdrawal", lifecycle.authoritativeWithdrawalActId, act.withdrawalActId);
  expect("withdrawal mechanics operative", lifecycle.withdrawalMechanicsOperative, true);
  expect("recall mechanics operative", lifecycle.recallMechanicsOperative, true);
  expect("withdrawal currency current", await ctx.domain3.evaluateHandoffWithdrawalCurrency(act.withdrawalActId), "current");
}

section("withdrawal after suspension is lawful and outranks suspension/completion");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const completion = await ctx.domain3.completeGovernedHandoff({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    completedBy: ACTOR,
  });
  const suspension = await ctx.domain3.suspendGovernedHandoff({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    suspendedBy: ACTOR,
    constitutionalBasisKind: "temporary_forward_reliance_pause_warranted",
  });
  const act = await ctx.domain3.withdrawGovernedHandoff(withdrawalInput(ready));
  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId);
  expect("withdrawn outranks suspended/completed", lifecycle.currentState, "withdrawn");
  expect("completion history preserved", lifecycle.authoritativeCompletionActId, completion.completionActId);
  expect("suspension history preserved", lifecycle.authoritativeSuspensionActId, suspension.suspensionActId);
  expect(
    "historical authorization loadable",
    (await ctx.domain3.loadGovernedHandoffAuthorizationAct(ready.authorization.authorizationActId))
      ?.authorizationActId,
    ready.authorization.authorizationActId,
  );
  expect(
    "historical posture loadable",
    (await ctx.domain3.loadGovernedHandoffPostureDeclarationAct(
      ready.posture.postureDeclarationActId,
    ))?.postureDeclarationActId,
    ready.posture.postureDeclarationActId,
  );
  expect(
    "historical suspension loadable",
    (await ctx.domain3.loadGovernedHandoffSuspensionAct(suspension.suspensionActId))
      ?.suspensionActId,
    suspension.suspensionActId,
  );
  expect("withdrawal recorded", !!(await ctx.domain3.loadGovernedHandoffWithdrawalAct(act.withdrawalActId)), true);
}

section("second current withdrawal fails with forward reliance already ceased");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  await ctx.domain3.withdrawGovernedHandoff(withdrawalInput(ready));
  const assessment = await ctx.domain3.evaluateGovernedHandoffWithdrawal({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    constitutionalBasisKind: BASIS,
  });
  expect("second withdrawal mayWithdraw false", assessment.mayWithdraw, false);
  expectTruthy(
    "R100 denial forward_reliance_already_ceased",
    assessment.denialReasons.includes("forward_reliance_already_ceased"),
  );
  await expectThrowsAsync(
    "second withdrawal rejected",
    () => ctx.domain3.withdrawGovernedHandoff(withdrawalInput(ready)),
    "invalid_handoff_withdrawal",
  );
  expect(
    "only one withdrawal persisted",
    (await ctx.domain3.listGovernedHandoffWithdrawalActsByBinding(ready.binding.bindingId)).length,
    1,
  );
}

section("invalid sole bases are non-operative");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  for (const [label, overrides] of [
    ["RTC alone", { rtcCatalogAlone: true }],
    ["GPRA invalidated alone", { gpraInvalidatedAlone: true }],
    ["G11 blocked alone", { g11BlockedAlone: true }],
    ["HRWM loss alone", { hrwmLossAlone: true }],
    ["advisory alone", { advisoryEvidenceAlone: true }],
  ] as const) {
    await expectThrowsAsync(
      `${label} rejected`,
      () => ctx.domain3.withdrawGovernedHandoff(withdrawalInput(ready, overrides) as never),
      "invalid_handoff_withdrawal",
    );
  }
  await expectThrowsAsync(
    "notes alone rejected",
    () =>
      ctx.domain3.withdrawGovernedHandoff(
        withdrawalInput(ready, {
          constitutionalBasisKind: "operator_notes_only",
          constitutionalBasisNotes: "withdraw now",
        }),
      ),
    "invalid_handoff_withdrawal",
  );
  expect(
    "invalid attempts minted no withdrawal",
    (await ctx.domain3.listGovernedHandoffWithdrawalActsByBinding(ready.binding.bindingId)).length,
    0,
  );
}

section("foreign binding and wrong subject scope fail");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const foreign = await bindCc(ctx, ready.entry.entryId, "CC-02");
  await expectThrowsAsync(
    "foreign binding without matching auth/posture rejected",
    () =>
      ctx.domain3.withdrawGovernedHandoff({
        ...withdrawalInput(ready),
        bindingId: foreign.bindingId,
      }),
    "invalid_handoff_withdrawal",
  );
  await expectThrowsAsync(
    "wrong reentry scope rejected",
    () =>
      ctx.domain3.evaluateGovernedHandoffWithdrawal({
        entryId: ready.entry.entryId,
        bindingId: ready.binding.bindingId,
        constitutionalBasisKind: BASIS,
        reenterHandoff: true,
      }),
    "invalid_handoff_withdrawal",
  );
}

section("existing exit boundary does not block or rewrite withdrawal");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const { completion, exit } = await completeAndExit(ctx, ready);
  const act = await ctx.domain3.withdrawGovernedHandoff(withdrawalInput(ready));
  expectTruthy("withdrawal after completion and exit succeeds", !!act.withdrawalActId);
  const exits = await ctx.domain3.listGovernedHandoffDownstreamExitBoundaryAttributionsByBinding(
    ready.binding.bindingId,
  );
  expect("one exit remains", exits.length, 1);
  expect("exit boundary not rewritten", exits[0]!.exitBoundaryAttributionId, exit.exitBoundaryAttributionId);
  expect("exit completion attribution retained", exits[0]!.completionActId, completion.completionActId);
  expect(
    "withdrawn outranks completed with exit",
    (await ctx.domain3.evaluateHandoffActLayerLifecycle(ready.binding.bindingId)).currentState,
    "withdrawn",
  );
}

section("recallGovernedHandoff present; no reentry, restore, or generic mint APIs");

{
  const ctx = await grantPassGpra();
  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("withdrawGovernedHandoff repository method present", typeof repo.withdrawGovernedHandoff, "function");
  expect("recallGovernedHandoff repository method present", typeof repo.recallGovernedHandoff, "function");
  expect("no reenterHandoff", typeof repo.reenterHandoff, "undefined");
  expect("no restoreHandoff", typeof repo.restoreHandoff, "undefined");
  expect("no resumeHandoff", typeof repo.resumeHandoff, "undefined");
  expect("no performHgaAct", typeof repo.performHgaAct, "undefined");
}

section("withdrawal validation and rehydration fail closed");

{
  const ctx = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx);
  const act = await ctx.domain3.withdrawGovernedHandoff(withdrawalInput(ready));
  const loaded = rehydrateGovernedHandoffWithdrawal(act, {
    entry: ready.entry,
    binding: ready.binding,
    authorization: ready.authorization,
    posture: ready.posture,
    preparation: ready.prep,
    gpra: ctx.gpra,
    review: ctx.review,
    determination: ctx.determination,
  });
  expect("lawful rehydration succeeds", loaded.withdrawalActId, act.withdrawalActId);
  for (const [label, forged] of [
    ["forged scope", { ...act, authorityConstitutionalScope: "handoff_suspension_act" }],
    ["forged class", { ...act, authorityClassId: "invented_handoff_authority" }],
    ["forged basis", { ...act, constitutionalBasisKind: "notes_only" }],
  ] as const) {
    expectThrows(
      `${label} rejected on validate`,
      () => validatePersistedGovernedHandoffWithdrawal(forged),
      "invalid_handoff_withdrawal",
    );
    expectThrows(
      `${label} rejected on rehydrate`,
      () =>
        rehydrateGovernedHandoffWithdrawal(forged, {
          entry: ready.entry,
          binding: ready.binding,
          authorization: ready.authorization,
          posture: ready.posture,
        }),
      "invalid_handoff_withdrawal",
    );
  }
}

console.log(`\nHOF-G6-U3 withdrawal tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exit(1);
}
