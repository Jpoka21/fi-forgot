/**
 * ORCH-IMP-032 — STD-015 HOF-G8 completion (R142–R145).
 *
 * Operative downstream exit-completeness satisfaction. Distinct from R58–R65
 * exit-boundary attribution. Not an HGA matrix act. Not an HSLM state.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-hof-g8-completion.test.ts
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
  EXIT_COMPLETENESS_SATISFACTION_EVIDENCE_CATEGORIES,
  FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES,
  FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES,
  GOVERNED_HANDOFF_DOWNSTREAM_EXIT_COMPLETENESS_TRACEABILITY,
  governProductionProgram,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
  HGA_MATRIX_ACT_TYPES,
  isOrchestraConstitutionalError,
  listMandatoryReviewDimensionIds,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  resolveDownstreamConsiderationDomain,
  VOLUME_06_HANDOFF_AUTHORITY_TERMINUS,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";
import { rehydrateGovernedHandoffDownstreamExitCompleteness } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffDownstreamExitCompleteness } from "../orchestra/persistence/domain3-validation.js";

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

const ACTOR = "governance-authority-015";
const MAGAC = "approval_authority_production_obligation_scope" as const;
const HANDOFF_CTX = "handoff-consumer-context-opaque-g8c-001";
const CONSUMER_KEYS = [
  "manufacturing",
  "fulfillment",
  "catalog",
  "archival",
  "production",
  "publication",
  "distribution",
] as const;
const HGA = HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID;
const SUSPEND_BASIS = "temporary_forward_reliance_pause_warranted" as const;
const WITHDRAW_BASIS = "hga_initiated_forward_reliance_retraction_warranted" as const;
const RESUMPTION_BASIS = "suspension_grounds_constitutionally_cleared" as const;

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-015 HOF-G8 Downstream Exit Completeness",
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
    constitutionalPurpose: "HOF-G8 exit completeness scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G8 completion",
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
    grounds: "Pass for HOF-G8 completion",
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

async function completeBinding(
  ctx: Awaited<ReturnType<typeof grantPassGpra>>,
  entryId: string,
  bindingId: string,
) {
  await ctx.domain3.declareHandoffPosture({
    entryId: entryId as never,
    bindingId: bindingId as never,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  return ctx.domain3.completeGovernedHandoff({
    entryId: entryId as never,
    bindingId: bindingId as never,
    authorityClassId: HGA,
    completedBy: ACTOR,
  });
}

async function lawfulExitBoundary(
  ctx: Awaited<ReturnType<typeof grantPassGpra>>,
  consumerClassId: "CC-01" | "CC-02" = "CC-01",
) {
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, consumerClassId);
  await completeBinding(ctx, entry.entryId, binding.bindingId);
  const boundary = await ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    attributedBy: ACTOR,
  });
  return { entry, binding, boundary };
}

section("1. catalogs, traceability, no ninth HGA/HSLM type");

{
  expect("matrix remains eight", HGA_MATRIX_ACT_TYPES.length, 8);
  expect(
    "exit_completeness not matrix",
    (HGA_MATRIX_ACT_TYPES as readonly string[]).includes("exit_completeness"),
    false,
  );
  expect(
    "exit_boundary not matrix",
    (HGA_MATRIX_ACT_TYPES as readonly string[]).includes("exit_boundary"),
    false,
  );
  expect("HSLM remains eight", FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES.length, 8);
  expect(
    "no exit_complete HSLM",
    (FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES as readonly string[]).includes("exit_complete"),
    false,
  );
  expect(
    "HGA has no exit completeness scope",
    FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!.authorizedConstitutionalScopes.includes(
      "handoff_exit_completeness_act" as never,
    ),
    false,
  );
  expectTruthy(
    "traceability R142",
    GOVERNED_HANDOFF_DOWNSTREAM_EXIT_COMPLETENESS_TRACEABILITY.requirementIds.includes(
      "FI-DSN-STD-015-R142",
    ),
  );
  expectTruthy(
    "traceability R145",
    GOVERNED_HANDOFF_DOWNSTREAM_EXIT_COMPLETENESS_TRACEABILITY.requirementIds.includes(
      "FI-DSN-STD-015-R145",
    ),
  );
  expect("evidence categories closed six", EXIT_COMPLETENESS_SATISFACTION_EVIDENCE_CATEGORIES.length, 6);
  expectTruthy(
    "terminus still does not absorb acceptance",
    VOLUME_06_HANDOFF_AUTHORITY_TERMINUS.doesNotAbsorbDownstreamAcceptance,
  );
  const mod = await import("../orchestra/index.js");
  expect(
    "constructor not on barrel",
    "createGovernedHandoffDownstreamExitCompletenessSatisfactionRecord" in mod,
    false,
  );
  expect("no generic satisfyExitCompleteness", "satisfyExitCompleteness" in mod, false);
  expect("no performHgaAct", "performHgaAct" in mod, false);
}

section("2. lawful satisfaction after current exit boundary + Completed");

{
  const ctx = await grantPassGpra();
  const { entry, binding, boundary } = await lawfulExitBoundary(ctx);
  const assessment = await ctx.domain3.assessGovernedHandoffDownstreamExitCompleteness({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
  });
  expect("maySatisfy", assessment.maySatisfy, true);
  expect("not ninth matrix", assessment.notNinthHgaMatrixAct, true);
  expect("not exit boundary", assessment.notExitBoundaryAttribution, true);
  expect("not acceptance", assessment.notDownstreamAcceptance, true);

  const satisfaction = await ctx.domain3.satisfyGovernedHandoffDownstreamExitCompleteness({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    satisfiedBy: ACTOR,
  });
  expect("kind", satisfaction.constitutionalArtifactKind, "downstream_exit_completeness_satisfaction");
  expect(
    "links existing boundary",
    satisfaction.exitBoundaryAttributionId,
    boundary.exitBoundaryAttributionId,
  );
  expect(
    "HOEM remains exit_boundary",
    satisfaction.hoemExitBoundaryRecord.actType,
    "exit_boundary",
  );
  expect(
    "same HOEM id",
    satisfaction.hoemExitBoundaryRecord.hoemExitBoundaryRecordId,
    boundary.hoemExitBoundaryRecord.hoemExitBoundaryRecordId,
  );
  expect("CC-01 domain", satisfaction.downstreamConsiderationDomain, resolveDownstreamConsiderationDomain("CC-01"));
  expect("not HGA matrix act", satisfaction.notHgaMatrixActType, true);
  expect("not completion act", satisfaction.notHandoffCompletionAct, true);
  expect("not membership", satisfaction.notMembershipAdmission, true);
  expect("not manufacturing", satisfaction.notManufacturingOrFulfillmentOrExecution, true);
  expect("not HSLM state", satisfaction.notHslmState, true);
  expect("six evidence categories", satisfaction.satisfactionEvidence.categories.length, 6);
  validatePersistedGovernedHandoffDownstreamExitCompleteness(satisfaction);

  const evaluation = await ctx.domain3.evaluateDownstreamExitCompleteness(binding.bindingId);
  expect("completeness satisfied", evaluation.completenessSatisfied, true);
  expect("not acceptance eval", evaluation.notAcceptance, true);
  expect("distinct from boundary", evaluation.r142SatisfactionDistinctFromBoundary, true);

  const consideration = await ctx.domain3.evaluateDownstreamExitConsideration(binding.bindingId);
  expect("consideration still not completeness", consideration.notExitCompleteness, true);
}

section("3. missing exit boundary / completion / foreign binding / wrong domain");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await completeBinding(ctx, entry.entryId, binding.bindingId);

  const missingBoundary = await ctx.domain3.assessGovernedHandoffDownstreamExitCompleteness({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
  });
  expect("missing boundary denied", missingBoundary.maySatisfy, false);
  expectTruthy(
    "missing_exit_boundary_attribution",
    missingBoundary.denialReasons.includes("missing_exit_boundary_attribution"),
  );

  await expectThrowsAsync(
    "satisfy without boundary persists attempt then throws",
    () =>
      ctx.domain3.satisfyGovernedHandoffDownstreamExitCompleteness({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        satisfiedBy: ACTOR,
      }),
    "invalid_handoff_downstream_exit_completeness",
  );
  const attempts =
    await ctx.domain3.listGovernedHandoffDownstreamExitCompletenessAttemptsByBinding(
      binding.bindingId,
    );
  expect("attempt evidence preserved", attempts.length, 1);
  expect("attempt is not satisfaction", attempts[0]!.notSatisfaction, true);

  const ctx2 = await grantPassGpra();
  const ready = await lawfulExitBoundary(ctx2, "CC-01");
  const otherBinding = await bindCc(ctx2, ready.entry.entryId, "CC-02");
  await completeBinding(ctx2, ready.entry.entryId, otherBinding.bindingId);
  await expectThrowsAsync(
    "foreign binding cannot use CC-01 boundary",
    () =>
      ctx2.domain3.satisfyGovernedHandoffDownstreamExitCompleteness({
        entryId: ready.entry.entryId,
        bindingId: otherBinding.bindingId,
        authorityClassId: HGA,
        satisfiedBy: ACTOR,
        exitBoundaryAttributionId: ready.boundary.exitBoundaryAttributionId,
      }),
    "invalid_handoff_downstream_exit_completeness",
  );

  const ctx3 = await grantPassGpra();
  const ready3 = await lawfulExitBoundary(ctx3, "CC-01");
  const deniedDomain = await ctx3.domain3.assessGovernedHandoffDownstreamExitCompleteness({
    entryId: ready3.entry.entryId,
    bindingId: ready3.binding.bindingId,
    downstreamConsiderationDomain: "invented-downstream-domain",
  });
  expect("wrong domain denied", deniedDomain.maySatisfy, false);
}

section("4. Completion or exit boundary alone insufficient; boolean/catalog/export_ready insufficient");

{
  const ctx = await grantPassGpra();
  const ready = await lawfulExitBoundary(ctx);
  const denied = await ctx.domain3.assessGovernedHandoffDownstreamExitCompleteness({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    booleanComplete: true,
    catalogMembershipAlone: true,
    exportReadyAlone: true,
    completionAlone: true,
    exitBoundaryAlone: true,
  });
  expect("insufficient evidence denied", denied.maySatisfy, false);
  expectTruthy("boolean", denied.denialReasons.includes("boolean_complete_insufficient"));
  expectTruthy("catalog", denied.denialReasons.includes("catalog_membership_insufficient"));
  expectTruthy("export_ready", denied.denialReasons.includes("export_ready_alone_insufficient"));
  expectTruthy("completion alone", denied.denialReasons.includes("completion_alone_insufficient"));
  expectTruthy("boundary alone", denied.denialReasons.includes("exit_boundary_alone_insufficient"));
}

section("5. Brain / MAGAC cannot satisfy; acceptance/mfg claims rejected");

{
  const ctx = await grantPassGpra();
  const ready = await lawfulExitBoundary(ctx);
  await expectThrowsAsync(
    "MAGAC cannot satisfy",
    () =>
      ctx.domain3.satisfyGovernedHandoffDownstreamExitCompleteness({
        entryId: ready.entry.entryId,
        bindingId: ready.binding.bindingId,
        authorityClassId: MAGAC,
        satisfiedBy: ACTOR,
      }),
    "invalid_handoff_downstream_exit_completeness",
  );
  await expectThrowsAsync(
    "Brain attributedBy rejected",
    () =>
      ctx.domain3.satisfyGovernedHandoffDownstreamExitCompleteness({
        entryId: ready.entry.entryId,
        bindingId: ready.binding.bindingId,
        authorityClassId: HGA,
        satisfiedBy: "brain_runtime",
      }),
    "invalid_handoff_downstream_exit_completeness",
  );
  await expectThrowsAsync(
    "acceptDownstream claim rejected",
    () =>
      ctx.domain3.satisfyGovernedHandoffDownstreamExitCompleteness({
        entryId: ready.entry.entryId,
        bindingId: ready.binding.bindingId,
        authorityClassId: HGA,
        satisfiedBy: ACTOR,
        acceptDownstream: true,
      }),
    "invalid_handoff_downstream_exit_completeness",
  );
  await expectThrowsAsync(
    "manufacturing claim rejected",
    () =>
      ctx.domain3.satisfyGovernedHandoffDownstreamExitCompleteness({
        entryId: ready.entry.entryId,
        bindingId: ready.binding.bindingId,
        authorityClassId: HGA,
        satisfiedBy: ACTOR,
        manufacturingExecution: true,
      }),
    "invalid_handoff_downstream_exit_completeness",
  );
  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("no acceptDownstream API", typeof repo.acceptDownstream, "undefined");
  expect("no membershipAdmission API", typeof repo.membershipAdmission, "undefined");
  expect("no manufacturingExecution API", typeof repo.manufacturingExecution, "undefined");
}

section("6. Suspended blocks; resumption alone does not satisfy; independent satisfaction after resume");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await authorize(ctx, entry.entryId, "CC-01");
  await completeBinding(ctx, entry.entryId, binding.bindingId);
  await ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    attributedBy: ACTOR,
  });
  await ctx.domain3.suspendGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    suspendedBy: ACTOR,
    constitutionalBasisKind: SUSPEND_BASIS,
  });
  const suspended = await ctx.domain3.assessGovernedHandoffDownstreamExitCompleteness({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
  });
  expect("suspended denied", suspended.maySatisfy, false);
  expectTruthy(
    "pause reason",
    suspended.denialReasons.includes("forward_reliance_paused_by_suspension") ||
      suspended.denialReasons.includes("completed_lifecycle_not_attributable"),
  );

  await ctx.domain3.resumeGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    resumedBy: ACTOR,
    hercmCategory: "REC-02",
    constitutionalBasisKind: RESUMPTION_BASIS,
  });
  const afterResume = await ctx.domain3.assessGovernedHandoffDownstreamExitCompleteness({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    resumptionAlone: true,
  });
  expect("resumption alone still denied", afterResume.maySatisfy, false);
  expectTruthy(
    "resumption_alone_does_not_satisfy",
    afterResume.denialReasons.includes("resumption_alone_does_not_satisfy"),
  );

  const independent = await ctx.domain3.assessGovernedHandoffDownstreamExitCompleteness({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
  });
  expect("independent satisfaction after resume may proceed", independent.maySatisfy, true);
  const satisfaction = await ctx.domain3.satisfyGovernedHandoffDownstreamExitCompleteness({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    satisfiedBy: ACTOR,
  });
  expectTruthy("not hercm resumption", satisfaction.notHercmResumption);
}

section("7. Withdrawn and Recalled block; Invalidated GPRA blocks");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await authorize(ctx, entry.entryId, "CC-01");
  await completeBinding(ctx, entry.entryId, binding.bindingId);
  await ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    attributedBy: ACTOR,
  });
  await ctx.domain3.withdrawGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    withdrawnBy: ACTOR,
    constitutionalBasisKind: WITHDRAW_BASIS,
  });
  const withdrawn = await ctx.domain3.assessGovernedHandoffDownstreamExitCompleteness({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
  });
  expect("withdrawn denied", withdrawn.maySatisfy, false);

  const ctxR = await grantPassGpra();
  const { entry: entryR } = await admitEntry(ctxR);
  const bindingR = await bindCc(ctxR, entryR.entryId, "CC-01");
  await authorize(ctxR, entryR.entryId, "CC-01");
  await completeBinding(ctxR, entryR.entryId, bindingR.bindingId);
  await ctxR.domain3.attributeGovernedHandoffDownstreamExitBoundary({
    entryId: entryR.entryId,
    bindingId: bindingR.bindingId,
    authorityClassId: HGA,
    attributedBy: ACTOR,
  });
  await ctxR.domain3.recallGovernedHandoff({
    entryId: entryR.entryId,
    bindingId: bindingR.bindingId,
    authorityClassId: HGA,
    recalledBy: ACTOR,
    satisfiedHrtcmTriggers: ["RTC-04"],
    postureChainGovernanceCessationSatisfied: true,
  });
  const recalled = await ctxR.domain3.assessGovernedHandoffDownstreamExitCompleteness({
    entryId: entryR.entryId,
    bindingId: bindingR.bindingId,
  });
  expect("recalled denied", recalled.maySatisfy, false);

  const ctxI = await grantPassGpra();
  const readyI = await lawfulExitBoundary(ctxI);
  await ctxI.domain3.invalidateGpra({
    gpraId: ctxI.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Material CB change renders GPRA-bound RVA non-compliant",
    authorityClassId: "invalidation_authority_production_obligation_scope",
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });
  const invalidated = await ctxI.domain3.assessGovernedHandoffDownstreamExitCompleteness({
    entryId: readyI.entry.entryId,
    bindingId: readyI.binding.bindingId,
  });
  expect("invalidated GPRA denied", invalidated.maySatisfy, false);
}

section("8. repeat satisfaction is additive; forged rehydration fail-closed");

{
  const ctx = await grantPassGpra();
  const ready = await lawfulExitBoundary(ctx);
  const first = await ctx.domain3.satisfyGovernedHandoffDownstreamExitCompleteness({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    satisfiedBy: ACTOR,
    satisfiedAt: "2026-08-17T16:00:00.000Z",
  });
  const second = await ctx.domain3.satisfyGovernedHandoffDownstreamExitCompleteness({
    entryId: ready.entry.entryId,
    bindingId: ready.binding.bindingId,
    authorityClassId: HGA,
    satisfiedBy: ACTOR,
    satisfiedAt: "2026-08-17T16:01:00.000Z",
  });
  expectTruthy("repeat ids distinct", first.exitCompletenessSatisfactionId !== second.exitCompletenessSatisfactionId);
  const listed =
    await ctx.domain3.listGovernedHandoffDownstreamExitCompletenessSatisfactionsByBinding(
      ready.binding.bindingId,
    );
  expect("two historical records", listed.length, 2);
  const current = await ctx.domain3.getAuthoritativeHandoffDownstreamExitCompletenessForBinding(
    ready.binding.bindingId,
  );
  expect("tip is second", current?.exitCompletenessSatisfactionId, second.exitCompletenessSatisfactionId);

  const entry = await ctx.domain3.loadGovernedHandoffEntry(ready.entry.entryId);
  const binding = await ctx.domain3.loadGovernedHandoffConsumerBinding(ready.binding.bindingId);
  const posture = await ctx.domain3.loadGovernedHandoffPostureDeclarationAct(
    first.postureDeclarationActId,
  );
  const completion = await ctx.domain3.loadGovernedHandoffCompletionAct(first.completionActId);
  const boundary = await ctx.domain3.loadGovernedHandoffDownstreamExitBoundaryAttribution(
    first.exitBoundaryAttributionId,
  );
  if (!entry || !binding || !posture || !completion || !boundary) {
    throw new Error("trusted completeness rehydration context missing");
  }
  try {
    rehydrateGovernedHandoffDownstreamExitCompleteness(
      { ...first, downstreamAcceptanceId: "forged-acceptance" },
      { entry, binding, posture, completion, exitBoundary: boundary },
    );
    failed++;
    failures.push("forged acceptance rehydration");
    console.log("  ✗ forged acceptance rehydration (did not throw)");
  } catch {
    passed++;
    console.log("  ✓ forged acceptance rehydration fail-closed");
  }
  try {
    rehydrateGovernedHandoffDownstreamExitCompleteness(
      { ...first, constitutionalArtifactKind: "handoff_exit_completeness_act" },
      { entry, binding, posture, completion, exitBoundary: boundary },
    );
    failed++;
    failures.push("forged ninth type rehydration");
    console.log("  ✗ forged ninth type rehydration (did not throw)");
  } catch {
    passed++;
    console.log("  ✓ forged ninth type rehydration fail-closed");
  }
}

section("9. STD-015 end boundary: R146 remains unavailable");

{
  const { assertR146PlusUnavailable } = await import("../orchestra/index.js");
  try {
    assertR146PlusUnavailable("r146_plus_available");
    failed++;
    failures.push("R146 unavailable");
    console.log("  ✗ R146 unavailable (did not throw)");
  } catch (error) {
    if (isOrchestraConstitutionalError(error)) {
      passed++;
      console.log("  ✓ R146 remains undrafted");
    } else {
      failed++;
      failures.push("R146 unavailable");
      console.log("  ✗ R146 unavailable (not constitutional)");
    }
  }
}

console.log(`\nHOF-G8 completion R142–R145 tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
