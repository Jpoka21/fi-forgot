/**
 * Brain-owned reasoning thresholds.
 *
 * These constants are used across Brain contributors and rules to keep
 * "recent" vs "stale/dormant" boundaries consistent.
 */

/** Upper bound (inclusive) for considering activity "recent". */
export const RELATIONSHIP_RECENT_ACTIVITY_DAYS = 90;

/** Lower bound (exclusive) for considering activity inactive/stale/dormant. */
export const RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS = 180;

