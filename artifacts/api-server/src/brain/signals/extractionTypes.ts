/**
 * Signal extraction result types.
 *
 * Captures per-contributor outputs from a single extraction pass before
 * flattening into availableSignals.
 */

import type { BrainSignal } from "../types";

export interface ContributorSignalGroup {
  /** Registered contributor function name. */
  key: string;
  /** Human-readable title derived from key. */
  title: string;
  /** Position in signalContributors registry. */
  registryIndex: number;
  /** Distinct source values emitted by this contributor. */
  sources: string[];
  signalCount: number;
  signals: BrainSignal[];
}

export interface SignalExtractionResult {
  /** Flattened signals — identical to pre-inspector extractSignals() output. */
  availableSignals: BrainSignal[];
  /** Per-contributor outputs captured during the single extraction pass. */
  contributorGroups: ContributorSignalGroup[];
}
