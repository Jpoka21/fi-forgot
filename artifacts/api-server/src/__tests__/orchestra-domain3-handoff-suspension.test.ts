/**
 * ORCH-IMP-027 — STD-015 HOF-G6-U2 Handoff Suspension (R84–R97).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-suspension.test.ts
 */

import {
  addObligationToProgram,
  assertHgaMatrixActMayBePerformed,
  assertHgaSolePerformerForG6LifecycleAct,
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
  GOVERNED_HANDOFF_SUSPENSION_TRACEABILITY,
  governProductionProgram,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
  assessGovernedHandoffSuspension,
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
import { rehydrateGovernedHandoffSuspension } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffSuspension } from "../orchestra/persistence/domain3-validation.js";

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
const BASIS = "temporary_forward_reliance_pause_warranted" as const;

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-015 HOF-G6-U2 Handoff Suspension",
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
    constitutionalPurpose: "HOF-G6-U2 suspension scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G6-U2",
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
    grounds: "Pass for HOF-G6-U2",
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

async function pipelineAuthPosture(
  ctx: Awaited<ReturnType<typeof grantPassGpra>>,
  consumerClassId: "CC-01" | "CC-02" = "CC-01",
) {
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, consumerClassId);
  await authorize(ctx, entry.entryId, consumerClassId);
  const posture = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  return { entry, binding, posture };
}

section("HOF-G6-U2 catalogs, R84–R97 traceability, HGA suspension scope");

{
  expectTruthy(
    "traceability R84",
    GOVERNED_HANDOFF_SUSPENSION_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R84"),
  );
  expectTruthy(
    "traceability R97",
    GOVERNED_HANDOFF_SUSPENSION_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R97"),
  );
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_SUSPENSION_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
  const hga = FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!;
  expectTruthy(
    "HGA includes suspension scope",
    hga.authorizedConstitutionalScopes.includes("handoff_suspension_act"),
  );
  expect("suspension catalog operative", getHgaMatrixActOperativeStatus("suspension"), "operative");
  expect("withdrawal catalog operative", getHgaMatrixActOperativeStatus("withdrawal"), "operative");
  expect("recall still deferred", getHgaMatrixActOperativeStatus("recall"), "cataloged_deferred");
  assertHgaMatrixActMayBePerformed("suspension");
  passed++;
  console.log("  ✓ catalog mayBePerformed suspension");
}

section("constructors not on barrel; assess/select exported");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffSuspensionActRecord not on barrel",
    "createGovernedHandoffSuspensionActRecord" in mod,
    false,
  );
  expect("assessGovernedHandoffSuspension on barrel", "assessGovernedHandoffSuspension" in mod, true);
  expect(
    "selectAuthoritativeGovernedHandoffSuspension on barrel",
    "selectAuthoritativeGovernedHandoffSuspension" in mod,
    true,
  );
  expect(
    "evaluateHandoffSuspensionCurrencyFromFacts on barrel",
    "evaluateHandoffSuspensionCurrencyFromFacts" in mod,
    true,
  );
  expect("suspendGovernedHandoff not on barrel", "suspendGovernedHandoff" in mod, false);
}

section("U1 P1 regression: HGA class required; boolean/nonprohibited performer insufficient");

{
  expectThrows(
    "U1 P1 missing authorityClassId",
    () =>
      assertHgaSolePerformerForG6LifecycleAct({
        actType: "suspension",
      }),
    "invalid_handoff_g6_lifecycle_foundation",
  );
  expectThrows(
    "U1 P1 performerClass alone insufficient",
    () =>
      assertHgaSolePerformerForG6LifecycleAct({
        performerClass: "workflow_operator",
        actType: "suspension",
      }),
    "invalid_handoff_g6_lifecycle_foundation",
  );
}

section("lawful suspend → HOEM + HSLM suspended");

