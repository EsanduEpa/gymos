// In-memory fixed-window rate limiting.
//
// Deliberately not Redis. This app runs as a small number of serverless
// instances, so a per-instance limiter still cuts a credential-stuffing run
// down by whatever factor of instances are live — and it adds no infrastructure
// to a project two weeks from delivery. The tradeoff is real and worth stating:
// limits are per-instance, and memory resets on cold start.
//
// Swap the store for Upstash Redis when the gym count justifies it; the call
// sites do not change.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Bounded so a flood of distinct keys cannot grow the map without limit.
const MAX_KEYS = 10_000

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export type RateLimitRule = {
  /** Distinct name for the protected action, e.g. "login". */
  action: string
  /** Attempts permitted inside the window. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  /** Seconds until the window resets. Show this to the caller. */
  retryAfter: number
}

/**
 * Consumes one attempt against `identifier` for this rule.
 *
 * Call it *before* doing the expensive or sensitive work, and key it on
 * something the attacker cannot trivially rotate — an IP, or an IP paired with
 * the submitted email so one user's failures cannot lock out a whole office
 * behind a shared address.
 */
export function consumeRateLimit(
  rule: RateLimitRule,
  identifier: string
): RateLimitResult {
  const now = Date.now()
  const key = `${rule.action}:${identifier}`

  if (buckets.size > MAX_KEYS) sweep(now)

  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs })
    return { allowed: true, remaining: rule.limit - 1, retryAfter: 0 }
  }

  existing.count += 1

  if (existing.count > rule.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  return {
    allowed: true,
    remaining: rule.limit - existing.count,
    retryAfter: 0,
  }
}

/** Clears an identifier's attempts — call after a success so a legitimate user isn't penalised. */
export function resetRateLimit(rule: RateLimitRule, identifier: string) {
  buckets.delete(`${rule.action}:${identifier}`)
}

export const LOGIN_RATE_LIMIT: RateLimitRule = {
  action: "login",
  limit: 5,
  windowMs: 60_000,
}

/** Public signup in M2-2 — stricter, since there is no legitimate reason to repeat it. */
export const REGISTRATION_RATE_LIMIT: RateLimitRule = {
  action: "register",
  limit: 3,
  windowMs: 15 * 60_000,
}

/**
 * Best-effort client IP behind Vercel's proxy.
 *
 * `x-forwarded-for` is client-controlled in general, but on Vercel the platform
 * overwrites it, so the leftmost entry is trustworthy here. Falls back to a
 * constant, which means one shared bucket rather than no limit at all.
 */
export function clientIpFrom(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return headers.get("x-real-ip")?.trim() || "unknown"
}
