/**
 * ORCH-IMP-012 — STD-014 G9 GPRA Supersession and Succession (R64–R72).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-gpra-supersession-succession.test.ts
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
  FROZEN_ESTABLISHED_SUPERSESSION_AUTHORITY_CLASSES,
  governProductionProgram,
  isOrchestraConstitutionalError,
  listMandatoryReviewDimensionIds,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  MANDATORY_SUPERSESSION_TRIGGER_FAMILIES,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";
import { createDomain3GovernedCreationMarker } from "../orchestra/domain3-entry.js";
import { GPRA_SUPERSESSION_AND_SUCCESSION_TRACEABILITY } from "../orchestra/gpra-supersession-and-succession.js";
import { rehydrateGpraSupersessionAct } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGpraSupersessionAct } from "../orchestra/persistence/domain3-validation.js";

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

const ACTOR = "governance-authority-014";
const MAGAC = "approval_authority_production_obligation_scope" as const;
const SSAC = "supersession_authority_production_obligation_scope" as const;
const IVAC = "invalidation_authority_production_obligation_scope" as const;
const HANDOFF_CTX = "handoff-consumer-context-opaque-001";

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G9 Supersession and Succession",
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
    constitutionalPurpose: "G9 supersession scope",
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
        evaluationMethodDescription: "Decision-stage DTF for G9",
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
    grounds: "Pass for G9",
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

/**
 * Domain 2 successor RVA + new Pass Review + Approval, ready for ST-1 grant.
 * One active review per RVA blocks a second Pass path on the predecessor RVA.
 */
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
    grounds: "Pass successor for G9 ST-1",
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

const ST1_PARAMS = {
  handoffConsumerContextId: HANDOFF_CTX,
  authorityClassId: SSAC,
  supersededBy: ACTOR,
  triggeringGoverningSourceId: "FI-DSN-STD-014",
  constitutionalEvidence: "ST-1 replacement GPRA grant succession under same obligation",
} as const;

section("SSAC and ST catalogs");

{
  expect("Two SSAC classes", FROZEN_ESTABLISHED_SUPERSESSION_AUTHORITY_CLASSES.length, 2);
  expect("Three ST families", MANDATORY_SUPERSESSION_TRIGGER_FAMILIES.length, 3);
  expect(
    "ST-1 encoding",
    MANDATORY_SUPERSESSION_TRIGGER_FAMILIES[0],
    "replacement_gpra_grant",
  );
}

section("Lawful ST-1: grant second GPRA with st1Supersession");

{
  const ctx = await grantPassGpra();
  const ready = await prepareSuccessorPassReady(ctx);
  const successorGpra = await ctx.domain3.grantGpra({
    reviewId: ready.successorReview.reviewId,
    grantedBy: ACTOR,
    st1Supersession: {
      predecessorGpraId: ctx.gpra.gpraId,
      ...ST1_PARAMS,
    },
  });

  const predValidity = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId);
  expect("Predecessor posture superseded", predValidity.posture, "superseded");
  expect("Predecessor not forward active", predValidity.forwardActive, false);
  expect("Predecessor no handoff", predValidity.newHandoffEligibility, false);
  expectTruthy("Predecessor supersessionActId set", !!predValidity.supersessionActId);

  const succValidity = await ctx.domain3.evaluateGpraValidity(successorGpra.gpraId);
  expect("Successor posture retention", succValidity.posture, "retention");
  expect("Successor forward active", succValidity.forwardActive, true);

  const forwardPrior = await ctx.domain3.loadForwardActiveGpraByRvaObligation({
    rvaId: ctx.rva.id,
    obligationId: ctx.obligationId,
  });
  expect("Forward-active on prior RVA null", forwardPrior, null);

  const forwardSucc = await ctx.domain3.loadForwardActiveGpraByRvaObligation({
    rvaId: ready.successorRva.id,
    obligationId: ctx.obligationId,
  });
  expect("Forward-active finds successor", forwardSucc!.gpraId, successorGpra.gpraId);

  const authoritative = await ctx.domain3.loadAuthoritativeGpraByObligationContext({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
  });
  expect("Authoritative in context is successor", authoritative!.gpraId, successorGpra.gpraId);

  const historical = await ctx.domain3.loadGpraGrant(ctx.gpra.gpraId);
  expectTruthy("Historical predecessor grant still loadable", !!historical);
  expect("Grant id unchanged", historical!.gpraId, ctx.gpra.gpraId);

  const act = await ctx.domain3.loadGpraSupersessionActByPredecessor(ctx.gpra.gpraId);
  expect("ST-1 family", act!.stFamily, "replacement_gpra_grant");
  expect("Opaque handoff context recorded", act!.handoffConsumerContextId, HANDOFF_CTX);
  expect("Not invalidation", act!.notInvalidation, true);
  expect("Historical predecessor preserved", act!.historicalPredecessorPreserved, true);
}

