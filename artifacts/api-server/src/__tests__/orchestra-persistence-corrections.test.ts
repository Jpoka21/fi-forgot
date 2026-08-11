/**
 * ORCH-IMP-002.2 adversarial regression tests — bounded persistence corrections.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-persistence-corrections.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createSuccessorProgramId,
  declareProductionIntent,
  determineExplorationEntry,
  draftProductionProgram,
  evaluateDomain2Readiness,
  governProductionProgram,
  grantWaiver,
  invalidateProductionProgram,
  isOrchestraConstitutionalError,
  supersedeProductionProgram,
} from "../orchestra/index.js";
import { createProductionObligation } from "../orchestra/production-obligation.js";
import { executeGovernedProgramSplit } from "../orchestra/program-split.js";

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
    console.log(`      expected: ${JSON.stringify(expected)}`);
    console.log(`      received: ${JSON.stringify(actual)}`);
  }
}

function expectThrows(label: string, fn: () => unknown, code?: string): void {
  try {
    fn();
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label} (expected throw)`);
  } catch (error) {
    if (code && isOrchestraConstitutionalError(error)) {
      if (error.code === code) {
        passed++;
        console.log(`  ✓ ${label}`);
      } else {
        failed++;
        failures.push(label);
        console.log(`  ✗ ${label} (wrong code: ${error.code})`);
      }
    } else if (!code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (not OrchestraConstitutionalError)`);
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
    if (code && isOrchestraConstitutionalError(error)) {
      if (error.code === code) {
        passed++;
        console.log(`  ✓ ${label}`);
      } else {
        failed++;
        failures.push(label);
        console.log(`  ✗ ${label} (wrong code: ${error.code})`);
      }
    } else if (!code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (not OrchestraConstitutionalError)`);
    }
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

function buildGovernedProgram() {
  const intent = declareProductionIntent({
    purpose: "Bounded correction test intent",
    governingConstraints: ["FI-DSN-STD-001"],
    declaredBy: "governance-authority-1",
  });
  const boundary = bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Brand expression limits",
    boundBy: "governance-authority-1",
  });
  let program = draftProductionProgram({
    intent,
    constitutionalPurpose: "Bounded correction scope",
    createdBy: "governance-authority-1",
  });
  program = addObligationToProgram(program, {
    description: "Governed obligation",
    createdBy: "governance-authority-1",
  });
  program = bindComplianceBoundariesToProgram(program, [boundary]);
  program = governProductionProgram(program);
  return { intent, program };
}

section("BC-ORCH-007 — parent intent existence");

const repo1 = createDomain1Repository();
const { intent: orphanIntent, program: orphanProgram } = buildGovernedProgram();
await expectThrowsAsync(
  "program without persisted parent intent rejected",
  () => repo1.persistProgram(orphanProgram),
  "invalid_program_structure",
);
await repo1.persistIntent(orphanIntent);
const persisted = await repo1.persistProgram(orphanProgram);
expect("program with persisted parent intent accepted", persisted.id, orphanProgram.id);

section("BC-ORCH-007 — split parent intent enforcement");

const repo2 = createDomain1Repository();
const { intent: splitIntent, program: splitSource } = buildGovernedProgram();
await expectThrowsAsync(
  "split without persisted intent rejected",
  () =>
    repo2.executeProgramSplit({
      intent: splitIntent,
      sourceProgram: splitSource,
      branches: [
        {
          constitutionalPurpose: "Branch scope",
          obligationDescriptions: ["Branch obligation"],
        },
      ],
      scopeSeparationReason: "Scope separation required",
      splitAuthority: "domain-1-governance-authority",
      splitBy: "governance-authority-1",
    }),
  "invalid_program_split",
);
await repo2.persistIntent(splitIntent);
await repo2.persistProgram(splitSource);
const splitResult = await repo2.executeProgramSplit({
  intent: splitIntent,
  sourceProgram: splitSource,
  branches: [
    {
      constitutionalPurpose: "Branch scope",
      obligationDescriptions: ["Branch obligation"],
    },
  ],
  scopeSeparationReason: "Scope separation required",
  splitAuthority: "domain-1-governance-authority",
  splitBy: "governance-authority-1",
});
expect("governed split preserves parent-intent enforcement", splitResult.resultingPrograms.length, 1);

section("BC-ORCH-008 — superseded exploration determination");

const { intent: expIntent, program: expProgram } = buildGovernedProgram();
const exploration = determineExplorationEntry({
  program: expProgram,
  posture: "exploration_entry_authorized",
  governingBasis: "Prerequisites satisfied",
  determinedBy: "governance-authority-1",
});
expectThrows(
  "superseded exploration determination rejected directly",
  () =>
    evaluateDomain2Readiness({
      program: expProgram,
      explorationEntry: exploration,
      explorationEntryStatus: "superseded",
      isConstitutionallyCurrent: true,
    }),
  "invalid_exploration_entry",
);
const activeReadiness = evaluateDomain2Readiness({
  program: expProgram,
  explorationEntry: exploration,
  explorationEntryStatus: "active",
  isConstitutionallyCurrent: true,
});
expect("active determination accepted when otherwise valid", activeReadiness?.isReadyForDomain2Integration, true);

section("BC-ORCH-009 — mandatory constitutional currentness");

const omittedReadiness = evaluateDomain2Readiness({
  program: expProgram,
  explorationEntry: exploration,
  explorationEntryStatus: "active",
  isConstitutionallyCurrent: undefined as unknown as boolean,
});
expect("omitted currentness cannot authorize", omittedReadiness, null);

const falseReadiness = evaluateDomain2Readiness({
  program: expProgram,
  explorationEntry: exploration,
  explorationEntryStatus: "active",
  isConstitutionallyCurrent: false,
});
expect("false currentness cannot authorize", falseReadiness, null);

section("BC-ORCH-013 — waiver context linkage");

const repo3 = createDomain1Repository();
const { intent: wIntent, program: wProgram } = buildGovernedProgram();
await repo3.persistIntent(wIntent);
const siblingProgram = draftProductionProgram({
  intent: wIntent,
  constitutionalPurpose: "Sibling scope",
  createdBy: "governance-authority-1",
});
const targetObligation = createProductionObligation({
  programId: wProgram.id,
  description: "Target waived obligation",
  createdBy: "governance-authority-1",
});
const wrongTargetWaiver = grantWaiver({
  waiverAuthority: "domain_1_governance_authority",
  scope: "Wrong target",
  affectedTarget: siblingProgram.id,
  constitutionalBasis: "FI-DSN-STD-012-R31",
  applicabilityPosture: "conditional",
  downstreamEligibilityEffect: "permitted",
  grantedBy: "governance-authority-1",
});
await repo3.persistWaiver(wrongTargetWaiver);
const wrongTargetProgram = Object.freeze({
  ...wProgram,
  obligations: Object.freeze([
    ...wProgram.obligations,
    Object.freeze({
      ...targetObligation,
      enforcementPosture: "waived" as const,
      waiverRecordId: wrongTargetWaiver.waiverId,
    }),
  ]),
});
await expectThrowsAsync(
  "waiver for sibling program rejected",
  () => repo3.persistProgram(wrongTargetProgram),
  "invalid_waiver",
);

const correctWaiver = grantWaiver({
  waiverAuthority: "domain_1_governance_authority",
  scope: "Correct target",
  affectedTarget: targetObligation.id,
  constitutionalBasis: "FI-DSN-STD-012-R31",
  applicabilityPosture: "conditional",
  downstreamEligibilityEffect: "permitted",
  grantedBy: "governance-authority-1",
});
await repo3.persistWaiver(correctWaiver);
const correctProgram = Object.freeze({
  ...wProgram,
  obligations: Object.freeze([
    ...wProgram.obligations,
    Object.freeze({
      ...targetObligation,
      enforcementPosture: "waived" as const,
      waiverRecordId: correctWaiver.waiverId,
    }),
  ]),
});
const savedCorrect = await repo3.persistProgram(correctProgram);
expect(
  "correctly targeted waiver accepted",
  savedCorrect.obligations.some((o) => o.waiverRecordId === correctWaiver.waiverId),
  true,
);

section("BC-ORCH-014 — forged governance-authority waiver");

const repo4 = createDomain1Repository();
const forgedWaiver = {
  ...correctWaiver,
  waiverId: "waiver-00000000-0000-4000-8000-000000000088",
  governanceGrantMarker: undefined,
};
await expectThrowsAsync(
  "forged waiver without grant marker rejected",
  () => repo4.persistWaiver(forgedWaiver as unknown as typeof correctWaiver),
  "invalid_waiver",
);

section("P3 — terminal split source rejection");

const { intent: termIntent, program: termProgram } = buildGovernedProgram();
const terminal = invalidateProductionProgram(termProgram, {
  reason: "Terminal for split test",
  invalidatedBy: "governance-authority-1",
});
expectThrows(
  "split from terminal source rejected",
  () =>
    executeGovernedProgramSplit({
      intent: termIntent,
      sourceProgram: terminal,
      branches: [
        {
          constitutionalPurpose: "Branch",
          obligationDescriptions: ["Obligation"],
        },
      ],
      scopeSeparationReason: "Test",
      splitAuthority: "authority",
      splitBy: "actor",
    }),
  "program_not_active",
);

section("P3 — sibling supersession independence");

const repo5 = createDomain1Repository();
const { intent: sibIntent, program: sibSource } = buildGovernedProgram();
await repo5.persistIntent(sibIntent);
await repo5.persistProgram(sibSource);
const sibSplit = await repo5.executeProgramSplit({
  intent: sibIntent,
  sourceProgram: sibSource,
  branches: [
    {
      constitutionalPurpose: "Sibling branch",
      obligationDescriptions: ["Sibling obligation"],
    },
  ],
  scopeSeparationReason: "Sibling scope separation",
  splitAuthority: "domain-1-governance-authority",
  splitBy: "governance-authority-1",
});
const sibling = sibSplit.resultingPrograms[0]!;
const supersededSibling = supersedeProductionProgram(sibling, createSuccessorProgramId(), {
  supersededBy: "governance-authority-1",
});
await repo5.persistProgram(supersededSibling);
const sourceStillCurrent = await repo5.isConstitutionallyCurrent(sibSource);
expect("superseding sibling does not terminate source", sourceStillCurrent, true);

section("P3 — material amendment after split");

const repo6 = createDomain1Repository();
const { intent: matIntent, program: matSource } = buildGovernedProgram();
await repo6.persistIntent(matIntent);
await repo6.persistProgram(matSource);
const matSplit = await repo6.executeProgramSplit({
  intent: matIntent,
  sourceProgram: matSource,
  branches: [
    {
      constitutionalPurpose: "Amendment branch",
      obligationDescriptions: ["Branch obligation"],
    },
  ],
  scopeSeparationReason: "Scope separation",
  splitAuthority: "domain-1-governance-authority",
  splitBy: "governance-authority-1",
});
const branch = matSplit.resultingPrograms[0]!;
const branchExploration = determineExplorationEntry({
  program: branch,
  posture: "exploration_entry_authorized",
  governingBasis: "Prerequisites satisfied",
  determinedBy: "governance-authority-1",
});
await repo6.persistExplorationDetermination(branchExploration);
await repo6.recordAmendmentWithConsequences(branch, {
  materiality: "material",
  reason: "Material change after split",
  amendedBy: "governance-authority-1",
});
const stale = await repo6.loadExplorationDetermination(branch.id);
expect("material amendment after split supersedes exploration", stale?.status, "superseded");

console.log(`\n${"=".repeat(60)}`);
console.log(`ORCH-IMP-002.2 correction tests: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) {
    console.log(`  - ${f}`);
  }
  process.exit(1);
}
