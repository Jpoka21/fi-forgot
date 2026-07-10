/**
 * Brain outcome → exposure projection result contracts.
 */

import type { ExposureEvent } from "../../fatigue/exposure/exposureTypes";
import type { BrainOutcomeEvent } from "../outcomeTypes";

export type BrainOutcomeProjectionIgnoredReason = "non_projecting_outcome";

export type BrainOutcomeProjectionResult =
  | {
      status: "projected";
      outcomeEventId: string;
      exposureEvent: ExposureEvent;
    }
  | {
      status: "ignored";
      outcomeEventId: string;
      reason: BrainOutcomeProjectionIgnoredReason;
    }
  | {
      status: "already_projected";
      outcomeEventId: string;
      exposureEvent: ExposureEvent;
    };

export interface BrainOutcomeExposureProjector {
  project(event: BrainOutcomeEvent): Promise<BrainOutcomeProjectionResult>;
}
