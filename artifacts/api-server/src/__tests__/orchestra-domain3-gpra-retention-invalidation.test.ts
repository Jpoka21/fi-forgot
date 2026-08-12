/**
 * ORCH-IMP-012 — STD-014 G8 GPRA Retention and Invalidation (R52–R63).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-gpra-retention-invalidation.test.ts
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
  FROZEN_ESTABLISHED_INVALIDATION_AUTHORITY_CLASSES,
  governProductionProgram,
  isOrchestraConstitutionalError,
  listMandatoryReviewDimensionIds,
  MANDATORY_INVALIDATION_TRIGGER_FAMILIES,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";
import { createDomain3GovernedCreationMarker } from "../orchestra/domain3-entry.js";
import { GPRA_RETENTION_AND_INVALIDATION_TRACEABILITY } from "../orchestra/gpra-retention-and-invalidation.js";
import { rehydrateGpraInvalidationAct } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGpraInvalidationAct } from "../orchestra/persistence/domain3-validation.js";

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

const ACTOR = "governance-authority-012";
const IVAC = "invalidation_authority_production_obligation_scope" as const;
const MAGAC = "approval_authority_production_obligation_scope" as const;

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G8 Retention and Invalidation",
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
    constitutionalPurpose: "G8 invalidation scope",
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
  await domain2.determineReviewEntryReadiness({ rvaId: rva.id, determinedBy: ACTOR });
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
        evaluationMethodDescription: "Decision-stage DTF for G8",
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
  const ctx = await admitReview();
  await completeMandatoryActivity(ctx.domain3, ctx.review);
  const determined = await ctx.domain3.recordReviewDetermination({
    reviewId: ctx.review.reviewId,
    outcome: "pass",
    grounds: "Pass for G8",
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
    ...ctx,
    review: determined.review,
    determination: determined.determination,
    gpra,
  };
}

section("IVAC and IT catalogs");

{
  expect("Two IVAC classes", FROZEN_ESTABLISHED_INVALIDATION_AUTHORITY_CLASSES.length, 2);
  expect("Three IT families", MANDATORY_INVALIDATION_TRIGGER_FAMILIES.length, 3);
}

section("Retention default after GPRA grant");

{
  const ctx = await grantPassGpra();
  const validity = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId);
  expect("Default Retention", validity.posture, "retention");
  expect("Forward active", validity.forwardActive, true);
  expect("Handoff eligibility under Retention", validity.newHandoffEligibility, true);
  expectTruthy(
    "Forward-active load finds GPRA",
    !!(await ctx.domain3.loadForwardActiveGpraByRvaObligation({
      rvaId: ctx.rva.id,
      obligationId: ctx.review.obligationId,
    })),
  );
}

section("Lawful IT-1 invalidation");

{
  const ctx = await grantPassGpra();
  const act = await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "governing_law_failure",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Bound Compliance Boundary no longer satisfied by RVA",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
  });
  expect("IT-1 family", act.itFamily, "governing_law_failure");
  expect("Historical grant preserved", act.historicalGrantPreserved, true);
  expect("Not termination", act.notLifecycleTermination, true);
  expect("Cannot silently reactivate", act.cannotSilentlyReactivate, true);

  const validity = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId);
  expect("Posture Invalidated", validity.posture, "invalidated");
  expect("Not forward active", validity.forwardActive, false);
  expect("No new handoff", validity.newHandoffEligibility, false);
  expect("No new intake", validity.newIntakeAuthority, false);

  const historical = await ctx.domain3.loadGpraGrant(ctx.gpra.gpraId);
  expectTruthy("Historical GPRA grant still loadable", !!historical);
  expect("Grant id unchanged", historical!.gpraId, ctx.gpra.gpraId);

  expect(
    "Forward-active load null after invalidation",
    await ctx.domain3.loadForwardActiveGpraByRvaObligation({
      rvaId: ctx.rva.id,
      obligationId: ctx.review.obligationId,
    }),
    null,
  );

  const det = await ctx.domain3.loadReviewDeterminationByReview(ctx.review.reviewId);
  expect("Determination still Pass", det!.outcome, "pass");
}

section("IT-2 materiality gate");

{
  const ctx = await grantPassGpra();
  await expectThrowsAsync(
    "IT-2 without material non-compliance rejected",
    () =>
      ctx.domain3.invalidateGpra({
        gpraId: ctx.gpra.gpraId,
        itFamily: "material_compliance_boundary_change",
        triggeringGoverningSourceId: "FI-DSN-GOV-003",
        constitutionalEvidence: "CB change propagated",
        authorityClassId: IVAC,
        invalidatedBy: ACTOR,
      }),
    "invalid_gpra_invalidation",
  );
  const act = await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-GOV-003",
    constitutionalEvidence: "Propagated CB change renders RVA non-compliant under obligation",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });
  expect("IT-2 material flag", act.materialNonComplianceEstablished, true);
}

section("IT-3 post-grant discovered non-compliance");

{
  const ctx = await grantPassGpra();
  const act = await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "post_grant_discovered_non_compliance",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Documented failure of grant-time governing law",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
  });
  expect("IT-3 family", act.itFamily, "post_grant_discovered_non_compliance");
}

section("Illegal G8 entry and authority");

{
  const ctx = await grantPassGpra();
  await expectThrowsAsync(
    "Unknown IVAC class rejected",
    () =>
      ctx.domain3.invalidateGpra({
        gpraId: ctx.gpra.gpraId,
        itFamily: "governing_law_failure",
        triggeringGoverningSourceId: "FI-DSN-STD-001",
        constitutionalEvidence: "evidence",
        authorityClassId: "forged_ivac" as typeof IVAC,
        invalidatedBy: ACTOR,
      }),
    "invalid_gpra_invalidation",
  );
  await expectThrowsAsync(
    "Unknown IT family rejected",
    () =>
      ctx.domain3.invalidateGpra({
        gpraId: ctx.gpra.gpraId,
        itFamily: "nr_path_only" as "governing_law_failure",
        triggeringGoverningSourceId: "FI-DSN-STD-001",
        constitutionalEvidence: "evidence",
        authorityClassId: IVAC,
        invalidatedBy: ACTOR,
      }),
    "invalid_gpra_invalidation",
  );
  await expectThrowsAsync(
    "Empty triggering source rejected",
    () =>
      ctx.domain3.invalidateGpra({
        gpraId: ctx.gpra.gpraId,
        itFamily: "governing_law_failure",
        triggeringGoverningSourceId: "  ",
        constitutionalEvidence: "evidence",
        authorityClassId: IVAC,
        invalidatedBy: ACTOR,
      }),
    "invalid_gpra_invalidation",
  );
  await expectThrowsAsync(
    "MAGAC class cannot invalidate",
    () =>
      ctx.domain3.invalidateGpra({
        gpraId: ctx.gpra.gpraId,
        itFamily: "governing_law_failure",
        triggeringGoverningSourceId: "FI-DSN-STD-001",
        constitutionalEvidence: "evidence",
        authorityClassId: MAGAC as unknown as typeof IVAC,
        invalidatedBy: ACTOR,
      }),
    "invalid_gpra_invalidation",
  );
}

section("Duplicate invalidation and no silent reactivation");

{
  const ctx = await grantPassGpra();
  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "governing_law_failure",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "first invalidation",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
  });
  await expectThrowsAsync(
    "Second invalidation rejected",
    () =>
      ctx.domain3.invalidateGpra({
        gpraId: ctx.gpra.gpraId,
        itFamily: "governing_law_failure",
        triggeringGoverningSourceId: "FI-DSN-STD-001",
        constitutionalEvidence: "second",
        authorityClassId: IVAC,
        invalidatedBy: ACTOR,
      }),
    "invalid_gpra_invalidation",
  );
}

section("G7 artifacts do not auto-invalidate GPRA");

{
  const ctx = await grantPassGpra();
  const validity = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId);
  expect("Still Retention without invalidation act", validity.posture, "retention");
}

section("Persistence / rehydration adversarial");

{
  const ctx = await grantPassGpra();
  const act = await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "governing_law_failure",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "persisted invalidation",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
  });
  const loaded = await ctx.domain3.loadGpraInvalidationAct(act.invalidationActId);
  expectTruthy("Load invalidation act", !!loaded);
  const byGpra = await ctx.domain3.loadGpraInvalidationActByGpra(ctx.gpra.gpraId);
  expect("Load by GPRA", byGpra!.invalidationActId, act.invalidationActId);

  const forged = {
    ...structuredClone(act),
    invalidationActId: "gpra-invalidation-forged",
    authorityClassId: "forged_ivac",
    governedCreationMarker: createDomain3GovernedCreationMarker(),
    traceability: GPRA_RETENTION_AND_INVALIDATION_TRACEABILITY,
  };
  expectThrows(
    "Forged IVAC fails validation",
    () => validatePersistedGpraInvalidationAct(forged),
    "invalid_gpra_invalidation",
  );

  const approval = await ctx.domain3.loadApprovalActByReview(ctx.review.reviewId);
  const evidenceRecords = await ctx.domain3.listReviewEvidenceByReview(ctx.review.reviewId);
  const activityRecords = await ctx.domain3.listReviewDimensionActivitiesByReview(
    ctx.review.reviewId,
  );
  const foreign = {
    ...structuredClone(act),
    invalidationActId: "gpra-invalidation-foreign-gpra",
    gpraId: "gpra-00000000-0000-0000-0000-000000000099",
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  };
  expectThrows(
    "Foreign GPRA linkage fails rehydration",
    () =>
      rehydrateGpraInvalidationAct(foreign, {
        gpra: ctx.gpra,
        approval: approval!,
        review: ctx.review,
        determination: ctx.determination,
        evidenceRecords,
        activityRecords,
      }),
    "invalid_gpra_invalidation",
  );
}

section("G9 / withdrawal / suspension boundary");

{
  const ctx = await grantPassGpra();
  const act = await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "governing_law_failure",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "boundary check",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
  });
  const keys = Object.keys(act);
  expectTruthy(
    "No supersession/withdrawal/suspension fields",
    !keys.includes("superseded") &&
      !keys.includes("withdrawal") &&
      !keys.includes("suspension") &&
      !keys.includes("expiry"),
  );
}

section("G6 preservation — Approval still loadable");

{
  const ctx = await grantPassGpra();
  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "governing_law_failure",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "preserve approval",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
  });
  const approval = await ctx.domain3.loadApprovalActByReview(ctx.review.reviewId);
  expectTruthy("Approval history preserved", !!approval);
}

console.log(`\nG8 GPRA Retention and Invalidation: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
