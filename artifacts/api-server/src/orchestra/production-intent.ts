import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type {
  ConstitutionalAuditMetadata,
  ProductionIntentId,
  ProductionIntentPosture,
} from "./types.js";

const INTENT_REQUIREMENTS = [
  "FI-DSN-STD-012-R07",
  "FI-DSN-STD-012-R08",
  "FI-DSN-STD-012-R09",
  "FI-DSN-STD-012-R10",
] as const;

/** Governed record of an Intent Change — R10, R34. */
export interface IntentChangeRecord {
  readonly changeId: string;
  readonly priorIntentId: ProductionIntentId;
  readonly newIntentId: ProductionIntentId;
  readonly reason: string;
  readonly changedAt: string;
  readonly changedBy: string;
}

/**
 * Declared Production Intent — explicit, bounded, attributable Decision-stage statement.
 * FI-DSN-STD-012-R07 through R10.
 */
export interface DeclaredProductionIntent {
  readonly id: ProductionIntentId;
  readonly posture: ProductionIntentPosture;
  readonly purpose: string;
  readonly governingConstraints: readonly string[];
  readonly upstreamTraceReferences: readonly string[];
  readonly audit: ConstitutionalAuditMetadata;
  readonly intentChangeHistory: readonly IntentChangeRecord[];
}

export function createProductionIntentId(): ProductionIntentId {
  return `intent-${randomUUID()}` as ProductionIntentId;
}

export function declareProductionIntent(input: {
  purpose: string;
  governingConstraints?: readonly string[];
  upstreamTraceReferences?: readonly string[];
  declaredBy: string;
  declaredAt?: string;
}): DeclaredProductionIntent {
  const purpose = input.purpose.trim();
  if (!purpose) {
    throw new OrchestraConstitutionalError(
      "Declared Production Intent requires an explicit purpose",
      "invalid_intent_declaration",
      ["FI-DSN-STD-012-R07", "FI-DSN-STD-012-R08"],
    );
  }

  const governingConstraints = Object.freeze(
    (input.governingConstraints ?? []).map((c) => c.trim()).filter(Boolean),
  );

  if (governingConstraints.length === 0) {
    throw new OrchestraConstitutionalError(
      "Declared Production Intent must be bounded by governing constraints",
      "invalid_intent_declaration",
      ["FI-DSN-STD-012-R07", "FI-DSN-STD-012-R08"],
    );
  }

  const now = input.declaredAt ?? new Date().toISOString();

  return Object.freeze({
    id: createProductionIntentId(),
    posture: "intent_declared",
    purpose,
    governingConstraints,
    upstreamTraceReferences: Object.freeze(
      [...(input.upstreamTraceReferences ?? [])],
    ),
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.declaredBy,
      traceability: createGovernanceTraceability([...INTENT_REQUIREMENTS]),
    }),
    intentChangeHistory: Object.freeze([]),
  });
}

/**
 * Governed Intent Change — R10.
 * Prior intent is preserved; new intent is created rather than silently substituted.
 */
export function recordIntentChange(
  priorIntent: DeclaredProductionIntent,
  input: {
    purpose: string;
    governingConstraints?: readonly string[];
    upstreamTraceReferences?: readonly string[];
    reason: string;
    changedBy: string;
    changedAt?: string;
  },
): { priorIntent: DeclaredProductionIntent; newIntent: DeclaredProductionIntent } {
  if (priorIntent.posture !== "intent_declared") {
    throw new OrchestraConstitutionalError(
      "Intent Change requires a prior Declared Production Intent",
      "invalid_intent_change",
      ["FI-DSN-STD-012-R10"],
    );
  }

  const reason = input.reason.trim();
  if (!reason) {
    throw new OrchestraConstitutionalError(
      "Intent Change must be attributable with a recorded reason",
      "invalid_intent_change",
      ["FI-DSN-STD-012-R10", "FI-DSN-STD-012-R37"],
    );
  }

  const newIntent = declareProductionIntent({
    purpose: input.purpose,
    governingConstraints: input.governingConstraints ?? priorIntent.governingConstraints,
    upstreamTraceReferences:
      input.upstreamTraceReferences ?? priorIntent.upstreamTraceReferences,
    declaredBy: input.changedBy,
    declaredAt: input.changedAt,
  });

  const changedAt = input.changedAt ?? new Date().toISOString();
  const changeRecord: IntentChangeRecord = Object.freeze({
    changeId: `intent-change-${randomUUID()}`,
    priorIntentId: priorIntent.id,
    newIntentId: newIntent.id,
    reason,
    changedAt,
    changedBy: input.changedBy,
  });

  const updatedPrior: DeclaredProductionIntent = Object.freeze({
    ...priorIntent,
    intentChangeHistory: Object.freeze([...priorIntent.intentChangeHistory, changeRecord]),
  });

  return { priorIntent: updatedPrior, newIntent };
}

export const PRODUCTION_INTENT_TRACEABILITY = createGovernanceTraceability([
  ...INTENT_REQUIREMENTS,
]);
