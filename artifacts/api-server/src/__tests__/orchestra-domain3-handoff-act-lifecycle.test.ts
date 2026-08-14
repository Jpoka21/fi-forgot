/**
 * ORCH-IMP — STD-015 HOF-G5 Handoff Act-Layer Lifecycle (R48–R57).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-act-lifecycle.test.ts
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
  FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES,
  FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES,
  GOVERNED_HANDOFF_ACT_LAYER_LIFECYCLE_TRACEABILITY,
  governProductionProgram,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
  isFrozenHandoffActLayerLifecycleState,
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
import { rehydrateGovernedHandoffCompletion } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffCompletion } from "../orchestra/persistence/domain3-validation.js";

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
    purpose: "STD-015 HOF-G5 Handoff Act Lifecycle",
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
    constitutionalPurpose: "HOF-G5 lifecycle scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G5",
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
    grounds: "Pass for HOF-G5",
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
  return ctx.domain3.authorizeGovernedHandoff({
    entryId: entryId as never,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId,
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });
}

section("HOF-G5 catalogs, R48–R57 traceability, HGA completion/rejection scopes");

{
  expect("frozen lifecycle states length", FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES.length, 8);
  expectTruthy(
    "eligible_for_consideration frozen",
    isFrozenHandoffActLayerLifecycleState("eligible_for_consideration"),
  );
  expectTruthy("authorized frozen", isFrozenHandoffActLayerLifecycleState("authorized"));
  expectTruthy("completed frozen", isFrozenHandoffActLayerLifecycleState("completed"));
  expectTruthy("rejected frozen", isFrozenHandoffActLayerLifecycleState("rejected"));
  expectTruthy("suspended frozen", isFrozenHandoffActLayerLifecycleState("suspended"));
  expectTruthy("withdrawn frozen", isFrozenHandoffActLayerLifecycleState("withdrawn"));
  expectTruthy("recalled frozen", isFrozenHandoffActLayerLifecycleState("recalled"));
  expectTruthy("expired frozen", isFrozenHandoffActLayerLifecycleState("expired"));
  expect("active not frozen", isFrozenHandoffActLayerLifecycleState("active"), false);
  expectTruthy(
    "traceability R48",
    GOVERNED_HANDOFF_ACT_LAYER_LIFECYCLE_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R48"),
  );
  expectTruthy(
    "traceability R51",
    GOVERNED_HANDOFF_ACT_LAYER_LIFECYCLE_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R51"),
  );
  expectTruthy(
    "traceability R56",
    GOVERNED_HANDOFF_ACT_LAYER_LIFECYCLE_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R56"),
  );
  expectTruthy(
    "traceability R57",
    GOVERNED_HANDOFF_ACT_LAYER_LIFECYCLE_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R57"),
  );
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_ACT_LAYER_LIFECYCLE_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
  const hga = FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!;
  expectTruthy(
    "HGA includes completion scope",
    hga.authorizedConstitutionalScopes.includes("handoff_completion_act"),
  );
  expect(
    "HGA does NOT include invented lifecycle rejection act scope",
    hga.authorizedConstitutionalScopes.includes("handoff_lifecycle_rejection_act" as never),
    false,
  );
  expectTruthy(
    "Rejected remains in frozen HSLM catalog (R48)",
    FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES.includes("rejected"),
  );
  expectTruthy("isFrozen rejected", isFrozenHandoffActLayerLifecycleState("rejected"));
}

section("constructors / completeGovernedHandoff not on barrel");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffCompletionActRecord not on barrel",
    "createGovernedHandoffCompletionActRecord" in mod,
    false,
  );
  expect(
    "createGovernedHandoffLifecycleRejectionAttributionRecord not on barrel",
    "createGovernedHandoffLifecycleRejectionAttributionRecord" in mod,
    false,
  );
  expect("completeGovernedHandoff not on barrel", "completeGovernedHandoff" in mod, false);
  expect("rejectHandoffActLayer not on barrel", "rejectHandoffActLayer" in mod, false);
  expect(
    "assertEstablishedHandoffGovernanceAuthorityForLifecycleRejection not on barrel",
    "assertEstablishedHandoffGovernanceAuthorityForLifecycleRejection" in mod,
    false,
  );
  expect(
    "assessGovernedHandoffLifecycleRejection not on barrel",
    "assessGovernedHandoffLifecycleRejection" in mod,
    false,
  );
  expect(
    "assessGovernedHandoffCompletion on barrel",
    "assessGovernedHandoffCompletion" in mod,
    true,
  );
  expect(
    "evaluateHandoffActLayerLifecycleFromFacts on barrel",
    "evaluateHandoffActLayerLifecycleFromFacts" in mod,
    true,
  );
  expect(
    "FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES on barrel",
    "FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES" in mod,
    true,
  );
}

section("evaluate: eligible after entry+binding; authorized after auth; completed after completion; posture alone does NOT complete");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");

  const eligible = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect("eligible after entry+binding", eligible.currentState, "eligible_for_consideration");
  expect("eligible not authorization", eligible.notHandoffAuthorization, true);
  expect("eligible not posture", eligible.notHandoffPostureDeclaration, true);
  expect("G6 withdrawal/recall deferred marker", eligible.withdrawalRecallExpiredMechanicsDeferred, false);
  expect("G6 recall/expired deferred marker", eligible.recallExpiredMechanicsDeferred, true);
  expect("withdrawal mechanics operative", eligible.withdrawalMechanicsOperative, true);
  expect("suspension mechanics operative", eligible.suspensionMechanicsOperative, true);

  await authorize(ctx, entry.entryId, "CC-01");
  const authorized = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect("authorized after auth", authorized.currentState, "authorized");

  const posture = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  const afterPosture = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect("posture alone does NOT complete", afterPosture.currentState, "authorized");
  expect("posture recorded", posture.notHandoffCompletion, true);

  const completionsBefore = await ctx.domain3.listGovernedHandoffCompletionActsByBinding(
    binding.bindingId,
  );
  expect("posture creates no completion records", completionsBefore.length, 0);

  const completion = await ctx.domain3.completeGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    completedBy: ACTOR,
  });
  const completed = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect("completed after completion act", completed.currentState, "completed");
  expect("authoritative completion id", completed.authoritativeCompletionActId, completion.completionActId);
}

section("Lawful complete with HGA after posture; HOEM actType completion");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-02");
  await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  const assessment = await ctx.domain3.evaluateGovernedHandoffCompletion({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
  });
  expect("mayComplete after posture", assessment.mayComplete, true);
  expect("assessment not authorization", assessment.notHandoffAuthorization, true);
  expect("assessment not posture", assessment.notHandoffPostureDeclaration, true);

  const act = await ctx.domain3.completeGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    completedBy: ACTOR,
  });
  expect("scope handoff_completion_act", act.authorityConstitutionalScope, "handoff_completion_act");
  expect("HOEM actType completion", act.hoemCompletionRecord.actType, "completion");
  expect("not authorization", act.notHandoffAuthorization, true);
  expect("not posture", act.notHandoffPostureDeclaration, true);
  expect("not suspension", act.notHandoffSuspension, true);
  expect("not recall", act.notHandoffRecall, true);
  expect("not withdrawal", act.notHandoffWithdrawal, true);
  expect("not acceptance", act.notDownstreamAcceptance, true);
  expect("not membership", act.notPermanentCollectionMembership, true);
  validatePersistedGovernedHandoffCompletion(act);

  const currency = await ctx.domain3.evaluateHandoffCompletionCurrency(act.completionActId);
  expect("completion currency current", currency, "current");
}

section("complete without binding/posture rejected");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);

  await expectThrowsAsync(
    "complete without binding rejected",
    () =>
      ctx.domain3.completeGovernedHandoff({
        entryId: entry.entryId,
        bindingId: "governed-handoff-consumer-binding-missing" as never,
        authorityClassId: HGA,
        completedBy: ACTOR,
      }),
    "invalid_handoff_completion",
  );

  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await expectThrowsAsync(
    "complete without posture rejected",
    () =>
      ctx.domain3.completeGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        completedBy: ACTOR,
      }),
    "invalid_handoff_completion",
  );
}

section("Brain/MAGAC cannot complete");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });

  await expectThrowsAsync(
    "MAGAC cannot complete",
    () =>
      ctx.domain3.completeGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: MAGAC,
        completedBy: ACTOR,
      }),
    "invalid_handoff_completion",
  );
  await expectThrowsAsync(
    "Brain completedBy rejected",
    () =>
      ctx.domain3.completeGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        completedBy: "brain_runtime",
      }),
    "invalid_handoff_completion",
  );
  await expectThrowsAsync(
    "Brain sourceAttribution cannot complete",
    () =>
      ctx.domain3.completeGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        completedBy: ACTOR,
        sourceAttribution: "brain_runtime",
      }),
    "invalid_handoff_completion",
  );
}

section("auth alone / binding alone / posture alone do not create completion records");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);

  await authorize(ctx, entry.entryId, "CC-01");
  expect(
    "auth alone creates no completion",
    (await ctx.domain3.listGovernedHandoffCompletionActsByEntry(entry.entryId)).length,
    0,
  );

  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  expect(
    "binding alone creates no completion",
    (await ctx.domain3.listGovernedHandoffCompletionActsByBinding(binding.bindingId)).length,
    0,
  );

  await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  expect(
    "posture alone creates no completion",
    (await ctx.domain3.listGovernedHandoffCompletionActsByBinding(binding.bindingId)).length,
    0,
  );
}

section("complete does not accept/manufacture/suspend/recall; no G6 APIs on repo");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });

  await expectThrowsAsync(
    "complete with suspend claim rejected",
    () =>
      ctx.domain3.completeGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        completedBy: ACTOR,
        suspensionActId: "forged",
      }),
    "invalid_handoff_completion",
  );
  await expectThrowsAsync(
    "complete with recall claim rejected",
    () =>
      ctx.domain3.completeGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        completedBy: ACTOR,
        recallActId: "forged",
      }),
    "invalid_handoff_completion",
  );
  await expectThrowsAsync(
    "complete with acceptance claim rejected",
    () =>
      ctx.domain3.completeGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        completedBy: ACTOR,
        downstreamAcceptanceId: "forged",
      }),
    "invalid_handoff_completion",
  );
  await expectThrowsAsync(
    "complete with manufacturing claim rejected",
    () =>
      ctx.domain3.completeGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        completedBy: ACTOR,
        manufacturingExecutionId: "forged",
      }),
    "invalid_handoff_completion",
  );

  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("no suspendHandoff", typeof repo.suspendHandoff, "undefined");
  expect("no recallHandoff", typeof repo.recallHandoff, "undefined");
  expect("no withdrawHandoff", typeof repo.withdrawHandoff, "undefined");
  expect("no expireHandoff", typeof repo.expireHandoff, "undefined");
  expect("no rejectHandoffActLayer", typeof repo.rejectHandoffActLayer, "undefined");
  expect(
    "no evaluateHandoffLifecycleRejection",
    typeof repo.evaluateHandoffLifecycleRejection,
    "undefined",
  );
  expect(
    "no loadGovernedHandoffLifecycleRejectionAttribution",
    typeof repo.loadGovernedHandoffLifecycleRejectionAttribution,
    "undefined",
  );
  expect(
    "attributeGovernedHandoffDownstreamExitBoundary present after G8",
    typeof repo.attributeGovernedHandoffDownstreamExitBoundary,
    "function",
  );
  expect("no exitCompletenessSatisfy", typeof repo.exitCompletenessSatisfy, "undefined");
  expect("no satisfyExitCompleteness", typeof repo.satisfyExitCompleteness, "undefined");
}

section("stale GPRA invalidation blocks new completion");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-02");
  await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
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
    "complete after GPRA invalidation rejected",
    () =>
      ctx.domain3.completeGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        completedBy: ACTOR,
      }),
    "invalid_handoff_completion",
  );

  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect(
    "invalidation does not invent suspended/recalled",
    lifecycle.currentState === "suspended" ||
      lifecycle.currentState === "recalled" ||
      lifecycle.currentState === "withdrawn" ||
      lifecycle.currentState === "expired",
    false,
  );
}

section("rehydration rejects forged completion / foreign binding");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  const posture = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  const act = await ctx.domain3.completeGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    completedBy: ACTOR,
  });
  const loaded = await ctx.domain3.loadGovernedHandoffCompletionAct(act.completionActId);
  expectTruthy("load succeeds", !!loaded);

  expectThrows(
    "forged scope rejected on validate",
    () =>
      validatePersistedGovernedHandoffCompletion({
        ...act,
        authorityConstitutionalScope: "handoff_authorization_act",
      }),
    "invalid_handoff_completion",
  );

  expectThrows(
    "foreign binding on rehydrate rejected",
    () =>
      rehydrateGovernedHandoffCompletion(
        { ...act, bindingId: "governed-handoff-consumer-binding-foreign" },
        {
          entry,
          binding: { ...binding, bindingId: "governed-handoff-consumer-binding-other" as never },
          posture,
        },
      ),
    "invalid_handoff_completion",
  );
}

section("Rejected vocabulary kept; absence of auth/posture does not invent Rejected (R51/R57)");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");

  expectTruthy(
    "Rejected remains frozen catalog member",
    FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES.includes("rejected"),
  );

  const eligible = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect("no auth/posture → eligible, not rejected", eligible.currentState, "eligible_for_consideration");
  expect("no invented rejection attribution tip", eligible.authoritativeRejectionAttributionId, null);
  expect(
    "absence does not invent rejected",
    eligible.currentState === "rejected",
    false,
  );

  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("rejectHandoffActLayer absent from repo", typeof repo.rejectHandoffActLayer, "undefined");
}

section("G4 posture still works; cross-CC independent lifecycle");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const b1 = await bindCc(ctx, entry.entryId, "CC-01");
  const b2 = await bindCc(ctx, entry.entryId, "CC-02");

  const p1 = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: b1.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  const p2 = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: b2.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  expect("G4 posture CC-01", p1.declaredPostureClass, "library_intake_posture");
  expect("G4 posture CC-02", p2.declaredPostureClass, "production_catalog_posture");

  await ctx.domain3.completeGovernedHandoff({
    entryId: entry.entryId,
    bindingId: b1.bindingId,
    authorityClassId: HGA,
    completedBy: ACTOR,
  });

  const life1 = await ctx.domain3.evaluateHandoffActLayerLifecycle(b1.bindingId);
  const life2 = await ctx.domain3.evaluateHandoffActLayerLifecycle(b2.bindingId);
  expect("CC-01 completed independently", life1.currentState, "completed");
  expect("CC-02 remains eligible (no merge)", life2.currentState, "eligible_for_consideration");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
