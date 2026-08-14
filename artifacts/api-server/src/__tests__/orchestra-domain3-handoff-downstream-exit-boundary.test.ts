/**
 * ORCH-IMP — STD-015 HOF-G8 Downstream Exit Boundary (R58–R65) partial.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-downstream-exit-boundary.test.ts
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
  GOVERNED_HANDOFF_DOWNSTREAM_EXIT_BOUNDARY_TRACEABILITY,
  governProductionProgram,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
  HCCM_CONSUMER_CLASS_CATALOG,
  isOrchestraConstitutionalError,
  listMandatoryReviewDimensionIds,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  resolveDownstreamConsiderationDomain,
  resolveHccmConsumerClass,
  VOLUME_06_HANDOFF_AUTHORITY_TERMINUS,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";
import { rehydrateGovernedHandoffDownstreamExitBoundary } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffDownstreamExitBoundary } from "../orchestra/persistence/domain3-validation.js";

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
const HANDOFF_CTX = "handoff-consumer-context-opaque-g8-001";
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

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-015 HOF-G8 Downstream Exit Boundary",
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
    constitutionalPurpose: "HOF-G8 exit boundary scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G8",
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
    grounds: "Pass for HOF-G8",
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

section("1. terminus / R58–R65 traceability");

{
  expect("volume 06 terminus", VOLUME_06_HANDOFF_AUTHORITY_TERMINUS.volumeId, "volume_06");
  expect(
    "principal authority STD-015",
    VOLUME_06_HANDOFF_AUTHORITY_TERMINUS.principalAuthorityLimit,
    "FI-DSN-STD-015",
  );
  expectTruthy(
    "does not absorb acceptance",
    VOLUME_06_HANDOFF_AUTHORITY_TERMINUS.doesNotAbsorbDownstreamAcceptance,
  );
  expectTruthy(
    "exit completeness deferred on terminus",
    VOLUME_06_HANDOFF_AUTHORITY_TERMINUS.exitCompletenessDeferred,
  );
  for (const req of [
    "FI-DSN-STD-015-R58",
    "FI-DSN-STD-015-R59",
    "FI-DSN-STD-015-R60",
    "FI-DSN-STD-015-R61",
    "FI-DSN-STD-015-R62",
    "FI-DSN-STD-015-R63",
    "FI-DSN-STD-015-R64",
    "FI-DSN-STD-015-R65",
  ] as const) {
    expectTruthy(
      `traceability ${req}`,
      GOVERNED_HANDOFF_DOWNSTREAM_EXIT_BOUNDARY_TRACEABILITY.requirementIds.includes(req),
    );
  }
  const hga = FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!;
  expect(
    "HGA does NOT include invented downstream exit act scope",
    hga.authorizedConstitutionalScopes.includes("handoff_downstream_exit_act" as never),
    false,
  );
  expect(
    "HGA does NOT include lifecycle rejection act scope",
    hga.authorizedConstitutionalScopes.includes("handoff_lifecycle_rejection_act" as never),
    false,
  );
  // Six matrix scopes plus the two peer NON-MATRIX HERCM scopes (R126–R139).
  expect(
    "HGA scopes length includes suspension, withdrawal, recall, resumption, and reentry",
    hga.authorizedConstitutionalScopes.length,
    8,
  );
}

section("2. lawful attribute after complete+posture+binding for CC-01 and CC-02");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const b1 = await bindCc(ctx, entry.entryId, "CC-01");
  const b2 = await bindCc(ctx, entry.entryId, "CC-02");
  await completeBinding(ctx, entry.entryId, b1.bindingId);
  await completeBinding(ctx, entry.entryId, b2.bindingId);

  const a1 = await ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
    entryId: entry.entryId,
    bindingId: b1.bindingId,
    authorityClassId: HGA,
    attributedBy: ACTOR,
  });
  const a2 = await ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
    entryId: entry.entryId,
    bindingId: b2.bindingId,
    authorityClassId: HGA,
    attributedBy: ACTOR,
  });

  expect(
    "CC-01 domain",
    a1.downstreamConsiderationDomain,
    resolveDownstreamConsiderationDomain("CC-01"),
  );
  expect(
    "CC-02 domain",
    a2.downstreamConsiderationDomain,
    resolveDownstreamConsiderationDomain("CC-02"),
  );
  expectTruthy("CC-01 ≠ CC-02 domains", a1.downstreamConsiderationDomain !== a2.downstreamConsiderationDomain);
  expect("HOEM actType exit_boundary", a1.hoemExitBoundaryRecord.actType, "exit_boundary");
  expect("not HGA matrix act", a1.notHgaMatrixActType, true);
  expect("attribution kind", a1.attributionKind, "downstream_exit_boundary_attribution");
  expect("no matrix scope field", "authorityConstitutionalScope" in a1, false);
}

section("3. Completed alone does NOT create exit attribution (R65)");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await completeBinding(ctx, entry.entryId, binding.bindingId);

  const consideration = await ctx.domain3.evaluateDownstreamExitConsideration(binding.bindingId);
  expect("consideration enabled after Completed", consideration.considerationEnabled, true);
  expect("exit NOT attributed from Completed alone", consideration.exitAttributed, false);
  expect(
    "no exit records yet",
    (await ctx.domain3.listGovernedHandoffDownstreamExitBoundaryAttributionsByBinding(binding.bindingId))
      .length,
    0,
  );
}

section("4. attribute without completion denied");

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
    "attribute without completion denied",
    () =>
      ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        attributedBy: ACTOR,
      }),
    "invalid_handoff_downstream_exit_boundary",
  );
}

section("5. wrong domain / foreign CC routing denied");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await completeBinding(ctx, entry.entryId, binding.bindingId);

  await expectThrowsAsync(
    "wrong domain denied",
    () =>
      ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        attributedBy: ACTOR,
        downstreamConsiderationDomain: resolveDownstreamConsiderationDomain("CC-02"),
      }),
    "invalid_handoff_downstream_exit_boundary",
  );
}

section("6. Brain/MAGAC cannot attribute");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await completeBinding(ctx, entry.entryId, binding.bindingId);

  await expectThrowsAsync(
    "MAGAC cannot attribute",
    () =>
      ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: MAGAC,
        attributedBy: ACTOR,
      }),
    "invalid_handoff_downstream_exit_boundary",
  );
  await expectThrowsAsync(
    "Brain attributedBy rejected",
    () =>
      ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        attributedBy: "brain_runtime",
      }),
    "invalid_handoff_downstream_exit_boundary",
  );
}

section("7. no acceptance/membership/mfg/fulfillment/exitCompleteness APIs");

{
  const ctx = await grantPassGpra();
  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("no acceptHandoff", typeof repo.acceptHandoff, "undefined");
  expect("no acceptDownstream", typeof repo.acceptDownstream, "undefined");
  expect("no membershipAdmission", typeof repo.membershipAdmission, "undefined");
  expect("no manufacturingExecution", typeof repo.manufacturingExecution, "undefined");
  expect("no exitCompletenessSatisfy", typeof repo.exitCompletenessSatisfy, "undefined");
  expect("no satisfyExitCompleteness", typeof repo.satisfyExitCompleteness, "undefined");
  expectTruthy(
    "attributeGovernedHandoffDownstreamExitBoundary present",
    typeof repo.attributeGovernedHandoffDownstreamExitBoundary === "function",
  );
}

section("8. rejectHandoffActLayer still undefined; rejection act absent from HGA scopes");

{
  const ctx = await grantPassGpra();
  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("rejectHandoffActLayer undefined", typeof repo.rejectHandoffActLayer, "undefined");
  const hga = FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!;
  expect(
    "handoff_lifecycle_rejection_act absent",
    hga.authorizedConstitutionalScopes.includes("handoff_lifecycle_rejection_act" as never),
    false,
  );
}

section("9. no suspend/recall/withdraw");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await completeBinding(ctx, entry.entryId, binding.bindingId);

  await expectThrowsAsync(
    "attribute with suspend claim rejected",
    () =>
      ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        attributedBy: ACTOR,
        suspendHandoff: true,
      }),
    "invalid_handoff_downstream_exit_boundary",
  );

  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("no suspendHandoff", typeof repo.suspendHandoff, "undefined");
  expect("no recallHandoff", typeof repo.recallHandoff, "undefined");
  expect("no withdrawHandoff", typeof repo.withdrawHandoff, "undefined");
}

section("10. stale GPRA invalidation blocks new exit attribution");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-02");
  await completeBinding(ctx, entry.entryId, binding.bindingId);

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
    "attribute after GPRA invalidation rejected",
    () =>
      ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        attributedBy: ACTOR,
      }),
    "invalid_handoff_downstream_exit_boundary",
  );
}

section("11. forged rehydration rejected");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  const completion = await completeBinding(ctx, entry.entryId, binding.bindingId);
  const posture = (
    await ctx.domain3.listGovernedHandoffPostureDeclarationActsByBinding(binding.bindingId)
  ).at(-1)!;
  const act = await ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    attributedBy: ACTOR,
  });

  expectThrows(
    "forged matrix scope rejected",
    () =>
      validatePersistedGovernedHandoffDownstreamExitBoundary({
        ...act,
        authorityConstitutionalScope: "handoff_downstream_exit_act",
      }),
    "invalid_handoff_downstream_exit_boundary",
  );

  expectThrows(
    "wrong domain on validate rejected",
    () =>
      validatePersistedGovernedHandoffDownstreamExitBoundary({
        ...act,
        downstreamConsiderationDomain: resolveDownstreamConsiderationDomain("CC-02"),
        hoemExitBoundaryRecord: {
          ...act.hoemExitBoundaryRecord,
          downstreamConsiderationDomain: resolveDownstreamConsiderationDomain("CC-02"),
        },
      }),
    "invalid_handoff_downstream_exit_boundary",
  );

  expectThrows(
    "foreign binding on rehydrate rejected",
    () =>
      rehydrateGovernedHandoffDownstreamExitBoundary(
        { ...act, bindingId: "governed-handoff-consumer-binding-foreign" },
        {
          entry,
          binding: { ...binding, bindingId: "governed-handoff-consumer-binding-other" as never },
          posture,
          completion,
        },
      ),
    "invalid_handoff_downstream_exit_boundary",
  );
}

section("12. CC-03 feasibility-not-execution; CC-04/05/06 exclude execution");

{
  expectTruthy(
    "CC-03 domain is feasibility-not-execution",
    resolveDownstreamConsiderationDomain("CC-03").includes("feasibility") &&
      resolveDownstreamConsiderationDomain("CC-03").includes("not_manufacture"),
  );
  expectTruthy(
    "CC-04 excludes fulfillment execution",
    resolveDownstreamConsiderationDomain("CC-04").includes("not_fulfillment_execution"),
  );
  expectTruthy(
    "CC-05 excludes publication execution",
    resolveDownstreamConsiderationDomain("CC-05").includes("not_publication_execution"),
  );
  expectTruthy(
    "CC-06 excludes distribution execution",
    resolveDownstreamConsiderationDomain("CC-06").includes("not_distribution_execution"),
  );

  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  for (const cc of ["CC-03", "CC-04", "CC-05", "CC-06"] as const) {
    const binding = await bindCc(ctx, entry.entryId, cc);
    await completeBinding(ctx, entry.entryId, binding.bindingId);
    const attributed = await ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
      entryId: entry.entryId,
      bindingId: binding.bindingId,
      authorityClassId: HGA,
      attributedBy: ACTOR,
    });
    expect(
      `${cc} routes to catalog domain`,
      attributed.downstreamConsiderationDomain,
      resolveHccmConsumerClass(cc).downstreamConsiderationDomain,
    );
    expect(`${cc} not manufacturing/execution`, attributed.notManufacturingOrFulfillmentOrExecution, true);
  }
  expect("catalog has 6 CCs", HCCM_CONSUMER_CLASS_CATALOG.length, 6);
}

section("13. constructors not on barrel");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffDownstreamExitBoundaryAttributionRecord not on barrel",
    "createGovernedHandoffDownstreamExitBoundaryAttributionRecord" in mod,
    false,
  );
  expect(
    "attributeGovernedHandoffDownstreamExitBoundary not on barrel",
    "attributeGovernedHandoffDownstreamExitBoundary" in mod,
    false,
  );
  expect(
    "assessGovernedHandoffDownstreamExitBoundary on barrel",
    "assessGovernedHandoffDownstreamExitBoundary" in mod,
    true,
  );
  expect(
    "evaluateDownstreamExitConsiderationFromFacts on barrel",
    "evaluateDownstreamExitConsiderationFromFacts" in mod,
    true,
  );
  expect(
    "resolveDownstreamConsiderationDomain on barrel",
    "resolveDownstreamConsiderationDomain" in mod,
    true,
  );
}

section("14. tip≠currency without upstream current");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  await completeBinding(ctx, entry.entryId, binding.bindingId);
  const attributed = await ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    attributedBy: ACTOR,
  });

  const tip = await ctx.domain3.getAuthoritativeHandoffDownstreamExitBoundaryForBinding(
    binding.bindingId,
  );
  expect("tip matches attributed", tip?.exitBoundaryAttributionId, attributed.exitBoundaryAttributionId);

  const before = await ctx.domain3.evaluateHandoffDownstreamExitBoundaryCurrency(
    attributed.exitBoundaryAttributionId,
  );
  expect("currency current while upstream current", before, "current");

  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Material CB change renders GPRA-bound RVA non-compliant",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });

  const after = await ctx.domain3.evaluateHandoffDownstreamExitBoundaryCurrency(
    attributed.exitBoundaryAttributionId,
  );
  expect("tip remains but currency stale after upstream invalidation", after, "stale");
  const stillTip = await ctx.domain3.getAuthoritativeHandoffDownstreamExitBoundaryForBinding(
    binding.bindingId,
  );
  expect(
    "tip still same attribution id",
    stillTip?.exitBoundaryAttributionId,
    attributed.exitBoundaryAttributionId,
  );
}

section("15. G5 complete still works; exit does not mutate completion");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  const completion = await completeBinding(ctx, entry.entryId, binding.bindingId);
  const completionId = completion.completionActId;

  const lifecycleBefore = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect("G5 completed before exit", lifecycleBefore.currentState, "completed");

  await ctx.domain3.attributeGovernedHandoffDownstreamExitBoundary({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    attributedBy: ACTOR,
  });

  const loaded = await ctx.domain3.loadGovernedHandoffCompletionAct(completionId);
  expect("completion unchanged after exit", loaded?.completionActId, completionId);
  expect("completion markers intact", loaded?.r51CompletedMeaning, true);
  const lifecycleAfter = await ctx.domain3.evaluateHandoffActLayerLifecycle(binding.bindingId);
  expect("lifecycle still completed", lifecycleAfter.currentState, "completed");
  expect(
    "authoritative completion unchanged",
    lifecycleAfter.authoritativeCompletionActId,
    completionId,
  );

  const consideration = await ctx.domain3.evaluateDownstreamExitConsideration(binding.bindingId);
  expect("consideration enabled", consideration.considerationEnabled, true);
  expect("exit attributed after linkage", consideration.exitAttributed, true);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
