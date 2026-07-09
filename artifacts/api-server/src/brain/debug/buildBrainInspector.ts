/**
 * Brain Inspector builder — development-only viewer.
 *
 * Consumes already-produced orchestrator output. Does not invoke contributors,
 * normalize signals, or build decision context.
 */

import type { ActionPlan } from "../action/actionPlanTypes";
import type { DecisionContext } from "../decision/decisionContextTypes";
import type { DecideResult } from "../decision/decide";
import type { RuleEvaluationSummary } from "../decision/rules/ruleEvaluationTypes";
import type { NormalizedRelationshipState } from "../normalization";
import type { SignalExtractionResult } from "../signals/extractionTypes";
import type { RelationshipContextLoadResult } from "../types";
import type { SelectedFollowUpQuestion } from "../questions/selectedFollowUpQuestionTypes";
import type { BrainInspector } from "./inspectorTypes";

export interface BrainInspectorInput {
  loadResult: RelationshipContextLoadResult;
  extraction: SignalExtractionResult;
  normalized: NormalizedRelationshipState;
  decisionContext: DecisionContext;
  decideResult: DecideResult;
  actionPlan: ActionPlan;
  ruleEvaluation: RuleEvaluationSummary;
  selectedFollowUpQuestion: SelectedFollowUpQuestion | null;
}

export function buildBrainInspector(input: BrainInspectorInput): BrainInspector {
  const {
    loadResult,
    extraction,
    normalized,
    decisionContext,
    decideResult,
    actionPlan,
    ruleEvaluation,
    selectedFollowUpQuestion,
  } = input;

  const signalsBySource: Record<string, BrainInspector["signalsBySource"][string]> =
    {};
  for (const signal of extraction.availableSignals) {
    (signalsBySource[signal.source] ??= []).push(signal);
  }

  const sources = [...new Set(extraction.availableSignals.map((signal) => signal.source))];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      contributorCount: extraction.contributorGroups.length,
      signalCount: extraction.availableSignals.length,
      sources,
      decisionOutcome: decideResult.decision.outcome,
      confidence: decideResult.confidence,
      contextGeneratedAt: loadResult.relationshipContext.generatedAt,
      brainContextVersion: loadResult.brainContextVersion,
    },
    contributors: extraction.contributorGroups.map((group) => ({
      key: group.key,
      title: group.title,
      registryIndex: group.registryIndex,
      sources: group.sources,
      signalCount: group.signalCount,
      signals: group.signals,
    })),
    signalsBySource,
    registryOrder: extraction.contributorGroups.map((group) => group.key),
    normalized,
    decisionContext,
    actionPlan,
    ruleEvaluation,
    selectedFollowUpQuestion,
  };
}
