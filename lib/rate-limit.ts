type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

function getClientIp(ipLike: string | null) {
  if (!ipLike) return "unknown";
  return ipLike.split(",")[0]?.trim() || "unknown";
}

export function checkRateLimit({
  key,
  ipLike,
  limit,
  windowMs,
}: {
  key: string;
  ipLike: string | null;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const ip = getClientIp(ipLike);
  const bucketKey = `${key}:${ip}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { ok: false as const, remaining: 0, retryAfterMs: current.resetAt - now };
  }

  current.count += 1;
  buckets.set(bucketKey, current);
  return { ok: true as const, remaining: limit - current.count };
}