{
  const ctx = await grantPassGpra();
  const { entry, binding } = await pipelineAuthPosture(ctx);
  const assessment = await ctx.domain3.evaluateGovernedHandoffSuspension({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    constitutionalBasisKind: BASIS,
  });
  expect("maySuspend after auth+posture", assessment.maySuspend, true);
  expect("catalog alone does not mint", assessment.doesNotAuthorizeActMintViaCatalogAlone, true);

  const act = await ctx.domain3.suspendGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    suspendedBy: ACTOR,
    constitutionalBasisKind: BASIS,
  });
  expect("scope handoff_suspension_act", act.authorityConstitutionalScope, "handoff_suspension_act");
  expect("HOEM actType suspension", act.hoemSuspensionRecord.actType, "suspension");
  expect("forwardReliancePaused", act.forwardReliancePaused, true);
  expect("does not terminate posture", act.doesNotTerminatePosture, true);
  expect("does not erase authorization", act.doesNotEraseAuthorization, true);
  expect("not withdrawal", act.notHandoffWithdrawal, true);
  expect("not recall", act.notHandoffRecall, true);
  expect("not completion", act.notHandoffCompletion, true);
  expect("effect framing pause", act.effectFraming, "temporary_forward_reliance_pause");
  validatePersistedGovernedHandoffSuspension(act);

  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect("HSLM suspended after lawful act", lifecycle.currentState, "suspended");
  expect("authoritative suspension id", lifecycle.authoritativeSuspensionActId, act.suspensionActId);
  expect("suspension mechanics operative", lifecycle.suspensionMechanicsOperative, true);
  expect("withdrawal mechanics operative", lifecycle.withdrawalMechanicsOperative, true);
  expect(
    "withdrawalRecallExpiredMechanicsDeferred false",
    lifecycle.withdrawalRecallExpiredMechanicsDeferred,
    false,
  );
  expect("recallExpiredMechanicsDeferred", lifecycle.recallExpiredMechanicsDeferred, true);

  const currency = await ctx.domain3.evaluateHandoffSuspensionCurrency(act.suspensionActId);
  expect("suspension currency current", currency, "current");
}

section("HGA class required; boolean/nonprohibited performer bypass fail; Brain fail");

{
  const ctx = await grantPassGpra();
  const { entry, binding } = await pipelineAuthPosture(ctx);

  await expectThrowsAsync(
    "MAGAC cannot suspend",
    () =>
      ctx.domain3.suspendGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: MAGAC,
        suspendedBy: ACTOR,
        constitutionalBasisKind: BASIS,
      }),
    "invalid_handoff_suspension",
  );
  await expectThrowsAsync(
    "Brain suspendedBy rejected",
    () =>
      ctx.domain3.suspendGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        suspendedBy: "brain_runtime",
        constitutionalBasisKind: BASIS,
      }),
    "invalid_handoff_suspension",
  );
  await expectThrowsAsync(
    "Brain sourceAttribution cannot suspend",
    () =>
      ctx.domain3.suspendGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        suspendedBy: ACTOR,
        constitutionalBasisKind: BASIS,
        sourceAttribution: "brain_runtime",
      }),
    "invalid_handoff_suspension",
  );
}

