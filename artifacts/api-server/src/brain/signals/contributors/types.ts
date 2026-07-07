/**
 * Signal contributor contracts — read-only.
 *
 * Contributors are synchronous and must not perform database reads.
 * They derive signals from an already-loaded RelationshipContextLoadResult.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

export type SignalContributor = (
  context: RelationshipContextLoadResult,
) => BrainSignal[];
