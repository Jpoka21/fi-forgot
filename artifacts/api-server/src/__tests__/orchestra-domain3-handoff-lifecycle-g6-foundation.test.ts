/**
 * ORCH-IMP-026 — STD-015 HOF-G6-U1 Shared Lifecycle Foundation (R70–R83).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-lifecycle-g6-foundation.test.ts
 */

import {
  assertBrainCannotPerformG6LifecycleAct,
  assertG6ActDistinctFromHslmState,
  assertG6ActDoesNotAuthorizeReentryOrResumption,
  assertG6ActIsNotAutomaticRetryOrRecovery,
  assertG6AdditivePreservationNoRewrite,
  assertG6DoesNotAbsorbPeerAuthority,
  assertG6HoemExpectationSeparatePerActType,
  assertG6LifecycleActPerformanceDeferred,
  assertG6LifecycleActSubjectScope,
  assertG6LifecycleActsRemainPeerDistinct,
  assertG6LifecycleMatrixActType,
  assertHgaMatrixActMayBePerformed,
  assertHgaSolePerformerForG6LifecycleAct,
  assertNoInventedRejectionOrExitG6Act,
  assertR84PlusUnavailable,
  assessG6LifecycleActSubjectScope,
  assessG6SharedPreconditions,
  assessHandoffAuthorityCatalogIntegration,
  assessHofG6U1SharedLifecycleFoundation,
  catalogMembershipDoesNotAuthorizeG6Performance,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES,
  G6_ACT_TO_HSLM_DENOTATION,
  G6_FORBIDDEN_GENERIC_FACTORY_NAMES,
  G6_FORBIDDEN_MINT_API_NAMES,
  G6_LIFECYCLE_MATRIX_ACT_TYPES,
  G6_SHARED_EFFECT_FRAMING_BY_ACT,
  getHgaMatrixActOperativeStatus,
  HGA_MATRIX_ACT_TYPES,
  isOrchestraConstitutionalError,
  refuseGenericHgaLifecycleFactory,
  refuseG6RestorationResumptionReentry,
  refuseRecallGovernedHandoff,
  refuseWithdrawGovernedHandoff,
  rejectForgedOrPrematureG6LifecycleActRehydration,
  resolveG6SharedEffectFraming,
  type Domain3Repository,
} from "../orchestra/index.js";

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
  } catch (err) {
    if (code && isOrchestraConstitutionalError(err) && err.code !== code) {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (wrong code ${err.code})`);
      return;
    }
    passed++;
    console.log(`  ✓ ${label}`);
  }
}

function section(title: string): void {
  console.log(`\n${title}`);
}

section("1. Foundation integrity assessment");

{
  const a = assessHofG6U1SharedLifecycleFoundation();
  expect("integrityOk", a.integrityOk, true);
  expect("act type count", a.g6LifecycleActTypeCount, 3);
  expect("peer distinct", a.peerDistinctActsPreserved, true);
  expect("no generic", a.noGenericLifecycleAction, true);
  expect("HGA sole", a.hgaSolePerformerForG6Acts, true);
  expect("act≠HSLM", a.actPerformanceDistinctFromHslmState, true);
  expect("shared preconditions", a.sharedPreconditionCategoriesDefined, true);
  expect("triggers deferred", a.actSpecificTriggersDeferred, true);
  expect("framings defined", a.sharedEffectFramingsDefined, true);
  expect("effects deferred", a.actSpecificEffectMechanicsDeferred, true);
  expect("HOEM model", a.additiveHoemModelPerActType, true);
  expect("no rewrite", a.noHistoricalRewrite, true);
  expect("no absorption", a.noPeerAuthorityAbsorption, true);
  expect("no reentry", a.noImpliedReentryOrResumption, true);
  expect("no retry", a.noAutomaticRetryOrRecovery, true);
  expect("withdraw/recall mint APIs absent", a.withdrawRecallMintApisAbsent, false);
  expect("recall mint APIs absent", a.recallMintApisAbsent, true);
  expect("factory absent", a.performHgaActFactoryAbsent, true);
  expect("no rejection", a.rejectionActAbsent, true);
  expect("no exit matrix", a.exitHgaMatrixActAbsent, true);
  expect("hslm 8", a.hslmEightStatesPreserved, true);
  expect("restoration deferred", a.restorationResumptionReentryDeferred, true);
  expect("R84+ unavailable", a.r84PlusUnavailable, false);
  expect("R98+ unavailable", a.r98PlusUnavailable, false);
  expect("R112+ unavailable", a.r112PlusUnavailable, true);
  expect("suspension mechanics operative", a.suspensionMechanicsOperative, true);
  expect("withdrawal mechanics operative", a.withdrawalMechanicsOperative, true);
  expect("R70–R83", a.r70ThroughR83, true);
}

section("2. Peer-distinct act types and effect framings (R70/R71/R76)");

{
  expect("types", [...G6_LIFECYCLE_MATRIX_ACT_TYPES], [
    "suspension",
    "withdrawal",
    "recall",
  ]);
  expect(
    "suspension framing",
    resolveG6SharedEffectFraming("suspension"),
    "temporary_forward_reliance_pause",
  );
  expect(
    "withdrawal framing",
    resolveG6SharedEffectFraming("withdrawal"),
    "hga_initiated_retraction",
  );
  expect(
    "recall framing",
    resolveG6SharedEffectFraming("recall"),
    "responsive_forward_reliance_termination",
  );
  expect(
    "framings distinct",
    new Set(Object.values(G6_SHARED_EFFECT_FRAMING_BY_ACT)).size,
    3,
  );
  expectThrows("collapse denied", () =>
    assertG6LifecycleActsRemainPeerDistinct({
      actType: "suspension",
      collapsedActTypes: true,
    }),
  );
  expectThrows("generic action denied", () =>
    assertG6LifecycleActsRemainPeerDistinct({ genericLifecycleAction: true }),
  );
  expectThrows("combined record denied", () =>
    assertG6LifecycleActsRemainPeerDistinct({
      combinedOperativeRecordClass: true,
    }),
  );
  expectThrows("generic factory", () => refuseGenericHgaLifecycleFactory("performHgaAct"));
  expectTruthy("forbidden factory names listed", G6_FORBIDDEN_GENERIC_FACTORY_NAMES.length >= 3);
}

section("3. HGA sole performer; wrong authority; Brain (R70)");

{
  assertHgaSolePerformerForG6LifecycleAct({
    authorityClassId: "handoff_governance_authority",
    actType: "suspension",
  });
  passed++;
  console.log("  ✓ HGA ok for suspension");

  expectThrows("wrong authority class", () =>
    assertHgaSolePerformerForG6LifecycleAct({
      authorityClassId: "magac_approval_authority",
      actType: "withdrawal",
    }),
  );
  expectThrows("brain performer with HGA still denied", () =>
    assertHgaSolePerformerForG6LifecycleAct({
      authorityClassId: "handoff_governance_authority",
      performerClass: "brain_domain3",
      actType: "recall",
    }),
  );
  expectThrows("performerClass alone insufficient", () =>
    assertHgaSolePerformerForG6LifecycleAct({
      performerClass: "workflow_operator",
      actType: "suspension",
    }),
  );
  expectThrows("Brain cannot perform", () => assertBrainCannotPerformG6LifecycleAct());
  expectThrows("missing attribution", () => assertHgaSolePerformerForG6LifecycleAct({}));
}

section("4. Subject scope — one binding; no cross-context (R72/R73)");

{
  const ok = assessG6LifecycleActSubjectScope({
    actType: "suspension",
    bindingId: "binding-1",
  });
  expect("scope ok", ok.scopeOk, true);

  const multi = assessG6LifecycleActSubjectScope({
    actType: "withdrawal",
    bindingId: "binding-1",
    spansMultipleBindings: true,
  });
  expect("multi denied", multi.scopeOk, false);
  expectTruthy("multi reason", multi.denialReasons.includes("multi_binding_span_denied"));

  expectThrows("silent propagation", () =>
    assertG6LifecycleActSubjectScope({
      actType: "recall",
      bindingId: "b1",
      silentCrossContextPropagation: true,
    }),
  );
  expectThrows("foreign binding", () =>
    assertG6LifecycleActSubjectScope({
      actType: "recall",
      bindingId: "b1",
      foreignBinding: true,
    }),
  );
  expectThrows("missing binding", () =>
    assertG6LifecycleActSubjectScope({ actType: "suspension" }),
  );
}

section("5. Act ≠ HSLM state (R74)");

{
  assertG6ActDistinctFromHslmState({
    actType: "suspension",
    hslmState: "suspended",
  });
  passed++;
  console.log("  ✓ distinct ok");
  expect("hslm map suspension", G6_ACT_TO_HSLM_DENOTATION.suspension, "suspended");
  expect("hslm map withdrawal", G6_ACT_TO_HSLM_DENOTATION.withdrawal, "withdrawn");
  expect("hslm map recall", G6_ACT_TO_HSLM_DENOTATION.recall, "recalled");
  expectThrows("state as act", () =>
    assertG6ActDistinctFromHslmState({ treatStateAsAct: true }),
  );
  expectThrows("auto promotion", () =>
    assertG6ActDistinctFromHslmState({ automaticStatePromotionFromAct: true }),
  );
  expect("hslm still 8", FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES.length, 8);
}

section("6. Shared preconditions; triggers deferred (R75)");

{
  const good = assessG6SharedPreconditions({
    actType: "suspension",
    bindingId: "b1",
    hasPriorAuthorization: true,
    hasPriorPosture: true,
    hasLifecycleOperativeHistory: true,
    hccmBoundContextEstablished: true,
    authorityClassId: "handoff_governance_authority",
    traceableConstitutionalBasis: true,
    priorRecordsPreservedReconstructable: true,
  });
  expect("shared satisfied", good.sharedCategoriesSatisfied, true);
  expect("does not authorize mint", good.doesNotAuthorizeActMint, true);
  expect("triggers deferred flag", good.actSpecificTriggersDeferredToU2U3U4, true);

  const badBasis = assessG6SharedPreconditions({
    actType: "withdrawal",
    bindingId: "b1",
    hasPriorAuthorization: true,
    hasPriorPosture: true,
    hasLifecycleOperativeHistory: true,
    hccmBoundContextEstablished: true,
    authorityClassId: "handoff_governance_authority",
    traceableConstitutionalBasis: true,
    advisoryEvidenceAlone: true,
  });
  expect("advisory alone fails", badBasis.sharedCategoriesSatisfied, false);

  const staleTarget = assessG6SharedPreconditions({
    actType: "recall",
    bindingId: "b1",
    hasPriorAuthorization: false,
    hasPriorPosture: true,
    hasLifecycleOperativeHistory: true,
    hccmBoundContextEstablished: true,
    authorityClassId: "handoff_governance_authority",
    traceableConstitutionalBasis: true,
  });
  expect("incomplete target fails", staleTarget.sharedCategoriesSatisfied, false);

  const barePerformerClaim = assessG6SharedPreconditions({
    actType: "suspension",
    bindingId: "b1",
    hasPriorAuthorization: true,
    hasPriorPosture: true,
    hasLifecycleOperativeHistory: true,
    hccmBoundContextEstablished: true,
    hgaPerformerAttributable: true,
    traceableConstitutionalBasis: true,
    priorRecordsPreservedReconstructable: true,
  });
  expect(
    "bare hgaPerformerAttributable fails without HGA class",
    barePerformerClaim.sharedCategoriesSatisfied,
    false,
  );
  expectTruthy(
    "bare claim denies c",
    barePerformerClaim.denialReasons.includes(
      "authorized_hga_performer_not_attributable",
    ),
  );

  const nonProhibitedPerformerOnly = assessG6SharedPreconditions({
    actType: "withdrawal",
    bindingId: "b1",
    hasPriorAuthorization: true,
    hasPriorPosture: true,
    hasLifecycleOperativeHistory: true,
    hccmBoundContextEstablished: true,
    performerClass: "workflow_operator",
    traceableConstitutionalBasis: true,
    priorRecordsPreservedReconstructable: true,
  });
  expect(
    "non-prohibited performerClass alone fails",
    nonProhibitedPerformerOnly.sharedCategoriesSatisfied,
    false,
  );
}

section("7. Additive preservation / HOEM / absorption / reentry / retry (R77–R83)");

{
  assertG6AdditivePreservationNoRewrite();
  passed++;
  console.log("  ✓ additive ok");
  expectThrows("rewrite", () =>
    assertG6AdditivePreservationNoRewrite({ rewriteAttempt: true }),
  );
  expectThrows("erase", () =>
    assertG6AdditivePreservationNoRewrite({ erasePriorHistory: true }),
  );

  assertG6HoemExpectationSeparatePerActType({ actType: "suspension" });
  passed++;
  console.log("  ✓ HOEM separate ok");
  expectThrows("merged HOEM", () =>
    assertG6HoemExpectationSeparatePerActType({
      actType: "withdrawal",
      mergedWithCompletion: true,
    }),
  );

  assertG6DoesNotAbsorbPeerAuthority();
  passed++;
  console.log("  ✓ no absorption ok");
  expectThrows("absorb HGA", () =>
    assertG6DoesNotAbsorbPeerAuthority({ establishHga: true }),
  );
  expectThrows("absorb binding", () =>
    assertG6DoesNotAbsorbPeerAuthority({ createHccmBinding: true }),
  );

  assertG6ActDoesNotAuthorizeReentryOrResumption();
  passed++;
  console.log("  ✓ no reentry ok");
  expectThrows("authorize reentry", () =>
    assertG6ActDoesNotAuthorizeReentryOrResumption({ authorizeReentry: true }),
  );
  expectThrows("restore eligibility", () =>
    assertG6ActDoesNotAuthorizeReentryOrResumption({ restoreEligibility: true }),
  );

  assertG6ActIsNotAutomaticRetryOrRecovery();
  passed++;
  console.log("  ✓ no retry ok");
  expectThrows("auto retry", () =>
    assertG6ActIsNotAutomaticRetryOrRecovery({ automaticRetry: true }),
  );
  expectThrows("auto restore", () =>
    assertG6ActIsNotAutomaticRetryOrRecovery({ autoRestore: true }),
  );
  expectThrows("restoration API", () => refuseG6RestorationResumptionReentry("resumeHandoff"));
}

section("8. Deferred mint APIs; catalog gate; no generic factory (R69/R70–R83)");

{
  expect("suspension catalog operative", getHgaMatrixActOperativeStatus("suspension"), "operative");
  expectTruthy(
    "suspension catalog≠authority",
    catalogMembershipDoesNotAuthorizeG6Performance("suspension"),
  );
  try {
    assertHgaMatrixActMayBePerformed("suspension");
    passed++;
    console.log("  ✓ suspension assertMayBePerformed");
  } catch {
    failed++;
    failures.push("suspension assertMayBePerformed");
    console.log("  ✗ suspension assertMayBePerformed");
  }
  try {
    assertHgaMatrixActMayBePerformed("withdrawal");
    passed++;
    console.log("  ✓ withdrawal assertMayBePerformed");
  } catch {
    failed++;
    failures.push("withdrawal assertMayBePerformed");
    console.log("  ✗ withdrawal assertMayBePerformed");
  }
  expect("withdrawal catalog operative", getHgaMatrixActOperativeStatus("withdrawal"), "operative");
  expectTruthy(
    "withdrawal catalog≠authority",
    catalogMembershipDoesNotAuthorizeG6Performance("withdrawal"),
  );
  expectThrows("withdrawal performance deferred assert", () =>
    assertG6LifecycleActPerformanceDeferred("withdrawal"),
  );
  for (const t of ["recall"] as const) {
    expect(`${t} catalog deferred`, getHgaMatrixActOperativeStatus(t), "cataloged_deferred");
    expectTruthy(
      `${t} catalog≠authority`,
      catalogMembershipDoesNotAuthorizeG6Performance(t),
    );
    expectThrows(`${t} assertMayBePerformed`, () => assertHgaMatrixActMayBePerformed(t));
    expectThrows(`${t} performance deferred`, () =>
      assertG6LifecycleActPerformanceDeferred(t),
    );
  }
  expectThrows("refuse withdraw points to mint path", () => refuseWithdrawGovernedHandoff());
  expectThrows("refuse recall", () => refuseRecallGovernedHandoff());
  expectTruthy("mint API names listed", G6_FORBIDDEN_MINT_API_NAMES.includes("suspendHandoff"));
}

section("9. Invented rejection / exit; R112+ unavailable");

{
  expectThrows("rejection act", () =>
    assertNoInventedRejectionOrExitG6Act("handoff_lifecycle_rejection_act"),
  );
  expectThrows("exit act", () => assertNoInventedRejectionOrExitG6Act("exit_boundary"));
  expectThrows("R112 claim", () => assertR84PlusUnavailable("r112"));
  expectThrows("recall claim", () => assertR84PlusUnavailable("recall_operative_mechanics"));
  assertG6LifecycleMatrixActType("suspension");
  passed++;
  console.log("  ✓ matrix act type assert ok");
  expectThrows("invented type", () => assertG6LifecycleMatrixActType("paused"));
}

section("10. Forged / premature rehydration fail-closed");

{
  rejectForgedOrPrematureG6LifecycleActRehydration({
    purportedActType: "suspension",
  });
  passed++;
  console.log("  ✓ valid purported suspension is not blanket-rejected");
  rejectForgedOrPrematureG6LifecycleActRehydration({
    purportedActType: "withdrawal",
  });
  passed++;
  console.log("  ✓ valid purported withdrawal is not blanket-rejected");
  expectThrows("purported HOEM recall", () =>
    rejectForgedOrPrematureG6LifecycleActRehydration({
      purportedHoemActType: "recall",
    }),
  );
  expectThrows("forged suspension binding", () =>
    rejectForgedOrPrematureG6LifecycleActRehydration({
      purportedActType: "suspension",
      forgedBinding: true,
    }),
  );
  expectThrows("HSLM as act", () =>
    rejectForgedOrPrematureG6LifecycleActRehydration({
      purportedHslmStateAsAct: true,
    }),
  );
  expectThrows("forged binding", () =>
    rejectForgedOrPrematureG6LifecycleActRehydration({
      forgedBinding: true,
    }),
  );
  expectThrows("restoration field", () =>
    rejectForgedOrPrematureG6LifecycleActRehydration({
      restorationFieldPresent: true,
    }),
  );
  expectThrows("empty forged surface", () =>
    rejectForgedOrPrematureG6LifecycleActRehydration({}),
  );
}

section("11. Catalog regression + public API bypass");

{
  const catalog = assessHandoffAuthorityCatalogIntegration();
  expect("catalog integrity", catalog.integrityOk, true);
  expect("matrix 6", catalog.matrixActTypeCount, 6);
  expect("operative 5", catalog.operativeMatrixActTypes.length, 5);
  expect("deferred 1", catalog.catalogedDeferredMatrixActTypes.length, 1);
  expect("U1 established", catalog.hofG6U1SharedFoundationEstablished, true);
  expect(
    "U3–U4 deferred flag false",
    catalog.hofG6ActSpecificMechanicsDeferredToU3U4,
    false,
  );
  expect("U4 recall deferred", catalog.hofG6RecallMechanicsDeferredToU4, true);
  expect("withdraw/recall mint APIs flag", catalog.withdrawRecallApisNotProvided, false);
  expect("withdraw may be provided", catalog.withdrawGovernedHandoffMayBeProvided, true);
  expect("recall APIs not provided", catalog.recallApisNotProvided, true);
  expect("matrix types frozen", [...HGA_MATRIX_ACT_TYPES], [
    "authorization",
    "posture_declaration",
    "completion",
    "suspension",
    "withdrawal",
    "recall",
  ]);

  const domain1 = createDomain1Repository();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2, undefined, domain1) as Domain3Repository;
  const repo = domain3 as unknown as Record<string, unknown>;
  expect("no suspendHandoff", typeof repo.suspendHandoff, "undefined");
  expect("suspendGovernedHandoff present", typeof repo.suspendGovernedHandoff, "function");
  expect("no withdrawHandoff", typeof repo.withdrawHandoff, "undefined");
  expect("withdrawGovernedHandoff present", typeof repo.withdrawGovernedHandoff, "function");
  expect("no recallHandoff", typeof repo.recallHandoff, "undefined");
  expect("no performHgaAct", typeof repo.performHgaAct, "undefined");
  expect("no restoreHandoff", typeof repo.restoreHandoff, "undefined");
  expect("no resumeHandoff", typeof repo.resumeHandoff, "undefined");
  expect("no reenterHandoff", typeof repo.reenterHandoff, "undefined");
  expectTruthy(
    "assess foundation on repo",
    typeof domain3.assessHofG6U1SharedLifecycleFoundation === "function",
  );
  const fromRepo = await domain3.assessHofG6U1SharedLifecycleFoundation();
  expect("repo foundation integrity", fromRepo.integrityOk, true);

  const mod = await import("../orchestra/index.js");
  expect("foundation exported", "assessHofG6U1SharedLifecycleFoundation" in mod, true);
  expect("refuseSuspend exported", "refuseSuspendGovernedHandoff" in mod, true);
  expect("performHgaAct absent", "performHgaAct" in mod, false);
  expect("suspendHandoff absent", "suspendHandoff" in mod, false);
  expect("withdrawHandoff absent", "withdrawHandoff" in mod, false);
  expect("recallHandoff absent", "recallHandoff" in mod, false);
  expect("rejectHandoffActLayer absent", "rejectHandoffActLayer" in mod, false);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
