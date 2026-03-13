export function nextAttemptAt(retryCount: number): Date {
  // Exponential backoff: 2^retryCount * 10 seconds, capped at 1 hour
  const delaySeconds = Math.min(10 * Math.pow(2, retryCount), 3600);
  return new Date(Date.now() + delaySeconds * 1000);
}
