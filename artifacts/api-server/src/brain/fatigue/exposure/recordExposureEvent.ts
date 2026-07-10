/**
 * Append-only exposure event write entry point.
 *
 * Not activated in production until Step 5e+.
 */

import { assertValidExposureOpportunityIdentity } from "./exposureTypes";
import type { InsertExposureEventInput } from "./exposureRepository";

export type RecordExposureEventInput = InsertExposureEventInput;

export async function recordExposureEvent(input: RecordExposureEventInput): Promise<void> {
  assertValidExposureOpportunityIdentity(input);
  const { insertExposureEvent } = await import("./pgExposureRepository.js");
  await insertExposureEvent(input);
}
