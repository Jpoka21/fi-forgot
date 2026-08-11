/**
 * Domain 3 governed creation markers — FI-DSN-STD-014 auditability.
 */

import { randomUUID } from "node:crypto";

import type { Domain3GovernedCreationMarker } from "./domain3-types.js";

const GOVERNED_MARKER_PREFIX = "gov-domain3-create-" as const;

export function createDomain3GovernedCreationMarker(): Domain3GovernedCreationMarker {
  return `${GOVERNED_MARKER_PREFIX}${randomUUID()}` as Domain3GovernedCreationMarker;
}

export function isValidDomain3GovernedCreationMarker(
  marker: unknown,
): marker is Domain3GovernedCreationMarker {
  return typeof marker === "string" && marker.startsWith(GOVERNED_MARKER_PREFIX);
}
