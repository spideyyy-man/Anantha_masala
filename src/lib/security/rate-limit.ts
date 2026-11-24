interface BucketEntry {
  timestamps: number[];
}

const globalBuckets = globalThis as unknown as {
  __aanandhaRateLimit?: Map<string, BucketEntry>;
};

if (!globalBuckets.__aanandhaRateLimit) {
  globalBuckets.__aanandhaRateLimit = new Map();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const buckets = globalBuckets.__aanandhaRateLimit!;
  const cutoff = now - windowMs;

  const entry = buckets.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, entry);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.timestamps.push(now);
  buckets.set(key, entry);

  // Prevent unbounded memory growth
  if (buckets.size > 5000) {
    for (const [k, v] of buckets.entries()) {
      if (v.timestamps.length === 0 || (v.timestamps[v.timestamps.length - 1] ?? 0) < cutoff) {
        buckets.delete(k);
      }
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - entry.timestamps.length),
    retryAfterSeconds: 0,
  };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'local-client';
}

export function clearRateLimitsForTesting(): void {
  globalBuckets.__aanandhaRateLimit?.clear();
}
