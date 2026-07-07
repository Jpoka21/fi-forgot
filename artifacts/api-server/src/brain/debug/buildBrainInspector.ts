/**
 * Brain Inspector builder — development-only viewer.
 *
 * Consumes already-produced extraction output. Does not invoke contributors
 * or recompute signal values.
 */

import type { DecideResult } from "../decision/decide";
import type { SignalExtractionResult } from "../signals/extractionTypes";
import type { RelationshipContextLoadResult } from "../types";
import type { BrainInspector } from "./inspectorTypes";

export interface BrainInspectorInput {
  loadResult: RelationshipContextLoadResult;
  extraction: SignalExtractionResult;
  decideResult: DecideResult;
}

export function buildBrainInspector(input: BrainInspectorInput): BrainInspector {
  const { loadResult, extraction, decideResult } = input;

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
  };
}