section("missing auth fail; stale posture fail; foreign binding fail");

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
    "suspend without authorization rejected",
    () =>
      ctx.domain3.suspendGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        suspendedBy: ACTOR,
        constitutionalBasisKind: BASIS,
      }),
    "invalid_handoff_suspension",
  );

  const ctx2 = await grantPassGpra();
  const ready = await pipelineAuthPosture(ctx2);
  await expectThrowsAsync(
    "suspend with missing binding rejected",
    () =>
      ctx2.domain3.suspendGovernedHandoff({
        entryId: ready.entry.entryId,
        bindingId: "governed-handoff-consumer-binding-missing" as never,
        authorityClassId: HGA,
        suspendedBy: ACTOR,
        constitutionalBasisKind: BASIS,
      }),
    "invalid_handoff_suspension",
  );

  const b2 = await bindCc(ctx2, ready.entry.entryId, "CC-02");
  await expectThrowsAsync(
    "foreign CC-02 binding without matching auth/posture rejected",
    () =>
      ctx2.domain3.suspendGovernedHandoff({
        entryId: ready.entry.entryId,
        bindingId: b2.bindingId,
        authorityClassId: HGA,
        suspendedBy: ACTOR,
        constitutionalBasisKind: BASIS,
      }),
    "invalid_handoff_suspension",
  );

  const authForReady = (
    await ctx2.domain3.listGovernedHandoffAuthorizationActsByEntry(ready.entry.entryId)
  ).find((a) => a.consumerClassId === ready.binding.consumerClassId)!;
  const stalePostureAssess = assessGovernedHandoffSuspension({
    entry: ready.entry,
    entryCurrency: "current",
    binding: ready.binding,
    bindingCurrency: "current",
    authorization: authForReady,
    authorizationCurrency: "current",
    posture: ready.posture,
    postureCurrency: "stale",
    gpraValidityPosture: "retention",
    eligibilityLayerCondition: "export_ready",
    lineageMatchesAuthoritativeGpra: true,
    constitutionalBasisKind: BASIS,
    authorityClassId: HGA,
  });
  expect("stale posture maySuspend false", stalePostureAssess.maySuspend, false);
  expectTruthy(
    "stale posture denial",
    stalePostureAssess.denialReasons.includes("stale_authoritative_handoff_posture"),
  );
}

section("Invalidated / Superseded GPRA fail");

{
  const ctx = await grantPassGpra();
  const { entry, binding } = await pipelineAuthPosture(ctx, "CC-02");

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
    "suspend after GPRA invalidation rejected",
    () =>
      ctx.domain3.suspendGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        suspendedBy: ACTOR,
        constitutionalBasisKind: BASIS,
      }),
    "invalid_handoff_suspension",
  );

  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect(
    "invalidation does not invent suspended",
    lifecycle.currentState === "suspended",
    false,
  );
}

section("RTC-alone / advisory-alone / G11 blocked-alone fail");

{
  const ctx = await grantPassGpra();
  const { entry, binding } = await pipelineAuthPosture(ctx);

  await expectThrowsAsync(
    "RTC-alone claim rejected",
    () =>
      ctx.domain3.suspendGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        suspendedBy: ACTOR,
        constitutionalBasisKind: BASIS,
        rtcCatalogAlone: true,
      }),
    "invalid_handoff_suspension",
  );
  await expectThrowsAsync(
    "advisory-alone rejected",
    () =>
      ctx.domain3.suspendGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        suspendedBy: ACTOR,
        constitutionalBasisKind: BASIS,
        advisoryEvidenceAlone: true,
      }),
    "invalid_handoff_suspension",
  );
  await expectThrowsAsync(
    "G11 blocked-alone rejected",
    () =>
      ctx.domain3.suspendGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        suspendedBy: ACTOR,
        constitutionalBasisKind: BASIS,
        g11BlockedAlone: true,
      }),
    "invalid_handoff_suspension",
  );
  await expectThrowsAsync(
    "free-text notes without closed basisKind rejected",
    () =>
      ctx.domain3.suspendGovernedHandoff({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        suspendedBy: ACTOR,
        constitutionalBasisKind: "because we felt like it",
        constitutionalBasisNotes: "operator note",
      }),
    "invalid_handoff_suspension",
  );

  expect(
    "invalid attempts produced no HOEM",
    (await ctx.domain3.listGovernedHandoffSuspensionActsByBinding(binding.bindingId)).length,
    0,
  );
}

section("repeated suspensions additive; completion history preserved after suspend");

