/**
 * ORCH-IMP-022 — STD-015 HOF-G4 Handoff Posture Declaration (R40–R47).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-posture-declaration.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  declareProductionIntent,
  DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES,
  determineExplorationEntry,
  draftProductionProgram,
  FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES,
  FROZEN_HANDOFF_POSTURE_CLASSES,
  GOVERNED_HANDOFF_POSTURE_DECLARATION_TRACEABILITY,
  governProductionProgram,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
  HCCM_CONSUMER_CLASS_CATALOG,
  isFrozenHandoffPostureClass,
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
import { rehydrateGovernedHandoffPostureDeclaration } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffPostureDeclaration } from "../orchestra/persistence/domain3-validation.js";

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
const SSAC = "supersession_authority_production_obligation_scope" as const;
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
    purpose: "STD-015 HOF-G4 Handoff Posture",
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
    constitutionalPurpose: "HOF-G4 posture scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G4",
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
    grounds: "Pass for HOF-G4",
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

section("HOF-G4 catalogs, R40–R47 traceability, HGA posture scope");

{
  expect("frozen posture classes length", FROZEN_HANDOFF_POSTURE_CLASSES.length, 3);
  expectTruthy("library_intake_posture frozen", isFrozenHandoffPostureClass("library_intake_posture"));
  expectTruthy(
    "production_catalog_posture frozen",
    isFrozenHandoffPostureClass("production_catalog_posture"),
  );
  expectTruthy("none frozen (CC-03..06 affinity)", isFrozenHandoffPostureClass("none"));
  expect("active not frozen", isFrozenHandoffPostureClass("active"), false);
  expect("approved not frozen", isFrozenHandoffPostureClass("approved"), false);
  expect("completed not frozen", isFrozenHandoffPostureClass("completed"), false);
  expectTruthy(
    "traceability R40",
    GOVERNED_HANDOFF_POSTURE_DECLARATION_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R40"),
  );
  expectTruthy(
    "traceability R47",
    GOVERNED_HANDOFF_POSTURE_DECLARATION_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R47"),
  );
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_POSTURE_DECLARATION_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
  const hga = FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!;
  expectTruthy(
    "HGA includes posture declaration scope",
    hga.authorizedConstitutionalScopes.includes("handoff_posture_declaration_act"),
  );
  expectTruthy(
    "HOEM posture_declaration still listed in G7 deferred catalog (peer framework)",
    (DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES as readonly string[]).includes("posture_declaration"),
  );
  expect("CC-01 affinity", HCCM_CONSUMER_CLASS_CATALOG[0]!.postureClassAffinity, "library_intake_posture");
  expect(
    "CC-02 affinity",
    HCCM_CONSUMER_CLASS_CATALOG[1]!.postureClassAffinity,
    "production_catalog_posture",
  );
}

section("createGovernedHandoffPostureDeclarationActRecord not on barrel");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffPostureDeclarationActRecord not on barrel",
    "createGovernedHandoffPostureDeclarationActRecord" in mod,
    false,
  );
  expect(
    "assessGovernedHandoffPostureDeclaration on barrel",
    "assessGovernedHandoffPostureDeclaration" in mod,
    true,
  );
  expect("declareHandoffPosture not on barrel", "declareHandoffPosture" in mod, false);
  expect(
    "completeHandoff not on barrel (R48+)",
    "completeHandoff" in mod,
    false,
  );
}

section("Lawful posture declaration: frozen classes; HOEM; not completion/execution");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);

  const cases = [
    { cc: "CC-01" as const, posture: "library_intake_posture" as const },
    { cc: "CC-02" as const, posture: "production_catalog_posture" as const },
    { cc: "CC-03" as const, posture: "none" as const },
  ];

  for (const { cc, posture } of cases) {
    const binding = await bindCc(ctx, entry.entryId, cc);
    const assessment = await ctx.domain3.evaluateGovernedHandoffPostureDeclaration({
      entryId: entry.entryId,
      bindingId: binding.bindingId,
    });
    expect(`mayDeclare ${cc}`, assessment.mayDeclare, true);
    expect(`not authorization ${cc}`, assessment.notHandoffAuthorization, true);
    expect(`not completion ${cc}`, assessment.notHandoffCompletion, true);
    expect(`not execution ${cc}`, assessment.notHandoffExecution, true);

    const act = await ctx.domain3.declareHandoffPosture({
      entryId: entry.entryId,
      bindingId: binding.bindingId,
      authorityClassId: HGA,
      declaredBy: ACTOR,
    });
    expect(`posture class ${cc}`, act.declaredPostureClass, posture);
    expect(`scope ${cc}`, act.authorityConstitutionalScope, "handoff_posture_declaration_act");
    expect(`HOEM actType ${cc}`, act.hoemPostureDeclarationRecord.actType, "posture_declaration");
    expect(`not auth ${cc}`, act.notHandoffAuthorization, true);
    expect(`not completion ${cc}`, act.notHandoffCompletion, true);
    expect(`not suspension ${cc}`, act.notHandoffSuspension, true);
    expect(`not recall ${cc}`, act.notHandoffRecall, true);
    expect(`not withdrawal ${cc}`, act.notHandoffWithdrawal, true);
    expect(`not acceptance ${cc}`, act.notDownstreamAcceptance, true);
    expect(`not membership ${cc}`, act.notPermanentCollectionMembership, true);
    expect(
      `not mfg/fulfillment ${cc}`,
      act.doesNotAuthorizeManufacturingOrFulfillment,
      true,
    );
    validatePersistedGovernedHandoffPostureDeclaration(act);

    const currency = await ctx.domain3.evaluateHandoffPostureDeclarationCurrency(
      act.postureDeclarationActId,
    );
    expect(`currency current ${cc}`, currency, "current");
  }

  const listed = await ctx.domain3.listGovernedHandoffPostureDeclarationActsByEntry(entry.entryId);
  expect("independent chains CC-01/02/03", listed.length, 3);
  expectTruthy(
    "no unified CC-01/CC-02 posture",
    listed.filter((a) => a.consumerClassId === "CC-01").length === 1 &&
      listed.filter((a) => a.consumerClassId === "CC-02").length === 1,
  );
}

section("Required binding; authorization alone does not create posture; binding alone does not");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });

  await expectThrowsAsync(
    "posture without binding rejected",
    () =>
      ctx.domain3.declareHandoffPosture({
        entryId: entry.entryId,
        bindingId: "governed-handoff-consumer-binding-missing" as never,
        authorityClassId: HGA,
        declaredBy: ACTOR,
      }),
    "invalid_handoff_posture_declaration",
  );

  const auth = await ctx.domain3.authorizeGovernedHandoff({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: "CC-01",
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });
  expect("authorization exists", auth.notHandoffPostureDeclaration, true);
  const posturesAfterAuth = await ctx.domain3.listGovernedHandoffPostureDeclarationActsByEntry(
    entry.entryId,
  );
  expect("authorization alone creates no posture", posturesAfterAuth.length, 0);

  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  const posturesAfterBind = await ctx.domain3.listGovernedHandoffPostureDeclarationActsByEntry(
    entry.entryId,
  );
  expect("binding alone creates no posture", posturesAfterBind.length, 0);
  expect("binding not posture", binding.notHandoffPostureDeclaration, true);

  const posture = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  expect("explicit posture after binding", posture.bindingId, binding.bindingId);
  expect("posture not authorization", posture.notHandoffAuthorization, true);
}

section("Unknown posture class; forged authority; Brain cannot declare");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");

  await expectThrowsAsync(
    "unknown posture class rejected",
    () =>
      ctx.domain3.declareHandoffPosture({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        declaredBy: ACTOR,
        declaredPostureClass: "active",
      }),
    "invalid_handoff_posture_declaration",
  );

  await expectThrowsAsync(
    "wrong affinity for binding rejected",
    () =>
      ctx.domain3.declareHandoffPosture({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        declaredBy: ACTOR,
        declaredPostureClass: "production_catalog_posture",
      }),
    "invalid_handoff_posture_declaration",
  );

  await expectThrowsAsync(
    "MAGAC cannot declare posture",
    () =>
      ctx.domain3.declareHandoffPosture({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: MAGAC,
        declaredBy: ACTOR,
      }),
    "invalid_handoff_posture_declaration",
  );

  await expectThrowsAsync(
    "Brain sourceAttribution cannot declare",
    () =>
      ctx.domain3.declareHandoffPosture({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        declaredBy: ACTOR,
        sourceAttribution: "brain_runtime",
      }),
    "invalid_handoff_posture_declaration",
  );

  await expectThrowsAsync(
    "Brain declaredBy rejected",
    () =>
      ctx.domain3.declareHandoffPosture({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        declaredBy: "brain_runtime",
      }),
    "invalid_handoff_posture_declaration",
  );

  await expectThrowsAsync(
    "completion claim rejected",
    () =>
      ctx.domain3.declareHandoffPosture({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        declaredBy: ACTOR,
        completionActId: "completion-forged",
      }),
    "invalid_handoff_posture_declaration",
  );
}

section("Multiplicity: additive history; latest authoritative; no cross-CC merge");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");

  const first = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
    declaredAt: "2026-08-13T10:00:00.000Z",
  });
  const second = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
    declaredAt: "2026-08-13T11:00:00.000Z",
  });
  const listed = await ctx.domain3.listGovernedHandoffPostureDeclarationActsByBinding(
    binding.bindingId,
  );
  expect("additive history count", listed.length, 2);
  const authoritative = await ctx.domain3.getAuthoritativeHandoffPostureDeclarationForBinding(
    binding.bindingId,
  );
  expect("latest is authoritative", authoritative!.postureDeclarationActId, second.postureDeclarationActId);
  expect(
    "prior remains history",
    listed.some((a) => a.postureDeclarationActId === first.postureDeclarationActId),
    true,
  );
  const firstCurrency = await ctx.domain3.evaluateHandoffPostureDeclarationCurrency(
    first.postureDeclarationActId,
  );
  expect("prior posture stale vs authoritative", firstCurrency, "stale");
  const secondCurrency = await ctx.domain3.evaluateHandoffPostureDeclarationCurrency(
    second.postureDeclarationActId,
  );
  expect("current authoritative currency", secondCurrency, "current");

  await expectThrowsAsync(
    "unified CC-01/CC-02 claim rejected",
    () =>
      ctx.domain3.declareHandoffPosture({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        declaredBy: ACTOR,
        unifiedCc01Cc02Posture: true,
      }),
    "invalid_handoff_posture_declaration",
  );
}

section("Stale upstream: invalidated GPRA cannot support new posture");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-02");

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
    "posture after GPRA invalidation rejected",
    () =>
      ctx.domain3.declareHandoffPosture({
        entryId: entry.entryId,
        bindingId: binding.bindingId,
        authorityClassId: HGA,
        declaredBy: ACTOR,
      }),
    "invalid_handoff_posture_declaration",
  );
}

section("Trusted rehydration rejects forged posture class / foreign binding");

{
  const ctx = await grantPassGpra();
  const { entry } = await admitEntry(ctx);
  const binding = await bindCc(ctx, entry.entryId, "CC-01");
  const act = await ctx.domain3.declareHandoffPosture({
    entryId: entry.entryId,
    bindingId: binding.bindingId,
    authorityClassId: HGA,
    declaredBy: ACTOR,
  });
  const loaded = await ctx.domain3.loadGovernedHandoffPostureDeclarationAct(
    act.postureDeclarationActId,
  );
  expectTruthy("load succeeds", !!loaded);

  expectThrows(
    "forged posture class rejected on validate",
    () =>
      validatePersistedGovernedHandoffPostureDeclaration({
        ...act,
        declaredPostureClass: "active",
        postureClassAffinity: "active",
      }),
    "invalid_handoff_posture_declaration",
  );

  expectThrows(
    "foreign binding on rehydrate rejected",
    () =>
      rehydrateGovernedHandoffPostureDeclaration(
        { ...act, bindingId: "governed-handoff-consumer-binding-foreign" },
        {
          entry,
          binding: { ...binding, bindingId: "governed-handoff-consumer-binding-other" as never },
        },
      ),
    "invalid_handoff_posture_declaration",
  );
}

section("R48 boundary: no lifecycle completion / suspension / recall APIs");

{
  const ctx = await grantPassGpra();
  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("no completeHandoff", typeof repo.completeHandoff, "undefined");
  expect("no suspendHandoff", typeof repo.suspendHandoff, "undefined");
  expect("no recallHandoff", typeof repo.recallHandoff, "undefined");
  expect("no withdrawHandoff", typeof repo.withdrawHandoff, "undefined");
  expect("no acceptDownstreamHandoff", typeof repo.acceptDownstreamHandoff, "undefined");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
