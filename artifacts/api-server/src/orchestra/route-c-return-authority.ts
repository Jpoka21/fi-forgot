/**
 * TRPM Route C return-authorizing sources (R49 / PD-STD-014-010).
 *
 * Frozen Route C baseline is block-without-return after Pass + EGWG withholding.
 * Exceptional return MAY exist only when a traceable constitutional ground
 * supporting return is established by frozen authority.
 *
 * Current frozen Design Library does not enumerate any concrete Route C
 * return-authorizing source. PD-STD-014-010 defines TRPM (including that
 * baseline) and is not itself an exceptional authorizing ground.
 *
 * Outcome B (ORCH-IMP-011.2): empty closed catalog — Route C Return Posture
 * is constitutionally dormant until frozen authority establishes sources.
 */

import { OrchestraConstitutionalError } from "./errors.js";

/**
 * Closed canonical catalog of frozen sources that authorize Route C return.
 * Empty until Design Library establishes concrete exceptional grounds.
 */
export const FROZEN_ROUTE_C_RETURN_AUTHORIZING_SOURCES: readonly string[] = Object.freeze([]);

export function isFrozenRouteCReturnAuthorizingSource(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (FROZEN_ROUTE_C_RETURN_AUTHORIZING_SOURCES as readonly string[]).includes(value)
  );
}

/**
 * Runtime trust boundary for Route C Return Posture.
 * Caller-supplied strings never establish authority.
 */
export function assertFrozenRouteCReturnAuthorityAvailable(): never {
  throw new OrchestraConstitutionalError(
    "Route C Return Posture after Pass plus Approval withholding is unavailable: frozen authority establishes block-without-return as baseline and does not currently enumerate any exceptional return-authorizing constitutional source; PD-STD-014-010, arbitrary source IDs, actor assertion, workflow, or Brain cannot mint Route C return authority",
    "invalid_downstream_disposition",
    ["FI-DSN-STD-014-R49"],
  );
}

export function assertPersistedRouteCReturnNotAuthorized(): never {
  throw new OrchestraConstitutionalError(
    "Persisted Route C Return Posture is not authorized: no frozen Route C return-authorizing source is currently established",
    "invalid_downstream_disposition",
    ["FI-DSN-STD-014-R49"],
  );
}