{
  const ctx = await grantPassGpra();
  const { entry, binding } = await pipelineAuthPosture(ctx);
  const completion = await ctx.domain3.completeGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    completedBy: ACTOR,
  });
  const completed = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect("completed before suspend", completed.currentState, "completed");

  const first = await ctx.domain3.suspendGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    suspendedBy: ACTOR,
    constitutionalBasisKind: BASIS,
    suspendedAt: "2026-01-01T00:00:00.000Z",
  });
  const second = await ctx.domain3.suspendGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    suspendedBy: ACTOR,
    constitutionalBasisKind: BASIS,
    suspendedAt: "2026-02-01T00:00:00.000Z",
  });
  expectTruthy("repeated acts have distinct ids", first.suspensionActId !== second.suspensionActId);

  const listed = await ctx.domain3.listGovernedHandoffSuspensionActsByBinding(binding.bindingId);
  expect("two additive suspension records", listed.length, 2);

  const tip = await ctx.domain3.getAuthoritativeHandoffSuspensionForBinding(binding.bindingId);
  expect("tip is latest suspendedAt", tip?.suspensionActId, second.suspensionActId);

  const lifecycle = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect("HSLM suspended outranks completed", lifecycle.currentState, "suspended");
  expect(
    "completion history still attributed",
    lifecycle.authoritativeCompletionActId,
    completion.completionActId,
  );

  const completions = await ctx.domain3.listGovernedHandoffCompletionActsByBinding(
    binding.bindingId,
  );
  expect("completion records preserved", completions.length, 1);
  expect("completion act unchanged", completions[0]!.completionActId, completion.completionActId);
  expect("completion not rewritten as suspension", completions[0]!.notHandoffSuspension, true);
}

section("no resume/withdraw/recall APIs");

{
  const ctx = await grantPassGpra();
  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("suspendGovernedHandoff present", typeof repo.suspendGovernedHandoff, "function");
  expect("no suspendHandoff", typeof repo.suspendHandoff, "undefined");
  expect("withdrawGovernedHandoff present", typeof repo.withdrawGovernedHandoff, "function");
  expect("no recallGovernedHandoff", typeof repo.recallGovernedHandoff, "undefined");
  expect("no resumeHandoff", typeof repo.resumeHandoff, "undefined");
  expect("no restoreHandoff", typeof repo.restoreHandoff, "undefined");
  expect("no reenterHandoff", typeof repo.reenterHandoff, "undefined");
  expect("no performHgaAct", typeof repo.performHgaAct, "undefined");
}

section("forged rehydration rejected");

{
  const ctx = await grantPassGpra();
  const { entry, binding, posture } = await pipelineAuthPosture(ctx);
  const act = await ctx.domain3.suspendGovernedHandoff({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    suspendedBy: ACTOR,
    constitutionalBasisKind: BASIS,
  });
  const loaded = await ctx.domain3.loadGovernedHandoffSuspensionAct(act.suspensionActId);
  expectTruthy("load succeeds", !!loaded);
  const authorization = (
    await ctx.domain3.listGovernedHandoffAuthorizationActsByEntry(entry.entryId)
  ).find((a) => a.consumerClassId === binding.consumerClassId)!;

  expectThrows(
    "forged scope rejected on validate",
    () =>
      validatePersistedGovernedHandoffSuspension({
        ...act,
        authorityConstitutionalScope: "handoff_authorization_act",
      }),
    "invalid_handoff_suspension",
  );
  expectThrows(
    "foreign binding on rehydrate rejected",
    () =>
      rehydrateGovernedHandoffSuspension(
        { ...act, bindingId: "governed-handoff-consumer-binding-foreign" },
        {
          entry,
          binding: { ...binding, bindingId: "governed-handoff-consumer-binding-other" as never },
          authorization,
          posture,
        },
      ),
    "invalid_handoff_suspension",
  );
}

section("catalog: suspension and withdrawal mayBePerformed; recall still deferred");

{
  assertHgaMatrixActMayBePerformed("suspension");
  passed++;
  console.log("  ✓ suspension mayBePerformed");
  assertHgaMatrixActMayBePerformed("withdrawal");
  passed++;
  console.log("  ✓ withdrawal mayBePerformed");
  expectThrows(
    "recall mayBePerformed throws",
    () => assertHgaMatrixActMayBePerformed("recall"),
    "invalid_handoff_authority_catalog",
  );
}

console.log(`\nHOF-G6-U2 suspension tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
