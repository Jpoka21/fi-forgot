/**
 * ORCH-IMP-010 — STD-014 G6 Approval Authority and GPRA Grant (R34–R43).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-approval-gpra.test.ts
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
  FROZEN_ESTABLISHED_APPROVAL_AUTHORITY_CLASSES,
  governProductionProgram,
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
import { createDomain3RepositoryWithStorage } from "../orchestra/persistence/domain3-repository.js";
import { createInMemoryDomain3Storage } from "../orchestra/persistence/domain3-in-memory-storage.js";
import {
  rehydrateApprovalAct,
  rehydrateGpraGrant,
} from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGpraGrant } from "../orchestra/persistence/domain3-validation.js";

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

const ACTOR = "governance-authority-010";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G6 Approval and GPRA",
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
    constitutionalPurpose: "G6 approval scope",
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

async function admitReview(): Promise<{
  domain1: Domain1Repository;
  domain2: Domain2Repository;
  domain3: Domain3Repository;
  program: ProductionProgram;
  rva: RealizedVisualArtifact;
  review: ProductionReadinessReview;
}> {
  const { domain1, program, obligationId } = await buildGovernedDomain1();
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
  await domain2.determineReviewEntryReadiness({
    rvaId: rva.id,
    determinedBy: ACTOR,
  });
  const review = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  return { domain1, domain2, domain3, program, rva, review };
}

async function completeMandatoryActivity(
  domain3: Domain3Repository,
  review: ProductionReadinessReview,
): Promise<void> {
  for (const dimensionId of listMandatoryReviewDimensionIds()) {
    if (dimensionId === "design_time_feasibility") {
      await domain3.recordDesignTimeFeasibilityEvaluation({
        reviewId: review.reviewId,
        evaluationMethodDescription: "Decision-stage DTF for G6",
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

async function completePassReview() {
  const ctx = await admitReview();
  await completeMandatoryActivity(ctx.domain3, ctx.review);
  const determined = await ctx.domain3.recordReviewDetermination({
    reviewId: ctx.review.reviewId,
    outcome: "pass",
    grounds: "Pass for Approval consideration",
    determinedBy: ACTOR,
  });
  return { ...ctx, review: determined.review, determination: determined.determination };
}

section("MAGAC catalog");

{
  expect("Two established MAGAC classes", FROZEN_ESTABLISHED_APPROVAL_AUTHORITY_CLASSES.length, 2);
  expectTruthy(
    "Obligation-scoped class present",
    FROZEN_ESTABLISHED_APPROVAL_AUTHORITY_CLASSES.some(
      (c) => c.authorityClassId === "approval_authority_production_obligation_scope",
    ),
  );
}

section("Pass prerequisite and illegal Determination outcomes");

{
  const { domain3, review } = await admitReview();
  await expectThrowsAsync(
    "Approval without Determination rejected",
    () =>
      domain3.recordApprovalAct({
        reviewId: review.reviewId,
        authorityClassId: "approval_authority_production_obligation_scope",
        approvedBy: ACTOR,
      }),
    "invalid_approval_authority",
  );

  await completeMandatoryActivity(domain3, review);
  const conditional = await domain3.recordReviewDetermination({
    reviewId: review.reviewId,
    outcome: "conditional",
    conditions: ["Condition A"],
    grounds: "Conditional",
    determinedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Conditional cannot become Approval",
    () =>
      domain3.recordApprovalAct({
        reviewId: conditional.review.reviewId,
        authorityClassId: "approval_authority_production_obligation_scope",
        approvedBy: ACTOR,
      }),
    "invalid_approval_authority",
  );
}

{
  const { domain3, review } = await admitReview();
  await completeMandatoryActivity(domain3, review);
  await domain3.recordReviewDetermination({
    reviewId: review.reviewId,
    outcome: "fail",
    grounds: "Failed Review Determination",
    determinedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Fail cannot become Approval",
    () =>
      domain3.recordApprovalAct({
        reviewId: review.reviewId,
        authorityClassId: "approval_authority_production_obligation_scope",
        approvedBy: ACTOR,
      }),
    "invalid_approval_authority",
  );
}

section("Lawful Approval then GPRA (TOC-PA)");

{
  const ctx = await completePassReview();
  const eligibility = await ctx.domain3.evaluateApprovalConsiderationEligibility(
    ctx.review.reviewId,
  );
  expect("Eligible for consideration after Pass", eligibility.eligibleForApprovalConsideration, true);
  expect("Pass present", eligibility.passDeterminationPresent, true);

  await expectThrowsAsync(
    "Forged authority class rejected",
    () =>
      ctx.domain3.recordApprovalAct({
        reviewId: ctx.review.reviewId,
        authorityClassId: "reviewer_role_manager" as "approval_authority_production_obligation_scope",
        approvedBy: ACTOR,
      }),
    "invalid_approval_authority",
  );

  await expectThrowsAsync(
    "GPRA before Approval rejected",
    () => ctx.domain3.grantGpra({ reviewId: ctx.review.reviewId, grantedBy: ACTOR }),
    "invalid_gpra_grant",
  );

  const approval = await ctx.domain3.recordApprovalAct({
    reviewId: ctx.review.reviewId,
    authorityClassId: "approval_authority_production_obligation_scope",
    approvedBy: ACTOR,
  });
  expect("Approval act recorded", approval.gpraNotCreatedByThisAct, true);
  expect("Approval MFG not performed", approval.manufacturingValidationNotPerformed, true);
  expect("Approval fulfillment not performed", approval.fulfillmentExecutionNotPerformed, true);
  expect("Review posture unchanged", (await ctx.domain3.loadProductionReadinessReview(ctx.review.reviewId))?.posture, "review_determined");
  expect(
    "Determination unchanged",
    (await ctx.domain3.loadReviewDeterminationByReview(ctx.review.reviewId))?.outcome,
    "pass",
  );

  await expectThrowsAsync(
    "Duplicate Approval rejected",
    () =>
      ctx.domain3.recordApprovalAct({
        reviewId: ctx.review.reviewId,
        authorityClassId: "approval_authority_production_obligation_scope",
        approvedBy: ACTOR,
      }),
    "invalid_approval_authority",
  );

  const gpra = await ctx.domain3.grantGpra({
    reviewId: ctx.review.reviewId,
    grantedBy: ACTOR,
  });
  expect("GPRA binds Review RVA", gpra.rvaId, ctx.review.rvaId);
  expect("GPRA binds obligation", gpra.obligationId, ctx.review.obligationId);
  expect("GPRA links Approval", gpra.approvalActId, approval.approvalActId);
  expect("Membership not conferred", gpra.collectionMembershipNotConferred, true);
  expect("Handoff not authorized", gpra.governedHandoffNotAuthorized, true);
  expect("GPRA MFG not performed", gpra.manufacturingValidationNotPerformed, true);

  await expectThrowsAsync(
    "Duplicate GPRA rejected",
    () => ctx.domain3.grantGpra({ reviewId: ctx.review.reviewId, grantedBy: ACTOR }),
    "invalid_gpra_grant",
  );

  const loaded = await ctx.domain3.loadGpraGrantByRvaObligation({
    rvaId: ctx.rva.id,
    obligationId: ctx.review.obligationId,
  });
  expect("Load by RVA+obligation", loaded?.gpraId, gpra.gpraId);
  expect("Domain 2 RVA unchanged", (await ctx.domain2.loadRva(ctx.rva.id))?.posture, "rva_exists");
}

section("EGWG withholding");

{
  const ctx = await completePassReview();
  const withholding = await ctx.domain3.withholdApproval({
    reviewId: ctx.review.reviewId,
    groundFamily: "bound_governing_prerequisites_not_satisfied",
    grounds: "Required upstream governing input absent",
    withheldBy: ACTOR,
  });
  expect("Pass preserved flag", withholding.passDeterminationPreserved, true);
  expect(
    "Pass Determination still Pass",
    (await ctx.domain3.loadReviewDeterminationByReview(ctx.review.reviewId))?.outcome,
    "pass",
  );

  await expectThrowsAsync(
    "Approval after withholding rejected",
    () =>
      ctx.domain3.recordApprovalAct({
        reviewId: ctx.review.reviewId,
        authorityClassId: "approval_authority_production_obligation_scope",
        approvedBy: ACTOR,
      }),
    "invalid_approval_authority",
  );
  await expectThrowsAsync(
    "GPRA after withholding rejected",
    () => ctx.domain3.grantGpra({ reviewId: ctx.review.reviewId, grantedBy: ACTOR }),
    "invalid_gpra_grant",
  );
}

section("Domain1 required for G6");

{
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3NoD1 = createDomain3Repository(domain2);
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
  const review = await domain3NoD1.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  await completeMandatoryActivity(domain3NoD1, review);
  await domain3NoD1.recordReviewDetermination({
    reviewId: review.reviewId,
    outcome: "pass",
    grounds: "Pass",
    determinedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Approval without Domain1 Program source rejected",
    () =>
      domain3NoD1.recordApprovalAct({
        reviewId: review.reviewId,
        authorityClassId: "approval_authority_production_obligation_scope",
        approvedBy: ACTOR,
      }),
    "invalid_approval_authority",
  );
}

section("Persistence / rehydration / immutability");

{
  const storage = createInMemoryDomain3Storage();
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3RepositoryWithStorage(domain2, storage, undefined, domain1);
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
  await completeMandatoryActivity(domain3, review);
  await domain3.recordReviewDetermination({
    reviewId: review.reviewId,
    outcome: "pass",
    grounds: "Pass",
    determinedBy: ACTOR,
  });
  const approval = await domain3.recordApprovalAct({
    reviewId: review.reviewId,
    authorityClassId: "approval_authority_production_program_scope",
    approvedBy: ACTOR,
  });
  const gpra = await domain3.grantGpra({ reviewId: review.reviewId, grantedBy: ACTOR });

  const frozenApproval = rehydrateApprovalAct(structuredClone(approval));
  expectThrows("Approval immutable", () => {
    (frozenApproval as { approvedBy: string }).approvedBy = "forged";
  });
  const frozenGpra = rehydrateGpraGrant(structuredClone(gpra));
  expectThrows("GPRA immutable", () => {
    (frozenGpra as { grantedBy: string }).grantedBy = "forged";
  });

  expectThrows(
    "GPRA with forged authority class rejected",
    () =>
      validatePersistedGpraGrant({
        ...gpra,
        authorityClassId: "forged_class",
      }),
    "invalid_gpra_grant",
  );
}

section("G7 separation");

{
  const ctx = await completePassReview();
  const approval = await ctx.domain3.recordApprovalAct({
    reviewId: ctx.review.reviewId,
    authorityClassId: "approval_authority_production_obligation_scope",
    approvedBy: ACTOR,
  });
  const keys = Object.keys(approval as object);
  expectTruthy("No rework field", !keys.includes("rework") && !keys.includes("ddac"));
  const gpra = await ctx.domain3.grantGpra({ reviewId: ctx.review.reviewId, grantedBy: ACTOR });
  const gpraKeys = Object.keys(gpra as object);
  expectTruthy("No handoff grant", !gpraKeys.includes("handoff") && !gpraKeys.includes("queue"));
}

console.log(`\nG6 Approval and GPRA: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
