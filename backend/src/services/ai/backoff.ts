/**
 * Full-jitter exponential backoff (AWS Architecture Blog formula): each
 * attempt waits a random duration in [0, min(cap, base * 2^attempt)]. This
 * avoids the thundering-herd retries that fixed or equal-jitter backoff can
 * produce under shared rate limits.
 */
export function fullJitterBackoffMs(attempt: number, baseMs = 250, capMs = 4000): number {
  const exp = Math.min(capMs, baseMs * 2 ** attempt);
  return Math.floor(Math.random() * exp);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
