/**
 * Passive auth refresh foundation.
 *
 * Does not call `/api/auth/session` or mutate auth state. Reserved for a future
 * refresh workflow once session renewal is defined server-side.
 */
export function createPassiveAuthRefreshHandlers(
  setLastRefreshRequestedAt: (timestamp: number | null) => void,
) {
  return {
    requestRefresh: () => {
      setLastRefreshRequestedAt(Date.now());
    },
  };
}
