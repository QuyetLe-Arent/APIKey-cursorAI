import "server-only";

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

let pruneCounter = 0;

function pruneExpired(now: number): void {
  pruneCounter++;
  if (pruneCounter % 50 !== 0) return;
  for (const [k, b] of store) {
    if (now >= b.resetAt) store.delete(k);
  }
}

/**
 * Fixed-window counter per key. Intended for low-traffic APIs / demos (in-memory, per instance).
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  pruneExpired(now);

  let bucket = store.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 1, resetAt: now + windowMs };
    store.set(key, bucket);
    return { ok: true };
  }
  if (bucket.count < max) {
    bucket.count += 1;
    return { ok: true };
  }
  return { ok: false, retryAfterMs: Math.max(0, bucket.resetAt - now) };
}

export function clientIpFromRequest(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}