section("Automatic grant while Retention exists WITHOUT st1Supersession → reject");

{
  const ctx = await grantPassGpra();
  const ready = await prepareSuccessorPassReady(ctx);
  await expectThrowsAsync(
    "Grant without st1Supersession rejected",
    () =>
      ctx.domain3.grantGpra({
        reviewId: ready.successorReview.reviewId,
        grantedBy: ACTOR,
      }),
    "invalid_gpra_supersession",
  );
}

section("Invalidated predecessor ST-1 → reject");

{
  const ctx = await grantPassGpra();
  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "governing_law_failure",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Invalidate before ST-1 attempt",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
  });
  const ready = await prepareSuccessorPassReady(ctx);
  await expectThrowsAsync(
    "ST-1 with Invalidated predecessor rejected",
    () =>
      ctx.domain3.grantGpra({
        reviewId: ready.successorReview.reviewId,
        grantedBy: ACTOR,
        st1Supersession: {
          predecessorGpraId: ctx.gpra.gpraId,
          ...ST1_PARAMS,
        },
      }),
    "invalid_gpra_supersession",
  );

  // G8 R62 path: grant without supersession after Invalidated is allowed
  const replacement = await ctx.domain3.grantGpra({
    reviewId: ready.successorReview.reviewId,
    grantedBy: ACTOR,
  });
  expectTruthy("Replacement grant after Invalidated without supersession", !!replacement);
  const predAfter = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId);
  expect("Invalidated not superseded", predAfter.posture, "invalidated");
  expect("No supersession act on Invalidated", predAfter.supersessionActId, null);
}

section("Forged SSAC / MAGAC / unknown ST → reject");

{
  const ctx = await grantPassGpra();
  const ready = await prepareSuccessorPassReady(ctx);
  await expectThrowsAsync(
    "Forged SSAC rejected",
    () =>
      ctx.domain3.grantGpra({
        reviewId: ready.successorReview.reviewId,
        grantedBy: ACTOR,
        st1Supersession: {
          predecessorGpraId: ctx.gpra.gpraId,
          ...ST1_PARAMS,
          authorityClassId: "forged_ssac" as typeof SSAC,
        },
      }),
    "invalid_gpra_supersession",
  );
  await expectThrowsAsync(
    "MAGAC cannot supersede",
    () =>
      ctx.domain3.grantGpra({
        reviewId: ready.successorReview.reviewId,
        grantedBy: ACTOR,
        st1Supersession: {
          predecessorGpraId: ctx.gpra.gpraId,
          ...ST1_PARAMS,
          authorityClassId: MAGAC as unknown as typeof SSAC,
        },
      }),
    "invalid_gpra_supersession",
  );
  await expectThrowsAsync(
    "IVAC cannot supersede",
    () =>
      ctx.domain3.grantGpra({
        reviewId: ready.successorReview.reviewId,
        grantedBy: ACTOR,
        st1Supersession: {
          predecessorGpraId: ctx.gpra.gpraId,
          ...ST1_PARAMS,
          authorityClassId: IVAC as unknown as typeof SSAC,
        },
      }),
    "invalid_gpra_supersession",
  );

  const ctx2 = await grantPassGpra();
  const ready2 = await prepareSuccessorPassReady(ctx2);
  // Persist successor Retention via lawful ST-1, then attempt unknown ST against a fresh
  // Retention pair is unnecessary — assert unknown family at supersedeGpra entry.
  const succ2 = await ctx2.domain3.grantGpra({
    reviewId: ready2.successorReview.reviewId,
    grantedBy: ACTOR,
    st1Supersession: {
      predecessorGpraId: ctx2.gpra.gpraId,
      ...ST1_PARAMS,
      handoffConsumerContextId: "ctx-for-unknown-st-setup",
    },
  });
  await expectThrowsAsync(
    "Unknown ST family rejected on supersedeGpra",
    () =>
      ctx2.domain3.supersedeGpra({
        predecessorGpraId: ctx2.gpra.gpraId,
        successorGpraId: succ2.gpraId,
        stFamily: "nr_path_only" as "replacement_gpra_grant",
        handoffConsumerContextId: HANDOFF_CTX,
        authorityClassId: SSAC,
        supersededBy: ACTOR,
        triggeringGoverningSourceId: "FI-DSN-STD-014",
        constitutionalEvidence: "unknown",
      }),
    "invalid_gpra_supersession",
  );
}

section("Cross obligation ST-1 → reject");

