/**
 * Brain Inspector types — development-only debug views.
 *
 * Inspector is a viewer over already-produced extraction output.
 * Not part of BrainResponse or any production API contract.
 */

import type { BrainSignal } from "../types";

export interface BrainInspectorContributorView {
  key: string;
  title: string;
  registryIndex: number;
  sources: string[];
  signalCount: number;
  signals: BrainSignal[];
}

export interface BrainInspectorSummary {
  contributorCount: number;
  signalCount: number;
  sources: string[];
  decisionOutcome: string;
  confidence: number;
  contextGeneratedAt: string;
  brainContextVersion: number;
}

export interface BrainInspector {
  generatedAt: string;
  summary: BrainInspectorSummary;
  contributors: BrainInspectorContributorView[];
  signalsBySource: Record<string, BrainSignal[]>;
  registryOrder: string[];
}
