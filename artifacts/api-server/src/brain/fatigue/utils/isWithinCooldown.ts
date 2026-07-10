/**
 * Cooldown comparison — suppress only while elapsed time is strictly less than cooldown.
 */

export function isWithinCooldown(input: {
  lastEventAtMs: number;
  evaluatedAtMs: number;
  cooldownMs: number;
}): boolean {
  if (input.lastEventAtMs > input.evaluatedAtMs) {
    return false;
  }

  const elapsedMs = input.evaluatedAtMs - input.lastEventAtMs;
  return elapsedMs < input.cooldownMs;
}