{
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-014 G9 cross-obligation",
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
    constitutionalPurpose: "G9 cross-obligation",
    createdBy: ACTOR,
  });
  program = addObligationToProgram(program, {
    description: "Primary obligation",
    createdBy: ACTOR,
  });
  program = addObligationToProgram(program, {
    description: "Secondary obligation",
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
  const obligationId = program.obligations[0]!.id;
  const secondObligationId = program.obligations[1]!.id;

  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2, undefined, domain1);

  async function passGrantForObligation(obId: typeof obligationId) {
    const exploration = await domain2.beginExplorationPosture({
      programId: program.id,
      obligationId: obId,
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
      obligationId: obId,
      explorationPostureRecordId: exitReady.recordId,
      governingBasis: "Commitment",
      committedBy: ACTOR,
    });
    const candidate = await domain2.establishRealizedVisualArtifact({
      programId: program.id,
      obligationId: obId,
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
    const determined = await domain3.recordReviewDetermination({
      reviewId: review.reviewId,
      outcome: "pass",
      grounds: "Pass",
      determinedBy: ACTOR,
    });
    await domain3.recordApprovalAct({
      reviewId: determined.review.reviewId,
      authorityClassId: MAGAC,
      approvedBy: ACTOR,
    });
    const gpra = await domain3.grantGpra({
      reviewId: determined.review.reviewId,
      grantedBy: ACTOR,
    });
    return { rva, review: determined.review, gpra };
  }

  const first = await passGrantForObligation(obligationId);
  const second = await passGrantForObligation(secondObligationId);

  await expectThrowsAsync(
    "Cross-obligation ST-1 supersede rejected",
    () =>
      domain3.supersedeGpra({
        predecessorGpraId: first.gpra.gpraId,
        successorGpraId: second.gpra.gpraId,
        stFamily: "replacement_gpra_grant",
        handoffConsumerContextId: HANDOFF_CTX,
        authorityClassId: SSAC,
        supersededBy: ACTOR,
        triggeringGoverningSourceId: "FI-DSN-STD-014",
        constitutionalEvidence: "cross obligation",
      }),
    "invalid_gpra_supersession",
  );
}

section("Cross program → reject");

{
  const a = await grantPassGpra();
  const b = await grantPassGpra();
  await expectThrowsAsync(
    "Cross-program supersession rejected",
    () =>
      a.domain3.supersedeGpra({
        predecessorGpraId: a.gpra.gpraId,
        successorGpraId: b.gpra.gpraId,
        stFamily: "authoritative_succession_rule",
        handoffConsumerContextId: HANDOFF_CTX,
        authorityClassId: SSAC,
        supersededBy: ACTOR,
        triggeringGoverningSourceId: "FI-DSN-STD-014",
        constitutionalEvidence: "cross program",
      }),
    "invalid_gpra_supersession",
  );
}

section("Duplicate supersession → reject");

{
  const ctx = await grantPassGpra();
  const ready = await prepareSuccessorPassReady(ctx);
  await ctx.domain3.grantGpra({
    reviewId: ready.successorReview.reviewId,
    grantedBy: ACTOR,
    st1Supersession: {
      predecessorGpraId: ctx.gpra.gpraId,
      ...ST1_PARAMS,
    },
  });
  const succ = await ctx.domain3.loadGpraGrantByReview(ready.successorReview.reviewId);
  await expectThrowsAsync(
    "Duplicate supersession rejected",
    () =>
      ctx.domain3.supersedeGpra({
        predecessorGpraId: ctx.gpra.gpraId,
        successorGpraId: succ!.gpraId,
        stFamily: "authoritative_succession_rule",
        handoffConsumerContextId: "other-context",
        authorityClassId: SSAC,
        supersededBy: ACTOR,
        triggeringGoverningSourceId: "FI-DSN-STD-014",
        constitutionalEvidence: "duplicate",
      }),
    "invalid_gpra_supersession",
  );
}

section("evaluateGpraValidity postures and context matching");

{
  const ctx = await grantPassGpra();
  const ready = await prepareSuccessorPassReady(ctx);
  await ctx.domain3.grantGpra({
    reviewId: ready.successorReview.reviewId,
    grantedBy: ACTOR,
    st1Supersession: {
      predecessorGpraId: ctx.gpra.gpraId,
      ...ST1_PARAMS,
    },
  });

  const omitCtx = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId);
  expect("Omit context → superseded fail-closed", omitCtx.posture, "superseded");

  const matchCtx = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId, HANDOFF_CTX);
  expect("Matching context → superseded", matchCtx.posture, "superseded");

  const otherCtx = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId, "other-context");
  expect("Non-matching context → retention", otherCtx.posture, "retention");
  expect("Non-matching context forward active", otherCtx.forwardActive, true);
}

section("G8 invalidation still works on Superseded historical GPRA");

