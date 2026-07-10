/**
 * Brain outcome → exposure projector implementation.
 */

import type { ExposureEventRepository } from "../../fatigue/exposure/exposureRepository";
import type { BrainOutcomeEvent } from "../outcomeTypes";
import { mapBrainOutcomeToExposure } from "./mapBrainOutcomeToExposure";
import type {
  BrainOutcomeExposureProjector,
  BrainOutcomeProjectionResult,
} from "./outcomeProjectionTypes";

export function createBrainOutcomeExposureProjector(
  exposureRepository: ExposureEventRepository,
): BrainOutcomeExposureProjector {
  return {
    async project(event: BrainOutcomeEvent): Promise<BrainOutcomeProjectionResult> {
      const mapped = mapBrainOutcomeToExposure(event);
      if (!mapped) {
        return {
          status: "ignored",
          outcomeEventId: event.id,
          reason: "non_projecting_outcome",
        };
      }

      const appendResult = await exposureRepository.appendExposureEvent(mapped);

      if (appendResult.status === "appended") {
        return {
          status: "projected",
          outcomeEventId: event.id,
          exposureEvent: appendResult.event,
        };
      }

      return {
        status: "already_projected",
        outcomeEventId: event.id,
        exposureEvent: appendResult.event,
      };
    },
  };
}