{
  const ctx = await grantPassGpra();
  const ready = await prepareSuccessorPassReady(ctx);
  await ctx.domain3.grantGpra({
    reviewId: ready.successorReview.reviewId,
    grantedBy: ACTOR,
    st1Supersession: {
      predecessorGpraId: ctx.gpra.gpraId,
      ...ST1_PARAMS,
    },
  });
  const inv = await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "governing_law_failure",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Invalidate superseded historical GPRA",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
  });
  expectTruthy("Invalidation act created on superseded GPRA", !!inv);
  const validity = await ctx.domain3.evaluateGpraValidity(ctx.gpra.gpraId);
  expect("Invalidation wins over supersession", validity.posture, "invalidated");
  expectTruthy("Supersession history retained on assessment", !!validity.supersessionActId);
  const ss = await ctx.domain3.loadGpraSupersessionActByPredecessor(ctx.gpra.gpraId);
  expectTruthy("Supersession act still loadable after invalidation", !!ss);
}

section("Rehydration foreign predecessor fails");

{
  const ctx = await grantPassGpra();
  const ready = await prepareSuccessorPassReady(ctx);
  const successorGpra = await ctx.domain3.grantGpra({
    reviewId: ready.successorReview.reviewId,
    grantedBy: ACTOR,
    st1Supersession: {
      predecessorGpraId: ctx.gpra.gpraId,
      ...ST1_PARAMS,
    },
  });
  const act = await ctx.domain3.loadGpraSupersessionActByPredecessor(ctx.gpra.gpraId);
  const predApproval = await ctx.domain3.loadApprovalActByReview(ctx.review.reviewId);
  const succApproval = await ctx.domain3.loadApprovalActByReview(ready.successorReview.reviewId);
  const predEvidence = await ctx.domain3.listReviewEvidenceByReview(ctx.review.reviewId);
  const predActivity = await ctx.domain3.listReviewDimensionActivitiesByReview(ctx.review.reviewId);
  const succEvidence = await ctx.domain3.listReviewEvidenceByReview(ready.successorReview.reviewId);
  const succActivity = await ctx.domain3.listReviewDimensionActivitiesByReview(
    ready.successorReview.reviewId,
  );
  const foreign = {
    ...structuredClone(act!),
    supersessionActId: "gpra-supersession-foreign-pred",
    predecessorGpraId: "gpra-00000000-0000-0000-0000-000000000099",
    governedCreationMarker: createDomain3GovernedCreationMarker(),
    traceability: GPRA_SUPERSESSION_AND_SUCCESSION_TRACEABILITY,
  };
  expectThrows(
    "Foreign predecessor linkage fails rehydration",
    () =>
      rehydrateGpraSupersessionAct(foreign, {
        predecessorGpra: ctx.gpra,
        successorGpra,
        predecessorApproval: predApproval!,
        successorApproval: succApproval!,
        predecessorReview: ctx.review,
        successorReview: ready.successorReview,
        predecessorDetermination: ctx.determination,
        successorDetermination: ready.successorDetermination,
        predecessorEvidenceRecords: predEvidence,
        predecessorActivityRecords: predActivity,
        successorEvidenceRecords: succEvidence,
        successorActivityRecords: succActivity,
        predecessorInvalidated: false,
        predecessorAlreadySupersededInContext: false,
      }),
    "invalid_gpra_supersession",
  );

  expectThrows(
    "Forged SSAC fails validation",
    () =>
      validatePersistedGpraSupersessionAct({
        ...structuredClone(act!),
        authorityClassId: "forged_ssac",
      }),
    "invalid_gpra_supersession",
  );
}

section("Public API: createGpraSupersessionAct not on index");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGpraSupersessionAct not exported",
    "createGpraSupersessionAct" in mod,
    false,
  );
  expectTruthy(
    "evaluateGpraValidityFromPostureActs exported",
    "evaluateGpraValidityFromPostureActs" in mod,
  );
}

section("R72 boundary — no withdrawal/suspension fields");

{
  const ctx = await grantPassGpra();
  const ready = await prepareSuccessorPassReady(ctx);
  await ctx.domain3.grantGpra({
    reviewId: ready.successorReview.reviewId,
    grantedBy: ACTOR,
    st1Supersession: {
      predecessorGpraId: ctx.gpra.gpraId,
      ...ST1_PARAMS,
    },
  });
  const act = await ctx.domain3.loadGpraSupersessionActByPredecessor(ctx.gpra.gpraId);
  const keys = Object.keys(act!);
  expectTruthy(
    "No withdrawal/suspension/third-revocation fields",
    !keys.includes("withdrawal") &&
      !keys.includes("suspension") &&
      !keys.includes("expiry") &&
      !keys.includes("revocation"),
  );
}

console.log(`\nG9 GPRA Supersession and Succession: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
